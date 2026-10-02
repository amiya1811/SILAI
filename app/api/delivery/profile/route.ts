import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const profile = store.getDeliveryProfile(auth.user.id);
  return NextResponse.json({ success: true, profile });
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const updated = store.updateDeliveryProfile(auth.user.id, body);

  return NextResponse.json({
    success: true,
    message: "Delivery partner profile updated successfully.",
    profile: updated,
  });
}
