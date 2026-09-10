import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local fallback
    }

    let announcements = [];
    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY priority DESC, created_at DESC LIMIT 20")
        .all();
      announcements = results || [];
    } else {
      const fallback = getDb();
      announcements = Array.from(fallback.announcements.values())
        .filter((a: any) => a.is_active === 1)
        .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0) || new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
        .slice(0, 20);
    }

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
