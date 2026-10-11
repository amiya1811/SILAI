import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, error: "Please log in to save try-on results to your profile." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { designTitle, designImageUrl, tryOnResultUrl, notes } = body;

    if (!tryOnResultUrl) {
      return NextResponse.json(
        { success: false, error: "Virtual try-on result image is required to save." },
        { status: 400 }
      );
    }

    // Ensure customer profile exists
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId: auth.user.id,
          preferredLanguage: "English",
        },
      });
    }

    // Save or update Design record
    const savedDesign = await prisma.design.create({
      data: {
        customerId: customerProfile.id,
        title: designTitle || "Virtual Try-On Custom Design",
        garmentType: "CUSTOM",
        referenceImageUrl: designImageUrl || tryOnResultUrl,
        previewConfigJson: JSON.stringify({
          tryOnResultUrl,
          savedAt: new Date().toISOString(),
          notes: notes || "Saved from Live Fitting Room",
        }),
      },
    });

    // Save FileMetadata record in database
    await prisma.fileMetadata.create({
      data: {
        userId: auth.user.id,
        uploaderRole: auth.user.role as any,
        storageKey: `try-on/${auth.user.id}/${savedDesign.id}_result.png`,
        publicUrl: tryOnResultUrl.length > 500 ? tryOnResultUrl.slice(0, 500) : tryOnResultUrl,
        mimeType: "image/png",
        fileSize: 1024,
        evidenceType: "TRY_ON_RESULT",
        visibility: "PRIVATE",
      },
    });

    return NextResponse.json({
      success: true,
      designId: savedDesign.id,
      design: savedDesign,
      savedAt: new Date().toISOString(),
      message: "Virtual try-on result saved to your atelier collection.",
    });
  } catch (error: any) {
    console.error("POST /api/try-on/save error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to save virtual try-on result." },
      { status: 500 }
    );
  }
}
