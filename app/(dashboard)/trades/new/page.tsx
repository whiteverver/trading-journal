"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewTradePage() {
  const router = useRouter();

  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [strategy, setStrategy] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");
  const [tradeDate, setTradeDate] = useState("");

  const [risk, setRisk] = useState("");
  const [reward, setReward] = useState("");
  const [emotion, setEmotion] = useState("");
  const [mistake, setMistake] = useState("");
  const [setup, setSetup] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [marketType, setMarketType] = useState("");

  const [loading, setLoading] = useState(false);

  const pnl =
    (Number(exitPrice || 0) - Number(entryPrice || 0)) *
    Number(quantity || 0) *
    (side === "BUY" ? 1 : -1);

  const rrRatio =
    Number(risk) > 0 && Number(reward) > 0
      ? Number(reward) / Number(risk)
      : 0;

  async function saveTrade(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("trades").insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      side,
      entry_price: Number(entryPrice),
      exit_price: Number(exitPrice),
      quantity: Number(quantity),
      pnl,
      strategy,
      tag,
      notes,
      trade_date: tradeDate || new Date().toISOString().split("T")[0],

      risk: Number(risk || 0),
      reward: Number(reward || 0),
      rr_ratio: rrRatio,
      emotion,
      mistake,
      setup,
      timeframe,
      market_type: marketType,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/trades");
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Add New Trade</h1>

      <form
        onSubmit={saveTrade}
        className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <section>
          <h2 className="mb-4 text-xl font-semibold">Trade Details</h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Input
              label="Symbol"
              value={symbol}
              onChange={setSymbol}
              placeholder="BTCUSDT"
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium">Side</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <Input
              label="Trade Date"
              type="date"
              value={tradeDate}
              onChange={setTradeDate}
            />

            <Input
              label="Entry Price"
              type="number"
              value={entryPrice}
              onChange={setEntryPrice}
              required
            />

            <Input
              label="Exit Price"
              type="number"
              value={exitPrice}
              onChange={setExitPrice}
              required
            />

            <Input
              label="Quantity"
              type="number"
              value={quantity}
              onChange={setQuantity}
              required
            />

            <Input
              label="Strategy"
              value={strategy}
              onChange={setStrategy}
              placeholder="Breakout"
            />

            <Input
              label="Tag"
              value={tag}
              onChange={setTag}
              placeholder="Momentum"
            />

            <div>
              <label className="mb-2 block text-sm font-medium">P&L</label>
              <input
                value={pnl.toFixed(2)}
                readOnly
                className="w-full rounded-md border bg-muted px-3 py-2 font-semibold"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Risk & Psychology
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Input
              label="Risk"
              type="number"
              value={risk}
              onChange={setRisk}
              placeholder="100"
            />

            <Input
              label="Reward"
              type="number"
              value={reward}
              onChange={setReward}
              placeholder="250"
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                R:R Ratio
              </label>
              <input
                value={rrRatio.toFixed(2)}
                readOnly
                className="w-full rounded-md border bg-muted px-3 py-2 font-semibold"
              />
            </div>

            <Select
              label="Emotion"
              value={emotion}
              onChange={setEmotion}
              options={[
                "Confident",
                "Fear",
                "FOMO",
                "Greed",
                "Revenge",
                "Calm",
                "Hesitation",
              ]}
            />

            <Select
              label="Mistake"
              value={mistake}
              onChange={setMistake}
              options={[
                "No Mistake",
                "Entered Early",
                "Exited Early",
                "Exited Late",
                "Overtrading",
                "No Stop Loss",
                "Revenge Trade",
                "Ignored Plan",
              ]}
            />

            <Input
              label="Setup"
              value={setup}
              onChange={setSetup}
              placeholder="Opening Range Breakout"
            />

            <Select
              label="Timeframe"
              value={timeframe}
              onChange={setTimeframe}
              options={["1m", "3m", "5m", "15m", "1H", "4H", "1D"]}
            />

            <Select
              label="Market Type"
              value={marketType}
              onChange={setMarketType}
              options={[
                "Crypto",
                "Forex",
                "Stocks",
                "Options",
                "Futures",
                "Index",
              ]}
            />
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened in this trade?"
            className="min-h-32 w-full rounded-md border bg-background px-3 py-2"
          />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Trade"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}