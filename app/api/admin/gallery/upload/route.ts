import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG or WebP images allowed" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const safeExt = allowedTypes.includes(`image/${ext}`) ? ext.replace("jpeg", "jpg") : "jpg";
    const key = `gallery-${crypto.randomUUID()}.${safeExt}`;

    let imageUrl: string;

    try {
      const bucket = getCloudflareContext().env.BUCKET;
      await bucket.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      imageUrl = `/api/gallery/serve/${key}`;
    } catch (e) {
      // Fallback: local dev / no R2 binding → base64 data URL
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      imageUrl = `data:${file.type};base64,${base64}`;
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
