import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveFileLocally } from "@/lib/local-storage";
import { AuditAction, NotificationType, UserRole } from "@prisma/client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const userRole = formData.get("userRole") as UserRole;

  // Common documents
  const licenseFile = formData.get("licenseFile") as File | null;
  const otherDocuments = formData.getAll("otherDocuments") as File[];

  // Agency specific documents
  const insuranceFile = formData.get("insuranceFile") as File | null;
  const idProof = formData.get("idProof") as File | null;
  const addressProof = formData.get("addressProof") as File | null;

  // Client specific documents
  const crFile = formData.get("crFile") as File | null;

  if (!email || !userRole) {
    return NextResponse.json(
      { error: "Email and user role are required" },
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
          agencyProfile: userRole === UserRole.RECRUITMENT_AGENCY,
          clientProfile: userRole === UserRole.CLIENT_ADMIN,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify user role matches the expected role
      if (user.role !== userRole) {
        throw new Error("User role doesn't match document type");
      }

      // 2. Process and save files based on user role
      const uploadFile = async (file: File | null, type: string) => {
        if (!file) return null;
        const url = await saveFileLocally(file);
        return { type, url, name: file.name };
      };

      const uploadedFiles = await Promise.all([
        // Common documents
        uploadFile(licenseFile, "LICENSE"),
        ...otherDocuments.map((file) => uploadFile(file, "OTHER")),

        // Role-specific documents
        ...(userRole === UserRole.RECRUITMENT_AGENCY
          ? [
              uploadFile(insuranceFile, "INSURANCE"),
              uploadFile(idProof, "ID_PROOF"),
              uploadFile(addressProof, "ADDRESS_PROOF"),
            ]
          : []),
        ...(userRole === UserRole.CLIENT_ADMIN
          ? [uploadFile(crFile, "COMPANY_REGISTRATION")]
          : []),
      ]);

      // 3. Filter out null values and create documents
      const validFiles = uploadedFiles.filter(Boolean) as {
        type: string;
        url: string;
        name?: string;
      }[];

      if (userRole === UserRole.RECRUITMENT_AGENCY && user.agencyProfile) {
        await Promise.all(
          validFiles.map((file) =>
            tx.agencyDocument.create({
              data: {
                type: file.type as any,
                url: file.url,
                name: file.name,
                agencyId: user.agencyProfile!.id,
              },
            })
          )
        );
      } else if (userRole === UserRole.CLIENT_ADMIN && user.clientProfile) {
        await Promise.all(
          validFiles.map((file) =>
            tx.clientDocument.create({
              data: {
                type: file.type as any,
                url: file.url,
                name: file.name,
                clientId: user.clientProfile!.id,
              },
            })
          )
        );
      }

      // 4. Update user status
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { status: "SUBMITTED" },
        select: {
          id: true,
          status: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // 5. Create audit log
      const auditAction =
        userRole === UserRole.RECRUITMENT_AGENCY
          ? AuditAction.AGENCY_VERIFIED
          : AuditAction.CLIENT_VERIFIED;

      await tx.auditLog.create({
        data: {
          action: auditAction,
          entityType: "USER",
          entityId: user.id,
          description: "Submitted verification documents",
          performedById: user.id,
          oldData: { status: user.status },
          newData: { status: "SUBMITTED" },
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
                ...(userRole === UserRole.RECRUITMENT_AGENCY &&
                user.agencyProfile
                  ? { agencyId: user.agencyProfile.id }
                  : {}),
                ...(userRole === UserRole.CLIENT_ADMIN && user.clientProfile
                  ? { clientId: user.clientProfile.id }
                  : {}),
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
