import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmailOTP } from "@/lib/email";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local dev / Node fallback
    }

    if (db) {
      await db.prepare("DELETE FROM otps WHERE email = ?").bind(email).run();
      const otpId = Math.random().toString(36).substring(7);
      await db.prepare(
        "INSERT INTO otps (id, email, otp, expires_at) VALUES (?, ?, ?, ?)"
      ).bind(otpId, email, otp, new Date(expiresAt).toISOString()).run();
    } else {
      const fallbackDb = getDb();
      for (const [id, data] of fallbackDb.otps.entries()) {
        if (data.email === email) {
          fallbackDb.otps.delete(id);
        }
      }
      const otpId = Math.random().toString(36).substring(7);
      fallbackDb.otps.set(otpId, { id: otpId, email, otp, expiresAt, created_at: Date.now() });
    }

    const emailResult = await sendEmailOTP(email, otp);
    const isDev = process.env.NODE_ENV !== "production";

    if (!emailResult.success) {
      // In development, let the login flow continue with the preview OTP so it
      // can be tested without a configured email service.
      if (isDev) {
        return NextResponse.json({
          success: true,
          message: "OTP generated (email not sent in development)",
          previewOtp: otp,
        });
      }
      return NextResponse.json({ error: emailResult.error || "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully", previewOtp: isDev ? otp : undefined });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
