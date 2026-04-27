// Derive the backend origin from the browser's current hostname so this works
// on any network without changing .env (localhost, LAN IP, ngrok, etc.).
function getBackendUrl(): string {
    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    return "https://localhost:8000";
}

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

interface ClientFetchOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    token: string;
    workspaceId?: string;
}

/**
 * Client-side authenticated fetch.
 * Token and workspaceId must be passed explicitly —
 * this file never touches next/headers.
 * Used by React Query query functions in hooks.
 */
export async function clientFetch<T>(
    path: string,
    options: ClientFetchOptions
): Promise<T> {
    const { body, token, workspaceId, headers: extraHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        ...(extraHeaders as Record<string, string>),
    };

    if (workspaceId) {
        headers["X-Workspace-Id"] = workspaceId;
    }

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${getBackendUrl()}${path}`, {
        ...rest,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok || !isJson) {
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