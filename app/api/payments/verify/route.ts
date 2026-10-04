import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/payment/razorpay";
import { VerifyPaymentSchema } from "@/lib/validations/schemas";
import { PaymentStatus, OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";

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

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        tailor: true,
        customer: { include: { user: true } },
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Cryptographic signature verification - never trust payment success without signature
    const isValidSignature = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      await prisma.payment.upsert({
        where: { razorpayOrderId },
        update: {
          razorpayPaymentId,
          status: PaymentStatus.FAILED,
        },
        create: {
          orderId: order.id,
          razorpayOrderId,
          razorpayPaymentId,
          amount: order.finalPayableAmount,
          currency: "INR",
          status: PaymentStatus.FAILED,
        },
      });

      return NextResponse.json(
        {
          error: "Payment verification failed. Invalid cryptographic signature.",
          status: "FAILED",
        },
        { status: 400 }
      );
    }

    // Signature verified! Atomically record payment, mark order PAID, and schedule fabric pickup
    const result = await prisma.$transaction(async (tx) => {
      const paymentRecord = await tx.payment.upsert({
        where: { razorpayOrderId },
        update: {
          razorpayPaymentId,
          razorpaySignature,
          status: PaymentStatus.SUCCESS,
          verifiedAt: new Date(),
        },
        create: {
          orderId: order.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: order.finalPayableAmount,
          currency: "INR",
          status: PaymentStatus.SUCCESS,
          verifiedAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
        include: {
          tailor: true,
          customer: { include: { user: true } },
          orderItems: true,
        },
      });

      // Automatically generate Fabric & Spec Pickup Delivery Job
      const existingJob = await tx.delivery.findFirst({
        where: {
          orderId: order.id,
          type: DeliveryType.CUSTOMER_TO_TAILOR,
        },
      });

      if (!existingJob) {
        await tx.delivery.create({
          data: {
            orderId: order.id,
            type: DeliveryType.CUSTOMER_TO_TAILOR,
            status: DeliveryStatus.ASSIGNED,
            pickupAddressMasked: order.pickupAddress,
            dropAddressMasked: order.tailor.businessName,
            distanceKm: 3.8,
            payoutAmount: 90.0,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "PAYMENT_VERIFIED_SUCCESS",
          resource: "Order",
          resourceId: order.id,
          payload: JSON.stringify({
            orderNumber: order.orderNumber,
            amount: order.finalPayableAmount,
            razorpayPaymentId,
          }),
        },
      });

      return { paymentRecord, updatedOrder };
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Your fabric pickup has been scheduled.",
      payment: result.paymentRecord,
      order: result.updatedOrder,
    });
  } catch (error: any) {
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
