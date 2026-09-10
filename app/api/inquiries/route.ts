import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, message } = await req.json();
    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local fallback
    }

    if (db) {
      await db
        .prepare("INSERT INTO inquiries (id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)")
        .bind(id, name, phone || null, email || null, message)
        .run();
    } else {
      const fallback = getDb();
      fallback.inquiries.set(id, {
        id,
        name,
        phone: phone || null,
        email: email || null,
        message,
        status: "PENDING",
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Inquiry submit error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
