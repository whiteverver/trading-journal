"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*");

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
    totalTrades > 0
      ? ((winningTrades.length / totalTrades) * 100).toFixed(2)
      : "0";

  const largestWin =
    winningTrades.length > 0
      ? Math.max(...winningTrades.map((trade) => Number(trade.pnl)))
      : 0;

  const largestLoss =
    losingTrades.length > 0
      ? Math.min(...losingTrades.map((trade) => Number(trade.pnl)))
      : 0;

  const avgWinner =
    winningTrades.length > 0
      ? (
          winningTrades.reduce(
            (sum, trade) => sum + Number(trade.pnl),
            0
          ) / winningTrades.length
        ).toFixed(2)
      : "0";

  const avgLoser =
    losingTrades.length > 0
      ? (
          losingTrades.reduce(
            (sum, trade) => sum + Number(trade.pnl),
            0
          ) / losingTrades.length
        ).toFixed(2)
      : "0";

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total PnL" value={totalPnl.toFixed(2)} />
        <Card title="Total Trades" value={totalTrades} />
        <Card title="Win Rate" value={`${winRate}%`} />
        <Card title="Winning Trades" value={winningTrades.length} />
        <Card title="Losing Trades" value={losingTrades.length} />
        <Card title="Largest Win" value={largestWin} />
        <Card title="Largest Loss" value={largestLoss} />
        <Card title="Average Winner" value={avgWinner} />
        <Card title="Average Loser" value={avgLoser} />
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
    <div className="border rounded-xl p-5 bg-white shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}