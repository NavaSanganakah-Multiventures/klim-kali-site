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
        .prepare("SELECT * FROM events ORDER BY event_date DESC")
        .all();
      return NextResponse.json({ events: results || [] });
    }

    const fallback = getDb();
    const events = Array.from(fallback.events.values())
      .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const body = await req.json();
    const { title, description, event_date, location, image_url, is_active } = body;

    if (!title || !description || !event_date) {
      return NextResponse.json(
        { error: "Title, description and event date are required" },
        { status: 400 }
      );
    }

    const eventId = crypto.randomUUID();
    const db = admin.db;

    if (db) {
      await db
        .prepare(
          `INSERT INTO events (id, title, description, event_date, location, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          eventId,
          title,
          description,
          event_date,
          location || null,
          image_url || null,
          is_active ? 1 : 0
        )
        .run();
    } else {
      const fallback = getDb();
      fallback.events.set(eventId, {
        id: eventId,
        title,
        description,
        event_date,
        location: location || null,
        image_url: image_url || null,
        is_active: is_active ? 1 : 0,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, event: { id: eventId } });
  } catch (error) {
    console.error("Admin create event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
