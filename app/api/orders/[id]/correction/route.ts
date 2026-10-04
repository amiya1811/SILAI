import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";

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
        tailor: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customer.userId !== auth.user.id && auth.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only request corrections for your own orders." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notes, reason } = body;

    if (!notes || notes.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide detailed notes for what needs correction." },
        { status: 400 }
      );
    }

    const fullCorrectionNote = `[${reason || "Fit Issue"}] ${notes.trim()}`;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CORRECTION_REQUESTED,
          correctionNotes: fullCorrectionNote,
        },
        include: {
          customer: { include: { user: true } },
          tailor: true,
          orderItems: true,
        },
      });

      // Schedule free correction pickup delivery job
      await tx.delivery.create({
        data: {
          orderId: order.id,
          type: DeliveryType.CORRECTION_PICKUP,
          status: DeliveryStatus.ASSIGNED,
          pickupAddressMasked: order.deliveryAddress,
          dropAddressMasked: order.tailor.businessName,
          distanceKm: 4.2,
          payoutAmount: 90.0,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Correction request registered. Doorstep pickup for alteration has been scheduled.",
      order: updated,
    });
  } catch (error: any) {
    console.error("POST /api/orders/[id]/correction error:", error);
    return NextResponse.json({ error: "Failed to submit correction request" }, { status: 500 });
  }
}
