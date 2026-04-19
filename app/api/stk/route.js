import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 M-Pesa Callback Received:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return Response.json({ message: "Invalid callback payload" }, { status: 400 });
    }

    const checkoutRequestID = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    // Extract metadata safely
    const metadata = callback.CallbackMetadata?.Item || [];

    const getValue = (name) =>
      metadata.find((i) => i.Name === name)?.Value || null;

    const mpesaReceipt = getValue("MpesaReceiptNumber");
    const phone = getValue("PhoneNumber");
    const amount = getValue("Amount");

    // 1. Store callback FIRST (audit log)
    const { data: callbackInsert, error: cbError } = await supabase
      .from("mpesa_callbacks")
      .insert({
        callback_data: body,
        checkout_request_id: checkoutRequestID,
        result_code: resultCode,
        result_desc: resultDesc,
        processed: false
      })
      .select()
      .single();

    if (cbError) {
      console.error("Callback insert error:", cbError);
    }

    // 2. Update STK transaction
    const { error: txError } = await supabase
      .from("stk_transactions")
      .update({
        status: resultCode === 0 ? "SUCCESS" : "FAILED",
        mpesa_receipt: mpesaReceipt,
        completed_at: new Date().toISOString(),
        callback_processed: true
      })
      .eq("checkout_request_id", checkoutRequestID);

    if (txError) {
      console.error("Transaction update error:", txError);
    }

    return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error) {
    console.error("Callback crash:", error);

    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
