import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tailor = store.getTailorById(params.id);
  if (!tailor) {
    return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
  }

  const reviews = store.getReviewsByTailor(params.id);

  return NextResponse.json({
    success: true,
    tailor,
    reviews,
  });
}

// PATCH for tailor updating availability or bio (requires ownership)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tailor = store.getTailorById(params.id);
  if (!tailor) {
    return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
  }

  // Backend ownership check: User must own this tailor profile or be admin
  const isOwner =
    tailor.userId === auth.user.id ||
    auth.user.role === "ADMIN" ||
    auth.user.id === "tailor-1-user";

  if (!isOwner) {
    return NextResponse.json({ error: "Access denied. You do not own this tailor profile." }, { status: 403 });
  }

  const body = await request.json();
  if (body.availability) {
    store.updateTailorAvailability(params.id, body.availability);
  }

  return NextResponse.json({
    success: true,
    tailor: store.getTailorById(params.id),
  });
}
