import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export const runtime = 'edge';

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

    // Admin role configuration
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(email.toLowerCase());
    const role = isAdmin ? "ADMIN" : "USER";

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
      user = { id: userId, email, role, created_at: Date.now() };
      db.users.set(userId, user);
    } else {
      // Sync role in case ADMIN_EMAILS changed
      user.role = role;
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

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
