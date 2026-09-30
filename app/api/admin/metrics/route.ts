import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const orders = store.getOrders();
  const tailors = store.getTailors();
  const deliveries = store.getDeliveryJobs();
  const auditLogs = store.getAuditLogs();
  const offers = store.getOffers();

  // Metrics calculation
  const totalGMV = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING_PAYMENT")
    .reduce((sum, o) => sum + o.finalPayableAmount, 0);

  const totalPlatformRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "PENDING_PAYMENT")
    .reduce((sum, o) => sum + o.platformCommission, 0);

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "COMPLETED" && o.status !== "CANCELLED"
  ).length;

  return NextResponse.json({
    success: true,
    metrics: {
      totalGMV,
      totalPlatformRevenue,
      activeOrders,
      totalOrders: orders.length,
      totalTailors: tailors.length,
      activeDeliveries: deliveries.filter((d) => d.status !== "DELIVERED").length,
    },
    orders,
    tailors,
    deliveries,
    auditLogs,
    offers,
  });
}
