import { supabase } from "../../lib/supabase";
import { stkPush } from "../../lib/stk";

/**
 * 🧠 PAYMENT ORCHESTRATOR (CORE ENGINE)
 * - This is your fintech gateway entry point
 */

export default async function handler(req, res) {
  const { phone, amount, business_id } = req.body;

  // 🟢 STEP 1 — CREATE TRANSACTION
  const { data: transaction, error } = await supabase
    .from("stk_transactions")
    .insert({
      phone,
      amount,
      business_id,
      status: "CREATED",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }

  // 🟡 STEP 2 — CALL DARAJA STK PUSH
  const darajaResponse = await stkPush(
    phone,
    amount,
    transaction.id
  );

  // 🔴 STEP 3 — CRITICAL FIX (THIS WAS YOUR BUG)
  // We now store Daraja response immediately
  await supabase
    .from("stk_transactions")
    .update({
      checkout_request_id: darajaResponse.CheckoutRequestID,
      merchant_request_id: darajaResponse.MerchantRequestID,
      status: "PENDING",
    })
    .eq("id", transaction.id);

  // 🟣 STEP 4 — ADD TO QUEUE
  await supabase.from("stk_queue").insert({
    payment_request_id: transaction.id,
    business_id,
    status: "PENDING",
  });

  // 🟢 STEP 5 — RESPONSE TO FRONTEND
  return res.json({
    success: true,
    message: "STK Push initiated",
    checkout_request_id: darajaResponse.CheckoutRequestID,
  });
}
