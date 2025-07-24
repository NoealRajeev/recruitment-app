import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  const { id: requirementId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Only allow client admin or agency
  if (
    !["CLIENT_ADMIN", "RECRUITMENT_AGENCY", "RECRUITMENT_ADMIN"].includes(
      session.user.role
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const details = await prisma.offerLetterDetails.findUnique({
    where: { requirementId },
  });
  if (!details) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(details);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  const { id: requirementId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const {
    workingHours: initialWorkingHours,
    workingDays: initialWorkingDays,
    leaveSalary: initialLeaveSalary,
    endOfService: initialEndOfService,
    probationPeriod,
  } = body;
  let leaveSalary = initialLeaveSalary;
  let endOfService = initialEndOfService;
  let workingHours = initialWorkingHours;
  let workingDays = initialWorkingDays;

  // Convert numeric values to string and handle special cases
  if (
    typeof leaveSalary === "number" ||
    (typeof leaveSalary === "string" &&
      leaveSalary.trim() !== "" &&
      !isNaN(Number(leaveSalary)))
  ) {
    const num = Number(leaveSalary);
    if (num === 0) {
      leaveSalary = "No leave salary provided";
    } else {
      leaveSalary = `${num} days per year`;
    }
  }
  if (
    typeof endOfService === "number" ||
    (typeof endOfService === "string" &&
      endOfService.trim() !== "" &&
      !isNaN(Number(endOfService)))
  ) {
    const num = Number(endOfService);
    endOfService = `${num} days per year`;
  }
  if (
    typeof workingHours === "number" ||
    (typeof workingHours === "string" &&
      workingHours.trim() !== "" &&
      !isNaN(Number(workingHours)))
  ) {
    const num = Number(workingHours);
    workingHours = `${num} Hours`;
  }
  if (
    typeof workingDays === "number" ||
    (typeof workingDays === "string" &&
      workingDays.trim() !== "" &&
      !isNaN(Number(workingDays)))
  ) {
    const num = Number(workingDays);
    workingDays = `${num} days`;
  }

  if (
    !workingHours ||
    !workingDays ||
    !leaveSalary ||
    !endOfService ||
    !probationPeriod
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }
  // Upsert details
  const details = await prisma.offerLetterDetails.upsert({
    where: { requirementId },
    update: {
      workingHours,
      workingDays,
      leaveSalary,
      endOfService,
      probationPeriod,
    },
    create: {
      requirementId,
      workingHours,
      workingDays,
      leaveSalary,
      endOfService,
      probationPeriod,
    },
  });
  return NextResponse.json(details);
}
