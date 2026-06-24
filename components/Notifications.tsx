"use client"
import * as React from "react"
import { motion } from "motion/react"
import { BookOpen, Share2, CalendarDays, User, ArrowRight, BellRing } from "lucide-react"

export function Notifications() {
  const posts = [
    {
      id: 1,
      type: "अध्यात्म",
      title: "नवरात्रि में देवी साधना का महत्व",
      date: "१० अक्टूबर २०२६",
      author: "आचार्य पंडित धीरेंद्र त्रिपाठी",
      content: "नवरात्रि के नौ दिन शारीरिक और मानसिक शुद्धि के लिए अत्यंत लाभकारी माने गए हैं। इन दिनों में माता के विभिन्न स्वरूपों की आराधना करने से विशेष ऊर्जा की प्राप्ति होती है...",
      isImportant: false,
    },
    {
      id: 2,
      type: "सूचना",
      title: "ग्रहण काल में आरती के समय में परिवर्तन",
      date: "२५ अक्टूबर २०२६",
      author: "मंदिर ट्रस्ट",
      content: "सभी भक्तों को सूचित किया जाता है कि आगामी चंद्र ग्रहण के सूतक काल के कारण संध्या आरती का समय शाम ७:३० के बजाय शाम ५:०० बजे कर दिया गया है। ग्रहण पश्चात पुनः शुद्धिकरण होगा।",
      isImportant: true,
    },
    {
      id: 3,
      type: "अध्यात्म",
      title: "काली माता के बीज मंत्र की महिमा",
      date: "०५ नवंबर २०२६",
      author: "आचार्य पंडित धीरेंद्र त्रिपाठी",
      content: "माता काली का बीज मंत्र एक अत्यंत शक्तिशाली मंत्र है। इसके नित्य जाप से भय, रोग और सभी प्रकार के दोषों से मुक्ति प्राप्त होती है। जाप करते समय ध्यान पूर्ण रूप से...",
      isImportant: false,
    }
  ];

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
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
            <h2 className="text-3xl md:text-5xl font-bold text-orange-950">आध्यात्मिक विचार और ताज़ा खबरे</h2>
          </div>
          <p className="text-orange-900/70 max-w-md md:text-right">
            मंदिर से जुड़ी महत्वपूर्ण घोषणाएँ, सूचनाएँ, और आचार्य जी के विचार यहां पढ़ें और अन्य भक्तों के साथ साझा करें।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`bg-white rounded-2xl overflow-hidden border ${post.isImportant ? 'border-red-200' : 'border-orange-100'} shadow-lg shadow-orange-900/5 flex flex-col h-full`}
            >
              {/* Highlight bar for important notifications */}
              {post.isImportant && (
                <div className="bg-red-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2">
                  <BellRing className="w-3 h-3 animate-pulse" /> महत्वपूर्ण सूचना
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${post.type === 'सूचना' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                    {post.type}
                  </span>
                  <div className="flex items-center text-orange-900/50 text-sm font-medium">
                    <CalendarDays className="w-4 h-4 mr-1.5" />
                    {post.date}
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-orange-950 mb-3 leading-snug">
                  {post.title}
                </h3>

                <p className="text-orange-900/70 leading-relaxed mb-6 flex-grow">
                  {post.content}
                </p>

                <div className="border-t border-orange-50 pt-4 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm font-medium text-orange-950">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    {post.author}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShare(post.title, post.content)}
                      className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                      title="साझा करें (Share)"
                      suppressHydrationWarning
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-orange-200 text-orange-700 rounded-xl font-bold hover:bg-orange-50 transition-colors" suppressHydrationWarning>
            सभी पोस्ट देखें <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  )
}
