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
        .prepare("SELECT * FROM inquiries ORDER BY created_at DESC")
        .all();
      return NextResponse.json({ inquiries: results || [] });
    }
    const fallback = getDb();
    const list = Array.from(fallback.inquiries.values()).sort(
      (a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
    );
    return NextResponse.json({ inquiries: list });
  } catch (error) {
    console.error("Admin inquiries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
