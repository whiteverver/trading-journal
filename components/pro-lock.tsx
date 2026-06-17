import Link from "next/link";
import { Crown, Lock } from "lucide-react";

type ProLockProps = {
  title?: string;
  description?: string;
};

export default function ProLock({
  title = "Unlock TradePilot Pro",
  description = "This feature is available only for Pro users. Upgrade to access advanced analytics, reports, replay, playbooks, calendar, AI review and more.",
}: ProLockProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#050816] px-6 text-white">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
          <Lock className="h-8 w-8" />
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
          <Crown className="h-4 w-4" />
          PRO FEATURE
        </div>

        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>

        <Link
          href="/subscription"
          className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}