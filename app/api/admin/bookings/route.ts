import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  try {
    if (db) {
      const { results } = await db.prepare(
        "SELECT b.*, u.email as userEmail, u.name as userName FROM bookings b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC"
      ).all();
      return NextResponse.json({ bookings: results || [] });
    }

    const fallback = getDb();
    const bookings = Array.from(fallback.bookings.values()).map((b: any) => ({
      ...b,
      userEmail: fallback.users.get(b.userId)?.email || null,
      userName: fallback.users.get(b.userId)?.name || null,
    }));
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Admin bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }
    const allowed = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = admin.db;
    if (db) {
      await db.prepare("UPDATE bookings SET status = ? WHERE id = ?").bind(status, id).run();
      return NextResponse.json({ success: true });
    }

    const fallback = getDb();
    const booking = fallback.bookings.get(id);
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    booking.status = status;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
