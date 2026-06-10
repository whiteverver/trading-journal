"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Journal Every Trade.
          <br />
          Improve Every Day.
        </h1>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          Track trades, analyze performance, upload screenshots,
          review strategies, and become a more consistent trader.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
          >
            Get Started Free
          </Link>

          <Link
            href="/login"
            className="border border-white px-6 py-3 rounded-lg"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-gray-800 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-3">
              Track Trades
            </h3>

            <p className="text-gray-400">
              Save entries, exits, quantity,
              screenshots and notes.
            </p>
          </div>

          <div className="border border-gray-800 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-3">
              Analyze Performance
            </h3>

            <p className="text-gray-400">
              Monitor win rate, profit,
              drawdowns and equity curve.
            </p>
          </div>

          <div className="border border-gray-800 p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-3">
              Improve Faster
            </h3>

            <p className="text-gray-400">
              Learn from mistakes using
              strategy and tag tracking.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center py-20">
        <h2 className="text-4xl font-bold mb-6">
          Ready to become a better trader?
        </h2>

        <Link
          href="/signup"
          className="bg-white text-black px-8 py-4 rounded-lg font-semibold"
        >
          Start Journaling
        </Link>
      </section>
    </main>
  );
}