import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getLiveConfig, endLive } from "@/lib/youtube";

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
    if (!config) {
      return NextResponse.json({ error: "Config nahi mila" }, { status: 500 });
    }

    const result = await endLive(config, db);
    return NextResponse.json({ success: true, warning: result.warning || null });
  } catch (error: any) {
    console.error("Admin live end error:", error);
    return NextResponse.json(
      { error: (error && error.message) || "Internal server error" },
      { status: 500 }
    );
  }
}
