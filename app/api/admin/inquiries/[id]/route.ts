import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const statuses = ["PENDING", "REPLIED", "RESOLVED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!statuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = admin.db;
    if (db) {
      await db.prepare("UPDATE inquiries SET status = ? WHERE id = ?").bind(status, id).run();
      return NextResponse.json({ success: true });
    }
    const fallback = getDb();
    const item = fallback.inquiries.get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    item.status = status;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update inquiry error:", error);
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
      await db.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true });
    }
    const fallback = getDb();
    fallback.inquiries.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
