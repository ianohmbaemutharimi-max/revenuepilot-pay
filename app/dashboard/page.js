"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [data, setData] = useState([]);

  async function load() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    setData(data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>📊 Transactions</h1>

      {data.map((tx) => (
        <div key={tx.id}>
          {tx.phone} — {tx.amount} — {tx.status}
        </div>
      ))}
    </div>
  );
}
