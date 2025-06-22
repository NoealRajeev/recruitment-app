// lib/seed/labourProfiles.ts
import { faker } from "@faker-js/faker";
import {
  Gender,
  LabourProfileStatus,
  DocumentVerificationStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";

const jobRoles = [
  "Carpenter",
  "Electrician",
  "Plumber",
  "Welder",
  "Driver",
  "Cleaner",
  "Cook",
];

const nationalities = [
  "India",
  "Pakistan",
  "Bangladesh",
  "Nepal",
  "Philippines",
  "Sri Lanka",
  "Indonesia",
];

const skillsByJobRole: Record<string, string[]> = {
  Carpenter: ["Woodworking", "Furniture Making", "Framing", "Finishing"],
  Electrician: ["Wiring", "Troubleshooting", "Installation", "Maintenance"],
  Plumber: ["Pipe Fitting", "Drain Cleaning", "Installation", "Repair"],
  Welder: ["MIG Welding", "TIG Welding", "Arc Welding", "Fabrication"],
  Driver: ["Heavy Vehicle", "Light Vehicle", "Defensive Driving", "Navigation"],
  Cleaner: [
    "Housekeeping",
    "Sanitation",
    "Commercial Cleaning",
    "Deep Cleaning",
  ],
  Cook: ["Food Preparation", "Baking", "Grilling", "Menu Planning"],
};

const languages = ["English", "Hindi", "Arabic", "Urdu", "Bengali", "Tamil"];

export async function seedLabourProfiles() {
  // Get the agency user (we'll use the demo agency created in your base seed)
  const agencyUser = await prisma.user.findUnique({
    where: { email: "agency@example.com" },
    include: { agencyProfile: true },
  });

  if (!agencyUser || !agencyUser.agencyProfile) {
    console.error("Agency not found. Please run base seed first.");
    return;
  }

  // Get all job roles from the database
  const dbJobRoles = await prisma.jobRole.findMany({
    select: { id: true, title: true, requirementId: true },
  });

  // If no job roles exist, create some sample requirements with job roles
  if (dbJobRoles.length < 5) {
    console.log("Creating sample requirements with job roles...");
    const client = await prisma.client.findFirst();

    if (!client) {
      console.error("No client found. Please run base seed first.");
      return;
    }

    // Create a sample requirement
    const requirement = await prisma.requirement.create({
      data: {
        clientId: client.id,
        status: "SUBMITTED",
        jobRoles: {
          create: jobRoles.map((title) => ({
            title,
            quantity: 200,
            nationality: "India",
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            basicSalary: 1000,
            healthInsurance: "Provided by company",
            languageRequirements: ["English"],
          })),
        },
      },
      include: { jobRoles: true },
    });

    dbJobRoles.push(...requirement.jobRoles);
  }

  // Create 200 labour profiles for each job role
  for (const jobRole of dbJobRoles) {
    console.log(`Seeding labour profiles for job role: ${jobRole.title}`);

    const existingProfilesCount = await prisma.labourProfile.count({
      where: { jobRole: jobRole.title },
    });

    if (existingProfilesCount >= 200) {
      console.log(
        `Already have ${existingProfilesCount} profiles for ${jobRole.title}, skipping...`
      );
      continue;
    }

    const profilesToCreate = 200 - existingProfilesCount;
    console.log(`Creating ${profilesToCreate} profiles for ${jobRole.title}`);

    for (let i = 0; i < profilesToCreate; i++) {
      const gender = faker.helpers.arrayElement<Gender>(["MALE", "FEMALE"]);
      const firstName =
        gender === "MALE"
          ? faker.person.firstName("male")
          : faker.person.firstName("female");
      const lastName = faker.person.lastName();
      const nationality = faker.helpers.arrayElement(nationalities);
      const age = faker.number.int({ min: 18, max: 50 });
      const passportNumber = `P${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`;
      const passportExpiry = faker.date.future({ years: 5 });

      await prisma.labourProfile.create({
        data: {
          name: `${firstName} ${lastName}`,
          age,
          gender,
          nationality,
          email: faker.internet.email({ firstName, lastName }),
          phone: `+${faker.string.numeric(10)}`,
          profileImage: faker.image.avatar(),
          passportNumber,
          passportExpiry,
          passportVerified: faker.datatype.boolean(),
          status: faker.helpers.arrayElement<LabourProfileStatus>([
            "RECEIVED",
            "UNDER_REVIEW",
            "APPROVED",
            "SHORTLISTED",
          ]),
          verificationStatus:
            faker.helpers.arrayElement<DocumentVerificationStatus>([
              "PENDING",
              "PARTIALLY_VERIFIED",
              "VERIFIED",
            ]),
          jobRole: jobRole.title,
          skills: faker.helpers.arrayElements(
            skillsByJobRole[jobRole.title] || ["General Labor"],
            { min: 1, max: 3 }
          ),
          experience: `${faker.number.int({ min: 1, max: 15 })} years`,
          education: faker.helpers.arrayElement([
            "High School",
            "Vocational Training",
            "Diploma",
            "None",
          ]),
          languages: faker.helpers.arrayElements(languages, { min: 1, max: 3 }),
          agencyId: agencyUser.agencyProfile.id,
          requirementId: jobRole.requirementId,
          documentsSubmittedAt: faker.date.past(),
          ...(faker.datatype.boolean() && {
            documentsVerifiedAt: faker.date.recent(),
          }),
        },
      });

      if (i > 0 && i % 50 === 0) {
        console.log(`Created ${i} profiles for ${jobRole.title}`);
      }
    }

    console.log(`✅ Successfully seeded 200 profiles for ${jobRole.title}`);
  }
}
