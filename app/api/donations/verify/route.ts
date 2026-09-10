import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorDetails,
      campaignId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !donorDetails) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Mock mode allows missing signature
    const isMock = razorpay_signature === "mock_signature";
    if (!isMock && !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

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

    let isAuthentic = true;
    if (!isMock) {
      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (!isAuthentic) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    let db;
    try {
      db = getCloudflareContext().env.DB;
    } catch (e) {
      // local fallback
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
    const selectedCampaignId = campaignId || donorDetails?.campaignId || null;

    if (db) {
      await db.prepare(
        "INSERT INTO donations (id, user_id, amount, name, purpose, status, payment_mode) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        donationId,
        userId || donorDetails.email || "anonymous",
        donorDetails.amount,
        donorDetails.name,
        donorDetails.purpose || "Donation",
        "SUCCESS",
        "ONLINE",
        selectedCampaignId
      ).run();
      if (selectedCampaignId) {
        await db.prepare("UPDATE donation_campaigns SET raised_amount = raised_amount + ? WHERE id = ?").bind(donorDetails.amount, selectedCampaignId).run();
      }
    } else {
        "SUCCESS",
        "ONLINE"
      ).run();
    } else {
      const fallbackDb = getDb();
      fallbackDb.donations.set(donationId, {
        id: donationId,
        userId: userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: donorDetails.amount,
        name: donorDetails.name,
        purpose: donorDetails.purpose || "Donation",
        campaignId: selectedCampaignId,
        status: "SUCCESS",
        payment_mode: "ONLINE",
        createdAt: new Date().toISOString(),
      });
      if (selectedCampaignId) {
        const campaign = fallbackDb.donationCampaigns.get(selectedCampaignId);
        if (campaign) {
          campaign.raised_amount = (campaign.raised_amount || 0) + donorDetails.amount;
        }
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
