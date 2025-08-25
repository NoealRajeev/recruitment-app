// app/api/clients/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
import crypto from "crypto";
import { AuditAction, AccountStatus, DocumentCategory } from "@prisma/client";
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
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const traceId = crypto.randomUUID();
  const headers = { "Content-Type": "application/json" };

  try {
    // AuthZ
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401, headers }
      );
    }
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid company ID format" },
        { status: 400, headers }
      );
    }

    // Body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400, headers }
      );
    }
    const validation = StatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400, headers }
      );
    }
    const { status, reason } = validation.data;

    // ---- DB work (short transaction; NO network I/O) ----
    const { clientId, userEmail, userTempPassword, sendWelcome } =
      await prisma.$transaction(
        async (tx) => {
          // Load current
          const client = await tx.client.findUnique({
            where: { id },
            include: { user: true },
          });
          if (!client?.user) {
            throw new Error("Client or associated user not found");
          }

          // If verifying, mark IMPORTANT docs as VERIFIED (or all; choose your policy)
          if (status === "VERIFIED") {
            await tx.document.updateMany({
              where: {
                ownerId: client.user.id,
                status: { not: "VERIFIED" },
                // uncomment if you only want important docs:
                // category: DocumentCategory.IMPORTANT,
              },
              data: { status: "VERIFIED" as AccountStatus },
            });
          }

          // Update user status; clear tempPassword when verified
          const updatedUser = await tx.user.update({
            where: { id: client.user.id },
            data: {
              status: status as AccountStatus,
              tempPassword: status === "VERIFIED" ? null : undefined,
            },
            select: { id: true, email: true, tempPassword: true },
          });

          // Audit log
          await tx.auditLog.create({
            data: {
              action: AuditAction.CLIENT_UPDATE,
              entityType: "CLIENT",
              entityId: id,
              performedById: session.user.id,
              oldData: { status: client.user.status },
              newData: { status },
              description: `Status changed to ${status}. For ${client.companyName}. Reason: ${reason}`,
              affectedFields: ["status"],
            },
          });

          return {
            clientId: client.id,
            userEmail: updatedUser.email,
            userTempPassword: client.user.tempPassword, // value before nulling
            sendWelcome: status === "VERIFIED" && !!client.user.tempPassword,
          };
        },
        // Optional: modest timeout bump; still keep transaction short
        { timeout: 10000 }
      );

    // ---- Side effects AFTER commit (safe from timeouts) ----
    if (sendWelcome && userEmail && userTempPassword) {
      try {
        await sendTemplateEmail(
          getAccountApprovalEmail(userEmail, userTempPassword),
          userEmail
        );
      } catch (e) {
        // best‑effort: log but don't fail request
        console.error("Welcome email failed:", e);
      }
    }

    return NextResponse.json({ id: clientId, status }, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[${traceId}] Client status update failed:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message,
        traceId,
      },
      { status: 500, headers }
    );
  }
}
