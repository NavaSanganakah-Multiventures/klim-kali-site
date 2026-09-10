"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Eye, EyeOff } from "lucide-react";

const paymentModes = ["CASH", "ONLINE", "UPI", "CHEQUE", "OTHER"];

export default function AdminDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    purpose: "General Donation",
    phone: "",
    payment_mode: "CASH",
    notes: "",
    display_on_site: false,
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDonations = () => {
    setLoading(true);
    fetch("/api/admin/donations")
      .then((r) => r.json())
      .then((data) => {
        setDonations(data.donations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          display_on_site: form.display_on_site ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage({ type: "success", text: "Donation saved successfully" });
      setForm({
        name: "",
        amount: "",
        purpose: "General Donation",
        phone: "",
        payment_mode: "CASH",
        notes: "",
        display_on_site: false,
      });
      fetchDonations();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleDisplay = async (id: string, current: number) => {
    try {
      const res = await fetch("/api/admin/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, display_on_site: current ? 0 : 1 }),
      });
      if (res.ok) fetchDonations();
    } catch (error) {
      console.error("Toggle failed", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-orange-950">Donations</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Hide Form" : "Add Manual Donation"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow border border-orange-100 mb-8">
          <h2 className="text-lg font-semibold text-orange-950 mb-4">Add Manual Donation</h2>
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Donor Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Amount (₹)</label>
              <input
                required
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Purpose</label>
              <input
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-900 mb-1">Payment Mode</label>
              <select
                value={form.payment_mode}
                onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {paymentModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="display"
                type="checkbox"
                checked={form.display_on_site}
                onChange={(e) => setForm({ ...form, display_on_site: e.target.checked })}
                className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
              />
              <label htmlFor="display" className="text-sm font-medium text-orange-900">Show on website</label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-orange-900 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={2}
            />
          </div>
          <button
            disabled={saving}
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Donation"}
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
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-100 text-orange-900">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Payment Mode</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-orange-50/50">
                    <td className="px-6 py-4">{d.name}</td>
                    <td className="px-6 py-4 font-semibold">₹{d.amount}</td>
                    <td className="px-6 py-4">{d.purpose}</td>
                    <td className="px-6 py-4">{d.payment_mode}</td>
                    <td className="px-6 py-4">{d.userEmail || d.user_id}</td>
                    <td className="px-6 py-4">{new Date(d.created_at || d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDisplay(d.id, d.display_on_site)}
                        className={`p-2 rounded-lg transition-colors ${d.display_on_site ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        title={d.display_on_site ? "Shown on website" : "Hidden"}
                      >
                        {d.display_on_site ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
