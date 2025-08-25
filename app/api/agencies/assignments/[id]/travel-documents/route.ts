// app/api/assignments/[id]/travel-documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { NotificationDelivery } from "@/lib/notification-delivery";
import {
  NotificationType,
  NotificationPriority,
  UserRole,
} from "@prisma/client";

const UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "travel-documents"
);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!agency)
      return NextResponse.json(
        { error: "Agency profile not found" },
        { status: 404 }
      );

    const assignment = await prisma.labourAssignment.findFirst({
      where: { id: assignmentId, agencyId: agency.id },
      include: {
        labour: true,
        jobRole: { include: { requirement: { include: { client: true } } } },
      },
    });
    if (!assignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );

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

    const travelFolder = `assignment-${assignmentId}-${uuidv4()}`;
    const travelDir = path.join(UPLOAD_DIR, travelFolder);
    fs.mkdirSync(travelDir, { recursive: true });

    const saveFile = async (file: File, prefix: string): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${prefix}-${Date.now()}${path.extname(file.name)}`;
      const filePath = path.join(travelDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/travel-documents/${travelFolder}/${filename}`;
    };

    const savedDocuments: { type: string; url: string; name: string }[] = [];
    if (flightTicket)
      savedDocuments.push({
        type: "FLIGHT_TICKET",
        url: await saveFile(flightTicket, "flight-ticket"),
        name: flightTicket.name,
      });
    if (medicalCertificate)
      savedDocuments.push({
        type: "MEDICAL_CERTIFICATE",
        url: await saveFile(medicalCertificate, "medical-certificate"),
        name: medicalCertificate.name,
      });
    if (policeClearance)
      savedDocuments.push({
        type: "POLICE_CLEARANCE",
        url: await saveFile(policeClearance, "police-clearance"),
        name: policeClearance.name,
      });
    if (employmentContract)
      savedDocuments.push({
        type: "EMPLOYMENT_CONTRACT",
        url: await saveFile(employmentContract, "employment-contract"),
        name: employmentContract.name,
      });
    for (let i = 0; i < additionalDocuments.length; i++) {
      const doc = additionalDocuments[i];
      if (doc && doc.size > 0)
        savedDocuments.push({
          type: "OTHER",
          url: await saveFile(doc, `additional-${i + 1}`),
          name: doc.name,
        });
    }

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
    if (!existingAssignment)
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );

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
      ...savedDocuments.map((d) => d.type),
    ];
    const uniqueUploadedTypes = Array.from(new Set(uploadedDocumentTypes));
    const allRequiredDocumentsUploaded = requiredDocuments.every((t) =>
      uniqueUploadedTypes.includes(t)
    );
    const hasTravelDate = !!(travelDate || existingAssignment.travelDate);
    const readyToMoveToNextStage =
      allRequiredDocumentsUploaded && hasTravelDate;

    await prisma.labourAssignment.update({
      where: { id: assignmentId },
      data: {
        travelDate: travelDate ? new Date(travelDate) : null,
        flightTicketUrl:
          savedDocuments.find((d) => d.type === "FLIGHT_TICKET")?.url ||
          existingAssignment.flightTicketUrl ||
          null,
        medicalCertificateUrl:
          savedDocuments.find((d) => d.type === "MEDICAL_CERTIFICATE")?.url ||
          existingAssignment.medicalCertificateUrl ||
          null,
        policeClearanceUrl:
          savedDocuments.find((d) => d.type === "POLICE_CLEARANCE")?.url ||
          existingAssignment.policeClearanceUrl ||
          null,
        employmentContractUrl:
          savedDocuments.find((d) => d.type === "EMPLOYMENT_CONTRACT")?.url ||
          existingAssignment.employmentContractUrl ||
          null,
        additionalDocumentsUrls: [
          ...(existingAssignment.additionalDocumentsUrls || []),
          ...savedDocuments.filter((d) => d.type === "OTHER").map((d) => d.url),
        ],
        updatedAt: new Date(),
      },
    });

    if (readyToMoveToNextStage) {
      await prisma.labourStageHistory.create({
        data: {
          labourId: assignment.labourId,
          stage: "READY_TO_TRAVEL",
          status: "COMPLETED",
          notes: `All travel documents uploaded.${travelDate ? ` Travel date: ${travelDate}` : ""}`,
          documents: savedDocuments.map((d) => d.url),
          completedAt: new Date(),
        },
      });
      await prisma.labourProfile.update({
        where: { id: assignment.labourId },
        data: { currentStage: "TRAVEL_CONFIRMATION" },
      });
      await prisma.auditLog.create({
        data: {
          action: "LABOUR_PROFILE_STATUS_CHANGE",
          entityType: "LABOUR_PROFILE",
          entityId: assignment.labourId,
          description: `All travel documents uploaded for ${assignment.labour.name}.`,
          performedById: session.user.id,
          oldData: { currentStage: assignment.labour.currentStage },
          newData: { currentStage: "TRAVEL_CONFIRMATION" },
          affectedFields: ["currentStage", "travelDocuments"],
        },
      });

      // NEW: Deliver “complete” doc upload notifications
      const cfg = (docLabel: string) =>
        ({
          type: NotificationType.TRAVEL_DOCUMENTS_UPLOADED,
          title: `${docLabel} uploaded`,
          message: `New ${docLabel.toLowerCase()} uploaded for ${assignment.labour.name}.`,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/dashboard/admin/requirements?requirementId=${assignment.jobRole.requirement.id}`,
          actionText: "Open requirement",
        }) as const;

      // Admin (first admin found)
      const admin = await prisma.user.findFirst({
        where: { role: UserRole.RECRUITMENT_ADMIN },
        select: { id: true },
      });
      for (const t of uniqueUploadedTypes) {
        if (admin?.id) {
          await NotificationDelivery.deliverToUser(
            admin.id,
            cfg(t),
            session.user.id,
            "LabourAssignment",
            assignmentId
          );
        }
        await NotificationDelivery.deliverToUser(
          assignment.agencyId,
          cfg(t),
          session.user.id,
          "LabourAssignment",
          assignmentId
        );
      }
    } else {
      await prisma.auditLog.create({
        data: {
          action: "LABOUR_PROFILE_DOCUMENT_UPLOAD",
          entityType: "LABOUR_PROFILE",
          entityId: assignment.labourId,
          description: `Partial travel documents uploaded for ${assignment.labour.name}.`,
          performedById: session.user.id,
          oldData: { currentStage: assignment.labour.currentStage },
          newData: { uploadedDocuments: savedDocuments.map((d) => d.type) },
          affectedFields: ["travelDocuments"],
        },
      });

      // NEW: Deliver “partial” doc upload notifications (NORMAL)
      const partialCfg = (docLabel: string) =>
        ({
          type: NotificationType.TRAVEL_DOCUMENTS_UPLOADED,
          title: `${docLabel} uploaded`,
          message: `${docLabel} uploaded for ${assignment.labour.name}. More documents are pending.`,
          priority: NotificationPriority.NORMAL,
          actionUrl: `/dashboard/agency/recruitment`,
          actionText: "Review",
        }) as const;

      const admin = await prisma.user.findFirst({
        where: { role: UserRole.RECRUITMENT_ADMIN },
        select: { id: true },
      });
      for (const d of savedDocuments) {
        if (admin?.id) {
          await NotificationDelivery.deliverToUser(
            admin.id,
            partialCfg(d.type),
            session.user.id,
            "LabourAssignment",
            assignmentId
          );
        }
        await NotificationDelivery.deliverToUser(
          assignment.agencyId,
          partialCfg(d.type),
          session.user.id,
          "LabourAssignment",
          assignmentId
        );
      }
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
        : requiredDocuments.filter((t) => !uniqueUploadedTypes.includes(t)),
    });
  } catch (error) {
    console.error("Error uploading travel documents:", error);
    return NextResponse.json(
      { error: "Failed to upload travel documents" },
      { status: 500 }
    );
  }
}
