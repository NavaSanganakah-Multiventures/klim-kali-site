"use client"
import * as React from "react"
import { motion } from "motion/react"
import Image from "next/image"

export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="relative pt-[100%] rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/panditji/800/800" 
                alt="Acharya Pandit Dheerendra Tripathi"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-4 border-orange-100 rounded-3xl m-4 pointer-events-none" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2 space-y-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
              मुख्य पुजारी एवं ज्योतिषाचार्य
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-orange-950">
              आचार्य पंडित <br className="hidden md:block"/>
              <span className="text-red-700">धीरेंद्र त्रिपाठी</span>
            </h2>
            
            <p className="text-lg text-orange-900/80 leading-relaxed font-medium">
              आचार्य जी पिछले कई वर्षों से क्लीं काली के मुख्य पुजारी के रूप में अपनी सेवाएँ दे रहे हैं। वे वैदिक अनुष्ठान, कर्मकांड और ज्योतिष शास्त्र के प्रकांड विद्वान हैं।
            </p>

            <p className="text-orange-900/70 leading-relaxed">
              उनके मार्गदर्शन में मंदिर में अनेकों धार्मिक और आध्यात्मिक कार्यक्रम संपन्न होते हैं। यदि आप अपने जीवन की समस्याओं के लिए व्यक्तिगत परामर्श, जन्म कुंडली अध्ययन या किसी विशेष पूजा का आयोजन करना चाहते हैं, तो आचार्य जी से संपर्क कर सकते हैं।
            </p>

            <div className="pt-6">
              <a 
                href="#contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition shadow-lg hover:shadow-orange-600/30"
              >
                परामर्श हेतु संपर्क करें
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
