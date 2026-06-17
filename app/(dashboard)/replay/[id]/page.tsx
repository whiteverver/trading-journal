"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Brain,
  AlertTriangle,
  ImageIcon,
  Route,
} from "lucide-react";

type Trade = {
  id: string;
  symbol: string;
  side: string;
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  pnl: number | null;
  strategy: string | null;
  tag: string | null;
  notes: string | null;
  image_url: string | null;
  trade_date: string | null;
  created_at: string;
  risk?: number | null;
  reward?: number | null;
  rr_ratio?: number | null;
  emotion?: string | null;
  mistake?: string | null;
  setup?: string | null;
  timeframe?: string | null;
  market_type?: string | null;
  instrument?: string | null;
  trading_style?: string | null;
  broker?: string | null;
  stop_loss?: number | null;
  take_profit?: number | null;
};

export default function TradeReplayPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrade();
  }, []);

  async function fetchTrade() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      alert(error.message);
      router.push("/trades");
      return;
    }

    setTrade(data);
    setLoading(false);
  }

  const levels = useMemo(() => {
    if (!trade) return null;

    const entry = Number(trade.entry_price || 0);
    const exit = Number(trade.exit_price || 0);
    const move = exit - entry;
    const movePercent = entry > 0 ? (move / entry) * 100 : 0;

    return {
      entry,
      exit,
      move,
      movePercent,
      stopLoss:
        trade.stop_loss !== null && trade.stop_loss !== undefined
          ? Number(trade.stop_loss)
          : null,
      takeProfit:
        trade.take_profit !== null && trade.take_profit !== undefined
          ? Number(trade.take_profit)
          : null,
    };
  }, [trade]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading trade replay...</p>
      </div>
    );
  }

  if (!trade || !levels) return null;

  const isWin = Number(trade.pnl || 0) >= 0;
  const isBuy = trade.side === "BUY";

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] via-[#07130F] to-[#08251C] p-6 xl:col-span-3">
            <p className="text-sm font-medium text-emerald-400">
              Trade Replay V2
            </p>

            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-4xl font-bold">{trade.symbol}</h1>
                <p className="mt-2 text-sm text-gray-400">
                  {trade.trade_date || "No date"} • {trade.broker || "Broker"} •{" "}
                  {trade.market_type || "Market"}
                </p>
              </div>

              <div
                className={`rounded-2xl border px-6 py-4 ${
                  isWin
                    ? "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                    : "border-red-500/30 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.12)]"
                }`}
              >
                <p className="text-xs text-gray-400">Trade P&L</p>
                <p
                  className={`text-4xl font-bold ${
                    isWin ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ₹{Number(trade.pnl || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardContent className="p-6">
              <p className="text-sm text-gray-400">R:R Ratio</p>
              <p className="mt-3 text-5xl font-bold text-emerald-400">
                {Number(trade.rr_ratio || 0).toFixed(2)}
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Risk: ₹{Number(trade.risk || 0).toFixed(2)} / Reward: ₹
                {Number(trade.reward || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Route className="h-5 w-5 text-emerald-400" />
                Premium Trade Replay
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div
                className={`rounded-3xl border border-white/10 bg-gradient-to-br from-[#071018] to-[#05070A] p-6 ${
                  isWin
                    ? "shadow-[0_0_40px_rgba(16,185,129,0.10)]"
                    : "shadow-[0_0_40px_rgba(239,68,68,0.10)]"
                }`}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <ReplayStep
                    label="Entry"
                    value={`₹${levels.entry.toFixed(2)}`}
                    helper={isBuy ? "Long Entry" : "Short Entry"}
                    color={isBuy ? "emerald" : "red"}
                  />

                  <ReplayStep
                    label="Exit"
                    value={`₹${levels.exit.toFixed(2)}`}
                    helper={`${levels.move >= 0 ? "+" : ""}${levels.move.toFixed(
                      2
                    )} pts`}
                    color={isWin ? "emerald" : "red"}
                  />

                  <ReplayStep
                    label="Result"
                    value={isWin ? "Profit" : "Loss"}
                    helper={`${levels.movePercent >= 0 ? "+" : ""}${levels.movePercent.toFixed(
                      2
                    )}% move`}
                    color={isWin ? "emerald" : "red"}
                  />
                </div>

                <div className="my-8 rounded-3xl border border-white/10 bg-black/30 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Trade Path
                      </p>
                      <p className="text-xs text-gray-500">
                        Entry to exit movement overview
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        isWin
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/30 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {isWin ? "Profitable Trade" : "Losing Trade"}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-white/10" />

                    <div
                      className={`absolute left-[12%] right-[12%] top-1/2 h-[3px] -translate-y-1/2 rounded-full ${
                        isWin ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-4 bg-[#070A0F] ${
                            isBuy
                              ? "border-emerald-400 text-emerald-400"
                              : "border-red-400 text-red-400"
                          }`}
                        >
                          <div className="text-center leading-tight">
                            <p className="text-[9px] font-semibold uppercase">
                              {trade.side}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">Entry</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          ₹{levels.entry.toFixed(2)}
                        </p>
                      </div>

                      <div className="mx-10 w-60">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                          <p className="text-xs text-gray-500">Move</p>
                          <p
                            className={`mt-1 text-3xl font-bold ${
                              isWin ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {levels.move >= 0 ? "+" : ""}
                            {levels.move.toFixed(2)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {levels.movePercent >= 0 ? "+" : ""}
                            {levels.movePercent.toFixed(2)}%
                          </p>

                          <span
                            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs ${
                              isWin
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                : "border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {isWin ? "+" : "-"}₹
                            {Math.abs(Number(trade.pnl || 0)).toFixed(2)}{" "}
                            {isWin ? "Profit" : "Loss"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-4 bg-[#070A0F] ${
                            isWin
                              ? "border-emerald-400 text-emerald-400"
                              : "border-red-400 text-red-400"
                          }`}
                        >
                          <div className="text-center leading-tight">
                            <p className="text-[9px] font-semibold uppercase">
                              Exit
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">Exit</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          ₹{levels.exit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <MiniBox title="Side" value={trade.side} />
                  <MiniBox title="Entry" value={`₹${levels.entry.toFixed(2)}`} />
                  <MiniBox title="Exit" value={`₹${levels.exit.toFixed(2)}`} />
                  <MiniBox
                    title="Qty / Lots"
                    value={String(trade.quantity || 0)}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <MiniBox
                    title="R:R"
                    value={Number(trade.rr_ratio || 0).toFixed(2)}
                  />
                  <MiniBox title="Setup" value={trade.setup || "No Setup"} />
                  <MiniBox title="Emotion" value={trade.emotion || "No Emotion"} />
                  <MiniBox
                    title="Mistake"
                    value={trade.mistake || "No Mistake"}
                    danger={!!trade.mistake && trade.mistake !== "No Mistake"}
                  />
                </div>

                {(levels.stopLoss !== null || levels.takeProfit !== null) && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {levels.stopLoss !== null && (
                      <MiniBox
                        title="Stop Loss"
                        value={`₹${levels.stopLoss.toFixed(2)}`}
                        danger
                      />
                    )}

                    {levels.takeProfit !== null && (
                      <MiniBox
                        title="Take Profit"
                        value={`₹${levels.takeProfit.toFixed(2)}`}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/10 bg-[#0B111C]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ImageIcon className="h-5 w-5 text-emerald-400" />
                  Screenshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trade.image_url ? (
                  <img
                    src={trade.image_url}
                    alt="Trade screenshot"
                    className="h-64 w-full rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <p className="text-sm text-gray-500">
                      No screenshot attached
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-[#0B111C]">
              <CardHeader>
                <CardTitle className="text-white">Trade Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge label={trade.setup || "No Setup"} />
                <Badge label={trade.timeframe || "No Timeframe"} />
                <Badge label={trade.instrument || "Instrument"} />
                <Badge label={trade.trading_style || "Style"} />
                <Badge label={trade.emotion || "No Emotion"} />
                <Badge
                  label={trade.mistake || "No Mistake"}
                  danger={!!trade.mistake && trade.mistake !== "No Mistake"}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-4">
          <StatCard
            title="Entry Price"
            value={`₹${Number(trade.entry_price || 0).toFixed(2)}`}
            icon={<TrendingUp />}
          />
          <StatCard
            title="Exit Price"
            value={`₹${Number(trade.exit_price || 0).toFixed(2)}`}
            icon={<TrendingDown />}
            positive={isWin}
          />
          <StatCard
            title="Risk"
            value={`₹${Number(trade.risk || 0).toFixed(2)}`}
            icon={<Shield />}
            positive={false}
          />
          <StatCard
            title="Reward"
            value={`₹${Number(trade.reward || 0).toFixed(2)}`}
            icon={<Target />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-purple-400" />
                Trade Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-gray-300">
                {trade.notes || "No notes added for this trade."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-[#0B111C] to-[#231313]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Replay Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReviewBox
                title="Execution"
                value={
                  isWin
                    ? "This trade closed positive. Review whether the exit followed the original plan."
                    : "This trade closed negative. Check if stop loss, risk and entry timing were correct."
                }
                danger={!isWin}
              />
              <ReviewBox
                title="Psychology"
                value={
                  trade.emotion
                    ? `Emotion recorded: ${trade.emotion}. Compare this with your result.`
                    : "No emotion recorded. Add emotions to improve psychology analysis."
                }
              />
              <ReviewBox
                title="Mistake"
                value={
                  trade.mistake && trade.mistake !== "No Mistake"
                    ? `Mistake found: ${trade.mistake}. Avoid repeating this setup mistake.`
                    : "No major mistake recorded."
                }
                danger={!!trade.mistake && trade.mistake !== "No Mistake"}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ReplayStep({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: string;
  helper: string;
  color: "emerald" | "red";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        color === "emerald"
          ? "border-emerald-500/20 bg-emerald-500/10"
          : "border-red-500/20 bg-red-500/10"
      }`}
    >
      <p
        className={`text-xs ${
          color === "emerald" ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold ${
          color === "emerald" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    </div>
  );
}

function MiniBox({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p
        className={`mt-1 font-bold ${
          danger ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Badge({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs ${
        danger
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {label}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  positive = true,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="flex min-h-[120px] items-center justify-between p-5">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 text-gray-300">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ReviewBox({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-red-500/20 bg-red-500/10"
          : "border-emerald-500/20 bg-emerald-500/10"
      }`}
    >
      <p className={danger ? "text-xs text-red-300" : "text-xs text-emerald-300"}>
        {title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-gray-300">{value}</p>
    </div>
  );
}