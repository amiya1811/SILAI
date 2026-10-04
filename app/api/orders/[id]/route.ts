import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";

function formatOrder(o: any) {
  const primaryItem = o.orderItems?.[0];
  const primaryPayment = o.payments?.[0];
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerId: o.customer?.userId || o.customerId,
    customerName: o.customer?.user?.fullName || "Customer",
    customerPhone: o.customer?.user?.phone || "",
    tailorId: o.tailorId,
    tailorName: o.tailor?.businessName || "Tailor",
    tailorAddress: o.tailor?.address || "",
    garmentName: primaryItem?.garmentName || "Custom Garment",
    garmentCategory: primaryItem?.complexity || "CUSTOM",
    measurementType: o.measurementProfile?.type || "SAVED",
    status: o.status,
    paymentMethod: primaryPayment?.paymentMethod || "COD",
    paymentStatus: primaryPayment?.status || "PENDING",
    stitchingPrice: o.stitchingPrice,
    doorstepDeliveryFee: o.doorstepDeliveryFee,
    discountAmount: o.discountAmount,
    membershipDiscount: o.membershipDiscount,
    taxAmount: o.taxAmount,
    finalPayableAmount: o.finalPayableAmount,
    platformCommission: o.platformCommission,
    tailorEarnings: o.tailorEarnings,
    pickupAddress: o.pickupAddress || "",
    deliveryAddress: o.deliveryAddress || "",
    pickupScheduledAt: o.pickupScheduledAt ? o.pickupScheduledAt.toISOString() : undefined,
    expectedDeliveryDate: o.expectedDeliveryDate ? o.expectedDeliveryDate.toISOString() : undefined,
    deliveryOtp: o.deliveryOtp || "",
    cancellationDeadline: new Date((o.createdAt ? new Date(o.createdAt).getTime() : Date.now()) + 2 * 60 * 1000).toISOString(),
    canCancel: (o.status === "PENDING_PAYMENT" || o.status === "DRAFT") && Date.now() <= (o.createdAt ? new Date(o.createdAt).getTime() : Date.now()) + 2 * 60 * 1000 + 2000,
    correctionNotes: o.correctionNotes || "",
    finishedGarmentPhoto: o.finishedGarmentPhoto || "",
    createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? o.updatedAt.toISOString() : new Date().toISOString(),
    design: o.design || null,
    measurementProfile: o.measurementProfile || null,
    orderItems: o.orderItems || [],
  };
}

