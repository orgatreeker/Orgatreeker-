import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("Missing LEMONSQUEEZY_WEBHOOK_SECRET environment variable")
      return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 })
    }

    // Verify webhook signature
    const hmac = crypto.createHmac("sha256", webhookSecret)
    hmac.update(body)
    const digest = hmac.digest("hex")

    if (signature !== digest) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createClient()

    console.log("[v0] Webhook event received:", event.meta.event_name)

    // Handle different webhook events
    switch (event.meta.event_name) {
      case "subscription_created":
      case "subscription_updated":
        await handleSubscriptionUpdate(event, supabase)
        break

      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionCancellation(event, supabase)
        break

      case "subscription_resumed":
        await handleSubscriptionResumption(event, supabase)
        break

      default:
        console.log("[v0] Unhandled webhook event:", event.meta.event_name)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(event: any, supabase: any) {
  const subscription = event.data
  const userId = subscription.attributes.custom_data?.user_id

  if (!userId) {
    console.error("No user_id in subscription data:", subscription.attributes.custom_data)
    return
  }

  console.log("[v0] Updating subscription for user:", userId)

  const variantId = subscription.attributes.variant_id
  let planName = "unknown"

  if (variantId === process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID) {
    planName = "monthly"
  } else if (variantId === process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID) {
    planName = "annual"
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.attributes.status,
      subscription_plan: planName,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user subscription:", error)
  } else {
    console.log("[v0] Successfully updated subscription for user:", userId, "Plan:", planName)
  }
}

async function handleSubscriptionCancellation(event: any, supabase: any) {
  const subscription = event.data
  const userId = subscription.attributes.custom_data?.user_id

  if (!userId) {
    console.error("No user_id in cancellation data")
    return
  }

  console.log("[v0] Cancelling subscription for user:", userId)

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      subscription_updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error cancelling user subscription:", error)
  } else {
    console.log("[v0] Successfully cancelled subscription for user:", userId)
  }
}

async function handleSubscriptionResumption(event: any, supabase: any) {
  const subscription = event.data
  const userId = subscription.attributes.custom_data?.user_id

  if (!userId) {
    console.error("No user_id in resumption data")
    return
  }

  console.log("[v0] Resuming subscription for user:", userId)

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error resuming user subscription:", error)
  } else {
    console.log("[v0] Successfully resumed subscription for user:", userId)
  }
}
