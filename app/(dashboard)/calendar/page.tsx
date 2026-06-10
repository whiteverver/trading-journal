"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CalendarPage() {
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

  const dailyPnl: Record<string, number> = {};
  const monthlyPnl: Record<string, number> = {};

  trades.forEach((trade) => {
    const date = trade.trade_date || trade.created_at?.split("T")[0];

    if (!date) return;

    const pnl = Number(trade.pnl || 0);
    const month = date.slice(0, 7);

    dailyPnl[date] = (dailyPnl[date] || 0) + pnl;
    monthlyPnl[month] = (monthlyPnl[month] || 0) + pnl;
  });

  const months = Object.keys(monthlyPnl).sort().reverse();

  const totalPnl = trades.reduce(
    (sum, trade) => sum + Number(trade.pnl || 0),
    0
  );

  const profitableDays = Object.values(dailyPnl).filter(
    (pnl) => pnl > 0
  ).length;

  const losingDays = Object.values(dailyPnl).filter(
    (pnl) => pnl < 0
  ).length;

  const bestDay =
    Object.values(dailyPnl).length > 0
      ? Math.max(...Object.values(dailyPnl))
      : 0;

  const worstDay =
    Object.values(dailyPnl).length > 0
      ? Math.min(...Object.values(dailyPnl))
      : 0;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Trading Calendar</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card title="Total P&L" value={totalPnl.toFixed(2)} />
        <Card title="Profitable Days" value={profitableDays} />
        <Card title="Losing Days" value={losingDays} />
        <Card title="Best Day" value={bestDay.toFixed(2)} />
        <Card title="Worst Day" value={worstDay.toFixed(2)} />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Monthly Performance
        </h2>

        {months.length === 0 ? (
          <p className="text-muted-foreground">
            No trading data found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {months.map((month) => {
              const pnl = monthlyPnl[month];

              return (
                <div
                  key={month}
                  className={`rounded-xl border p-5 ${
                    pnl >= 0
                      ? "border-green-600/40 bg-green-600/10"
                      : "border-red-600/40 bg-red-600/10"
                  }`}
                >
                  <p className="text-sm text-muted-foreground">
                    {month}
                  </p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      pnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pnl.toFixed(2)}
                  </h3>
                </div>
              );
            })}
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