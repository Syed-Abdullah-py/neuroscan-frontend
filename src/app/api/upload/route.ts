import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Stream the raw body directly to the backend without parsing
        const response = await fetch(`${AUTH_SERVICE_URL}/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Forward the content-type header so the backend can parse multipart
                "Content-Type": request.headers.get("content-type") || "",
            },
            body: request.body,
            // @ts-ignore - duplex is needed for streaming request bodies
            duplex: "half",
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: error.detail || "Upload failed" },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Upload proxy error:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}
