import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { code, tailorId, subtotal } = await request.json();
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase().trim();
    const offer = await prisma.offer.findUnique({
      where: { code: normalizedCode },
    });

    if (!offer || !offer.isActive || (offer.validUntil && new Date() > offer.validUntil)) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
    }

    // Determine authenticated customer's genuine order history from PostgreSQL
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    const orderCount = customerProfile
      ? await prisma.order.count({
          where: {
            customerId: customerProfile.id,
            status: { not: OrderStatus.CANCELLED },
          },
        })
      : 0;

    const isNewUser = orderCount === 0;

    // Strict user eligibility enforcement:
    // 1. AMIYA@100 & AMIYA@50: NEW USERS ONLY
    if (["AMIYA@100", "AMIYA@50"].includes(offer.code) && !isNewUser) {
      return NextResponse.json(
        {
          error: `Coupon ${offer.code} is available for new users on their first order only.`,
        },
        { status: 400 }
      );
    }

    // 2. USER@50: REGULAR USERS ONLY (>=1 non-cancelled orders)
    if (offer.code === "USER@50" && isNewUser) {
      return NextResponse.json(
        {
          error:
            "Coupon USER@50 is reserved for returning patrons. As a first-time customer, enjoy AMIYA@100 or AMIYA@50!",
        },
        { status: 400 }
      );
    }

    // Dynamic minimum order value verification
    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < offer.minOrderValue) {
      const shortfall = Math.ceil(offer.minOrderValue - orderSubtotal);
      return NextResponse.json(
        {
          error: `Add ₹${shortfall} more to use ${offer.code}.`,
          minOrderValue: offer.minOrderValue,
          shortfall,
        },
        { status: 400 }
      );
    }

    // Tailor exclusivity check if applicable
    if (offer.tailorId && offer.tailorId !== tailorId) {
      return NextResponse.json(
        { error: "This promo code is valid only for specific partner boutiques." },
        { status: 400 }
      );
    }

    let calculatedDiscount = 0;
    if (offer.discountType === "PERCENTAGE") {
      calculatedDiscount = Math.round((orderSubtotal * offer.discountValue) / 100);
      if (offer.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, offer.maxDiscount);
      }
    } else {
      calculatedDiscount = offer.discountValue;
    }

    // Discount cannot exceed subtotal
    calculatedDiscount = Math.min(calculatedDiscount, orderSubtotal);

    return NextResponse.json({
      success: true,
      code: offer.code,
      title: offer.title,
      discountAmount: calculatedDiscount,
      minOrderValue: offer.minOrderValue,
      message: `Coupon ${offer.code} applied — Save ₹${calculatedDiscount}!`,
    });
  } catch (err: any) {
    console.error("POST /api/offers/validate error:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
