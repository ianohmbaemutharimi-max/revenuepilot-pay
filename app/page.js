"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [data, setData] = useState([]);

  async function loadData() {
    const { data, error } = await supabase.from("test").select("*");

    if (error) {
      console.error("Error:", error);
      return;
    }

    setData(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🚀 Fintech System Connected</h1>

      <button onClick={loadData} style={{ padding: 10, marginTop: 20 }}>
        Refresh Data
      </button>

      <div style={{ marginTop: 20 }}>
        {data.map((item) => (
          <p key={item.id}>
            {item.id} → {item.name}
          </p>
        ))}
      </div>
    </div>
  );
}
