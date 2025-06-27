// app/api/agencies/labour-profiles/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  LabourProfileStatus,
  DocumentVerificationStatus,
  AccountStatus,
  DocumentCategory,
  DocumentType,
  Gender,
} from "@/lib/generated/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as LabourProfileStatus | null;
    const verificationStatus = searchParams.get(
      "verificationStatus"
    ) as DocumentVerificationStatus | null;
    const nationality = searchParams.get("nationality");
    const skill = searchParams.get("skill");
    const jobRole = searchParams.get("jobRole");
    const requirementId = searchParams.get("requirementId");

    const labourProfiles = await prisma.labourProfile.findMany({
      where: {
        agencyId: agency.id,
        ...(status
          ? { status }
          : {
              NOT: [
                { status: LabourProfileStatus.DEPLOYED },
                { status: LabourProfileStatus.REJECTED },
                { status: LabourProfileStatus.SHORTLISTED },
                { verificationStatus: DocumentVerificationStatus.PENDING },
                { verificationStatus: DocumentVerificationStatus.REJECTED },
              ],
            }),
        ...(verificationStatus ? { verificationStatus } : {}),
        ...(nationality ? { nationality } : {}),
        ...(skill ? { skills: { has: skill } } : {}),
        ...(jobRole ? { jobRole } : {}),
        ...(requirementId
          ? {
              OR: [
                { requirementId: null }, // Not assigned to any requirement
                { requirementId: requirementId }, // Or already assigned to this requirement
              ],
            }
          : {}),
      },
      include: {
        requirement: {
          select: {
            id: true,
            jobRoles: {
              select: {
                title: true,
              },
            },
          },
        },
        Document: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ labourProfiles });
  } catch (error) {
    console.error("Error fetching labour profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch labour profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    // Basic validation
    const requiredFields = [
      "name",
      "age",
      "gender",
      "nationality",
      "passportNumber",
      "passportExpiry",
    ];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create a unique folder for this labour profile
    const labourFolder = uuidv4();
    const labourDir = path.join(UPLOAD_DIR, labourFolder);
    fs.mkdirSync(labourDir, { recursive: true });

    // Parse form data
    const profileData = {
      name: formData.get("name") as string,
      age: parseInt(formData.get("age") as string),
      gender: formData.get("gender") as Gender,
      nationality: formData.get("nationality") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      passportNumber: formData.get("passportNumber") as string,
      passportExpiry: new Date(formData.get("passportExpiry") as string),
      jobRole: formData.get("jobRole") as string,
      skills:
        (formData.get("skills") as string)?.split(",").filter(Boolean) || [],
      experience: formData.get("experience") as string,
      education: formData.get("education") as string,
      languages:
        (formData.get("languages") as string)?.split(",").filter(Boolean) || [],
      requirementId: (formData.get("requirementId") as string) || undefined,
      agencyId: agency.id,
    };

    // Create the labour profile
    const newProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.labourProfile.create({
        data: {
          ...profileData,
          passportVerified: true,
          status: LabourProfileStatus.APPROVED,
          verificationStatus: DocumentVerificationStatus.VERIFIED,
          documentsSubmittedAt: new Date(),
        },
      });

      // Handle file uploads
      const fileFields = [
        { field: "profileImage", type: DocumentType.PROFILE_IMAGE },
        { field: "passportCopy", type: DocumentType.PASSPORT },
      ];

      for (const { field, type } of fileFields) {
        const file = formData.get(field) as File | null;
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${field}-${Date.now()}${path.extname(file.name)}`;
          const filePath = path.join(labourDir, filename);
          fs.writeFileSync(filePath, buffer);

          await tx.document.create({
            data: {
              ownerId: session.user.id,
              type,
              url: `/uploads/${labourFolder}/${filename}`,
              status: AccountStatus.SUBMITTED,
              category: DocumentCategory.IMPORTANT,
              labourProfileId: profile.id,
            },
          });

          // Update profile with the profile image URL if it's the profile image
          if (field === "profileImage") {
            await tx.labourProfile.update({
              where: { id: profile.id },
              data: {
                profileImage: `/uploads/${labourFolder}/${filename}`,
              },
            });
          }
        }
      }

      return profile;
    });

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating labour profile:", error);
    return NextResponse.json(
      { error: "Failed to create labour profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing profile ID" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // First verify the profile belongs to the agency
    const existingProfile = await prisma.labourProfile.findUnique({
      where: { id, agencyId: agency.id },
      include: { Document: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Labour profile not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const profileData = {
      name: formData.get("name") as string,
      age: parseInt(formData.get("age") as string),
      gender: formData.get("gender") as Gender,
      nationality: formData.get("nationality") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      passportNumber: formData.get("passportNumber") as string,
      passportExpiry: new Date(formData.get("passportExpiry") as string),
      jobRole: formData.get("jobRole") as string,
      skills:
        (formData.get("skills") as string)?.split(",").filter(Boolean) || [],
      experience: formData.get("experience") as string,
      education: formData.get("education") as string,
      languages:
        (formData.get("languages") as string)?.split(",").filter(Boolean) || [],
      status: formData.get("status") as LabourProfileStatus,
      verificationStatus: formData.get(
        "verificationStatus"
      ) as DocumentVerificationStatus,
    };

    // Get the existing upload folder if it exists
    const labourFolder = existingProfile.Document[0]?.url
      ? path.basename(path.dirname(existingProfile.Document[0].url))
      : uuidv4();
    const labourDir = path.join(UPLOAD_DIR, labourFolder);
    if (!fs.existsSync(labourDir)) {
      fs.mkdirSync(labourDir, { recursive: true });
    }

    // Update the labour profile
    const updatedProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.labourProfile.update({
        where: { id },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      });

      // Handle file uploads
      const fileFields = [
        { field: "profileImage", type: DocumentType.PROFILE_IMAGE },
        { field: "passportCopy", type: DocumentType.PASSPORT },
      ];

      for (const { field, type } of fileFields) {
        const file = formData.get(field) as File | null;
        if (file && file.size > 0) {
          // Delete existing document if it exists
          const existingDoc = existingProfile.Document.find(
            (doc) => doc.type === type
          );
          if (existingDoc) {
            const filePath = path.join(
              process.cwd(),
              "public",
              existingDoc.url
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            await tx.document.delete({
              where: { id: existingDoc.id },
            });
          }

          // Upload new file
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${field}-${Date.now()}${path.extname(file.name)}`;
          const filePath = path.join(labourDir, filename);
          fs.writeFileSync(filePath, buffer);

          await tx.document.create({
            data: {
              ownerId: session.user.id,
              type,
              url: `/uploads/${labourFolder}/${filename}`,
              status: AccountStatus.SUBMITTED,
              category: DocumentCategory.IMPORTANT,
              labourProfileId: profile.id,
            },
          });

          // Update profile with the profile image URL if it's the profile image
          if (field === "profileImage") {
            await tx.labourProfile.update({
              where: { id: profile.id },
              data: {
                profileImage: `/uploads/${labourFolder}/${filename}`,
              },
            });
          }
        }
      }

      return profile;
    });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error("Error updating labour profile:", error);
    return NextResponse.json(
      { error: "Failed to update labour profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing profile ID" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    const profile = await prisma.labourProfile.findUnique({
      where: { id, agencyId: agency.id },
      include: { Document: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Labour profile not found" },
        { status: 404 }
      );
    }

    // Delete associated files
    profile.Document.forEach((doc) => {
      const filePath = path.join(process.cwd(), "public", doc.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete the document folder if it exists
    const folderPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      path.basename(path.dirname(profile.Document[0]?.url || ""))
    );
    if (fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath, { recursive: true });
    }

    // Delete the profile and its documents
    await prisma.labourProfile.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Labour profile deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting labour profile:", error);
    return NextResponse.json(
      { error: "Failed to delete labour profile" },
      { status: 500 }
    );
  }
}
