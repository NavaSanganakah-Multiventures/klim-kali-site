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

    let donations = [];
    if (db) {
      const { results } = await db
        .prepare(
          `SELECT id, name, amount, purpose, created_at FROM donations
             WHERE display_on_site = 1 AND status = 'SUCCESS'
             ORDER BY created_at DESC LIMIT 50`
        )
        .all();
      donations = results || [];
    } else {
      const fallback = getDb();
      donations = Array.from(fallback.donations.values())
        .filter((d: any) => d.display_on_site === 1 && d.status === "SUCCESS")
        .sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime())
        .slice(0, 50);
    }

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Featured donations error:", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}
