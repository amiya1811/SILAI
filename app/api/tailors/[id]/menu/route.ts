import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { MenuItemSchema } from "@/lib/validations/schemas";

async function resolveTailorId(authUserId: string, authRole: string, tailorId: string): Promise<string | null> {
  if (tailorId === "me") {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { userId: authUserId },
      select: { id: true },
    });
    return tailor ? tailor.id : null;
  }
  if (authRole === "ADMIN") return tailorId;
  const tailor = await prisma.tailorProfile.findUnique({
    where: { id: tailorId },
    select: { userId: true },
  });
  if (!tailor || tailor.userId !== authUserId) return null;
  return tailorId;
}

// GET /api/tailors/[id]/menu - Fetch services for this tailor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let targetTailorId = params.id;
    if (params.id === "me") {
      const auth = requireAuth(request);
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
      const myTailor = await prisma.tailorProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!myTailor) {
        return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      }
      targetTailorId = myTailor.id;
    }

    const items = await prisma.menuItem.findMany({
      where: { tailorId: targetTailorId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      menuItems: items.map((m) => ({
        id: m.id,
        tailorId: m.tailorId,
        category: m.category,
        name: m.name,
        description: m.description || "",
        basePrice: m.basePrice,
        estimatedDays: m.estimatedDays,
        complexity: m.complexity,
        imageUrl: m.imageUrl || undefined,
        isAvailable: m.isAvailable,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/tailors/[id]/menu error:", error);
    return NextResponse.json({ error: "Failed to retrieve menu items" }, { status: 500 });
  }
}

// POST /api/tailors/[id]/menu - Add service item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedTailorId = await resolveTailorId(auth.user.id, auth.user.role, params.id);
  if (!resolvedTailorId) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = MenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { category, name, description, basePrice, estimatedDays, complexity, isAvailable } = parsed.data;

    const newItem = await prisma.menuItem.create({
      data: {
        tailorId: resolvedTailorId,
        category: (category || "CUSTOM").toUpperCase(),
        name,
        description: description || null,
        basePrice: Number(basePrice),
        estimatedDays: Number(estimatedDays || 4),
        complexity: complexity || "REGULAR",
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json({ success: true, menuItem: newItem }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/tailors/[id]/menu error:", error);
    return NextResponse.json({ error: "Failed to add menu item" }, { status: 500 });
  }
}

// PUT /api/tailors/[id]/menu - Edit service item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedTailorId = await resolveTailorId(auth.user.id, auth.user.role, params.id);
  if (!resolvedTailorId) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { itemId, category, name, description, basePrice, estimatedDays, complexity, isAvailable } = body;
    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const existing = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existing || existing.tailorId !== resolvedTailorId) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(category ? { category: category.toUpperCase() } : {}),
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
        ...(estimatedDays !== undefined ? { estimatedDays: Number(estimatedDays) } : {}),
        ...(complexity ? { complexity } : {}),
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
      },
    });

    return NextResponse.json({ success: true, menuItem: updatedItem });
  } catch (error: any) {
    console.error("PUT /api/tailors/[id]/menu error:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

// DELETE /api/tailors/[id]/menu - Delete service item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedTailorId = await resolveTailorId(auth.user.id, auth.user.role, params.id);
  if (!resolvedTailorId) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const existing = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!existing || existing.tailorId !== resolvedTailorId) {
      return NextResponse.json({ error: "Menu item not found or could not be removed" }, { status: 404 });
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, message: "Menu service deleted" });
  } catch (error: any) {
    console.error("DELETE /api/tailors/[id]/menu error:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
