import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

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
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
        });

        if (order) {
          await prisma.$transaction([
            prisma.payment.upsert({
              where: { razorpayOrderId: paymentEntity.order_id },
              update: {
                razorpayPaymentId: paymentEntity.id,
                amount: paymentEntity.amount / 100,
                status: PaymentStatus.SUCCESS,
                paymentMethod: paymentEntity.method,
                verifiedAt: new Date(),
              },
              create: {
                orderId: order.id,
                razorpayOrderId: paymentEntity.order_id,
                razorpayPaymentId: paymentEntity.id,
                amount: paymentEntity.amount / 100,
                currency: paymentEntity.currency,
                status: PaymentStatus.SUCCESS,
                paymentMethod: paymentEntity.method,
                verifiedAt: new Date(),
              },
            }),
            prisma.order.update({
              where: { id: order.id },
              data: { status: OrderStatus.PAID },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
