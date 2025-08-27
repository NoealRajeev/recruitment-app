// app/api/requirement-options/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { z } from "zod";
// Import Prisma types + ContractDuration enum from your generated client
import { Prisma, ContractDuration } from "@/lib/generated/prisma";

const Types = [
  "JOB_TITLE",
  "TICKET_FREQUENCY",
  "WORK_LOCATION",
  "PREVIOUS_EXPERIENCE",
  "LANGUAGE",
  "CURRENCY",
  "CONTRACT_DURATION",
] as const;

type RequirementOptionTypeUnion = (typeof Types)[number];

// Create requires type + value
const CreateSchema = z.object({
  type: z.enum(Types),
  value: z.string().min(1).max(120),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Update is partial; only id is required
const UpdateSchema = z.object({
  id: z.string().uuid(),
  value: z.string().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Discriminated union
const UpsertSchema = z.union([CreateSchema, UpdateSchema]);

/** Convert raw string to ContractDuration enum if valid */
function parseContractDuration(value: string): ContractDuration | null {
  return (Object.values(ContractDuration) as string[]).includes(value)
    ? (value as ContractDuration)
    : null;
}

/** Return how many JobRoles currently reference this option's value */
async function getUsageCount(
  type: RequirementOptionTypeUnion,
  value: string
): Promise<number> {
  switch (type) {
    case "JOB_TITLE":
      return prisma.jobRole.count({ where: { title: value } });

    case "TICKET_FREQUENCY":
      return prisma.jobRole.count({ where: { ticketFrequency: value } });

    case "WORK_LOCATION":
      // In your schema workLocations is a String (not String[])
      return prisma.jobRole.count({ where: { workLocations: value } });

    case "PREVIOUS_EXPERIENCE":
      return prisma.jobRole.count({ where: { previousExperience: value } });

    case "LANGUAGE":
      // languageRequirements is String[]
      return prisma.jobRole.count({
        where: { languageRequirements: { has: value } },
      });

    case "CURRENCY":
      return prisma.jobRole.count({ where: { salaryCurrency: value } });

    case "CONTRACT_DURATION": {
      const cd = parseContractDuration(value);
      if (!cd) return 0; // avoid enum/type issues if bad value is stored
      return prisma.jobRole.count({ where: { contractDuration: cd } });
    }

    default:
      return 0;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as RequirementOptionTypeUnion | null;
  const includeUsage = searchParams.get("includeUsage") === "1";

  const where = type ? { type } : {};
  const items = await prisma.requirementOption.findMany({
    where,
    orderBy: [{ type: "asc" }, { order: "asc" }, { value: "asc" }],
  });

  if (!includeUsage) return NextResponse.json(items);

  // attach usageCount per option
  const withUsage = await Promise.all(
    items.map(async (it) => ({
      ...it,
      usageCount: await getUsageCount(
        it.type as RequirementOptionTypeUnion,
        it.value
      ),
    }))
  );
  return NextResponse.json(withUsage);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }

  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // CREATE
  if (!("id" in parsed.data)) {
    const data = parsed.data;
    try {
      const created = await prisma.requirementOption.create({ data });
      return NextResponse.json(created, { status: 201 });
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return NextResponse.json(
          {
            error: "DUPLICATE",
            message:
              "This value already exists for the selected type. Please use a different value.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "SERVER_ERROR", message: "Something went wrong." },
        { status: 500 }
      );
    }
  }

  // UPDATE (partial)
  const { id, ...patch } = parsed.data;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "NO_FIELDS", message: "No fields to update." },
      { status: 400 }
    );
  }

  try {
    // If changing "value", block when the option is already in use.
    if (typeof patch.value === "string") {
      const existing = await prisma.requirementOption.findUnique({
        where: { id },
      });
      if (!existing) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      if (existing.value !== patch.value) {
        const used = await getUsageCount(
          existing.type as RequirementOptionTypeUnion,
          existing.value
        );
        if ((used ?? 0) > 0) {
          return NextResponse.json(
            {
              error: "IN_USE",
              message:
                "This option is used in existing records and its value cannot be edited.",
              usageCount: used ?? 0,
            },
            { status: 409 }
          );
        }
      }
    }

    const updated = await prisma.requirementOption.update({
      where: { id },
      data: patch,
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          {
            error: "DUPLICATE",
            message:
              "This value already exists for the selected type. Please use a different value.",
          },
          { status: 409 }
        );
      }
      if (e.code === "P2025") {
        return NextResponse.json(
          { error: "NOT_FOUND", message: "Option not found." },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RECRUITMENT_ADMIN") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });

  try {
    const existing = await prisma.requirementOption.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Block delete if in use
    const used = await getUsageCount(
      existing.type as RequirementOptionTypeUnion,
      existing.value
    );
    if ((used ?? 0) > 0) {
      return NextResponse.json(
        {
          error: "IN_USE",
          message:
            "This option is used in existing records and cannot be deleted.",
          usageCount: used ?? 0,
        },
        { status: 409 }
      );
    }

    await prisma.requirementOption.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2025"
    ) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Something went wrong." },
      { status: 500 }
    );
  }
}
