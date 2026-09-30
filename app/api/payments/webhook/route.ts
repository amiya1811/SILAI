import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment/razorpay";
import { store } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get("x-razorpay-signature");

    if (!webhookSignature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, webhookSignature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.notes?.silaiOrderId;
      if (orderId) {
        store.recordPayment({
          orderId,
          razorpayOrderId: paymentEntity.order_id,
          razorpayPaymentId: paymentEntity.id,
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency,
          status: "SUCCESS",
          paymentMethod: paymentEntity.method,
          verifiedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
