"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, ImageIcon } from "lucide-react";

type Screenshot = {
  id: string;
  user_id: string;
  trade_id: string;
  image_url: string;
  created_at: string;
  trades?: {
  symbol: string;
  strategy: string | null;
  side: string | null;
  pnl: number | null;
}[] | null;
};

export default function GalleryPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  async function fetchScreenshots() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trade_screenshots")
      .select(`
        id,
        user_id,
        trade_id,
        image_url,
        created_at,
        trades (
          symbol,
          strategy,
          side,
          pnl
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setScreenshots(data || []);
    setLoading(false);
  }

  async function deleteScreenshot(id: string) {
    const confirmDelete = confirm("Delete this screenshot?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("trade_screenshots")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete screenshot");
      console.error(error);
      return;
    }

    fetchScreenshots();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screenshot Gallery</h1>
        <p className="text-muted-foreground">
          View all your trade screenshots in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Screenshots" value={screenshots.length} />
        <StatsCard
          title="Winning Trades"
          value={screenshots.filter((s) => Number(s.trades?.[0]?.pnl || 0) > 0).length}
        />
        <StatsCard
          title="Losing Trades"
          value={screenshots.filter((s) => Number(s.trades?.[0]?.pnl || 0) < 0).length}
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading screenshots...</p>
      ) : screenshots.length === 0 ? (
        <Card>
          <CardContent className="flex h-72 flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="mb-3 h-10 w-10" />
            <p>No screenshots found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {screenshots.map((screenshot) => (
            <Card key={screenshot.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src={screenshot.image_url}
                  alt="Trade screenshot"
                  className="h-full w-full object-cover"
                />
              </div>

              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {screenshot.trades?.[0]?.symbol || "Unknown Trade"}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Strategy: {screenshot.trades?.[0]?.strategy || "Not added"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Side: {screenshot.trades?.[0]?.side || "Not added"}
                  </p>

                  <p
                    className={`text-sm font-medium ${
                      Number(screenshot.trades?.[0]?.pnl || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    P&L: ₹{Number(screenshot.trades?.[0]?.pnl || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/trades/${screenshot.trade_id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Trade
                    </Link>
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteScreenshot(screenshot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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