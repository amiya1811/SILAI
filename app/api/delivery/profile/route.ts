import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

function formatDeliveryProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.user?.fullName || "Delivery Partner",
    phone: profile.user?.phone || "",
    avatarUrl: profile.user?.avatarUrl || "",
    vehicleType: profile.vehicleType || "Two-Wheeler",
    licenseNumber: profile.licenseNumber || "",
    currentCity: profile.currentCity || "Delhi NCR",
    isOnline: profile.isOnline ?? true,
    totalDeliveries: profile.totalDeliveries || 0,
    rating: profile.rating || 4.9,
    earningsToday: 0,
    earningsTotal: profile.earningsTotal || 0,
  };
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let profile = await prisma.deliveryProfile.findUnique({
      where: { userId: auth.user.id },
      include: { user: true },
    });

    if (!profile) {
      profile = await prisma.deliveryProfile.create({
        data: {
          userId: auth.user.id,
          vehicleType: "Two-Wheeler",
          currentCity: "Delhi NCR",
          isOnline: true,
        },
        include: { user: true },
      });
    }

    return NextResponse.json({
      success: true,
      profile: formatDeliveryProfile(profile),
    });
  } catch (error: any) {
    console.error("GET /api/delivery/profile error:", error);
    return NextResponse.json({ error: "Failed to load delivery profile" }, { status: 500 });
  }
}

async function handleUpdate(request: NextRequest) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { vehicleType, licenseNumber, currentCity, isOnline, phone } = body;

    if (phone) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { phone },
      });
    }

    const updated = await prisma.deliveryProfile.upsert({
      where: { userId: auth.user.id },
      update: {
        ...(vehicleType !== undefined ? { vehicleType } : {}),
        ...(licenseNumber !== undefined ? { licenseNumber } : {}),
        ...(currentCity !== undefined ? { currentCity } : {}),
        ...(isOnline !== undefined ? { isOnline } : {}),
      },
      create: {
        userId: auth.user.id,
        vehicleType: vehicleType || "Two-Wheeler",
        licenseNumber: licenseNumber || null,
        currentCity: currentCity || "Delhi NCR",
        isOnline: isOnline ?? true,
      },
      include: { user: true },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery partner profile updated successfully.",
      profile: formatDeliveryProfile(updated),
    });
  } catch (error: any) {
    console.error("Update delivery profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

export async function POST(request: NextRequest) {
  return handleUpdate(request);
}
