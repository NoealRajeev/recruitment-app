// lib/seed/seed.ts
import { hash } from "bcryptjs";
import {
  UserRole,
  AccountStatus,
  CompanySector,
  CompanySize,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { faker } from "@faker-js/faker";

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
    {
      email: "client@example.com",
      phone: "+1234567890",
      password: "Client@123",
      role: UserRole.CLIENT_ADMIN,
      name: "Demo Client",
      status: AccountStatus.VERIFIED,
      profilePicture: faker.image.avatar(),
      profile: {
        client: {
          companyName: "Demo Client Inc",
          registrationNo: "COMP-12345",
          companySector: CompanySector.CONSTRUCTION,
          companySize: CompanySize.MEDIUM,
          website: "https://democlient.com",
          address: "123 Business St, Downtown",
          city: "New York",
          country: "United States",
          postalCode: "10001",
          designation: "HR Manager",
        },
      },
    },
    {
      email: "agency@example.com",
      phone: "+1987654321",
      password: "Agency@123",
      role: UserRole.RECRUITMENT_AGENCY,
      name: "Demo Agency",
      status: AccountStatus.VERIFIED,
      profilePicture: faker.image.avatar(),
      profile: {
        agency: {
          agencyName: "Global Recruiters",
          registrationNo: "AGENCY-54321",
          licenseNumber: "LIC-12345",
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          country: "United States",
          address: "456 Recruitment Ave",
          city: "Chicago",
          postalCode: "60601",
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
    case UserRole.CLIENT_ADMIN:
      profileRelation = {
        clientProfile: {
          create: {
            companyName: userData.profile.client?.companyName || "",
            registrationNo: userData.profile.client?.registrationNo,
            companySector:
              userData.profile.client?.companySector || CompanySector.OTHER,
            companySize:
              userData.profile.client?.companySize || CompanySize.MEDIUM,
            website: userData.profile.client?.website,
            address: userData.profile.client?.address || "",
            city: userData.profile.client?.city || "",
            country: userData.profile.client?.country || "",
            postalCode: userData.profile.client?.postalCode,
            designation: userData.profile.client?.designation || "HR Manager",
          },
        },
      };
      break;
    case UserRole.RECRUITMENT_AGENCY:
      profileRelation = {
        agencyProfile: {
          create: {
            agencyName: userData.profile.agency?.agencyName || "",
            registrationNo: userData.profile.agency?.registrationNo,
            licenseNumber: userData.profile.agency?.licenseNumber || "",
            licenseExpiry: userData.profile.agency?.licenseExpiry || new Date(),
            country: userData.profile.agency?.country || "",
            address: userData.profile.agency?.address || "",
            city: userData.profile.agency?.city || "",
            postalCode: userData.profile.agency?.postalCode,
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
