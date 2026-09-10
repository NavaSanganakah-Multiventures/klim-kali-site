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

    const nowIso = new Date().toISOString();

    let events = [];
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT * FROM events
             WHERE is_active = 1 AND event_date >= datetime('now')
             ORDER BY event_date ASC LIMIT 20`
        )
        .all();
      events = results || [];
    } else {
      const fallback = getDb();
      events = Array.from(fallback.events.values())
        .filter((e: any) => e.is_active === 1 && e.event_date >= nowIso)
        .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 20);
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
