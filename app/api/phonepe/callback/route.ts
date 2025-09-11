import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyChecksum } from "@/lib/phonepe-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const checksum = request.headers.get("X-VERIFY")

    if (!checksum) {
      return NextResponse.json({ error: "Missing checksum" }, { status: 400 })
    }

    // Verify checksum
    const payload = JSON.stringify(body)
    const isValidChecksum = verifyChecksum(checksum, payload, "/pg/v1/status")

    if (!isValidChecksum) {
      console.error("Invalid checksum received")
      return NextResponse.json({ error: "Invalid checksum" }, { status: 400 })
    }

    const { response } = body
    const paymentData = JSON.parse(Buffer.from(response, "base64").toString())

    console.log("[PhonePe] Payment callback received:", paymentData)

    const supabase = createClient()

    // Find the subscription record
    const { data: subscription, error: findError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("phonepe_merchant_transaction_id", paymentData.data.merchantTransactionId)
      .single()

    if (findError || !subscription) {
      console.error("Subscription not found:", findError)
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Update subscription status based on payment result
    if (paymentData.success && paymentData.data.state === "COMPLETED") {
      const now = new Date()
      const expiresAt = new Date(now)

      // Set expiration based on plan
      if (subscription.plan_type === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      } else if (subscription.plan_type === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      }

      // Update subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          phonepe_transaction_id: paymentData.data.transactionId,
          current_period_start: now.toISOString(),
          current_period_end: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", subscription.id)

      if (updateError) {
        console.error("Failed to update subscription:", updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_plan: subscription.plan_type,
          subscription_expires_at: expiresAt.toISOString(),
          subscription_updated_at: now.toISOString(),
        })
        .eq("id", subscription.user_id)

      if (profileError) {
        console.error("Failed to update profile:", profileError)
      }

      console.log(
        `[PhonePe] Successfully activated ${subscription.plan_type} subscription for user ${subscription.user_id}`,
      )
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id)

      if (updateError) {
        console.error("Failed to update failed subscription:", updateError)
      }

      console.log(`[PhonePe] Payment failed for transaction ${paymentData.data.merchantTransactionId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PhonePe callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
