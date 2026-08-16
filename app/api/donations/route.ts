import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local fallback
    }

    let userDonations = [];
    if (db) {
      const { results } = await db.prepare("SELECT * FROM donations WHERE user_id = ? ORDER BY created_at DESC").bind(payload.userId).all();
      userDonations = results || [];
    } else {
      const fallbackDb = getDb();
      userDonations = Array.from(fallbackDb.donations.values()).filter(
        (donation: any) => donation.userId === payload.userId
      );
    }

    return NextResponse.json({ donations: userDonations });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
