"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TradeDetailsPage() {
  const params = useParams();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function getTrade() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("id", tradeId)
      .single();

    if (error) {
      console.error(error);
    }

    setTrade(data);
    setLoading(false);
  }

  useEffect(() => {
    if (tradeId) {
      getTrade();
    }
  }, [tradeId]);

  if (loading) {
    return <div className="p-10">Loading trade...</div>;
  }

  if (!trade) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-4">Trade not found</h1>

        <Link
          href="/trades"
          className="text-blue-600 underline"
        >
          Back to Trades
        </Link>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {trade.symbol} Details
        </h1>

        <div className="flex gap-2">
          <Link
            href={`/trades/${trade.id}/edit`}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Edit
          </Link>

          <Link
            href="/trades"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Symbol" value={trade.symbol} />
        <InfoCard label="Side" value={trade.side} />
        <InfoCard label="Entry" value={trade.entry_price} />
        <InfoCard label="Exit" value={trade.exit_price} />
        <InfoCard label="Quantity" value={trade.quantity} />
        <InfoCard label="Strategy" value={trade.strategy} />
        <InfoCard label="Tag" value={trade.tag} />

        <div className="border rounded p-4">
          <p className="text-gray-500 text-sm">PnL</p>
          <p
            className={`text-xl font-semibold ${
              Number(trade.pnl) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {trade.pnl}
          </p>
        </div>
      </div>

      <div className="border rounded p-4">
        <p className="text-gray-500 text-sm mb-2">
          Notes
        </p>

        <p>{trade.notes || "No notes added."}</p>
      </div>

      

      {trade.image_url && (
        <div className="border rounded p-4">
          <p className="text-gray-500 text-sm mb-3">
            Screenshot
          </p>

          <img
            src={trade.image_url}
            alt="Trade Screenshot"
            className="w-full rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="border rounded p-4">
      <p className="text-gray-500 text-sm">
        {label}
      </p>

      <p className="text-xl font-semibold">
        {value || "-"}
      </p>
    </div>
  );
}