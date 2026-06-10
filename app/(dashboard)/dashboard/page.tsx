"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: false });

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

  const strategyStats: Record<string, { pnl: number; trades: number; wins: number }> =
    {};

  const tagStats: Record<string, { pnl: number; trades: number; wins: number }> =
    {};

  const monthlyPnl: Record<string, number> = {};

  trades.forEach((trade) => {
    const pnl = Number(trade.pnl || 0);
    const strategy = trade.strategy || "No Strategy";
    const tag = trade.tag || "No Tag";
    const date = trade.trade_date || trade.created_at?.split("T")[0];

    if (!strategyStats[strategy]) {
      strategyStats[strategy] = { pnl: 0, trades: 0, wins: 0 };
    }

    strategyStats[strategy].pnl += pnl;
    strategyStats[strategy].trades += 1;
    if (pnl > 0) strategyStats[strategy].wins += 1;

    if (!tagStats[tag]) {
      tagStats[tag] = { pnl: 0, trades: 0, wins: 0 };
    }

    tagStats[tag].pnl += pnl;
    tagStats[tag].trades += 1;
    if (pnl > 0) tagStats[tag].wins += 1;

    if (date) {
      const month = date.slice(0, 7);
      monthlyPnl[month] = (monthlyPnl[month] || 0) + pnl;
    }
  });

  const bestStrategy =
    Object.entries(strategyStats).sort((a, b) => b[1].pnl - a[1].pnl)[0] ||
    null;

  const bestTag =
    Object.entries(tagStats).sort((a, b) => b[1].pnl - a[1].pnl)[0] || null;

  const months = Object.entries(monthlyPnl)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4);

  const recentTrades = trades.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Trading Journal Overview
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Performance Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Track your edge, review performance, and identify which trading
              setups are actually making money.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/trades/new"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Trade
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-muted"
            >
              <BarChart3 size={18} />
              Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          title="Total P&L"
          value={totalPnl.toFixed(2)}
          trend={totalPnl >= 0 ? "up" : "down"}
        />
        <MetricCard title="Win Rate" value={`${winRate.toFixed(2)}%`} />
        <MetricCard title="Profit Factor" value={profitFactor.toFixed(2)} />
        <MetricCard title="Total Trades" value={totalTrades} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Trades</h2>
              <p className="text-sm text-muted-foreground">
                Latest journal entries
              </p>
            </div>

            <Link
              href="/trades"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentTrades.length === 0 ? (
            <p className="text-muted-foreground">No trades found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Symbol</th>
                    <th className="pb-3 text-left">Side</th>
                    <th className="pb-3 text-left">Strategy</th>
                    <th className="pb-3 text-left">Tag</th>
                    <th className="pb-3 text-right">P&L</th>
                  </tr>
                </thead>

                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b last:border-0">
                      <td className="py-4 font-semibold">{trade.symbol}</td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            trade.side === "BUY"
                              ? "bg-green-600/10 text-green-600"
                              : "bg-red-600/10 text-red-600"
                          }`}
                        >
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-4">{trade.strategy || "-"}</td>
                      <td className="py-4">{trade.tag || "-"}</td>
                      <td
                        className={`py-4 text-right font-bold ${
                          Number(trade.pnl) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number(trade.pnl || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <InsightCard
            title="Best Strategy"
            name={bestStrategy ? bestStrategy[0] : "No data"}
            pnl={bestStrategy ? bestStrategy[1].pnl : 0}
            trades={bestStrategy ? bestStrategy[1].trades : 0}
            winRate={
              bestStrategy && bestStrategy[1].trades > 0
                ? (bestStrategy[1].wins / bestStrategy[1].trades) * 100
                : 0
            }
          />

          <InsightCard
            title="Best Tag"
            name={bestTag ? bestTag[0] : "No data"}
            pnl={bestTag ? bestTag[1].pnl : 0}
            trades={bestTag ? bestTag[1].trades : 0}
            winRate={
              bestTag && bestTag[1].trades > 0
                ? (bestTag[1].wins / bestTag[1].trades) * 100
                : 0
            }
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">Win / Loss Summary</h2>

          <div className="space-y-4">
            <MiniRow label="Winning Trades" value={winningTrades.length} type="win" />
            <MiniRow label="Losing Trades" value={losingTrades.length} type="loss" />
            <MiniRow label="Average Win" value={averageWin.toFixed(2)} type="win" />
            <MiniRow label="Average Loss" value={averageLoss.toFixed(2)} type="loss" />
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm xl:col-span-2">
          <h2 className="mb-5 text-xl font-semibold">Monthly Performance</h2>

          {months.length === 0 ? (
            <p className="text-muted-foreground">No monthly data found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {months.map(([month, pnl]) => (
                <div
                  key={month}
                  className={`rounded-2xl border p-5 ${
                    pnl >= 0
                      ? "border-green-600/30 bg-green-600/10"
                      : "border-red-600/30 bg-red-600/10"
                  }`}
                >
                  <p className="text-sm text-muted-foreground">{month}</p>
                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      pnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pnl.toFixed(2)}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string | number;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>

        {trend === "up" && <ArrowUpRight className="text-green-600" size={20} />}
        {trend === "down" && (
          <ArrowDownRight className="text-red-600" size={20} />
        )}
        {!trend && <TrendingUp className="text-muted-foreground" size={20} />}
      </div>

      <h2
        className={`text-3xl font-bold ${
          trend === "up"
            ? "text-green-600"
            : trend === "down"
            ? "text-red-600"
            : ""
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function InsightCard({
  title,
  name,
  pnl,
  trades,
  winRate,
}: {
  title: string;
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      <h2 className="mt-2 text-2xl font-bold">{name}</h2>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">P&L</p>
          <p
            className={`font-bold ${
              pnl >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {pnl.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Trades</p>
          <p className="font-bold">{trades}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Win Rate</p>
          <p className="font-bold">{winRate.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}

function MiniRow({
  label,
  value,
  type,
}: {
  label: string;
  value: string | number;
  type: "win" | "loss";
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`font-bold ${
          type === "win" ? "text-green-600" : "text-red-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}