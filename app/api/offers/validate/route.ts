import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { code, tailorId, subtotal } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const offer = store.getOfferByCode(code);
    if (!offer) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < offer.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value of ₹${offer.minOrderValue} required for this coupon.`,
        },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      code: offer.code,
      title: offer.title,
      discountAmount: calculatedDiscount,
      message: `₹${calculatedDiscount} savings applied!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
