// app/api/reminders/route.ts
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/utils/email-service";
import { ONBOARDING_STEPS } from "@/components/ui/ProgressTracker";
import { getStageReminderEmail } from "@/lib/utils/email-templates";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    // 1) calculate cutoff date
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 2) load all profiles whose currentStage hasn’t advanced in 3+ days
    const staleProfiles = await prisma.labourProfile.findMany({
      where: {
        currentStage: { not: "DEPLOYED" },
        stages: {
          some: {
            stage: { not: "DEPLOYED" },
            updatedAt: { lt: threeDaysAgo },
          },
        },
      },
      include: {
        stages: true,
        agency: { include: { user: true } },
        LabourAssignment: {
          include: {
            jobRole: {
              include: {
                requirement: {
                  include: { client: { include: { user: true } } },
                },
              },
            },
          },
        },
      },
    });

    let sentReminders = 0;

    // 3) for each stale profile, figure out who owns this stage
    for (const profile of staleProfiles) {
      const currentStage = profile.currentStage;
      const stageInfo = profile.stages.find((s) => s.stage === currentStage);
      if (!stageInfo) continue;

      const stageDef = ONBOARDING_STEPS.find((s) => s.key === currentStage);
      if (!stageDef) continue;

      let responsibleUser = null;
      let recipientType: "client" | "agency" = "client";

      if (stageDef.owner === "Client" && profile.LabourAssignment.length > 0) {
        responsibleUser =
          profile.LabourAssignment[0].jobRole.requirement.client.user;
        recipientType = "client";
      } else if (stageDef.owner === "Agency" && profile.agency) {
        responsibleUser = profile.agency.user;
        recipientType = "agency";
      }
      if (!responsibleUser) continue;

      // 4) build & send the reminder email
      const emailData = getStageReminderEmail({
        recipientName: responsibleUser.name,
        profileName: profile.name,
        stageLabel: stageDef.label,
        stageStatus: stageInfo.status,
        lastUpdated: stageInfo.updatedAt.toLocaleString(),
        recipientType,
      });

      await sendEmail({
        to: responsibleUser.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      sentReminders++;
    }

    // 5) respond with count
    return NextResponse.json({
      success: true,
      message: `Sent ${sentReminders} reminder emails`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
