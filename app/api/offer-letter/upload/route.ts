// app/api/assignments/signed-offer/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import path from "path";
import fs from "fs";
import { NotificationDelivery } from "@/lib/notification-delivery";
import { NotificationType, NotificationPriority } from "@prisma/client";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "signed-offers"
);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await req.formData();
  const assignmentId = formData.get("assignmentId") as string;
  const file = formData.get("file") as File | null;

  if (!assignmentId || !file || file.type !== "application/pdf") {
    return new Response(
      JSON.stringify({ error: "Missing assignmentId or PDF file" }),
      { status: 400 }
    );
  }

  const assignment = await prisma.labourAssignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, agencyId: true, labourId: true },
  });
  if (!assignment)
    return new Response(JSON.stringify({ error: "Assignment not found" }), {
      status: 404,
    });

  const filename = `signed-offer-${assignmentId}-${Date.now()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    if (!fs.existsSync(UPLOAD_DIR))
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating directory:", e);
    return new Response(
      JSON.stringify({ error: "Failed to create upload directory" }),
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  const url = `/uploads/signed-offers/${filename}`;

  await prisma.$transaction(async (tx) => {
    await tx.labourAssignment.update({
      where: { id: assignmentId },
      data: { signedOfferLetterUrl: url },
    });
    await tx.labourStageHistory.updateMany({
      where: {
        labourId: assignment.labourId,
        stage: "OFFER_LETTER_SIGN",
        status: "PENDING",
      },
      data: { status: "SIGNED", completedAt: new Date() },
    });
  });

  const labourAssignment = await prisma.labourAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      agencyId: true,
      jobRole: { select: { requirement: { select: { clientId: true } } } },
      labourId: true,
    },
  });
  const labourProfile = labourAssignment
    ? await prisma.labourProfile.findUnique({
        where: { id: labourAssignment.labourId },
        select: { id: true, name: true },
      })
    : null;

  // NEW: Deliver to agency + client
  try {
    if (
      labourAssignment &&
      labourProfile &&
      labourAssignment.jobRole?.requirement?.clientId
    ) {
      const cfg = {
        type: NotificationType.OFFER_LETTER_SIGNED,
        title: "Offer letter signed",
        message: `${labourProfile.name} has signed the offer letter.`,
        priority: NotificationPriority.HIGH,
        actionUrl: url,
        actionText: "Open signed offer",
      } as const;

      // agency user
      const agency = await prisma.agency.findUnique({
        where: { id: labourAssignment.agencyId },
        select: { userId: true },
      });
      if (agency?.userId) {
        await NotificationDelivery.deliverToUser(
          agency.userId,
          cfg,
          session.user.id,
          "LabourAssignment",
          labourAssignment.id
        );
      }
      // client user (clientId here is the Client entity; fetch its userId)
      const client = await prisma.client.findUnique({
        where: { id: labourAssignment.jobRole.requirement.clientId },
        select: { userId: true },
      });
      if (client?.userId) {
        await NotificationDelivery.deliverToUser(
          client.userId,
          cfg,
          session.user.id,
          "LabourAssignment",
          labourAssignment.id
        );
      }
    }
  } catch (e) {
    console.error("Notification delivery failed:", e);
  }

  return new Response(JSON.stringify({ success: true, url }), { status: 200 });
}
