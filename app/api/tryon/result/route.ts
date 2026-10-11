import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please log in to save Try-On fitting results." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { designTitle, designImageUrl, capturedResultUrl, notes } = body;

    if (!capturedResultUrl) {
      return NextResponse.json(
        { success: false, error: "Captured result frame is required." },
        { status: 400 }
      );
    }

    // Ensure customer profile exists
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          preferredLanguage: "English",
        },
      });
    }

    // Save Design record with result reference
    const savedDesign = await prisma.design.create({
      data: {
        customerId: customerProfile.id,
        title: designTitle || "Live Fitting Result",
        garmentType: "CUSTOM",
        referenceImageUrl: designImageUrl || capturedResultUrl,
        previewConfigJson: JSON.stringify({
          tryOnResultUrl: capturedResultUrl,
          savedAt: new Date().toISOString(),
          notes: notes || "Captured from Decart Real-Time Live Fitting Room",
        }),
      },
    });

    // Save FileMetadata record
    await prisma.fileMetadata.create({
      data: {
        userId: user.id,
        uploaderRole: user.role as any,
        storageKey: `try-on/${user.id}/${savedDesign.id}_vto.jpg`,
        publicUrl: capturedResultUrl.length > 500 ? capturedResultUrl.slice(0, 500) : capturedResultUrl,
        mimeType: "image/jpeg",
        fileSize: 2048,
        evidenceType: "TRY_ON_RESULT",
        visibility: "PRIVATE",
      },
    });

    return NextResponse.json({
      success: true,
      designId: savedDesign.id,
      savedAt: new Date().toISOString(),
      message: "Virtual try-on result saved to your fitting portfolio.",
    });
  } catch (error: any) {
    console.error("POST /api/tryon/result error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to save virtual try-on result." },
      { status: 500 }
    );
  }
}
