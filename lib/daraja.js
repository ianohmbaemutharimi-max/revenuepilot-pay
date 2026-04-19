import axios from "axios";

// Stores token temporarily in memory
let cachedToken = null;

/**
 * 🧠 STEP 1: Get access token from Safaricom (Daraja login)
 */
export async function getAccessToken() {
  const now = Date.now();

  // If token exists and not expired → reuse it
  if (cachedToken && cachedToken.expires > now) {
    return cachedToken.token;
  }

  // Encode consumer key + secret (your Daraja credentials)
  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  // Request new token from Daraja
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  // Extract token
  const token = res.data.access_token;

  // Cache it for 50 minutes
  cachedToken = {
    token,
    expires: now + 50 * 60 * 1000,
  };

  return token;
}
