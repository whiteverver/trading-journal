"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PnlChart from "@/components/PnlChart";
import RecentTrades from "@/components/RecentTrades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    async function getTrades() {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: true });

      setTrades(data || []);
    }

    getTrades();
  }, []);

  const totalTrades = trades.length;
  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
  const winningTrades = trades.filter((t) => Number(t.pnl) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

  let runningTotal = 0;

  const chartData = trades.map((trade, index) => {
    runningTotal += Number(trade.pnl || 0);
    return {
      trade: index + 1,
      equity: runningTotal,
    };
  });

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">
          Trading Journal Dashboard
        </h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalPnl}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{winRate}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalTrades}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Winning Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{winningTrades}</p>
            </CardContent>
          </Card>
        </div>

        <PnlChart data={chartData} />
        <RecentTrades trades={trades} />
      </main>
    </div>
  );
}