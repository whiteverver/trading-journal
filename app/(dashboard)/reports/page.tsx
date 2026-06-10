"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setTrades(data || []);
  }

  const totalTrades = trades.length;

  const totalPnl = trades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const winningTrades = trades.filter((trade) => Number(trade.pnl) > 0);
  const losingTrades = trades.filter((trade) => Number(trade.pnl) < 0);

  const winRate =
    totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

  const grossProfit = winningTrades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const grossLoss = Math.abs(
    losingTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0)
  );

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  const averageWin =
    winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;

  const averageLoss =
    losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

  const dailyPnl: Record<string, number> = {};
  const monthlyStats: Record<
    string,
    {
      pnl: number;
      trades: number;
      wins: number;
      losses: number;
      bestDay: number;
      worstDay: number;
    }
  > = {};

  trades.forEach((trade) => {
    const date = trade.trade_date || trade.created_at?.split("T")[0];
    if (!date) return;

    const pnl = Number(trade.pnl || 0);
    const month = date.slice(0, 7);

    dailyPnl[date] = (dailyPnl[date] || 0) + pnl;

    if (!monthlyStats[month]) {
      monthlyStats[month] = {
        pnl: 0,
        trades: 0,
        wins: 0,
        losses: 0,
        bestDay: 0,
        worstDay: 0,
      };
    }

    monthlyStats[month].pnl += pnl;
    monthlyStats[month].trades += 1;

    if (pnl > 0) monthlyStats[month].wins += 1;
    if (pnl < 0) monthlyStats[month].losses += 1;
  });

  Object.keys(monthlyStats).forEach((month) => {
    const monthDailyPnls = Object.entries(dailyPnl)
      .filter(([date]) => date.startsWith(month))
      .map(([, pnl]) => pnl);

    monthlyStats[month].bestDay =
      monthDailyPnls.length > 0 ? Math.max(...monthDailyPnls) : 0;

    monthlyStats[month].worstDay =
      monthDailyPnls.length > 0 ? Math.min(...monthDailyPnls) : 0;
  });

  const months = Object.keys(monthlyStats).sort().reverse();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Reports</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Total P&L" value={totalPnl.toFixed(2)} />
        <Card title="Total Trades" value={totalTrades} />
        <Card title="Win Rate" value={`${winRate.toFixed(2)}%`} />
        <Card title="Profit Factor" value={profitFactor.toFixed(2)} />
        <Card title="Average Win" value={averageWin.toFixed(2)} />
        <Card title="Average Loss" value={averageLoss.toFixed(2)} />
        <Card title="Gross Profit" value={grossProfit.toFixed(2)} />
        <Card title="Gross Loss" value={grossLoss.toFixed(2)} />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Monthly Performance
        </h2>

        {months.length === 0 ? (
          <p className="text-muted-foreground">No report data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="p-3 text-left">Month</th>
                  <th className="p-3 text-left">P&L</th>
                  <th className="p-3 text-left">Trades</th>
                  <th className="p-3 text-left">Win Rate</th>
                  <th className="p-3 text-left">Best Day</th>
                  <th className="p-3 text-left">Worst Day</th>
                </tr>
              </thead>

              <tbody>
                {months.map((month) => {
                  const data = monthlyStats[month];

                  const monthWinRate =
                    data.trades > 0
                      ? (data.wins / data.trades) * 100
                      : 0;

                  return (
                    <tr key={month} className="border-b">
                      <td className="p-3 font-medium">{month}</td>

                      <td
                        className={`p-3 font-semibold ${
                          data.pnl >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.pnl.toFixed(2)}
                      </td>

                      <td className="p-3">{data.trades}</td>
                      <td className="p-3">
                        {monthWinRate.toFixed(2)}%
                      </td>

                      <td className="p-3 text-green-600">
                        {data.bestDay.toFixed(2)}
                      </td>

                      <td className="p-3 text-red-600">
                        {data.worstDay.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}