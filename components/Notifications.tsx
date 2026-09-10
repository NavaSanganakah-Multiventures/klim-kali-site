"use client"
import * as React from "react"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { BookOpen, Share2, CalendarDays, BellRing, Loader2 } from "lucide-react"

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: number;
  created_at: string;
}

export function Notifications() {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.announcements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href.split('#')[0] + '#blog',
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`${title} - ${window.location.href.split('#')[0]}#blog`);
      alert("पोस्ट का लिंक कॉपी कर लिया गया है!");
    }
  };

  return (
    <section id="blog" className="py-24 bg-orange-50 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-orange-600 font-bold tracking-wide uppercase text-sm">ब्लॉग व सूचनाएं</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-orange-950">आध्यात्मिक विचार और ताज़ा खबरें</h2>
          </div>
          <p className="text-orange-900/70 max-w-md md:text-right">
            मंदिर से जुड़ी महत्वपूर्ण घोषणाएँ, सूचनाएँ, और आचार्य जी के विचार यहां पढ़ें और अन्य भक्तों के साथ साझा करें।
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-orange-700 py-12">अभी कोई सूचना उपलब्ध नहीं है।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => {
              const isImportant = post.priority > 0;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-2xl overflow-hidden border ${isImportant ? 'border-red-200' : 'border-orange-100'} shadow-lg shadow-orange-900/5 flex flex-col h-full`}
                >
                  {isImportant && (
                    <div className="bg-red-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2">
                      <BellRing className="w-3 h-3 animate-pulse" /> महत्वपूर्ण सूचना
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isImportant ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                        {isImportant ? 'सूचना' : 'अध्यात्म'}
                      </span>
                      <div className="flex items-center text-orange-900/50 text-sm font-medium">
                        <CalendarDays className="w-4 h-4 mr-1.5" />
                        {new Date(post.created_at).toLocaleDateString("hi-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-orange-950 mb-3 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-orange-900/70 leading-relaxed mb-6 flex-grow">
                      {post.message}
                    </p>

                    <div className="border-t border-orange-50 pt-4 flex items-center justify-end mt-auto">
                      <button
                        onClick={() => handleShare(post.title, post.message)}
                        className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                        title="साझा करें (Share)"
                        suppressHydrationWarning
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  )
}
