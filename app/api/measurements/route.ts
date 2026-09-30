import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";
import { MeasurementProfileSchema } from "@/lib/validations/schemas";

// GET /api/measurements - Retrieve own measurement profiles
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const measurements = store.getMeasurements(auth.user.id);
  return NextResponse.json({ success: true, measurements });
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

    const newProfile = store.saveMeasurement({
      customerId: auth.user.id,
      profileName: parsed.data.profileName,
      garmentType: parsed.data.garmentType,
      type: parsed.data.type,
      measurements: parsed.data.measurements,
      isDefault: parsed.data.isDefault || false,
    });

    return NextResponse.json({ success: true, profile: newProfile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to save measurement profile" }, { status: 500 });
  }
}
