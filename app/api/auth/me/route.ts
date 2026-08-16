import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let db;
  try {
    db = getCloudflareContext().env.DB;
  } catch (e) {
    // Ignore in standard Node environments
  }

  let user;
  if (db) {
    const row = await db.prepare(
      "SELECT id, email, name, role, created_at FROM users WHERE id = ?"
    ).bind(payload.userId).first();
    user = row;
  } else {
    const fallbackDb = getDb();
    user = fallbackDb.users.get(payload.userId);
  }

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
