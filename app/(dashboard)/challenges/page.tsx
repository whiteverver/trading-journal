"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

type Challenge = {
  id: string;
  user_id: string;
  title: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setChallenges(data || []);
    }

    setLoading(false);
  }

  async function addChallenge(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !targetValue || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login required");
      return;
    }

    const target = Number(targetValue);
    const current = Number(currentValue || 0);

    const status = current >= target ? "Completed" : "Active";

    const { error } = await supabase.from("challenges").insert({
      user_id: user.id,
      title,
      target_value: target,
      current_value: current,
      start_date: startDate,
      end_date: endDate,
      status,
    });

    if (error) {
      alert("Failed to add challenge");
      console.error(error);
      return;
    }

    setTitle("");
    setTargetValue("");
    setCurrentValue("");
    setStartDate("");
    setEndDate("");

    fetchChallenges();
  }

  async function updateProgress(id: string, target: number, value: string) {
    const current = Number(value || 0);
    const status = current >= target ? "Completed" : "Active";

    const { error } = await supabase
      .from("challenges")
      .update({
        current_value: current,
        status,
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update progress");
      console.error(error);
      return;
    }

    fetchChallenges();
  }

  async function deleteChallenge(id: string) {
    const confirmDelete = confirm("Delete this challenge?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("challenges").delete().eq("id", id);

    if (error) {
      alert("Failed to delete challenge");
      console.error(error);
      return;
    }

    fetchChallenges();
  }

  function getProgress(current: number, target: number) {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  }

  const activeChallenges = challenges.filter((c) => c.status !== "Completed");
  const completedChallenges = challenges.filter(
    (c) => c.status === "Completed"
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Challenges</h1>
        <p className="text-muted-foreground">
          Create trading goals and track your progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Challenges" value={challenges.length} />
        <StatsCard title="Active" value={activeChallenges.length} />
        <StatsCard title="Completed" value={completedChallenges.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Challenge</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={addChallenge} className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Challenge Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Target Value"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Current Value"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Button type="submit" className="md:col-span-2">
              Add Challenge
            </Button>
          </form>
        </CardContent>
      </Card>

      <ChallengeSection
        title="Active Challenges"
        challenges={activeChallenges}
        loading={loading}
        onUpdate={updateProgress}
        onDelete={deleteChallenge}
        getProgress={getProgress}
      />

      <ChallengeSection
        title="Completed Challenges"
        challenges={completedChallenges}
        loading={loading}
        onUpdate={updateProgress}
        onDelete={deleteChallenge}
        getProgress={getProgress}
      />
    </div>
  );
}

function StatsCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </CardContent>
    </Card>
  );
}

function ChallengeSection({
  title,
  challenges,
  loading,
  onUpdate,
  onDelete,
  getProgress,
}: {
  title: string;
  challenges: Challenge[];
  loading: boolean;
  onUpdate: (id: string, target: number, value: string) => void;
  onDelete: (id: string) => void;
  getProgress: (current: number, target: number) => number;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading challenges...</p>
      ) : challenges.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No challenges found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => {
            const progress = getProgress(
              Number(challenge.current_value),
              Number(challenge.target_value)
            );

            return (
              <Card key={challenge.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {challenge.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {challenge.start_date} to {challenge.end_date}
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(challenge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        {challenge.current_value} / {challenge.target_value}
                      </span>
                      <span>{progress}%</span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-muted">
                      <div
                        className="h-3 rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Update progress"
                      defaultValue={challenge.current_value}
                      onBlur={(e) =>
                        onUpdate(
                          challenge.id,
                          Number(challenge.target_value),
                          e.target.value
                        )
                      }
                    />

                    <Button
                      variant={
                        challenge.status === "Completed"
                          ? "default"
                          : "outline"
                      }
                    >
                      {challenge.status}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}