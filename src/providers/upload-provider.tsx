"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useWorkspace } from "@/providers/workspace-provider";

export type FileUploadState = {
    name: string;
    sizeMb: number;
    progress: number;
    status: "uploading" | "done" | "error";
};

type OverallStatus = "uploading" | "creating" | "done" | "error";

type UploadContextValue = {
    active: boolean;
    files: FileUploadState[];
    overallStatus: OverallStatus;
    errorMessage: string | null;
    startUpload: (
        files: File[],
        meta: {
            patientId: string;
            priority: string;
            assignedToMemberId: string;
            notes: string;
        }
    ) => void;
    dismiss: () => void;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
    const ctx = useContext(UploadContext);
    if (!ctx) throw new Error("useUpload must be used within UploadProvider");
    return ctx;
}

function UploadProviderInner({ children }: { children: React.ReactNode }) {
    const { token, activeWorkspaceId } = useWorkspace();

    const [active, setActive] = useState(false);
    const [files, setFiles] = useState<FileUploadState[]>([]);
    const [overallStatus, setOverallStatus] = useState<OverallStatus>("uploading");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const setFileProgress = useCallback((index: number, progress: number) => {
        setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress } : f)));
    }, []);

    const setFileStatus = useCallback((index: number, status: FileUploadState["status"]) => {
        setFiles((prev) =>
            prev.map((f, i) =>
                i === index ? { ...f, status, progress: status === "done" ? 100 : f.progress } : f
            )
        );
    }, []);

    const startUpload = useCallback(
        (
            rawFiles: File[],
            meta: { patientId: string; priority: string; assignedToMemberId: string; notes: string }
        ) => {
            if (!token || !activeWorkspaceId) {
                setActive(false);
                setOverallStatus("error");
                setErrorMessage("No active workspace session. Please reload.");
                return;
            }

            const backendUrl = (process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "");
            const sessionId = crypto.randomUUID();

            setActive(true);
            setOverallStatus("uploading");
            setErrorMessage(null);
            setFiles(
                rawFiles.map((f) => ({
                    name: f.name,
                    sizeMb: parseFloat((f.size / 1024 / 1024).toFixed(1)),
                    progress: 0,
                    status: "uploading",
                }))
            );

            // Upload all 4 files in parallel directly to the backend — no Next.js proxy.
            // Auth via token/workspaceId from workspace context instead of server-side cookies,
            // eliminating the double-buffer that blocked 17MB files through the proxy.
            const uploads = rawFiles.map(
                (file, i) =>
                    new Promise<void>((resolve, reject) => {
                        const fd = new FormData();
                        fd.append("session_id", sessionId);
                        fd.append("file_index", String(i));
                        fd.append("scan", file);

                        const xhr = new XMLHttpRequest();
                        xhr.upload.addEventListener("progress", (ev) => {
                            if (ev.lengthComputable) {
                                setFileProgress(i, Math.round((ev.loaded / ev.total) * 100));
                            }
                        });
                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                setFileStatus(i, "done");
                                resolve();
                            } else {
                                setFileStatus(i, "error");
                                reject(new Error(`Scan ${i + 1} upload failed (${xhr.status})`));
                            }
                        };
                        xhr.onerror = () => {
                            setFileStatus(i, "error");
                            reject(new Error(`Scan ${i + 1} network error`));
                        };
                        xhr.open("POST", `${backendUrl}/cases/scan`);
                        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                        xhr.setRequestHeader("X-Workspace-Id", activeWorkspaceId);
                        xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
                        xhr.send(fd);
                    })
            );

            Promise.all(uploads)
                .then(() => {
                    setOverallStatus("creating");
                    const fd = new FormData();
                    fd.append("session_id", sessionId);
                    fd.append("patient_id", meta.patientId);
                    fd.append("priority", meta.priority);
                    if (meta.assignedToMemberId) fd.append("assigned_to_member_id", meta.assignedToMemberId);
                    if (meta.notes) fd.append("notes", meta.notes);

                    return fetch(`${backendUrl}/cases/from-session`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "X-Workspace-Id": activeWorkspaceId,
                            "ngrok-skip-browser-warning": "true",
                        },
                        body: fd,
                    });
                })
                .then(async (res) => {
                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                        const msg =
                            typeof data?.detail === "string"
                                ? data.detail
                                : `Case creation failed (${res.status})`;
                        throw new Error(msg);
                    }
                    setOverallStatus("done");
                    setTimeout(() => setActive(false), 4000);
                })
                .catch((err: Error) => {
                    setOverallStatus("error");
                    setErrorMessage(err.message ?? "Upload failed");
                });
        },
        [setFileProgress, setFileStatus, token, activeWorkspaceId]
    );

    const dismiss = useCallback(() => setActive(false), []);

    return (
        <UploadContext.Provider value={{ active, files, overallStatus, errorMessage, startUpload, dismiss }}>
            {children}
        </UploadContext.Provider>
    );
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
    return <UploadProviderInner>{children}</UploadProviderInner>;
}
