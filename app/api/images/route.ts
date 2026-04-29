import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.includes("vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const blob = await get(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      access: "private",
    });

    if (!blob) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const contentType =
      blob.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(blob.stream as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
