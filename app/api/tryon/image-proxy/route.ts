import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side image proxy that converts any remote garment image URL
 * into a clean base64 Data URL with zero CORS issues.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Missing url parameter" }, { status: 400 });
    }

    // If it's already a data URL, return it directly
    if (imageUrl.startsWith("data:")) {
      return NextResponse.json({ success: true, dataUrl: imageUrl });
    }

    // SSRF protection: only allow HTTP/HTTPS URLs
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ success: false, error: "Invalid URL scheme" }, { status: 400 });
    }

    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/jpeg,image/png,image/webp,image/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch image: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      mimeType: contentType,
      byteLength: arrayBuffer.byteLength,
    });
  } catch (error: any) {
    console.error("GET /api/tryon/image-proxy error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error proxying image" },
      { status: 500 }
    );
  }
}
