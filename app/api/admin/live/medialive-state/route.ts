import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getLiveConfig } from "@/lib/youtube";
import { describeMedialiveChannel, isMedialiveConfigured } from "@/lib/medialive";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  if (!db) {
    return NextResponse.json({ error: "D1 database available nahi hai" }, { status: 500 });
  }

  try {
    const config = await getLiveConfig(db);
    if (!config || !config.use_medialive || !isMedialiveConfigured(config)) {
      return NextResponse.json({ configured: false });
    }

    const channel = await describeMedialiveChannel(config);
    const state = (channel && (channel.state || channel.State)) || "UNKNOWN";
    return NextResponse.json({
      configured: true,
      state,
      channelId: config.medialive_channel_id,
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: (error && error.message) || "Describe failed",
    });
  }
}
