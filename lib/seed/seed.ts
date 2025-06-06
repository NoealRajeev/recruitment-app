// lib/seed/seed.ts
import { hash } from "bcryptjs";
import {
  UserRole,
  AccountStatus,
  CompanySector,
  CompanySize,
  DocumentType,
  RequirementStatus,
  LabourProfileStatus,
  Gender,
  ExperienceLevel,
  ContractDuration,
  TicketType,
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
      regions: string[];
      website?: string;
      address: string;
      city: string;
      postalCode?: string;
    };
  };
}

interface SeedRequirement {
  title: string;
  description?: string;
  projectLocation: string;
  startDate: Date;
  contractDuration: ContractDuration;
  minExperience: ExperienceLevel;
  maxAge?: number;
  ticketType?: TicketType;
  ticketProvided: boolean;
  languages: string[];
  specialNotes?: string;
  jobRoles: {
    title: string;
    description?: string;
    quantity: number;
    nationality: string;
    salary: number;
  }[];
}

interface SeedLabourProfile {
  name: string;
  age: number;
  gender: Gender;
  nationality: string;
  maritalStatus?: string;
  skills: string[];
  experienceYears: number;
  education?: string;
  currentPosition?: string;
  currentCompany?: string;
  languages: string[];
  englishProficiency?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  cvUrl: string;
  passportNumber?: string;
  passportExpiry?: Date;
  visaType?: string;
  visaExpiry?: Date;
  medicalStatus?: string;
  medicalExpiry?: Date;
  photo?: string;
  status: LabourProfileStatus;
}