// GET /api/orders/[id] - Get order details
export async function GET(
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
        customer: {
          include: { user: true },
        },
        tailor: true,
        orderItems: true,
        deliveries: true,
        review: true,
        measurementProfile: true,
        design: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check
    const isCustomer = order.customer.userId === auth.user.id;
    const isTailor = order.tailor.userId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";
    const isDelivery = auth.user.role === "DELIVERY_PARTNER";

    if (!isCustomer && !isTailor && !isAdmin && !isDelivery) {
      return NextResponse.json({ error: "Access denied to this order." }, { status: 403 });
    }

    return NextResponse.json({ success: true, order: formatOrder(order) });
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to retrieve order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Update status
export async function PATCH(
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
        tailor: true,
        customer: { include: { user: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isCustomer = order.customer.userId === auth.user.id;
    const isTailor = order.tailor.userId === auth.user.id;
    const isAdmin = auth.user.role === "ADMIN";

    const body = await request.json();
    const { status, finishedGarmentPhoto, correctionNotes } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const targetStatus = status as OrderStatus;

    if (isCustomer) {
      // Customer is only allowed to request correction after delivery, or cancel before processing
      if (targetStatus === OrderStatus.CORRECTION_REQUESTED) {
        if (order.status !== OrderStatus.DELIVERED) {
          return NextResponse.json(
            { error: "Corrections can only be requested after the garment has been delivered." },
            { status: 400 }
          );
        }
      } else if (targetStatus === OrderStatus.CANCELLED) {
        if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.DRAFT) {
          return NextResponse.json(
            { error: "Order can only be cancelled while pending tailor confirmation." },
            { status: 400 }
          );
        }
        const orderCreatedAtMs = new Date(order.createdAt).getTime();
        const nowMs = Date.now();
        const twoMinutesWithBuffer = 2 * 60 * 1000 + 2000;
        if (nowMs - orderCreatedAtMs > twoMinutesWithBuffer) {
          return NextResponse.json(
            { error: "Cancellation window expired. Order is now being processed by the tailor." },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Customers can only request corrections or cancel unstarted orders within the 2-minute window." },
          { status: 403 }
        );
      }
    } else if (!isTailor && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. Only the assigned tailor or admin can modify order status." },
        { status: 403 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const orderRes = await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          ...(finishedGarmentPhoto ? { finishedGarmentPhoto } : {}),
          ...(correctionNotes ? { correctionNotes } : {}),
        },
        include: {
          customer: { include: { user: true } },
          tailor: true,
          orderItems: true,
        },
      });

      // Cancellation Notifications
      if (targetStatus === OrderStatus.CANCELLED) {
        if (isCustomer) {
          await tx.notification.create({
            data: {
              userId: order.customer.userId,
              title: "Order Cancelled",
              message: `Order #${order.orderNumber} has been cancelled successfully.`,
              type: "ORDER_STATUS",
            },
          });
          if (order.tailor.userId) {
            await tx.notification.create({
              data: {
                userId: order.tailor.userId,
                title: "Order Cancelled by Customer",
                message: `Order #${order.orderNumber} was cancelled by the customer within the 2-minute window.`,
                type: "ORDER_STATUS",
              },
            });
          }
        } else {
          await tx.notification.create({
            data: {
              userId: order.customer.userId,
              title: "Order Cancelled",
              message: `Tailor was unable to accept your order #${order.orderNumber}. Order has been cancelled.`,
              type: "ORDER_STATUS",
            },
          });
        }
      }

      // Tailor Accepts Order -> Transition to PICKUP_SCHEDULED and Spawn LEG 1 Delivery Job
      if (targetStatus === OrderStatus.PICKUP_SCHEDULED) {
        const existingLeg1 = await tx.delivery.findFirst({
          where: {
            orderId: order.id,
            type: DeliveryType.CUSTOMER_TO_TAILOR,
          },
        });

        if (!existingLeg1) {
          await tx.delivery.create({
            data: {
              orderId: order.id,
              type: DeliveryType.CUSTOMER_TO_TAILOR,
              status: DeliveryStatus.ASSIGNED,
              pickupAddressMasked: order.pickupAddress || "Customer Address",
              dropAddressMasked: order.tailor.address || order.tailor.businessName,
              distanceKm: 4.2,
              payoutAmount: 80.0,
            },
          });
        }

        await tx.notification.create({
          data: {
            userId: order.customer.userId,
            title: "Order Accepted",
            message: `Tailor ${order.tailor.businessName} has accepted your order #${order.orderNumber}! Fabric pickup is being scheduled.`,
            type: "ORDER_STATUS",
          },
        });

        if (order.tailor.userId) {
          await tx.notification.create({
            data: {
              userId: order.tailor.userId,
              title: "Order Accepted",
              message: `You accepted order #${order.orderNumber}. Leg 1 fabric pickup job created.`,
              type: "ORDER_STATUS",
            },
          });
        }
      }

      // Tailor Starts Stitching
      if (targetStatus === OrderStatus.STITCHING) {
        await tx.notification.create({
          data: {
            userId: order.customer.userId,
            title: "Stitching Started",
            message: `Your tailor has started stitching your garment for order #${order.orderNumber}.`,
            type: "ORDER_STATUS",
          },
        });
      }

      // If customer requested a correction, create a CORRECTION_PICKUP delivery job
      if (targetStatus === OrderStatus.CORRECTION_REQUESTED) {
        const existingCorrectionJob = await tx.delivery.findFirst({
          where: {
            orderId: order.id,
            type: DeliveryType.CORRECTION_PICKUP,
          },
        });

        if (!existingCorrectionJob) {
          await tx.delivery.create({
            data: {
              orderId: order.id,
              type: DeliveryType.CORRECTION_PICKUP,
              status: DeliveryStatus.ASSIGNED,
              pickupAddressMasked: order.deliveryAddress,
              dropAddressMasked: order.tailor.address || order.tailor.businessName,
              distanceKm: 4.5,
              payoutAmount: 110.0,
            },
          });
        }
      }

      // If garment is READY, create TAILOR_TO_CUSTOMER (LEG 2) or CORRECTION_RETURN delivery job
      if (targetStatus === OrderStatus.READY) {
        const isCorrectionFlow =
          order.status === OrderStatus.CORRECTION_REQUESTED ||
          order.status === OrderStatus.CORRECTION_WITH_TAILOR ||
          order.status === OrderStatus.CORRECTION_IN_PROGRESS;

        const deliveryType = isCorrectionFlow
          ? DeliveryType.CORRECTION_RETURN
          : DeliveryType.TAILOR_TO_CUSTOMER;

        const existingOutbound = await tx.delivery.findFirst({
          where: {
            orderId: order.id,
            type: deliveryType,
          },
        });

        if (!existingOutbound) {
          await tx.delivery.create({
            data: {
              orderId: order.id,
              type: deliveryType,
              status: DeliveryStatus.ASSIGNED,
              pickupAddressMasked: order.tailor.address || order.tailor.businessName,
              dropAddressMasked: order.deliveryAddress || "Customer Address",
              distanceKm: 4.5,
              payoutAmount: 110.0,
            },
          });
        }

        await tx.notification.create({
          data: {
            userId: order.customer.userId,
            title: "Outfit Ready",
            message: `Your garment for order #${order.orderNumber} is ready! Quality inspection completed. Delivery partner will be assigned soon.`,
            type: "ORDER_STATUS",
          },
        });
      }

      return orderRes;
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json({ success: true, order: formatOrder(updated) });
  } catch (error: any) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
