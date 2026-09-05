"use client"
import * as React from "react"
import { MapPin, Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-orange-950 text-orange-200">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                क
              </div>
              <span className="font-bold text-2xl text-white">क्लीं काली</span>
            </div>
            <p className="text-orange-200/70 leading-relaxed mb-6">
              माता का यह पावन दरबार सभी भक्तों की मनोकामनाएं पूर्ण करता है। श्रद्धा और विश्वास के साथ दर्शन के लिए पधारें।
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6">संपर्क जानकारी</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-red-500 shrink-0" />
                <span>क्लीं काली, गिन्दोरहाट, सुठालिया, राजगढ़, मध्य प्रदेश - 465677</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-red-500 shrink-0" />
                <span>+91 96695 09952 <br/><span className="text-sm text-orange-200/50">(आचार्य पंडित धीरेंद्र त्रिपाठी)</span></span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-red-500 shrink-0" />
                <span>info@klimkali.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6">त्वरित संपर्क (Quick Inquiry)</h3>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()} suppressHydrationWarning>
              <input 
                type="text" 
                placeholder="आपका नाम" 
                className="w-full px-4 py-3 rounded-lg bg-orange-900/50 border border-orange-800 focus:outline-none focus:border-red-500 text-white placeholder-orange-200/50"
                suppressHydrationWarning
              />
              <input 
                type="tel" 
                placeholder="मोबाइल नंबर" 
                className="w-full px-4 py-3 rounded-lg bg-orange-900/50 border border-orange-800 focus:outline-none focus:border-red-500 text-white placeholder-orange-200/50"
                suppressHydrationWarning
              />
              <textarea 
                placeholder="संदेश या पूजा/परामर्श की जानकारी" 
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-orange-900/50 border border-orange-800 focus:outline-none focus:border-red-500 text-white placeholder-orange-200/50 resize-none"
                suppressHydrationWarning
              ></textarea>
              <button 
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                suppressHydrationWarning
              >
                भेजें
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-orange-900 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-orange-200/50 text-sm gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} क्लीं काली. सर्वाधिकार सुरक्षित।</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-orange-900 rounded-full hover:bg-red-600 hover:text-white transition-colors"
            aria-label="Scroll to top"
            suppressHydrationWarning
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
