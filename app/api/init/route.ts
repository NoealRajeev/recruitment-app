// app/api/init/route.ts
import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Initialization only allowed in development" },
      { status: 403 }
    );
  }

  try {
    await seedDatabase();
    return NextResponse.json({ message: "Database initialized" });
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      { error: "Initialization failed" },
      { status: 500 }
    );
  }
}
