"use client";

import React, { useState } from "react";
import { Heart, Loader2 } from "lucide-react";

export function Donation() {
  const [amount, setAmount] = useState<number | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      setMessage({ type: "error", text: "कृपया मान्य राशि दर्ज करें।" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const resLoad = await loadRazorpay();
    if (!resLoad) {
      setMessage({ type: "error", text: "Razorpay SDK लोड करने में विफल।" });
      setLoading(false);
      return;
    }

    try {
      const orderRes = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Order creation failed");
      }

      if (orderData.keyId === "rzp_test_mock_id") {
        // Mock payment flow since we are using dummy keys
        setTimeout(async () => {
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: "pay_mock_" + Date.now(),
                razorpay_signature: "mock_signature",
                donorDetails: { name, phone, amount },
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setMessage({ type: "success", text: "आपका दान सफलतापूर्वक प्राप्त हो गया है। माता काली आप पर कृपा करें! (Preview Mode)" });
              setAmount("");
              setName("");
              setPhone("");
            } else {
              setMessage({ type: "error", text: "भुगतान सत्यापन विफल रहा।" });
            }
          } catch (err) {
             setMessage({ type: "error", text: "भुगतान सत्यापन के दौरान त्रुटि।" });
          } finally {
             setLoading(false);
          }
        }, 1500);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "काली माता मंदिर",
        description: "मंदिर के लिए दान व सेवा",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                donorDetails: { name, phone, amount },
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setMessage({ type: "success", text: "आपका दान सफलतापूर्वक प्राप्त हो गया है। माता काली आप पर कृपा करें!" });
              setAmount("");
              setName("");
              setPhone("");
            } else {
              setMessage({ type: "error", text: "भुगतान सत्यापन विफल रहा।" });
            }
          } catch (err) {
            setMessage({ type: "error", text: "भुगतान सत्यापन के दौरान त्रुटि।" });
          }
        },
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: "#ea580c",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setMessage({ type: "error", text: "कुछ त्रुटि हुई। कृपया पुनः प्रयास करें।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donation" className="py-24 bg-orange-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-bold text-orange-950 mb-6">सेवा व दान</h2>
            <div className="w-24 h-1 bg-red-600 rounded-full mb-6" />
            <p className="text-orange-900/80 text-lg mb-8 leading-relaxed">
              मंदिर के रखरखाव, दैनिक पूजा-आरती, अन्नदान और अन्य धार्मिक गतिविधियों में अपना योगदान दें। आपका छोटा सा सहयोग भी बड़े पुण्यों का कारण बन सकता है।
            </p>
            <div className="flex gap-4 items-start mb-8">
               <div className="p-3 bg-red-100 rounded-full text-red-600">
                 <Heart className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-orange-950 mb-2">आपका दान कहाँ उपयोग होता है?</h3>
                 <ul className="text-orange-900/70 space-y-2">
                   <li>• मंदिर परिसर का विकास व रखरखाव</li>
                   <li>• दैनिक भोग, शृंगार और दीप दान</li>
                   <li>• त्योहारों पर विशेष आयोजन और भंडारा</li>
                 </ul>
               </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
            <h3 className="text-2xl font-bold text-orange-950 mb-6 text-center">ऑनलाइन दान करें</h3>
            
            {message && (
              <div className={`mb-6 p-4 text-sm rounded-xl border text-center ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">दान राशि (₹)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[101, 501, 1100, 2100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2 text-sm rounded-lg border font-medium transition-colors ${
                        amount === amt 
                          ? "bg-orange-600 border-orange-600 text-white" 
                          : "border-orange-200 text-orange-700 hover:bg-orange-50"
                      }`}
                      suppressHydrationWarning
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                  placeholder="अन्य राशि दर्ज करें"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">आपका नाम</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                  placeholder="पूरा नाम"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-950 mb-1.5">मोबाइल नंबर</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:border-red-500 text-orange-950"
                  placeholder="+91"
                  suppressHydrationWarning
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                suppressHydrationWarning
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "दान करें (Donate via Razorpay)"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
