"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subscription = {
  id: string;
  plan?: string | null;
  plan_name?: string | null;
  status?: string | null;
  razorpay_subscription_id?: string | null;
  razorpay_payment_id?: string | null;
  current_period_end?: string | null;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch("/api/billing/current", {
          cache: "no-store",
        });

        const data = await res.json();

        console.log("BILLING API RESPONSE:", data);

        const sub = data.subscription ?? data;

        if (sub?.status === "active") {
          setSubscription(sub);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    }

    fetchBilling();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] p-8 text-white">
        Loading...
      </div>
    );
  }

  const isActive = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-[#050816] p-8 text-white">
      <h1 className="text-3xl font-bold">Billing</h1>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-2xl font-semibold">
          {isActive ? subscription?.plan_name || "TradePilot Pro" : "Free Plan"}
        </h2>

        <p className="mt-3">
          Status:{" "}
          <span className={isActive ? "text-emerald-400" : "text-gray-400"}>
            {isActive ? "active" : "free"}
          </span>
        </p>

        <p className="mt-2">
          Plan: {isActive ? subscription?.plan_name || "TradePilot Pro" : "Free"}
        </p>

        <p className="mt-2">
          Razorpay Subscription:{" "}
          {isActive ? subscription?.razorpay_subscription_id || "N/A" : "N/A"}
        </p>

        <p className="mt-2">
          Razorpay Payment:{" "}
          {isActive ? subscription?.razorpay_payment_id || "N/A" : "N/A"}
        </p>

        <p className="mt-2">
          Renewal Date:{" "}
          {isActive ? subscription?.current_period_end || "N/A" : "N/A"}
        </p>

        {!isActive && (
          <Link
            href="/subscription"
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
          >
            Upgrade to Pro
          </Link>
        )}

        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>
    </div>
  );
}