"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PnlChart from "@/components/PnlChart";
import RecentTrades from "@/components/RecentTrades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    async function getTrades() {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        alert(error.message);
        return;
      }

      setTrades(data || []);
    }

    getTrades();
  }, []);

  const totalTrades = trades.length;

  const totalPnl = trades.reduce(
    (sum, t) => sum + Number(t.pnl || 0),
    0
  );

  const winningTrades = trades.filter((t) => Number(t.pnl) > 0).length;
  const losingTrades = trades.filter((t) => Number(t.pnl) < 0).length;

  const winRate =
    totalTrades > 0
      ? Math.round((winningTrades / totalTrades) * 100)
      : 0;

  const bestTrade =
    trades.length > 0
      ? Math.max(...trades.map((t) => Number(t.pnl || 0)))
      : 0;

  const worstTrade =
    trades.length > 0
      ? Math.min(...trades.map((t) => Number(t.pnl || 0)))
      : 0;

  let runningTotal = 0;

  const chartData = trades.map((trade, index) => {
    runningTotal += Number(trade.pnl || 0);

    return {
      trade: index + 1,
      equity: runningTotal,
    };
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Trading Journal Dashboard
            </h1>

            <p className="text-muted-foreground mt-2">
              Track your performance, strategy, tags and trading edge.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/trades/new"
              className="bg-black text-white px-5 py-3 rounded-lg dark:bg-white dark:text-black"
            >
              Add Trade
            </Link>

            <Link
              href="/import"
              className="border px-5 py-3 rounded-lg"
            >
              Import CSV
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total P&L" value={`$${totalPnl.toFixed(2)}`} />
          <StatCard title="Win Rate" value={`${winRate}%`} />
          <StatCard title="Total Trades" value={totalTrades} />
          <StatCard title="Winning Trades" value={winningTrades} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Losing Trades" value={losingTrades} />
          <StatCard title="Best Trade" value={`$${bestTrade.toFixed(2)}`} />
          <StatCard title="Worst Trade" value={`$${worstTrade.toFixed(2)}`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 border rounded-xl p-5 bg-card">
            <h2 className="text-xl font-bold mb-4">Equity Curve</h2>
            <PnlChart data={chartData} />
          </div>

          <div className="border rounded-xl p-5 bg-card">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>

            <div className="grid gap-3">
              <Link className="border p-4 rounded-lg hover:bg-muted" href="/trades">
                View All Trades
              </Link>

              <Link className="border p-4 rounded-lg hover:bg-muted" href="/analytics">
                Analytics
              </Link>

              <Link className="border p-4 rounded-lg hover:bg-muted" href="/calendar">
                Calendar View
              </Link>

              <Link className="border p-4 rounded-lg hover:bg-muted" href="/strategies">
                Strategy Analytics
              </Link>

              <Link className="border p-4 rounded-lg hover:bg-muted" href="/tags">
                Tag Analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card">
          <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
          <RecentTrades trades={trades.slice(-5).reverse()} />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}