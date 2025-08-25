// app/api/agencies/[id]/delete-immediate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction, NotificationType } from "@prisma/client";
import { getAgencyDeletionEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

export async function DELETE(
  _request: Request,
  context: { params: Promise<Record<string, string>> }
): Promise<Response> {
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
      const agency = await tx.agency.findUnique({
        where: { id: agencyId },
        include: {
          user: { select: { id: true, email: true, status: true, name: true } },
        },
      });

      if (!agency || !agency.user) {
        throw new Error("Agency or associated user not found");
      }

      const deleteAt = new Date();
      deleteAt.setHours(deleteAt.getHours() + 1);

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
          name: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_DELETE,
          entityType: "AGENCY",
          entityId: agencyId,
          performedById: session.user.id,
          description: `Account marked for immediate deletion`,
          oldData: { status: agency.user.status },
          newData: { status: "REJECTED", deleteAt, deletionType: "IMMEDIATE" },
          affectedFields: ["status", "deleteAt", "deletionType"],
        },
      });

      // 🔔 NEW: notify the agency user (deletion scheduled)
      try {
        await tx.notification.create({
          data: {
            type: NotificationType.SECURITY_ALERT,
            title: "Your account deletion is scheduled",
            message:
              `Hello ${updatedUser.name || "there"}, your agency account has been scheduled for deletion ` +
              `and will be permanently removed after ${deleteAt.toLocaleString()}. ` +
              `You can recover it within this window.`,
            recipientId: updatedUser.id,
            senderId: session.user.id,
            entityType: "Agency",
            entityId: agencyId,
            actionText: "Recover Account",
            actionUrl: `${process.env.NEXTAUTH_URL ?? ""}/dashboard/account/recover`,
          },
        });
      } catch (nerr) {
        console.error(
          "Failed to create agency scheduled deletion notification:",
          nerr
        );
      }

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

    // keep your email (already “scheduled” email if you’ve added it) or this “deleted” email if desired later
    try {
      const emailTpl = getAgencyDeletionEmail(result.agencyName);
      if (result.user.email) {
        await sendTemplateEmail(emailTpl, result.user.email);
      }
    } catch (mailErr) {
      console.error("Failed to send agency deletion email:", mailErr);
    }

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
