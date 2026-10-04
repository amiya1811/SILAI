import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { CreateOrderSchema } from "@/lib/validations/schemas";
import { generateOrderNumber, generateDeliveryOtp } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

function formatOrderForClient(o: any) {
  const primaryItem = o.orderItems?.[0];
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerId: o.customer?.userId || o.customerId,
    customerName: o.customer?.user?.fullName || "Valued Customer",
    customerPhone: o.customer?.user?.phone || "",
    tailorId: o.tailorId,
    tailorName: o.tailor?.businessName || "Master Boutique",
    tailorAddress: o.tailor?.address || "",
    garmentName: primaryItem?.garmentName || "Custom Outfit",
    garmentCategory: primaryItem?.complexity || "CUSTOM",
    measurementType: o.measurementProfile?.type || "SAVED",
    status: o.status,
    stitchingPrice: o.stitchingPrice,
    doorstepDeliveryFee: o.doorstepDeliveryFee,
    discountAmount: o.discountAmount,
    membershipDiscount: o.membershipDiscount,
    taxAmount: o.taxAmount,
    finalPayableAmount: o.finalPayableAmount,
    platformCommission: o.platformCommission,
    tailorEarnings: o.tailorEarnings,
    pickupAddress: o.pickupAddress || "",
    deliveryAddress: o.deliveryAddress || "",
    pickupScheduledAt: o.pickupScheduledAt ? o.pickupScheduledAt.toISOString() : undefined,
    expectedDeliveryDate: o.expectedDeliveryDate ? o.expectedDeliveryDate.toISOString() : undefined,
    deliveryOtp: o.deliveryOtp || "",
    correctionNotes: o.correctionNotes || "",
    finishedGarmentPhoto: o.finishedGarmentPhoto || "",
    createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? o.updatedAt.toISOString() : new Date().toISOString(),
    quantity: primaryItem?.quantity || 1,
    design: o.design || null,
    measurementProfile: o.measurementProfile || null,
    orderItems: o.orderItems || [],
  };
}

