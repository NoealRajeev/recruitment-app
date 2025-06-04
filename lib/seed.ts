import { hash } from "bcryptjs";
import { UserRole, AccountStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

interface SeedUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  status: AccountStatus;
  phone?: string;
  profile: {
    // Shared fields
    contactPerson?: string;

    // Admin-specific fields
    admin?: {
      department?: string;
      canCreateUsers?: boolean;
    };

    // Client-specific fields
    client?: {
      companyName?: string;
      address?: string;
      businessLicense?: string;
      website?: string;
    };

    // Agency-specific fields
    agency?: {
      agencyName?: string;
      licenseNumber?: string;
      licenseExpiry?: Date;
      country?: string;
      regions?: string[];
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
      profile: {
        admin: {
          department: "Management",
          canCreateUsers: true,
        },
      },
    },
    {
      email: "client@example.com",
      phone: "+1234567890",
      password: "Client@123",
      role: UserRole.CLIENT_ADMIN,
      name: "Demo Client",
      status: AccountStatus.PENDING_REVIEW,
      profile: {
        contactPerson: "John Doe",
        client: {
          companyName: "Demo Client Inc",
          address: "123 Business St",
        },
      },
    },
    {
      email: "agency@example.com",
      phone: "+1987654321",
      password: "Agency@123",
      role: UserRole.RECRUITMENT_AGENCY,
      name: "Demo Agency",
      status: AccountStatus.NOT_VERIFIED,
      profile: {
        contactPerson: "Jane Smith",
        agency: {
          agencyName: "Global Recruiters",
          licenseNumber: "LIC-12345",
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          country: "United States",
          regions: ["North America", "Europe"],
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
  };

  // Role-specific profile creation
  let profileRelation = {};
  switch (userData.role) {
    case UserRole.RECRUITMENT_ADMIN:
      profileRelation = {
        admin: {
          create: {
            name: userData.name,
            department: userData.profile.admin?.department,
            canCreateUsers: userData.profile.admin?.canCreateUsers,
          },
        },
      };
      break;
    case UserRole.CLIENT_ADMIN:
      profileRelation = {
        client: {
          create: {
            companyName: userData.profile.client?.companyName,
            contactPerson: userData.profile.contactPerson,
            phone: userData.profile.phone,
            address: userData.profile.client?.address,
            businessLicense: userData.profile.client?.businessLicense,
            website: userData.profile.client?.website,
          },
        },
      };
      break;
    case UserRole.RECRUITMENT_AGENCY:
      profileRelation = {
        agency: {
          create: {
            agencyName: userData.profile.agency?.agencyName,
            licenseNumber: userData.profile.agency?.licenseNumber,
            licenseExpiry: userData.profile.agency?.licenseExpiry,
            country: userData.profile.agency?.country,
            regions: userData.profile.agency?.regions,
            contactPerson: userData.profile.contactPerson,
            phone: userData.profile.phone,
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
