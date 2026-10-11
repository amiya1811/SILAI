import { NextRequest, NextResponse } from "next/server";
import { executePhotoVirtualTryOn, PHOTO_VTO_DISCLAIMER } from "@/lib/tryon/providers/photo-fallback";
import { getUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const TRY_ON_DISCLAIMER = PHOTO_VTO_DISCLAIMER;

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    const body = await request.json();
    const personImage = body.personImage || body.userImage;
    const garmentImage = body.garmentImage || body.designImage;
    const garmentTitle = body.garmentTitle || body.designTitle || "Custom Garment";

    // Client & Server input validation
    if (!personImage || typeof personImage !== "string" || !personImage.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer photo is required for AI Try-On Preview.",
          code: "INVALID_PERSON_IMAGE",
          disclaimer: TRY_ON_DISCLAIMER,
        },
        { status: 400 }
      );
    }

    if (!garmentImage || typeof garmentImage !== "string" || !garmentImage.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Garment design reference is required for AI Try-On Preview.",
          code: "INVALID_GARMENT_IMAGE",
          disclaimer: TRY_ON_DISCLAIMER,
        },
        { status: 400 }
      );
    }

    // Execute Decart-based Photo Fallback Virtual Try-On
    const result = await executePhotoVirtualTryOn({
      personImage,
      garmentImage,
      garmentTitle,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "AI Try-On Preview could not be processed.",
          model: result.model,
          disclaimer: result.disclaimer,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      generatedImageUrl: result.generatedImageUrl,
      model: result.model,
      disclaimer: result.disclaimer,
      userId: user?.id || null,
    });
  } catch (error: any) {
    console.error("POST /api/try-on/generate error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the virtual try-on.",
        code: "INTERNAL_ERROR",
        disclaimer: TRY_ON_DISCLAIMER,
      },
      { status: 500 }
    );
  }
}
