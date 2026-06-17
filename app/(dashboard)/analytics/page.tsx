"use client";

import ProLock from "@/components/pro-lock";
import { useSubscription } from "@/hooks/use-subscription";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const { loading: subscriptionLoading, isPro } = useSubscription();

  const [trades, setTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);

  useEffect(() => {
    if (subscriptionLoading) return;
    if (!isPro) return;

    getTrades();
  }, [subscriptionLoading, isPro]);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: true });

    if (error) {
      alert(error.message);
      setTradesLoading(false);
      return;
    }

    setTrades(data || []);
    setTradesLoading(false);
  }

  if (subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        Loading...
      </div>
    );
  }

  if (!isPro) {
    return (
      <ProLock
        title="Unlock Advanced Analytics"
        description="Upgrade to TradePilot Pro to access advanced trading analytics, performance metrics, win rate, profit factor, expectancy, drawdown and strategy insights."
      />
    );
  }

  if (tradesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        Loading analytics...
      </div>
    );
  }

  const totalTrades = trades.length;

  const totalPnl = trades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const winningTrades = trades.filter((trade) => Number(trade.pnl) > 0);
  const losingTrades = trades.filter((trade) => Number(trade.pnl) < 0);

  const winRate = totalTrades > 0 ? winningTrades.length / totalTrades : 0;

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

  const lossRate = 1 - winRate;

  const expectancy = averageWin * winRate - averageLoss * lossRate;

  const largestWin =
    winningTrades.length > 0
      ? Math.max(...winningTrades.map((trade) => Number(trade.pnl)))
      : 0;

  const largestLoss =
    losingTrades.length > 0
      ? Math.min(...losingTrades.map((trade) => Number(trade.pnl)))
      : 0;

  let peak = 0;
  let equity = 0;
  let maxDrawdown = 0;

  trades.forEach((trade) => {
    equity += Number(trade.pnl || 0);

    if (equity > peak) peak = equity;

    const drawdown = peak - equity;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Total P&L" value={totalPnl.toFixed(2)} />
        <Card title="Total Trades" value={totalTrades} />
        <Card title="Win Rate" value={`${(winRate * 100).toFixed(2)}%`} />

        <Card title="Profit Factor" value={profitFactor.toFixed(2)} />
        <Card title="Expectancy" value={expectancy.toFixed(2)} />
        <Card title="Max Drawdown" value={maxDrawdown.toFixed(2)} />

        <Card title="Average Win" value={averageWin.toFixed(2)} />
        <Card title="Average Loss" value={averageLoss.toFixed(2)} />
        <Card title="Largest Win" value={largestWin.toFixed(2)} />

        <Card title="Largest Loss" value={largestLoss.toFixed(2)} />
        <Card title="Winning Trades" value={winningTrades.length} />
        <Card title="Losing Trades" value={losingTrades.length} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}