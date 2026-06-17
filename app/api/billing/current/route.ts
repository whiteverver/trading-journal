import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          active: false,
          plan_name: "Free Plan",
          status: "unauthenticated",
          subscription: null,
        },
        { status: 401 }
      );
    }

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          active: false,
          plan_name: "Free Plan",
          status: "error",
          subscription: null,
          message: error.message,
          user_id: user.id,
        },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json({
        active: false,
        plan_name: "Free Plan",
        status: "free",
        subscription: null,
        user_id: user.id,
      });
    }

    return NextResponse.json({
      active: true,
      plan_name: subscription.plan_name || "TradePilot Pro",
      status: subscription.status,
      subscription,
      user_id: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        active: false,
        plan_name: "Free Plan",
        status: "server_error",
        subscription: null,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}