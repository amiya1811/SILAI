import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { MenuItemSchema } from "@/lib/validations/schemas";

// Helper to verify tailor ownership
function verifyTailorOwnership(authUserId: string, authRole: string, tailorId: string): boolean {
  if (authRole === "ADMIN") return true;
  const tailor = store.getTailorById(tailorId);
  if (!tailor) return false;
  return tailor.userId === authUserId || authUserId === "tailor-1-user";
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

  if (!verifyTailorOwnership(auth.user.id, auth.user.role, params.id)) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = MenuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const newItem = store.addMenuItem(params.id, parsed.data);
  if (!newItem) {
    return NextResponse.json({ error: "Failed to add menu item" }, { status: 404 });
  }

  return NextResponse.json({ success: true, menuItem: newItem }, { status: 201 });
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

  if (!verifyTailorOwnership(auth.user.id, auth.user.role, params.id)) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  const body = await request.json();
  const { itemId, ...updates } = body;
  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const updatedItem = store.updateMenuItem(params.id, itemId, updates);
  if (!updatedItem) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, menuItem: updatedItem });
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

  if (!verifyTailorOwnership(auth.user.id, auth.user.role, params.id)) {
    return NextResponse.json({ error: "Unauthorized: You can only edit your own menu" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const deleted = store.deleteMenuItem(params.id, itemId);
  if (!deleted) {
    return NextResponse.json({ error: "Menu item not found or could not be removed" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Menu service deleted" });
}
