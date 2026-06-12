"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  DollarSign,
  Star,
  Plus,
  X,
} from "lucide-react";

type MarketData = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  previousClose: string;
  volume: string;
  latestTradingDay: string;
};

export default function MarketPage() {
  const [symbol, setSymbol] = useState("");
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [watchlist, setWatchlist] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchSymbol(e: React.FormEvent) {
    e.preventDefault();

    if (!symbol.trim()) return;

    setLoading(true);
    setError("");
    setMarketData(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

      if (!apiKey) {
        setError("Alpha Vantage API key missing.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${apiKey}`
      );

      const data = await res.json();
      const quote = data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        setError("No market data found. Try AAPL, MSFT, TSLA, NVDA.");
        setLoading(false);
        return;
      }

      const formatted: MarketData = {
        symbol: quote["01. symbol"],
        open: quote["02. open"],
        high: quote["03. high"],
        low: quote["04. low"],
        price: quote["05. price"],
        volume: quote["06. volume"],
        latestTradingDay: quote["07. latest trading day"],
        previousClose: quote["08. previous close"],
        change: quote["09. change"],
        changePercent: quote["10. change percent"],
      };

      setMarketData(formatted);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching market data.");
    }

    setLoading(false);
  }

  function addToWatchlist() {
    if (!marketData) return;

    const exists = watchlist.some((item) => item.symbol === marketData.symbol);

    if (!exists) {
      setWatchlist((prev) => [marketData, ...prev]);
    }
  }

  function removeFromWatchlist(symbol: string) {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  }

  const isPositive =
    marketData && Number(marketData.change.replace("%", "")) >= 0;

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">Market Watch</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Live Market Data
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Search stock symbols, view price action, and build your watchlist.
          </p>
        </div>

        <Card className="border-white/10 bg-[#0B111C]">
          <CardContent className="p-5">
            <form
              onSubmit={searchSymbol}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Search symbol e.g. AAPL, TSLA, NVDA"
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

        {marketData && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Current Price"
                value={`$${Number(marketData.price).toFixed(2)}`}
                icon={<DollarSign className="h-6 w-6" />}
                positive={true}
              />
              <StatCard
                title="Daily Change"
                value={`${Number(marketData.change).toFixed(2)} (${marketData.changePercent})`}
                icon={
                  isPositive ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )
                }
                positive={!!isPositive}
              />
              <StatCard
                title="Volume"
                value={Number(marketData.volume).toLocaleString()}
                icon={<BarChart3 className="h-6 w-6" />}
              />
              <StatCard
                title="Trading Day"
                value={marketData.latestTradingDay}
                icon={<Activity className="h-6 w-6" />}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      {marketData.symbol} Overview
                    </CardTitle>

                    <button
                      onClick={addToWatchlist}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20"
                    >
                      <Plus className="h-4 w-4" />
                      Add Watchlist
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard title="Open" value={`$${marketData.open}`} />
                    <InfoCard title="High" value={`$${marketData.high}`} />
                    <InfoCard title="Low" value={`$${marketData.low}`} />
                    <InfoCard
                      title="Previous Close"
                      value={`$${marketData.previousClose}`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-gradient-to-br from-[#0B111C] to-[#10251D]">
                <CardHeader>
                  <CardTitle className="text-white">Market Insight</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-300">
                  <Insight
                    label="Trend"
                    value={
                      isPositive
                        ? `${marketData.symbol} is trading positive today.`
                        : `${marketData.symbol} is trading negative today.`
                    }
                  />
                  <Insight
                    label="Range"
                    value={`Today range is $${marketData.low} to $${marketData.high}.`}
                  />
                  <Insight
                    label="Note"
                    value="Use this data for reference only. Confirm entries with your own trading plan."
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
              Watchlist
            </CardTitle>
          </CardHeader>

          <CardContent>
            {watchlist.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-gray-400">
                  No symbols added yet. Search a stock and add it to your
                  watchlist.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Symbol</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Change</th>
                      <th className="px-4 py-3 text-right">Volume</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {watchlist.map((item) => {
                      const positive = Number(item.change) >= 0;

                      return (
                        <tr
                          key={item.symbol}
                          className="border-t border-white/10 hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3 font-semibold text-white">
                            {item.symbol}
                          </td>
                          <td className="px-4 py-3 text-right text-white">
                            ${Number(item.price).toFixed(2)}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              positive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {Number(item.change).toFixed(2)}{" "}
                            {item.changePercent}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400">
                            {Number(item.volume).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => removeFromWatchlist(item.symbol)}
                              className="inline-flex rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
    <Card className="border-white/10 bg-[#0B111C] transition hover:border-emerald-500/30">
      <CardContent className="flex min-h-[140px] items-center justify-between p-6">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p
            className={`mt-3 text-2xl font-bold ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 text-gray-300">{icon}</div>
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

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-medium text-emerald-400">{label}</p>
      <p className="mt-1 leading-relaxed">{value}</p>
    </div>
  );
}