"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  Trash2,
  Pencil,
  Target,
  Shield,
  Clock,
  BarChart3,
} from "lucide-react";

type Playbook = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  risk_rules: string | null;
  market_type: string | null;
  timeframe: string | null;
  created_at: string;
};

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    entry_rules: "",
    exit_rules: "",
    risk_rules: "",
    market_type: "",
    timeframe: "",
  });

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  async function fetchPlaybooks() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPlaybooks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("playbooks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Playbooks error:", error.message);
      setPlaybooks([]);
    } else {
      setPlaybooks(data || []);
    }

    setLoading(false);
  }

  async function savePlaybook(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Playbook title is required");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("playbooks")
        .update(form)
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("playbooks").insert({
        ...form,
        user_id: user.id,
      });

      if (error) {
        alert(error.message);
        return;
      }
    }

    resetForm();
    fetchPlaybooks();
  }

  async function deletePlaybook(id: string) {
    const confirmed = confirm("Delete this playbook?");
    if (!confirmed) return;

    const { error } = await supabase.from("playbooks").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchPlaybooks();
  }

  function editPlaybook(playbook: Playbook) {
    setEditingId(playbook.id);
    setForm({
      title: playbook.title || "",
      description: playbook.description || "",
      entry_rules: playbook.entry_rules || "",
      exit_rules: playbook.exit_rules || "",
      risk_rules: playbook.risk_rules || "",
      market_type: playbook.market_type || "",
      timeframe: playbook.timeframe || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      entry_rules: "",
      exit_rules: "",
      risk_rules: "",
      market_type: "",
      timeframe: "",
    });
  }

  const stats = useMemo(() => {
    const total = playbooks.length;
    const markets = new Set(playbooks.map((p) => p.market_type).filter(Boolean));
    const timeframes = new Set(playbooks.map((p) => p.timeframe).filter(Boolean));

    return {
      total,
      markets: markets.size,
      timeframes: timeframes.size,
    };
  }, [playbooks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] p-6 text-white">
        <p className="text-sm text-gray-400">Loading playbooks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <main className="space-y-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B111C] to-[#07130F] p-6">
          <p className="text-sm font-medium text-emerald-400">
            Trading Playbooks
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Playbook System
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Build rule-based trading setups with entry, exit, and risk plans.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Playbooks"
            value={stats.total}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="Market Types"
            value={stats.markets}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            title="Timeframes"
            value={stats.timeframes}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        <Card className="border-white/10 bg-[#0B111C]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-emerald-400" />
              {editingId ? "Edit Playbook" : "Create New Playbook"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={savePlaybook} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Playbook Title"
                  value={form.title}
                  onChange={(value) => setForm({ ...form, title: value })}
                  placeholder="Example: London Breakout"
                />

                <Input
                  label="Market Type"
                  value={form.market_type}
                  onChange={(value) =>
                    setForm({ ...form, market_type: value })
                  }
                  placeholder="Forex, Crypto, Stocks"
                />

                <Input
                  label="Timeframe"
                  value={form.timeframe}
                  onChange={(value) => setForm({ ...form, timeframe: value })}
                  placeholder="5m, 15m, 1H, Daily"
                />

                <Input
                  label="Description"
                  value={form.description}
                  onChange={(value) =>
                    setForm({ ...form, description: value })
                  }
                  placeholder="Short description of this setup"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Textarea
                  label="Entry Rules"
                  value={form.entry_rules}
                  onChange={(value) =>
                    setForm({ ...form, entry_rules: value })
                  }
                  placeholder="Write your entry rules..."
                />

                <Textarea
                  label="Exit Rules"
                  value={form.exit_rules}
                  onChange={(value) => setForm({ ...form, exit_rules: value })}
                  placeholder="Write your exit rules..."
                />

                <Textarea
                  label="Risk Rules"
                  value={form.risk_rules}
                  onChange={(value) => setForm({ ...form, risk_rules: value })}
                  placeholder="Write your risk rules..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
                >
                  {editingId ? "Update Playbook" : "Save Playbook"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm text-gray-300 hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          {playbooks.map((playbook) => (
            <Card key={playbook.id} className="border-white/10 bg-[#0B111C]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">
                      {playbook.title}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-400">
                      {playbook.description || "No description added."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editPlaybook(playbook)}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-gray-300 hover:bg-white/[0.08]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => deletePlaybook(playbook.id)}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge label={playbook.market_type || "Market"} />
                  <Badge label={playbook.timeframe || "Timeframe"} />
                </div>

                <RuleBox
                  icon={<Target className="h-4 w-4 text-emerald-400" />}
                  title="Entry Rules"
                  value={playbook.entry_rules}
                />

                <RuleBox
                  icon={<Target className="h-4 w-4 text-blue-400" />}
                  title="Exit Rules"
                  value={playbook.exit_rules}
                />

                <RuleBox
                  icon={<Shield className="h-4 w-4 text-yellow-400" />}
                  title="Risk Rules"
                  value={playbook.risk_rules}
                />
              </CardContent>
            </Card>
          ))}

          {playbooks.length === 0 && (
            <Card className="border-white/10 bg-[#0B111C] xl:col-span-2">
              <CardContent className="p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-500" />
                <p className="mt-4 text-lg font-semibold text-white">
                  No playbooks yet
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Create your first trading setup with rules and risk plan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-[#0B111C]">
      <CardContent className="flex min-h-[120px] items-center justify-between p-5">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{value}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 text-gray-300">{icon}</div>
      </CardContent>
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#070A0F] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={7}
        className="w-full resize-none rounded-2xl border border-white/10 bg-[#070A0F] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-500/50"
      />
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
      {label}
    </span>
  );
}

function RuleBox({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium text-white">{title}</p>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-400">
        {value || "No rules added."}
      </p>
    </div>
  );
}