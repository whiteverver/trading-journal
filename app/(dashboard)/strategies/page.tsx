"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StrategiesPage() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTrades(data || []);
  }

  const strategyStats: Record<
    string,
    {
      trades: number;
      wins: number;
      losses: number;
      pnl: number;
      grossProfit: number;
      grossLoss: number;
    }
  > = {};

  trades.forEach((trade) => {
    const strategy = trade.strategy || "No Strategy";
    const pnl = Number(trade.pnl || 0);

    if (!strategyStats[strategy]) {
      strategyStats[strategy] = {
        trades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        grossProfit: 0,
        grossLoss: 0,
      };
    }

    strategyStats[strategy].trades += 1;
    strategyStats[strategy].pnl += pnl;

    if (pnl > 0) {
      strategyStats[strategy].wins += 1;
      strategyStats[strategy].grossProfit += pnl;
    }

    if (pnl < 0) {
      strategyStats[strategy].losses += 1;
      strategyStats[strategy].grossLoss += Math.abs(pnl);
    }
  });

  const strategies = Object.entries(strategyStats).sort(
    (a, b) => b[1].pnl - a[1].pnl
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Strategy Performance</h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {strategies.length === 0 ? (
          <p className="text-muted-foreground">No strategy data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="p-3 text-left">Strategy</th>
                  <th className="p-3 text-left">Trades</th>
                  <th className="p-3 text-left">Win Rate</th>
                  <th className="p-3 text-left">Total P&L</th>
                  <th className="p-3 text-left">Average Win</th>
                  <th className="p-3 text-left">Average Loss</th>
                  <th className="p-3 text-left">Profit Factor</th>
                </tr>
              </thead>

              <tbody>
                {strategies.map(([strategy, data]) => {
                  const winRate =
                    data.trades > 0 ? (data.wins / data.trades) * 100 : 0;

                  const averageWin =
                    data.wins > 0 ? data.grossProfit / data.wins : 0;

                  const averageLoss =
                    data.losses > 0 ? data.grossLoss / data.losses : 0;

                  const profitFactor =
                    data.grossLoss > 0
                      ? data.grossProfit / data.grossLoss
                      : 0;

                  return (
                    <tr key={strategy} className="border-b">
                      <td className="p-3 font-medium">{strategy}</td>
                      <td className="p-3">{data.trades}</td>
                      <td className="p-3">{winRate.toFixed(2)}%</td>

                      <td
                        className={`p-3 font-semibold ${
                          data.pnl >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.pnl.toFixed(2)}
                      </td>

                      <td className="p-3 text-green-600">
                        {averageWin.toFixed(2)}
                      </td>

                      <td className="p-3 text-red-600">
                        {averageLoss.toFixed(2)}
                      </td>

                      <td className="p-3">
                        {profitFactor.toFixed(2)}
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