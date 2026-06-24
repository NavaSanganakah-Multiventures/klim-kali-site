import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmailOTP } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = getDb();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Clean up old OTPs for this email
    for (const [id, data] of db.otps.entries()) {
      if (data.email === email) {
        db.otps.delete(id);
      }
    }

    const otpId = Math.random().toString(36).substring(7);
    db.otps.set(otpId, { id: otpId, email, otp, expiresAt, created_at: Date.now() });

    await sendEmailOTP(email, otp);

    // In preview mode, return OTP in response for easy testing
    return NextResponse.json({ success: true, message: "OTP sent successfully", previewOtp: otp });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
