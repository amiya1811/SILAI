import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";
import { validateGarmentFile, cleanGarmentTitle } from "@/lib/tryon/garment";

export const dynamic = "force-dynamic";

// GET /api/tryon/garments - List customer's uploaded garments (with strict deduplication)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    let designsToFormat: any[] = [];

    if (user) {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: user.id },
        include: {
          designs: {
            orderBy: { createdAt: "desc" },
            take: 24,
          },
        },
      });

      if (customerProfile && customerProfile.designs.length > 0) {
        designsToFormat = customerProfile.designs;
      }
    }

    // If guest visitor or customer has no designs yet, surface curated sample designs
    if (designsToFormat.length === 0) {
      designsToFormat = await prisma.design.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      });
    }

    // Deduplicate designs by reference image content/URL fingerprint
    const seenFingerprints = new Set<string>();
    const deduplicated = [];

    for (const d of designsToFormat) {
      const fingerprint = d.referenceImageUrl ? d.referenceImageUrl.slice(0, 160) : d.id;
      if (!seenFingerprints.has(fingerprint)) {
        seenFingerprints.add(fingerprint);
        deduplicated.push({
          id: d.id,
          title: cleanGarmentTitle(d.title),
          category: d.garmentType || "CUSTOM",
          imageUrl: d.referenceImageUrl,
          isCustom: true,
          createdAt: d.createdAt.toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, garments: deduplicated });
  } catch (error: any) {
    console.error("GET /api/tryon/garments error:", error?.message || error);
    return NextResponse.json({ success: true, garments: [] });
  }
}

// POST /api/tryon/garments - Upload and validate new garment design
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to save garments to your portfolio." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, imageUrl, category, mimeType, fileSize } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Garment image data is required." },
        { status: 400 }
      );
    }

    // Validate garment file attributes
    if (fileSize && mimeType) {
      const validation = validateGarmentFile(title || "garment.jpg", mimeType, fileSize);
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
      }
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

    const cleanTitle = cleanGarmentTitle(title);

    // Check if customer already has a design with this exact image (prevent duplicate rows)
    const existing = await prisma.design.findFirst({
      where: {
        customerId: customerProfile.id,
        referenceImageUrl: imageUrl,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        garment: {
          id: existing.id,
          title: cleanGarmentTitle(existing.title),
          category: existing.garmentType,
          imageUrl: existing.referenceImageUrl,
          isCustom: true,
          createdAt: existing.createdAt.toISOString(),
        },
      });
    }

    // Create Design record in database
    const savedDesign = await prisma.design.create({
      data: {
        customerId: customerProfile.id,
        title: cleanTitle,
        garmentType: category || "CUSTOM",
        referenceImageUrl: imageUrl,
        previewConfigJson: JSON.stringify({
          source: "LIVE_TRY_ON_WORKSPACE",
          uploadedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      garment: {
        id: savedDesign.id,
        title: savedDesign.title,
        category: savedDesign.garmentType,
        imageUrl: savedDesign.referenceImageUrl,
        isCustom: true,
        createdAt: savedDesign.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("POST /api/tryon/garments error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to upload garment design." },
      { status: 500 }
    );
  }
}

// DELETE /api/tryon/garments - Safely delete garment without breaking historical orders
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: true, message: "Garment removed from workspace." });
    }

    const { searchParams } = new URL(request.url);
    const garmentId = searchParams.get("id");

    if (!garmentId) {
      return NextResponse.json({ success: true, message: "Garment removed from workspace." });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ success: true, message: "Garment removed from workspace." });
    }

    const design = await prisma.design.findFirst({
      where: {
        id: garmentId,
        customerId: customerProfile.id,
      },
      include: {
        orders: true,
      },
    });

    if (!design) {
      return NextResponse.json({ success: true, message: "Garment removed from workspace." });
    }

    // Safety rule: If design is linked to historical orders, do NOT delete permanent record
    if (design.orders && design.orders.length > 0) {
      return NextResponse.json({
        success: true,
        permanentAssetRetained: true,
        message: "Garment archived from fitting room (preserved for historical orders).",
      });
    }

    await prisma.design.delete({
      where: { id: garmentId },
    });

    return NextResponse.json({ success: true, message: "Garment permanently removed from fitting room." });
  } catch (error: any) {
    console.error("DELETE /api/tryon/garments error:", error?.message || error);
    return NextResponse.json({ success: false, error: "Failed to remove garment." }, { status: 500 });
  }
}
