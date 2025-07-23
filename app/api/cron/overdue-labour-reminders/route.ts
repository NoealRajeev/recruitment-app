import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NotificationService } from "@/lib/notifications";
import { sendEmail } from "@/lib/utils/email-service";
import { NotificationType, NotificationPriority } from "@prisma/client";

const STAGE_REMINDER_DAYS = 7;

export async function POST() {
  // 1. Find all labours not in DEPLOYED, stuck in the same stage for >7 days
  const now = new Date();
  const threshold = new Date(
    now.getTime() - STAGE_REMINDER_DAYS * 24 * 60 * 60 * 1000
  );

  // Get all labours not in DEPLOYED and updatedAt < threshold
  const stuckLabours = await prisma.labourProfile.findMany({
    where: {
      currentStage: { not: "DEPLOYED" },
      updatedAt: { lt: threshold },
    },
    include: {
      requirement: { include: { client: { include: { user: true } } } },
      agency: { include: { user: true } },
    },
  });

  let remindersSent = 0;

  for (const labour of stuckLabours) {
    // Notify client
    if (labour.requirement?.client?.user) {
      const clientUser = labour.requirement.client.user;
      const config = {
        type: NotificationType.STAGE_PENDING_ACTION,
        title: `Labour stuck in ${labour.currentStage.replace(/_/g, " ")}`,
        message: `Labour ${labour.name} has been in stage ${labour.currentStage.replace(/_/g, " ")} for over ${STAGE_REMINDER_DAYS} days. Please take action.`,
        priority: NotificationPriority.HIGH,
        actionUrl: `/dashboard/client/trackers`,
        actionText: "View Tracker",
      };
      await NotificationService.createNotification({
        ...config,
        recipientId: clientUser.id,
      });
      // Send email
      if (clientUser.email) {
        await sendEmail({
          to: clientUser.email,
          subject: config.title,
          text: config.message,
        });
      }
      remindersSent++;
    }
    // Notify agency
    if (labour.agency?.user) {
      const agencyUser = labour.agency.user;
      const config = {
        type: NotificationType.STAGE_PENDING_ACTION,
        title: `Labour stuck in ${labour.currentStage.replace(/_/g, " ")}`,
        message: `Labour ${labour.name} has been in stage ${labour.currentStage.replace(/_/g, " ")} for over ${STAGE_REMINDER_DAYS} days. Please take action.`,
        priority: NotificationPriority.HIGH,
        actionUrl: `/dashboard/agency/recruitment`,
        actionText: "View Tracker",
      };
      await NotificationService.createNotification({
        ...config,
        recipientId: agencyUser.id,
      });
      // Send email
      if (agencyUser.email) {
        await sendEmail({
          to: agencyUser.email,
          subject: config.title,
          text: config.message,
        });
      }
      remindersSent++;
    }
  }

  return NextResponse.json({ success: true, remindersSent });
}
