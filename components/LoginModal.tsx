"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { X, Mail, KeyRound, Loader2 } from "lucide-react";

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { refreshUser } = useAuth();

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setMessage("OTP आपके ईमेल पर भेज दिया गया है।");
        if (data.previewOtp) {
          // For preview environments where email sending is mocked
          setMessage(`OTP आपके ईमेल पर भेज दिया गया है। (Preview OTP: ${data.previewOtp})`);
        }
      } else {
        setError(data.error || "कुछ त्रुटि हुई।");
      }
    } catch (e) {
      setError("कुछ त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        onClose();
        // Reset state
        setTimeout(() => {
          setStep("email");
          setEmail("");
          setOtp("");
          setMessage("");
        }, 500);
      } else {
        setError(data.error || "अमान्य OTP");
      }
    } catch (e) {
      setError("कुछ त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-orange-900/50 hover:text-orange-900 bg-orange-50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-950 mb-2">
              लॉगिन / पंजीकरण
            </h2>
            <p className="text-orange-900/70 text-sm">
              मंदिर की सेवाओं के लिए अपने खाते में प्रवेश करें।
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center">
              {message}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">ईमेल (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-orange-950"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "OTP प्राप्त करें"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">OTP दर्ज करें</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-orange-950 text-center tracking-[0.5em] font-bold text-lg"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "सत्यापित करें (Verify)"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep("email")}
                className="w-full py-2 text-orange-600 hover:text-red-700 font-medium text-sm transition-colors"
              >
                ईमेल बदलें
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
