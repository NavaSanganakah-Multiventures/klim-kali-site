"use client";

import React, { useEffect, useState } from "react";
import { Users, CalendarCheck, Heart, Clock, CalendarDays, Eye } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.users ?? 0, icon: Users },
    { label: "Total Bookings", value: stats?.bookings ?? 0, icon: CalendarCheck },
    { label: "Pending Bookings", value: stats?.pendingBookings ?? 0, icon: Clock },
    { label: "Total Donations", value: stats?.totalDonations ?? 0, icon: Heart, prefix: "₹" },
    { label: "Featured Donations", value: stats?.featuredDonations ?? 0, icon: Eye },
    { label: "Active Events", value: stats?.events ?? 0, icon: CalendarDays },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-orange-950 mb-6 md:mb-8">Admin Dashboard</h1>
      {loading || !stats ? (
        <p className="text-orange-800">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {cards.map(({ label, value, icon: Icon, prefix }) => (
            <div key={label} className="bg-white p-5 md:p-6 rounded-2xl shadow border border-orange-100">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-orange-700 font-medium truncate">{label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-950 mt-2 break-words">
                    {prefix}{value}
                  </p>
                </div>
                <div className="p-2.5 md:p-3 bg-orange-100 rounded-xl text-orange-600 shrink-0 ml-3">
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
