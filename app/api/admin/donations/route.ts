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
        `SELECT d.*, u.email as userEmail, u.name as userName
           FROM donations d
           LEFT JOIN users u ON d.user_id = u.id
           ORDER BY d.created_at DESC`
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

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const body = await req.json();
    const { name, amount, purpose, phone, payment_mode, notes, display_on_site } = body;

    if (!name || !amount || amount < 1 || !purpose) {
      return NextResponse.json({ error: "Name, amount and purpose are required" }, { status: 400 });
    }

    const donationId = crypto.randomUUID();
    const db = admin.db;

    if (db) {
      await db.prepare(
        `INSERT INTO donations (id, user_id, amount, name, purpose, status, display_on_site, phone, payment_mode, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        donationId,
        admin.user.id,
        amount,
        name,
        purpose,
        "SUCCESS",
        display_on_site ? 1 : 0,
        phone || null,
        payment_mode || "CASH",
        notes || null
      ).run();
    } else {
      const fallback = getDb();
      fallback.donations.set(donationId, {
        id: donationId,
        user_id: admin.user.id,
        amount,
        name,
        purpose,
        status: "SUCCESS",
        display_on_site: display_on_site ? 1 : 0,
        phone: phone || null,
        payment_mode: payment_mode || "CASH",
        notes: notes || null,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, donation: { id: donationId } });
  } catch (error) {
    console.error("Admin create donation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { id, display_on_site } = await req.json();
    if (!id || typeof display_on_site !== "number") {
      return NextResponse.json({ error: "Missing id or display_on_site" }, { status: 400 });
    }

    const db = admin.db;
    if (db) {
      await db.prepare("UPDATE donations SET display_on_site = ? WHERE id = ?").bind(display_on_site, id).run();
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const donation = fallback.donations.get(id);
    if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    donation.display_on_site = display_on_site;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update donation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
