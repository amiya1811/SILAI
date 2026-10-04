import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        customer: { include: { user: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customer.userId !== auth.user.id && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { reason, details } = body;

    if (!reason || !details) {
      return NextResponse.json(
        { error: "Please specify the issue type and explanation." },
        { status: 400 }
      );
    }

    // Log the reported issue to AuditLog & Notification in PostgreSQL
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "ORDER_ISSUE_REPORTED",
          resource: "Order",
          resourceId: order.id,
          payload: JSON.stringify({ reason, details, reportedAt: new Date().toISOString() }),
        },
      });

      await tx.notification.create({
        data: {
          userId: auth.user.id,
          title: "Order Issue Received",
          message: `Concierge support ticket raised for ${order.orderNumber}: ${reason}.`,
          type: "ORDER_STATUS",
          actionUrl: `/orders/${order.id}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Issue reported successfully. A concierge specialist has been assigned to assist you.",
      order,
    });
  } catch (error: any) {
    console.error("POST /api/orders/[id]/issue error:", error);
    return NextResponse.json({ error: "Failed to report issue" }, { status: 500 });
  }
}
