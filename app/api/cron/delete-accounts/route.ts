// app/api/cron/delete-accounts/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    const usersToDelete = await prisma.user.findMany({
      where: {
        deleteAt: {
          not: null,
          lte: twentyFourHoursAgo,
        },
      },
      include: {
        agency: true,
        client: true,
      },
    });

    const deletionResults = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const user of usersToDelete) {
        // 1. Create audit log before deletion
        await tx.auditLog.create({
          data: {
            action: AuditAction.ACCOUNT_DELETED,
            entityType: user.agency
              ? "AGENCY"
              : user.client
                ? "CLIENT"
                : "ADMIN",
            entityId: user.agency?.id || user.client?.id || user.id,
            performedById: user.deletionRequestedBy || "system",
            description: `Account permanently deleted as scheduled`,
            affectedFields: ["all"],
          },
        });

        // 2. Delete related records
        if (user.agency) {
          await tx.agencyDocument.deleteMany({
            where: { agencyId: user.agency.id },
          });
          await tx.agency.delete({ where: { id: user.agency.id } });
        }
        if (user.client) {
          await tx.clientDocument.deleteMany({
            where: { clientId: user.client.id },
          });
          await tx.client.delete({ where: { id: user.client.id } });
        }

        // 3. Delete the user
        const deletedUser = await tx.user.delete({ where: { id: user.id } });
        results.push(deletedUser);
      }

      return results;
    });

    return NextResponse.json({
      message: `Deleted ${deletionResults.length} accounts`,
      deletedAccounts: deletionResults.length,
    });
  } catch (error) {
    console.error("Error deleting accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
