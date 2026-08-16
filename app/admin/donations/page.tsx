"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/donations")
      .then((r) => r.json())
      .then((data) => {
        setDonations(data.donations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-orange-950 mb-8">Donations</h1>
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
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-orange-50/50">
                    <td className="px-6 py-4">{d.name}</td>
                    <td className="px-6 py-4 font-semibold">₹{d.amount}</td>
                    <td className="px-6 py-4">{d.purpose}</td>
                    <td className="px-6 py-4">{d.userEmail}</td>
                    <td className="px-6 py-4">{new Date(d.created_at || d.createdAt).toLocaleDateString()}</td>
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
