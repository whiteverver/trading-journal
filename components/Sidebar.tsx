import Link from "next/link";
import { LayoutDashboard, PlusCircle, List } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-6">
      <h2 className="text-2xl font-bold mb-8">Trade Journal</h2>

      <nav className="space-y-4">
        <Link href="/dashboard" className="flex gap-2">
          <LayoutDashboard /> Dashboard
        </Link>

        <Link href="/trades/new" className="flex gap-2">
          <PlusCircle /> Add Trade
        </Link>

        <Link href="/trades" className="flex gap-2">
          <List /> My Trades
        </Link>
      </nav>
    </aside>
  );
}