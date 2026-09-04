import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getLiveConfig } from "@/lib/youtube";

export const dynamic = "force-dynamic";

function mask(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return "••••" + value.slice(-4);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  if (!db) {
    return NextResponse.json({ error: "D1 database available nahi hai" }, { status: 500 });
  }

  try {
    const config = await getLiveConfig(db);
    return NextResponse.json({
      youtube_channel_id: (config && config.youtube_channel_id) || "",
      youtube_stream_key: mask((config && config.youtube_stream_key) || ""),
      oauth_client_id: mask((config && config.oauth_client_id) || ""),
      oauth_client_secret: mask((config && config.oauth_client_secret) || ""),
      oauth_refresh_token: config && config.oauth_refresh_token ? "set" : "",
      isConfigured: !!(
        config &&
        config.youtube_channel_id &&
        config.youtube_stream_key &&
        config.oauth_client_id &&
        config.oauth_client_secret &&
        config.oauth_refresh_token
      ),
      is_live: config && config.is_live ? 1 : 0,
      current_broadcast_id: (config && config.current_broadcast_id) || "",
      use_medialive: config && config.use_medialive ? 1 : 0,
      aws_region: (config && config.aws_region) || "",
      aws_access_key_id: mask((config && config.aws_access_key_id) || ""),
      aws_secret_access_key: config && config.aws_secret_access_key ? "set" : "",
      medialive_channel_id: (config && config.medialive_channel_id) || "",
      isMedialiveConfigured: !!(
        config &&
        config.aws_region &&
        config.aws_access_key_id &&
        config.aws_secret_access_key &&
        config.medialive_channel_id
      ),
    });
  } catch (error) {
    console.error("Admin live GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  if (!db) {
    return NextResponse.json({ error: "D1 database available nahi hai" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const config = await getLiveConfig(db);
    if (!config) {
      return NextResponse.json({ error: "Config nahi mila" }, { status: 500 });
    }

    const next = {
      youtube_channel_id:
        typeof body.youtube_channel_id === "string"
          ? body.youtube_channel_id.trim()
          : config.youtube_channel_id,
      youtube_stream_key:
        typeof body.youtube_stream_key === "string" &&
        body.youtube_stream_key.indexOf("••") === -1
          ? body.youtube_stream_key.trim()
          : config.youtube_stream_key,
      oauth_client_id:
        typeof body.oauth_client_id === "string" &&
        body.oauth_client_id.indexOf("••") === -1
          ? body.oauth_client_id.trim()
          : config.oauth_client_id,
      oauth_client_secret:
        typeof body.oauth_client_secret === "string" &&
        body.oauth_client_secret.indexOf("••") === -1
          ? body.oauth_client_secret.trim()
          : config.oauth_client_secret,
      oauth_refresh_token:
        typeof body.oauth_refresh_token === "string" &&
        body.oauth_refresh_token !== "set"
          ? body.oauth_refresh_token.trim()
          : config.oauth_refresh_token,
      use_medialive:
        body.use_medialive === 1 || body.use_medialive === true || body.use_medialive === "1"
          ? 1
          : 0,
      aws_region:
        typeof body.aws_region === "string"
          ? body.aws_region.trim()
          : config.aws_region,
      aws_access_key_id:
        typeof body.aws_access_key_id === "string" &&
        body.aws_access_key_id.indexOf("••") === -1
          ? body.aws_access_key_id.trim()
          : config.aws_access_key_id,
      aws_secret_access_key:
        typeof body.aws_secret_access_key === "string" &&
        body.aws_secret_access_key !== "set"
          ? body.aws_secret_access_key.trim()
          : config.aws_secret_access_key,
      medialive_channel_id:
        typeof body.medialive_channel_id === "string"
          ? body.medialive_channel_id.trim()
          : config.medialive_channel_id,
    };

    await db
      .prepare(
        "UPDATE live_stream_config SET youtube_channel_id = ?, youtube_stream_key = ?, oauth_client_id = ?, oauth_client_secret = ?, oauth_refresh_token = ?, use_medialive = ?, aws_region = ?, aws_access_key_id = ?, aws_secret_access_key = ?, medialive_channel_id = ?, updated_at = datetime('now') WHERE id = 1"
      )
      .bind(
        next.youtube_channel_id,
        next.youtube_stream_key,
        next.oauth_client_id,
        next.oauth_client_secret,
        next.oauth_refresh_token,
        next.use_medialive,
        next.aws_region,
        next.aws_access_key_id,
        next.aws_secret_access_key,
        next.medialive_channel_id
      )
      .run();

    return NextResponse.json({
      success: true,
      isConfigured: !!(next.youtube_channel_id && next.youtube_stream_key && next.oauth_client_id && next.oauth_client_secret && next.oauth_refresh_token),
      isMedialiveConfigured: !!(next.aws_region && next.aws_access_key_id && next.aws_secret_access_key && next.medialive_channel_id),
    });
  } catch (error) {
    console.error("Admin live PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
