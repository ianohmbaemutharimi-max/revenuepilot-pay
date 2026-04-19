import { supabase } from "@/lib/supabase";
import { stkPush } from "@/lib/stk";

/**
 * 🧠 STEP 3: Main payment entry point
 */
export default async function handler(req, res) {
  const { phone, amount, business_id } = req.body;

  // STEP 3.1 — Create transaction first
  const { data: tx, error } = await supabase
    .from("stk_transactions")
    .insert({
      phone,
      amount,
      business_id,
      status: "CREATED", // means not sent yet
    })
    .select()
    .single();

  if (error) return res.status(500).json(error);

  // STEP 3.2 — Call Daraja STK push
  const darajaRes = await stkPush(phone, amount, tx.id);

  // STEP 3.3 — 🔥 CRITICAL STEP (YOUR BUG FIXED HERE)
  await supabase
    .from("stk_transactions")
    .update({
      checkout_request_id: darajaRes.CheckoutRequestID,
      merchant_request_id: darajaRes.MerchantRequestID,
      status: "PENDING",
    })
    .eq("id", tx.id);

  // STEP 3.4 — Add to queue (worker will handle follow-up)
  await supabase.from("stk_queue").insert({
    payment_request_id: tx.id,
    business_id,
    status: "PENDING",
  });

  // STEP 3.5 — Return response to frontend
  return res.json({
    success: true,
    checkout_request_id: darajaRes.CheckoutRequestID,
  });
}
