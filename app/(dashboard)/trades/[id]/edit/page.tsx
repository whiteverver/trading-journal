"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditTradePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  const [marketType, setMarketType] = useState("NSE Equity");
  const [instrument, setInstrument] = useState("Equity");
  const [tradingStyle, setTradingStyle] = useState("Intraday");
  const [broker, setBroker] = useState("Zerodha");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pnl =
    (Number(exitPrice || 0) - Number(entryPrice || 0)) *
    Number(quantity || 0) *
    (side === "BUY" ? 1 : -1);

  const rrRatio =
    Number(risk) > 0 && Number(reward) > 0
      ? Number(reward) / Number(risk)
      : 0;

  useEffect(() => {
    fetchTrade();
  }, []);

  async function fetchTrade() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      alert(error.message);
      router.push("/trades");
      return;
    }

    setSymbol(data.symbol || "");
    setSide(data.side || "BUY");
    setEntryPrice(String(data.entry_price ?? ""));
    setExitPrice(String(data.exit_price ?? ""));
    setQuantity(String(data.quantity ?? ""));
    setStrategy(data.strategy || "");
    setTag(data.tag || "");
    setNotes(data.notes || "");
    setTradeDate(data.trade_date || "");

    setRisk(String(data.risk ?? ""));
    setReward(String(data.reward ?? ""));
    setEmotion(data.emotion || "");
    setMistake(data.mistake || "");
    setSetup(data.setup || "");
    setTimeframe(data.timeframe || "");

    setMarketType(data.market_type || "NSE Equity");
    setInstrument(data.instrument || "Equity");
    setTradingStyle(data.trading_style || "Intraday");
    setBroker(data.broker || "Zerodha");

    setLoading(false);
  }

  async function updateTrade(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("trades")
      .update({
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
        instrument,
        trading_style: tradingStyle,
        broker,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/trades/${id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading trade...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] p-6 text-white">
      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
        <p className="text-sm font-medium text-emerald-400">
          Indian Market Journal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Edit Trade</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update NSE, BSE, F&O, Nifty, Bank Nifty, MCX, Crypto or Forex trade
          details.
        </p>
      </div>

      <form
        onSubmit={updateTrade}
        className="space-y-6 rounded-3xl border border-white/10 bg-[#0B111C] p-6"
      >
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            India Market Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Market Type"
              value={marketType}
              onChange={setMarketType}
              options={[
                "NSE Equity",
                "BSE Equity",
                "F&O",
                "Nifty 50",
                "Bank Nifty",
                "Sensex",
                "MCX",
                "Currency",
                "Crypto",
                "Forex",
              ]}
            />

            <Select
              label="Instrument"
              value={instrument}
              onChange={setInstrument}
              options={[
                "Equity",
                "Futures",
                "Options",
                "Commodity",
                "Currency",
                "Crypto",
              ]}
            />

            <Select
              label="Trading Style"
              value={tradingStyle}
              onChange={setTradingStyle}
              options={[
                "Intraday",
                "Scalping",
                "Swing",
                "Positional",
                "Options Buying",
                "Options Selling",
              ]}
            />

            <Select
              label="Broker"
              value={broker}
              onChange={setBroker}
              options={[
                "Zerodha",
                "Upstox",
                "Dhan",
                "Angel One",
                "Groww",
                "Fyers",
                "Binance",
                "Bybit",
                "Other",
              ]}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Trade Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Input
              label="Symbol"
              value={symbol}
              onChange={setSymbol}
              placeholder="RELIANCE / NIFTY / BANKNIFTY"
              required
            />

            <Select
              label="Side"
              value={side}
              onChange={setSide}
              options={["BUY", "SELL"]}
            />

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
              label="Quantity / Lots"
              type="number"
              value={quantity}
              onChange={setQuantity}
              required
            />

            <Input
              label="Strategy"
              value={strategy}
              onChange={setStrategy}
              placeholder="ORB / VWAP / Breakout"
            />

            <Input
              label="Tag"
              value={tag}
              onChange={setTag}
              placeholder="Momentum / Expiry / Scalping"
            />

            <ReadOnlyInput label="P&L" value={`₹${pnl.toFixed(2)}`} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Risk & Psychology
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Input
              label="Risk"
              type="number"
              value={risk}
              onChange={setRisk}
              placeholder="1000"
            />

            <Input
              label="Reward"
              type="number"
              value={reward}
              onChange={setReward}
              placeholder="2500"
            />

            <ReadOnlyInput label="R:R Ratio" value={rrRatio.toFixed(2)} />

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
                "Averaging Loss",
                "Expiry Day Gambling",
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
          </div>
        </section>

        <section>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened in this trade?"
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#070A0F] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Trade"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/trades/${id}`)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm text-gray-300 hover:bg-white/[0.08]"
          >
            Cancel
          </button>
        </div>
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
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#070A0F] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
      />
    </div>
  );
}

function ReadOnlyInput({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        value={value}
        readOnly
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-emerald-400 outline-none"
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
      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#070A0F] px-4 py-3 text-white outline-none focus:border-emerald-500/50"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#070A0F]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}