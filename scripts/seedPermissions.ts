// scripts/seedPermissions.ts
import { seedDatabase } from "../lib/seed/seed";
// import prisma from "@/lib/prisma";

(async () => {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();
