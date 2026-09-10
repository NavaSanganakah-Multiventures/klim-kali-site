"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Bell } from "lucide-react";

export default function AdminAnnouncements() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", priority: "0", is_active: true });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.announcements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          priority: parseInt(form.priority),
          is_active: form.is_active ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage({ type: "success", text: "Announcement saved" });
      setForm({ title: "", message: "", priority: "0", is_active: true });
      fetchItems();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: item.is_active ? 0 : 1 }),
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Toggle failed", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-950">Announcements</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Hide Form" : "Add Announcement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-2xl shadow border border-orange-100 mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-orange-950 mb-4">Create Announcement</h2>
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-orange-900 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Priority</label>
              <input
                type="number"
                min="0"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-orange-900 mb-1">Message</label>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input
              id="active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-orange-900">Active</label>
          </div>
          <button
            disabled={saving}
            type="submit"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Announcement"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left text-xs md:text-sm">
              <thead className="bg-orange-100 text-orange-900">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4">Title</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Priority</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Active</th>
                  <th className="px-3 md:px-6 py-3 md:py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/50">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <p className="font-medium text-orange-950">{item.title}</p>
                      <p className="text-xs text-orange-700 mt-1 line-clamp-2">{item.message}</p>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">{item.priority}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
