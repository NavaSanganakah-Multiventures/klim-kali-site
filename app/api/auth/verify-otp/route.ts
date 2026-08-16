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

    let db;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      db = getRequestContext().env.DB;
    } catch (e) {
      // local dev / Node fallback
    }

    // Admin role configuration
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(email.toLowerCase());
    const role = isAdmin ? "ADMIN" : "USER";

    let user: any = null;
    let validOtpEntry: any = null;

    if (db) {
      validOtpEntry = await db.prepare(
        "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > datetime('now')"
      ).bind(email, otp).first();

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
      secure: true, // HTTPS only
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
