import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../lib/auth/hash";
import { signToken, verifyToken } from "../lib/auth/jwt";
import { OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";

async function runTests() {
  console.log("🚀 Starting SILAI PostgreSQL & Prisma End-to-End Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Database Connectivity
    console.log("📦 1. Database Connection");
    await prisma.$connect();
    assert(true, "Successfully connected to PostgreSQL via Prisma Client");

    // 2. Customer Authentication & Lookups
    console.log("\n👤 2. Customer Authentication");
    const priya = await prisma.user.findUnique({
      where: { email: "priya@example.com" },
      include: { customerProfile: true },
    });
    assert(!!priya, "Customer Priya found in PostgreSQL");
    assert(priya?.role === "CUSTOMER", "Customer role is correctly CUSTOMER");
    const isPassValid = await comparePassword("Silai@2026", priya?.passwordHash || "");
    assert(isPassValid, "Bcrypt password verification succeeds for Silai@2026");

    // 3. Customer Profile Operations
    console.log("\n👗 3. Customer Profile Operations");
    assert(!!priya?.customerProfile, "Priya has associated CustomerProfile in DB");
    const updatedCustomerProfile = await prisma.customerProfile.update({
      where: { userId: priya!.id },
      data: { city: "Delhi NCR (Greater Kailash)" },
    });
    assert(Boolean(updatedCustomerProfile.city && updatedCustomerProfile.city.includes("Greater Kailash")), "Customer profile updated in PostgreSQL");

    // 4. Customer Measurement Profiles (Garment-Specific & Custom)
    console.log("\n📐 4. Measurement Profiles (Garment-Specific & Custom)");
    const measurements = await prisma.measurementProfile.findMany({
      where: { customerId: priya!.customerProfile!.id },
    });
    assert(measurements.length > 0, `Retrieved ${measurements.length} measurement profiles for Priya`);

    // 4a. Standard Garment Test: Saree Blouse with metric (cm) unit
    const blouseMeas = await prisma.measurementProfile.create({
      data: {
        customerId: priya!.customerProfile!.id,
        profileName: "Festive Saree Blouse (Silk)",
        garmentType: "Saree Blouse",
        type: "SAVED",
        measurementsJson: JSON.stringify({
          unit: "cm",
          measurements: {
            bust: 91.5,
            underbust: 78.5,
            waist: 76,
            shoulder: 37,
            armhole: 41,
            sleeveLength: 28,
            bicep: 30,
            blouseLength: 38,
            frontNeckDepth: 18,
            backNeckDepth: 25,
          },
          notes: "Deep back neck with latkan dori",
        }),
      },
    });
    assert(!!blouseMeas.id, "Created Saree Blouse garment-specific measurement profile in PostgreSQL");

    // 4b. Custom Garment Test: Indo-Western Sherwani with custom fields & description
    const customMeas = await prisma.measurementProfile.create({
      data: {
        customerId: priya!.customerProfile!.id,
        profileName: "Groom Brother Indo-Western Jacket",
        garmentType: "Custom",
        type: "SAVED",
        measurementsJson: JSON.stringify({
          unit: "in",
          customGarmentName: "Asymmetric Achkan Sherwani",
          customDescription: "Custom layered Indo-Western coat with slanted front closure and brass button placket",
          measurements: {},
          customFields: [
            { name: "Mandarin Collar Band", value: 16.5, unit: "in" },
            { name: "Cross Back Width", value: 18.0, unit: "in" },
            { name: "Front Overlap Flap", value: 7.5, unit: "in" },
            { name: "Sherwani Slit Height", value: 14.0, unit: "in" },
          ],
          notes: "Double fused interlining for structured drape",
        }),
      },
    });
    assert(!!customMeas.id, "Created Custom Garment profile with custom fields in PostgreSQL");

    // Verify parsing of custom fields
    const parsedCustom = JSON.parse(customMeas.measurementsJson);
    assert(parsedCustom.customGarmentName === "Asymmetric Achkan Sherwani", "Retrieved custom garment name accurately");
    assert(parsedCustom.customFields.length === 4, "Retrieved 4 dynamic custom measurement points accurately");

    await prisma.measurementProfile.delete({ where: { id: blouseMeas.id } });
    await prisma.measurementProfile.delete({ where: { id: customMeas.id } });
    assert(true, "Cleaned up temporary test measurement profiles");

    // 5. Tailor & Menu APIs
    console.log("\n🧵 5. Tailor & Menu Operations");
    const tailors = await prisma.tailorProfile.findMany({
      include: { menuItems: true },
    });
    assert(tailors.length >= 1, `Retrieved ${tailors.length} active artisan tailors`);
    const meera = tailors.find((t) => t.id === "tailor-1");
    assert(!!meera, "Found Meera Devi boutique (tailor-1)");
    assert(meera!.menuItems.length > 0, `Meera has ${meera!.menuItems.length} menu service items in PostgreSQL`);

    // Add, update, delete custom service
    const testMenuItem = await prisma.menuItem.create({
      data: {
        tailorId: "tailor-1",
        category: "BLOUSE",
        name: "Test Gold Zari Blouse",
        basePrice: 1250,
        estimatedDays: 4,
        complexity: "DESIGNER",
        isAvailable: true,
      },
    });
    assert(!!testMenuItem.id, "Tailor added service item successfully to PostgreSQL");

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: testMenuItem.id },
      data: { basePrice: 1350 },
    });
    assert(updatedMenuItem.basePrice === 1350, "Tailor updated service price to ₹1350 in DB");

    await prisma.menuItem.delete({ where: { id: testMenuItem.id } });
    assert(true, "Tailor deleted service item cleanly from DB");

    // 6. Delivery Partner Operations
    console.log("\n🛵 6. Delivery Operations");
    const rahul = await prisma.user.findUnique({
      where: { email: "rahul@example.com" },
      include: { deliveryProfile: true },
    });
    assert(!!rahul, "Delivery partner Rahul found in DB");
    assert(rahul?.role === "DELIVERY_PARTNER", "Rahul has DELIVERY_PARTNER role");
    assert(!!rahul?.deliveryProfile, "Rahul has linked DeliveryProfile in DB");

    const deliveries = await prisma.delivery.findMany({
      include: { order: true },
    });
    assert(deliveries.length > 0, `Retrieved ${deliveries.length} delivery jobs from PostgreSQL`);

    // 7. Orders & Order Lifecycle
    console.log("\n📦 7. Orders & Order Lifecycle");
    const existingOrders = await prisma.order.findMany({
      include: { orderItems: true, customer: true, tailor: true },
    });
    assert(existingOrders.length > 0, `Retrieved ${existingOrders.length} seeded orders from PostgreSQL`);

    // Test order creation
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-${Date.now()}`,
        customerId: priya!.customerProfile!.id,
        tailorId: "tailor-1",
        status: OrderStatus.PENDING_PAYMENT,
        stitchingPrice: 950,
        doorstepDeliveryFee: 100,
        discountAmount: 0,
        membershipDiscount: 0,
        taxAmount: 48,
        finalPayableAmount: 1098,
        platformCommission: 142.5,
        tailorEarnings: 807.5,
        pickupAddress: "Flat 402, Royal Palms, New Delhi",
        deliveryAddress: "Flat 402, Royal Palms, New Delhi",
        deliveryOtp: "5566",
        orderItems: {
          create: {
            garmentName: "Test Designer Kurti",
            complexity: "DESIGNER",
            unitPrice: 950,
            quantity: 1,
          },
        },
      },
      include: { orderItems: true },
    });
    assert(!!newOrder.id, "Successfully created order in PostgreSQL");
    assert(newOrder.orderItems.length === 1, "Order items saved with relational integrity");

    // Status update
    const updatedOrder = await prisma.order.update({
      where: { id: newOrder.id },
      data: { status: OrderStatus.STITCHING },
    });
    assert(updatedOrder.status === OrderStatus.STITCHING, "Order status advanced to STITCHING");

    // Correction request
    const correctedOrder = await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        status: OrderStatus.CORRECTION_REQUESTED,
        correctionNotes: "[Fit Issue] Loosen chest ease by 1 inch",
      },
    });
    assert(correctedOrder.status === OrderStatus.CORRECTION_REQUESTED, "Correction registered on order");

    // Cleanup test order
    await prisma.orderItem.deleteMany({ where: { orderId: newOrder.id } });
    await prisma.order.delete({ where: { id: newOrder.id } });
    assert(true, "Cleaned up test order and order items");

    // 8. Offers & Promotions
    console.log("\n🏷️  8. Promotional Offers");
    const amiya100 = await prisma.offer.findUnique({
      where: { code: "AMIYA@100" },
    });
    assert(!!amiya100, "Promo code AMIYA@100 found in PostgreSQL");
    assert(amiya100?.discountValue === 100, "Discount value matches ₹100");

    // 9. Admin Metrics Aggregation
    console.log("\n📊 9. Admin Platform Metrics");
    const [totalOrders, totalTailors, totalDeliveries] = await Promise.all([
      prisma.order.count(),
      prisma.tailorProfile.count(),
      prisma.delivery.count(),
    ]);
    assert(totalOrders > 0, `Counted ${totalOrders} orders for admin dashboard`);
    assert(totalTailors >= 1, `Counted ${totalTailors} tailor partners for admin dashboard`);
    assert(totalDeliveries > 0, `Counted ${totalDeliveries} delivery dispatches`);

    console.log("\n==================================================");
    console.log(`🏁 Test Results: ${passed} passed, ${failed} failed.`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
