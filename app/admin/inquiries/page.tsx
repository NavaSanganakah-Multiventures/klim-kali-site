"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const statuses = ["PENDING", "REPLIED", "RESOLVED"];

export default function AdminInquiries() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.inquiries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchItems();
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-orange-950 mb-6 md:mb-8">Inquiries</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-orange-700">अभी कोई inquiry नहीं है।</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow border border-orange-100">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-orange-950">{item.name}</p>
                  <p className="text-sm text-orange-700">{item.phone || item.email || "—"}</p>
                </div>
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="px-2 py-1 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-950"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-orange-900/80 whitespace-pre-line">{item.message}</p>
              <p className="text-xs text-orange-400 mt-3">
                {new Date(item.created_at || item.createdAt).toLocaleString("hi-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
