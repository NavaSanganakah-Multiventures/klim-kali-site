import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  try {
    if (db) {
      const { results } = await db.prepare(
        "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC"
      ).all();
      return NextResponse.json({ users: results || [] });
    }

    const fallback = getDb();
    const users = Array.from(fallback.users.values());
    users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
