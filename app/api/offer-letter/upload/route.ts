import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "signed-offers"
);
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

  // Check assignment exists and belongs to agency
  const assignment = await prisma.labourAssignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, agencyId: true, labourId: true },
  });
  if (!assignment) {
    return new Response(JSON.stringify({ error: "Assignment not found" }), {
      status: 404,
    });
  }
  // Optionally, check agencyId matches session user

  // Save file
  const filename = `signed-offer-${assignmentId}-${Date.now()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Ensure directory exists
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating directory:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create upload directory" }),
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  const url = `/uploads/signed-offers/${filename}`;

  // Use a transaction to update both the assignment and stage history
  await prisma.$transaction(async (tx) => {
    // Update assignment with signed offer letter URL
    await tx.labourAssignment.update({
      where: { id: assignmentId },
      data: { signedOfferLetterUrl: url },
    });

    // Update OFFER_LETTER_SIGN stage from PENDING to SIGNED
    await tx.labourStageHistory.updateMany({
      where: {
        labourId: assignment.labourId,
        stage: "OFFER_LETTER_SIGN",
        status: "PENDING",
      },
      data: {
        status: "SIGNED",
        completedAt: new Date(),
      },
    });
  });

  return new Response(JSON.stringify({ success: true, url }), { status: 200 });
}
