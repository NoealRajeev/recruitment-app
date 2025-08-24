// app/api/clients/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { getAccountApprovalEmail } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

const StatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "NOT_VERIFIED"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

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

      // If verifying, also verify all important documents
      if (status === "VERIFIED") {
        await tx.document.updateMany({
          where: {
            ownerId: client.user.id,
            status: { not: "VERIFIED" },
          },
          data: {
            status: "VERIFIED",
          },
        });
      }

      if (client.user.tempPassword) {
        await sendTemplateEmail(
          getAccountApprovalEmail(client.user.email, client.user.tempPassword),
          client.user.email
        );
      }

      const updatedUser = await tx.user.update({
        where: { id: client.user.id },
        data: { tempPassword: null, status },
        include: { clientProfile: true },
      });

      // Create audit log
      let auditAction: AuditAction;
      switch (status) {
        case "VERIFIED":
          auditAction = AuditAction.CLIENT_UPDATE;
          break;
        case "REJECTED":
          auditAction = AuditAction.CLIENT_UPDATE;
          break;
        case "NOT_VERIFIED":
          auditAction = AuditAction.CLIENT_UPDATE;
          break;
        default:
          auditAction = AuditAction.CLIENT_UPDATE;
      }

      await tx.auditLog.create({
        data: {
          action: auditAction,
          entityType: "CLIENT",
          entityId: id,
          performedById: session.user.id,
          oldData: { status: client.user.status },
          newData: { status },
          description: `Status changed to ${status}. For ${client.companyName}`,
          affectedFields: ["status"],
        },
      });

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