export async function seedDatabase() {
  try {
    await seedBaseData();
    await seedRequirements();
    await seedLabourProfiles();
    await seedDocuments();
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
          regions: ["North America", "Europe"],
          website: "https://globalrecruiters.com",
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
            regions: userData.profile.agency?.regions || [],
            website: userData.profile.agency?.website,
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

async function seedRequirements() {
  const client = await prisma.client.findFirst({
    where: { companyName: "Demo Client Inc" },
  });

  const agency = await prisma.agency.findFirst({
    where: { agencyName: "Global Recruiters" },
  });

  if (!client) {
    console.log("ℹ️ No client found to create requirements");
    return;
  }

  const requirementsToSeed: SeedRequirement[] = [
    {
      title: "Construction Workers Needed",
      description: "Need skilled construction workers for high-rise project",
      projectLocation: "Downtown Doha",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      contractDuration: ContractDuration.TWO_YEARS,
      minExperience: ExperienceLevel.TWO_YEARS,
      maxAge: 45,
      ticketType: TicketType.TWO_WAY,
      ticketProvided: true,
      languages: ["English", "Hindi"],
      specialNotes: "Must have experience with high-rise buildings",
      jobRoles: [
        {
          title: "Mason",
          description: "Skilled mason for block and brick work",
          quantity: 10,
          nationality: "India",
          salary: 1200,
        },
        {
          title: "Carpenter",
          quantity: 5,
          nationality: "Nepal",
          salary: 1500,
        },
      ],
    },
    {
      title: "Hotel Staff Recruitment",
      projectLocation: "Lusail City",
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      contractDuration: ContractDuration.ONE_YEAR,
      minExperience: ExperienceLevel.ONE_YEAR,
      languages: ["English", "Arabic"],
      ticketProvided: false,
      jobRoles: [
        {
          title: "Housekeeping Staff",
          quantity: 20,
          nationality: "Philippines",
          salary: 1000,
        },
        {
          title: "Receptionist",
          quantity: 3,
          nationality: "Any",
          salary: 1800,
        },
      ],
    },
  ];

  for (const reqData of requirementsToSeed) {
    await prisma.requirement.create({
      data: {
        title: reqData.title,
        description: reqData.description,
        projectLocation: reqData.projectLocation,
        startDate: reqData.startDate,
        contractDuration: reqData.contractDuration,
        minExperience: reqData.minExperience,
        maxAge: reqData.maxAge,
        ticketType: reqData.ticketType,
        ticketProvided: reqData.ticketProvided,
        languages: reqData.languages,
        specialNotes: reqData.specialNotes,
        status: RequirementStatus.APPROVED,
        clientId: client.id,
        assignedAgencyId: agency?.id,
        jobRoles: {
          create: reqData.jobRoles,
        },
      },
    });
    console.log(`✅ Created requirement: ${reqData.title}`);
  }
}

async function seedLabourProfiles() {
  const agency = await prisma.agency.findFirst({
    where: { agencyName: "Global Recruiters" },
  });

  const requirement = await prisma.requirement.findFirst({
    where: { title: "Construction Workers Needed" },
  });

  if (!agency || !requirement) {
    console.log("ℹ️ No agency or requirement found to create labour profiles");
    return;
  }

  const profilesToSeed: SeedLabourProfile[] = [
    {
      name: "Rajesh Kumar",
      age: 32,
      gender: Gender.MALE,
      nationality: "India",
      maritalStatus: "Married",
      skills: ["Masonry", "Concrete Work", "Block Laying"],
      experienceYears: 8,
      education: "High School",
      currentPosition: "Senior Mason",
      currentCompany: "BuildRight Constructions",
      languages: ["Hindi", "English"],
      englishProficiency: "Intermediate",
      phone: "+919876543210",
      address: "123 Worker Street, Mumbai",
      city: "Mumbai",
      country: "India",
      cvUrl: "https://example.com/cvs/rajesh_kumar.pdf",
      passportNumber: "P12345678",
      passportExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3), // 3 years from now
      status: LabourProfileStatus.APPROVED,
    },
    {
      name: "Nirmal Gurung",
      age: 28,
      gender: Gender.MALE,
      nationality: "Nepal",
      skills: ["Carpentry", "Formwork", "Furniture Making"],
      experienceYears: 5,
      languages: ["Nepali", "Hindi"],
      englishProficiency: "Basic",
      phone: "+977987654321",
      cvUrl: "https://example.com/cvs/nirmal_gurung.pdf",
      status: LabourProfileStatus.UNDER_REVIEW,
    },
    {
      name: "Maria Santos",
      age: 25,
      gender: Gender.FEMALE,
      nationality: "Philippines",
      skills: ["Housekeeping", "Laundry", "Customer Service"],
      experienceYears: 3,
      languages: ["English", "Tagalog"],
      englishProficiency: "Fluent",
      phone: "+639123456789",
      cvUrl: "https://example.com/cvs/maria_santos.pdf",
      status: LabourProfileStatus.READY_FOR_DEPLOYMENT,
    },
  ];

  for (const profileData of profilesToSeed) {
    await prisma.labourProfile.create({
      data: {
        ...profileData,
        agencyId: agency.id,
        requirementId: requirement.id,
      },
    });
    console.log(`✅ Created labour profile: ${profileData.name}`);
  }
}

async function seedDocuments() {
  const client = await prisma.client.findFirst();
  const agency = await prisma.agency.findFirst();
  const admin = await prisma.admin.findFirst();
  const requirement = await prisma.requirement.findFirst();

  if (!client || !agency || !admin || !requirement) {
    console.log("ℹ️ Missing required entities to create documents");
    return;
  }

  // Client documents
  await prisma.clientDocument.create({
    data: {
      type: DocumentType.COMPANY_REGISTRATION,
      url: "https://example.com/docs/client_cr.pdf",
      name: "Company Registration",
      description: "Official company registration document",
      verified: true,
      clientId: client.id,
      verifiedById: admin.userId,
    },
  });

  await prisma.clientDocument.create({
    data: {
      type: DocumentType.LICENSE,
      url: "https://example.com/docs/client_license.pdf",
      name: "Business License",
      verified: false,
      clientId: client.id,
    },
  });

  // Agency documents
  await prisma.agencyDocument.create({
    data: {
      type: DocumentType.LICENSE,
      url: "https://example.com/docs/agency_license.pdf",
      name: "Recruitment License",
      description: "Official recruitment agency license",
      verified: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      agencyId: agency.id,
      verifiedById: admin.userId,
    },
  });

  await prisma.agencyDocument.create({
    data: {
      type: DocumentType.INSURANCE,
      url: "https://example.com/docs/agency_insurance.pdf",
      name: "Professional Liability Insurance",
      verified: false,
      agencyId: agency.id,
    },
  });

  // Requirement documents
  await prisma.requirementDocument.create({
    data: {
      type: DocumentType.OTHER,
      url: "https://example.com/docs/project_specs.pdf",
      name: "Project Specifications",
      description: "Detailed project requirements and specifications",
      requirementId: requirement.id,
      uploadedById: client.userId,
    },
  });

  console.log("✅ Created sample documents");
}
