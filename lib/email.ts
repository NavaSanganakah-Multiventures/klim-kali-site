import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function sendEmailOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Email] Sending OTP ${otp} to ${email}`);

  // 1. Primary: Cloudflare Send Email Binding (SEB)
  try {
    const { env } = getCloudflareContext();
    if (env.SEB) {
      await env.SEB.send({
        to: email,
        from: "om@klimkali.in",
        subject: "काली माता मंदिर - आपका लॉगिन OTP",
        text: `काली माता मंदिर में आपका स्वागत है!\n\nआपका लॉगिन OTP है: ${otp}\nयह 10 मिनट के लिए मान्य है।`,
      });
      console.log("[Email] Sent via Send Email Binding (SEB)");
      return { success: true };
    }
  } catch (e: any) {
    console.error("[Email] Send Email Binding failed:", e);
    // Fall through to REST API fallback
  }

  // 2. Fallback: Cloudflare Email Routing REST API
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
        personalizations: [{ to: [{ email: email }] }],
        from: { email: "om@klimkali.in", name: "Klim Kali" },
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
      console.error("[Email] REST API error:", errorText);
      return { success: false, error: "Failed to send email via Cloudflare" };
    }

    console.log("[Email] Sent via REST API");
    return { success: true };
  } catch (e: any) {
    console.error("[Email] REST API failed:", e);
    return { success: false, error: e.message || "Email send failed" };
  }
}
