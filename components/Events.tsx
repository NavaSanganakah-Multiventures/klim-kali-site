"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Loader2 } from "lucide-react";

export function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="events" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-950 mb-4">आगामी कार्यक्रम</h2>
          <p className="text-orange-700 max-w-2xl mx-auto">
            काली माता मंदिर में होने वाले पूजा, अनुष्ठान एवं विशेष कार्यक्रम।
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-orange-700">अभी कोई upcoming event नहीं है।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-orange-50 rounded-2xl overflow-hidden border border-orange-100 shadow-sm flex flex-col md:flex-row"
              >
                {event.image_url && (
                  <div className="md:w-48 h-48 md:h-auto shrink-0 bg-orange-200">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-orange-950 mb-2">{event.title}</h3>
                  <p className="text-orange-800 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-orange-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_date).toLocaleString("hi-IN", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
