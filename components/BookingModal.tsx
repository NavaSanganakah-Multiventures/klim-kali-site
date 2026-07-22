"use client";

import React, { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, User, Phone, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const bookingSchema = z.object({
  serviceType: z.string().min(1, "सेवा का प्रकार चुनें"),
  date: z.string().min(1, "दिनांक चुनें"),
  time: z.string().min(1, "समय चुनें"),
  name: z.string().min(2, "अपना पूरा नाम दर्ज करें"),
  phone: z.string().min(10, "वैध मोबाइल नंबर दर्ज करें"),
  message: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingModal({ isOpen, onClose, selectedService = "व्यक्तिगत पूजा" }: { isOpen: boolean; onClose: () => void; selectedService?: string }) {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: selectedService,
      date: "",
      time: "",
      name: "",
      phone: "",
      message: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      setApiError("बुकिंग करने के लिए कृपया लॉगिन करें। (Please login to book)");
      return;
    }

    setApiError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setApiError(resData.error || "कुछ त्रुटि हुई।");
      }
    } catch (e) {
      setApiError("कुछ त्रुटि हुई।");
    }
  };

  const handleClose = () => {
    setSuccess(false);
    reset({ serviceType: selectedService, date: "", time: "", name: "", phone: "", message: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-orange-900/50 hover:text-orange-900 bg-orange-50 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-950 mb-2">
              पूजा व परामर्श बुकिंग
            </h2>
            <p className="text-orange-900/70 text-sm">
              आचार्य जी से पूजा व परामर्श के लिए अपना समय आरक्षित करें।
            </p>
          </div>

          {!user && (
            <div className="mb-6 p-4 bg-orange-50 text-orange-800 rounded-xl border border-orange-200 text-center text-sm font-medium">
              बुकिंग करने के लिए आपको पहले लॉगिन करना होगा। कृपया मेनू से लॉगिन करें।
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
              {apiError}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-orange-950 mb-4">बुकिंग सफल रही!</h3>
              <p className="text-orange-900/70 mb-8 leading-relaxed">
                आपकी बुकिंग का अनुरोध प्राप्त हो गया है। मंदिर समिति जल्द ही आपसे संपर्क करेगी। माता काली आप पर कृपा बनाए रखें।
              </p>
              <button 
                onClick={handleClose}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition"
              >
                बंद करें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">सेवा का प्रकार</label>
                <select 
                  {...register("serviceType")}
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                >
                  <option value="व्यक्तिगत पूजा">व्यक्तिगत पूजा (नवग्रह शांति, गृह प्रवेश आदि)</option>
                  <option value="परामर्श व ज्योतिष">परामर्श व ज्योतिष (जन्म कुंडली, वास्तु)</option>
                  <option value="विशेष अनुष्ठान">विशेष अनुष्ठान</option>
                </select>
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-950 mb-1.5">दिनांक (Date)</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                    <input 
                      type="date" 
                      {...register("date")}
                      className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                    />
                  </div>
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-950 mb-1.5">समय (Time)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                    <input 
                      type="time" 
                      {...register("time")}
                      className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                    />
                  </div>
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">आपका नाम (Name)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input 
                    type="text" 
                    {...register("name")}
                    className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                    placeholder="पूरा नाम"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">मोबाइल नंबर (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input 
                    type="tel" 
                    {...register("phone")}
                    className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                    placeholder="+91"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">संदेश / विशेष जानकारी (Message)</label>
                <textarea 
                  {...register("message")}
                  rows={3}
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950 resize-none"
                  placeholder="पूजा या परामर्श से संबंधित कोई विशेष बात..."
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !user}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-6"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "बुकिंग सुनिश्चित करें (Book Now)"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
