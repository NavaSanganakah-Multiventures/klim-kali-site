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
      if (typeof body.is_active === "number") {
        await db.prepare("UPDATE announcements SET is_active = ? WHERE id = ?").bind(body.is_active, id).run();
      }
      if (body.title !== undefined) {
        await db
          .prepare("UPDATE announcements SET title = ?, message = ?, priority = ? WHERE id = ?")
          .bind(body.title, body.message, body.priority ?? 0, id)
          .run();
      }
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const item = fallback.announcements.get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.is_active === "number") item.is_active = body.is_active;
    if (body.title !== undefined) {
      item.title = body.title;
      item.message = body.message;
      item.priority = body.priority ?? 0;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update announcement error:", error);
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
      await db.prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true });
    }
    const fallback = getDb();
    fallback.announcements.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
