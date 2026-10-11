import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error: any) {
    console.error("GET /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved addresses." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      customer = await prisma.customerProfile.create({
        data: {
          userId: auth.user.id,
          city: "Bengaluru",
        },
      });
    }

    const body = await request.json();
    const {
      label = "Home",
      fullName,
      phone,
      houseBuilding,
      street,
      areaLocality,
      city = "Bengaluru",
      state = "Karnataka",
      postalCode,
      landmark,
      deliveryInstructions,
      formattedAddress,
      latitude,
      longitude,
      placeId,
      isDefault = false,
    } = body;

    if (!formattedAddress || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Address and precise coordinates (latitude & longitude) are required." },
        { status: 400 }
      );
    }

    // Check count of existing addresses
    const count = await prisma.customerAddress.count({
      where: { customerId: customer.id },
    });

    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        label,
        fullName: fullName || auth.user.fullName,
        phone: phone || auth.user.phone,
        houseBuilding,
        street,
        areaLocality,
        city,
        state,
        postalCode,
        landmark,
        deliveryInstructions,
        formattedAddress,
        latitude,
        longitude,
        placeId,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({
      success: true,
      address: newAddress,
    });
  } catch (error: any) {
    console.error("POST /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to save address." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, isDefault, ...otherFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.customerAddress.update({
      where: { id, customerId: customer.id },
      data: {
        ...otherFields,
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error("PATCH /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to update address." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    await prisma.customerAddress.delete({
      where: { id, customerId: customer.id },
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/customer/addresses error:", error);
    return NextResponse.json(
      { error: "Failed to delete address." },
      { status: 500 }
    );
  }
}
