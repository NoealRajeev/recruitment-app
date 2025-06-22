import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAgencyDocumentsSubmittedEmail } from "@/lib/utils/email-templates";
import path from "path";
import { promises as fs } from "fs";
import {
  AccountStatus,
  AuditAction,
  DocumentCategory,
  DocumentType,
  UserRole,
} from "@/lib/generated/prisma";
import { sendTemplateEmail } from "@/lib/utils/email-service";

async function saveFileToDisk(file: File, userId: string): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "agency",
    userId
  );
  await fs.mkdir(uploadsDir, { recursive: true });

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const fileExt = path.extname(file.name);
  const fileName = `${Date.now()}-${file.name.replace(fileExt, "")}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);

  // Save file
  await fs.writeFile(filePath, buffer);

  // Return relative path for database storage
  return `/uploads/agency/${userId}/${fileName}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const userRole = formData.get("userRole") as UserRole;

  // Agency documents
  const licenseFile = formData.get("licenseFile") as File | null;
  const insuranceFile = formData.get("insuranceFile") as File | null;
  const idProof = formData.get("idProof") as File | null;
  const addressProof = formData.get("addressProof") as File | null;
  const otherDocuments = formData.getAll("otherDocuments") as File[];

  if (!email || !userRole) {
    return NextResponse.json(
      { error: "Email and user role are required" },
      { status: 400 }
    );
  }

  // Validate we're only processing agency submissions
  if (userRole !== UserRole.RECRUITMENT_AGENCY) {
    return NextResponse.json(
      { error: "Only agency document submissions are currently supported" },
      { status: 400 }
    );
  }

  // Validate required documents
  if (!licenseFile || !insuranceFile || !idProof || !addressProof) {
    return NextResponse.json(
      { error: "All required documents must be provided" },
      { status: 400 }
    );
  }

  try {
    // Use a transaction for all database operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get user and verify role matches
      const user = await tx.user.findUnique({
        where: { email },
        include: {
          agencyProfile: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== UserRole.RECRUITMENT_AGENCY) {
        throw new Error("User is not registered as an agency");
      }

      if (!user.agencyProfile) {
        throw new Error("Agency profile not found");
      }

      // 2. Process and save files
      const processDocument = async (file: File, type: DocumentType) => {
        const url = await saveFileToDisk(file, user.id);

        await tx.document.create({
          data: {
            ownerId: user.id,
            type,
            url,
            status: AccountStatus.NOT_VERIFIED,
            category:
              type === DocumentType.OTHER
                ? DocumentCategory.SUPPORTING
                : DocumentCategory.IMPORTANT,
          },
        });
      };

      // Process all documents in parallel
      await Promise.all([
        processDocument(licenseFile, DocumentType.LICENSE),
        processDocument(insuranceFile, DocumentType.INSURANCE),
        processDocument(idProof, DocumentType.ID_PROOF),
        processDocument(addressProof, DocumentType.ADDRESS_PROOF),
        ...otherDocuments.map((file) =>
          processDocument(file, DocumentType.OTHER)
        ),
      ]);

      // 3. Update user status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { status: AccountStatus.NOT_VERIFIED },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          agencyProfile: {
            select: {
              agencyName: true,
            },
          },
        },
      });

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_UPDATE,
          entityType: "USER",
          entityId: user.id,
          description: "Submitted agency verification documents",
          performedById: user.id,
          oldData: { status: user.status },
          newData: { status: "SUBMITTED" },
          affectedFields: ["status"],
        },
      });

      // 6. Send confirmation email to agency
      await sendTemplateEmail(
        getAgencyDocumentsSubmittedEmail(user.name, "Findly"),
        user.email
      );
      return updatedUser;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    console.error("Document submission error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
