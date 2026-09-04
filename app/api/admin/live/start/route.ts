import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getLiveConfig, isLiveConfigured, startLive } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  if (!db) {
    return NextResponse.json({ error: "D1 database available nahi hai" }, { status: 500 });
  }

  try {
    const config = await getLiveConfig(db);
    if (!isLiveConfigured(config)) {
      return NextResponse.json(
        { error: "YouTube settings configure nahi hain. Admin → Live Darshan me Channel ID + OAuth save karo." },
        { status: 400 }
      );
    }

    const result = await startLive(config!, db);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Admin live start error:", error);
    return NextResponse.json(
      { error: (error && error.message) || "Internal server error" },
      { status: 500 }
    );
  }
}
