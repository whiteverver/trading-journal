"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [broker, setBroker] = useState("");
  const [tradingStyle, setTradingStyle] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [riskPerTrade, setRiskPerTrade] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");
      setBroker(data.broker || "");
      setTradingStyle(data.trading_style || "");
      setAccountSize(data.account_size || "");
      setRiskPerTrade(data.risk_per_trade || "");
    }

    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      broker,
      trading_style: tradingStyle,
      account_size: Number(accountSize || 0),
      risk_per_trade: Number(riskPerTrade || 0),
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile saved successfully");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>

      <form
        onSubmit={saveProfile}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Broker
            </label>
            <input
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="Zerodha, Binance, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Trading Style
            </label>
            <select
              value={tradingStyle}
              onChange={(e) => setTradingStyle(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Select style</option>
              <option value="Scalping">Scalping</option>
              <option value="Intraday">Intraday</option>
              <option value="Swing">Swing</option>
              <option value="Options">Options</option>
              <option value="Crypto">Crypto</option>
              <option value="Long Term">Long Term</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Account Size
            </label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Risk Per Trade %
            </label>
            <input
              type="number"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
              placeholder="1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}