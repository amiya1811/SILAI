import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const order = store.getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.customerId !== auth.user.id && auth.user.role !== "ADMIN") {
    return NextResponse.json({ error: "You can only request corrections for your own orders." }, { status: 403 });
  }

  const body = await request.json();
  const { notes } = body;

  if (!notes || notes.trim().length < 5) {
    return NextResponse.json({ error: "Please provide detailed notes for what needs correction." }, { status: 400 });
  }

  const updated = store.updateOrderStatus(order.id, "CORRECTION_REQUESTED", {
    correctionNotes: notes,
  });

  return NextResponse.json({
    success: true,
    message: "Correction request registered. Doorstep pickup for alteration has been scheduled.",
    order: updated,
  });
}
