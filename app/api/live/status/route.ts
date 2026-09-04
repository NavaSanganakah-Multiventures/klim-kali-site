import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getCloudflareContext().env.DB;
    if (!db) {
      return NextResponse.json({ is_live: 0, youtube_channel_id: "" });
    }
    const row = await db
      .prepare("SELECT youtube_channel_id, is_live FROM live_stream_config WHERE id = 1")
      .first();
    return NextResponse.json({
      is_live: row && row.is_live ? 1 : 0,
      youtube_channel_id: (row && row.youtube_channel_id) || "",
    });
  } catch (error) {
    return NextResponse.json({ is_live: 0, youtube_channel_id: "" });
  }
}
