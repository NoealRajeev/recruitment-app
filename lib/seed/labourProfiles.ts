// lib/seed/labourProfiles.ts
import { faker } from "@faker-js/faker";
import {
  Gender,
  LabourProfileStatus,
  DocumentVerificationStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";

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

  // --- Add a few Indian plumbers ---
  for (let i = 0; i < 5; i++) {
    const gender = faker.helpers.arrayElement<Gender>(["MALE", "FEMALE"]);
    const firstName =
      gender === "MALE"
        ? faker.person.firstName("male")
        : faker.person.firstName("female");
    const lastName = faker.person.lastName();
    const age = faker.number.int({ min: 22, max: 45 });
    const passportNumber = `P${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`;
    const passportExpiry = faker.date.future({ years: 5 });
    await prisma.labourProfile.create({
      data: {
        name: `${firstName} ${lastName}`,
        age,
        gender,
        nationality: "India",
        email: faker.internet.email({ firstName, lastName }),
        phone: `+91${faker.string.numeric(10)}`,
        profileImage: faker.image.avatar(),
        passportNumber,
        passportExpiry,
        passportVerified: true,
        status: "APPROVED",
        verificationStatus: "VERIFIED",
        jobRole: "Plumber",
        skills: skillsByJobRole["Plumber"],
        experience: `${faker.number.int({ min: 2, max: 15 })} years`,
        education: faker.helpers.arrayElement([
          "High School",
          "Vocational Training",
          "Diploma",
          "None",
        ]),
        languages: ["English", "Hindi"],
        agencyId: agencyUser.agencyProfile.id,
        requirementId: null,
        documentsSubmittedAt: faker.date.past(),
        documentsVerifiedAt: faker.date.recent(),
      },
    });
  }

  // --- Add 25 Indian Welders ---
  for (let i = 0; i < 200; i++) {
    const gender = faker.helpers.arrayElement<Gender>(["MALE", "FEMALE"]);
    const firstName =
      gender === "MALE"
        ? faker.person.firstName("male")
        : faker.person.firstName("female");
    const lastName = faker.person.lastName();
    await prisma.labourProfile.create({
      data: {
        name: `${firstName} ${lastName}`,
        age: faker.number.int({ min: 20, max: 75 }),
        gender,
        nationality: "India",
        email: faker.internet.email({ firstName, lastName }),
        phone: `+91${faker.string.numeric(10)}`,
        profileImage: faker.image.avatar(),
        passportNumber: `P${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`,
        passportExpiry: faker.date.future({ years: 5 }),
        passportVerified: true,
        status: "APPROVED",
        verificationStatus: "VERIFIED",
        jobRole: "Welder",
        skills: skillsByJobRole["Welder"],
        experience: "5 years",
        education: faker.helpers.arrayElement([
          "High School",
          "Vocational Training",
          "Diploma",
          "None",
        ]),
        languages: ["English", "Arabic"],
        agencyId: agencyUser.agencyProfile.id,
        requirementId: null,
        documentsSubmittedAt: faker.date.past(),
        documentsVerifiedAt: faker.date.recent(),
      },
    });
  }

  // --- Add 5 American Samoa Welders ---
  for (let i = 0; i < 5; i++) {
    const gender = faker.helpers.arrayElement<Gender>(["MALE", "FEMALE"]);
    const firstName =
      gender === "MALE"
        ? faker.person.firstName("male")
        : faker.person.firstName("female");
    const lastName = faker.person.lastName();
    await prisma.labourProfile.create({
      data: {
        name: `${firstName} ${lastName}`,
        age: faker.number.int({ min: 27, max: 37 }),
        gender,
        nationality: "American Samoa",
        email: faker.internet.email({ firstName, lastName }),
        phone: `+1${faker.string.numeric(10)}`,
        profileImage: faker.image.avatar(),
        passportNumber: `P${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`,
        passportExpiry: faker.date.future({ years: 5 }),
        passportVerified: true,
        status: "APPROVED",
        verificationStatus: "VERIFIED",
        jobRole: "Welder",
        skills: skillsByJobRole["Welder"],
        experience: "2 years",
        education: faker.helpers.arrayElement([
          "High School",
          "Vocational Training",
          "Diploma",
          "None",
        ]),
        languages: ["Arabic", "English", "Hindi"],
        agencyId: agencyUser.agencyProfile.id,
        requirementId: null,
        documentsSubmittedAt: faker.date.past(),
        documentsVerifiedAt: faker.date.recent(),
      },
    });
  }

  // --- Add 5 Indian Welders (age 16-26, experience 2 years, languages Urdu, Hindi, English) ---
  for (let i = 0; i < 25; i++) {
    const gender = faker.helpers.arrayElement<Gender>(["MALE", "FEMALE"]);
    const firstName =
      gender === "MALE"
        ? faker.person.firstName("male")
        : faker.person.firstName("female");
    const lastName = faker.person.lastName();
    await prisma.labourProfile.create({
      data: {
        name: `${firstName} ${lastName}`,
        age: faker.number.int({ min: 16, max: 26 }), // Age range for preferred age 21
        gender,
        nationality: "India",
        email: faker.internet.email({ firstName, lastName }),
        phone: `+91${faker.string.numeric(10)}`,
        profileImage: faker.image.avatar(),
        passportNumber: `P${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`,
        passportExpiry: faker.date.future({ years: 5 }),
        passportVerified: true,
        status: "APPROVED",
        verificationStatus: "VERIFIED",
        jobRole: "Welder",
        skills: skillsByJobRole["Welder"],
        experience: "2 years",
        education: faker.helpers.arrayElement([
          "High School",
          "Vocational Training",
          "Diploma",
          "None",
        ]),
        languages: ["Urdu", "Hindi", "English"],
        agencyId: agencyUser.agencyProfile.id,
        requirementId: null,
        documentsSubmittedAt: faker.date.past(),
        documentsVerifiedAt: faker.date.recent(),
        // salary: 121, // QAR (add to schema if needed)
        // startDate: new Date("2025-07-18"),
        // duration: "6 Months",
        // healthInsurance: "asPerLaw",
        // tickets: "ANNUAL",
        // foodAllowance: 21,
        // housingAllowance: 21,
        // transportationAllowance: 21,
        // mobileAllowance: 21,
        // workLocations: "SITE",
      },
    });
  }
}
