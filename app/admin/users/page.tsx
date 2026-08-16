"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-orange-950 mb-8">Users</h1>
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
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-orange-50/50">
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.name || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={"px-3 py-1 rounded-full text-xs font-bold " + (
                        u.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {u.role || "USER"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(u.created_at || u.createdAt).toLocaleDateString()}</td>
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
