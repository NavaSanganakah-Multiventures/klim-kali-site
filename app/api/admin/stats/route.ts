import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = admin.db;
  try {
    if (db) {
      const usersCount = await db.prepare("SELECT COUNT(*) as count FROM users").first();
      const bookingsCount = await db.prepare("SELECT COUNT(*) as count FROM bookings").first();
      const pendingBookings = await db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'PENDING'").first();
      const donations = await db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations").first();
      const eventsCount = await db.prepare("SELECT COUNT(*) as count FROM events WHERE is_active = 1").first();
      const featuredDonations = await db.prepare("SELECT COUNT(*) as count FROM donations WHERE display_on_site = 1 AND status = 'SUCCESS'").first();
      return NextResponse.json({
        users: Number(usersCount?.count || 0),
        bookings: Number(bookingsCount?.count || 0),
        pendingBookings: Number(pendingBookings?.count || 0),
        donations: Number(donations?.count || 0),
        totalDonations: Number(donations?.total || 0),
        events: Number(eventsCount?.count || 0),
        featuredDonations: Number(featuredDonations?.count || 0),
      });
    }

    const fallback = getDb();
    const bookings = Array.from(fallback.bookings.values());
    const donationsList = Array.from(fallback.donations.values());
    return NextResponse.json({
      users: fallback.users.size,
      bookings: bookings.length,
      pendingBookings: bookings.filter((b: any) => b.status === "PENDING").length,
      donations: donationsList.length,
      totalDonations: donationsList.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0),
      events: Array.from(fallback.events.values()).filter((e: any) => e.is_active === 1).length,
      featuredDonations: donationsList.filter((d: any) => d.display_on_site === 1 && d.status === "SUCCESS").length,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
