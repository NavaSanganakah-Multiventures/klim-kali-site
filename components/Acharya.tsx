"use client";

import React from "react";
import { Phone, Mail, MessageSquare, Instagram, Facebook, Youtube } from "lucide-react";
import Image from "next/image";

export function Acharya() {
  return (
    <section id="acharya" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 w-full max-w-md relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border-4 border-orange-100">
              <Image 
                src="https://picsum.photos/seed/acharya/800/1000" 
                alt="Acharya Pandit Dheerendra Tripathi"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-100 rounded-full -z-10 blur-2xl opacity-60"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-red-50 rounded-full -z-10 blur-2xl opacity-60"></div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-950 mb-4">आचार्य पंडित धीरेंद्र त्रिपाठी</h2>
            <div className="w-24 h-1 bg-red-600 rounded-full mb-6" />
            
            <p className="text-orange-900/80 text-lg mb-6 leading-relaxed">
              आचार्य पंडित धीरेंद्र त्रिपाठी जी एक अनुभवी और विद्वान ज्योतिषाचार्य व कर्मकांडी ब्राह्मण हैं। वे वर्षों से वैदिक ज्योतिष, वास्तु शास्त्र, और विभिन्न धार्मिक अनुष्ठानों में मार्गदर्शन प्रदान कर रहे हैं। 
            </p>
            <p className="text-orange-900/80 text-lg mb-8 leading-relaxed">
              यदि आप जीवन की किसी भी समस्या, विवाह, कुंडली मिलान, गृह प्रवेश, वास्तु दोष निवारण या किसी अन्य धार्मिक अनुष्ठान के लिए व्यक्तिगत सलाह या परामर्श (Consulting) लेना चाहते हैं, तो आप सीधे संपर्क कर सकते हैं।
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <a href="tel:+919669509952" className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="p-2 bg-white rounded-lg text-orange-600 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-900/60">कॉल करें</div>
                  <div className="font-bold text-orange-950">+91 96695 09952</div>
                </div>
              </a>
              
              <a href="https://wa.me/919669509952" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-900/60">WhatsApp / SMS</div>
                  <div className="font-bold text-orange-950">+91 96695 09952</div>
                </div>
              </a>

              <a href="mailto:Info@acharypdt.com" className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors sm:col-span-2">
                <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-900/60">ईमेल (Email)</div>
                  <div className="font-bold text-orange-950">Info@acharypdt.com</div>
                </div>
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-orange-950 mb-3">सोशल मीडिया पर जुड़ें (@acharypdt)</h3>
              <div className="flex gap-4">
                <a href="https://instagram.com/acharypdt" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com/acharypdt" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@acharypdt" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