// GET /api/orders - List orders for authenticated user
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let whereClause: any = {};

    if (auth.user.role === "ADMIN") {
      whereClause = {};
    } else if (auth.user.role === "TAILOR") {
      const tailor = await prisma.tailorProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!tailor) {
        return NextResponse.json({ success: true, orders: [] });
      }
      whereClause = { tailorId: tailor.id };
    } else {
      // CUSTOMER
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!customer) {
        return NextResponse.json({ success: true, orders: [] });
      }
      whereClause = { customerId: customer.id };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          include: { user: true },
        },
        tailor: true,
        orderItems: true,
        deliveries: true,
        measurementProfile: true,
        design: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(formatOrderForClient),
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to retrieve orders" }, { status: 500 });
  }
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
      quantity = 1,
      pickupAddress,
      deliveryAddress,
      appliedCoupon,
      measurementType,
      measurementProfileId: clientMeasurementProfileId,
      measurements,
      design,
      isSilaiClubMember,
      orderNotes,
    } = parsed.data;

    // Verify tailor existence and availability
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorId },
      include: { menuItems: true },
    });

    if (!tailor) {
      return NextResponse.json({ error: "Selected tailor does not exist." }, { status: 404 });
    }

    if (tailor.availability === "NOT_ACCEPTING") {
      return NextResponse.json(
        { error: "This tailor is currently not accepting new orders. Please browse another master tailor." },
        { status: 400 }
      );
    }

    // Ensure customer profile exists in PostgreSQL
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
      include: { user: true },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId: auth.user.id,
          addressLine1: pickupAddress,
          city: tailor.city || "Delhi NCR",
          preferredLanguage: "English",
        },
        include: { user: true },
      });
    }

    // SERVER-SIDE PRICING & SERVICE VALIDATION - Never trust client prices
    let basePrice = 850;
    let finalGarmentName = garmentName;
    let finalComplexity = garmentCategory || "REGULAR";

    if (menuItemId) {
      const dbMenuItem = tailor.menuItems.find((m) => m.id === menuItemId);
      if (!dbMenuItem) {
        return NextResponse.json(
          { error: "The selected tailoring service was not found in this boutique's menu." },
          { status: 404 }
        );
      }
      if (!dbMenuItem.isAvailable) {
        return NextResponse.json(
          { error: "This tailoring service is currently marked as unavailable." },
          { status: 400 }
        );
      }
      basePrice = dbMenuItem.basePrice;
      finalGarmentName = dbMenuItem.name;
      finalComplexity = dbMenuItem.complexity || dbMenuItem.category;
    }

    const validQuantity = Math.max(1, Math.min(20, Number(quantity) || 1));
    const stitchingSubtotal = basePrice * validQuantity;

    // VALIDATE FIT PROFILE OWNERSHIP (Security: Customer A cannot use Customer B's profile)
    let validatedMeasurementProfileId: string | null = null;
    if (clientMeasurementProfileId) {
      const existingProfile = await prisma.measurementProfile.findFirst({
        where: {
          id: clientMeasurementProfileId,
          customerId: customerProfile.id,
        },
      });
      if (!existingProfile) {
        return NextResponse.json(
          { error: "Access denied. The specified Fit Profile does not belong to your account." },
          { status: 403 }
        );
      }
      validatedMeasurementProfileId = existingProfile.id;
    }

    // VALIDATE DESIGN OWNERSHIP (Security: Customer A cannot use Customer B's design)
    let validatedDesignId: string | null = null;
    if (design?.id || design?.designId) {
      const targetDesignId = design.id || design.designId;
      const existingDesign = await prisma.design.findFirst({
        where: {
          id: targetDesignId,
          customerId: customerProfile.id,
        },
      });
      if (!existingDesign) {
        return NextResponse.json(
          { error: "Access denied. The specified Design reference does not belong to your account." },
          { status: 403 }
        );
      }
      validatedDesignId = existingDesign.id;
    }

    // SERVER-SIDE PROMO CODE RE-CALCULATION & ELIGIBILITY ENFORCEMENT
    let discountAmount = 0;
    if (appliedCoupon) {
      const normalizedCode = appliedCoupon.toUpperCase().trim();
      const offer = await prisma.offer.findUnique({
        where: { code: normalizedCode },
      });

      if (
        offer &&
        offer.isActive &&
        (!offer.validUntil || new Date(offer.validUntil) > new Date()) &&
        stitchingSubtotal >= offer.minOrderValue
      ) {
        // Query genuine non-cancelled orders from PostgreSQL
        const customerOrderCount = await prisma.order.count({
          where: {
            customerId: customerProfile.id,
            status: { not: OrderStatus.CANCELLED },
          },
        });
        const isNewUser = customerOrderCount === 0;

        const isNewUserCoupon = ["AMIYA@100", "AMIYA@50"].includes(offer.code);
        const isEligible = isNewUserCoupon ? isNewUser : offer.code === "USER@50" ? !isNewUser : true;

        if (isEligible && (!offer.tailorId || offer.tailorId === tailor.id)) {
          if (offer.discountType === "PERCENTAGE") {
            const rawDiscount = Math.round((stitchingSubtotal * offer.discountValue) / 100);
            discountAmount = offer.maxDiscount ? Math.min(rawDiscount, offer.maxDiscount) : rawDiscount;
          } else {
            discountAmount = offer.discountValue;
          }
          discountAmount = Math.min(discountAmount, stitchingSubtotal);
        }
      }
    }

    const doorstepDeliveryFee = 100;
    const membershipDiscount = isSilaiClubMember ? 50 : 0;
    const taxableSubtotal = Math.max(0, stitchingSubtotal - discountAmount - membershipDiscount);
    const taxAmount = Math.round(taxableSubtotal * 0.05);
    const finalPayableAmount = taxableSubtotal + doorstepDeliveryFee + taxAmount;

    const commissionRate = tailor.commissionRate || 0.15;
    const platformCommission = Math.round(stitchingSubtotal * commissionRate);
    const tailorEarnings = stitchingSubtotal - platformCommission;

    const orderNumber = generateOrderNumber();
    const deliveryOtp = generateDeliveryOtp();

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + (tailor.avgStitchingDays || 4) + 1);

    // Consolidate detailed order stitching instructions
    const combinedNotes = [
      orderNotes,
      design?.specialInstructions,
      design?.neckline ? `Neckline: ${design.neckline}` : null,
      design?.sleeveStyle ? `Sleeve: ${design.sleeveStyle}` : null,
      design?.lengthPreference ? `Length: ${design.lengthPreference}` : null,
      design?.fitPreference ? `Fit: ${design.fitPreference}` : null,
      design?.embroideryDetails ? `Embroidery: ${design.embroideryDetails}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    // ATOMIC TRANSACTION: Prevent partial order or orphaned records
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. If customer entered manual measurements without existing profile
      let finalMeasId = validatedMeasurementProfileId;
      if (!finalMeasId && measurements && (measurementType === "SAVED" || measurementType === "MANUAL")) {
        const savedMeas = await tx.measurementProfile.create({
          data: {
            customerId: customerProfile.id,
            profileName: `${finalGarmentName} Fit (${new Date().toLocaleDateString("en-IN")})`,
            garmentType: garmentCategory || "CUSTOM",
            type: measurementType,
            measurementsJson: JSON.stringify(measurements),
          },
        });
        finalMeasId = savedMeas.id;
      }

      // 2. If new reference image provided without existing design
      let finalDesId = validatedDesignId;
      if (!finalDesId && design?.referenceImageUrl) {
        const savedDesign = await tx.design.create({
          data: {
            customerId: customerProfile.id,
            title: design.title || finalGarmentName,
            garmentType: garmentCategory || "CUSTOM",
            referenceImageUrl: design.referenceImageUrl,
            neckline: design.neckline || null,
            sleeveStyle: design.sleeveStyle || null,
            lengthPreference: design.lengthPreference || null,
            embroideryDetails: design.embroideryDetails || null,
            fitPreference: design.fitPreference || null,
            specialInstructions: combinedNotes || null,
          },
        });
        finalDesId = savedDesign.id;
      }

      // 3. Create Order
      const ord = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerProfile.id,
          tailorId: tailor.id,
          designId: finalDesId,
          measurementProfileId: finalMeasId,
          status: OrderStatus.PENDING_PAYMENT,
          stitchingPrice: stitchingSubtotal,
          doorstepDeliveryFee,
          discountAmount,
          membershipDiscount,
          taxAmount,
          finalPayableAmount,
          platformCommission,
          tailorEarnings,
          pickupAddress,
          deliveryAddress,
          deliveryOtp,
          expectedDeliveryDate: expectedDelivery,
          correctionNotes: combinedNotes || null,
          orderItems: {
            create: {
              menuItemId: menuItemId || null,
              garmentName: finalGarmentName,
              complexity: finalComplexity,
              unitPrice: basePrice,
              quantity: validQuantity,
              customNotes: combinedNotes || null,
            },
          },
        },
        include: {
          customer: {
            include: { user: true },
          },
          tailor: true,
          orderItems: true,
          design: true,
          measurementProfile: true,
        },
      });

      return ord;
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json(
      {
        success: true,
        order: formatOrderForClient(createdOrder),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
