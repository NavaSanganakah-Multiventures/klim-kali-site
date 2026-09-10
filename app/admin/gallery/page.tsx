"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function AdminGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", image_url: "", display_order: "0", is_active: true });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.images || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          image_url: form.image_url,
          display_order: parseInt(form.display_order),
          is_active: form.is_active ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage({ type: "success", text: "Image added" });
      setForm({ title: "", category: "", image_url: "", display_order: "0", is_active: true });
      fetchItems();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: item.is_active ? 0 : 1 }),
      });
      if (res.ok) fetchItems();
    } catch (error) {
      console.error("Toggle failed", error);
    }
  };

  const filtered = selectedCategory === "ALL" ? items : items.filter((i) => i.category === selectedCategory);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-950">Gallery</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Hide Form" : "Add Image"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-2xl shadow border border-orange-100 mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-orange-950 mb-4">Add Gallery Image</h2>
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Category</label>
              <input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. दैनिक दर्शन"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Image URL</label>
              <input
                required
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
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
            {saving ? "Saving..." : "Save Image"}
          </button>
        </form>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === "ALL" ? "bg-orange-600 text-white" : "bg-white text-orange-700 border border-orange-200"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === c ? "bg-orange-600 text-white" : "bg-white text-orange-700 border border-orange-200"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-orange-700">No images found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
              <div className="aspect-video bg-orange-100">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-medium text-orange-950">{item.title}</p>
                <p className="text-xs text-orange-600 mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
