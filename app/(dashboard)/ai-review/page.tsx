"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  Brain,
  Shield,
  Target,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
} from "lucide-react";

type Trade = {
  id: string;
  symbol: string;
  pnl: number | null;
  trade_date: string | null;
  created_at: string;
  strategy?: string | null;
  setup?: string | null;
  emotion?: string | null;
  mistake?: string | null;
  rr_ratio?: number | null;
  risk?: number | null;
  reward?: number | null;
};

export default function AIReviewPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("AI review trades error:", error.message);
      setTrades([]);
    } else {
      setTrades(data || []);
    }

    setLoading(false);
  }

  const analysis = useMemo(() => {
    const totalTrades = trades.length;
    const pnlValues = trades.map((t) => Number(t.pnl || 0));
    const wins = pnlValues.filter((p) => p > 0);
    const losses = pnlValues.filter((p) => p < 0);

    const totalPnl = pnlValues.reduce((a, b) => a + b, 0);
    const grossProfit = wins.reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));

    const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

    const emotionalTrades = trades.filter(
      (t) => t.emotion && t.emotion.trim() !== ""
    ).length;

    const mistakeTrades = trades.filter(
      (t) => t.mistake && t.mistake.trim() !== ""
    ).length;

    const lowRRTrades = trades.filter(
      (t) => Number(t.rr_ratio || 0) > 0 && Number(t.rr_ratio || 0) < 1.5
    ).length;

    const bigLosses = trades.filter((t) => Number(t.pnl || 0) < -200).length;

    let revengeTrades = 0;
    for (let i = 1; i < trades.length; i++) {
      const previousLoss = Number(trades[i - 1].pnl || 0) < 0;
      const currentLoss = Number(trades[i].pnl || 0) < 0;
      if (previousLoss && currentLoss) revengeTrades++;
    }

    const tradesByDate = new Map<string, number>();
    trades.forEach((trade) => {
      const date = new Date(trade.trade_date || trade.created_at)
        .toISOString()
        .split("T")[0];

      tradesByDate.set(date, (tradesByDate.get(date) || 0) + 1);
    });

    const overTradingDays = Array.from(tradesByDate.values()).filter(
      (count) => count >= 5
    ).length;

    const disciplineScore = Math.max(
      0,
      Math.round(100 - (mistakeTrades / Math.max(totalTrades, 1)) * 100)
    );

    const riskScore = Math.max(
      0,
      Math.round(
        100 -
          (lowRRTrades / Math.max(totalTrades, 1)) * 50 -
          (bigLosses / Math.max(totalTrades, 1)) * 50
      )
    );

    const psychologyScore = Math.max(
      0,
      Math.round(100 - (emotionalTrades / Math.max(totalTrades, 1)) * 70)
    );

    const consistencyScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          winRate * 0.4 + Math.min(profitFactor * 20, 35) + (totalPnl > 0 ? 25 : 5)
        )
      )
    );

    const executionScore = Math.max(
      0,
      Math.round(
        100 -
          (revengeTrades / Math.max(totalTrades, 1)) * 50 -
          (overTradingDays / Math.max(tradesByDate.size, 1)) * 40
      )
    );

    const overallScore = Math.round(
      (disciplineScore +
        riskScore +
        psychologyScore +
        consistencyScore +
        executionScore) /
        5
    );

    return {
      totalTrades,
      totalPnl,
      wins: wins.length,
      losses: losses.length,
      winRate,
      profitFactor,
      emotionalTrades,
      mistakeTrades,
      lowRRTrades,
      revengeTrades,
      overTradingDays,
      disciplineScore,
      riskScore,
      psychologyScore,
      consistencyScore,
      executionScore,
      overallScore,
    };
  }, [trades]);

  const emotionData = useMemo(() => getFrequency(trades, "emotion"), [trades]);
  const mistakeData = useMemo(() => getFrequency(trades, "mistake"), [trades]);

  const setupData = useMemo(() => {
    const map = new Map<string, { pnl: number; trades: number; wins: number }>();

    trades.forEach((trade) => {
      const setup = trade.setup || trade.strategy || "Unknown";
      const current = map.get(setup) || { pnl: 0, trades: 0, wins: 0 };

      map.set(setup, {
        pnl: current.pnl + Number(trade.pnl || 0),
        trades: current.trades + 1,
        wins: current.wins + (Number(trade.pnl || 0) > 0 ? 1 : 0),
      });
    });

    return Array.from(map.entries())
      .map(([setup, data]) => ({
        setup,
        pnl: data.pnl,
        trades: data.trades,
        winRate: data.trades ? (data.wins / data.trades) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 6);
  }, [trades]);

  const rrData = useMemo(() => {
    const buckets = {
      "Below 1": 0,
      "1 - 1.5": 0,
      "1.5 - 2": 0,
      "2 - 3": 0,
      "3+": 0,
    };

    trades.forEach((trade) => {
      const rr = Number(trade.rr_ratio || 0);
      if (rr <= 0) return;
      if (rr < 1) buckets["Below 1"]++;
      else if (rr < 1.5) buckets["1 - 1.5"]++;
      else if (rr < 2) buckets["1.5 - 2"]++;
      else if (rr < 3) buckets["2 - 3"]++;
      else buckets["3+"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [trades]);

  const radarData = [
    { metric: "Consistency", value: analysis.consistencyScore },
    { metric: "Discipline", value: analysis.disciplineScore },
    { metric: "Risk", value: analysis.riskScore },
    { metric: "Psychology", value: analysis.psychologyScore },
    { metric: "Execution", value: analysis.executionScore },
  ];

  const bestSetup = setupData[0];
  const worstSetup = [...setupData].sort((a, b) => a.pnl - b.pnl)[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading AI coach...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            Advanced AI Coach
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Trading Behavior Review
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Local AI-style analysis based on your trading behavior, risk, emotions,
            mistakes, and execution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ScoreCard title="Overall" value={analysis.overallScore} icon={<Brain />} />
          <ScoreCard title="Consistency" value={analysis.consistencyScore} icon={<Flame />} />
          <ScoreCard title="Discipline" value={analysis.disciplineScore} icon={<Shield />} />
          <ScoreCard title="Risk" value={analysis.riskScore} icon={<Target />} />
          <ScoreCard title="Psychology" value={analysis.psychologyScore} icon={<Activity />} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Win Rate"
            value={`${analysis.winRate.toFixed(1)}%`}
            positive
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Profit Factor"
            value={analysis.profitFactor.toFixed(2)}
            positive
            icon={<Zap className="h-5 w-5" />}
          />
          <StatCard
            title="Low R:R Trades"
            value={analysis.lowRRTrades}
            positive={false}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            title="Revenge Trades"
            value={analysis.revengeTrades}
            positive={false}
            icon={<TrendingDown className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">AI Coach Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CoachBox
                title="Strength"
                type="good"
                value={
                  analysis.winRate >= 50
                    ? `Your win rate is ${analysis.winRate.toFixed(
                        1
                      )}%, which shows solid trade selection.`
                    : bestSetup
                    ? `${bestSetup.setup} is your strongest setup with $${bestSetup.pnl.toFixed(
                        2
                      )} P&L.`
                    : "Add more trades to generate better strengths."
                }
              />

              <CoachBox
                title="Weakness"
                type="bad"
                value={
                  analysis.lowRRTrades > 0
                    ? `${analysis.lowRRTrades} trades have low R:R below 1.5. Improve risk-to-reward before entry.`
                    : analysis.mistakeTrades > 0
                    ? `${analysis.mistakeTrades} trades include recorded mistakes. Review them before next session.`
                    : "No major weakness detected yet."
                }
              />

              <CoachBox
                title="Recommendation"
                type="neutral"
                value={
                  analysis.revengeTrades > 0
                    ? "Avoid taking another trade immediately after a loss. Add a cooldown rule after every losing trade."
                    : analysis.overTradingDays > 0
                    ? "Reduce overtrading. Limit your number of trades per day to protect discipline."
                    : bestSetup
                    ? `Focus more on ${bestSetup.setup} and avoid setups with negative P&L.`
                    : "Keep logging trades with emotions, mistakes, setup, and R:R for better coaching."
                }
              />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Behavior Radar</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Emotion Frequency" data={emotionData} dataKey="count" xKey="name" />
          <ChartCard title="Mistake Frequency" data={mistakeData} dataKey="count" xKey="name" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/10 bg-[#0B111C]">
            <CardHeader>
              <CardTitle className="text-white">Setup Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Setup</th>
                      <th className="px-4 py-3 text-right">Trades</th>
                      <th className="px-4 py-3 text-right">Win Rate</th>
                      <th className="px-4 py-3 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setupData.map((item) => (
                      <tr key={item.setup} className="border-t border-white/10">
                        <td className="px-4 py-3 text-white">{item.setup}</td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.trades}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.winRate.toFixed(1)}%
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            item.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          ${item.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {setupData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                          No setup data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <ChartCard title="R:R Distribution" data={rrData} dataKey="count" xKey="range" />

        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <InsightCard
            title="Best Setup"
            value={
              bestSetup
                ? `${bestSetup.setup} generated $${bestSetup.pnl.toFixed(2)} across ${
                    bestSetup.trades
                  } trades.`
                : "No best setup found yet."
            }
            positive
          />

          <InsightCard
            title="Worst Setup"
            value={
              worstSetup
                ? `${worstSetup.setup} generated $${worstSetup.pnl.toFixed(2)} across ${
                    worstSetup.trades
                  } trades.`
                : "No worst setup found yet."
            }
            positive={false}
          />
        </div>
      </main>
    </div>
  );
}

function getFrequency(trades: Trade[], key: "emotion" | "mistake") {
  const map = new Map<string, number>();

  trades.forEach((trade) => {
    const value = trade[key];
    if (!value || !value.trim()) return;
    map.set(value, (map.get(value) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function ScoreCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{title}</p>
          <div className="rounded-xl bg-white/5 p-2 text-emerald-400">{icon}</div>
        </div>

        <p className="mt-4 text-4xl font-bold text-emerald-400">{value}</p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  value,
  icon,
  positive = true,
}: {
  title: string;
  value: string | number;
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

function CoachBox({
  title,
  value,
  type,
}: {
  title: string;
  value: string;
  type: "good" | "bad" | "neutral";
}) {
  const color =
    type === "good"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : type === "bad"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
  xKey,
}: {
  title: string;
  data: any[];
  dataKey: string;
  xKey: string;
}) {
  const hasEnoughData = data.length >= 2;

  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>

      <CardContent className="h-[320px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <p className="text-sm text-gray-400">No data available yet.</p>
          </div>
        ) : !hasEnoughData ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <p className="text-sm text-gray-400">{data[0][xKey]}</p>
              <p className="mt-3 text-5xl font-bold text-emerald-400">
                {data[0][dataKey]}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Add more trades to generate a full chart.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey={xKey} stroke="#6B7280" />
              <YAxis stroke="#6B7280" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#0B111C",
                  border: "1px solid #1F2937",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey={dataKey} fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({
  title,
  value,
  positive,
}: {
  title: string;
  value: string;
  positive: boolean;
}) {
  return (
    <Card
      className={`border-white/10 ${
        positive
          ? "bg-gradient-to-br from-[#0B111C] to-[#08251C]"
          : "bg-gradient-to-br from-[#0B111C] to-[#281313]"
      }`}
    >
      <CardContent className="p-6">
        <p className={positive ? "text-emerald-400" : "text-red-400"}>
          {title}
        </p>
        <p className="mt-3 text-lg font-semibold leading-relaxed text-white">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}