"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setTrades(data || []);
  }

  async function deleteTrade(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trade?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete trade");
      return;
    }

    getTrades();
  }

  useEffect(() => {
    getTrades();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">My Trades</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Symbol</th>
              <th className="border p-3 text-left">Side</th>
              <th className="border p-3 text-left">PnL</th>
              <th className="border p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="border p-4 text-center text-gray-500"
                >
                  No trades found
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="border p-3">{trade.symbol}</td>

                  <td className="border p-3">
                    <span
                      className={
                        trade.side === "BUY"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {trade.side}
                    </span>
                  </td>

                  <td
                    className={`border p-3 font-semibold ${
                      Number(trade.pnl) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {trade.pnl}
                  </td>

                  <td className="border p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => deleteTrade(trade.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}