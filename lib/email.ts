// Cloudflare Email Sending Service Helper
export async function sendEmailOTP(email: string, otp: string) {
  console.log(`[Cloudflare Email] Sending OTP ${otp} to ${email}`);
  
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/email/routing/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email }]
            }
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
        throw new Error("Failed to send email via Cloudflare");
      }
      
      return true;
    } catch (e) {
      console.error("Failed to send Cloudflare email:", e);
      // Fallback for local testing or continue
    }
  }

  // Fallback for local environment / if tokens are not set
  console.log("[Local Mode] OTP generated but not sent as Cloudflare tokens are missing in environment.");
  return true;
}
