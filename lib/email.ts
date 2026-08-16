// Cloudflare Email Sending Service Helper
export async function sendEmailOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Cloudflare Email] Sending OTP ${otp} to ${email}`);

  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error("[Email] Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/email/routing/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          { to: [{ email: email }] }
        ],
        from: {
          email: "om@klimkali.in",
          name: "Klim Kali"
        },
        subject: "काली माता मंदिर - आपका लॉगिन OTP",
        content: [
          {
            type: "text/plain",
            value: `काली माता मंदिर में आपका स्वागत है!\n\nआपका लॉगिन OTP है: ${otp}\nयह 10 मिनट के लिए मान्य है।`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare email error:", errorText);
      return { success: false, error: "Failed to send email via Cloudflare" };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Failed to send Cloudflare email:", e);
    return { success: false, error: e.message || "Email send failed" };
  }
}
