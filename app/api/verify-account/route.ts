// app/api/verify-account/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveFileLocally } from "@/lib/local-storage";
import { AuditAction, NotificationType } from "@prisma/client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const licenseFile = formData.get("licenseFile") as File | null;
  const insuranceFile = formData.get("insuranceFile") as File | null;
  const idProof = formData.get("idProof") as File | null;
  const addressProof = formData.get("addressProof") as File | null;
  const otherDocuments = formData.getAll("otherDocuments") as File[];

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Use a transaction for all database operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get user and verify role
      const user = await tx.user.findUnique({
        where: { email },
        include: { agencyProfile: true },
      });

      if (!user || !user.agencyProfile) {
        throw new Error("User or agency not found");
      }

      // 2. Process and save files
      const uploadFile = async (file: File | null, type: string) => {
        if (!file) return null;
        const url = await saveFileLocally(file);
        return { type, url };
      };

      const uploadedFiles = await Promise.all([
        uploadFile(licenseFile, "LICENSE"),
        uploadFile(insuranceFile, "INSURANCE"),
        uploadFile(idProof, "ID_PROOF"),
        uploadFile(addressProof, "ADDRESS_PROOF"),
        ...otherDocuments.map((file) => uploadFile(file, "OTHER")),
      ]);

      // 3. Filter out null values and create documents
      const validFiles = uploadedFiles.filter(Boolean);
      await Promise.all(
        validFiles.map((file) =>
          tx.agencyDocument.create({
            data: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: file!.type as any,
              url: file!.url,
              agencyId: user.agencyProfile!.id,
            },
          })
        )
      );

      // 4. Update user status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { status: "PENDING_REVIEW" },
        select: {
          id: true,
          status: true,
          email: true,
          name: true,
        },
      });

      // 5. Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.CLIENT_VERIFIED,
          entityType: "USER",
          entityId: user.id,
          description: "Submitted verification documents",
          performedById: user.id,
          oldData: { status: user.status },
          newData: { status: "PENDING_REVIEW" },
          affectedFields: ["status"],
        },
      });

      // 6. Create notification for admin
      const adminUsers = await tx.user.findMany({
        where: {
          role: "RECRUITMENT_ADMIN",
        },
        select: {
          id: true,
        },
      });

      await Promise.all(
        adminUsers.map((admin) =>
          tx.notification.create({
            data: {
              title: "New Verification Request",
              message: `${user.name} (${user.email}) has submitted verification documents`,
              type: NotificationType.ACCOUNT,
              recipientId: admin.id,
              metadata: {
                userId: user.id,
                agencyId: user.agencyProfile!.id,
              },
            },
          })
        )
      );

      return updatedUser;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
