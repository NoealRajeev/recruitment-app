// app/api/agencies/[id]/recover/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@/lib/generated/prisma";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // according to the Next.js docs, params is a Promise that you must await
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedAgency = await tx.agency.update({
        where: { id: id },
        data: {
          user: {
            update: {
              status: "VERIFIED",
              deleteAt: null,
              deletionType: null,
              deletionRequestedBy: null,
            },
          },
        },
        include: {
          user: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_UPDATE,
          entityType: "AGENCY",
          entityId: id,
          performedById: session.user.id,
          description: "Account recovered from deletion",
          oldData: {
            status: "REJECTED",
            deleteAt: updatedAgency.user.deleteAt,
            deletionType: updatedAgency.user.deletionType,
          },
          newData: {
            status: "VERIFIED",
            deleteAt: null,
            deletionType: null,
          },
        },
      });

      return updatedAgency;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recovering agency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
