// app/api/reminders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/utils/email-service";
import { ONBOARDING_STEPS } from "@/components/ui/ProgressTracker";
import { getStageReminderEmail } from "@/lib/utils/email-templates";

export async function GET() {
  try {
    // Find all labour profiles that have stages not updated for 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const staleProfiles = await prisma.labourProfile.findMany({
      where: {
        currentStage: {
          not: "DEPLOYED", // Don't check deployed profiles
        },
        stages: {
          some: {
            stage: {
              not: "DEPLOYED",
            },
            updatedAt: {
              lt: threeDaysAgo,
            },
          },
        },
      },
      include: {
        stages: true,
        agency: {
          include: {
            user: true,
          },
        },
        LabourAssignment: {
          include: {
            jobRole: {
              include: {
                requirement: {
                  include: {
                    client: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let sentReminders = 0;

    // Process each stale profile
    for (const profile of staleProfiles) {
      const currentStage = profile.currentStage;
      const stageInfo = profile.stages.find((s) => s.stage === currentStage);

      if (!stageInfo) continue;

      // Determine who is responsible for this stage
      const stageDefinition = ONBOARDING_STEPS.find(
        (s) => s.key === currentStage
      );
      if (!stageDefinition) continue;

      // Get the responsible user (client or agency)
      let responsibleUser = null;
      let recipientType = "";

      if (
        stageDefinition.owner === "Client" &&
        profile.LabourAssignment.length > 0
      ) {
        const assignment = profile.LabourAssignment[0];
        responsibleUser = assignment.jobRole.requirement.client.user;
        recipientType = "client";
      } else if (stageDefinition.owner === "Agency" && profile.agency) {
        responsibleUser = profile.agency.user;
        recipientType = "agency";
      }

      if (!responsibleUser) continue;

      const emailData = getStageReminderEmail({
        recipientName: responsibleUser.name,
        profileName: profile.name,
        stageLabel: stageDefinition.label,
        stageStatus: stageInfo.status,
        lastUpdated: stageInfo.updatedAt.toLocaleString(),
        recipientType: recipientType as "client" | "agency",
      });

      await sendEmail({
        to: responsibleUser.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      sentReminders++;
    }

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

export default async function handler(req: Request, res: Response) {
  const result = await GET(req as any);
  return new Response(result.body, {
    status: result.status,
    headers: result.headers,
  });
}
