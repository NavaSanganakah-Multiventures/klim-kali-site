import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { serviceType, date, time, name, phone, message } = body;

    if (!serviceType || !date || !time || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookingId = Math.random().toString(36).substring(7);
    const createdAt = Date.now();
    const status = "PENDING";

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // Ignore in standard Node environments
    }

    if (db) {
      await db.prepare(
        "INSERT INTO bookings (id, user_id, service_type, date, time, name, phone, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(bookingId, payload.userId, serviceType, date, time, name, phone, message || null, status, new Date(createdAt).toISOString()).run();
    } else {
      const fallbackDb = getDb();
      const booking = {
        id: bookingId,
        userId: payload.userId,
        serviceType,
        date,
        time,
        name,
        phone,
        message,
        status,
        createdAt
      };
      fallbackDb.bookings.set(bookingId, booking);
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // Ignore
    }

    let userBookings = [];
    if (db) {
      const { results } = await db.prepare("SELECT * FROM bookings WHERE user_id = ?").bind(payload.userId).all();
      userBookings = results;
    } else {
      const fallbackDb = getDb();
      userBookings = Array.from(fallbackDb.bookings.values()).filter(b => b.userId === payload.userId);
    }

    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
