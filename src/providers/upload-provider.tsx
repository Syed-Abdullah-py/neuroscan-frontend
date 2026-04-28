"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useWorkspace } from "@/providers/workspace-provider";

export type FileUploadState = {
    name: string;
    sizeMb: number;
    progress: number;
    status: "uploading" | "done" | "error";
};

export type OverallStatus = "uploading" | "creating" | "done" | "error";

export type UploadSession = {
    id: string;
    files: FileUploadState[];
    overallStatus: OverallStatus;
    errorMessage: string | null;
};

type UploadContextValue = {
    sessions: UploadSession[];
    startUpload: (
        files: File[],
        meta: {
            patientId: string;
            priority: string;
            assignedToMemberId: string;
            notes: string;
        }
    ) => void;
    dismiss: (id: string) => void;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
    const ctx = useContext(UploadContext);
    if (!ctx) throw new Error("useUpload must be used within UploadProvider");
    return ctx;
}

/** Polyfill for crypto.randomUUID - required when running over plain HTTP (non-secure context). */
function generateUUID(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // Fallback: RFC 4122 v4 UUID using Math.random
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function UploadProviderInner({ children }: { children: React.ReactNode }) {
    const { token, activeWorkspaceId } = useWorkspace();
    const [sessions, setSessions] = useState<UploadSession[]>([]);

    const patchSession = useCallback((id: string, patch: Partial<UploadSession>) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    }, []);

    const patchFile = useCallback((sessionId: string, fileIdx: number, patch: Partial<FileUploadState>) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId
                ? { ...s, files: s.files.map((f, i) => i === fileIdx ? { ...f, ...patch } : f) }
                : s
        ));
    }, []);

    const dismiss = useCallback((id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
    }, []);

    const startUpload = useCallback(
        (
            rawFiles: File[],
            meta: { patientId: string; priority: string; assignedToMemberId: string; notes: string }
        ) => {
            if (!token || !activeWorkspaceId) return;

            const backendUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
            const uploadId = generateUUID();
            const sessionId = generateUUID();

            // Register this session immediately so the toast appears
            setSessions(prev => [...prev, {
                id: uploadId,
                files: rawFiles.map(f => ({
                    name: f.name,
                    sizeMb: parseFloat((f.size / 1024 / 1024).toFixed(1)),
                    progress: 0,
                    status: "uploading",
                })),
                overallStatus: "uploading",
                errorMessage: null,
            }]);

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
                                patchFile(uploadId, i, { progress: Math.round((ev.loaded / ev.total) * 100) });
                            }
                        });
                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                patchFile(uploadId, i, { status: "done", progress: 100 });
                                resolve();
                            } else {
                                patchFile(uploadId, i, { status: "error" });
                                reject(new Error(`Scan ${i + 1} upload failed (${xhr.status})`));
                            }
                        };
                        xhr.onerror = () => {
                            patchFile(uploadId, i, { status: "error" });
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
                    patchSession(uploadId, { overallStatus: "creating" });
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
                        const msg = typeof data?.detail === "string" ? data.detail : `Case creation failed (${res.status})`;
                        throw new Error(msg);
                    }
                    patchSession(uploadId, { overallStatus: "done" });
                    setTimeout(() => dismiss(uploadId), 4000);
                })
                .catch((err: Error) => {
                    patchSession(uploadId, { overallStatus: "error", errorMessage: err.message ?? "Upload failed" });
                });
        },
        [patchSession, patchFile, dismiss, token, activeWorkspaceId]
    );

    return (
        <UploadContext.Provider value={{ sessions, startUpload, dismiss }}>
            {children}
        </UploadContext.Provider>
    );
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
    return <UploadProviderInner>{children}</UploadProviderInner>;
}
