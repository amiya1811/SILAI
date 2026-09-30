import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/payment/razorpay";
import { VerifyPaymentSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const order = store.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Server-side cryptographic signature check
    const isValidSignature = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      // Record payment attempt failure
      store.recordPayment({
        orderId: order.id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: order.finalPayableAmount,
        currency: "INR",
        status: "FAILED",
      });

      return NextResponse.json(
        {
          error: "Payment verification failed. Invalid cryptographic signature.",
          status: "FAILED",
        },
        { status: 400 }
      );
    }

    // Success verified! Record payment and update order
    const paymentRecord = store.recordPayment({
      orderId: order.id,
      razorpayOrderId,
      razorpayPaymentId,
      amount: order.finalPayableAmount,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: "RAZORPAY_CHECKOUT",
      verifiedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. Order is confirmed!",
      order: store.getOrderById(orderId),
      payment: paymentRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment verification error" },
      { status: 500 }
    );
  }
}
