"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  async function handlePay() {
    const { error } = await supabase.from("transactions").insert([
      {
        phone,
        amount,
        status: "PENDING",
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert("Payment request created");
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>💰 Payment Test</h1>

      <input
        placeholder="Phone"
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      <br /><br />

      <button onClick={handlePay}>Pay</button>
    </div>
  );
}
