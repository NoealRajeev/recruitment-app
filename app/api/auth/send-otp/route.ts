// app/api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import { saveOtp, canResendOtp } from "@/lib/otp-store";
import { getOtpEmailTemplate } from "@/lib/utils/email-templates";
import { sendTemplateEmail } from "@/lib/utils/email-service";

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
    // Check if we can resend
    if (!canResendOtp(value)) {
      return NextResponse.json(
        { message: "Please wait before requesting a new OTP" },
        { status: 429 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtp(value, otp);

    if (type === "email") {
      const emailTemplate = getOtpEmailTemplate(otp);
      await sendTemplateEmail(emailTemplate, value);
    } else {
      console.log(`📨 [MOCK OTP] OTP for ${type} (${value}): ${otp}`);
    }

    return NextResponse.json(
      { message: `OTP sent to your ${type}` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
