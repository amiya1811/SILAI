import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { createPaymentOrder, RAZORPAY_KEY_ID } from "@/lib/payment/razorpay";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = store.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING_PAYMENT" && order.status !== "DRAFT") {
      return NextResponse.json(
        { error: `Order is already in ${order.status} state` },
        { status: 400 }
      );
    }

    // SERVER CALCULATED AMOUNT: order.finalPayableAmount
    const paymentOrder = await createPaymentOrder({
      amount: order.finalPayableAmount,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: auth.user.email,
      customerPhone: auth.user.phone,
      notes: {
        garmentName: order.garmentName,
        tailorName: order.tailorName,
      },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount, // in paise
      currency: paymentOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      orderNumber: order.orderNumber,
      finalPayableAmount: order.finalPayableAmount, // in INR
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 500 });
  }
}
