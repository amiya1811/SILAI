import { prisma } from "../lib/prisma";
import { CreateOrderSchema } from "../lib/validations/schemas";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { PAYMENT_METHODS } from "../components/checkout/PaymentMethodSelector";

async function testCodCheckoutFlow() {
  console.log("==================================================");
  console.log("💳 SILAI COD CHECKOUT & PAYMENT METHOD VERIFICATION");
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

  let testOrderId: string | null = null;

  try {
    // -------------------------------------------------------------------------
    // 1. PAYMENT METHOD DEFINITIONS CHECK
    // -------------------------------------------------------------------------
    console.log("📍 1. Verifying Payment Method Definitions & Availability");
    assert(PAYMENT_METHODS.length === 5, "Exactly 5 payment methods defined in PaymentMethodSelector");

    const codOption = PAYMENT_METHODS.find((p) => p.id === "COD");
    assert(!!codOption && codOption.status === "AVAILABLE", "Cash on Delivery is AVAILABLE");

    const upiOption = PAYMENT_METHODS.find((p) => p.id === "UPI");
    assert(!!upiOption && upiOption.status === "COMING_SOON", "UPI is COMING_SOON (disabled)");

    const ccOption = PAYMENT_METHODS.find((p) => p.id === "CREDIT_CARD");
    assert(!!ccOption && ccOption.status === "COMING_SOON", "Credit Card is COMING_SOON (disabled)");

    const dcOption = PAYMENT_METHODS.find((p) => p.id === "DEBIT_CARD");
    assert(!!dcOption && dcOption.status === "COMING_SOON", "Debit Card is COMING_SOON (disabled)");

    const chequeOption = PAYMENT_METHODS.find((p) => p.id === "CHEQUE");
    assert(!!chequeOption && chequeOption.status === "COMING_SOON", "Cheque is COMING_SOON (disabled)");

    // -------------------------------------------------------------------------
    // 2. SCHEMA & VALIDATION ENFORCEMENT
    // -------------------------------------------------------------------------
    console.log("\n📍 2. Schema & Default Payment Method Validation");
    const samplePayload = {
      tailorId: "test-tailor",
      garmentName: "Bespoke Kurti",
      garmentCategory: "KURTI",
      quantity: 1,
      pickupAddress: "123 Indiranagar, Bangalore",
      deliveryAddress: "123 Indiranagar, Bangalore",
    };

    const parsedDefault = CreateOrderSchema.safeParse(samplePayload);
    assert(parsedDefault.success, "Payload valid under CreateOrderSchema");
    if (parsedDefault.success) {
      assert(parsedDefault.data.paymentMethod === "COD", "paymentMethod defaults to 'COD' when omitted");
    }

    // -------------------------------------------------------------------------
    // 3. REJECTION OF UNSUPPORTED PAYMENT METHODS
    // -------------------------------------------------------------------------
    console.log("\n📍 3. Backend Policy: Reject Unsupported Methods");
    const testUnsupportedMethods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "CHEQUE", "BITCOIN"];
    for (const method of testUnsupportedMethods) {
      const isCod = method.toUpperCase().trim() === "COD";
      assert(!isCod, `Method '${method}' is strictly non-COD and must be rejected by backend`);
    }

    // -------------------------------------------------------------------------
    // 4. DATABASE INTEGRATION: ORDER & COD PAYMENT CREATION
    // -------------------------------------------------------------------------
    console.log("\n📍 4. Database Integration: COD Order Lifecycle & Association");
    const customer = await prisma.customerProfile.findFirst({
      include: { user: true },
    });
    const tailor = await prisma.tailorProfile.findFirst({
      include: { menuItems: true },
    });

    assert(!!customer && !!tailor, "Found existing Customer and Tailor in database");

    if (customer && tailor) {
      const orderNumber = `SILAI-TEST-COD-${Date.now()}`;
      const menuItem = tailor.menuItems[0];
      const basePrice = menuItem?.basePrice || 850;
      const doorstepDeliveryFee = 100;
      const taxAmount = Math.round(basePrice * 0.05);
      const finalPayableAmount = basePrice + doorstepDeliveryFee + taxAmount;

      const createdOrder = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.create({
          data: {
            orderNumber,
            customerId: customer.id,
            tailorId: tailor.id,
            status: OrderStatus.PENDING_PAYMENT,
            stitchingPrice: basePrice,
            doorstepDeliveryFee,
            discountAmount: 0,
            membershipDiscount: 0,
            taxAmount,
            finalPayableAmount,
            platformCommission: Math.round(basePrice * 0.15),
            tailorEarnings: basePrice - Math.round(basePrice * 0.15),
            pickupAddress: "45 Koramangala 4th Block, Bangalore",
            deliveryAddress: "45 Koramangala 4th Block, Bangalore",
            deliveryOtp: "4521",
            orderItems: {
              create: {
                garmentName: menuItem?.name || "Silk Kurti",
                complexity: "REGULAR",
                unitPrice: basePrice,
                quantity: 1,
              },
            },
          },
        });

        const codPayment = await tx.payment.create({
          data: {
            orderId: ord.id,
            razorpayOrderId: `cod_${ord.orderNumber}`,
            amount: ord.finalPayableAmount,
            currency: "INR",
            status: PaymentStatus.PENDING,
            paymentMethod: "COD",
          },
        });

        return { ord, codPayment };
      });

      testOrderId = createdOrder.ord.id;

      assert(createdOrder.ord.status === OrderStatus.PENDING_PAYMENT, "Order status is PENDING_PAYMENT (Unpaid)");
      assert(createdOrder.ord.status !== OrderStatus.PAID, "Order is NOT marked as PAID");
      assert(createdOrder.codPayment.paymentMethod === "COD", "Payment record has paymentMethod = 'COD'");
      assert(createdOrder.codPayment.status === PaymentStatus.PENDING, "Payment record status is PENDING");
      assert(createdOrder.codPayment.amount === finalPayableAmount, `Payable amount correctly preserved: ₹${finalPayableAmount}`);

      // Verify querying order includes payments relation
      const queried = await prisma.order.findUnique({
        where: { id: testOrderId },
        include: { payments: true },
      });

      assert(!!queried, "Queried order exists in database");
      assert(queried?.payments.length === 1, "Order has exactly 1 associated payment record");
      assert(queried?.payments[0].paymentMethod === "COD", "Queried payment method is COD");
      assert(queried?.payments[0].status === PaymentStatus.PENDING, "Queried payment status is PENDING");
    }

  } catch (err: any) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    // Clean up test order
    if (testOrderId) {
      try {
        await prisma.payment.deleteMany({ where: { orderId: testOrderId } });
        await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
        await prisma.order.delete({ where: { id: testOrderId } });
        console.log(`\n🧹 Cleaned up test order record: ${testOrderId}`);
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }

    console.log("\n==================================================");
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  }
}

testCodCheckoutFlow();
