import { prisma } from "../lib/prisma";

async function main() {
  const enums = await prisma.$queryRawUnsafe<{ typname: string; enumlabel: string }[]>(
    `SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder`
  );
  const grouped: Record<string, string[]> = {};
  for (const row of enums) {
    if (!grouped[row.typname]) grouped[row.typname] = [];
    grouped[row.typname].push(row.enumlabel);
  }
  console.log("Enums in PostgreSQL database:", JSON.stringify(grouped, null, 2));
}

main().finally(() => prisma.$disconnect());
