"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewTradePage() {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [qty, setQty] = useState("");
  const [strategy, setStrategy] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function saveTrade(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    let imageUrl = "";

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("trade-screenshots")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const pnl =
      (Number(exit) - Number(entry)) *
      Number(qty) *
      (side === "BUY" ? 1 : -1);

    const { error } = await supabase.from("trades").insert({
      user_id: user.id,
      symbol,
      side,
      entry_price: Number(entry),
      exit_price: Number(exit),
      quantity: Number(qty),
      pnl,
      strategy,
      tag,
      notes,
      image_url: imageUrl,
      trade_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Trade Saved");
    window.location.href = "/trades";
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Add Trade</h1>

      <form onSubmit={saveTrade} className="space-y-4">
        <input
          placeholder="Symbol"
          className="border p-3 w-full"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
        />

        <select
          className="border p-3 w-full"
          value={side}
          onChange={(e) => setSide(e.target.value)}
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>

        <input
          placeholder="Entry Price"
          type="number"
          className="border p-3 w-full"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          required
        />

        <input
          placeholder="Exit Price"
          type="number"
          className="border p-3 w-full"
          value={exit}
          onChange={(e) => setExit(e.target.value)}
          required
        />

        <input
          placeholder="Quantity"
          type="number"
          className="border p-3 w-full"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          required
        />

        <input
          placeholder="Strategy (Breakout, Scalping...)"
          className="border p-3 w-full"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        />

        <select
          className="border p-3 w-full"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">Select Tag</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="FOMO">FOMO</option>
          <option value="Revenge">Revenge</option>
          <option value="Overtrade">Overtrade</option>
          <option value="News Trade">News Trade</option>
        </select>

        <textarea
          placeholder="Trade Notes"
          className="border p-3 w-full rounded"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded"
        >
          Save Trade
        </button>
      </form>
    </div>
  );
}