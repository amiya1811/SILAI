import { PrismaClient, Role } from "@prisma/client";
import { comparePassword } from "../lib/auth/hash";
import { signToken, verifyToken } from "../lib/auth/jwt";

const prisma = new PrismaClient();

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`, detail || "");
    failCount++;
  }
}

async function runTests() {
  console.log("══════════════════════════════════════════════════════════════════");
  console.log("👑 SILAI ADMIN AUTHENTICATION & RBAC SECURITY VERIFICATION");
  console.log("══════════════════════════════════════════════════════════════════\n");

  const newAdminEmail = "amiyaranjanpatra1811@gmail.com";
  const oldAdminEmail = "admin@silai.luxury";
  const plainPassword = process.env.ADMIN_PASSWORD || "Amiya@1811";

  try {
    // 1. Verify new admin exists in PostgreSQL
    console.log("🔍 1. Database User Verification");
    const adminUser = await prisma.user.findUnique({
      where: { email: newAdminEmail },
    });
    assert(!!adminUser, `Admin user exists in PostgreSQL (${newAdminEmail})`);
    assert(adminUser?.role === Role.ADMIN, "User role is strictly ADMIN");
    assert(adminUser?.isActive === true, "Admin account is active");
    assert(adminUser?.isVerified === true, "Admin account is verified");

    // 2. Verify old admin email is purged
    console.log("\n🧹 2. Legacy Account Purge Check");
    const oldAdminUser = await prisma.user.findUnique({
      where: { email: oldAdminEmail },
    });
    assert(oldAdminUser === null, `Legacy email (${oldAdminEmail}) no longer exists in database`);

    // 3. Verify exactly ONE admin user in database
    console.log("\n👤 3. Single Admin Constraint");
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN },
    });
    assert(totalAdmins === 1, `Exactly 1 admin exists in the database (count: ${totalAdmins})`);

    // 4. Verify password authentication
    console.log("\n🔑 4. Bcrypt Cryptographic Password Verification");
    assert(!adminUser?.passwordHash?.includes("Amiya@1811"), "Password is NOT stored as plaintext");
    assert(Boolean(adminUser?.passwordHash?.startsWith("$2a$") || adminUser?.passwordHash?.startsWith("$2b$")), "Password is a valid bcrypt hash");

    const isMatch = await comparePassword(plainPassword, adminUser!.passwordHash);
    assert(isMatch === true, "Authentication succeeds with newly set admin credentials");

    const isWrongMatch = await comparePassword("WrongPassword@123", adminUser!.passwordHash);
    assert(isWrongMatch === false, "Authentication strictly fails with wrong password");

    // 5. Verify Session & JWT generation
    console.log("\n🎫 5. Admin JWT Token & RBAC Claims");
    const sessionPayload = {
      id: adminUser!.id,
      email: adminUser!.email,
      fullName: adminUser!.fullName,
      role: adminUser!.role,
      phone: adminUser!.phone || undefined,
      avatarUrl: adminUser!.avatarUrl || undefined,
    };

    const token = signToken(sessionPayload);
    assert(!!token, "Signed luxury JWT session token generated");

    const decoded = verifyToken(token);
    assert(decoded?.email === newAdminEmail, `JWT claims match email: ${decoded?.email}`);
    assert(decoded?.role === Role.ADMIN, "JWT claims preserve ADMIN role");

    // 6. Verify Admin Metrics Access Capability
    console.log("\n📊 6. Admin Metrics Aggregation Verification");
    const [totalOrders, totalTailors, totalDeliveries, totalGMV] = await Promise.all([
      prisma.order.count(),
      prisma.tailorProfile.count(),
      prisma.delivery.count(),
      prisma.order.aggregate({ _sum: { finalPayableAmount: true } }),
    ]);

    assert(totalOrders > 0, `Admin metrics: ${totalOrders} orders accessible`);
    assert(totalTailors >= 1, `Admin metrics: ${totalTailors} tailor studios accessible`);
    assert(totalDeliveries > 0, `Admin metrics: ${totalDeliveries} delivery jobs accessible`);
    assert((totalGMV._sum.finalPayableAmount || 0) > 0, `Admin metrics: GMV calculation verified (₹${totalGMV._sum.finalPayableAmount})`);

  } catch (err) {
    console.error("Test execution error:", err);
    failCount++;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(`🏁 ADMIN VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("══════════════════════════════════════════════════════════════════\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
