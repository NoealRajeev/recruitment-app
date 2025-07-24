import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "travel-documents"
);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: assignmentId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get agency profile
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );
    }

    // Check if assignment exists and belongs to this agency
    const assignment = await prisma.labourAssignment.findFirst({
      where: {
        id: assignmentId,
        agencyId: agency.id,
      },
      include: {
        labour: true,
        jobRole: {
          include: {
            requirement: {
              include: {
                client: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const travelDate = formData.get("travelDate") as string;
    const flightTicket = formData.get("flightTicket") as File | null;
    const medicalCertificate = formData.get(
      "medicalCertificate"
    ) as File | null;
    const policeClearance = formData.get("policeClearance") as File | null;
    const employmentContract = formData.get(
      "employmentContract"
    ) as File | null;
    const additionalDocuments = formData.getAll(
      "additionalDocuments"
    ) as File[];

    // Create a unique folder for this assignment's travel documents
    const travelFolder = `assignment-${assignmentId}-${uuidv4()}`;
    const travelDir = path.join(UPLOAD_DIR, travelFolder);
    fs.mkdirSync(travelDir, { recursive: true });

    // Helper function to save file and return URL
    const saveFile = async (file: File, prefix: string): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${prefix}-${Date.now()}${path.extname(file.name)}`;
      const filePath = path.join(travelDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/travel-documents/${travelFolder}/${filename}`;
    };

    // Save all documents
    const savedDocuments = [];

    if (flightTicket) {
      const url = await saveFile(flightTicket, "flight-ticket");
      savedDocuments.push({
        type: "FLIGHT_TICKET",
        url,
        name: flightTicket.name,
      });
    }

    if (medicalCertificate) {
      const url = await saveFile(medicalCertificate, "medical-certificate");
      savedDocuments.push({
        type: "MEDICAL_CERTIFICATE",
        url,
        name: medicalCertificate.name,
      });
    }

    if (policeClearance) {
      const url = await saveFile(policeClearance, "police-clearance");
      savedDocuments.push({
        type: "POLICE_CLEARANCE",
        url,
        name: policeClearance.name,
      });
    }

    if (employmentContract) {
      const url = await saveFile(employmentContract, "employment-contract");
      savedDocuments.push({
        type: "EMPLOYMENT_CONTRACT",
        url,
        name: employmentContract.name,
      });
    }

    // Save additional documents
    for (let i = 0; i < additionalDocuments.length; i++) {
      const doc = additionalDocuments[i];
      if (doc && doc.size > 0) {
        const url = await saveFile(doc, `additional-${i + 1}`);
        savedDocuments.push({
          type: "OTHER",
          url,
          name: doc.name,
        });
      }
    }

    // Check if assignment exists and get existing documents
    const existingAssignment = await prisma.labourAssignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        flightTicketUrl: true,
        medicalCertificateUrl: true,
        policeClearanceUrl: true,
        employmentContractUrl: true,
        additionalDocumentsUrls: true,
        travelDate: true,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if all required documents are uploaded
    const requiredDocuments = [
      "FLIGHT_TICKET",
      "MEDICAL_CERTIFICATE",
      "POLICE_CLEARANCE",
      "EMPLOYMENT_CONTRACT",
    ];
    const uploadedDocumentTypes = [
      ...(existingAssignment.flightTicketUrl ? ["FLIGHT_TICKET"] : []),
      ...(existingAssignment.medicalCertificateUrl
        ? ["MEDICAL_CERTIFICATE"]
        : []),
      ...(existingAssignment.policeClearanceUrl ? ["POLICE_CLEARANCE"] : []),
      ...(existingAssignment.employmentContractUrl
        ? ["EMPLOYMENT_CONTRACT"]
        : []),
      ...savedDocuments.map((doc) => doc.type),
    ];

    // Remove duplicates
    const uniqueUploadedTypes = Array.from(new Set(uploadedDocumentTypes));

    const allRequiredDocumentsUploaded = requiredDocuments.every((docType) =>
      uniqueUploadedTypes.includes(docType)
    );

    // Check for travel date in DB or current upload
    const hasTravelDate = !!(travelDate || existingAssignment.travelDate);

    const readyToMoveToNextStage =
      allRequiredDocumentsUploaded && hasTravelDate;

    // Update the assignment with travel information
    await prisma.labourAssignment.update({
      where: { id: assignmentId },
      data: {
        // travelDate is expected to be a full ISO string (date and time), and will be stored as a Date object with time preserved
        travelDate: travelDate ? new Date(travelDate) : null,
        flightTicketUrl:
          savedDocuments.find((doc) => doc.type === "FLIGHT_TICKET")?.url ||
          existingAssignment.flightTicketUrl ||
          null,
        medicalCertificateUrl:
          savedDocuments.find((doc) => doc.type === "MEDICAL_CERTIFICATE")
            ?.url ||
          existingAssignment.medicalCertificateUrl ||
          null,
        policeClearanceUrl:
          savedDocuments.find((doc) => doc.type === "POLICE_CLEARANCE")?.url ||
          existingAssignment.policeClearanceUrl ||
          null,
        employmentContractUrl:
          savedDocuments.find((doc) => doc.type === "EMPLOYMENT_CONTRACT")
            ?.url ||
          existingAssignment.employmentContractUrl ||
          null,
        additionalDocumentsUrls: [
          ...(existingAssignment.additionalDocumentsUrls || []),
          ...savedDocuments
            .filter((doc) => doc.type === "OTHER")
            .map((doc) => doc.url),
        ],
        updatedAt: new Date(),
      },
    });

    // Only create stage history and update current stage if all required documents are uploaded
    if (readyToMoveToNextStage) {
      // Create stage history entry for READY_TO_TRAVEL
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "READY_TO_TRAVEL",
          status: "COMPLETED",
          notes: `All travel documents uploaded.${travelDate ? ` Travel date: ${travelDate}` : ""}`,
          documents: savedDocuments.map((doc) => doc.url),
          completedAt: new Date(),
        },
      });

      // Update labour profile current stage
      await prisma.labourProfile.update({
        where: { id: assignment.labourId },
        data: {
          currentStage: "TRAVEL_CONFIRMATION",
        },
      });

      // Create audit log for stage completion
      await prisma.auditLog.create({
        data: {
          action: "LABOUR_PROFILE_STATUS_CHANGE",
          entityType: "LABOUR_PROFILE",
          entityId: assignment.labourId,
          description: `All travel documents uploaded for ${assignment.labour.name}.${travelDate ? ` Travel date: ${travelDate}.` : ""} Stage progressed to TRAVEL_CONFIRMATION.`,
          performedById: session.user.id,
          oldData: { currentStage: assignment.labour.currentStage },
          newData: { currentStage: "TRAVEL_CONFIRMATION" },
          affectedFields: ["currentStage", "travelDocuments"],
        },
      });
    } else {
      // Create audit log for partial document upload
      await prisma.auditLog.create({
        data: {
          action: "LABOUR_PROFILE_DOCUMENT_UPLOAD",
          entityType: "LABOUR_PROFILE",
          entityId: assignment.labourId,
          description: `Partial travel documents uploaded for ${assignment.labour.name}.${travelDate ? ` Travel date: ${travelDate}.` : ""} Missing documents: ${requiredDocuments.filter((docType) => !uniqueUploadedTypes.includes(docType)).join(", ")}`,
          performedById: session.user.id,
          oldData: { currentStage: assignment.labour.currentStage },
          newData: { uploadedDocuments: savedDocuments.map((doc) => doc.type) },
          affectedFields: ["travelDocuments"],
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: readyToMoveToNextStage
        ? "All travel documents uploaded successfully. Stage progressed to TRAVEL_CONFIRMATION."
        : "Travel documents uploaded successfully. Some required documents are still missing.",
      documents: savedDocuments,
      travelDate,
      readyToMoveToNextStage,
      missingDocuments: readyToMoveToNextStage
        ? []
        : requiredDocuments.filter(
            (docType) => !uniqueUploadedTypes.includes(docType)
          ),
    });
  } catch (error) {
    console.error("Error uploading travel documents:", error);
    return NextResponse.json(
      { error: "Failed to upload travel documents" },
      { status: 500 }
    );
  }
}
