import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");

  if (!workspaceId) {
    return new Response("workspaceId query param required", { status: 400 });
  }

  const backendUrl = `${AUTH_SERVICE_URL}/workspaces/${workspaceId}/events`;

  const backendResponse = await fetch(backendUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Workspace-Id": workspaceId,
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    // @ts-expect-error - duplex needed for streaming
    duplex: "half",
  });

  if (!backendResponse.ok) {
    return new Response("Failed to connect to event stream", {
      status: backendResponse.status,
    });
  }

  return new Response(backendResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}