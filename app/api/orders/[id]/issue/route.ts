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
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { reason, details } = body;

  if (!reason || !details) {
    return NextResponse.json(
      { error: "Please specify the issue type and explanation." },
      { status: 400 }
    );
  }

  const updated = store.reportOrderIssue(order.id, { reason, details });

  return NextResponse.json({
    success: true,
    message: "Issue reported successfully. A concierge specialist has been assigned to assist you.",
    order: updated,
  });
}
