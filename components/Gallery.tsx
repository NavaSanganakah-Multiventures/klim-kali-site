"use client"
import * as React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Loader2 } from "lucide-react"

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url: string;
}

export function Gallery() {
  const [activeTab, setActiveTab] = React.useState("सभी");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const albums = ["सभी", ...categories];

  const filteredImages = images.filter((img) =>
    activeTab === "सभी" || img.category === activeTab || (activeTab === "दैनिक दर्शन" && img.category.includes("दैनिक"))
  );

  return (
    <section id="gallery" className="py-24 bg-orange-950 text-white min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">पवित्र गैलरी (Photo Gallery)</h2>
          <div className="w-24 h-1 bg-red-500 mx-auto rounded-full mb-6" />
          <p className="text-orange-200 text-lg max-w-2xl mx-auto">
            काली माता के नित्य नए श्रृंगार, मंदिर परिसर और उत्सवों की मनमोहक झलकियाँ।
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-orange-200/50 py-12">गैलरी में अभी कोई चित्र उपलब्ध नहीं है।</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12"
            >
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveTab(album)}
                  className={`px-4 md:px-6 py-2 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
                    activeTab === album
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "bg-orange-900/50 text-orange-200 hover:bg-orange-800"
                  }`}
                  suppressHydrationWarning
                >
                  {album}
                </button>
              ))}
            </motion.div>

            <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-2xl group break-inside-avoid shadow-xl shadow-black/20"
                  >
                    <div className="aspect-auto">
                      <img
                        src={image.image_url}
                        alt={image.title}
                        loading="lazy"
                        className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <span className="text-red-400 font-medium text-sm mb-1">{image.category}</span>
                      <p className="font-bold text-lg">{image.title}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredImages.length === 0 && (
              <div className="text-center py-12 text-orange-200/50">
                इस एल्बम में अभी कोई चित्र उपलब्ध नहीं है।
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
