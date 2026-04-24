import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { gunzipSync } from "zlib";
import path from "path";

export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), "public", "brats", ...slug);

    try {
        const compressed = await readFile(filePath);
        // Decompress server-side so NiiVue receives plain NIfTI bytes
        const data = gunzipSync(compressed);
        return new NextResponse(data, {
            headers: {
                "Content-Type": "application/octet-stream",
            },
        });
    } catch {
        return NextResponse.json({ error: "not found" }, { status: 404 });
    }
}
