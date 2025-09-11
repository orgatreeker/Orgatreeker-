import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    if (!signature) {
      console.error("No signature provided")
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    const signingSecret = "9531808991!Aa"
    const expectedSignature = crypto.createHmac("sha256", signingSecret).update(body).digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid signature")
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
  const customData = subscription.attributes.custom_data || {}
  const userEmail = customData.user_email || subscription.attributes.user_email

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
    console.error("[v0] User not found for email:", userEmail)
    return
  }

  const variantId = subscription.attributes.variant_id
  let planType = "free"

  if (variantId === 618060) {
    // Monthly plan
    planType = "monthly"
  } else if (variantId === 632299) {
    // Annual plan
    planType = "annual"
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.attributes.status,
      subscription_plan: planType,
      lemon_squeezy_customer_id: subscription.attributes.customer_id,
      lemon_squeezy_subscription_id: subscription.id,
      subscription_current_period_start: subscription.attributes.current_period_start,
      subscription_current_period_end: subscription.attributes.current_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)

  if (updateError) {
    console.error("[v0] Error updating subscription:", updateError)
  } else {
    console.log("[v0] Successfully updated subscription for user:", userEmail)
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

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      subscription_plan: "free",
      updated_at: new Date().toISOString(),
    })
    .eq("email", userEmail)

  if (updateError) {
    console.error("[v0] Error updating cancellation:", updateError)
  } else {
    console.log("[v0] Successfully cancelled subscription for user:", userEmail)
  }
}

async function handleOrderCreated(event: any, supabase: any) {
  const order = event.data
  const customData = order.attributes.custom_data || {}
  const userEmail = customData.user_email || order.attributes.user_email

  console.log("[v0] Order created for user:", userEmail)

  if (userEmail) {
    const { error: logError } = await supabase
      .from("profiles")
      .update({
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", userEmail)

    if (logError) {
      console.error("[v0] Error logging payment:", logError)
    }
  }
}
