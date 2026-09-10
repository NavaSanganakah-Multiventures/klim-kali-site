"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Target } from "lucide-react";

export default function AdminCampaigns() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_amount: "", raised_amount: "0", is_active: true });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/campaigns")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.campaigns || []);
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
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          target_amount: parseFloat(form.target_amount),
          raised_amount: parseFloat(form.raised_amount || "0"),
          is_active: form.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage({ type: "success", text: "Campaign saved" });
      setForm({ title: "", description: "", target_amount: "", raised_amount: "0", is_active: true });
      setShowForm(false);
      fetchItems();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" }).then(() => fetchItems());
  };

  const toggleActive = async (item: any) => {
    fetch(`/api/admin/campaigns/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: item.is_active ? 0 : 1 }),
    }).then(() => fetchItems());
  };

  const progress = (item: any) => {
    const pct = item.target_amount ? Math.min(100, ((item.raised_amount || 0) / item.target_amount) * 100) : 0;
    return Math.round(pct);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-950">Donation Campaigns</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Hide Form" : "Add Campaign"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-2xl shadow border border-orange-100 mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-orange-950 mb-4">Create Campaign</h2>
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-orange-900 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-orange-900 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Raised Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={form.raised_amount}
                onChange={(e) => setForm({ ...form, raised_amount: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input
              id="active-campaign"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
            />
            <label htmlFor="active-campaign" className="text-sm font-medium text-orange-900">Active</label>
          </div>
          <button
            disabled={saving}
            type="submit"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Campaign"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow border border-orange-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-orange-950">{item.title}</h3>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-orange-800/70 mb-4">{item.description || "—"}</p>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-orange-900">Raised: ₹{item.raised_amount || 0}</span>
                <span className="text-orange-700">Target: ₹{item.target_amount}</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-2.5 mb-4">
                <div
                  className="bg-orange-600 h-2.5 rounded-full"
                  style={{ width: `${progress(item)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-900">{progress(item)}%</span>
                <button
                  onClick={() => toggleActive(item)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
