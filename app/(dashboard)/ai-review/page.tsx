"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AIReviewPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    getTrades();
  }, []);

  async function getTrades() {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      alert(error.message);
      return;
    }

    setTrades(data || []);
  }

  function generateReview() {
    const totalTrades = trades.length;

    if (totalTrades === 0) {
      alert("No trades found for review.");
      return;
    }

    const winningTrades = trades.filter((t) => Number(t.pnl) > 0);
    const losingTrades = trades.filter((t) => Number(t.pnl) < 0);

    const winRate = (winningTrades.length / totalTrades) * 100;

    const grossProfit = winningTrades.reduce(
      (sum, t) => sum + Number(t.pnl || 0),
      0
    );

    const grossLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0)
    );

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const avgWin =
      winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;

    const avgLoss =
      losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

    const strategyStats: Record<string, { trades: number; pnl: number }> = {};
    const mistakeStats: Record<string, number> = {};
    const emotionStats: Record<string, number> = {};

    trades.forEach((trade) => {
      const strategy = trade.strategy || trade.setup || "No Setup";
      const mistake = trade.mistake || "No Mistake Added";
      const emotion = trade.emotion || "No Emotion Added";
      const pnl = Number(trade.pnl || 0);

      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { trades: 0, pnl: 0 };
      }

      strategyStats[strategy].trades += 1;
      strategyStats[strategy].pnl += pnl;

      mistakeStats[mistake] = (mistakeStats[mistake] || 0) + 1;
      emotionStats[emotion] = (emotionStats[emotion] || 0) + 1;
    });

    const bestSetup =
      Object.entries(strategyStats).sort((a, b) => b[1].pnl - a[1].pnl)[0]?.[0] ||
      "Not enough data";

    const worstSetup =
      Object.entries(strategyStats).sort((a, b) => a[1].pnl - b[1].pnl)[0]?.[0] ||
      "Not enough data";

    const mostCommonMistake =
      Object.entries(mistakeStats).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Not enough data";

    const mostCommonEmotion =
      Object.entries(emotionStats).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Not enough data";

    let riskScore = 5;

    if (profitFactor >= 2) riskScore += 2;
    else if (profitFactor >= 1.3) riskScore += 1;
    else if (profitFactor < 1) riskScore -= 2;

    if (winRate >= 55) riskScore += 1;
    if (avgWin > avgLoss) riskScore += 1;
    if (losingTrades.length > winningTrades.length) riskScore -= 1;

    riskScore = Math.max(1, Math.min(10, riskScore));

    const suggestions = [];

    if (profitFactor < 1) {
      suggestions.push("Your losing trades are stronger than your winning trades. Focus on cutting losses faster.");
    }

    if (winRate < 45) {
      suggestions.push("Your win rate is low. Review your entry confirmation rules before taking trades.");
    }

    if (avgLoss > avgWin) {
      suggestions.push("Average loss is bigger than average win. Improve risk-to-reward before entering trades.");
    }

    if (mostCommonMistake !== "No Mistake Added") {
      suggestions.push(`Your most repeated mistake is "${mostCommonMistake}". Track this carefully in the next 20 trades.`);
    }

    if (mostCommonEmotion !== "No Emotion Added") {
      suggestions.push(`Your most common emotion is "${mostCommonEmotion}". Avoid trading when this emotion is high.`);
    }

    if (suggestions.length === 0) {
      suggestions.push("Your trading data looks stable. Keep tracking more trades for deeper insights.");
    }

    setReview({
      totalTrades,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      bestSetup,
      worstSetup,
      mostCommonMistake,
      mostCommonEmotion,
      riskScore,
      suggestions,
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">AI Trade Review</h1>

      <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <p className="mb-4 text-muted-foreground">
          Free local review based on your last 50 trades. No paid API required.
        </p>

        <button
          onClick={generateReview}
          className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Review My Trades
        </button>
      </div>

      {review && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Risk Score" value={`${review.riskScore}/10`} />
          <Card title="Win Rate" value={`${review.winRate.toFixed(2)}%`} />
          <Card title="Profit Factor" value={review.profitFactor.toFixed(2)} />
          <Card title="Average Win" value={review.avgWin.toFixed(2)} />
          <Card title="Average Loss" value={review.avgLoss.toFixed(2)} />
          <Card title="Best Setup" value={review.bestSetup} />
          <Card title="Worst Setup" value={review.worstSetup} />
          <Card title="Common Mistake" value={review.mostCommonMistake} />
          <Card title="Common Emotion" value={review.mostCommonEmotion} />

          <div className="rounded-xl border bg-card p-5 shadow-sm md:col-span-3">
            <p className="mb-3 text-sm text-muted-foreground">
              Improvement Suggestions
            </p>

            <ul className="list-disc space-y-2 pl-5">
              {review.suggestions.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
      <h2 className="mt-2 break-words text-2xl font-bold">{value}</h2>
    </div>
  );
}