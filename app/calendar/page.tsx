"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CalendarPage() {
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

  const dailyPnl: Record<string, number> = {};

  trades.forEach((trade) => {
    const date = trade.trade_date || trade.created_at?.split("T")[0];

    if (!date) return;

    dailyPnl[date] = (dailyPnl[date] || 0) + Number(trade.pnl || 0);
  });

  const days = Object.keys(dailyPnl).sort();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Calendar View</h1>

      {days.length === 0 ? (
        <p className="text-gray-500">No trading data found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {days.map((day) => (
            <div key={day} className="border rounded-xl p-5 bg-white shadow">
              <p className="text-gray-500 text-sm">{day}</p>

              <h2
                className={`text-2xl font-bold mt-2 ${
                  dailyPnl[day] >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {dailyPnl[day].toFixed(2)}
              </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}