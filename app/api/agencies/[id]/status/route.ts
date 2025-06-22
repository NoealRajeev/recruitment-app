// app/api/agencies/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { sendTemplateEmail } from "@/lib/utils/email-service";
import { getAgencyWelcomeEmail } from "@/lib/utils/email-templates";

const StatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "NOT_VERIFIED"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  deletionType: z.enum(["SCHEDULED", "IMMEDIATE"]).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const traceId = crypto.randomUUID();
  const headers = { "Content-Type": "application/json" };

  try {
    // Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401, headers }
      );
    }

    // Validate agency ID
    const { id } = params;
    if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid agency ID format" },
        { status: 400, headers }
      );
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validation = StatusUpdateSchema.safeParse(requestBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400, headers }
      );
    }

    const { status, reason, deletionType } = validation.data;

    // Database operations
    const result = await prisma.$transaction(async (tx) => {
      // Get agency with user and documents
      const agency = await tx.agency.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              Document: true, // Changed from 'documents' to 'Document' to match Prisma model
            },
          },
        },
      });

      if (!agency || !agency.user) {
        throw new Error("Agency or associated user not found");
      }

      // Set deletion time based on type
      let deleteAt = null;
      if (status === "REJECTED" && deletionType === "SCHEDULED") {
        deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 1); // 24 hours later
      }

      // If verifying, also verify all important documents
      if (status === "VERIFIED") {
        await tx.document.updateMany({
          where: {
            ownerId: agency.userId, // Changed from agency.user.id to agency.userId
            status: { not: "VERIFIED" },
            category: "IMPORTANT", // Only verify important documents
          },
          data: {
            status: "VERIFIED",
          },
        });
      }

      // Send approval email if verifying and temp password exists
      if (status === "VERIFIED" && agency.user.tempPassword) {
        const emailTemplate = getAgencyWelcomeEmail(
          agency.agencyName, // agencyName
          agency.user.email, // email
          agency.user.tempPassword // password
          // Optionally add loginLink as 4th parameter if needed
        );
        await sendTemplateEmail(emailTemplate, agency.user.email);
      }

      // Update agency status
      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          user: {
            update: {
              status,
              deleteAt: status === "REJECTED" ? deleteAt : null,
              deletionType: status === "REJECTED" ? deletionType : null,
              tempPassword: status === "VERIFIED" ? null : undefined,
              ...(status === "REJECTED" && {
                deletionRequestedBy: session.user.id,
              }),
            },
          },
        },
        include: {
          user: true,
        },
      });

      // Create audit log
      let auditAction: AuditAction;
      switch (status) {
        case "VERIFIED":
          auditAction = "AGENCY_UPDATE"; // Use existing action
          break;
        case "REJECTED":
          auditAction = "AGENCY_UPDATE"; // Use existing action
          break;
        case "NOT_VERIFIED":
          auditAction = "AGENCY_UPDATE";
          break;
        default:
          auditAction = "AGENCY_UPDATE";
      }

      await tx.auditLog.create({
        data: {
          action: auditAction,
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
      {
        error: "Internal server error",
        message: errorMessage,
        traceId,
      },
      { status: 500, headers }
    );
  }
}
