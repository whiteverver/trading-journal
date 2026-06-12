"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Trophy,
  Flame,
} from "lucide-react";

type Trade = {
  id: string;
  symbol: string;
  pnl: number | null;
  trade_date: string | null;
  created_at: string;
};

export default function CalendarPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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
      .select("id,symbol,pnl,trade_date,created_at")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Calendar trades error:", error.message);
      setTrades([]);
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const dailyData = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number }>();

    trades.forEach((trade) => {
      const rawDate = trade.trade_date || trade.created_at;
      if (!rawDate) return;

      const date = new Date(rawDate);
      const key = date.toISOString().split("T")[0];

      const current = map.get(key) || { pnl: 0, trades: 0 };

      map.set(key, {
        pnl: current.pnl + Number(trade.pnl || 0),
        trades: current.trades + 1,
      });
    });

    return map;
  }, [trades]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{
      day: number | null;
      dateKey: string | null;
      pnl: number;
      trades: number;
    }> = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, dateKey: null, pnl: 0, trades: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const data = dailyData.get(dateKey) || { pnl: 0, trades: 0 };

      days.push({
        day,
        dateKey,
        pnl: data.pnl,
        trades: data.trades,
      });
    }

    return days;
  }, [dailyData, month, year]);

  const stats = useMemo(() => {
    const monthDays = calendarDays.filter((d) => d.day !== null);
    const tradingDays = monthDays.filter((d) => d.trades > 0);

    const totalPnl = tradingDays.reduce((sum, d) => sum + d.pnl, 0);
    const winningDays = tradingDays.filter((d) => d.pnl > 0).length;
    const losingDays = tradingDays.filter((d) => d.pnl < 0).length;

    const bestDay = tradingDays.length
      ? tradingDays.reduce((best, d) => (d.pnl > best.pnl ? d : best))
      : null;

    const worstDay = tradingDays.length
      ? tradingDays.reduce((worst, d) => (d.pnl < worst.pnl ? d : worst))
      : null;

    return {
      totalPnl,
      winningDays,
      losingDays,
      tradingDays: tradingDays.length,
      bestDay,
      worstDay,
    };
  }, [calendarDays]);

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getDayClass(pnl: number, tradesCount: number) {
    if (tradesCount === 0) {
      return "border-white/10 bg-white/[0.02] text-gray-500";
    }

    if (pnl > 0) {
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
    }

    if (pnl < 0) {
      return "border-red-500/30 bg-red-500/15 text-red-300";
    }

    return "border-yellow-500/30 bg-yellow-500/15 text-yellow-300";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            Trading Calendar
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Calendar Heatmap
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Track your daily P&L, winning days, losing days, and monthly
            performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Monthly P&L"
            value={`$${stats.totalPnl.toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5" />}
            positive={stats.totalPnl >= 0}
          />
          <StatCard
            title="Trading Days"
            value={stats.tradingDays}
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <StatCard
            title="Winning Days"
            value={stats.winningDays}
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatCard
            title="Losing Days"
            value={stats.losingDays}
            icon={<TrendingDown className="h-5 w-5" />}
            positive={false}
          />
          <StatCard
            title="Best Day"
            value={
              stats.bestDay ? `$${stats.bestDay.pnl.toFixed(2)}` : "$0.00"
            }
            icon={<Flame className="h-5 w-5" />}
          />
        </div>

        <Card className="border-white/10 bg-[#0B111C]">
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <CardTitle className="text-2xl text-white">{monthName}</CardTitle>

              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.08]"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.08]"
                >
                  Next
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[110px] rounded-2xl border p-3 transition ${
                    day.day === null
                      ? "border-transparent bg-transparent"
                      : getDayClass(day.pnl, day.trades)
                  }`}
                >
                  {day.day !== null && (
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{day.day}</p>
                        {day.trades > 0 && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                            {day.trades}
                          </span>
                        )}
                      </div>

                      {day.trades > 0 ? (
                        <div>
                          <p className="text-lg font-bold">
                            ${day.pnl.toFixed(0)}
                          </p>
                          <p className="text-xs opacity-70">P&L</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">No trades</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Best Day</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.bestDay ? (
                <div>
                  <p className="text-3xl font-bold text-emerald-400">
                    ${stats.bestDay.pnl.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {stats.bestDay.trades} trades
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No trading data yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Worst Day</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.worstDay ? (
                <div>
                  <p className="text-3xl font-bold text-red-400">
                    ${stats.worstDay.pnl.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {stats.worstDay.trades} trades
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No trading data yet.</p>
              )}
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
  value: string | number;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="flex min-h-[120px] items-center justify-between p-5">
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