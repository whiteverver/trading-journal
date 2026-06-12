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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Flame,
  Brain,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

type Trade = {
  id: string;
  symbol: string;
  pnl: number | null;
  trade_date: string | null;
  created_at: string;
  rr_ratio?: number | null;
  risk?: number | null;
  reward?: number | null;
  emotion?: string | null;
  mistake?: string | null;
  setup?: string | null;
  strategy?: string | null;
};

export default function ProgressPage() {
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
      console.error("Progress trades error:", error.message);
      setTrades([]);
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const previousMonth = previousMonthDate.getMonth();
    const previousYear = previousMonthDate.getFullYear();

    const currentMonthTrades = trades.filter((trade) => {
      const date = new Date(trade.trade_date || trade.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonthTrades = trades.filter((trade) => {
      const date = new Date(trade.trade_date || trade.created_at);
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
    });

    const calc = (list: Trade[]) => {
      const pnlValues = list.map((t) => Number(t.pnl || 0));
      const wins = pnlValues.filter((p) => p > 0);
      const losses = pnlValues.filter((p) => p < 0);

      const totalPnl = pnlValues.reduce((a, b) => a + b, 0);
      const grossProfit = wins.reduce((a, b) => a + b, 0);
      const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));

      return {
        trades: list.length,
        pnl: totalPnl,
        winRate: list.length ? (wins.length / list.length) * 100 : 0,
        profitFactor:
          grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0,
      };
    };

    const current = calc(currentMonthTrades);
    const previous = calc(previousMonthTrades);

    const growth =
      previous.pnl !== 0 ? ((current.pnl - previous.pnl) / Math.abs(previous.pnl)) * 100 : 0;

    const mistakeTrades = trades.filter((t) => t.mistake && t.mistake.trim() !== "");
    const emotionalTrades = trades.filter((t) => t.emotion && t.emotion.trim() !== "");
    const lowRRTrades = trades.filter((t) => Number(t.rr_ratio || 0) > 0 && Number(t.rr_ratio || 0) < 1.5);

    const disciplineScore = Math.max(
      0,
      Math.min(100, Math.round(100 - (mistakeTrades.length / Math.max(trades.length, 1)) * 100))
    );

    const emotionalScore = Math.max(
      0,
      Math.min(100, Math.round(100 - (emotionalTrades.length / Math.max(trades.length, 1)) * 60))
    );

    const consistencyScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          current.winRate * 0.4 +
            Math.min(current.profitFactor * 20, 35) +
            (current.pnl > 0 ? 25 : 5)
        )
      )
    );

    return {
      current,
      previous,
      growth,
      mistakeTrades: mistakeTrades.length,
      emotionalTrades: emotionalTrades.length,
      lowRRTrades: lowRRTrades.length,
      disciplineScore,
      emotionalScore,
      consistencyScore,
    };
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

  const cumulativeData = useMemo(() => {
    let equity = 0;

    return trades.map((trade, index) => {
      equity += Number(trade.pnl || 0);

      return {
        trade: `T${index + 1}`,
        equity,
      };
    });
  }, [trades]);

  const mistakeData = useMemo(() => {
    const map = new Map<string, number>();

    trades.forEach((trade) => {
      if (!trade.mistake) return;
      map.set(trade.mistake, (map.get(trade.mistake) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([mistake, count]) => ({ mistake, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [trades]);

  const dailyStreaks = useMemo(() => {
    const map = new Map<string, number>();

    trades.forEach((trade) => {
      const date = new Date(trade.trade_date || trade.created_at);
      const key = date.toISOString().split("T")[0];
      map.set(key, (map.get(key) || 0) + Number(trade.pnl || 0));
    });

    const days = Array.from(map.entries())
      .map(([date, pnl]) => ({ date, pnl }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let greenStreak = 0;
    let redStreak = 0;
    let bestGreenStreak = 0;
    let bestRedStreak = 0;

    days.forEach((day) => {
      if (day.pnl > 0) {
        greenStreak++;
        redStreak = 0;
      } else if (day.pnl < 0) {
        redStreak++;
        greenStreak = 0;
      } else {
        greenStreak = 0;
        redStreak = 0;
      }

      bestGreenStreak = Math.max(bestGreenStreak, greenStreak);
      bestRedStreak = Math.max(bestRedStreak, redStreak);
    });

    const bestDay = days.length
      ? days.reduce((best, d) => (d.pnl > best.pnl ? d : best))
      : null;

    const worstDay = days.length
      ? days.reduce((worst, d) => (d.pnl < worst.pnl ? d : worst))
      : null;

    return {
      bestGreenStreak,
      bestRedStreak,
      bestDay,
      worstDay,
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            Trader Progress
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Progress Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Track your monthly growth, consistency, discipline, and emotional performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Current Month P&L"
            value={`$${stats.current.pnl.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5" />}
            positive={stats.current.pnl >= 0}
          />
          <StatCard
            title="Previous Month P&L"
            value={`$${stats.previous.pnl.toFixed(2)}`}
            icon={<CalendarDays className="h-5 w-5" />}
            positive={stats.previous.pnl >= 0}
          />
          <StatCard
            title="Growth"
            value={`${stats.growth.toFixed(1)}%`}
            icon={
              stats.growth >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )
            }
            positive={stats.growth >= 0}
          />
          <StatCard
            title="Monthly Win Rate"
            value={`${stats.current.winRate.toFixed(1)}%`}
            icon={<Target className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ScoreCard
            title="Consistency Score"
            value={stats.consistencyScore}
            icon={<Flame className="h-5 w-5" />}
          />
          <ScoreCard
            title="Discipline Score"
            value={stats.disciplineScore}
            icon={<Shield className="h-5 w-5" />}
          />
          <ScoreCard
            title="Emotional Score"
            value={stats.emotionalScore}
            icon={<Brain className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      background: "#0B111C",
                      border: "1px solid #1F2937",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="pnl" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Trader Development</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MiniStat title="Best Green Streak" value={`${dailyStreaks.bestGreenStreak} days`} />
              <MiniStat title="Worst Red Streak" value={`${dailyStreaks.bestRedStreak} days`} />
              <MiniStat
                title="Best Day"
                value={dailyStreaks.bestDay ? `$${dailyStreaks.bestDay.pnl.toFixed(2)}` : "$0.00"}
              />
              <MiniStat
                title="Worst Day"
                value={dailyStreaks.worstDay ? `$${dailyStreaks.worstDay.pnl.toFixed(2)}` : "$0.00"}
                danger
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Equity Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="progressEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="trade" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      background: "#0B111C",
                      border: "1px solid #1F2937",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    fill="url(#progressEquity)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-[#0B111C] to-[#231313]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Weakness Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MiniStat title="Mistake Trades" value={stats.mistakeTrades} danger />
              <MiniStat title="Emotional Trades" value={stats.emotionalTrades} danger />
              <MiniStat title="Low R:R Trades" value={stats.lowRRTrades} danger />
              <MiniStat
                title="Monthly Profit Factor"
                value={stats.current.profitFactor.toFixed(2)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-[#0B111C]">
          <CardHeader>
            <CardTitle className="text-white">Mistake Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            {mistakeData.length === 0 ? (
              <p className="text-sm text-gray-400">No mistakes recorded yet.</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mistakeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="mistake" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        background: "#0B111C",
                        border: "1px solid #1F2937",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
  value: string | number;
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

function ScoreCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{title}</p>
          <div className="rounded-xl bg-white/5 p-2 text-emerald-400">{icon}</div>
        </div>

        <p className="mt-4 text-4xl font-bold text-emerald-400">{value}</p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <p
        className={`mt-2 text-2xl font-bold ${
          danger ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}