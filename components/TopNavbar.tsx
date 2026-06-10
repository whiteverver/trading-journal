"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function TopNavbar() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <h1 className="text-lg font-semibold">Trading Journal</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Logout
        </button>
      </div>
    </header>
  );
}