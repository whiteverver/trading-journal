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
  Briefcase,
  FileBarChart,
  Bot,
  LineChart,
  BookOpen,
  Trophy,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/trades/new",
    label: "Add Trade",
    icon: PlusCircle,
  },
  {
    href: "/trades",
    label: "My Trades",
    icon: List,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileBarChart,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/equity",
    label: "Equity Curve",
    icon: LineChart,
  },
  {
    href: "/strategies",
    label: "Strategies",
    icon: Briefcase,
  },
  {
    href: "/tags",
    label: "Tags",
    icon: Tags,
  },
  {
    href: "/journal",
    label: "Journal",
    icon: BookOpen,
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: Trophy,
  },
  {
    href: "/ai-review",
    label: "AI Review",
    icon: Bot,
  },
  {
    href: "/import",
    label: "Import CSV",
    icon: Upload,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-card px-4 py-6 md:block">
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-bold tracking-tight">Trade Journal</h2>
        <p className="text-sm text-muted-foreground">
          Trading Dashboard
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}