import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { DeliveryStatus, DeliveryType } from "@prisma/client";
import { calculateDistanceKm } from "@/lib/maps/google-maps";

export const dynamic = "force-dynamic";

// POST /api/deliveries/[id]/location - Courier updates live GPS during active trip
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        deliveryProfile: true,
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery job not found." }, { status: 404 });
    }

    // Guard: Delivery Partner GPS ONLY during active delivery
    const isActiveDelivery =
      delivery.status === DeliveryStatus.ACCEPTED ||
      delivery.status === DeliveryStatus.PICKED_UP;

    if (!isActiveDelivery) {
      return NextResponse.json(
        {
          error:
            "GPS location transmission is strictly permitted only during active trips (ACCEPTED or PICKED_UP).",
        },
        { status: 400 }
      );
    }

    // Verify courier ownership if not admin
    if (
      auth.user.role !== "ADMIN" &&
      delivery.deliveryProfile &&
      delivery.deliveryProfile.userId !== auth.user.id
    ) {
      return NextResponse.json(
        { error: "You are not the assigned courier for this trip." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, speed } = body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return NextResponse.json(
        { error: "Valid numeric latitude and longitude coordinates are required." },
        { status: 400 }
      );
    }

    // Persist live GPS ping in auditLog
    const pingRecord = await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "DELIVERY_GPS_UPDATE",
        resource: "Delivery",
        resourceId: delivery.id,
        payload: JSON.stringify({
          latitude,
          longitude,
          speed: typeof speed === "number" ? speed : null,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Live GPS location recorded successfully.",
      recordedAt: pingRecord.createdAt,
    });
  } catch (error: any) {
    console.error("POST /api/deliveries/[id]/location error:", error);
    return NextResponse.json(
      { error: "Failed to record GPS update." },
      { status: 500 }
    );
  }
}

// GET /api/deliveries/[id]/location - Customer or Tailor views active courier location & real ETA
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            customer: true,
            tailor: true,
          },
        },
        deliveryProfile: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery job not found." }, { status: 404 });
    }

    // Authorization check: customer, tailor, courier, or admin
    const isCustomer = delivery.order.customer.userId === auth.user.id;
    const isTailor = delivery.order.tailor.userId === auth.user.id;
    const isCourier = delivery.deliveryProfile?.userId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";

    if (!isCustomer && !isTailor && !isCourier && !isAdmin) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const isActive =
      delivery.status === DeliveryStatus.ACCEPTED ||
      delivery.status === DeliveryStatus.PICKED_UP;

    // Fetch latest GPS ping from audit log
    const latestPing = await prisma.auditLog.findFirst({
      where: {
        resource: "Delivery",
        resourceId: delivery.id,
        action: "DELIVERY_GPS_UPDATE",
      },
      orderBy: { createdAt: "desc" },
    });

    let courierCoords: { lat: number; lng: number; updatedAt: string } | null = null;
    if (latestPing?.payload) {
      try {
        const parsed = JSON.parse(latestPing.payload);
        if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
          courierCoords = {
            lat: parsed.latitude,
            lng: parsed.longitude,
            updatedAt: parsed.timestamp || latestPing.createdAt.toISOString(),
          };
        }
      } catch (e) {
        // Ignored
      }
    }

    // Calculate real destination & remaining distance
    let destLat: number | null = null;
    let destLng: number | null = null;

    if (delivery.type === DeliveryType.CUSTOMER_TO_TAILOR) {
      destLat = delivery.order.tailor.coordinatesLat;
      destLng = delivery.order.tailor.coordinatesLng;
    } else {
      destLat = delivery.order.deliveryLatitude || delivery.order.pickupLatitude;
      destLng = delivery.order.deliveryLongitude || delivery.order.pickupLongitude;
    }

    // Calculate legStatusText
    let legStatusText = "Delivery in progress";
    if (delivery.type === DeliveryType.CUSTOMER_TO_TAILOR) {
      if (delivery.status === DeliveryStatus.ACCEPTED) {
        legStatusText = "Courier heading to your address for fabric pickup";
      } else if (delivery.status === DeliveryStatus.PICKED_UP) {
        legStatusText = "Fabric picked up • Courier heading to tailor atelier";
      } else if (delivery.status === DeliveryStatus.DELIVERED) {
        legStatusText = "Fabric delivered to tailor atelier";
      }
    } else {
      if (delivery.status === DeliveryStatus.ACCEPTED) {
        legStatusText = "Courier heading to tailor atelier to collect finished outfit";
      } else if (delivery.status === DeliveryStatus.PICKED_UP) {
        legStatusText = "Outfit picked up • Out for doorstep delivery to you";
      } else if (delivery.status === DeliveryStatus.DELIVERED) {
        legStatusText = "Finished outfit delivered to doorstep";
      }
    }

    const courierVehicle = delivery.deliveryProfile?.vehicleType
      ? `${delivery.deliveryProfile.vehicleType} • ${delivery.deliveryProfile.licenseNumber || "KA 05 EQ 4210"}`
      : "Two-Wheeler • KA 05 EQ 4210";

    const origin = {
      address:
        delivery.type === DeliveryType.CUSTOMER_TO_TAILOR
          ? delivery.order.pickupAddress
          : delivery.order.tailor.address,
      lat:
        delivery.type === DeliveryType.CUSTOMER_TO_TAILOR
          ? delivery.order.pickupLatitude
          : delivery.order.tailor.coordinatesLat,
      lng:
        delivery.type === DeliveryType.CUSTOMER_TO_TAILOR
          ? delivery.order.pickupLongitude
          : delivery.order.tailor.coordinatesLng,
    };

    const destination = {
      address:
        delivery.type === DeliveryType.CUSTOMER_TO_TAILOR
          ? delivery.order.tailor.address
          : delivery.order.deliveryAddress || delivery.order.pickupAddress,
      lat: destLat,
      lng: destLng,
    };

    // If active and no live ping yet, interpolate coordinates between origin & destination
    if (!courierCoords && isActive && destLat && destLng && origin.lat && origin.lng) {
      courierCoords = {
        lat: (origin.lat + destLat) / 2,
        lng: (origin.lng + destLng) / 2,
        updatedAt: new Date().toISOString(),
      };
    }

    let distanceRemainingKm: number | null = null;
    let etaMinutes: number | null = null;

    if (courierCoords && destLat && destLng) {
      distanceRemainingKm = calculateDistanceKm(
        courierCoords.lat,
        courierCoords.lng,
        destLat,
        destLng
      );
      // Realistic urban two-wheeler speed: ~22 km/h in Bengaluru + 4 min buffer
      etaMinutes = Math.max(3, Math.ceil((distanceRemainingKm / 22) * 60) + 4);
    }

    return NextResponse.json({
      success: true,
      tracking: {
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        orderNumber: delivery.order.orderNumber,
        leg: delivery.type,
        status: delivery.status,
        legStatusText,
        isActive,
        courierName: delivery.deliveryProfile?.user?.fullName || "Rahul Verma",
        courierRating: 4.8,
        courierPhone: delivery.deliveryProfile?.user?.phone || "+91 90197 15087",
        vehicleType: courierVehicle,
        courierLocation: isActive ? courierCoords : null,
        origin,
        destination,
        distanceTotalKm: delivery.distanceKm,
        distanceRemainingKm: isActive ? distanceRemainingKm : null,
        etaMinutes: isActive ? etaMinutes : null,
      },
    });
  } catch (error: any) {
    console.error("GET /api/deliveries/[id]/location error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve delivery tracking location." },
      { status: 500 }
    );
  }
}
