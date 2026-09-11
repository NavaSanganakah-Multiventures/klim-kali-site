import { getCloudflareContext } from "@opennextjs/cloudflare";
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
        await db.prepare("UPDATE gallery_images SET is_active = ? WHERE id = ?").bind(body.is_active, id).run();
      }
      if (body.title !== undefined) {
        await db
          .prepare("UPDATE gallery_images SET title = ?, category = ?, image_url = ?, display_order = ? WHERE id = ?")
          .bind(body.title, body.category, body.image_url, body.display_order ?? 0, id)
          .run();
      }
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const item = fallback.galleryImages.get(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.is_active === "number") item.is_active = body.is_active;
    if (body.title !== undefined) {
      item.title = body.title;
      item.category = body.category;
      item.image_url = body.image_url;
      item.display_order = body.display_order ?? 0;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update gallery image error:", error);
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
    let imageUrl: string | null = null;

    if (db) {
      const row: any = await db.prepare("SELECT image_url FROM gallery_images WHERE id = ?").bind(id).first();
      if (row) imageUrl = row.image_url;
      await db.prepare("DELETE FROM gallery_images WHERE id = ?").bind(id).run();
    } else {
      const fallback = getDb();
      const item = fallback.galleryImages.get(id);
      if (item) {
        imageUrl = item.image_url;
        fallback.galleryImages.delete(id);
      }
    }

    if (imageUrl && imageUrl.startsWith("/api/gallery/serve/")) {
      try {
        const key = imageUrl.replace("/api/gallery/serve/", "");
        const bucket = getCloudflareContext().env.BUCKET;
        await bucket.delete(key);
      } catch (e) {
        console.error("R2 delete failed", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
