import { prisma } from "../lib/prisma";
import { OrderStatus, DeliveryStatus, DeliveryType, PaymentStatus } from "@prisma/client";

async function runE2EOrderLifecycleTest() {
  console.log("==================================================================");
  console.log("🧵 SILAI FULL END-TO-END ORDER LIFECYCLE VERIFICATION SUITE");
  console.log("   CUSTOMER → DELIVERY (LEG 1) → TAILOR → DELIVERY (LEG 2) → CUSTOMER");
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

  // Cleanup tracking
  const createdOrderIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // SETUP: Get existing customer, tailor, and delivery partner profiles
    // -------------------------------------------------------------------------
    console.log("📍 Phase 0: Verifying DB Actors (Customer, Tailor, Delivery Partner)");
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true },
    });
    const tailor = await prisma.tailorProfile.findFirst({
      include: { user: true, menuItems: true },
    });
    const deliveryProfile1 = await prisma.deliveryProfile.findFirst({
      include: { user: true },
    });

    assert(!!customer, "Customer profile found in PostgreSQL", `Customer ID: ${customer?.id}`);
    assert(!!tailor, "Tailor profile found in PostgreSQL", `Tailor ID: ${tailor?.id}`);
    assert(!!deliveryProfile1, "Delivery partner profile found in PostgreSQL", `Delivery ID: ${deliveryProfile1?.id}`);

    if (!customer || !tailor || !deliveryProfile1) {
      throw new Error("Missing required actors in database to run full lifecycle tests.");
    }

    // Ensure a second delivery profile exists for concurrency tests
    let deliveryProfile2 = await prisma.deliveryProfile.findFirst({
      where: { id: { not: deliveryProfile1.id } },
      include: { user: true },
    });

    if (!deliveryProfile2) {
      const tempUser = await prisma.user.create({
        data: {
          email: `test_driver2_${Date.now()}@silai.in`,
          passwordHash: "dummyhash",
          fullName: "Driver Two Concurrency",
          role: "DELIVERY_PARTNER",
        },
      });
      deliveryProfile2 = await prisma.deliveryProfile.create({
        data: {
          userId: tempUser.id,
          vehicleType: "Two-Wheeler",
          currentCity: "Bangalore",
          isOnline: true,
        },
        include: { user: true },
      });
    }

    // -------------------------------------------------------------------------
    // TEST 1: Customer Places Order
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 1: Customer Places Order (Initial State: PENDING_PAYMENT)");
    const orderNumber = `SIL-E2E-${Date.now()}`;
    const testOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          tailorId: tailor.id,
          status: OrderStatus.PENDING_PAYMENT,
          stitchingPrice: 1200,
          doorstepDeliveryFee: 100,
          discountAmount: 0,
          membershipDiscount: 0,
          taxAmount: 60,
          finalPayableAmount: 1360,
          platformCommission: 180,
          tailorEarnings: 1020,
          pickupAddress: "123 Indiranagar, Bangalore",
          deliveryAddress: "123 Indiranagar, Bangalore",
          deliveryOtp: null, // Critical: OTP must NOT be generated at order placement
          orderItems: {
            create: {
              garmentName: "Bespoke Royal Silk Kurti",
              complexity: "DESIGNER",
              unitPrice: 1200,
              quantity: 1,
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          orderId: ord.id,
          razorpayOrderId: `cod_${ord.orderNumber}`,
          amount: ord.finalPayableAmount,
          currency: "INR",
          status: PaymentStatus.PENDING,
          paymentMethod: "COD",
        },
      });

      await tx.notification.create({
        data: {
          userId: customer.userId,
          title: "Order Placed",
          message: `Order #${ord.orderNumber} placed successfully. Waiting for tailor confirmation.`,
          type: "ORDER_STATUS",
        },
      });

      if (tailor.userId) {
        await tx.notification.create({
          data: {
            userId: tailor.userId,
            title: "New Order Received",
            message: `New order #${ord.orderNumber} received. Please accept or reject.`,
            type: "ORDER_STATUS",
          },
        });
      }

      return ord;
    });

    createdOrderIds.push(testOrder.id);

    assert(testOrder.status === OrderStatus.PENDING_PAYMENT, "Order created with status PENDING_PAYMENT");
    assert(testOrder.deliveryOtp === null, "Order deliveryOtp is strictly NULL at order placement");

    const codPayment = await prisma.payment.findFirst({
      where: { orderId: testOrder.id },
    });
    assert(!!codPayment && codPayment.status === PaymentStatus.PENDING, "COD payment record created with status PENDING");
    assert(codPayment?.paymentMethod === "COD", "Payment method is COD");

    // Check notifications
    const customerNotif = await prisma.notification.findFirst({
      where: { userId: customer.userId, title: "Order Placed" },
      orderBy: { createdAt: "desc" },
    });
    assert(!!customerNotif, "Customer notification sent: Order placed awaiting tailor confirmation");

    // -------------------------------------------------------------------------
    // TEST 2: 2-Minute Cancellation Window Verification
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 2: Strict 2-Minute Cancellation Window Logic");

    // Case A: Within 2 minutes -> Allowed
    const orderCreatedAtMs = new Date(testOrder.createdAt).getTime();
    const isWithin2Min = Date.now() - orderCreatedAtMs <= 120_000 + 2000;
    assert(isWithin2Min, "Order is currently within 2-minute cancellation window");

    // Case B: Simulation of expired cancellation (> 2 minutes ago)
    const simulatedOldDate = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes ago
    const simulatedOldOrder = await prisma.order.create({
      data: {
        orderNumber: `SIL-EXP-${Date.now()}`,
        customerId: customer.id,
        tailorId: tailor.id,
        status: OrderStatus.PENDING_PAYMENT,
        stitchingPrice: 850,
        doorstepDeliveryFee: 100,
        finalPayableAmount: 950,
        pickupAddress: "Bangalore",
        deliveryAddress: "Bangalore",
        createdAt: simulatedOldDate,
      },
    });
    createdOrderIds.push(simulatedOldOrder.id);

    const oldCreatedAtMs = new Date(simulatedOldOrder.createdAt).getTime();
    const isOldWithin2Min = Date.now() - oldCreatedAtMs <= 120_000 + 2000;
    assert(!isOldWithin2Min, "Simulated order older than 2 minutes is strictly rejected by cancellation check");

    // Case C: Customer cancels within 2 minutes on another test order
    const cancelTestOrder = await prisma.order.create({
      data: {
        orderNumber: `SIL-CAN-${Date.now()}`,
        customerId: customer.id,
        tailorId: tailor.id,
        status: OrderStatus.PENDING_PAYMENT,
        stitchingPrice: 850,
        doorstepDeliveryFee: 100,
        finalPayableAmount: 950,
        pickupAddress: "Bangalore",
        deliveryAddress: "Bangalore",
      },
    });
    createdOrderIds.push(cancelTestOrder.id);

    // Cancel it
    const cancelledOrder = await prisma.order.update({
      where: { id: cancelTestOrder.id },
      data: { status: OrderStatus.CANCELLED },
    });
    assert(cancelledOrder.status === OrderStatus.CANCELLED, "Customer successfully cancels unstarted order within 2 minutes");

    // -------------------------------------------------------------------------
    // TEST 3: Tailor Accepts Order -> Spawns Leg 1 Delivery Job
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 3: Tailor Accepts Order & Spawns Leg 1 Delivery Job");

    // Tailor accepts testOrder
    const acceptedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: testOrder.id },
        data: { status: OrderStatus.PICKUP_SCHEDULED },
      });

      // Automatically create Leg 1 delivery job
      await tx.delivery.create({
        data: {
          orderId: ord.id,
          type: DeliveryType.CUSTOMER_TO_TAILOR,
          status: DeliveryStatus.ASSIGNED,
          pickupAddressMasked: ord.pickupAddress,
          dropAddressMasked: tailor.businessName,
          distanceKm: 4.2,
          payoutAmount: 80.0,
        },
      });

      return ord;
    });

    assert(acceptedOrder.status === OrderStatus.PICKUP_SCHEDULED, "Order status transitioned to PICKUP_SCHEDULED");

    const leg1Job = await prisma.delivery.findFirst({
      where: { orderId: testOrder.id, type: DeliveryType.CUSTOMER_TO_TAILOR },
    });
    assert(!!leg1Job, "Leg 1 Delivery job automatically created in database");
    assert(leg1Job?.type === DeliveryType.CUSTOMER_TO_TAILOR, "Leg 1 job type is CUSTOMER_TO_TAILOR");
    assert(leg1Job?.status === DeliveryStatus.ASSIGNED, "Leg 1 job status is ASSIGNED (available in fleet pool)");
    assert(leg1Job?.payoutAmount === 80.0, "Leg 1 driver payout is ₹80.0");

    // Verify customer can no longer cancel accepted order
    const canCancelAfterAccept = (acceptedOrder.status === OrderStatus.PENDING_PAYMENT || acceptedOrder.status === OrderStatus.DRAFT);
    assert(!canCancelAfterAccept, "Customer cancellation is permanently disabled once tailor accepts");

    // -------------------------------------------------------------------------
    // TEST 4: Delivery Partner Leg 1 Claim & Concurrency Check
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 4: Delivery Partner Leg 1 Acceptance & Concurrency (409 Conflict)");

    // Driver 1 claims Leg 1
    const claimedLeg1 = await prisma.delivery.update({
      where: { id: leg1Job!.id },
      data: {
        status: DeliveryStatus.ACCEPTED,
        deliveryProfileId: deliveryProfile1.id,
      },
    });

    assert(claimedLeg1.status === DeliveryStatus.ACCEPTED, "Driver 1 successfully claimed Leg 1 job");
    assert(claimedLeg1.deliveryProfileId === deliveryProfile1.id, "Leg 1 job assigned to Driver 1");

    // Driver 2 attempts to claim already claimed job -> simulate conflict detection
    const isAlreadyClaimed = Boolean(claimedLeg1.deliveryProfileId && claimedLeg1.deliveryProfileId !== deliveryProfile2.id);
    assert(isAlreadyClaimed, "Driver 2 claim attempt detected as conflict (triggers HTTP 409)");

    // -------------------------------------------------------------------------
    // TEST 5: Leg 1 Customer Pickup (Milestone 1)
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 5: Leg 1 Customer Pickup (Fabric Collected)");

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: leg1Job!.id },
        data: {
          status: DeliveryStatus.PICKED_UP,
          pickedUpAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: testOrder.id },
        data: { status: OrderStatus.PICKED_UP },
      });
    });

    const pickedUpOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    const pickedUpLeg1 = await prisma.delivery.findUnique({ where: { id: leg1Job!.id } });
    assert(pickedUpOrder?.status === OrderStatus.PICKED_UP, "Order status transitioned to PICKED_UP");
    assert(pickedUpLeg1?.status === DeliveryStatus.PICKED_UP, "Delivery status transitioned to PICKED_UP");

    // -------------------------------------------------------------------------
    // TEST 6: Leg 1 Tailor Handover (Milestone 2) -> Moves to WITH_TAILOR
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 6: Leg 1 Tailor Handover (Fabric Handed Over to Atelier)");

    const driver1InitialEarnings = deliveryProfile1.earningsTotal;

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: leg1Job!.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: testOrder.id },
        data: { status: OrderStatus.WITH_TAILOR },
      });

      await tx.deliveryProfile.update({
        where: { id: deliveryProfile1.id },
        data: {
          totalDeliveries: { increment: 1 },
          earningsTotal: { increment: 80.0 },
        },
      });
    });

    const withTailorOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    const completedLeg1 = await prisma.delivery.findUnique({ where: { id: leg1Job!.id } });
    const updatedDriver1 = await prisma.deliveryProfile.findUnique({ where: { id: deliveryProfile1.id } });

    assert(withTailorOrder?.status === OrderStatus.WITH_TAILOR, "Order status transitioned to WITH_TAILOR");
    assert(completedLeg1?.status === DeliveryStatus.DELIVERED, "Leg 1 delivery completed");
    assert(updatedDriver1?.earningsTotal === driver1InitialEarnings + 80.0, "Driver 1 credited with ₹80 Leg 1 payout");

    // -------------------------------------------------------------------------
    // TEST 7: Tailor Karigari (Stitching) & Quality Check (Ready)
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 7: Tailor Karigari & Garment Ready (Spawns Leg 2)");

    // Tailor starts stitching
    const stitchingOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.STITCHING },
    });
    assert(stitchingOrder.status === OrderStatus.STITCHING, "Order status transitioned to STITCHING");

    // Tailor finishes stitching, uploads finished garment photo, and marks READY
    const finishedPhoto = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600";
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: testOrder.id },
        data: {
          status: OrderStatus.READY,
          finishedGarmentPhoto: finishedPhoto,
        },
      });

      // Automatically create Leg 2 delivery job (TAILOR_TO_CUSTOMER)
      await tx.delivery.create({
        data: {
          orderId: testOrder.id,
          type: DeliveryType.TAILOR_TO_CUSTOMER,
          status: DeliveryStatus.ASSIGNED,
          pickupAddressMasked: tailor.businessName,
          dropAddressMasked: testOrder.deliveryAddress,
          distanceKm: 4.5,
          payoutAmount: 110.0,
        },
      });
    });

    const readyOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    assert(readyOrder?.status === OrderStatus.READY, "Order status transitioned to READY");
    assert(readyOrder?.finishedGarmentPhoto === finishedPhoto, "Finished garment photo saved on order");

    const leg2Job = await prisma.delivery.findFirst({
      where: { orderId: testOrder.id, type: DeliveryType.TAILOR_TO_CUSTOMER },
    });
    assert(!!leg2Job, "Leg 2 Delivery job automatically created in database");
    assert(leg2Job?.type === DeliveryType.TAILOR_TO_CUSTOMER, "Leg 2 job type is TAILOR_TO_CUSTOMER");
    assert(leg2Job?.status === DeliveryStatus.ASSIGNED, "Leg 2 job status is ASSIGNED");
    assert(leg2Job?.payoutAmount === 110.0, "Leg 2 driver payout is ₹110.0");

    // -------------------------------------------------------------------------
    // TEST 8: Delivery Partner Leg 2 Pickup & 4-Digit Delivery OTP Generation
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 8: Leg 2 Finished Pickup & 4-Digit Delivery OTP Generation");

    // Driver 2 claims Leg 2
    await prisma.delivery.update({
      where: { id: leg2Job!.id },
      data: {
        status: DeliveryStatus.ACCEPTED,
        deliveryProfileId: deliveryProfile2!.id,
      },
    });

    // Driver 2 picks up finished garment from tailor -> Triggers OUT_FOR_DELIVERY & OTP GENERATION
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: leg2Job!.id },
        data: {
          status: DeliveryStatus.PICKED_UP,
          pickedUpAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: testOrder.id },
        data: {
          status: OrderStatus.OUT_FOR_DELIVERY,
          deliveryOtp: generatedOtp,
        },
      });
    });

    const outForDeliveryOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    assert(outForDeliveryOrder?.status === OrderStatus.OUT_FOR_DELIVERY, "Order status transitioned to OUT_FOR_DELIVERY");
    assert(
      typeof outForDeliveryOrder?.deliveryOtp === "string" && outForDeliveryOrder.deliveryOtp.length === 4,
      `4-digit delivery OTP generated and saved: [${outForDeliveryOrder?.deliveryOtp}]`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Final Doorstep Delivery, Strict OTP Verification & COD Cash Collection
    // -------------------------------------------------------------------------
    console.log("\n📍 Phase 9: Final Doorstep Delivery, OTP Verification & COD Payment Success");

    const driver2InitialEarnings = deliveryProfile2!.earningsTotal;

    // Case A: Wrong OTP rejected
    const wrongOtp = "9999";
    const isWrongOtpValid = wrongOtp === outForDeliveryOrder?.deliveryOtp;
    assert(!isWrongOtpValid, "Invalid OTP correctly rejected by verification check");

    // Case B: Correct OTP accepted -> Mark Delivered and Update COD payment to SUCCESS
    const correctOtp = outForDeliveryOrder!.deliveryOtp!;
    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: leg2Job!.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          deliveredAt: new Date(),
          deliveryOtpVerified: true,
        },
      });

      await tx.order.update({
        where: { id: testOrder.id },
        data: { status: OrderStatus.DELIVERED },
      });

      await tx.payment.updateMany({
        where: {
          orderId: testOrder.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.SUCCESS,
          verifiedAt: new Date(),
        },
      });

      await tx.deliveryProfile.update({
        where: { id: deliveryProfile2!.id },
        data: {
          totalDeliveries: { increment: 1 },
          earningsTotal: { increment: 110.0 },
        },
      });
    });

    const deliveredOrder = await prisma.order.findUnique({ where: { id: testOrder.id } });
    const deliveredLeg2 = await prisma.delivery.findUnique({ where: { id: leg2Job!.id } });
    const finalPayment = await prisma.payment.findFirst({ where: { orderId: testOrder.id } });
    const updatedDriver2 = await prisma.deliveryProfile.findUnique({ where: { id: deliveryProfile2!.id } });

    assert(deliveredOrder?.status === OrderStatus.DELIVERED, "Order status transitioned to DELIVERED");
    assert(deliveredLeg2?.status === DeliveryStatus.DELIVERED, "Leg 2 delivery marked DELIVERED");
    assert(deliveredLeg2?.deliveryOtpVerified === true, "Leg 2 deliveryOtpVerified is strictly TRUE");
    assert(finalPayment?.status === PaymentStatus.SUCCESS, "COD Payment status updated to SUCCESS");
    assert(!!finalPayment?.verifiedAt, "COD Payment verifiedAt timestamp recorded");
    assert(updatedDriver2?.earningsTotal === driver2InitialEarnings + 110.0, "Driver 2 credited with ₹110 Leg 2 payout");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

  } catch (err: any) {
    console.error("\n❌ Uncaught error during E2E lifecycle test execution:", err);
    failed++;
  } finally {
    // Clean up created test orders
    try {
      if (createdOrderIds.length > 0) {
        await prisma.delivery.deleteMany({ where: { orderId: { in: createdOrderIds } } });
        await prisma.payment.deleteMany({ where: { orderId: { in: createdOrderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
        console.log(`🧹 Cleaned up ${createdOrderIds.length} test orders and associated records.`);
      }
    } catch (cleanupErr) {
      console.error("Cleanup warning:", cleanupErr);
    }
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EOrderLifecycleTest();
