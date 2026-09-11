import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // ignore
    }

    let userData: any = null;
    let bookings: any[] = [];
    let donations: any[] = [];

    if (db) {
      userData = await db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").bind(payload.userId).first();
      const { results: b } = await db.prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC").bind(payload.userId).all();
      bookings = b || [];
      const { results: d } = await db.prepare("SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC").bind(payload.userId).all();
      donations = d || [];
    } else {
      const fallback = getDb();
      userData = fallback.users.get(payload.userId) || null;
      bookings = Array.from(fallback.bookings.values()).filter((b: any) => b.userId === payload.userId).sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
      donations = Array.from(fallback.donations.values()).filter((d: any) => d.userId === payload.userId).sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
    }

    return NextResponse.json({ user: userData, bookings, donations });
  } catch (error) {
    console.error("User dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
