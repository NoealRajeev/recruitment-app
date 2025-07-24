import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import path from "path";
import fs from "fs";
import { sendTemplateEmail } from "@/lib/utils/email-service";
import { getVisaNotificationEmail } from "@/lib/utils/email-templates";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "visas");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignmentId = id;

  try {
    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      select: { id: true, companyName: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found" },
        { status: 404 }
      );
    }

    // Check if assignment exists and belongs to this client
    const assignment = await prisma.labourAssignment.findFirst({
      where: {
        id: assignmentId,
        jobRole: {
          requirement: {
            clientId: client.id,
          },
        },
      },
      include: {
        jobRole: {
          include: {
            requirement: true,
          },
        },
        labour: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Missing or invalid PDF file" },
        { status: 400 }
      );
    }

    // Save file
    const filename = `visa-${assignmentId}-${Date.now()}.pdf`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    const url = `/uploads/visas/${filename}`;

    // Use a transaction to update both the assignment and stage history
    await prisma.$transaction(async (tx) => {
      // Update assignment with visa URL
      await tx.labourAssignment.update({
        where: { id: assignmentId },
        data: { visaUrl: url },
      });

      // Mark VISA_PRINTING stage as completed
      await tx.labourStageHistory.updateMany({
        where: {
          labourId: assignment.labourId,
          stage: "VISA_PRINTING",
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Update current stage to READY_TO_TRAVEL
      await tx.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "READY_TO_TRAVEL",
        },
      });

      // Create new READY_TO_TRAVEL stage with PENDING status
      await tx.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "READY_TO_TRAVEL",
          status: "PENDING",
          notes: "Visa printed, ready to travel",
        },
      });
    });

    // Send email notification to labourer if they have an email
    if (assignment.labour.email) {
      try {
        const emailTemplate = getVisaNotificationEmail(
          assignment.labour.name,
          client.companyName,
          assignment.jobRole.title,
          `${process.env.NEXTAUTH_URL}${url}`
        );

        sendTemplateEmail(
          emailTemplate,
          //   assignment.labour.email,
          "noealrajeev987@gmail.com",
          undefined,
          undefined,
          [
            {
              filename: `Visa_${assignment.labour.name.replace(/\s+/g, "_")}.pdf`,
              path: filePath,
              contentType: "application/pdf",
            },
          ]
        );
      } catch (emailError) {
        console.error("Error sending visa notification email:", emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Visa uploaded successfully",
      url,
    });
  } catch (error) {
    console.error("Error uploading visa:", error);
    return NextResponse.json(
      { error: "Failed to upload visa" },
      { status: 500 }
    );
  }
}
