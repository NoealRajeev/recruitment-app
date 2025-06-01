import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
// import { log } from "@/lib/logger";
import { AuditAction } from "@prisma/client";

const StatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const traceId = crypto.randomUUID();
  const headers = { "Content-Type": "application/json" };

  try {
    // 1. Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      // log.warn("Unauthorized access attempt", {
      //   userId: session?.user?.id,
      //   action: "COMPANY_STATUS_UPDATE",
      // });
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401, headers }
      );
    }

    // 2. Validate company ID
    const { id } = params;
    if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) {
      // log.warn("Invalid company ID format", { companyId: id });
      return NextResponse.json(
        { error: "Invalid company ID format" },
        { status: 400, headers }
      );
    }

    // 3. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      console.warn("Invalid JSON body", { error: e });
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400, headers }
      );
    }

    const validation = StatusUpdateSchema.safeParse(requestBody);
    if (!validation.success) {
      // log.warn("Validation failed", { errors: validation.error.errors });
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400, headers }
      );
    }

    const { status, reason } = validation.data;

    // 4. Database operations
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
        include: { client: true },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action:
            status === "VERIFIED"
              ? AuditAction.COMPANY_VERIFIED
              : AuditAction.COMPANY_REJECTED,
          entityType: "CLIENT",
          entityId: id,
          performedById: session.user.id,
          oldData: { status: client.user.status },
          newData: { status },
          description: `Status changed to ${status}. Reason: ${reason}`,
          affectedFields: ["status"],
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          title: `Company ${status.toLowerCase()}`,
          message: `Your company status has been ${status.toLowerCase()}. ${reason}`,
          type: "COMPANY_STATUS_UPDATE",
          recipientId: client.user.id,
          metadata: {
            companyId: id,
            oldStatus: client.user.status,
            newStatus: status,
          },
        },
      });

      return updatedUser.client;
    });

    // log.info("Company status updated successfully", {
    //   companyId: id,
    //   status,
    //   adminId: session.user.id,
    // });

    return NextResponse.json(result, { headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // log.error("Failed to update company status", {
    //   error: errorMessage,
    //   traceId,
    //   stack: error instanceof Error ? error.stack : undefined,
    // });

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
