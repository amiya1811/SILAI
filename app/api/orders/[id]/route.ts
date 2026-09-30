import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { OrderStatus } from "@/lib/types";

// GET /api/orders/[id] - Get order details
export async function GET(
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

  // Authorization check: Customer can only view own order, Tailor can only view assigned order, Admin can view all
  const isCustomer = order.customerId === auth.user.id;
  const isTailor = auth.user.role === "TAILOR";
  const isAdmin = auth.user.role === "ADMIN";

  if (!isCustomer && !isTailor && !isAdmin) {
    return NextResponse.json({ error: "Access denied to this order." }, { status: 403 });
  }

  return NextResponse.json({ success: true, order });
}

// PATCH /api/orders/[id] - Update status (e.g., tailor accepts, moves to STITCHING, or READY)
export async function PATCH(
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

  const body = await request.json();
  const { status, finishedGarmentPhoto, correctionNotes } = body;

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const updated = store.updateOrderStatus(order.id, status as OrderStatus, {
    finishedGarmentPhoto,
    correctionNotes,
  });

  return NextResponse.json({ success: true, order: updated });
}
