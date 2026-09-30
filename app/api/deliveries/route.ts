import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const jobs = store.getDeliveryJobs();
  return NextResponse.json({ success: true, deliveries: jobs });
}
