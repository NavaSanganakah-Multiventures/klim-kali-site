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
      const { results } = await db.prepare(
        "SELECT d.*, u.email as userEmail, u.name as userName FROM donations d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC"
      ).all();
      return NextResponse.json({ donations: results || [] });
    }

    const fallback = getDb();
    const donations = Array.from(fallback.donations.values()).map((d: any) => ({
      ...d,
      userEmail: fallback.users.get(d.userId)?.email || null,
      userName: fallback.users.get(d.userId)?.name || null,
    }));
    donations.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Admin donations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
