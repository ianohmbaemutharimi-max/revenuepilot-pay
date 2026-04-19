export async function POST(req) {
  try {
    const body = await req.json();

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const checkoutRequestID = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    // 1. FIND transaction FIRST
    const { data: tx, error: txFindError } = await supabase
      .from("stk_transactions")
      .select("*")
      .eq("checkout_request_id", checkoutRequestID)
      .single();

    if (txFindError || !tx) {
      console.error("Transaction not found:", txFindError);
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 2. Insert callback
    const { error: cbError } = await supabase
      .from("mpesa_callbacks")
      .insert({
        stk_transaction_id: tx.id,
        callback_data: body,
        result_code: resultCode,
        result_desc: resultDesc,
        processed: false
      });

    if (cbError) {
      console.error("Callback insert failed:", cbError);
    }

    // 3. Update transaction
    const { error: updateError } = await supabase
      .from("stk_transactions")
      .update({
        status: resultCode === 0 ? "SUCCESS" : "FAILED",
        mpesa_receipt:
          callback?.CallbackMetadata?.Item?.find(i => i.Name === "MpesaReceiptNumber")?.Value || null,
        completed_at: new Date().toISOString(),
        callback_processed: true
      })
      .eq("id", tx.id);

    if (updateError) {
      console.error("Transaction update failed:", updateError);
    }

    return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (err) {
    console.error("Callback crash:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
