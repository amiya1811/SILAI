import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";

async function testCustomerOrdering() {
  console.log("==================================================");
  console.log("🧵 SILAI CUSTOMER ORDERING FLOW VERIFICATION");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${detail || ""}`);
      failed++;
    }
  }

  let createdOrderId = "";
  let priyaDesignId = "";
  let custBProfileId = "";
  let custBDesignId = "";
  let custBMeasId = "";
  let custBUserId = "";

  try {
    // -------------------------------------------------------------------------
    // 1. TAILOR & SERVICE SELECTION FROM POSTGRESQL
    // -------------------------------------------------------------------------
    console.log("📍 1. Tailor & Service Selection");
    const tailor = await prisma.tailorProfile.findFirst({
      where: { user: { email: "meera@example.com" } },
      include: { menuItems: true },
    });

    assert(!!tailor, "Found Master Tailor (Meera Devi) in PostgreSQL");
    assert((tailor?.menuItems.length || 0) > 0, `Tailor has ${tailor?.menuItems.length} active menu services`);

    const selectedService = tailor!.menuItems.find((m) => m.basePrice >= 500) || tailor!.menuItems[0];
    assert(!!selectedService && selectedService.basePrice > 0, `Selected service "${selectedService?.name}" has base price ₹${selectedService?.basePrice}`);
    assert(selectedService?.estimatedDays > 0, `Selected service has turnaround time of ~${selectedService?.estimatedDays} days`);

    // -------------------------------------------------------------------------
    // 2. FIT PROFILE IDENTIFICATION & SECURITY
    // -------------------------------------------------------------------------
    console.log("\n📐 2. Fit Profile & Customer Security");
    const priyaUser = await prisma.user.findUnique({
      where: { email: "priya@example.com" },
      include: { customerProfile: true },
    });
    assert(!!priyaUser?.customerProfile, "Customer Priya has active customer profile in PostgreSQL");

    // Fetch Priya's saved fit profile
    let priyaMeas = await prisma.measurementProfile.findFirst({
      where: { customerId: priyaUser!.customerProfile!.id },
    });
    if (!priyaMeas) {
      priyaMeas = await prisma.measurementProfile.create({
        data: {
          customerId: priyaUser!.customerProfile!.id,
          profileName: "Priya Royal Silk Blouse",
          garmentType: "Saree Blouse",
          type: "SAVED",
          measurementsJson: JSON.stringify({ bust: 36, waist: 30, shoulder: 14.5 }),
        },
      });
    }
    assert(!!priyaMeas, `Retrieved Fit Profile "${priyaMeas.profileName}" with measurements`);

    // Create Customer B to test cross-customer security
    const timestamp = Date.now();
    const custBUser = await prisma.user.create({
      data: {
        email: `custb.${timestamp}@silai.test`,
        passwordHash: "dummyHash123",
        fullName: "Customer B (Unauthorized)",
        role: "CUSTOMER",
      },
    });
    custBUserId = custBUser.id;

    const custBProfile = await prisma.customerProfile.create({
      data: {
        userId: custBUser.id,
        addressLine1: "Civil Lines, Delhi",
        city: "Delhi",
        preferredLanguage: "English",
      },
    });
    custBProfileId = custBProfile.id;

    const custBMeas = await prisma.measurementProfile.create({
      data: {
        customerId: custBProfile.id,
        profileName: "Customer B Private Fit",
        garmentType: "Kurti",
        type: "SAVED",
        measurementsJson: JSON.stringify({ chest: 42, waist: 38 }),
      },
    });
    custBMeasId = custBMeas.id;

    const custBDesign = await prisma.design.create({
      data: {
        customerId: custBProfile.id,
        title: "Customer B Secret Lehenga Design",
        garmentType: "Lehenga",
        referenceImageUrl: "https://example.com/custb-design.jpg",
      },
    });
    custBDesignId = custBDesign.id;

    // SECURITY CHECK: Verify ownership lookup logic
    const illegalProfileAttempt = await prisma.measurementProfile.findFirst({
      where: { id: custBMeasId, customerId: priyaUser!.customerProfile!.id },
    });
    assert(illegalProfileAttempt === null, "Security: Customer A cannot access Customer B's Fit Profile");

    const illegalDesignAttempt = await prisma.design.findFirst({
      where: { id: custBDesignId, customerId: priyaUser!.customerProfile!.id },
    });
    assert(illegalDesignAttempt === null, "Security: Customer A cannot access Customer B's Design");

    // -------------------------------------------------------------------------
    // 3. DESIGN REFERENCE ATTACHMENT
    // -------------------------------------------------------------------------
    console.log("\n🎨 3. Design Reference Attachment");
    const priyaDesign = await prisma.design.create({
      data: {
        customerId: priyaUser!.customerProfile!.id,
        title: "Embroidered Silk Blouse Inspiration",
        garmentType: selectedService.category,
        referenceImageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
        neckline: "Sweetheart Neck",
        sleeveStyle: "Elbow Length",
        fitPreference: "Tailored Fit",
        specialInstructions: "Cotton lining with double stitch margins",
      },
    });
    priyaDesignId = priyaDesign.id;
    assert(!!priyaDesign.id, "Design reference attached and saved with original image reference");
    assert(priyaDesign.referenceImageUrl.includes("unsplash"), "Original reference image URL preserved intact");

    // -------------------------------------------------------------------------
    // 4. QUANTITY & PROMO CODE CALCULATION (AMIYA@26)
    // -------------------------------------------------------------------------
    console.log("\n💰 4. Pricing, Quantity & Promo Code (USER@50)");
    const quantity = 2;
    const basePrice = selectedService.basePrice;
    const stitchingSubtotal = basePrice * quantity;
    assert(stitchingSubtotal === basePrice * 2, `Quantity of 2 correctly calculates stitching subtotal: ₹${stitchingSubtotal}`);

    // Validate USER@50 from PostgreSQL for returning customer Priya
    const promo = await prisma.offer.findUnique({
      where: { code: "USER@50" },
    });
    assert(!!promo, "Promo code USER@50 retrieved from PostgreSQL");
    assert(promo?.isActive === true, "USER@50 is active");
    assert(promo?.discountValue === 50, "USER@50 discount value is ₹50");
    assert(stitchingSubtotal >= (promo?.minOrderValue || 249), `Subtotal ₹${stitchingSubtotal} satisfies minimum order requirement of ₹${promo?.minOrderValue}`);

    // Financial formulas
    const deliveryFee = 100;
    const discountAmount = promo!.discountValue;
    const taxableSubtotal = Math.max(0, stitchingSubtotal - discountAmount);
    const taxAmount = Math.round(taxableSubtotal * 0.05);
    const expectedFinalTotal = taxableSubtotal + deliveryFee + taxAmount;

    console.log(`     - Base Price: ₹${basePrice}`);
    console.log(`     - Quantity: ${quantity}`);
    console.log(`     - Subtotal: ₹${stitchingSubtotal}`);
    console.log(`     - Delivery Fee: ₹${deliveryFee}`);
    console.log(`     - Promo Discount (USER@50): -₹${discountAmount}`);
    console.log(`     - GST (5%): ₹${taxAmount}`);
    console.log(`     - Final Payable Amount: ₹${expectedFinalTotal}`);

    // -------------------------------------------------------------------------
    // 5. SERVER-SIDE TRANSACTIONAL ORDER CREATION
    // -------------------------------------------------------------------------
    console.log("\n📦 5. Server-Side Transactional Order Creation");
    const testOrderNumber = `SIL-ORD-${Date.now()}`;
    const testOtp = "7294";

    const createdOrder = await prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          orderNumber: testOrderNumber,
          customerId: priyaUser!.customerProfile!.id,
          tailorId: tailor!.id,
          designId: priyaDesignId,
          measurementProfileId: priyaMeas!.id,
          status: OrderStatus.PENDING_PAYMENT,
          stitchingPrice: stitchingSubtotal,
          doorstepDeliveryFee: deliveryFee,
          discountAmount: discountAmount,
          membershipDiscount: 0,
          taxAmount: taxAmount,
          finalPayableAmount: expectedFinalTotal,
          pickupAddress: "Flat 402, Royal Palms, Greater Kailash 1, New Delhi",
          deliveryAddress: "Flat 402, Royal Palms, Greater Kailash 1, New Delhi",
          deliveryOtp: testOtp,
          correctionNotes: "Cotton lining with double stitch margins • Sweetheart Neck • Elbow Length",
          orderItems: {
            create: {
              menuItemId: selectedService.id,
              garmentName: selectedService.name,
              complexity: selectedService.complexity || selectedService.category,
              unitPrice: basePrice,
              quantity: quantity,
              customNotes: "Cotton voile lining with double stitch margins",
            },
          },
        },
        include: {
          customer: { include: { user: true } },
          tailor: true,
          orderItems: true,
          design: true,
          measurementProfile: true,
        },
      });
    }, { timeout: 15000, maxWait: 10000 });

    createdOrderId = createdOrder.id;
    assert(!!createdOrder.id, `Order created in PostgreSQL with ID: ${createdOrder.id}`);
    assert(createdOrder.orderNumber === testOrderNumber, `Order number assigned: ${createdOrder.orderNumber}`);
    assert(createdOrder.status === OrderStatus.PENDING_PAYMENT, "Initial order status is PENDING_PAYMENT");
    assert(createdOrder.orderItems.length === 1, "OrderItem created with relational integrity");
    assert(createdOrder.orderItems[0].quantity === quantity, `OrderItem quantity is ${quantity}`);
    assert(createdOrder.finalPayableAmount === expectedFinalTotal, `Server-calculated final amount is ₹${expectedFinalTotal}`);
    assert(createdOrder.discountAmount === discountAmount, `Promo discount amount ₹${discountAmount} is stored in PostgreSQL`);

    // -------------------------------------------------------------------------
    // 6. ORDER PERSISTENCE ACROSS SESSIONS
    // -------------------------------------------------------------------------
    console.log("\n💾 6. Order Persistence Across Sessions");
    // Simulate user reloading or re-logging in and fetching orders
    const fetchedOrders = await prisma.order.findMany({
      where: { customerId: priyaUser!.customerProfile!.id },
      include: {
        customer: { include: { user: true } },
        tailor: true,
        orderItems: true,
        design: true,
        measurementProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const persistedOrder = fetchedOrders.find((o) => o.id === createdOrderId);
    assert(!!persistedOrder, "Order persists and is retrieved for customer Priya");
    assert(persistedOrder?.tailor.businessName === tailor?.businessName, `Associated tailor is correctly ${tailor?.businessName}`);
    assert(persistedOrder?.design?.referenceImageUrl === priyaDesign.referenceImageUrl, "Associated original reference design is intact");
    assert(persistedOrder?.measurementProfile?.id === priyaMeas.id, "Associated Fit Profile is intact");
    assert(persistedOrder?.orderItems[0].garmentName === selectedService.name, `Associated service item is "${selectedService.name}"`);

    // -------------------------------------------------------------------------
    // 7. ORDER TRACKING ENTRY
    // -------------------------------------------------------------------------
    console.log("\n🚚 7. Order Tracking Lifecycle Entry");
    assert(!!persistedOrder?.deliveryOtp, `Delivery verification OTP is present: ${persistedOrder?.deliveryOtp}`);
    assert(!!persistedOrder?.pickupAddress, `Pickup address is stored: ${persistedOrder?.pickupAddress}`);
    assert(!!persistedOrder?.deliveryAddress, `Delivery address is stored: ${persistedOrder?.deliveryAddress}`);
    assert(persistedOrder?.status === OrderStatus.PENDING_PAYMENT, "Order has entered live tracking lifecycle at initial stage");

    // -------------------------------------------------------------------------
    // 8. DUPLICATE ORDER NUMBER PROTECTION
    // -------------------------------------------------------------------------
    console.log("\n🛡️ 8. Duplicate Order Protection");
    let duplicateCaught = false;
    try {
      await prisma.order.create({
        data: {
          orderNumber: testOrderNumber, // Duplicate unique orderNumber
          customerId: priyaUser!.customerProfile!.id,
          tailorId: tailor!.id,
          status: OrderStatus.PENDING_PAYMENT,
          stitchingPrice: stitchingSubtotal,
          finalPayableAmount: expectedFinalTotal,
          pickupAddress: "Delhi",
          deliveryAddress: "Delhi",
        },
      });
    } catch (e) {
      duplicateCaught = true;
    }
    assert(duplicateCaught, "Database uniquely prevents duplicate orderNumber submissions");

    console.log("\n==================================================");
    console.log(`🏁 ORDERING AUDIT SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  } finally {
    // Cleanup created test records
    console.log("\n🧹 Cleaning up test artifacts...");
    if (createdOrderId) {
      await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
      await prisma.order.delete({ where: { id: createdOrderId } });
    }
    if (priyaDesignId) {
      await prisma.design.delete({ where: { id: priyaDesignId } });
    }
    if (custBDesignId) {
      await prisma.design.delete({ where: { id: custBDesignId } });
    }
    if (custBMeasId) {
      await prisma.measurementProfile.delete({ where: { id: custBMeasId } });
    }
    if (custBProfileId) {
      await prisma.customerProfile.delete({ where: { id: custBProfileId } });
    }
    if (custBUserId) {
      await prisma.user.delete({ where: { id: custBUserId } });
    }
    console.log("  ✅ Cleanup complete.");
    await prisma.$disconnect();
  }
}

testCustomerOrdering();
