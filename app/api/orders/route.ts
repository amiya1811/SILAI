import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { CreateOrderSchema } from "@/lib/validations/schemas";

// GET /api/orders - List orders for authenticated user
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const requestedTailorId = searchParams.get("tailorId");

  let orders = [];

  if (auth.user.role === "ADMIN") {
    orders = store.getOrders();
  } else if (auth.user.role === "TAILOR") {
    // Look up tailor profile by user ID or tailor-1
    const tailor = store.getTailorByUserId(auth.user.id);
    const tailorId = tailor ? tailor.id : "tailor-1";
    orders = store.getOrders({ tailorId });
  } else {
    // CUSTOMER
    orders = store.getOrders({ customerId: auth.user.id });
  }

  return NextResponse.json({ success: true, orders });
}

// POST /api/orders - Create custom stitching order
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      tailorId,
      garmentName,
      garmentCategory,
      menuItemId,
      pickupAddress,
      deliveryAddress,
      appliedCoupon,
      measurementType,
      measurements,
      design,
      isSilaiClubMember,
    } = parsed.data;

    // Server calculates all prices & validates availability
    const tailor = store.getTailorById(tailorId);
    if (!tailor) {
      return NextResponse.json({ error: "Selected tailor does not exist" }, { status: 404 });
    }

    if (tailor.availability === "NOT_ACCEPTING") {
      return NextResponse.json(
        { error: "This tailor is currently not accepting new orders. Please browse another master tailor." },
        { status: 400 }
      );
    }

    const newOrder = store.createOrder({
      customerId: auth.user.id,
      customerName: auth.user.fullName,
      customerPhone: auth.user.phone,
      tailorId,
      garmentName,
      garmentCategory,
      menuItemId,
      pickupAddress,
      deliveryAddress,
      appliedCoupon,
      measurementType,
      measurements,
      design,
      isSilaiClubMember,
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
