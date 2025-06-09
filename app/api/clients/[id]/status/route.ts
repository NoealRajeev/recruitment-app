// app/api/clients/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
import { AuditAction } from "@prisma/client";

const StatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "SUBMITTED", "PENDING_SUBMISSION"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
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

    // Validate company ID
    const { id } = params;
    if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid company ID format" },
        { status: 400, headers }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400, headers }
      );
    }

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

    const { status, reason } = validation.data;

    // Database operations
    const result = await prisma.$transaction(async (tx) => {
      // Get client with user
      const client = await tx.client.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!client?.user) {
        throw new Error("Client or associated user not found");
      }

      // Update user status
      const updatedUser = await tx.user.update({
        where: { id: client.user.id },
        data: { status },
        include: { clientProfile: true },
      });

      // Create audit log
      let auditAction: AuditAction;
      switch (status) {
        case "VERIFIED":
          auditAction = AuditAction.CLIENT_VERIFIED;
          break;
        case "REJECTED":
          auditAction = AuditAction.CLIENT_REJECTED;
          break;
        case "SUBMITTED":
          auditAction = AuditAction.CLIENT_UPDATED;
          break;
        case "PENDING_SUBMISSION":
          auditAction = AuditAction.CLIENT_UPDATED;
          break;
        default:
          auditAction = AuditAction.CLIENT_UPDATED;
      }

      await tx.auditLog.create({
        data: {
          action: auditAction,
          entityType: "CLIENT",
          entityId: id,
          performedById: session.user.id,
          oldData: { status: client.user.status },
          newData: { status },
          description: `Status changed to ${status}. Reason: ${reason}`,
          affectedFields: ["status"],
        },
      });

      // Create notification only for VERIFIED/REJECTED
      if (status === "VERIFIED" || status === "REJECTED") {
        await tx.notification.create({
          data: {
            title: `Company ${status.toLowerCase()}`,
            message: `Your company status has been ${status.toLowerCase()}. ${reason}`,
            type: "ACCOUNT",
            recipientId: client.user.id,
            metadata: {
              companyId: id,
              oldStatus: client.user.status,
              newStatus: status,
            },
          },
        });
      }

      return updatedUser.clientProfile;
    });

    return NextResponse.json(result, { headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
