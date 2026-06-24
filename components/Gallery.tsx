"use client"
import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"

export function Gallery() {
  const [activeTab, setActiveTab] = React.useState("सभी");

  const albums = ["सभी", "दैनिक दर्शन", "उत्सव शृंगार", "मंदिर परिसर"];

  const galleryImages = [
    { id: 1, src: "https://picsum.photos/seed/shringar12/600/800", category: "दैनिक दर्शन", title: "प्रातः काल श्रृंगार" },
    { id: 2, src: "https://picsum.photos/seed/festival1/800/600", category: "उत्सव शृंगार", title: "नवरात्र विशेष" },
    { id: 3, src: "https://picsum.photos/seed/temple1/600/600", category: "मंदिर परिसर", title: "मुख्य द्वार" },
    { id: 4, src: "https://picsum.photos/seed/shringar15/600/800", category: "दैनिक दर्शन", title: "संध्या दर्शन" },
    { id: 5, src: "https://picsum.photos/seed/festival2/800/800", category: "उत्सव शृंगार", title: "दीपावली सजावट" },
    { id: 6, src: "https://picsum.photos/seed/temple2/800/600", category: "मंदिर परिसर", title: "यज्ञशाला" },
    { id: 7, src: "https://picsum.photos/seed/shringar18/600/600", category: "दैनिक दर्शन", title: "मध्याह्न दर्शन" },
    { id: 8, src: "https://picsum.photos/seed/shringar19/600/800", category: "दैनिक दर्शन", title: "पुष्प श्रृंगार" },
  ];

  // Fix typo in data if any, and filter
  const filteredImages = galleryImages.filter(img => 
    activeTab === "सभी" || img.category === activeTab || (activeTab === "दैनिक दर्शन" && img.category.includes("दैनिक")) // fuzzy match for safety
  );

  return (
    <section id="gallery" className="py-24 bg-orange-950 text-white min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">पवित्र गैलरी (Photo Gallery)</h2>
          <div className="w-24 h-1 bg-red-500 mx-auto rounded-full mb-6" />
          <p className="text-orange-200 text-lg max-w-2xl mx-auto">
            काली माता के नित्य नए श्रृंगार, मंदिर परिसर और उत्सवों की मनमोहक झलकियाँ।
          </p>
        </div>

        {/* Albums/Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {albums.map((album) => (
            <button
              key={album}
              onClick={() => setActiveTab(album)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeTab === album 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30" 
                  : "bg-orange-900/50 text-orange-200 hover:bg-orange-800"
              }`}
              suppressHydrationWarning
            >
              {album}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
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
                  <Image
                    src={image.src}
                    alt={image.title}
                    width={800}
                    height={800}
                    className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
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
      </div>
    </section>
  )
}
