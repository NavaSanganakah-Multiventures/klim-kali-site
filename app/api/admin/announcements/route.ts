import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  try {
    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM announcements ORDER BY priority DESC, created_at DESC")
        .all();
      return NextResponse.json({ announcements: results || [] });
    }
    const fallback = getDb();
    const list = Array.from(fallback.announcements.values()).sort(
      (a: any, b: any) => (b.priority || 0) - (a.priority || 0) || new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
    );
    return NextResponse.json({ announcements: list });
  } catch (error) {
    console.error("Admin announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { title, message, priority, is_active } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const db = admin.db;
    if (db) {
      await db
        .prepare("INSERT INTO announcements (id, title, message, priority, is_active) VALUES (?, ?, ?, ?, ?)")
        .bind(id, title, message, priority || 0, is_active ? 1 : 0)
        .run();
    } else {
      const fallback = getDb();
      fallback.announcements.set(id, {
        id,
        title,
        message,
        priority: priority || 0,
        is_active: is_active ? 1 : 0,
        created_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ success: true, announcement: { id } });
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
