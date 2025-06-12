// app/api/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ClientWithUser } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "PENDING_REVIEW"
    | "VERIFIED"
    | "REJECTED"
    | null;

  try {
    const clients = await prisma.client.findMany({
      where: {
        user: {
          status: status || undefined,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            phone: true,
          },
        },
        requirements: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients as ClientWithUser[]);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
