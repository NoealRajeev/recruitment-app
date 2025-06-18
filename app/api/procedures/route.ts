import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { ProcedureStatus } from "@/lib/generated/prisma";
import { z } from "zod";

const CreateProcedureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  labourProfileId: z.string().min(1),
  status: z.nativeEnum(ProcedureStatus).optional(),
  dueDate: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const procedures = await prisma.procedure.findMany({
    where: {
      labourProfile: {
        agency: {
          userId: session.user.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(procedures);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = CreateProcedureSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { name, description, labourProfileId, status, dueDate } = parsed.data;

  const procedure = await prisma.procedure.create({
    data: {
      name,
      description: description || "",
      labourProfileId,
      status: status || "PENDING",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  return NextResponse.json(procedure, { status: 201 });
}
