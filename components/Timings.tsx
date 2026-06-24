"use client"
import * as React from "react"
import { motion } from "motion/react"
import { Sun, Moon, Bell, Calendar as CalendarIcon, Clock, Info, MapPin } from "lucide-react"

export function Timings() {
  const dailyTimings = [
    {
      title: "प्रातः काल पूजा और आरती",
      time: "सुबह 06:00 बजे",
      icon: <Sun className="w-8 h-8 text-orange-500" />,
      desc: "माता का मंगल श्रृंगार और प्रथम दर्शन"
    },
    {
      title: "संध्या आरती",
      time: "शाम 07:30 बजे",
      icon: <Moon className="w-8 h-8 text-blue-500" />,
      desc: "संध्या काल की विशेष महाआरती"
    },
    {
      title: "मंदिर खुलने का समय",
      time: "प्रातः 05:00 से रात्रि 09:00",
      icon: <Bell className="w-8 h-8 text-yellow-500" />,
      desc: "भक्तों के दर्शन हेतु कपाट खुले रहेंगे"
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "विशेष नवरात्र घटस्थापना एवं पूजन",
      date: "१५ अक्टूबर २०२६",
      time: "प्रातः ०६:१५ बजे",
      description: "शारदीय नवरात्रि के पावन अवसर पर माता का प्रथम दर्शन, घटस्थापना और नौ दिन का विशेष अनुष्ठान।"
    },
    {
      id: 2,
      title: "महानवमी विशाल हवन",
      date: "२३ अक्टूबर २०२६",
      time: "प्रातः ०९:०० से १२:०० बजे",
      description: "पूर्ण आहुति एवं विशाल हवन कार्यक्रम आचार्य पंडित धीरेंद्र त्रिपाठी जी के सानिध्य में।"
    },
    {
      id: 3,
      title: "दीपावली महाआरती व दीपदान",
      date: "१२ नवंबर २०२६",
      time: "रात्रि ०८:३० बजे",
      description: "दीपावली के शुभ अवसर पर मंदिर परिसर में सहस्र दीपदान और माता की विशेष महाआरती।"
    }
  ]

  return (
    <section id="timings" className="py-24 bg-orange-50/50">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Daily Timings Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-orange-950 mb-4">दर्शन और आरती का समय</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6" />
          <p className="text-orange-900/70 text-lg max-w-2xl mx-auto">
            माता के दरबार में उपस्थित होकर अपना जीवन धन्य बनाएं।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {dailyTimings.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-100/50 text-center hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {t.icon}
              </div>
              <h3 className="text-xl font-bold text-orange-950 mb-2">{t.title}</h3>
              <p className="text-red-700 font-bold text-2xl mb-4">{t.time}</p>
              <p className="text-orange-800/70">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Special Events Calendar Section */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-orange-950">आगामी विशेष आयोजन</h2>
              <p className="text-orange-800/70 font-medium">मंदिर में होने वाले विशेष पूजा-पाठ एवं अनुष्ठान (Events Calendar)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl border-2 border-orange-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md mb-4">
                    विशेष पूजा
                  </span>
                  <h3 className="text-xl font-bold text-orange-950 mb-4 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-orange-800/80 text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center text-orange-800/80 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-orange-500" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                  
                  <p className="text-orange-900/60 text-sm leading-relaxed border-t border-orange-50 pt-4">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
