const AUTH_SERVICE_URL =
    (process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");

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

    const response = await fetch(`${AUTH_SERVICE_URL}${path}`, {
        ...rest,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
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