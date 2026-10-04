import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth/session";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/offers - Retrieve active promotional offers tailored to user eligibility
export async function GET(request: NextRequest) {
  try {
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        validUntil: { gt: new Date() },
      },
      orderBy: { minOrderValue: "desc" },
    });

    const user = getUserFromRequest(request);
    let isNewUser = true; // Default to new user for guest/first-time visitors
    let isAuthenticated = false;

    if (user) {
      isAuthenticated = true;
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: user.id },
      });

      if (customerProfile) {
        const nonCancelledOrderCount = await prisma.order.count({
          where: {
            customerId: customerProfile.id,
            status: { not: OrderStatus.CANCELLED },
          },
        });
        isNewUser = nonCancelledOrderCount === 0;
      }
    }

    // STRICT USER ELIGIBILITY FILTERING:
    // - New Users (0 non-cancelled orders): See ONLY AMIYA@100 & AMIYA@50 (USER@50 is completely hidden)
    // - Regular Users (>=1 non-cancelled orders): See ONLY USER@50 (AMIYA@100 & AMIYA@50 are completely hidden)
    const eligibleOffers = offers.filter((o) => {
      if (isNewUser) {
        return ["AMIYA@100", "AMIYA@50"].includes(o.code);
      } else {
        return o.code === "USER@50";
      }
    });

    return NextResponse.json({
      success: true,
      isNewUser,
      isAuthenticated,
      offers: eligibleOffers.map((o) => {
        const isFirstOrderCoupon = ["AMIYA@100", "AMIYA@50"].includes(o.code);
        return {
          id: o.id,
          code: o.code,
          title: o.title,
          description: o.description || "",
          discountType: o.discountType,
          discountValue: o.discountValue,
          minOrderValue: o.minOrderValue,
          maxDiscount: o.maxDiscount || undefined,
          tailorId: o.tailorId || undefined,
          validUntil: o.validUntil ? o.validUntil.toISOString() : undefined,
          userEligibility: isFirstOrderCoupon ? "NEW_USER" : "REGULAR_USER",
          eligibilityBadge: isFirstOrderCoupon ? "First Order Special" : "Exclusive Member Offer",
          savingsText: `Save ₹${o.discountValue}`,
          conditionText: `On orders of ₹${o.minOrderValue} and above`,
        };
      }),
    });
  } catch (error: any) {
    console.error("GET /api/offers error:", error);
    return NextResponse.json({ error: "Failed to retrieve promotional offers" }, { status: 500 });
  }
}
