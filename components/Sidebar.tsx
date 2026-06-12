"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Calendar,
  Upload,
  User,
  Tags,
  FileBarChart,
  Bot,
  LineChart,
  BookOpen,
  Trophy,
  Image,
  PlayCircle,
  Activity,
  Target,
} from "lucide-react";
import { TrendingUp } from "lucide-react";
const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades/new", label: "Add Trade", icon: PlusCircle },
  { href: "/trades", label: "My Trades", icon: List },
  { href: "/market", label: "Market Watch", icon: Activity },
];

const analyticsLinks = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/equity", label: "Equity Curve", icon: LineChart },
  { href: "/strategies", label: "Strategies", icon: Target },
  { href: "/tags", label: "Tags", icon: Tags },
];

const journalLinks = [
  { href: "/playbooks", label: "Playbooks", icon: BookOpen },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/ai-review", label: "AI Review", icon: Bot },
];

const accountLinks = [
  { href: "/import", label: "Import CSV", icon: Upload },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#070A0F] text-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 p-6">
          <Link href="/dashboard" className="block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-black">
                <LineChart className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">TradePilot</h1>
                <p className="text-xs text-gray-500">Trading Journal SaaS</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <NavSection title="Main" links={mainLinks} pathname={pathname} />
          <NavSection
            title="Analytics"
            links={analyticsLinks}
            pathname={pathname}
          />
          <NavSection title="Growth" links={journalLinks} pathname={pathname} />
          <NavSection
            title="Account"
            links={accountLinks}
            pathname={pathname}
          />
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-300">
              Trader Mode
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">
              Track trades, review mistakes, improve discipline.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  links,
  pathname,
}: {
  title: string;
  links: {
    href: string;
    label: string;
    icon: React.ElementType;
  }[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-black" : "text-gray-500 group-hover:text-white"
                }`}
              />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}