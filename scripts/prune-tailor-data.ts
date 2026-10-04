import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("✂️ Pruning fake tailors (tailor-2 to tailor-10)...");

  // 1. Update lib/db/seed-data.ts
  const seedDataPath = path.join(__dirname, "../lib/db/seed-data.ts");
  let content = fs.readFileSync(seedDataPath, "utf-8");

  // Find tailor-1 end and tailor-10 end
  const startIdx = content.indexOf('    id: "tailor-2",');
  const endMarker = 'export const INITIAL_OFFERS: Offer[] = [';
  const endIdx = content.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    // Find the opening brace before tailor-2
    const braceBefore = content.lastIndexOf("  {\n", startIdx) !== -1 
      ? content.lastIndexOf("  {\n", startIdx) 
      : content.lastIndexOf("  {\r\n", startIdx);
    
    // Find the closing bracket before INITIAL_OFFERS
    const bracketBeforeOffers = content.lastIndexOf("];", endIdx);
    
    if (braceBefore !== -1 && bracketBeforeOffers !== -1) {
      content = content.slice(0, braceBefore) + "];\n\n" + content.slice(endIdx);
      console.log("✅ Trimmed INITIAL_TAILORS in lib/db/seed-data.ts");
    }
  }

  // Update order-2 tailorId in seed-data.ts
  content = content.replace(
    'tailorId: "tailor-2",\n    tailorName: "Masterji Ahmed & Sons",\n    tailorAddress: "Shop 14, Dariba Kalan, Chandni Chowk, Delhi",',
    'tailorId: "tailor-1",\n    tailorName: "Zari & Resham by Meera",\n    tailorAddress: "B-42, Ring Road Market, South Extension Part 1, New Delhi",'
  ).replace(
    'tailorId: "tailor-2",\r\n    tailorName: "Masterji Ahmed & Sons",\r\n    tailorAddress: "Shop 14, Dariba Kalan, Chandni Chowk, Delhi",',
    'tailorId: "tailor-1",\r\n    tailorName: "Zari & Resham by Meera",\r\n    tailorAddress: "B-42, Ring Road Market, South Extension Part 1, New Delhi",'
  );

  // Update rev-2 tailorId in seed-data.ts
  content = content.replace(
    'id: "rev-2",\n    orderId: "order-prev-1",\n    customerId: "cust-3",\n    customerName: "Ritu Singhal",\n    tailorId: "tailor-2",',
    'id: "rev-2",\n    orderId: "order-prev-1",\n    customerId: "cust-3",\n    customerName: "Ritu Singhal",\n    tailorId: "tailor-1",'
  ).replace(
    'id: "rev-2",\r\n    orderId: "order-prev-1",\r\n    customerId: "cust-3",\r\n    customerName: "Ritu Singhal",\r\n    tailorId: "tailor-2",',
    'id: "rev-2",\r\n    orderId: "order-prev-1",\r\n    customerId: "cust-3",\r\n    customerName: "Ritu Singhal",\r\n    tailorId: "tailor-1",'
  );

  fs.writeFileSync(seedDataPath, content, "utf-8");
  console.log("✅ Saved updated lib/db/seed-data.ts");

  // 2. Clean up PostgreSQL database
  const fakeTailorIds = [
    "tailor-2", "tailor-3", "tailor-4", "tailor-5",
    "tailor-6", "tailor-7", "tailor-8", "tailor-9", "tailor-10"
  ];

  console.log("🧹 Cleaning up PostgreSQL database records for fake tailors...");

  // Update any orders pointing to fake tailors to point to tailor-1
  const updatedOrders = await prisma.order.updateMany({
    where: { tailorId: { in: fakeTailorIds } },
    data: { tailorId: "tailor-1" }
  });
  console.log(`Updated ${updatedOrders.count} orders to tailor-1`);

  // Delete reviews for fake tailors
  const deletedReviews = await prisma.review.deleteMany({
    where: { tailorId: { in: fakeTailorIds } }
  });
  console.log(`Deleted ${deletedReviews.count} reviews`);

  // Delete menu items for fake tailors
  const deletedMenuItems = await prisma.menuItem.deleteMany({
    where: { tailorId: { in: fakeTailorIds } }
  });
  console.log(`Deleted ${deletedMenuItems.count} menu items`);

  // Delete portfolios for fake tailors
  const deletedPortfolios = await prisma.portfolio.deleteMany({
    where: { tailorId: { in: fakeTailorIds } }
  });
  console.log(`Deleted ${deletedPortfolios.count} portfolios`);

  // Delete tailor profiles
  const deletedProfiles = await prisma.tailorProfile.deleteMany({
    where: { id: { in: fakeTailorIds } }
  });
  console.log(`Deleted ${deletedProfiles.count} tailor profiles`);

  // Delete fake tailor users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: "@silai.demo" } },
        { id: { in: fakeTailorIds.map(id => `user-${id}`) } }
      ]
    }
  });
  console.log(`Deleted ${deletedUsers.count} fake tailor users`);

  // Count remaining tailors
  const remainingTailors = await prisma.tailorProfile.findMany({
    select: { id: true, businessName: true, isVerified: true }
  });
  console.log("📊 Remaining tailors in DB:", remainingTailors);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
