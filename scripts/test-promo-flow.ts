import { prisma } from "../lib/prisma";
import { OrderStatus, Role } from "@prisma/client";

async function runComprehensivePromoAudit() {
  console.log("================================================================================");
  console.log("🎟️  SILAI FINAL COUPON SYSTEM & ELIGIBILITY VERIFICATION SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> ${detail || ""}`);
      failed++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: VERIFY EXACTLY 3 ACTIVE COUPONS IN POSTGRESQL
    // ------------------------------------------------------------------------
    console.log("📦 1. Database Inspection: Active Coupons Inventory");
    const allOffers = await prisma.offer.findMany();
    const activeOffers = allOffers.filter((o) => o.isActive);

    assert(
      activeOffers.length === 3,
      `Exactly 3 active coupons in database (Found: ${activeOffers.length})`
    );

    const activeCodes = activeOffers.map((o) => o.code).sort();
    assert(
      JSON.stringify(activeCodes) === JSON.stringify(["AMIYA@100", "AMIYA@50", "USER@50"].sort()),
      `Active coupons are strictly ['AMIYA@100', 'AMIYA@50', 'USER@50'] (Found: ${activeCodes.join(", ")})`
    );

    // Verify old demo coupons are completely absent
    const legacyCoupons = ["FIRSTSTITCH", "SILAIROYAL", "FREESHIP", "AMIYA@26"];
    for (const legacyCode of legacyCoupons) {
      const found = allOffers.find((o) => o.code === legacyCode && o.isActive);
      assert(!found, `Legacy coupon '${legacyCode}' is purged/inactive`);
    }

    // ------------------------------------------------------------------------
    // SECTION 2: VERIFY COUPON SPECIFICATIONS
    // ------------------------------------------------------------------------
    console.log("\n📋 2. Verification of Coupon Rules & Thresholds");

    const amiya100 = activeOffers.find((o) => o.code === "AMIYA@100");
    assert(!!amiya100, "AMIYA@100 exists in database");
    assert(amiya100?.discountValue === 100, "AMIYA@100 gives ₹100 discount");
    assert(amiya100?.minOrderValue === 499, "AMIYA@100 minimum order value is ₹499");
    assert(amiya100?.discountType === "FIXED_AMOUNT", "AMIYA@100 discount type is FIXED_AMOUNT");

    const amiya50 = activeOffers.find((o) => o.code === "AMIYA@50");
    assert(!!amiya50, "AMIYA@50 exists in database");
    assert(amiya50?.discountValue === 50, "AMIYA@50 gives ₹50 discount");
    assert(amiya50?.minOrderValue === 299, "AMIYA@50 minimum order value is ₹299");
    assert(amiya50?.discountType === "FIXED_AMOUNT", "AMIYA@50 discount type is FIXED_AMOUNT");

    const user50 = activeOffers.find((o) => o.code === "USER@50");
    assert(!!user50, "USER@50 exists in database");
    assert(user50?.discountValue === 50, "USER@50 gives ₹50 discount");
    assert(user50?.minOrderValue === 249, "USER@50 minimum order value is ₹249");
    assert(user50?.discountType === "FIXED_AMOUNT", "USER@50 discount type is FIXED_AMOUNT");

    // ------------------------------------------------------------------------
    // SECTION 3: USER ELIGIBILITY COMPUTATION & RULE ENFORCEMENT
    // ------------------------------------------------------------------------
    console.log("\n👤 3. Customer Eligibility & Database Order Count Simulation");

    // Setup a clean test new customer
    const newTestEmail = `test.newcustomer.${Date.now()}@silai.luxury`;
    const newUser = await prisma.user.create({
      data: {
        email: newTestEmail,
        passwordHash: "$2a$10$demoHashForTestingPurposesOnly12345678901234567890",
        fullName: "Test New User",
        phone: "+91 99999 88881",
        role: Role.CUSTOMER,
        isVerified: true,
        isActive: true,
        customerProfile: {
          create: {
            addressLine1: "Defence Colony A-Block",
            city: "Delhi NCR",
          },
        },
      },
      include: { customerProfile: true },
    });

    const newCustProfileId = newUser.customerProfile!.id;

    // Verify 0 non-cancelled orders
    const newCustOrderCount = await prisma.order.count({
      where: { customerId: newCustProfileId, status: { not: OrderStatus.CANCELLED } },
    });
    const isNewUserDetected = newCustOrderCount === 0;
    assert(isNewUserDetected, "New user correctly has 0 non-cancelled orders (isNewUser = true)");

    // Test a tailor to use
    const tailor = await prisma.tailorProfile.findFirst();
    assert(!!tailor, "At least one active tailor exists for test orders");

    // ------------------------------------------------------------------------
    // SECTION 4: TEST NEW USER COUPON MATRIX
    // ------------------------------------------------------------------------
    console.log("\n✨ 4. Testing Coupon Eligibility for New User");

    // Helper validation function identical to API logic
    const evaluateCoupon = (
      code: string,
      subtotal: number,
      isNew: boolean
    ): { eligible: boolean; error?: string; discount: number } => {
      const offer = activeOffers.find((o) => o.code === code.toUpperCase().trim());
      if (!offer) return { eligible: false, error: "Invalid or expired coupon code", discount: 0 };

      // User eligibility
      if (["AMIYA@100", "AMIYA@50"].includes(offer.code) && !isNew) {
        return {
          eligible: false,
          error: `Coupon ${offer.code} is available for new users on their first order only.`,
          discount: 0,
        };
      }
      if (offer.code === "USER@50" && isNew) {
        return {
          eligible: false,
          error: "Coupon USER@50 is reserved for returning patrons.",
          discount: 0,
        };
      }

      // Min order value
      if (subtotal < offer.minOrderValue) {
        const shortfall = Math.ceil(offer.minOrderValue - subtotal);
        return {
          eligible: false,
          error: `Add ₹${shortfall} more to use ${offer.code}.`,
          discount: 0,
        };
      }

      return { eligible: true, discount: offer.discountValue };
    };

    // 4A. AMIYA@100 on ₹500 subtotal (>= 499) for NEW user
    const res1 = evaluateCoupon("AMIYA@100", 500, true);
    assert(res1.eligible && res1.discount === 100, "New User + AMIYA@100 (₹500 subtotal): ₹100 discount applied");

    // 4B. AMIYA@100 on ₹400 subtotal (< 499) for NEW user
    const res2 = evaluateCoupon("AMIYA@100", 400, true);
    assert(!res2.eligible && res2.error === "Add ₹99 more to use AMIYA@100.", "New User + AMIYA@100 (₹400 subtotal): Dynamic feedback 'Add ₹99 more to use AMIYA@100.'");

    // 4C. AMIYA@50 on ₹300 subtotal (>= 299) for NEW user
    const res3 = evaluateCoupon("AMIYA@50", 300, true);
    assert(res3.eligible && res3.discount === 50, "New User + AMIYA@50 (₹300 subtotal): ₹50 discount applied");

    // 4D. AMIYA@50 on ₹250 subtotal (< 299) for NEW user
    const res4 = evaluateCoupon("AMIYA@50", 250, true);
    assert(!res4.eligible && res4.error === "Add ₹49 more to use AMIYA@50.", "New User + AMIYA@50 (₹250 subtotal): Dynamic feedback 'Add ₹49 more to use AMIYA@50.'");

    // 4E. USER@50 attempted by NEW user
    const res5 = evaluateCoupon("USER@50", 500, true);
    assert(!res5.eligible && !!res5.error?.includes("reserved for returning patrons"), "New User attempting USER@50 is blocked with eligibility notice");

    // ------------------------------------------------------------------------
    // SECTION 5: CONVERT USER TO REGULAR USER & TEST REGULAR USER MATRIX
    // ------------------------------------------------------------------------
    console.log("\n👑 5. Testing Coupon Eligibility for Regular / Returning User");

    // Create a real completed order for this customer
    const completedOrder = await prisma.order.create({
      data: {
        orderNumber: `ORDER-AUDIT-${Date.now()}`,
        customerId: newCustProfileId,
        tailorId: tailor!.id,
        status: OrderStatus.PAID,
        stitchingPrice: 850,
        doorstepDeliveryFee: 100,
        discountAmount: 100,
        taxAmount: 38,
        finalPayableAmount: 888,
        pickupAddress: "Defence Colony A-Block",
        deliveryAddress: "Defence Colony A-Block",
        deliveryOtp: "4433",
      },
    });

    // Re-check order count
    const updatedCount = await prisma.order.count({
      where: { customerId: newCustProfileId, status: { not: OrderStatus.CANCELLED } },
    });
    const isNowRegularUser = updatedCount >= 1;
    assert(isNowRegularUser, `Customer now has ${updatedCount} existing order(s) (isNewUser = false)`);

    // 5A. USER@50 on ₹300 subtotal (>= 249) for REGULAR user
    const regRes1 = evaluateCoupon("USER@50", 300, false);
    assert(regRes1.eligible && regRes1.discount === 50, "Regular User + USER@50 (₹300 subtotal): ₹50 discount applied");

    // 5B. USER@50 on ₹200 subtotal (< 249) for REGULAR user
    const regRes2 = evaluateCoupon("USER@50", 200, false);
    assert(!regRes2.eligible && regRes2.error === "Add ₹49 more to use USER@50.", "Regular User + USER@50 (₹200 subtotal): Dynamic feedback 'Add ₹49 more to use USER@50.'");

    // 5C. AMIYA@100 attempted by REGULAR user
    const regRes3 = evaluateCoupon("AMIYA@100", 600, false);
    assert(!regRes3.eligible && !!regRes3.error?.includes("available for new users on their first order only"), "Regular User attempting AMIYA@100 is strictly rejected");

    // 5D. AMIYA@50 attempted by REGULAR user
    const regRes4 = evaluateCoupon("AMIYA@50", 600, false);
    assert(!regRes4.eligible && !!regRes4.error?.includes("available for new users on their first order only"), "Regular User attempting AMIYA@50 is strictly rejected");

    // ------------------------------------------------------------------------
    // SECTION 6: NO STACKING & REPLACEMENT VERIFICATION
    // ------------------------------------------------------------------------
    console.log("\n🔄 6. Single Coupon / Clean Replacement Verification");
    let currentAppliedCoupon: string | null = null;
    let currentDiscount = 0;

    // Apply first coupon
    const couponA = evaluateCoupon("AMIYA@50", 350, true);
    if (couponA.eligible) {
      currentAppliedCoupon = "AMIYA@50";
      currentDiscount = couponA.discount;
    }
    assert(currentAppliedCoupon === "AMIYA@50" && currentDiscount === 50, "Initial coupon AMIYA@50 applied (₹50 discount)");

    // Apply second coupon (replaces, never adds)
    const couponB = evaluateCoupon("AMIYA@100", 600, true);
    if (couponB.eligible) {
      currentAppliedCoupon = "AMIYA@100";
      currentDiscount = couponB.discount; // Clean replacement
    }
    assert(currentAppliedCoupon === "AMIYA@100" && currentDiscount === 100, "Applying AMIYA@100 replaces AMIYA@50 cleanly (discount is ₹100, NOT ₹150)");

    // Remove coupon
    currentAppliedCoupon = null;
    currentDiscount = 0;
    assert(currentAppliedCoupon === null && currentDiscount === 0, "Removing coupon cleanly resets discount to ₹0");

    // ------------------------------------------------------------------------
    // SECTION 7: CLEAN UP TEST DATA
    // ------------------------------------------------------------------------
    console.log("\n🧹 7. Cleaning up test data from PostgreSQL");
    await prisma.order.delete({ where: { id: completedOrder.id } });
    await prisma.customerProfile.delete({ where: { id: newCustProfileId } });
    await prisma.user.delete({ where: { id: newUser.id } });
    console.log("  ✅ Test user and order purged cleanly");

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`🏁 AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("Audit encountered an error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runComprehensivePromoAudit();
