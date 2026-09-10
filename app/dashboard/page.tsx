"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, User, CalendarCheck, Heart, Receipt, ArrowLeft, X } from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  name: string;
  purpose: string;
  created_at: string;
  payment_mode: string;
}

interface Booking {
  id: string;
  service_type: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "donations">("profile");
  const [data, setData] = useState<{ user?: any; bookings?: Booking[]; donations?: Donation[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetch("/api/user/dashboard")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
        <p className="text-orange-900 text-lg mb-4">डैशबोर्ड देखने के लिए कृपया लॉगिन करें।</p>
        <Link href="/" className="bg-orange-600 text-white px-6 py-2 rounded-xl font-medium">मुख्य पृष्ठ पर जाएँ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-orange-700 hover:text-orange-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> मुख्य पृष्ठ
        </Link>

        <h1 className="text-3xl font-bold text-orange-950 mb-8">मेरा खाता</h1>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-orange-200">
          {[
            { key: "profile", label: "प्रोफाइल", icon: User },
            { key: "bookings", label: "मेरी बुकिंग्स", icon: CalendarCheck },
            { key: "donations", label: "मेरा दान", icon: Heart },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === t.key ? "text-orange-950 border-b-2 border-red-600" : "text-orange-700 hover:text-orange-900"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-6 shadow border border-orange-100 max-w-md">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <p className="text-sm text-orange-600 font-medium mb-1">नाम</p>
            <p className="text-lg font-semibold text-orange-950 mb-4">{data?.user?.name || "—"}</p>
            <p className="text-sm text-orange-600 font-medium mb-1">ईमेल</p>
            <p className="text-lg font-semibold text-orange-950 mb-4">{data?.user?.email}</p>
            <p className="text-sm text-orange-600 font-medium mb-1">सदस्य तिथि</p>
            <p className="text-orange-950">
              {data?.user?.created_at ? new Date(data.user.created_at).toLocaleDateString("hi-IN") : "—"}
            </p>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
            {data?.bookings && data.bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-left text-sm">
                  <thead className="bg-orange-100 text-orange-900">
                    <tr>
                      <th className="px-4 py-3">सेवा</th>
                      <th className="px-4 py-3">दिनांक</th>
                      <th className="px-4 py-3">समय</th>
                      <th className="px-4 py-3">स्थिति</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {data.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-orange-50/50">
                        <td className="px-4 py-3">{b.service_type}</td>
                        <td className="px-4 py-3">{b.date}</td>
                        <td className="px-4 py-3">{b.time}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            b.status === "CONFIRMED" ? "bg-green-100 text-green-700" : b.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-8 text-orange-700 text-center">अभी कोई बुकिंग नहीं है।</p>
            )}
          </div>
        )}

        {activeTab === "donations" && (
          <div className="bg-white rounded-2xl shadow border border-orange-100 overflow-hidden">
            {data?.donations && data.donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-left text-sm">
                  <thead className="bg-orange-100 text-orange-900">
                    <tr>
                      <th className="px-4 py-3">रसीद</th>
                      <th className="px-4 py-3">राशि</th>
                      <th className="px-4 py-3">उद्देश्य</th>
                      <th className="px-4 py-3">दिनांक</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {data.donations.map((d) => (
                      <tr key={d.id} className="hover:bg-orange-50/50">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedDonation(d)}
                            className="p-2 bg-white rounded-full text-green-600 shadow-sm hover:bg-green-50"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{d.amount}</td>
                        <td className="px-4 py-3">{d.purpose}</td>
                        <td className="px-4 py-3">
                          {new Date(d.created_at).toLocaleDateString("hi-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-8 text-orange-700 text-center">अभी तक कोई दान नहीं।</p>
            )}
          </div>
        )}
      </div>

      {selectedDonation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl printable-receipt">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-4 right-4 p-2 text-orange-900/50 hover:text-orange-900 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-orange-950">दान रसीद</h2>
              <p className="text-orange-700">क्लीं काली मंदिर ट्रस्ट</p>
            </div>
            <div className="space-y-3 text-sm text-orange-900">
              <div className="flex justify-between border-b border-orange-100 py-2"><span>रसीद नंबर</span><span>{selectedDonation.id}</span></div>
              <div className="flex justify-between border-b border-orange-100 py-2"><span>दानकर्ता</span><span>{selectedDonation.name}</span></div>
              <div className="flex justify-between border-b border-orange-100 py-2"><span>राशि</span><span className="font-bold">₹{selectedDonation.amount}</span></div>
              <div className="flex justify-between border-b border-orange-100 py-2"><span>उद्देश्य</span><span>{selectedDonation.purpose}</span></div>
              <div className="flex justify-between border-b border-orange-100 py-2"><span>तिथि</span><span>{new Date(selectedDonation.created_at).toLocaleString("hi-IN")}</span></div>
              <div className="flex justify-between border-b border-orange-100 py-2"><span>भुगतान विधि</span><span>{selectedDonation.payment_mode || "ONLINE"}</span></div>
            </div>
            <p className="text-center text-xs text-orange-600 mt-6">
              माता काली आप पर कृपा बनाए रखें। यह रसीद ऑनलाइन दान के लिए है।
            </p>
            <button
              onClick={() => window.print()}
              className="w-full mt-6 py-2 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition print:hidden"
            >
              प्रिंट करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
