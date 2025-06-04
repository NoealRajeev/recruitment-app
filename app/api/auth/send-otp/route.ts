import { NextResponse } from "next/server";
import { saveOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  const body = await req.json();
  const { type, value } = body;

  if (!type || !value || !["email", "phone"].includes(type)) {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 }
    );
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    saveOtp(value, otp); // Save using value as key (email/phone)

    console.log(`📨 [MOCK OTP] OTP for ${type} (${value}): ${otp}`);

    return NextResponse.json(
      { message: `OTP sent to your ${type}` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Error sending OTP: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
