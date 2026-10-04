import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Server-side helper to convert external URL or data URL to clean base64 data & mimeType
async function parseImageData(input: string): Promise<{ mimeType: string; data: string } | null> {
  if (!input || typeof input !== "string") return null;

  // Handle data URI (e.g. data:image/jpeg;base64,...)
  if (input.startsWith("data:")) {
    const matches = input.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        mimeType: matches[1],
        data: matches[2],
      };
    }
  }

  // Handle external HTTP/HTTPS URL
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const res = await fetch(input);
      if (!res.ok) return null;
      const buffer = await res.arrayBuffer();
      const mimeType = res.headers.get("content-type") || "image/jpeg";
      const base64 = Buffer.from(buffer).toString("base64");
      return {
        mimeType,
        data: base64,
      };
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  // 1. Enforce Customer Authentication & Session Integrity
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { userImage, designImage, designTitle } = body;

    // 2. Validate Image Inputs
    if (!userImage || typeof userImage !== "string" || !userImage.trim()) {
      return NextResponse.json(
        { error: "Customer photo is required for AI Virtual Try-On." },
        { status: 400 }
      );
    }

    if (!designImage || typeof designImage !== "string" || !designImage.trim()) {
      return NextResponse.json(
        { error: "Garment design reference is required for AI Virtual Try-On." },
        { status: 400 }
      );
    }

    // 3. Read GEMINI_API_KEY securely from server environment ONLY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI Virtual Try-On service is temporarily unavailable (API configuration missing).",
        },
        { status: 503 }
      );
    }

    // 4. Parse & Prepare Image Payloads (Base64)
    const parsedUserImage = await parseImageData(userImage);
    const parsedDesignImage = await parseImageData(designImage);

    if (!parsedUserImage) {
      return NextResponse.json(
        { error: "Customer photo format is unsupported or corrupted. Please upload a PNG, JPEG, or WEBP image." },
        { status: 400 }
      );
    }

    if (!parsedDesignImage) {
      return NextResponse.json(
        { error: "Garment design photo format is unsupported or corrupted. Please upload a PNG, JPEG, or WEBP image." },
        { status: 400 }
      );
    }

    // Check payload limits (approx 8MB max per image for safety)
    if (parsedUserImage.data.length > 10 * 1024 * 1024 || parsedDesignImage.data.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Uploaded image exceeds the 8MB size limit. Please upload an optimized image." },
        { status: 400 }
      );
    }

    // 5. Construct Prompt for Bespoke Haute Couture Garment Try-On
    const promptText = `You are SILAI's Haute Couture Master Atelier AI. Perform a photorealistic bespoke Virtual Try-On.
Seamlessly and realistically drape the custom tailored luxury Indian ethnic garment from the second image ("${designTitle || "Custom Garment"}") onto the person in the first image.
Preserve the customer's natural facial structure, posture, skin tone, hair, and ambient studio lighting.
Accurately render the garment's silk texture, embroidery, neckline, and drapery according to the design reference.
Output the photorealistic resulting try-on preview as high-resolution visual imagery.`;

    // 6. Call Google Gemini Native Image Generation API
    // Supported models: gemini-2.5-flash-image, gemini-3.1-flash-image
    const candidateModels = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];
    let generatedImageBase64: string | null = null;
    let generatedMimeType = "image/png";
    let activeModelUsed = "";
    let lastApiError: string | null = null;
    let isQuotaExceeded = false;

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: parsedUserImage.mimeType,
                        data: parsedUserImage.data,
                      },
                    },
                    {
                      inlineData: {
                        mimeType: parsedDesignImage.mimeType,
                        data: parsedDesignImage.data,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429 || data.error?.message?.includes("quota")) {
            isQuotaExceeded = true;
          }
          lastApiError = data.error?.message || `API error status ${response.status}`;
          continue; // Try next model if any
        }

        // Look for image parts in the response
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            generatedImageBase64 = part.inlineData.data;
            generatedMimeType = part.inlineData.mimeType || "image/png";
            activeModelUsed = model;
            break;
          }
        }

        if (generatedImageBase64) {
          break; // Successfully obtained image!
        }
      } catch (err: any) {
        lastApiError = err.message || "Network error connecting to Gemini API";
      }
    }

    // 7. Handle Result or Error State cleanly
    if (!generatedImageBase64) {
      if (isQuotaExceeded) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Google Gemini Image Generation quota limit reached on this project (Free tier permits 0 daily requests for native image models). Please upgrade to a billing-enabled Google Cloud API plan.",
            code: "QUOTA_EXCEEDED",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini AI could not complete image synthesis. Please try again with a different photo or angle.",
          code: "GENERATION_FAILED",
        },
        { status: 502 }
      );
    }

    // 8. Return Genuine Real Gemini Generated Image
    const dataUri = `data:${generatedMimeType};base64,${generatedImageBase64}`;
    return NextResponse.json({
      success: true,
      generatedImageUrl: dataUri,
      model: activeModelUsed,
      disclaimer:
        "Virtual try-on is a visual preview and may not represent exact fit, measurements or final stitching.",
    });
  } catch (error: any) {
    console.error("POST /api/try-on/generate error:", error.message || error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the virtual try-on." },
      { status: 500 }
    );
  }
}
