import { NextResponse } from "next/server";

// No‑op endpoint to acknowledge offline cache sync attempts
export async function POST() {
  return NextResponse.json({ ok: true });
}
