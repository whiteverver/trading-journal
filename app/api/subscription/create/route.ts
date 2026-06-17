import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID missing" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_PLAN_ID) {
      return NextResponse.json(
        { error: "RAZORPAY_PLAN_ID missing" },
        { status: 500 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 12,
    });

    const { error } = await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      plan_name: "TradePilot Pro",
      razorpay_subscription_id: subscription.id,
      status: "created",
    });

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
    });
  } catch (error: any) {
    console.error("Subscription create error:", error);

    return NextResponse.json(
      {
        error:
          error?.error?.description ||
          error?.message ||
          "Failed to create subscription",
      },
      { status: 500 }
    );
  }
}