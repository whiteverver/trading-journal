"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  Shield,
  Zap,
  Activity,
  BarChart3,
  IndianRupee,
} from "lucide-react";

type Trade = {
  id: string;
  symbol: string;
  side: string;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  pnl: number | null;
  strategy: string | null;
  tag: string | null;
  notes: string | null;
  trade_date: string | null;
  created_at: string;
  risk?: number | null;
  reward?: number | null;
  rr_ratio?: number | null;
  emotion?: string | null;
  mistake?: string | null;
  setup?: string | null;
  timeframe?: string | null;
  market_type?: string | null;
  instrument?: string | null;
  trading_style?: string | null;
  broker?: string | null;
};

type GroupedData = {
  name: string;
  pnl: number;
  trades: number;
};

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Dashboard error:", error.message);
      setTrades([]);
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }

  const stats = useMemo(() => {
    const pnlValues = trades.map((trade) => Number(trade.pnl || 0));
    const wins = pnlValues.filter((pnl) => pnl > 0);
    const losses = pnlValues.filter((pnl) => pnl < 0);

    const totalPnl = pnlValues.reduce((sum, value) => sum + value, 0);
    const grossProfit = wins.reduce((sum, value) => sum + value, 0);
    const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0));

    const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;

    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

    const expectancy = trades.length ? totalPnl / trades.length : 0;

    const largestWin = wins.length ? Math.max(...wins) : 0;
    const largestLoss = losses.length ? Math.min(...losses) : 0;

    const optionsPnl = getPnlByValue(trades, "instrument", "Options");
    const futuresPnl = getPnlByValue(trades, "instrument", "Futures");
    const equityPnl = getPnlByValue(trades, "instrument", "Equity");

    const niftyPnl = getMarketPnl(trades, ["NIFTY", "NIFTY 50"]);
    const bankNiftyPnl = getMarketPnl(trades, ["BANKNIFTY", "BANK NIFTY"]);
    const sensexPnl = getMarketPnl(trades, ["SENSEX"]);
    const finniftyPnl = getMarketPnl(trades, ["FINNIFTY", "FIN NIFTY"]);

    return {
      totalTrades: trades.length,
      totalPnl,
      winRate,
      profitFactor,
      expectancy,
      largestWin,
      largestLoss,
      optionsPnl,
      futuresPnl,
      equityPnl,
      niftyPnl,
      bankNiftyPnl,
      sensexPnl,
      finniftyPnl,
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let equity = 0;

    return trades.map((trade, index) => {
      equity += Number(trade.pnl || 0);

      return {
        name: `T${index + 1}`,
        equity,
      };
    });
  }, [trades]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number }>();
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const key = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      map.set(key, { pnl: 0, trades: 0 });
    }

    trades.forEach((trade) => {
      const date = new Date(trade.trade_date || trade.created_at);

      const key = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!map.has(key)) return;

      const current = map.get(key)!;

      map.set(key, {
        pnl: current.pnl + Number(trade.pnl || 0),
        trades: current.trades + 1,
      });
    });

    return Array.from(map.entries()).map(([month, data]) => ({
      month,
      pnl: data.pnl,
      trades: data.trades,
    }));
  }, [trades]);

  const brokerData = useMemo(
    () => groupByField(trades, "broker").slice(0, 6),
    [trades]
  );

  const instrumentData = useMemo(
    () => groupByField(trades, "instrument").slice(0, 6),
    [trades]
  );

  const marketTypeData = useMemo(
    () => groupByField(trades, "market_type").slice(0, 6),
    [trades]
  );

  const tradingStyleData = useMemo(
    () => groupByField(trades, "trading_style").slice(0, 6),
    [trades]
  );

  const symbolData = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number }>();

    trades.forEach((trade) => {
      const symbol = trade.symbol || "Unknown";
      const current = map.get(symbol) || { pnl: 0, trades: 0 };

      map.set(symbol, {
        pnl: current.pnl + Number(trade.pnl || 0),
        trades: current.trades + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        pnl: data.pnl,
        trades: data.trades,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 6);
  }, [trades]);

  const bestBroker = brokerData[0];
  const bestInstrument = instrumentData[0];
  const bestSymbol = symbolData[0];
  const worstSymbol = [...symbolData].sort((a, b) => a.pnl - b.pnl)[0];

  const recentTrades = [...trades].reverse().slice(0, 7);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading India dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            India Trading Journal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Indian Market Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Track NSE, BSE, F&O, Nifty, Bank Nifty, Sensex, broker performance,
            and instrument-wise trading analytics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Net P&L"
            value={`₹${stats.totalPnl.toFixed(2)}`}
            icon={<IndianRupee className="h-6 w-6" />}
            positive={stats.totalPnl >= 0}
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            icon={<Target className="h-6 w-6" />}
          />
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            icon={<Shield className="h-6 w-6" />}
          />
          <StatCard
            title="Expectancy"
            value={`₹${stats.expectancy.toFixed(2)}`}
            icon={<Zap className="h-6 w-6" />}
            positive={stats.expectancy >= 0}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MarketCard title="NIFTY P&L" value={stats.niftyPnl} />
          <MarketCard title="BANKNIFTY P&L" value={stats.bankNiftyPnl} />
          <MarketCard title="SENSEX P&L" value={stats.sensexPnl} />
          <MarketCard title="FINNIFTY P&L" value={stats.finniftyPnl} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MarketCard title="Equity P&L" value={stats.equityPnl} />
          <MarketCard title="Options P&L" value={stats.optionsPnl} />
          <MarketCard title="Futures P&L" value={stats.futuresPnl} />
          <MiniCard title="Total Trades" value={stats.totalTrades} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-emerald-400" />
                Equity Curve
              </CardTitle>
            </CardHeader>

            <CardContent className="h-[350px] w-full min-w-0 overflow-hidden">
              {equityData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient
                        id="indiaEquity"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#10b981"
                      fill="url(#indiaEquity)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Top Performer</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <InsightMini
                title="Best Broker"
                value={
                  bestBroker
                    ? `${bestBroker.name} • ₹${bestBroker.pnl.toFixed(2)}`
                    : "-"
                }
              />
              <InsightMini
                title="Best Instrument"
                value={
                  bestInstrument
                    ? `${bestInstrument.name} • ₹${bestInstrument.pnl.toFixed(2)}`
                    : "-"
                }
              />
              <InsightMini
                title="Best Symbol"
                value={
                  bestSymbol
                    ? `${bestSymbol.name} • ₹${bestSymbol.pnl.toFixed(2)}`
                    : "-"
                }
              />
              <InsightMini
                title="Weak Symbol"
                value={
                  worstSymbol
                    ? `${worstSymbol.name} • ₹${worstSymbol.pnl.toFixed(2)}`
                    : "-"
                }
                danger
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <ChartCard
            title="Broker Performance"
            data={brokerData}
            xKey="name"
            dataKey="pnl"
          />

          <ChartCard
            title="Instrument Performance"
            data={instrumentData}
            xKey="name"
            dataKey="pnl"
          />

          <ChartCard
            title="Trading Style"
            data={tradingStyleData}
            xKey="name"
            dataKey="pnl"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Monthly P&L</CardTitle>
            </CardHeader>

            <CardContent className="h-[320px] w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="pnl" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Market Type Split</CardTitle>
            </CardHeader>

            <CardContent className="h-[320px] w-full min-w-0 overflow-hidden">
              {marketTypeData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketTypeData}
                      dataKey="trades"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label
                    >
                      {marketTypeData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Recent Trades
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Symbol</th>
                      <th className="px-4 py-3 text-left">Broker</th>
                      <th className="px-4 py-3 text-left">Instrument</th>
                      <th className="px-4 py-3 text-left">Style</th>
                      <th className="px-4 py-3 text-right">P&L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-t border-white/10 hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {trade.symbol}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {trade.broker || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {trade.instrument || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {trade.trading_style || "-"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            Number(trade.pnl || 0) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          ₹{Number(trade.pnl || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {recentTrades.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No trades found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-[#0B111C] to-[#231313]">
            <CardHeader>
              <CardTitle className="text-white">Risk Highlights</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <InsightMini
                title="Largest Win"
                value={`₹${stats.largestWin.toFixed(2)}`}
              />
              <InsightMini
                title="Largest Loss"
                value={`₹${stats.largestLoss.toFixed(2)}`}
                danger
              />
              <InsightMini
                title="Options Exposure"
                value={`₹${stats.optionsPnl.toFixed(2)}`}
                danger={stats.optionsPnl < 0}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const tooltipStyle = {
  background: "#0B111C",
  border: "1px solid #1F2937",
  borderRadius: "12px",
  color: "#ffffff",
};

const PIE_COLORS = [
  "#10b981",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f97316",
  "#ef4444",
];

function getPnlByValue(
  trades: Trade[],
  field: "instrument" | "broker" | "trading_style" | "market_type",
  value: string
) {
  return trades
    .filter(
      (trade) => (trade[field] || "").toLowerCase() === value.toLowerCase()
    )
    .reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
}

function getMarketPnl(trades: Trade[], keywords: string[]) {
  return trades
    .filter((trade) => {
      const symbol = (trade.symbol || "").toUpperCase();
      const marketType = (trade.market_type || "").toUpperCase();

      return keywords.some(
        (keyword) => symbol.includes(keyword) || marketType.includes(keyword)
      );
    })
    .reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
}

function groupByField(
  trades: Trade[],
  field: "instrument" | "broker" | "trading_style" | "market_type"
): GroupedData[] {
  const map = new Map<string, { pnl: number; trades: number }>();

  trades.forEach((trade) => {
    const name = trade[field] || "Unknown";
    const current = map.get(name) || { pnl: 0, trades: 0 };

    map.set(name, {
      pnl: current.pnl + Number(trade.pnl || 0),
      trades: current.trades + 1,
    });
  });

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      pnl: data.pnl,
      trades: data.trades,
    }))
    .sort((a, b) => b.pnl - a.pnl);
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
      <CardContent className="flex min-h-[135px] items-center justify-between p-5">
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

        <div className="rounded-2xl bg-white/5 p-3 text-gray-300">{icon}</div>
      </CardContent>
    </Card>
  );
}

function MarketCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="p-5">
        <p className="text-xs text-gray-400">{title}</p>
        <p
          className={`mt-2 text-2xl font-bold ${
            value >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          ₹{value.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}

function MiniCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="p-5">
        <p className="text-xs text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  data,
  xKey,
  dataKey,
}: {
  title: string;
  data: GroupedData[];
  xKey: keyof GroupedData;
  dataKey: keyof GroupedData;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>

      <CardContent className="h-[300px] w-full min-w-0 overflow-hidden">
        {data.length === 0 ? (
          <EmptyState />
        ) : data.length === 1 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <p className="text-sm text-gray-400">{data[0][xKey]}</p>
              <p className="mt-3 text-4xl font-bold text-emerald-400">
                ₹{Number(data[0][dataKey] || 0).toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Add more trades for chart comparison.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey={String(xKey)} stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey={String(dataKey)}
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function InsightMini({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-red-500/20 bg-red-500/10"
          : "border-emerald-500/20 bg-emerald-500/10"
      }`}
    >
      <p className={danger ? "text-xs text-red-300" : "text-xs text-emerald-300"}>
        {title}
      </p>
      <p
        className={
          danger
            ? "mt-2 font-bold text-red-400"
            : "mt-2 font-bold text-emerald-400"
        }
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
      <p className="text-sm text-gray-400">No data available yet.</p>
    </div>
  );
}