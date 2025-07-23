// lib/seed/seed.ts
import { hash } from "bcryptjs";
import { UserRole, AccountStatus } from "@prisma/client";
import prisma from "../prisma";

async function seedAdmin() {
  const email = "admin@findly.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin user already exists (${email})`);
    return;
  }

  const password = await hash("SecureAdmin@123", 12);

  const user = await prisma.user.create({
    data: {
      name: "System Admin",
      email,
      password,
      role: UserRole.RECRUITMENT_ADMIN,
      status: AccountStatus.VERIFIED,
      resetRequired: true,
      adminProfile: {
        create: {
          name: "System Admin",
          department: "Management",
          permissions: {
            canCreateUsers: true,
            canVerifyClients: true,
            canVerifyAgencies: true,
          },
        },
      },
    },
  });

  console.log(`✅ Seeded admin user: ${user.email}`);
}

async function main() {
  try {
    await seedAdmin();
    console.log("🌱 Seeding complete");
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
