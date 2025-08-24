// app/api/agencies/[id]/delete-immediate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@prisma/client";
import { getAgencyDeletionEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
  // await the generic key/value params
  const { id } = await context.params;
  const agencyId = id;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get agency + user (for email + user id)
      const agency = await tx.agency.findUnique({
        where: { id: agencyId },
        include: {
          user: {
            select: { id: true, email: true, status: true },
          },
        },
      });

      if (!agency || !agency.user) {
        throw new Error("Agency or associated user not found");
      }

      const deleteAt = new Date();
      deleteAt.setHours(deleteAt.getHours() + 1);

      // Update just the necessary user fields
      const updatedUser = await tx.user.update({
        where: { id: agency.user.id },
        data: {
          status: "REJECTED",
          deleteAt,
          deletionType: "IMMEDIATE",
          deletionRequestedBy: session.user.id,
        },
        select: {
          id: true,
          status: true,
          deleteAt: true,
          deletionType: true,
          email: true,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_DELETE,
          entityType: "AGENCY",
          entityId: agencyId,
          performedById: session.user.id,
          description: `Account marked for immediate deletion`,
          oldData: { status: agency.user.status },
          newData: {
            status: "REJECTED",
            deleteAt,
            deletionType: "IMMEDIATE",
          },
          affectedFields: ["status", "deleteAt", "deletionType"],
        },
      });

      // Return everything needed to send the email after the transaction
      return {
        id: agencyId,
        user: {
          id: updatedUser.id,
          status: updatedUser.status,
          deleteAt: updatedUser.deleteAt,
          deletionType: updatedUser.deletionType,
          email: updatedUser.email,
        },
        agencyName: agency.agencyName,
      };
    });

    // Send the deletion email (outside the transaction)
    try {
      const emailTpl = getAgencyDeletionEmail(result.agencyName);
      if (result.user.email) {
        await sendTemplateEmail(emailTpl, result.user.email);
      }
    } catch (mailErr) {
      // Don't fail the request if email sending has issues; just log it.
      console.error("Failed to send agency deletion email:", mailErr);
    }

    // Respond to client
    return NextResponse.json({
      id: result.id,
      user: {
        id: result.user.id,
        status: result.user.status,
        deleteAt: result.user.deleteAt,
        deletionType: result.user.deletionType,
      },
    });
  } catch (error) {
    console.error("Error marking agency for immediate deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
