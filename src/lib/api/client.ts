import "server-only";
import { cookies } from "next/headers";

const AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public detail?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    workspaceId?: string;
    noWorkspace?: boolean;
    noAuth?: boolean;
}

/**
 * Server-side authenticated fetch.
 * Only call this from Server Components, Server Actions, or Route Handlers.
 * Never import this in a "use client" file.
 */
export async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {}
): Promise<T> {
    const {
        body,
        workspaceId,
        noWorkspace = false,
        noAuth = false,
        headers: extraHeaders,
        ...rest
    } = options;

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const activeWorkspaceId =
        workspaceId ?? cookieStore.get("active_workspace")?.value;

    const headers: Record<string, string> = {};

    if (!noAuth && token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (!noWorkspace && activeWorkspaceId) {
        headers["X-Workspace-Id"] = activeWorkspaceId;
    }
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${AUTH_SERVICE_URL}${path}`, {
        ...rest,
        headers: { ...headers, ...(extraHeaders as Record<string, string>) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    if (response.status === 204) return undefined as T;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof data?.detail === "string"
                ? data.detail
                : Array.isArray(data?.detail)
                    ? data.detail.map((e: any) => e.msg).join(", ")
                    : `Request failed with status ${response.status}`;
        throw new ApiError(response.status, message, data?.detail);
    }

    return data as T;
}

/**
 * Server-side multipart upload.
 * Only call from Server Actions or Route Handlers.
 */
export async function apiUpload<T>(
    path: string,
    formData: FormData,
    workspaceId?: string
): Promise<T> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const activeWorkspaceId =
        workspaceId ?? cookieStore.get("active_workspace")?.value;

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (activeWorkspaceId) headers["X-Workspace-Id"] = activeWorkspaceId;

    const response = await fetch(`${AUTH_SERVICE_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
        cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            typeof data?.detail === "string"
                ? data.detail
                : `Upload failed with status ${response.status}`;
        throw new ApiError(response.status, message, data?.detail);
    }

    return data as T;
}

export { AUTH_SERVICE_URL };