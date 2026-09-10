"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Loader2 } from "lucide-react";

export function FeaturedDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations/featured")
      .then((r) => r.json())
      .then((data) => {
        setDonations(data.donations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="featured-donations" className="py-16 md:py-24 bg-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-950 mb-4">सहयोगी भक्त</h2>
          <p className="text-orange-700 max-w-2xl mx-auto">
            आभारी हैं उन सभी भक्तों का जिन्होंने काली माता मंदिर के लिए अपना अमूल्य योगदान दिया।
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-center text-orange-700">अभी कोई donation website पर display नहीं किया गया।</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow border border-orange-100 flex items-start gap-4"
              >
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600 shrink-0">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-950">{d.name}</p>
                  <p className="text-orange-700 text-sm mt-1">{d.purpose}</p>
                  <p className="text-2xl font-bold text-orange-600 mt-3">₹{d.amount}</p>
                  <p className="text-xs text-orange-400 mt-2">
                    {new Date(d.created_at || d.createdAt).toLocaleDateString("hi-IN")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
