import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_id";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";

    if (keyId === "rzp_test_mock_id") {
      return NextResponse.json({
        success: true,
        orderId: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        keyId,
      });
    }

    const orderOptions = {
      amount: amount * 100, // amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(orderOptions)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Razorpay order creation error:", err);
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    const order = await response.json();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
