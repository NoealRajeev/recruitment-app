// scripts/seedPermissions.ts
import { PrismaClient } from "@prisma/client";
import type { UserRole, Permission } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default roles and permissions
  const rolePermissions: Record<UserRole, Permission[]> = {
    RECRUITMENT_ADMIN: [
      "REQUEST_MANAGE_ALL",
      "CANDIDATE_MANAGE_ALL",
      "PROCEDURE_CREATE",
      "PROCEDURE_READ",
      "PROCEDURE_UPDATE",
      "PROCEDURE_DELETE",
      "AGENCY_CREATE",
      "AGENCY_READ",
      "AGENCY_UPDATE",
      "AGENCY_DELETE",
      "USER_CREATE",
      "USER_READ",
      "USER_UPDATE",
      "USER_DELETE",
      "DASHBOARD_ACCESS",
    ],
    CLIENT_ADMIN: [
      "REQUEST_CREATE",
      "REQUEST_READ",
      "REQUEST_UPDATE",
      "REQUEST_DELETE",
      "CANDIDATE_READ",
      "CANDIDATE_UPDATE",
      "PROCEDURE_READ",
      "DASHBOARD_ACCESS",
    ],
    RECRUITMENT_AGENCY: [
      "CANDIDATE_CREATE",
      "CANDIDATE_READ",
      "CANDIDATE_UPDATE",
      "PROCEDURE_READ",
      "DASHBOARD_ACCESS",
    ],
  };

  // Clear existing permissions
  await prisma.rolePermission.deleteMany();

  // Seed permissions for each role
  for (const [role, permissions] of Object.entries(rolePermissions)) {
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          role: role as UserRole,
          permission: permission as Permission,
        },
      });
    }
  }

  // Create a default admin user if none exists
  const adminEmail = "admin@breakthroughf1.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "RECRUITMENT_ADMIN",
        name: "System Admin",
        company: "Recruitment Company",
      },
    });
  }

  console.log("Permissions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
