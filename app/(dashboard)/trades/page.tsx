"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TradeFilters from "@/components/TradeFilters";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);

  const [symbolFilter, setSymbolFilter] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("all");

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

    const { error } = await supabase.from("trades").delete().eq("id", id);

    if (error) {
      alert("Failed to delete trade");
      return;
    }

    getTrades();
  }

  useEffect(() => {
    getTrades();
  }, []);

  const filteredTrades = trades.filter((trade) => {
    const symbolMatch =
      !symbolFilter ||
      trade.symbol?.toLowerCase().includes(symbolFilter.toLowerCase());

    const strategyMatch =
      !strategyFilter ||
      trade.strategy?.toLowerCase().includes(strategyFilter.toLowerCase());

    const tagMatch =
      !tagFilter ||
      trade.tag?.toLowerCase().includes(tagFilter.toLowerCase());

    const resultMatch =
      resultFilter === "all"
        ? true
        : resultFilter === "win"
        ? Number(trade.pnl) > 0
        : Number(trade.pnl) < 0;

    return symbolMatch && strategyMatch && tagMatch && resultMatch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Trades</h1>

        <Link
          href="/trades/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Trade
        </Link>
      </div>

      <TradeFilters
        symbolFilter={symbolFilter}
        setSymbolFilter={setSymbolFilter}
        strategyFilter={strategyFilter}
        setStrategyFilter={setStrategyFilter}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
      />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted">
              <th className="p-3 text-left">Symbol</th>
              <th className="p-3 text-left">Side</th>
              <th className="p-3 text-left">Strategy</th>
              <th className="p-3 text-left">Tag</th>
              <th className="p-3 text-left">PnL</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-muted-foreground"
                >
                  No trades found
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b">
                  <td className="p-3">{trade.symbol}</td>

                  <td className="p-3">
                    <span
                      className={
                        trade.side === "BUY"
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {trade.side}
                    </span>
                  </td>

                  <td className="p-3">{trade.strategy || "-"}</td>
                  <td className="p-3">{trade.tag || "-"}</td>

                  <td
                    className={`p-3 font-semibold ${
                      Number(trade.pnl) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Number(trade.pnl || 0).toFixed(2)}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        View
                      </Link>

                      <Link
                        href={`/trades/${trade.id}/edit`}
                        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteTrade(trade.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
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