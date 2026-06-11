import Link from "next/link";
import {
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ImageIcon,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-bold">
          Trade Journal Pro
        </Link>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-white/20 px-5 py-2 text-sm"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
            Built for serious traders
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Journal Every Trade. Improve Every Day.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Track trades, analyze performance, upload screenshots, review
            strategies, monitor emotions, and become a more consistent trader.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-7 py-4 font-semibold text-black"
            >
              Get Started Free
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-7 py-4 font-semibold"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400">Dashboard Preview</p>
            <h3 className="mb-6 text-2xl font-bold">Trading Performance</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardCard title="Total P&L" value="₹42,850" />
              <DashboardCard title="Win Rate" value="64%" />
              <DashboardCard title="Profit Factor" value="2.18" />
              <DashboardCard title="Total Trades" value="128" />
            </div>

            <div className="mt-6 h-56 rounded-2xl border border-white/10 bg-gradient-to-t from-blue-600/20 to-transparent p-5">
              <div className="flex h-full items-end gap-3">
                {[35, 55, 42, 70, 48, 85, 65, 92, 78, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-blue-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold">Everything You Need</h2>
          <p className="mt-3 text-zinc-400">
            A complete trading journal system in one dashboard.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={BarChart3}
            title="Advanced Analytics"
            text="Track win rate, profit factor, average wins, losses, and performance trends."
          />

          <Feature
            icon={LineChart}
            title="Equity Curve"
            text="Visualize your account growth, drawdowns, and consistency over time."
          />

          <Feature
            icon={ImageIcon}
            title="Screenshot Gallery"
            text="Upload and review trade screenshots from one clean gallery."
          />

          <Feature
            icon={Brain}
            title="AI Review"
            text="Get coaching-style insights based on mistakes, emotions, and setups."
          />

          <Feature
            icon={Target}
            title="Challenges"
            text="Set trading goals and track your progress like a disciplined trader."
          />

          <Feature
            icon={CalendarDays}
            title="Calendar View"
            text="See your best days, worst days, winning days, and losing days."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-3">
          <Benefit text="Track strategy and tag performance" />
          <Benefit text="Review emotional trading mistakes" />
          <Benefit text="Import and export trades with CSV" />
          <Benefit text="Analyze monthly reports" />
          <Benefit text="Create journal notes" />
          <Benefit text="Replay your trades visually" />
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl text-5xl font-bold">
          Ready to become a more consistent trader?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
          Start journaling your trades today and build a system for better
          trading decisions.
        </p>

        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-black"
        >
          Start Journaling Free
        </Link>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <h4 className="mt-2 text-2xl font-bold">{value}</h4>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <Icon className="mb-5 h-8 w-8 text-blue-400" />
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="leading-7 text-zinc-400">{text}</p>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-300">
      <CheckCircle2 className="h-5 w-5 text-green-400" />
      <span>{text}</span>
    </div>
  );
}