"use client"
import * as React from "react"
import { motion } from "motion/react"
import { Flame, CalendarHeart, HandHeart } from "lucide-react"
import { BookingModal } from "./BookingModal"

export function Services() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState("व्यक्तिगत पूजा");

  const services = [
    {
      title: "व्यक्तिगत पूजा (Personal Pooja)",
      icon: <Flame className="w-8 h-8 text-orange-600" />,
      desc: "नवग्रह शांति, गृह प्रवेश, मंगल दोष निवारण एवं अन्य विशेष पूजाएं आचार्य जी द्वारा विधिवत संपन्न कराई जाती हैं।",
      action: "बुकिंग करें"
    },
    {
      title: "परामर्श व ज्योतिष (Consulting)",
      icon: <HandHeart className="w-8 h-8 text-orange-600" />,
      desc: "जन्म कुंडली अध्ययन, वास्तु परामर्श एवं व्यक्तिगत समस्याओं के समाधान हेतु आचार्य जी से मार्गदर्शन प्राप्त करें।",
      action: "परामर्श लें"
    },
    {
      title: "विशेष अनुष्ठान व इवेंट्स",
      icon: <CalendarHeart className="w-8 h-8 text-orange-600" />,
      desc: "नवरात्रि, दीपावली, गुप्त नवरात्रि और अन्य धार्मिक आयोजनों में सम्मिलित हों और माता का आशीर्वाद लें।",
      action: "जानकारी देखें"
    }
  ]

  const handleActionClick = (title: string) => {
    setSelectedService(title);
    setIsModalOpen(true);
  }

  return (
    <>
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative bg blobs */}
        <div className="absolute -right-40 top-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="absolute -left-40 bottom-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-orange-950 mb-4">हमारी सेवाएँ</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6" />
          <p className="text-orange-900/70 text-lg max-w-2xl mx-auto">
            आचार्य पंडित धीरेंद्र त्रिपाठी जी के सानिध्य में वैदिक मंत्रोच्चार के साथ सभी धार्मिक अनुष्ठान संपन्न किए जाते हैं।
          </p>
        </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-white border border-orange-100 p-8 rounded-[2rem] shadow-lg shadow-orange-900/5 hover:shadow-orange-900/10 transition-shadow flex flex-col"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-50 rounded-2xl flex items-center justify-center mb-6">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-bold text-orange-950 mb-4">{s.title}</h3>
                <p className="text-orange-900/70 leading-relaxed mb-8 flex-grow">
                  {s.desc}
                </p>
                <button 
                  onClick={() => handleActionClick(s.title)}
                  className="text-red-700 font-semibold flex items-center hover:text-red-800 transition-colors mt-auto"
                  suppressHydrationWarning
                >
                  {s.action}
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedService={selectedService.split(" (")[0]} // Just pass the Hindi part
      />
    </>
  )
}
