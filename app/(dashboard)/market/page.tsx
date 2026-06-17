"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  X,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  IndianRupee,
  BarChart3,
} from "lucide-react";

type WatchItem = {
  id: string;
  symbol: string;
};

type MarketQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  open: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: string;
};

const DEFAULT_SYMBOLS = [
  "NIFTY",
  "BANKNIFTY",
  "FINNIFTY",
  "SENSEX",
  "RELIANCE.BSE",
  "TCS.BSE",
  "INFY.BSE",
  "HDFCBANK.BSE",
  "ICICIBANK.BSE",
  "SBIN.BSE",
];

export default function IndiaMarketPage() {
  const [symbol, setSymbol] = useState("");
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [watchlist, setWatchlist] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchLoading, setWatchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function fetchWatchlist() {
    setWatchLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWatchlist([]);
      setWatchLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setWatchlist([]);
    } else {
      setWatchlist(data || []);
    }

    setWatchLoading(false);
  }

  async function fetchQuote(searchSymbol: string) {
    setLoading(true);
    setError("");
    setQuote(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

      if (!apiKey) {
        setError("Alpha Vantage API key missing.");
        setLoading(false);
        return;
      }

      const finalSymbol = formatIndiaSymbol(searchSymbol);

      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${finalSymbol}&apikey=${apiKey}`
      );

      const data = await res.json();
      const q = data["Global Quote"];

      if (!q || Object.keys(q).length === 0) {
        setError("No data found. Try RELIANCE.BSE, TCS.BSE, INFY.BSE, SBIN.BSE.");
        setLoading(false);
        return;
      }

      setQuote({
        symbol: q["01. symbol"],
        open: Number(q["02. open"] || 0),
        high: Number(q["03. high"] || 0),
        low: Number(q["04. low"] || 0),
        price: Number(q["05. price"] || 0),
        volume: Number(q["06. volume"] || 0),
        latestTradingDay: q["07. latest trading day"],
        change: Number(q["09. change"] || 0),
        changePercent: q["10. change percent"] || "0%",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching market data.");
    }

    setLoading(false);
  }

  async function searchMarket(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    fetchQuote(symbol);
  }

  async function addToWatchlist(addSymbol?: string) {
    const selectedSymbol = formatIndiaSymbol(addSymbol || quote?.symbol || symbol);

    if (!selectedSymbol) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    const exists = watchlist.some(
      (item) => item.symbol.toUpperCase() === selectedSymbol.toUpperCase()
    );

    if (exists) return;

    const { error } = await supabase.from("watchlist").insert({
      user_id: user.id,
      symbol: selectedSymbol.toUpperCase(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    fetchWatchlist();
  }

  async function removeFromWatchlist(id: string) {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchWatchlist();
  }

  const sentiment = useMemo(() => {
    if (!quote) return "Neutral";
    if (quote.change > 0) return "Bullish";
    if (quote.change < 0) return "Bearish";
    return "Neutral";
  }, [quote]);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            India Market Watch
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            NSE, BSE & Index Watchlist
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Track Indian stocks, NIFTY, BANKNIFTY, SENSEX and save your watchlist.
          </p>
        </div>

        <Card className="border-white/10 bg-[#0B111C]">
          <CardContent className="p-5">
            <form onSubmit={searchMarket} className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Search: RELIANCE.BSE, TCS.BSE, INFY.BSE, SBIN.BSE"
                  className="w-full rounded-2xl border border-white/10 bg-[#070A0F] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {DEFAULT_SYMBOLS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSymbol(item);
                fetchQuote(item);
              }}
              className="rounded-2xl border border-white/10 bg-[#0B111C] px-4 py-3 text-left text-sm text-gray-300 hover:border-emerald-500/40 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>

        {quote && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Live Price"
                value={`₹${quote.price.toFixed(2)}`}
                icon={<IndianRupee className="h-6 w-6" />}
                positive
              />
              <StatCard
                title="Daily Change"
                value={`${quote.change.toFixed(2)} (${quote.changePercent})`}
                icon={
                  quote.change >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )
                }
                positive={quote.change >= 0}
              />
              <StatCard
                title="Volume"
                value={quote.volume.toLocaleString()}
                icon={<BarChart3 className="h-6 w-6" />}
                positive
              />
              <StatCard
                title="Sentiment"
                value={sentiment}
                icon={<Activity className="h-6 w-6" />}
                positive={sentiment !== "Bearish"}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-white">
                      {quote.symbol} Overview
                    </CardTitle>

                    <button
                      onClick={() => addToWatchlist(quote.symbol)}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard title="Open" value={`₹${quote.open.toFixed(2)}`} />
                    <InfoCard title="High" value={`₹${quote.high.toFixed(2)}`} />
                    <InfoCard title="Low" value={`₹${quote.low.toFixed(2)}`} />
                    <InfoCard title="Trading Day" value={quote.latestTradingDay} />
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`border-white/10 ${
                  quote.change >= 0
                    ? "bg-gradient-to-br from-[#0B111C] to-[#08251C]"
                    : "bg-gradient-to-br from-[#0B111C] to-[#281313]"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-white">Market Insight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Insight
                    label="Trend"
                    value={
                      quote.change >= 0
                        ? `${quote.symbol} is positive today.`
                        : `${quote.symbol} is negative today.`
                    }
                    danger={quote.change < 0}
                  />
                  <Insight
                    label="Range"
                    value={`Today's range is ₹${quote.low.toFixed(2)} to ₹${quote.high.toFixed(2)}.`}
                  />
                  <Insight
                    label="Note"
                    value="Use this only as reference. Confirm entries with your trade plan."
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Card className="border-white/10 bg-[#0B111C]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              Saved Watchlist
            </CardTitle>
          </CardHeader>

          <CardContent>
            {watchLoading ? (
              <p className="text-sm text-gray-400">Loading watchlist...</p>
            ) : watchlist.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-gray-400">
                  No symbols saved yet. Add RELIANCE.BSE, TCS.BSE, INFY.BSE or SBIN.BSE.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Symbol</th>
                      <th className="px-4 py-3 text-right">View</th>
                      <th className="px-4 py-3 text-right">Remove</th>
                    </tr>
                  </thead>

                  <tbody>
                    {watchlist.map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="px-4 py-3 font-semibold text-white">
                          {item.symbol}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSymbol(item.symbol);
                              fetchQuote(item.symbol);
                            }}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 hover:bg-emerald-500/20"
                          >
                            View
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeFromWatchlist(item.id)}
                            className="inline-flex rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function formatIndiaSymbol(value: string) {
  const s = value.trim().toUpperCase();

  if (!s) return "";

  if (["NIFTY", "BANKNIFTY", "FINNIFTY", "SENSEX"].includes(s)) {
    return s;
  }

  if (s.includes(".BSE") || s.includes(".NSE")) {
    return s;
  }

  return `${s}.BSE`;
}

function StatCard({
  title,
  value,
  icon,
  positive = true,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="flex min-h-[130px] items-center justify-between p-5">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {value}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-3 text-gray-300">{icon}</div>
      </CardContent>
    </Card>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Insight({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-500/20 bg-red-500/10"
          : "border-emerald-500/20 bg-emerald-500/10"
      }`}
    >
      <p className={danger ? "text-xs text-red-300" : "text-xs text-emerald-300"}>
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-gray-300">{value}</p>
    </div>
  );
}