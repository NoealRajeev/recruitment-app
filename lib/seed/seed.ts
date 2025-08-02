// lib/seed/seed.ts
import { hash } from "bcryptjs";
import {
  UserRole,
  AccountStatus,
  CompanySector,
  CompanySize,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "@/lib/prisma";

interface SeedUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  status: AccountStatus;
  phone?: string;
  altContact?: string;
  profilePicture?: string;
  profile: {
    // Admin-specific fields
    admin?: {
      department?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      permissions?: any;
    };

    // Client-specific fields
    client?: {
      companyName: string;
      registrationNo?: string;
      companySector: CompanySector;
      companySize: CompanySize;
      website?: string;
      address: string;
      city: string;
      country: string;
      postalCode?: string;
      designation: string;
    };

    // Agency-specific fields
    agency?: {
      agencyName: string;
      registrationNo?: string;
      licenseNumber: string;
      licenseExpiry: Date;
      country: string;
      address: string;
      city: string;
      postalCode?: string;
    };
  };
}
export async function seedDatabase() {
  try {
    await seedBaseData();
    console.log("🌱 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedBaseData() {
  const usersToSeed: SeedUser[] = [
    {
      email: "admin@findly.com",
      phone: "+1234567899",
      password: "SecureAdmin@123",
      role: UserRole.RECRUITMENT_ADMIN,
      name: "System Admin",
      status: AccountStatus.VERIFIED,
      profilePicture: faker.image.avatar(),
      profile: {
        admin: {
          department: "Management",
          permissions: {
            canCreateUsers: true,
            canVerifyClients: true,
            canVerifyAgencies: true,
          },
        },
      },
    },
  ];

  for (const userData of usersToSeed) {
    await seedUserWithProfile(userData);
  }
}

async function seedUserWithProfile(userData: SeedUser) {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    console.log(`ℹ️ User ${userData.email} already exists`);
    return;
  }

  const hashedPassword = await hash(userData.password, 12);

  const userCreateData = {
    email: userData.email,
    password: hashedPassword,
    role: userData.role,
    status: userData.status,
    resetRequired: true,
    name: userData.name,
    phone: userData.phone,
    altContact: userData.altContact,
    profilePicture: userData.profilePicture,
  };

  // Role-specific profile creation
  let profileRelation = {};
  switch (userData.role) {
    case UserRole.RECRUITMENT_ADMIN:
      profileRelation = {
        adminProfile: {
          create: {
            name: userData.name,
            department: userData.profile.admin?.department,
            permissions: userData.profile.admin?.permissions || {},
          },
        },
      };
      break;
  }

  await prisma.user.create({
    data: {
      ...userCreateData,
      ...profileRelation,
    },
  });

  console.log(`✅ Created ${userData.role} user: ${userData.email}`);
}
