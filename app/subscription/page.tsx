"use client";

import Script from "next/script";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  const startSubscription = async () => {
    try {
      setLoading(true);

      if (!razorpayKey) {
        alert("NEXT_PUBLIC_RAZORPAY_KEY_ID missing in .env.local");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login first");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data);
        alert(data.error || "Subscription create nahi hua");
        return;
      }

      if (!data.subscriptionId) {
        alert("Subscription ID missing");
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay script not loaded. Refresh page.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        subscription_id: data.subscriptionId,
        name: "TradePilot",
        description: "TradePilot Pro Subscription",
        theme: {
          color: "#0f172a",
        },
        handler: () => {
          alert("Subscription successful");
          window.location.href = "/dashboard";
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Subscription Error:", error);
      alert("Something went wrong. Check console/terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-3">TradePilot Pro</h1>

          <p className="text-gray-400 mb-6">
            Unlock advanced analytics, reports, replay, journal, and AI coaching.
          </p>

          <div className="mb-8">
            <span className="text-5xl font-bold">₹999</span>
            <span className="text-gray-400"> / month</span>
          </div>

          <Button
            onClick={startSubscription}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            {loading ? "Creating..." : "Start Subscription"}
          </Button>
        </div>
      </div>
    </>
  );
}