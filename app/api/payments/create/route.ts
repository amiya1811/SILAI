import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { createPaymentOrder, RAZORPAY_KEY_ID } from "@/lib/payment/razorpay";
import { PaymentStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { orderId, couponCode, appliedCoupon } = body;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        customer: { include: { user: true } },
        tailor: true,
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify customer owns this order or admin
    if (order.customer.userId !== auth.user.id && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied to this order payment" }, { status: 403 });
    }

    if (order.status !== "PENDING_PAYMENT" && order.status !== "DRAFT") {
      return NextResponse.json(
        { error: `Order is already in ${order.status} state` },
        { status: 400 }
      );
    }

    let payableAmount = order.finalPayableAmount;
    const activeCoupon = (couponCode || appliedCoupon || "").toUpperCase().trim();

    // Re-verify coupon on server to eliminate client-side discount tampering
    if (activeCoupon) {
      const offer = await prisma.offer.findUnique({
        where: { code: activeCoupon },
      });

      if (
        offer &&
        offer.isActive &&
        (!offer.validUntil || new Date() <= offer.validUntil) &&
        order.stitchingPrice >= offer.minOrderValue
      ) {
        // Check customer prior non-cancelled orders
        const priorOrdersCount = await prisma.order.count({
          where: {
            customerId: order.customerId,
            id: { not: order.id },
            status: { not: "CANCELLED" },
          },
        });
        const isNewUser = priorOrdersCount === 0;

        const isNewUserCoupon = ["AMIYA@100", "AMIYA@50"].includes(offer.code);
        const isEligible = isNewUserCoupon ? isNewUser : offer.code === "USER@50" ? !isNewUser : true;

        if (isEligible && (!offer.tailorId || offer.tailorId === order.tailorId)) {
          let discountAmount = 0;
          if (offer.discountType === "PERCENTAGE") {
            const rawDiscount = (order.stitchingPrice * offer.discountValue) / 100;
            discountAmount = offer.maxDiscount ? Math.min(rawDiscount, offer.maxDiscount) : rawDiscount;
          } else {
            discountAmount = offer.discountValue;
          }
          discountAmount = Math.min(discountAmount, order.stitchingPrice);

          const taxableSubtotal = Math.max(0, order.stitchingPrice - discountAmount - order.membershipDiscount);
          const taxAmount = Math.round(taxableSubtotal * 0.05);
          payableAmount = taxableSubtotal + order.doorstepDeliveryFee + taxAmount;

          await prisma.order.update({
            where: { id: order.id },
            data: {
              discountAmount,
              taxAmount,
              finalPayableAmount: payableAmount,
            },
          });
        }
      }
    }

    const garmentName = order.orderItems[0]?.garmentName || "Custom Stitching";

    // SERVER-CALCULATED AMOUNT: payableAmount
    const paymentOrder = await createPaymentOrder({
      amount: payableAmount,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customer.user.email,
      customerPhone: order.customer.user.phone || undefined,
      notes: {
        garmentName,
        tailorName: order.tailor.businessName,
      },
    });

    // Save pending payment record in PostgreSQL
    await prisma.payment.upsert({
      where: { razorpayOrderId: paymentOrder.id },
      update: {
        amount: order.finalPayableAmount,
        status: PaymentStatus.CREATED,
      },
      create: {
        orderId: order.id,
        razorpayOrderId: paymentOrder.id,
        amount: order.finalPayableAmount,
        currency: paymentOrder.currency || "INR",
        status: PaymentStatus.CREATED,
      },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount, // in paise
      currency: paymentOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      orderNumber: order.orderNumber,
      finalPayableAmount: order.finalPayableAmount,
    });
  } catch (error: any) {
    console.error("POST /api/payments/create error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 500 });
  }
}
