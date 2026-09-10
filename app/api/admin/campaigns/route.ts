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
        .prepare("SELECT * FROM donation_campaigns ORDER BY created_at DESC")
        .all();
      return NextResponse.json({ campaigns: results || [] });
    }
    const fallback = getDb();
    const list = Array.from(fallback.donationCampaigns.values()).sort(
      (a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
    );
    return NextResponse.json({ campaigns: list });
  } catch (error) {
    console.error("Admin campaigns error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { title, description, target_amount, raised_amount, is_active } = await req.json();
    if (!title || !target_amount) {
      return NextResponse.json({ error: "Title and target amount required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const db = admin.db;
    if (db) {
      await db
        .prepare("INSERT INTO donation_campaigns (id, title, description, target_amount, raised_amount, is_active) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, title, description || null, target_amount, raised_amount || 0, is_active ? 1 : 0)
        .run();
    } else {
      const fallback = getDb();
      fallback.donationCampaigns.set(id, {
        id,
        title,
        description: description || null,
        target_amount,
        raised_amount: raised_amount || 0,
        is_active: is_active ? 1 : 0,
        created_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ success: true, campaign: { id } });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
