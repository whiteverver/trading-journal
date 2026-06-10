import Link from "next/link";
import { FileBarChart } from "lucide-react";
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
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r bg-card p-6">
      <h2 className="mb-8 text-2xl font-bold">
        Trade Journal
      </h2>

      <nav className="space-y-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/trades/new"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <PlusCircle size={18} />
          Add Trade
        </Link>

        <Link
          href="/trades"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <List size={18} />
          My Trades
        </Link>

        <Link
          href="/analytics"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <BarChart3 size={18} />
          Analytics
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Calendar size={18} />
          Calendar
        </Link>

        <Link
          href="/strategies"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Briefcase size={18} />
          Strategies
        </Link>

        <Link
          href="/tags"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Tags size={18} />
          Tags
        </Link>

        <Link
          href="/import"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <Upload size={18} />
          Import CSV
        </Link>

        <Link
        href="/reports"
        className="flex items-center gap-2 hover:text-blue-600"
        >
        <FileBarChart size={18} />
        Reports
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 hover:text-blue-600"
        >
          <User size={18} />
          Profile
        </Link>
      </nav>
    </aside>
  );
}