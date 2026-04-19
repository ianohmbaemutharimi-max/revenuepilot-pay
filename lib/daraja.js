import axios from "axios";

/**
 * 🧠 DARAJA TOKEN MANAGER
 * - Handles authentication with Safaricom API
 * - Caches token to avoid repeated requests
 */

let cachedToken = null;

export async function getAccessToken() {
  const now = Date.now();

  // ✅ reuse token if still valid
  if (cachedToken && cachedToken.expires > now) {
    return cachedToken.token;
  }

  // 🔐 encode consumer key + secret
  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`
  ).toString("base64");

  // 🌐 request new token
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const token = response.data.access_token;

  // 💾 cache token for 50 minutes
  cachedToken = {
    token,
    expires: now + 50 * 60 * 1000,
  };

  return token;
}
