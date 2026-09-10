import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local fallback
    }

    let images = [];
    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM gallery_images WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC")
        .all();
      images = results || [];
    } else {
      const fallback = getDb();
      images = Array.from(fallback.galleryImages.values())
        .filter((i: any) => i.is_active === 1)
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0) || new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime());
    }

    const categories = Array.from(new Set(images.map((i: any) => i.category)));
    return NextResponse.json({ images, categories });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
