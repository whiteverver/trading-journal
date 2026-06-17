"use client";

import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  plan_name?: string | null;
  status?: string | null;
  razorpay_subscription_id?: string | null;
  current_period_end?: string | null;
};

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const response = await fetch("/api/billing/current", {
          cache: "no-store",
        });

        const data = await response.json();

        const sub = data.subscription ?? null;

        setSubscription(sub);

        setIsPro(
          data.active === true ||
          sub?.status === "active"
        );
      } catch (error) {
        console.error("Subscription check failed:", error);

        setSubscription(null);
        setIsPro(false);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);

  return {
    loading,
    isPro,
    subscription,
  };
}