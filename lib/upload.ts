import { getCloudflareContext } from "@opennextjs/cloudflare";

export type UploadResult =
  | { success: true; key: string; url: string }
  | { success: false; error: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getR2PublicUrl(): string {
  return (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
}

export async function uploadImage(
  file: File,
  folder: string
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "सिर्फ JPEG, PNG या WebP images allowed हैं",
    };
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: "फाइल 5MB से छोटी होनी चाहिए" };
  }

  let storage: any;
  try {
    const ctx = getCloudflareContext();
    storage = ctx.env.STORAGE;
  } catch (e) {
    return { success: false, error: "Image storage abhi available nahi hai" };
  }

  if (!storage) {
    return { success: false, error: "R2 storage binding missing hai" };
  }

  try {
    const extension = file.type.split("/")[1] || "jpg";
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    await storage.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
    });

    const publicBase = getR2PublicUrl();
    if (!publicBase) {
      return {
        success: false,
        error: "R2_PUBLIC_URL environment variable set nahi hai",
      };
    }

    return { success: true, key, url: `${publicBase}/${key}` };
  } catch (err: any) {
    console.error("R2 upload error:", err);
    return { success: false, error: err.message || "Image upload fail ho gaya" };
  }
}

export async function deleteImage(
  key: string
): Promise<{ success: boolean; error?: string }> {
  let storage: any;
  try {
    const ctx = getCloudflareContext();
    storage = ctx.env.STORAGE;
  } catch (e) {
    return { success: false, error: "Storage available nahi hai" };
  }

  if (!storage) {
    return { success: false, error: "R2 binding missing hai" };
  }

  try {
    await storage.delete(key);
    return { success: true };
  } catch (err: any) {
    console.error("R2 delete error:", err);
    return { success: false, error: err.message || "Image delete fail ho gaya" };
  }
}
