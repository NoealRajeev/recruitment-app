// app/api/agencies/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@prisma/client";

// app/api/agencies/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Destructure and await params
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
      deleteAt.setDate(deleteAt.getDate() + 1);

      const updatedAgency = await tx.agency.update({
        where: { id }, // Use the destructured id
        data: {
          user: {
            update: {
              status: "REJECTED",
              deleteAt,
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
          action: AuditAction.ACCOUNT_DELETION_REQUESTED,
          entityType: "AGENCY",
          entityId: id, // Use the destructured id
          performedById: session.user.id,
          oldData: { status: updatedAgency.user.status },
          newData: { status: "REJECTED", deleteAt },
          description: `Account marked for deletion (scheduled for ${deleteAt.toISOString()})`,
          affectedFields: ["status", "deleteAt"],
        },
      });

      return updatedAgency;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error marking agency for deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
