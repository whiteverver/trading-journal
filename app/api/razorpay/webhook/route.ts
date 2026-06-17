import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay signature" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid Razorpay signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    const subscription = event.payload?.subscription?.entity;
    const payment = event.payload?.payment?.entity;

    const razorpaySubscriptionId =
      subscription?.id || payment?.subscription_id;

    const razorpayPaymentId = payment?.id || null;

    if (!razorpaySubscriptionId) {
      return NextResponse.json({ received: true });
    }

    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          razorpay_payment_id: razorpayPaymentId,
          current_period_start: subscription?.current_start
            ? new Date(subscription.current_start * 1000).toISOString()
            : null,
          current_period_end: subscription?.current_end
            ? new Date(subscription.current_end * 1000).toISOString()
            : null,
        })
        .eq("razorpay_subscription_id", razorpaySubscriptionId);

      if (error) {
        console.error("Webhook Supabase error:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.halted" ||
      eventType === "subscription.completed"
    ) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "inactive" })
        .eq("razorpay_subscription_id", razorpaySubscriptionId);
    }

    return NextResponse.json({
      received: true,
      event: eventType,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}