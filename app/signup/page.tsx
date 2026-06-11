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
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully. Please login.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-12 lg:flex">
          <div>
            <h1 className="text-3xl font-bold">Trade Journal Pro</h1>
            <p className="mt-2 text-zinc-400">
              Build discipline. Track performance. Improve every trade.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="max-w-xl text-5xl font-bold leading-tight">
                Start Tracking Your Trading Like a Professional.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-zinc-400">
                Create your account and start reviewing your trades, mistakes,
                emotions, screenshots, and performance insights.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 sm:grid-cols-2">
              <Feature icon={BarChart3} title="Performance Reports" />
              <Feature icon={LineChart} title="Equity Curve" />
              <Feature icon={Brain} title="AI Review" />
              <Feature icon={TrendingUp} title="Strategy Analytics" />
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-4">
            <Stat value="Fast" label="Setup" />
            <Stat value="Private" label="Journal" />
            <Stat value="Smart" label="Insights" />
          </div>
        </div>

        <div className="flex items-center justify-center bg-zinc-50 p-6 text-zinc-950 dark:bg-black dark:text-white">
          <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Create Account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your professional trading journal today.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
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
                    placeholder="Create password"
                    className="h-12 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Login
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