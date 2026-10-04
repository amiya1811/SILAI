import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ["ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [orders, tailors, deliveries, auditLogs, offers] = await Promise.all([
      prisma.order.findMany({
        include: {
          customer: { include: { user: true } },
          tailor: true,
          orderItems: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tailorProfile.findMany({
        include: {
          menuItems: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.delivery.findMany({
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.offer.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Metrics calculation
    const totalGMV = orders
      .filter((o) => o?.status !== "CANCELLED" && o?.status !== "PENDING_PAYMENT")
      .reduce((sum, o) => sum + (o?.finalPayableAmount || 0), 0);

    const totalPlatformRevenue = orders
      .filter((o) => o?.status !== "CANCELLED" && o?.status !== "PENDING_PAYMENT")
      .reduce((sum, o) => sum + (o?.platformCommission || 0), 0);

    const activeOrders = orders.filter(
      (o) => o?.status !== "DELIVERED" && o?.status !== "COMPLETED" && o?.status !== "CANCELLED"
    ).length;

    const activeDeliveries = deliveries.filter((d) => d?.status !== "DELIVERED").length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalGMV,
        totalPlatformRevenue,
        activeOrders,
        totalOrders: orders.length,
        totalTailors: tailors.length,
        activeDeliveries,
      },
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || "SIL-ORDER",
        customerName: o.customer?.user?.fullName || "Customer",
        tailorName: o.tailor?.businessName || "Tailor",
        garmentName: o.orderItems?.[0]?.garmentName || "Custom Stitching",
        status: o.status,
        finalPayableAmount: o.finalPayableAmount || 0,
        platformCommission: o.platformCommission || 0,
        createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
      })),
      tailors: tailors.map((t) => ({
        id: t.id,
        businessName: t.businessName || "Tailor Studio",
        city: t.city || "Bangalore",
        availability: t.availability || "AVAILABLE",
        rating: t.rating ?? 4.8,
        reviewCount: t.reviewCount ?? 0,
        menuItems: t.menuItems || [],
      })),
      deliveries: deliveries.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        type: d.type,
        status: d.status,
        distanceKm: d.distanceKm,
        payoutAmount: d.payoutAmount,
        createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
      })),
      auditLogs,
      offers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/metrics error:", error);
    return NextResponse.json({ error: "Failed to retrieve platform metrics" }, { status: 500 });
  }
}
