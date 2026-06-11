"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Brain,
  LineChart,
  Lock,
  Mail,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-12 lg:flex">
          <div>
            <h1 className="text-3xl font-bold">Trade Journal Pro</h1>
            <p className="mt-2 text-zinc-400">
              Professional trading analytics for serious traders.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="max-w-xl text-5xl font-bold leading-tight">
                Track Every Trade. Improve Every Decision.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-zinc-400">
                Review your setups, mistakes, emotions, screenshots, and
                trading performance from one powerful dashboard.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <Feature icon={BarChart3} title="Advanced Analytics" />
              <Feature icon={LineChart} title="Equity Curve" />
              <Feature icon={Brain} title="AI Trade Review" />
              <Feature icon={TrendingUp} title="Strategy Insights" />
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-4">
            <Stat value="100%" label="Private" />
            <Stat value="24/7" label="Access" />
            <Stat value="AI" label="Review" />
          </div>
        </div>

        <div className="flex items-center justify-center bg-zinc-50 p-6 text-zinc-950 dark:bg-black dark:text-white">
          <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Welcome Back</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Login to continue your trading journal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="h-12 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/reset-password"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                Login
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 backdrop-blur">
      <Icon className="mb-3 h-6 w-6 text-blue-400" />
      <p className="font-medium">{title}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4">
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}