// lib/ensureSeeded.ts
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "./seed";

const prisma = new PrismaClient();

export async function ensureDatabaseSeeded() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "RECRUITMENT_ADMIN" },
    });

    if (adminCount === 0) {
      console.log("No admin user found, seeding database...");
      await seedDatabase();
    }
  } catch (error) {
    console.error("Error checking seed status:", error);
  } finally {
    await prisma.$disconnect();
  }
}
