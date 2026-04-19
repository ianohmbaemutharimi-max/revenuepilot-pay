import axios from "axios";
import { getAccessToken } from "./daraja";

/**
 * 🧠 STK PUSH MODULE
 * - Sends payment request to user's phone
 * - Returns Daraja response
 */

export async function stkPush(phone, amount, accountRef) {
  const token = await getAccessToken();

  // ⏱ required timestamp format
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  // 🔐 password required by Safaricom
  const password = Buffer.from(
    process.env.DARAJA_SHORTCODE +
      process.env.DARAJA_PASSKEY +
      timestamp
  ).toString("base64");

  // 📦 payload sent to Daraja
  const payload = {
    BusinessShortCode: process.env.DARAJA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.DARAJA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.DARAJA_CALLBACK_URL,
    AccountReference: accountRef,
    TransactionDesc: "Payment",
  };

  // 🚀 send request
  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
