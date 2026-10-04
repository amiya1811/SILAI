import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

function formatCustomerProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.user?.fullName || "",
    email: profile.user?.email || "",
    phone: profile.user?.phone || "",
    avatarUrl: profile.user?.avatarUrl || "",
    address: profile.addressLine1 || "",
    addressLine1: profile.addressLine1 || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.city || "Delhi NCR",
    area: profile.addressLine2 || profile.city || "",
    postalCode: profile.postalCode || "",
    preferredLanguage: profile.preferredLanguage || "English",
    membershipTier: profile.membership?.tier || "FREE",
    membershipActive: profile.membership?.isActive || false,
    fitProfileChoice: "SAVED",
  };
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let profile = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
      include: {
        user: true,
        membership: true,
      },
    });

    if (!profile) {
      profile = await prisma.customerProfile.create({
        data: {
          userId: auth.user.id,
          city: "Delhi NCR",
          preferredLanguage: "English",
        },
        include: {
          user: true,
          membership: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: formatCustomerProfile(profile),
    });
  } catch (error: any) {
    console.error("GET /api/customer/profile error:", error);
    return NextResponse.json({ error: "Failed to load customer profile" }, { status: 500 });
  }
}

async function handleUpdate(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      avatarUrl,
      address,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      preferredLanguage,
    } = body;

    const resolvedAddress1 = addressLine1 || address;

    // Update user info if provided
    if (fullName || phone !== undefined || avatarUrl) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          ...(fullName ? { fullName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
        },
      });
    }

    // Upsert customer profile
    const profile = await prisma.customerProfile.upsert({
      where: { userId: auth.user.id },
      update: {
        ...(resolvedAddress1 !== undefined ? { addressLine1: resolvedAddress1 } : {}),
        ...(addressLine2 !== undefined ? { addressLine2 } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(postalCode !== undefined ? { postalCode } : {}),
        ...(preferredLanguage !== undefined ? { preferredLanguage } : {}),
      },
      create: {
        userId: auth.user.id,
        addressLine1: resolvedAddress1 || null,
        addressLine2: addressLine2 || null,
        city: city || "Delhi NCR",
        postalCode: postalCode || null,
        preferredLanguage: preferredLanguage || "English",
      },
      include: {
        user: true,
        membership: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer profile and measurements updated successfully.",
      profile: formatCustomerProfile(profile),
    });
  } catch (error: any) {
    console.error("Update customer profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

export async function POST(request: NextRequest) {
  return handleUpdate(request);
}
