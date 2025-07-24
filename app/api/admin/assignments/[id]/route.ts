// app/api/admin/assignments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { AuditAction } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // according to the Next.js docs, params is a Promise that you must await
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // 1) Auth & role check
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse & validate body
    const { status, feedback } = await request.json();
    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // 3) Load current assignment for audit
    const current = await prisma.labourAssignment.findUnique({
      where: { id },
      include: {
        jobRole: { select: { id: true, title: true, adminStatus: true } },
        labour: { select: { id: true, name: true } },
      },
    });
    if (!current) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // 4) Transaction: update assignment, jobRole status, labourProfile (if needed), auditLog
    const updated = await prisma.$transaction(async (tx) => {
      // 4a) Update the assignment record
      const asg = await tx.labourAssignment.update({
        where: { id },
        data: {
          adminStatus: status,
          adminFeedback: feedback,
          ...(status === "REJECTED" && { clientStatus: "REJECTED" }),
        },
        include: { labour: true, jobRole: true },
      });

      // 4b) If admin rejected, reset labourProfile so agency can resubmit
      if (status === "REJECTED") {
        await tx.labourProfile.update({
          where: { id: asg.labourId },
          data: { status: "UNDER_REVIEW" },
        });
      }

      // 4c) Recompute overall jobRole.adminStatus
      const all = await tx.labourAssignment.findMany({
        where: { jobRoleId: asg.jobRoleId },
      });
      const allAccepted = all.every((a) => a.adminStatus === "ACCEPTED");
      const anyRejected = all.some((a) => a.adminStatus === "REJECTED");
      let newJRstatus = asg.jobRole.adminStatus;
      if (allAccepted) newJRstatus = "ACCEPTED";
      else if (anyRejected) newJRstatus = "NEEDS_REVISION";

      if (newJRstatus !== asg.jobRole.adminStatus) {
        await tx.jobRole.update({
          where: { id: asg.jobRoleId },
          data: { adminStatus: newJRstatus },
        });
      }

      // 4d) Write an audit log entry
      await tx.auditLog.create({
        data: {
          action: AuditAction.LABOUR_PROFILE_STATUS_CHANGE,
          entityType: "LabourAssignment",
          entityId: id,
          performedById: session.user.id,
          oldData: {
            adminStatus: current.adminStatus,
            labourId: current.labour.id,
            labourName: current.labour.name,
            jobRoleId: current.jobRole.id,
            jobRoleTitle: current.jobRole.title,
          },
          newData: {
            adminStatus: status,
            feedback,
          },
          affectedFields: ["adminStatus", "adminFeedback"],
        },
      });

      return asg;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating assignment status:", error);
    return NextResponse.json(
      { error: "Failed to update assignment status" },
      { status: 500 }
    );
  }
}
