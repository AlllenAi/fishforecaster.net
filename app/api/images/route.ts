import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.includes("vercel-storage.com")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const blobInfo = await head(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    if (!blobInfo) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const response = await fetch(blobInfo.downloadUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": blobInfo.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
