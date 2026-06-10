"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

export default function ImportPage() {
  const [rows, setRows] = useState<any[]>([]);

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data as any[]);
        alert("CSV loaded successfully");
      },
    });
  }

  async function importTrades() {
    if (rows.length === 0) {
      alert("Please upload CSV first");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    const trades = rows.map((row) => ({
      user_id: user.id,
      symbol: row.symbol || row.Symbol,
      side: row.side || row.Side,
      entry_price: Number(row.entry_price || row.Entry),
      exit_price: Number(row.exit_price || row.Exit),
      quantity: Number(row.quantity || row.Quantity),
      pnl: Number(row.pnl || row.PnL || 0),
      strategy: row.strategy || "",
      tag: row.tag || "",
      notes: row.notes || "",
      trade_date: row.trade_date || new Date().toISOString().split("T")[0],
    }));

    const { error } = await supabase.from("trades").insert(trades);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`${trades.length} trades imported`);
    window.location.href = "/trades";
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Import Trades</h1>

      <input
        type="file"
        accept=".csv"
        className="border p-3 rounded"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <p className="mt-4 text-gray-500">
        CSV rows loaded: {rows.length}
      </p>

      <button
        onClick={importTrades}
        className="mt-4 bg-black text-white px-6 py-3 rounded"
      >
        Import Trades
      </button>
    </div>
  );
}