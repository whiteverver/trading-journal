import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeTradesWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const review = await analyzeTradesWithAI(trades || []);

    return NextResponse.json({ review });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI review failed" },
      { status: 500 }
    );
  }
}