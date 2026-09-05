"use client"
import * as React from "react"
import { motion } from "motion/react"
import Link from "next/link"

import Image from "next/image"

export function Hero() {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* Background with a generic temple-like pattern or gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-red-50 mix-blend-multiply" />
        <Image
          src="https://picsum.photos/seed/temple/1920/1080"
          alt="Temple Background"
          fill
          className="object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-orange-600 mr-2 animate-pulse"></span>
            जय माता दी
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-orange-950 tracking-tight leading-tight">
            क्लीं काली
          </h1>
          
          <p className="text-lg md:text-2xl text-orange-900/80 max-w-2xl mx-auto font-medium">
            आध्यात्मिक शांति, पूजा-पाठ और माता की परम कृपा का पावन स्थल।
          </p>

          <p className="text-base md:text-lg text-orange-800/70 mt-2">
            मुख्य पुजारी: आचार्य पंडित धीरेंद्र त्रिपाठी
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-4">
            <Link
              href="#timings"
              className="px-8 py-4 bg-red-700 text-white rounded-full font-semibold text-lg hover:bg-red-800 transition-all shadow-lg hover:shadow-red-700/30 w-full sm:w-auto"
            >
              आरती का समय
            </Link>
            <Link
              href="#services"
              className="px-8 py-4 bg-white text-orange-700 border-2 border-orange-200 rounded-full font-semibold text-lg hover:bg-orange-50 transition-all w-full sm:w-auto"
            >
              पूजा व परामर्श
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom waves or element */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
