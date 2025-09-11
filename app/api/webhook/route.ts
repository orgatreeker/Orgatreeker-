import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    if (!signature) {
      console.error("[v0] No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const signingSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "9531808991!Aa"
    const expectedSignature = crypto.createHmac("sha256", signingSecret).update(body).digest("hex")

    if (signature !== expectedSignature) {
      console.error("[v0] Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("[v0] Webhook event received:", event.meta?.event_name)

    const supabase = createClient()

    switch (event.meta?.event_name) {
      case "subscription_created":
      case "subscription_updated":
        await handleSubscriptionEvent(event, supabase)
        break

      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionCancellation(event, supabase)
        break

      case "order_created":
        await handleOrderCreated(event, supabase)
        break

      default:
        console.log("[v0] Unhandled webhook event:", event.meta?.event_name)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSubscriptionEvent(event: any, supabase: any) {
  const subscription = event.data
  console.log("[v0] Processing subscription event for ID:", subscription.id)

  let userEmail = null

  if (subscription.attributes.custom_data?.user_email) {
    userEmail = subscription.attributes.custom_data.user_email
  } else if (subscription.attributes.user_email) {
    userEmail = subscription.attributes.user_email
  } else if (event.included) {
    const customer = event.included.find((item: any) => item.type === "customers")
    if (customer?.attributes?.email) {
      userEmail = customer.attributes.email
    }
  }

  console.log("[v0] Extracted user email:", userEmail)

  if (!userEmail) {
    console.error("[v0] No user email found in subscription event")
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", userEmail)
    .single()

  if (profileError || !profile) {
    console.error("[v0] User not found for email:", userEmail, "Error:", profileError)
    return
  }

  const variantId = subscription.attributes.variant_id
  let planType = "free"

  if (variantId === 618060 || variantId === Number.parseInt(process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID || "618060")) {
    planType = "monthly"
  } else if (
    variantId === 632299 ||
    variantId === Number.parseInt(process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID || "632299")
  ) {
    planType = "yearly"
  }

  const subscriptionStatus = subscription.attributes.status === "active" ? "active" : subscription.attributes.status

  console.log("[v0] Updating subscription for user:", userEmail, "Plan:", planType, "Status:", subscriptionStatus)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscriptionStatus,
      subscription_plan: planType,
      subscription_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)

  if (updateError) {
    console.error("[v0] Error updating subscription:", updateError)
  } else {
    console.log(
      "[v0] Successfully updated subscription for user:",
      userEmail,
      "Status:",
      subscriptionStatus,
      "Plan:",
      planType,
    )
  }

  const { error: subscriptionInsertError } = await supabase.from("subscriptions").upsert(
    {
      lemon_squeezy_id: subscription.id.toString(),
      user_id: profile.id,
      email: userEmail,
      status: subscriptionStatus,
      plan_type: planType,
      variant_id: variantId,
      variant_name: subscription.attributes.variant_name || planType,
      current_period_start: subscription.attributes.current_period_start,
      current_period_end: subscription.attributes.current_period_end,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "lemon_squeezy_id",
    },
  )

  if (subscriptionInsertError) {
    console.error("[v0] Error inserting subscription record:", subscriptionInsertError)
  } else {
    console.log("[v0] Successfully inserted/updated subscription record")
  }
}

async function handleSubscriptionCancellation(event: any, supabase: any) {
  const subscription = event.data
  const customData = subscription.attributes.custom_data || {}
  const userEmail = customData.user_email || subscription.attributes.user_email

  if (!userEmail) {
    console.error("[v0] No user email found in cancellation event")
    return
  }

  console.log("[v0] Cancelling subscription for user:", userEmail)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      subscription_plan: "free",
      subscription_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail)

  if (updateError) {
    console.error("[v0] Error updating cancellation:", updateError)
  } else {
    console.log("[v0] Successfully cancelled subscription for user:", userEmail)
  }

  const { error: subscriptionUpdateError } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("lemon_squeezy_id", subscription.id.toString())

  if (subscriptionUpdateError) {
    console.error("[v0] Error updating subscription record:", subscriptionUpdateError)
  }
}

async function handleOrderCreated(event: any, supabase: any) {
  const order = event.data
  console.log("[v0] Processing order event for order ID:", order.id)

  let userEmail = null

  if (order.attributes.custom_data?.user_email) {
    userEmail = order.attributes.custom_data.user_email
  } else if (order.attributes.user_email) {
    userEmail = order.attributes.user_email
  } else if (event.included) {
    const customer = event.included.find((item: any) => item.type === "customers")
    if (customer?.attributes?.email) {
      userEmail = customer.attributes.email
    }
  }

  console.log("[v0] Order created for user:", userEmail)

  if (userEmail) {
    const { error: logError } = await supabase
      .from("profiles")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("email", userEmail)

    if (logError) {
      console.error("[v0] Error logging payment:", logError)
    } else {
      console.log("[v0] Successfully logged payment for user:", userEmail)
    }
  }
}
