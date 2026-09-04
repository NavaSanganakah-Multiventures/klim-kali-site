import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;
    const rawOtp = body?.otp;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const otp = typeof rawOtp === "string" ? rawOtp.trim() : "";
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    let db;
    let cloudflareEnv: any = {};
    try {
      const ctx = getCloudflareContext();
      cloudflareEnv = ctx.env || {};
      db = cloudflareEnv.DB;
    } catch (e) {
      // local dev / Node fallback
    }

    const adminEmails = (process.env.ADMIN_EMAILS || cloudflareEnv.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(email);
    const role = isAdmin ? "ADMIN" : "USER";

    let user: any = null;
    let validOtpEntry: any = null;

    if (db) {
      // expires_at is stored as an ISO-8601 string, so compare against an ISO
      // timestamp rather than SQLite's datetime('now') (different format).
      validOtpEntry = await db.prepare(
        "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > ?"
      ).bind(email, otp, new Date().toISOString()).first();

      if (!validOtpEntry) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      await db.prepare("DELETE FROM otps WHERE id = ?").bind(validOtpEntry.id).run();

      user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      if (!user) {
        const userId = Math.random().toString(36).substring(7);
        await db.prepare(
          "INSERT INTO users (id, email, role) VALUES (?, ?, ?)"
        ).bind(userId, email, role).run();
        user = { id: userId, email, role, created_at: new Date().toISOString() };
      } else {
        await db.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, user.id).run();
        user.role = role;
      }
    } else {
      const fallbackDb = getDb();
      for (const [id, data] of fallbackDb.otps.entries()) {
        if (data.email === email && data.otp === otp) {
          validOtpEntry = data;
          break;
        }
      }

      if (!validOtpEntry || validOtpEntry.expiresAt < Date.now()) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      fallbackDb.otps.delete(validOtpEntry.id);

      for (const [id, data] of fallbackDb.users.entries()) {
        if (data.email === email) {
          user = data;
          break;
        }
      }

      if (!user) {
        const userId = Math.random().toString(36).substring(7);
        user = { id: userId, email, role, created_at: Date.now() };
        fallbackDb.users.set(userId, user);
      } else {
        user.role = role;
      }
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      // Only require HTTPS in production; local development runs on http://localhost.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
