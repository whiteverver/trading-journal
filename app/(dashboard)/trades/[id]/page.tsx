"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ImageIcon,
} from "lucide-react";

type Trade = {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  strategy: string | null;
  tag: string | null;
  notes: string | null;
  image_url: string | null;
  trade_date: string | null;
  risk: number | null;
  reward: number | null;
  rr_ratio: number | null;
  emotion: string | null;
  mistake: string | null;
  setup: string | null;
  timeframe: string | null;
  market_type: string | null;
  created_at: string;
};

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchTrade() {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("id", tradeId)
        .single();

      if (error) {
        console.error(error);
      } else {
        setTrade(data);
      }

      setLoading(false);
    }

    if (tradeId) fetchTrade();
  }, [tradeId]);

  async function deleteTrade() {
    const confirmDelete = confirm("Are you sure you want to delete this trade?");
    if (!confirmDelete || !trade) return;

    setDeleting(true);

    const { error } = await supabase.from("trades").delete().eq("id", trade.id);

    setDeleting(false);

    if (error) {
      alert("Failed to delete trade");
      console.error(error);
      return;
    }

    router.push("/trades");
  }

  function formatDate(date: string | null) {
    if (!date) return "Not added";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "Not added";
    }

    return `₹${Number(value).toFixed(2)}`;
  }

  function formatValue(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") {
      return "Not added";
    }

    return value;
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading trade...</p>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Trade not found.</p>
        <Button asChild>
          <Link href="/trades">Back to Trades</Link>
        </Button>
      </div>
    );
  }

  const isProfit = Number(trade.pnl) >= 0;

  const rrRatio =
    trade.rr_ratio ||
    (trade.risk && trade.reward ? Number(trade.reward) / Number(trade.risk) : null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/trades"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trades
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {trade.symbol}
            </h1>

            <Badge variant={trade.side === "BUY" ? "default" : "destructive"}>
              {trade.side}
            </Badge>

            <Badge variant={isProfit ? "default" : "destructive"}>
              {isProfit ? "Winning Trade" : "Losing Trade"}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-1">
            Trade Date: {formatDate(trade.trade_date)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/trades/${trade.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>

          <Button
            variant="destructive"
            onClick={deleteTrade}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-2 text-2xl font-bold ${
                isProfit ? "text-green-500" : "text-red-500"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatMoney(trade.pnl)}
            </div>
          </CardContent>
        </Card>

        <MetricCard title="Entry Price" value={formatMoney(trade.entry_price)} />
        <MetricCard title="Exit Price" value={formatMoney(trade.exit_price)} />
        <MetricCard title="Quantity" value={trade.quantity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Symbol" value={trade.symbol} />
            <DetailItem label="Side" value={trade.side} />
            <DetailItem label="Strategy" value={trade.strategy} />
            <DetailItem label="Tag" value={trade.tag} />
            <DetailItem label="Setup" value={trade.setup} />
            <DetailItem label="Timeframe" value={trade.timeframe} />
            <DetailItem label="Market Type" value={trade.market_type} />
            <DetailItem label="Trade Date" value={formatDate(trade.trade_date)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk & Reward</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Risk" value={formatMoney(trade.risk)} />
            <DetailItem label="Reward" value={formatMoney(trade.reward)} />
            <DetailItem
              label="R:R Ratio"
              value={rrRatio ? `1:${Number(rrRatio).toFixed(2)}` : "Not added"}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Psychology Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Emotion" value={trade.emotion} />
            <DetailItem label="Mistake" value={trade.mistake} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
              {formatValue(trade.notes)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screenshot</CardTitle>
        </CardHeader>
        <CardContent>
          {trade.image_url ? (
            <div className="overflow-hidden rounded-xl border bg-muted">
              <img
                src={trade.image_url}
                alt={`${trade.symbol} trade screenshot`}
                className="w-full max-h-[600px] object-contain"
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-3" />
              <p>No screenshot uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Not added"}</p>
    </div>
  );
}