// app/api/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AccountStatus, AuditAction } from "@/lib/generated/prisma";

// GET /api/clients - Get clients by status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as AccountStatus | null;

    // Validate status
    const validStatuses: AccountStatus[] = [
      AccountStatus.VERIFIED,
      AccountStatus.REJECTED,
      AccountStatus.NOT_VERIFIED,
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status parameter" },
        { status: 400 }
      );
    }

    const clients = await prisma.client.findMany({
      where: status ? { user: { status } } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// PATCH /api/clients - Update client status
export async function PATCH(request: Request) {
  try {
    const { clientId, status, reason } = await request.json();

    if (!clientId || !status || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: AccountStatus[] = [
      AccountStatus.VERIFIED,
      AccountStatus.REJECTED,
      AccountStatus.NOT_VERIFIED,
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update client status
    const updatedClient = await prisma.$transaction(async (tx) => {
      // Update user status
      const user = await tx.user.update({
        where: { id: clientId },
        data: { status },
      });

      // Update all documents status
      await tx.document.updateMany({
        where: { ownerId: clientId },
        data: { status },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: AuditAction.CLIENT_UPDATE,
          entityType: "Client",
          entityId: clientId,
          performedById: clientId, // In real app, use the admin's ID
          newData: {
            status,
            reason,
          },
        },
      });

      return user;
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client status:", error);
    return NextResponse.json(
      { error: "Failed to update client status" },
      { status: 500 }
    );
  }
}
