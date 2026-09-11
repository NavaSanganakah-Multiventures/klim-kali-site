import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const db = admin.db;

    if (db) {
      const fields: string[] = [];
      const values: any[] = [];

      if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
      if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
      if (body.target_amount !== undefined) { fields.push("target_amount = ?"); values.push(body.target_amount); }
      if (body.raised_amount !== undefined) { fields.push("raised_amount = ?"); values.push(body.raised_amount); }
      if (body.is_active !== undefined) { fields.push("is_active = ?"); values.push(body.is_active ? 1 : 0); }

      if (fields.length > 0) {
        values.push(id);
        await db.prepare(`UPDATE donation_campaigns SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
      }
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const item = fallback.donationCampaigns.get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.title !== undefined) item.title = body.title;
    if (body.description !== undefined) item.description = body.description;
    if (body.target_amount !== undefined) item.target_amount = body.target_amount;
    if (body.raised_amount !== undefined) item.raised_amount = body.raised_amount;
    if (body.is_active !== undefined) item.is_active = body.is_active ? 1 : 0;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const db = admin.db;
    if (db) {
      await db.prepare("DELETE FROM donation_campaigns WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true });
    }
    const fallback = getDb();
    fallback.donationCampaigns.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
