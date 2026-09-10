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
        .prepare("SELECT * FROM gallery_images ORDER BY display_order ASC, created_at DESC")
        .all();
      return NextResponse.json({ images: results || [] });
    }
    const fallback = getDb();
    const list = Array.from(fallback.galleryImages.values()).sort(
      (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0) || new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
    );
    return NextResponse.json({ images: list });
  } catch (error) {
    console.error("Admin gallery error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { title, category, image_url, display_order, is_active } = await req.json();
    if (!title || !category || !image_url) {
      return NextResponse.json({ error: "Title, category and image_url required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const db = admin.db;
    if (db) {
      await db
        .prepare("INSERT INTO gallery_images (id, title, category, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, title, category, image_url, display_order || 0, is_active ? 1 : 0)
        .run();
    } else {
      const fallback = getDb();
      fallback.galleryImages.set(id, {
        id,
        title,
        category,
        image_url,
        display_order: display_order || 0,
        is_active: is_active ? 1 : 0,
        created_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ success: true, image: { id } });
  } catch (error) {
    console.error("Create gallery image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
