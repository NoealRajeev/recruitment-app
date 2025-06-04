import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  const body = await req.json();
  const { type, value, otp } = body;

  if (!type || !value || !otp || !["email", "phone"].includes(type)) {
    return NextResponse.json(
      { message: "Invalid request payload" },
      { status: 400 }
    );
  }

  try {
    const isValid = verifyOtp(value, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Error verifying OTP: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
