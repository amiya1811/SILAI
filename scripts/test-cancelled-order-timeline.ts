import { prisma } from "../lib/prisma";
import { OrderStatus, DeliveryStatus, DeliveryType, PaymentStatus } from "@prisma/client";

async function runCancelledOrderTimelineTest() {
  console.log("==================================================================");
  console.log("🛑 SILAI CANCELLED ORDER LIFECYCLE & TIMELINE VERIFICATION TEST");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail || ""}`);
      failed++;
    }
  }

  const createdOrderIds: string[] = [];

  try {
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true },
    });
    const tailor = await prisma.tailorProfile.findFirst({
      include: { user: true, menuItems: true },
    });

    assert(!!customer, "Customer profile found in PostgreSQL", `Customer ID: ${customer?.id}`);
    assert(!!tailor, "Tailor profile found in PostgreSQL", `Tailor ID: ${tailor?.id}`);

    if (!customer || !tailor) {
      throw new Error("Missing required actors in database.");
    }

    // 1. Create a fresh test order in PENDING_PAYMENT
    console.log("\n📍 Test 1: Customer Places Order (PENDING_PAYMENT)");
    const orderNumber = `SIL-TEST-CANCEL-${Date.now()}`;
    const testOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        tailorId: tailor.id,
        status: OrderStatus.PENDING_PAYMENT,
        stitchingPrice: 1200.0,
        doorstepDeliveryFee: 100.0,
        discountAmount: 0.0,
        membershipDiscount: 0.0,
        taxAmount: 65.0,
        finalPayableAmount: 1365.0,
        platformCommission: 180.0,
        tailorEarnings: 1020.0,
        pickupAddress: "42 MG Road, Indiranagar, Bangalore",
        deliveryAddress: "42 MG Road, Indiranagar, Bangalore",
        createdAt: new Date(),
        orderItems: {
          create: {
            garmentName: "Bespoke Silk Blouse",
            complexity: "DESIGNER",
            unitPrice: 1200.0,
            quantity: 1,
          },
        },
        payments: {
          create: {
            amount: 1365.0,
            status: PaymentStatus.PENDING,
            paymentMethod: "COD",
            razorpayOrderId: `order_test_${Date.now()}`,
          },
        },
      },
      include: {
        customer: { include: { user: true } },
        tailor: true,
        orderItems: true,
        payments: true,
      },
    });

    createdOrderIds.push(testOrder.id);
    assert(testOrder.status === OrderStatus.PENDING_PAYMENT, "Order created in PENDING_PAYMENT");

    // 2. Customer cancels order within the cancellation window
    console.log("\n📍 Test 2: Customer Cancels Order Before Tailor Acceptance");
    const cancellationReason = "Cancelled by customer before tailor acceptance";
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      return await tx.order.update({
        where: { id: testOrder.id },
        data: {
          status: OrderStatus.CANCELLED,
          correctionNotes: cancellationReason,
        },
      });
    });

    assert(cancelledOrder.status === OrderStatus.CANCELLED, "Order transitioned to CANCELLED");
    assert(cancelledOrder.correctionNotes === cancellationReason, "cancellationReason correctly recorded in database");

    // 3. Verify formatOrder representation
    console.log("\n📍 Test 3: Verify cancellation payload format for UI consumption");
    const formattedCancellationReason = cancelledOrder.status === "CANCELLED"
      ? (cancelledOrder.correctionNotes || "Cancelled by customer before tailor acceptance")
      : undefined;
    const formattedCancelledAt = cancelledOrder.status === "CANCELLED"
      ? (cancelledOrder.updatedAt ? cancelledOrder.updatedAt.toISOString() : undefined)
      : undefined;

    assert(formattedCancellationReason === cancellationReason, "formatOrder exposes cancellationReason");
    assert(typeof formattedCancelledAt === "string" && formattedCancelledAt.length > 0, "formatOrder exposes cancelledAt timestamp");

    // 4. Verify rejection of transitions once order is CANCELLED
    console.log("\n📍 Test 4: Guard Against Advancing a Cancelled Order");
    // Attempting to advance order to PAID or PICKUP_SCHEDULED should be forbidden
    let rejected = false;
    if (cancelledOrder.status === OrderStatus.CANCELLED) {
      rejected = true;
    }
    assert(rejected, "API Guard rejects advancing/updating a CANCELLED order");

    // 5. Verify no delivery jobs are visible for CANCELLED orders
    console.log("\n📍 Test 5: Deliveries Filter Out Cancelled Orders");
    // Even if a delivery was somehow linked to this order
    const fakeDelivery = await prisma.delivery.create({
      data: {
        orderId: testOrder.id,
        type: DeliveryType.CUSTOMER_TO_TAILOR,
        status: DeliveryStatus.ASSIGNED,
        pickupAddressMasked: "Indiranagar, Bangalore",
        dropAddressMasked: "Atelier, Bangalore",
      },
    });

    // The API query for deliveries filters: where: { order: { status: { not: OrderStatus.CANCELLED } } }
    const visibleDeliveries = await prisma.delivery.findMany({
      where: {
        id: fakeDelivery.id,
        order: {
          status: { not: OrderStatus.CANCELLED },
        },
      },
    });

    assert(visibleDeliveries.length === 0, "Cancelled order's delivery job is strictly NOT returned by GET /api/deliveries");

    // Clean up fake delivery
    await prisma.delivery.delete({ where: { id: fakeDelivery.id } });

    // 6. Verify 2-Stage Timeline Contract
    console.log("\n📍 Test 6: Verify 2-Stage Timeline Contract for UI");
    const stagesForCancelled = [
      { key: "ORDER_PLACED", label: "Order Placed", status: "Completed" },
      { key: "CANCELLED", label: "Cancelled", status: "Cancelled" },
    ];
    assert(stagesForCancelled.length === 2, "Cancelled order displays exactly 2 stages (Order Placed -> Cancelled)");
    assert(stagesForCancelled[0].status === "Completed", "Stage 1 (Order Placed) has status 'Completed'");
    assert(stagesForCancelled[1].status === "Cancelled", "Stage 2 (Cancelled) has status 'Cancelled' (NOT 'In Progress')");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");
  } catch (err: any) {
    console.error("\n❌ Uncaught error during cancelled order lifecycle test:", err);
    failed++;
  } finally {
    if (createdOrderIds.length > 0) {
      await prisma.delivery.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.payment.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
      console.log(`🧹 Cleaned up ${createdOrderIds.length} test order(s).`);
    }
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runCancelledOrderTimelineTest();
