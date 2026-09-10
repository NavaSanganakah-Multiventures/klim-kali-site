"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchBookings();
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-orange-950 mb-6 md:mb-8">Bookings</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-xs md:text-sm">
              <thead className="bg-orange-100 text-orange-900">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4">Service</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Name</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Phone</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Date / Time</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">User</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-orange-50/50">
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">{b.service_type}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">{b.name}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">{b.phone}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">{b.date} <br/> {b.time}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 break-all max-w-[120px] md:max-w-[180px]">{b.userEmail}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="px-2 md:px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-orange-950 text-xs md:text-sm"
                        suppressHydrationWarning
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
