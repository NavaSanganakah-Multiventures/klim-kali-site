import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const db = getDb();
    let validOtpEntry = null;

    for (const [id, data] of db.otps.entries()) {
      if (data.email === email && data.otp === otp) {
        validOtpEntry = data;
        break;
      }
    }

    if (!validOtpEntry || validOtpEntry.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Clean up used OTP
    db.otps.delete(validOtpEntry.id);

    // Find or create user
    let user = null;
    for (const [id, data] of db.users.entries()) {
      if (data.email === email) {
        user = data;
        break;
      }
    }

    if (!user) {
      const userId = Math.random().toString(36).substring(7);
      user = { id: userId, email, created_at: Date.now() };
      db.users.set(userId, user);
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
