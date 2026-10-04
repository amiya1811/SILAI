import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { MeasurementProfileSchema } from "@/lib/validations/schemas";

function formatMeasurement(m: any) {
  let meta: any = {};
  let measurementsObj: any = {};
  try {
    const parsed = typeof m.measurementsJson === "string" ? JSON.parse(m.measurementsJson) : m.measurementsJson;
    if (parsed && typeof parsed === "object") {
      if (parsed.measurements && typeof parsed.measurements === "object") {
        measurementsObj = parsed.measurements;
        meta = parsed;
      } else {
        measurementsObj = parsed;
      }
    }
  } catch (e) {
    measurementsObj = {};
  }

  return {
    id: m.id,
    customerId: m.customerId,
    profileName: m.profileName,
    garmentType: m.garmentType,
    customGarmentName: meta.customGarmentName || undefined,
    customDescription: meta.customDescription || undefined,
    unit: meta.unit || "in",
    type: m.type,
    isDefault: m.isDefault,
    notes: m.notes || meta.notes || undefined,
    referenceImageUrl: meta.referenceImageUrl || undefined,
    measurements: measurementsObj,
    customFields: meta.customFields || undefined,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt ? m.updatedAt.toISOString() : undefined,
  };
}

// GET /api/measurements - Retrieve own measurement profiles
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
      return NextResponse.json({ success: true, measurements: [] });
    }

    const measurements = await prisma.measurementProfile.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      measurements: measurements.map(formatMeasurement),
    });
  } catch (error: any) {
    console.error("GET /api/measurements error:", error);
    return NextResponse.json({ error: "Failed to retrieve measurements" }, { status: 500 });
  }
}

// POST /api/measurements - Save new garment measurement profile
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const parsed = MeasurementProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    let customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      customer = await prisma.customerProfile.create({
        data: {
          userId: auth.user.id,
          city: "Delhi NCR",
          preferredLanguage: "English",
        },
      });
    }

    const {
      profileName,
      garmentType,
      customGarmentName,
      customDescription,
      unit,
      type,
      measurements,
      customFields,
      notes,
      referenceImageUrl,
      isDefault,
    } = parsed.data;

    // Validation for custom garments
    if (garmentType === "Custom" && (!customGarmentName || !customGarmentName.trim())) {
      return NextResponse.json({ error: "Garment Name is required for custom garments" }, { status: 400 });
    }

    // Structure measurements JSON with unit, custom garment metadata, and field values
    const structuredPayload = {
      unit: unit || "in",
      customGarmentName: customGarmentName?.trim() || undefined,
      customDescription: customDescription?.trim() || undefined,
      notes: notes?.trim() || undefined,
      referenceImageUrl: referenceImageUrl || undefined,
      measurements: measurements || {},
      customFields: customFields || undefined,
    };

    const newProfile = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        // Unmark previous default profiles for this customer & garmentType
        await tx.measurementProfile.updateMany({
          where: { customerId: customer.id, garmentType },
          data: { isDefault: false },
        });
      }

      return tx.measurementProfile.create({
        data: {
          customerId: customer.id,
          profileName: profileName.trim(),
          garmentType,
          type: type || "SAVED",
          measurementsJson: JSON.stringify(structuredPayload),
          notes: notes?.trim() || null,
          isDefault: isDefault ?? false,
        },
      });
    });

    return NextResponse.json({
      success: true,
      profile: formatMeasurement(newProfile),
    }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/measurements error:", err);
    return NextResponse.json({ error: "Failed to save measurement profile" }, { status: 500 });
  }
}

// DELETE /api/measurements - Delete a measurement profile (requires ownership)
export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: auth.user.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    const existing = await prisma.measurementProfile.findUnique({
      where: { id },
    });

    if (!existing || (existing.customerId !== customer.id && auth.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized: Profile not found or not owned by you" }, { status: 403 });
    }

    await prisma.measurementProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Measurement profile deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/measurements error:", error);
    return NextResponse.json({ error: "Failed to delete measurement profile" }, { status: 500 });
  }
}
