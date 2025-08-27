// lib/seed/seed.ts
import { hash } from "bcryptjs";
import {
  UserRole,
  AccountStatus,
  CompanySector,
  CompanySize,
  Department,
  RequirementOptionType,
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
    admin?: {
      department?: Department;
      permissions?: any;
    };
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
          department: Department.OPERATIONS,
          permissions: {
            canCreateUsers: true,
            canVerifyClients: true,
            canVerifyAgencies: true,
            canEditRequirementOptions: true,
          },
        },
      },
    },
  ];

  for (const userData of usersToSeed) {
    await seedUserWithProfile(userData);
  }

  await seedRequirementOptions();
  console.log("✅ Requirement options seeded");
}

async function seedUserWithProfile(userData: SeedUser) {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    console.log(`ℹ️ User ${userData.email} already exists`);
    await ensureUserSettings(existingUser.id);
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

  let profileRelation = {};
  if (userData.role === UserRole.RECRUITMENT_ADMIN) {
    profileRelation = {
      adminProfile: {
        create: {
          name: userData.name,
          department: userData.profile.admin?.department,
          permissions: userData.profile.admin?.permissions || {},
        },
      },
    };
  }

  const created = await prisma.user.create({
    data: {
      ...userCreateData,
      ...profileRelation,
    },
  });

  await ensureUserSettings(created.id);
  console.log(`✅ Created ${userData.role} user: ${userData.email}`);
}

async function ensureUserSettings(userId: string) {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.userSettings.create({ data: { userId } });
  }
}

/**
 * Centralized requirement options taken from translation table
 */
const requirementOptionSeeds: Record<RequirementOptionType, string[]> = {
  JOB_TITLE: [
    "Carpenter",
    "Electrician",
    "Plumber",
    "Welder",
    "Driver",
    "Cleaner",
    "Cook",
  ],
  TICKET_FREQUENCY: ["Annual", "Biennial", "End of Contract"],
  WORK_LOCATION: ["Office", "Site", "Hybrid", "Remote"],
  PREVIOUS_EXPERIENCE: [
    "GCC Experience",
    "Qatar Experience",
    "Overseas Experience",
  ],
  LANGUAGE: ["English", "Arabic", "Hindi", "Urdu", "Tagalog"],
  CURRENCY: ["QAR", "USD", "EUR"],
  CONTRACT_DURATION: [
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
    "2 Years",
    "3 Years",
    "5+ Years",
  ],
};

async function seedRequirementOptions() {
  for (const [type, values] of Object.entries(requirementOptionSeeds)) {
    await Promise.all(
      values.map(async (value, index) => {
        const existing = await prisma.requirementOption.findFirst({
          where: { type: type as RequirementOptionType, value },
          select: { id: true },
        });
        if (existing) {
          await prisma.requirementOption.update({
            where: { id: existing.id },
            data: { isActive: true, order: index },
          });
        } else {
          await prisma.requirementOption.create({
            data: {
              type: type as RequirementOptionType,
              value,
              order: index,
              isActive: true,
            },
          });
        }
      })
    );
    console.log(`✅ Seeded ${type} options (${values.length} entries)`);
  }
}
