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

    const hasEditableFields =
      body.title !== undefined ||
      body.description !== undefined ||
      body.event_date !== undefined ||
      body.location !== undefined ||
      body.image_url !== undefined;

    const db = admin.db;
    if (db) {
      if (typeof body.is_active === "number") {
        await db
          .prepare("UPDATE events SET is_active = ? WHERE id = ?")
          .bind(body.is_active, id)
          .run();
      }
      if (hasEditableFields) {
        await db
          .prepare(
            "UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description), event_date = COALESCE(?, event_date), location = COALESCE(?, location), image_url = COALESCE(?, image_url) WHERE id = ?"
          )
          .bind(
            body.title ?? null,
            body.description ?? null,
            body.event_date ?? null,
            body.location ?? null,
            body.image_url ?? null,
            id
          )
          .run();
      }
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const event = fallback.events.get(id);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (typeof body.is_active === "number") event.is_active = body.is_active;
    if (body.title !== undefined) event.title = body.title;
    if (body.description !== undefined) event.description = body.description;
    if (body.event_date !== undefined) event.event_date = body.event_date;
    if (body.location !== undefined) event.location = body.location;
    if (body.image_url !== undefined) event.image_url = body.image_url;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update event error:", error);
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
      await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    fallback.events.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
