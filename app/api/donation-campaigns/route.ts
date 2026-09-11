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

    let campaigns = [];
    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM donation_campaigns WHERE is_active = 1 ORDER BY created_at DESC")
        .all();
      campaigns = results || [];
    } else {
      const fallback = getDb();
      campaigns = Array.from(fallback.donationCampaigns.values())
        .filter((c: any) => c.is_active === 1)
        .sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
    }

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Campaigns fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
