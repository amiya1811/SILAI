import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { OrderStatus, DeliveryStatus, DeliveryType } from "@prisma/client";

function formatDeliveryJob(d: any, photoData?: { pickupPhotoUrl?: string; packageCondition?: string; finalDeliveryPhotoUrl?: string }) {
  const primaryItem = d.order?.orderItems?.[0];
  const customerName = d.order?.customer?.user?.fullName || "Valued Customer";
  const firstName = customerName ? customerName.trim().split(/\s+/)[0] : "Customer";
  const maskedCustomer = `${firstName} ••••`;

  // Pickup and drop coordinates depending on delivery leg
  let pickupLat: number | undefined;
  let pickupLng: number | undefined;
  let dropLat: number | undefined;
  let dropLng: number | undefined;

  if (d.type === DeliveryType.CUSTOMER_TO_TAILOR) {
    pickupLat = d.order?.pickupLatitude || 12.8452;
    pickupLng = d.order?.pickupLongitude || 77.6602;
    dropLat = d.order?.tailor?.coordinatesLat || 12.9716;
    dropLng = d.order?.tailor?.coordinatesLng || 77.5946;
  } else {
    pickupLat = d.order?.tailor?.coordinatesLat || 12.9716;
    pickupLng = d.order?.tailor?.coordinatesLng || 77.5946;
    dropLat = d.order?.deliveryLatitude || d.order?.pickupLatitude || 12.8452;
    dropLng = d.order?.deliveryLongitude || d.order?.pickupLongitude || 77.6602;
  }

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
    assignedDriverId: d.deliveryProfileId || undefined,
    pickupCoordinatesLat: pickupLat,
    pickupCoordinatesLng: pickupLng,
    dropCoordinatesLat: dropLat,
    dropCoordinatesLng: dropLng,
    pickupPhotoUrl: photoData?.pickupPhotoUrl || undefined,
    packageCondition: photoData?.packageCondition || undefined,
    finalDeliveryPhotoUrl: photoData?.finalDeliveryPhotoUrl || undefined,
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let profile = null;
    if (auth.user.role === "DELIVERY_PARTNER") {
      profile = await prisma.deliveryProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!profile) {
        profile = await prisma.deliveryProfile.create({
          data: {
            userId: auth.user.id,
            vehicleType: "Two-Wheeler",
            currentCity: "Bengaluru",
            isOnline: true,
          },
        });
      }
    }

    // Role-based filtering: Delivery partners see available unassigned jobs OR their own jobs
    const whereClause: any = {
      order: {
        status: { not: OrderStatus.CANCELLED },
      },
    };

    if (auth.user.role === "DELIVERY_PARTNER" && profile) {
      whereClause.OR = [
        { deliveryProfileId: null, status: DeliveryStatus.ASSIGNED },
        { deliveryProfileId: profile.id },
      ];
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
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

    // Retrieve audit logs for photo verification moments
    const deliveryIds = deliveries.map((d) => d.id);
    const photoLogs = deliveryIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            resource: "Delivery",
            resourceId: { in: deliveryIds },
            action: { startsWith: "DELIVERY_PHOTO_" },
          },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const photoMap: Record<string, { pickupPhotoUrl?: string; packageCondition?: string; finalDeliveryPhotoUrl?: string }> = {};
    for (const log of photoLogs) {
      if (!log.resourceId || !log.payload) continue;
      try {
        const parsed = JSON.parse(log.payload);
        if (!photoMap[log.resourceId]) photoMap[log.resourceId] = {};
        if (parsed.stage === "CUSTOMER_PICKUP" || parsed.stage === "FINISHED_PICKUP") {
          photoMap[log.resourceId].pickupPhotoUrl = parsed.photoUrl;
          if (parsed.packageCondition) photoMap[log.resourceId].packageCondition = parsed.packageCondition;
        } else if (parsed.stage === "FINAL_DELIVERY") {
          photoMap[log.resourceId].finalDeliveryPhotoUrl = parsed.photoUrl;
        }
      } catch (e) {
        // Ignored
      }
    }

    return NextResponse.json({
      success: true,
      deliveries: deliveries.map((d) => formatDeliveryJob(d, photoMap[d.id])),
    });
  } catch (error: any) {
    console.error("GET /api/deliveries error:", error);
    return NextResponse.json({ error: "Failed to retrieve delivery jobs" }, { status: 500 });
  }
}
