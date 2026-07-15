import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorDetails,
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";
    const bodyText = razorpay_order_id + "|" + razorpay_payment_id;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(bodyText));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const db = getDb();
      if (!db.donations) {
        db.donations = new Map();
      }
      
      let userId = null;
      const token = req.cookies.get("auth_token")?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId;
        }
      }

      const donationId = Math.random().toString(36).substring(7);
      db.donations.set(donationId, {
        id: donationId,
        userId: userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: donorDetails.amount,
        donor: donorDetails,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
