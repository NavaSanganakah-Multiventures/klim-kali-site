import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
};

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const payload = await verifyToken(token);
  if (!payload?.userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  let db;
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    db = getRequestContext().env.DB;
  } catch (e) {
    // local dev fallback
  }

  let user: AdminUser | null = null;
  if (db) {
    const row = await db.prepare(
      "SELECT id, email, name, role FROM users WHERE id = ?"
    ).bind(payload.userId).first();
    if (row) user = row as AdminUser;
  } else {
    const fallback = getDb();
    const found = fallback.users.get(payload.userId);
    if (found) {
      user = {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role || "USER",
      };
    }
  }

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, db };
}
