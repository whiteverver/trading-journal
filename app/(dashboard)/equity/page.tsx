"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";

export default function EquityPage() {
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

  let runningPnl = 0;
  let peak = 0;
  let maxDrawdown = 0;

  const chartData = trades.map((trade, index) => {
    const pnl = Number(trade.pnl || 0);

    runningPnl += pnl;

    if (runningPnl > peak) {
      peak = runningPnl;
    }

    const drawdown = peak - runningPnl;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }

    return {
      trade: index + 1,
      date:
        trade.trade_date ||
        trade.created_at?.split("T")[0],
      equity: runningPnl,
    };
  });

  const totalPnl = runningPnl;
  const totalTrades = trades.length;

  const winningTrades = trades.filter(
    (trade) => Number(trade.pnl) > 0
  );

  const winRate =
    totalTrades > 0
      ? (winningTrades.length / totalTrades) * 100
      : 0;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Equity Curve
      </h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card
          title="Total P&L"
          value={totalPnl.toFixed(2)}
        />

        <Card
          title="Total Trades"
          value={totalTrades}
        />

        <Card
          title="Win Rate"
          value={`${winRate.toFixed(2)}%`}
        />

        <Card
          title="Max Drawdown"
          value={maxDrawdown.toFixed(2)}
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Account Growth
        </h2>

        {chartData.length === 0 ? (
          <p className="text-muted-foreground">
            No trade data found.
          </p>
        ) : (
          <div className="h-[450px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="equityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                />

                <XAxis
                  dataKey="trade"
                  stroke="#888"
                />

                <YAxis stroke="#888" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#22c55e"
                  fill="url(#equityGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
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
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}