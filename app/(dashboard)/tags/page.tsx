"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TagsPage() {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase.from("trades").select("*");

    if (error) {
      alert(error.message);
      return;
    }

    setTrades(data || []);
  }

  const tagStats = trades.reduce((acc: any, trade: any) => {
    const tag = trade.tag || "No Tag";

    if (!acc[tag]) {
      acc[tag] = {
        trades: 0,
        wins: 0,
        pnl: 0,
      };
    }

    acc[tag].trades += 1;
    acc[tag].pnl += Number(trade.pnl || 0);

    if (Number(trade.pnl) > 0) {
      acc[tag].wins += 1;
    }

    return acc;
  }, {});

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Tag Analytics</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3">Tag</th>
            <th className="border p-3">Trades</th>
            <th className="border p-3">Win Rate</th>
            <th className="border p-3">Total PnL</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(tagStats).map(([tag, stats]: any) => (
            <tr key={tag}>
              <td className="border p-3">{tag}</td>
              <td className="border p-3">{stats.trades}</td>
              <td className="border p-3">
                {((stats.wins / stats.trades) * 100).toFixed(2)}%
              </td>
              <td
                className={`border p-3 font-semibold ${
                  stats.pnl >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}