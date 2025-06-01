// app/api/agencies/[id]/delete-immediate/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function DELETE(
  request: Request,
  context: { params: Record<string, string> }
) {
  const { params } = context;
  const agencyId = params.id;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Set deletion in 1 hour
      const deleteAt = new Date();
      deleteAt.setHours(deleteAt.getHours() + 1);

      const updatedAgency = await tx.agency.update({
        where: { id: agencyId },
        data: {
          user: {
            update: {
              status: "REJECTED",
              deleteAt,
              deletionType: "IMMEDIATE",
              deletionRequestedBy: session.user.id,
            },
          },
        },
        include: {
          user: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "ACCOUNT_DELETION_REQUESTED",
          entityType: "AGENCY",
          entityId: agencyId,
          performedById: session.user.id,
          description: `Account marked for immediate deletion`,
          oldData: { status: updatedAgency.user.status },
          newData: {
            status: "REJECTED",
            deleteAt,
            deletionType: "IMMEDIATE",
          },
        },
      });

      return updatedAgency;
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
