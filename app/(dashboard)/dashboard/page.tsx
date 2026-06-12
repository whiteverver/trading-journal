"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Target,
  Trophy,
  BarChart3,
  Shield,
  Zap,
  CalendarDays,
  Brain,
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
};

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Dashboard trades error:", error.message);
      setTrades([]);
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }

  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const pnlValues = trades.map((t) => Number(t.pnl || 0));
    const wins = pnlValues.filter((p) => p > 0);
    const losses = pnlValues.filter((p) => p < 0);

    const totalPnl = pnlValues.reduce((sum, value) => sum + value, 0);
    const grossProfit = wins.reduce((sum, value) => sum + value, 0);
    const grossLoss = Math.abs(losses.reduce((sum, value) => sum + value, 0));

    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;
    const expectancy = totalTrades ? totalPnl / totalTrades : 0;

    let runningEquity = 0;
    let peakEquity = 0;
    let maxDrawdown = 0;

    trades.forEach((trade) => {
      runningEquity += Number(trade.pnl || 0);
      peakEquity = Math.max(peakEquity, runningEquity);
      maxDrawdown = Math.min(maxDrawdown, runningEquity - peakEquity);
    });

    const traderScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          winRate * 0.35 +
            Math.min(profitFactor * 20, 35) +
            (expectancy > 0 ? 20 : 5) +
            (maxDrawdown > -500 ? 10 : 3)
        )
      )
    );

    return {
      totalTrades,
      totalPnl,
      wins: wins.length,
      losses: losses.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      expectancy,
      grossProfit,
      grossLoss,
      maxDrawdown,
      traderScore,
    };
  }, [trades]);

  const equityData = useMemo(() => {
    let equity = 0;

    return trades.map((trade, index) => {
      equity += Number(trade.pnl || 0);

      return {
        name: `T${index + 1}`,
        equity,
        pnl: Number(trade.pnl || 0),
      };
    });
  }, [trades]);

  const dailyPnlData = useMemo(() => {
    const map = new Map<string, number>();

    trades.forEach((trade) => {
      const date = trade.trade_date
        ? new Date(trade.trade_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No Date";

      map.set(date, (map.get(date) || 0) + Number(trade.pnl || 0));
    });

    return Array.from(map.entries()).map(([date, pnl]) => ({ date, pnl }));
  }, [trades]);

  const setupData = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number }>();

    trades.forEach((trade) => {
      const setup = trade.setup || trade.strategy || "Unknown";
      const current = map.get(setup) || { pnl: 0, trades: 0 };

      map.set(setup, {
        pnl: current.pnl + Number(trade.pnl || 0),
        trades: current.trades + 1,
      });
    });

    return Array.from(map.entries())
      .map(([setup, data]) => ({
        setup,
        pnl: data.pnl,
        trades: data.trades,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);
  }, [trades]);

  const radarData = [
    { metric: "Win Rate", value: Math.round(stats.winRate) },
    {
      metric: "Profit Factor",
      value: Math.min(100, Math.round(stats.profitFactor * 25)),
    },
    { metric: "Discipline", value: stats.traderScore },
    { metric: "Consistency", value: stats.expectancy > 0 ? 80 : 35 },
    { metric: "Risk Control", value: stats.maxDrawdown > -500 ? 85 : 45 },
  ];

  const recentTrades = [...trades].reverse().slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#070A0F] text-white">
      <main className="w-full space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Trading Journal SaaS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Performance Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              TradeZella-style overview of your trading performance.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-5 text-center">
            <p className="text-xs text-gray-400">Trader Score</p>
            <p className="mt-1 text-4xl font-bold text-emerald-400">
              {stats.traderScore}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Net P&L"
            value={`$${stats.totalPnl.toFixed(2)}`}
            icon={<TrendingUp className="h-6 w-6" />}
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
            value={`$${stats.expectancy.toFixed(2)}`}
            icon={<Zap className="h-6 w-6" />}
            positive={stats.expectancy >= 0}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MiniCard title="Total Trades" value={stats.totalTrades} />
          <MiniCard title="Avg Win" value={`$${stats.avgWin.toFixed(2)}`} />
          <MiniCard title="Avg Loss" value={`$${stats.avgLoss.toFixed(2)}`} />
          <MiniCard
            title="Max Drawdown"
            value={`$${stats.maxDrawdown.toFixed(2)}`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-emerald-400" />
                Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      background: "#0B111C",
                      border: "1px solid #1F2937",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    fill="url(#equity)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-purple-400" />
                Trader Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarDays className="h-5 w-5 text-blue-400" />
                Daily P&L
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPnlData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      background: "#0B111C",
                      border: "1px solid #1F2937",
                      borderRadius: "12px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="pnl" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Top Setups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {setupData.length === 0 ? (
                <p className="text-sm text-gray-400">No setup data yet.</p>
              ) : (
                setupData.map((item) => (
                  <div
                    key={item.setup}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{item.setup}</p>
                      <p
                        className={
                          item.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        ${item.pnl.toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.trades} trades
                    </p>
                  </div>
                ))
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
                      <th className="px-4 py-3 text-left">Side</th>
                      <th className="px-4 py-3 text-left">Strategy</th>
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
                        <td className="px-4 py-3">
                          <span
                            className={
                              trade.side === "BUY"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {trade.strategy || "-"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            Number(trade.pnl || 0) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          ${Number(trade.pnl || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {recentTrades.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No trades found. Add your first trade.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-[#0B111C] to-[#10251D]">
            <CardHeader>
              <CardTitle className="text-white">AI Coach Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-300">
              <Insight
                label="Performance"
                value={
                  stats.totalPnl >= 0
                    ? "Your net performance is positive."
                    : "Your net performance is currently negative."
                }
              />
              <Insight
                label="Risk"
                value={
                  stats.profitFactor >= 1.5
                    ? "Profit factor looks healthy."
                    : "Improve trade selection and risk control."
                }
              />
              <Insight
                label="Discipline"
                value={
                  stats.winRate >= 50
                    ? "Win rate is stable."
                    : "Review losing setups and emotional trades."
                }
              />
            </CardContent>
          </Card>
        </div>
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
            className={`mt-3 text-3xl font-bold ${
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

function MiniCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="p-5">
        <p className="text-xs text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </CardContent>
    </Card>
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