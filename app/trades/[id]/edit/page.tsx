"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditTradePage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;

  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  async function getTrade() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .single();

    if (error) {
      console.error(error);
      alert("Trade not found");
      return;
    }

    setSymbol(data.symbol || "");
    setSide(data.side || "BUY");
    setEntryPrice(data.entry_price?.toString() || "");
    setExitPrice(data.exit_price?.toString() || "");
    setQuantity(data.quantity?.toString() || "");
    setNotes(data.notes || "");
  }

  async function updateTrade(e: React.FormEvent) {
    e.preventDefault();

    const pnl =
      (Number(exitPrice) - Number(entryPrice)) *
      Number(quantity) *
      (side === "BUY" ? 1 : -1);

    const { error } = await supabase
      .from("trades")
      .update({
        symbol,
        side,
        entry_price: Number(entryPrice),
        exit_price: Number(exitPrice),
        quantity: Number(quantity),
        notes,
        pnl,
      })
      .eq("id", tradeId);

    if (error) {
      console.error(error);
      alert("Failed to update trade");
      return;
    }

    router.push(`/trades/${tradeId}`);
  }

  useEffect(() => {
    if (tradeId) getTrade();
  }, [tradeId]);

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Edit Trade</h1>

      <form onSubmit={updateTrade} className="space-y-4">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol"
          className="w-full border p-3 rounded"
          required
        />

        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="w-full border p-3 rounded"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>

        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          placeholder="Entry Price"
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="number"
          value={exitPrice}
          onChange={(e) => setExitPrice(e.target.value)}
          placeholder="Exit Price"
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Trade Notes"
          rows={5}
          className="w-full border p-3 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-3 rounded"
        >
          Update Trade
        </button>
      </form>
    </div>
  );
}