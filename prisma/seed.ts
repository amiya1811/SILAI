import { PrismaClient, Role, TailorAvailability, OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";
import {
  INITIAL_TAILORS,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_DELIVERY_JOBS,
  INITIAL_REVIEWS,
  INITIAL_MEASUREMENTS,
} from "../lib/db/seed-data";
import { DEMO_USERS } from "../lib/db/store";
import { hashPassword } from "../lib/auth/hash";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SILAI PostgreSQL Database Seed...");

  // Generate genuine bcrypt hash for "Silai@2026"
  const demoPasswordHash = await hashPassword("Silai@2026");

  // 1. Seed Core Demo Users (Customer, Tailor, Delivery Agent, Admin)
  console.log("👤 Seeding demo users...");
  const adminPasswordHash = await hashPassword("Amiya@1811");

  // Clean up any legacy admin email to prevent duplicate accounts
  await prisma.user.deleteMany({
    where: { email: "admin@silai.luxury" },
  });

  for (const [email, record] of Object.entries(DEMO_USERS)) {
    const userRole = record.user.role as Role;
    const passwordHash = email === "amiyaranjanpatra1811@gmail.com" ? adminPasswordHash : demoPasswordHash;

    await prisma.user.upsert({
      where: { email },
      update: {
        fullName: record.user.fullName,
        phone: record.user.phone || null,
        role: userRole,
        avatarUrl: record.user.avatarUrl || null,
        passwordHash,
        isVerified: true,
        isActive: true,
      },
      create: {
        id: record.user.id,
        email,
        passwordHash,
        fullName: record.user.fullName,
        phone: record.user.phone || null,
        role: userRole,
        avatarUrl: record.user.avatarUrl || null,
        isVerified: true,
        isActive: true,
      },
    });
  }

  // 2. Seed Supporting Users for additional demo tailors and customers
  console.log("👥 Seeding supporting accounts...");
  const supportingUsers = [
    {
      id: "cust-2",
      email: "ananya@example.com",
      fullName: "Ananya Deshmukh",
      phone: "+91 98200 87654",
      role: Role.CUSTOMER,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "cust-3",
      email: "ritu@example.com",
      fullName: "Ritu Singhal",
      phone: "+91 98111 22334",
      role: Role.CUSTOMER,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const defaultPasswordHash = demoPasswordHash;

  for (const u of supportingUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatarUrl,
        passwordHash: defaultPasswordHash,
        isVerified: true,
        isActive: true,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: defaultPasswordHash,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatarUrl,
        isVerified: true,
        isActive: true,
      },
    });
  }

  // 3. Seed Customer Profiles
  console.log("👗 Seeding customer profiles...");
  const customerProfiles = [
    {
      id: "cust-prof-1",
      userId: "cust-1",
      addressLine1: "Flat 402, Royal Palms, Greater Kailash 1",
      city: "Delhi NCR",
      postalCode: "110048",
      preferredLanguage: "Hindi, English",
    },
    {
      id: "cust-prof-2",
      userId: "cust-2",
      addressLine1: "Tower 3, Apt 1104, DLF Phase 5",
      city: "Gurugram",
      postalCode: "122002",
      preferredLanguage: "English",
    },
    {
      id: "cust-prof-3",
      userId: "cust-3",
      addressLine1: "Defence Colony, A-Block",
      city: "Delhi NCR",
      postalCode: "110024",
      preferredLanguage: "Hindi",
    },
  ];

  for (const cp of customerProfiles) {
    await prisma.customerProfile.upsert({
      where: { userId: cp.userId },
      update: {
        addressLine1: cp.addressLine1,
        city: cp.city,
        postalCode: cp.postalCode,
        preferredLanguage: cp.preferredLanguage,
      },
      create: {
        id: cp.id,
        userId: cp.userId,
        addressLine1: cp.addressLine1,
        city: cp.city,
        postalCode: cp.postalCode,
        preferredLanguage: cp.preferredLanguage,
      },
    });
  }

  // 4. Seed Delivery Profile
  console.log("🛵 Seeding delivery profile...");
  await prisma.deliveryProfile.upsert({
    where: { userId: "deliv-user-1" },
    update: {
      vehicleType: "Electric Scooter",
      licenseNumber: "DL-04-2022-887766",
      currentCity: "Delhi NCR",
      isOnline: true,
      totalDeliveries: 412,
      rating: 4.94,
      earningsTotal: 28400.0,
    },
    create: {
      id: "deliv-prof-1",
      userId: "deliv-user-1",
      vehicleType: "Electric Scooter",
      licenseNumber: "DL-04-2022-887766",
      currentCity: "Delhi NCR",
      isOnline: true,
      totalDeliveries: 412,
      rating: 4.94,
      earningsTotal: 28400.0,
    },
  });

  // 5. Seed Tailor Profiles, Menus, and Portfolios
  console.log("🧵 Seeding tailor profiles, menus, and portfolios...");
  for (const t of INITIAL_TAILORS) {
    // Map tailor-1 to tailor-1-user (Meera Devi's account)
    const userId = t.id === "tailor-1" ? "tailor-1-user" : t.userId;

    const tailorAvailability =
      t.availability === "BUSY"
        ? TailorAvailability.BUSY
        : t.availability === "NOT_ACCEPTING"
        ? TailorAvailability.NOT_ACCEPTING
        : TailorAvailability.AVAILABLE;

    const specializationsStr = Array.isArray(t.specializations)
      ? t.specializations.join(", ")
      : String(t.specializations);

    await prisma.tailorProfile.upsert({
      where: { id: t.id },
      update: {
        userId,
        businessName: t.businessName,
        tagline: t.tagline || null,
        bio: t.bio || null,
        experienceYears: t.experienceYears || 5,
        rating: t.rating || 4.8,
        reviewCount: t.reviewCount || 0,
        city: t.city || "Delhi NCR",
        address: t.address,
        availability: tailorAvailability,
        specializations: specializationsStr,
        avgStitchingDays: t.avgStitchingDays || 4,
        isVerified: t.isVerified ?? true,
        commissionRate: t.commissionRate || 0.15,
        coverImageUrl: t.coverImageUrl || null,
      },
      create: {
        id: t.id,
        userId,
        businessName: t.businessName,
        tagline: t.tagline || null,
        bio: t.bio || null,
        experienceYears: t.experienceYears || 5,
        rating: t.rating || 4.8,
        reviewCount: t.reviewCount || 0,
        city: t.city || "Delhi NCR",
        address: t.address,
        availability: tailorAvailability,
        specializations: specializationsStr,
        avgStitchingDays: t.avgStitchingDays || 4,
        isVerified: t.isVerified ?? true,
        commissionRate: t.commissionRate || 0.15,
        coverImageUrl: t.coverImageUrl || null,
      },
    });

    // Seed Menu Items
    for (const item of t.menuItems || []) {
      await prisma.menuItem.upsert({
        where: { id: item.id },
        update: {
          tailorId: t.id,
          category: item.category,
          name: item.name,
          description: item.description || null,
          basePrice: item.basePrice,
          estimatedDays: item.estimatedDays || 4,
          complexity: item.complexity || "REGULAR",
          imageUrl: item.imageUrl || null,
          isAvailable: item.isAvailable ?? true,
        },
        create: {
          id: item.id,
          tailorId: t.id,
          category: item.category,
          name: item.name,
          description: item.description || null,
          basePrice: item.basePrice,
          estimatedDays: item.estimatedDays || 4,
          complexity: item.complexity || "REGULAR",
          imageUrl: item.imageUrl || null,
          isAvailable: item.isAvailable ?? true,
        },
      });
    }

    // Seed Portfolios
    for (const port of t.portfolios || []) {
      const tagsStr = Array.isArray(port.tags) ? port.tags.join(", ") : port.tags || null;
      await prisma.portfolio.upsert({
        where: { id: port.id },
        update: {
          tailorId: t.id,
          title: port.title,
          description: port.description || null,
          garmentCategory: port.garmentCategory,
          imageUrl: port.imageUrl,
          tags: tagsStr,
        },
        create: {
          id: port.id,
          tailorId: t.id,
          title: port.title,
          description: port.description || null,
          garmentCategory: port.garmentCategory,
          imageUrl: port.imageUrl,
          tags: tagsStr,
        },
      });
    }
  }

  // 6. Seed Offers
  console.log("🏷️  Seeding promotional offers...");
  const validCodes = INITIAL_OFFERS.map((o) => o.code);
  await prisma.offer.deleteMany({
    where: { code: { notIn: validCodes } },
  });

  for (const off of INITIAL_OFFERS) {
    await prisma.offer.upsert({
      where: { code: off.code },
      update: {
        title: off.title,
        description: off.description,
        discountType: off.discountType,
        discountValue: off.discountValue,
        minOrderValue: off.minOrderValue,
        maxDiscount: off.maxDiscount ?? null,
        validUntil: new Date(off.validUntil),
        isActive: off.isActive ?? true,
      },
      create: {
        id: off.id,
        code: off.code,
        title: off.title,
        description: off.description,
        discountType: off.discountType,
        discountValue: off.discountValue,
        minOrderValue: off.minOrderValue,
        maxDiscount: off.maxDiscount ?? null,
        validUntil: new Date(off.validUntil),
        isActive: off.isActive ?? true,
      },
    });
  }

  // 7. Seed Customer Measurements
  console.log("📐 Seeding customer measurement profiles...");
  for (const m of INITIAL_MEASUREMENTS) {
    // Map customerId "cust-1" to CustomerProfile id "cust-prof-1"
    const customerProfileId = m.customerId === "cust-1" ? "cust-prof-1" : m.customerId;
    await prisma.measurementProfile.upsert({
      where: { id: m.id },
      update: {
        customerId: customerProfileId,
        profileName: m.profileName,
        garmentType: m.garmentType,
        type: m.type || "SAVED",
        measurementsJson: JSON.stringify(m.measurements),
        isDefault: m.isDefault ?? false,
      },
      create: {
        id: m.id,
        customerId: customerProfileId,
        profileName: m.profileName,
        garmentType: m.garmentType,
        type: m.type || "SAVED",
        measurementsJson: JSON.stringify(m.measurements),
        isDefault: m.isDefault ?? false,
      },
    });
  }

  // 8. Seed Orders and OrderItems
  console.log("📦 Seeding demo orders & order items...");
  const customerProfileMap: Record<string, string> = {
    "cust-1": "cust-prof-1",
    "cust-2": "cust-prof-2",
    "cust-3": "cust-prof-3",
  };

  for (const o of INITIAL_ORDERS) {
    const customerId = customerProfileMap[o.customerId] || "cust-prof-1";
    const status = (o.status as OrderStatus) || OrderStatus.PENDING_PAYMENT;

    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {
        id: o.id,
        customerId,
        tailorId: o.tailorId,
        status,
        stitchingPrice: o.stitchingPrice,
        doorstepDeliveryFee: o.doorstepDeliveryFee,
        discountAmount: o.discountAmount,
        membershipDiscount: o.membershipDiscount,
        taxAmount: o.taxAmount,
        finalPayableAmount: o.finalPayableAmount,
        platformCommission: o.platformCommission,
        tailorEarnings: o.tailorEarnings,
        pickupAddress: o.pickupAddress,
        deliveryAddress: o.deliveryAddress,
        pickupScheduledAt: o.pickupScheduledAt ? new Date(o.pickupScheduledAt) : null,
        expectedDeliveryDate: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate) : null,
        deliveryOtp: o.deliveryOtp || null,
      },
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        customerId,
        tailorId: o.tailorId,
        status,
        stitchingPrice: o.stitchingPrice,
        doorstepDeliveryFee: o.doorstepDeliveryFee,
        discountAmount: o.discountAmount,
        membershipDiscount: o.membershipDiscount,
        taxAmount: o.taxAmount,
        finalPayableAmount: o.finalPayableAmount,
        platformCommission: o.platformCommission,
        tailorEarnings: o.tailorEarnings,
        pickupAddress: o.pickupAddress,
        deliveryAddress: o.deliveryAddress,
        pickupScheduledAt: o.pickupScheduledAt ? new Date(o.pickupScheduledAt) : null,
        expectedDeliveryDate: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate) : null,
        deliveryOtp: o.deliveryOtp || null,
      },
    });

    // Create corresponding order item
    const orderItemId = `item-${o.id}`;
    await prisma.orderItem.upsert({
      where: { id: orderItemId },
      update: {
        orderId: o.id,
        garmentName: o.garmentName,
        complexity: "REGULAR",
        unitPrice: o.stitchingPrice,
        quantity: 1,
      },
      create: {
        id: orderItemId,
        orderId: o.id,
        garmentName: o.garmentName,
        complexity: "REGULAR",
        unitPrice: o.stitchingPrice,
        quantity: 1,
      },
    });
  }

  // 9. Seed Delivery Records
  console.log("🚚 Seeding delivery partner assignments...");
  for (const d of INITIAL_DELIVERY_JOBS) {
    const deliveryType = (d.type as DeliveryType) || DeliveryType.CUSTOMER_TO_TAILOR;
    const deliveryStatus = (d.status as DeliveryStatus) || DeliveryStatus.ASSIGNED;

    await prisma.delivery.upsert({
      where: { id: d.id },
      update: {
        orderId: d.orderId,
        deliveryProfileId: "deliv-prof-1",
        type: deliveryType,
        status: deliveryStatus,
        pickupAddressMasked: d.pickupAddressMasked,
        dropAddressMasked: d.dropAddressMasked,
        deliveryOtpVerified: d.deliveryOtpVerified ?? false,
        distanceKm: d.distanceKm ?? 4.0,
        payoutAmount: d.payoutAmount ?? 80.0,
      },
      create: {
        id: d.id,
        orderId: d.orderId,
        deliveryProfileId: "deliv-prof-1",
        type: deliveryType,
        status: deliveryStatus,
        pickupAddressMasked: d.pickupAddressMasked,
        dropAddressMasked: d.dropAddressMasked,
        deliveryOtpVerified: d.deliveryOtpVerified ?? false,
        distanceKm: d.distanceKm ?? 4.0,
        payoutAmount: d.payoutAmount ?? 80.0,
      },
    });
  }

  // 10. Seed Reviews
  console.log("⭐ Seeding customer reviews...");
  for (const r of INITIAL_REVIEWS) {
    // Only seed review if the order exists in our seeded orders
    const orderExists = INITIAL_ORDERS.some((o) => o.id === r.orderId);
    if (orderExists) {
      await prisma.review.upsert({
        where: { orderId: r.orderId },
        update: {
          id: r.id,
          customerId: "cust-prof-1",
          tailorId: r.tailorId,
          rating: r.rating,
          fitRating: r.fitRating ?? null,
          comment: r.comment || null,
        },
        create: {
          id: r.id,
          orderId: r.orderId,
          customerId: "cust-prof-1",
          tailorId: r.tailorId,
          rating: r.rating,
          fitRating: r.fitRating ?? null,
          comment: r.comment || null,
        },
      });
    }
  }

  console.log("✅ SILAI Database Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
