// app/api/agencies/[id]/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const { status, deletionType } = await request.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Set deletion time based on type
      let deleteAt = null;
      if (deletionType === "SCHEDULED") {
        deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 1); // 24 hours later
      }

      const updatedAgency = await tx.agency.update({
        where: { id },
        data: {
          user: {
            update: {
              status,
              ...(deletionType && {
                deleteAt,
                deletionType,
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
      await tx.auditLog.create({
        data: {
          action:
            status === "REJECTED" ? "COMPANY_REJECTED" : "COMPANY_UPDATED",
          entityType: "AGENCY",
          entityId: id,
          performedById: session.user.id,
          description: `Agency status changed to ${status}`,
          oldData: { status: updatedAgency.user.status },
          newData: { status, deleteAt, deletionType },
        },
      });

      return updatedAgency;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating agency status:", error);
    return NextResponse.json(
      { error: "Failed to update agency status" },
      { status: 500 }
    );
  }
}
