import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { OrderStatus } from "@prisma/client";

function formatDeliveryJob(d: any) {
  const primaryItem = d.order?.orderItems?.[0];
  const customerName = d.order?.customer?.user?.fullName || "Valued Customer";
  const firstName = customerName ? customerName.trim().split(/\s+/)[0] : "Customer";
  const maskedCustomer = `${firstName} ••••`;

  return {
    id: d.id,
    orderId: d.orderId,
    orderNumber: d.order?.orderNumber || "SIL-ORDER",
    garmentName: primaryItem?.garmentName || "Custom Stitching Garment",
    type: d.type,
    status: d.status,
    customerNameMasked: maskedCustomer,
    pickupAddressMasked: d.pickupAddressMasked || "Address available upon pickup",
    tailorName: d.order?.tailor?.businessName || "Master Tailor",
    dropAddressMasked: d.dropAddressMasked || "Delivery address verified",
    distanceKm: d.distanceKm ?? 3.5,
    payoutAmount: d.payoutAmount ?? 140,
    deliveryOtpVerified: d.deliveryOtpVerified ?? false,
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const deliveries = await prisma.delivery.findMany({
      where: {
        order: {
          status: { not: OrderStatus.CANCELLED },
        },
      },
      include: {
        order: {
          include: {
            customer: { include: { user: true } },
            tailor: true,
            orderItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      deliveries: deliveries.map(formatDeliveryJob),
    });
  } catch (error: any) {
    console.error("GET /api/deliveries error:", error);
    return NextResponse.json({ error: "Failed to retrieve delivery jobs" }, { status: 500 });
  }
}
