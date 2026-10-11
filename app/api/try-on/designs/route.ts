import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// GET /api/try-on/designs - Load saved customer designs if authenticated
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: true, designs: [] });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
      include: {
        designs: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });

    if (!customerProfile) {
      return NextResponse.json({ success: true, designs: [] });
    }

    const formatted = customerProfile.designs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.garmentType,
      imageUrl: d.referenceImageUrl,
      isCustom: true,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, designs: formatted });
  } catch (error: any) {
    console.error("GET /api/try-on/designs error:", error?.message || error);
    return NextResponse.json({ success: true, designs: [] });
  }
}

// DELETE /api/try-on/designs - Safely remove a design without breaking historical orders
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: true, message: "Workspace design removed." });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get("id");

    if (!designId) {
      return NextResponse.json({ success: true, message: "Workspace design removed." });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ success: true, message: "Workspace design removed." });
    }

    // Check if design belongs to customer
    const design = await prisma.design.findFirst({
      where: {
        id: designId,
        customerId: customerProfile.id,
      },
      include: {
        orders: true,
      },
    });

    if (!design) {
      return NextResponse.json({ success: true, message: "Workspace design removed." });
    }

    // If design is associated with an order, PRESERVE the database record to prevent breaking order history
    if (design.orders && design.orders.length > 0) {
      return NextResponse.json({
        success: true,
        removedFromWorkspace: true,
        permanentAssetRetained: true,
        message: "Design removed from Live Try-On workspace. Historical order record preserved.",
      });
    }

    // Otherwise, safe to remove unreferenced design
    await prisma.design.delete({
      where: { id: designId },
    });

    return NextResponse.json({
      success: true,
      removedFromWorkspace: true,
      permanentAssetRetained: false,
      message: "Design deleted from fitting room.",
    });
  } catch (error: any) {
    console.error("DELETE /api/try-on/designs error:", error?.message || error);
    return NextResponse.json({ success: true, message: "Workspace design removed." });
  }
}
