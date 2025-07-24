// app/api/agencies/[id]/delete-immediate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@/lib/generated/prisma";

export async function DELETE(
  request: Request,
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
      const deleteAt = new Date();
      deleteAt.setHours(deleteAt.getHours() + 1);

      // Only update and return the changed fields
      const updatedUser = await tx.user.update({
        where: {
          id: (
            await tx.agency.findUnique({
              where: { id: agencyId },
              select: { userId: true },
            })
          )?.userId,
        },
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
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.AGENCY_DELETE,
          entityType: "AGENCY",
          entityId: agencyId,
          performedById: session.user.id,
          description: `Account marked for immediate deletion`,
          oldData: { status: updatedUser.status },
          newData: {
            status: "REJECTED",
            deleteAt: deleteAt,
            deletionType: "IMMEDIATE",
          },
        },
      });

      return {
        id: agencyId,
        user: updatedUser,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error marking agency for immediate deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
