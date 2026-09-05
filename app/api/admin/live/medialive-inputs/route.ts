import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getLiveConfig } from "@/lib/youtube";
import {
  describeMedialiveInput,
  isMedialiveConfigured,
  listMedialiveInputs,
} from "@/lib/medialive";

export const dynamic = "force-dynamic";

function shapeInput(input: any) {
  return {
    id: input.id,
    name: input.name,
    type: input.type,
    state: input.state,
    destinations: (input.destinations || []).map((d: any) => ({
      url: d.url,
      ip: d.ip,
      port: d.port,
    })),
  };
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
    if (!config || !isMedialiveConfigured(config)) {
      return NextResponse.json(
        { error: "AWS MediaLive settings configure nahi hain" },
        { status: 400 }
      );
    }

    const inputId = req.nextUrl.searchParams.get("inputId");
    if (inputId) {
      const input = await describeMedialiveInput(config, inputId);
      return NextResponse.json({ input: shapeInput(input) });
    }

    const data = await listMedialiveInputs(config);
    const inputs = (data.inputs || [])
      .filter((i: any) => i.type === "RTMP_PUSH")
      .map(shapeInput);

    return NextResponse.json({ inputs });
  } catch (error: any) {
    console.error("Admin medialive inputs GET error:", error);
    return NextResponse.json(
      { error: (error && error.message) || "Internal server error" },
      { status: 500 }
    );
  }
}
