"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const statuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return;
    setLoading(true);
    loadBookings();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-orange-950 mb-8">Bookings</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-100 text-orange-900">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-orange-50/50">
                    <td className="px-6 py-4">{b.service_type}</td>
                    <td className="px-6 py-4">{b.name}</td>
                    <td className="px-6 py-4">{b.phone}</td>
                    <td className="px-6 py-4">{b.date} <br/> {b.time}</td>
                    <td className="px-6 py-4">{b.userEmail}</td>
                    <td className="px-6 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-orange-950"
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