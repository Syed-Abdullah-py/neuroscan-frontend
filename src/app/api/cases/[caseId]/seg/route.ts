import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const AUTH_SERVICE_URL = (process.env.AUTH_SERVICE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    const { caseId } = await params;

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("session")?.value;
    const cookieWorkspaceId = cookieStore.get("active_workspace")?.value;
    const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    const headerWorkspaceId = req.headers.get("x-workspace-id")?.trim();
    const token = cookieToken || headerToken;
    const workspaceId = cookieWorkspaceId || headerWorkspaceId;
    if (!token || !workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${AUTH_SERVICE_URL}/cases/${caseId}/seg`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": workspaceId,
            "ngrok-skip-browser-warning": "true",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Not found" }, { status: res.status });
    }

    const forwardHeaders: Record<string, string> = {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, max-age=86400",
    };
    const contentLength = res.headers.get("Content-Length");
    if (contentLength) forwardHeaders["Content-Length"] = contentLength;

    return new NextResponse(res.body, { status: 200, headers: forwardHeaders });
}
