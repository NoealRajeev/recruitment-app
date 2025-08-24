// app/api/agencies/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
import crypto from "crypto";
import { AuditAction, AccountStatus, DocumentCategory } from "@prisma/client";
import { sendTemplateEmail } from "@/lib/utils/email-service";
import {
  getAgencyWelcomeEmail,
  getAccountDeletionEmail,
} from "@/lib/utils/email-templates";
import { notifyDocumentVerified } from "@/lib/notification-helpers";

const StatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "NOT_VERIFIED"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  deletionType: z.enum(["SCHEDULED", "IMMEDIATE"]).optional(),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const traceId = crypto.randomUUID();
  const headers = { "Content-Type": "application/json" };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401, headers }
      );
    }

    if (!/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid agency ID format" },
        { status: 400, headers }
      );
    }

    const body = await request.json();
    const validation = StatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400, headers }
      );
    }
    const { status, reason, deletionType } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      // Load current state
      const agency = await tx.agency.findUnique({
        where: { id },
        include: {
          user: {
            include: { Document: true },
          },
        },
      });
      if (!agency || !agency.user)
        throw new Error("Agency or associated user not found");

      // If verifying, mark all IMPORTANT docs as VERIFIED and notify
      if (status === "VERIFIED") {
        const docsToVerify = await tx.document.findMany({
          where: {
            ownerId: agency.userId,
            status: { not: AccountStatus.VERIFIED },
            category: DocumentCategory.IMPORTANT,
          },
          select: { id: true, type: true },
        });

        if (docsToVerify.length) {
          await tx.document.updateMany({
            where: {
              ownerId: agency.userId,
              status: { not: AccountStatus.VERIFIED },
              category: DocumentCategory.IMPORTANT,
            },
            data: { status: AccountStatus.VERIFIED },
          });

          // best-effort notifications
          for (const d of docsToVerify) {
            try {
              await notifyDocumentVerified(d.type, agency.user.name, agency.id);
            } catch (e) {
              console.error("notifyDocumentVerified failed:", e);
            }
          }
        }
      }

      // If verified and tempPassword present, send welcome email and clear temp
      if (status === "VERIFIED" && agency.user.tempPassword) {
        await sendTemplateEmail(
          getAgencyWelcomeEmail(
            agency.agencyName,
            agency.user.email,
            agency.user.tempPassword
          ),
          agency.user.email
        );
      }

      // If rejected + scheduled, set deleteAt and send apology email
      let deleteAt: Date | null = null;
      if (status === "REJECTED" && deletionType === "SCHEDULED") {
        deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 1);
        await sendTemplateEmail(
          getAccountDeletionEmail({
            recipientName: agency.agencyName || agency.user.name || "there",
            supportUrl: `${process.env.NEXTAUTH_URL}/support`,
            whenText: "in the next 24 hours",
          }),
          agency.user.email
        );
      }

      // Update status + housekeeping
      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          user: {
            update: {
              status: status as AccountStatus,
              deleteAt: status === "REJECTED" ? deleteAt : null,
              deletionType: status === "REJECTED" ? deletionType : null,
              tempPassword: status === "VERIFIED" ? null : undefined,
              ...(status === "REJECTED" && {
                deletionRequestedBy: session.user.id,
              }),
            },
          },
        },
        include: { user: true },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_UPDATE,
          entityType: "AGENCY",
          entityId: id,
          performedById: session.user.id,
          oldData: { status: agency.user.status },
          newData: {
            status,
            deleteAt: status === "REJECTED" ? deleteAt : null,
            deletionType: status === "REJECTED" ? deletionType : null,
          },
          description: `Status changed to ${status}. Reason: ${reason}`,
          affectedFields: ["status"],
        },
      });

      return updatedAgency;
    });

    return NextResponse.json(result, { headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[${traceId}] Error updating agency status:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: errorMessage, traceId },
      { status: 500, headers }
    );
  }
}
