import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { initiatePhonePePayment } from "@/lib/phonepe-utils"
import { PRICING } from "@/lib/phonepe-config"

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const planConfig = PRICING[plan as keyof typeof PRICING]

    const paymentResult = await initiatePhonePePayment(planConfig.amount, user.id, plan)

    if (paymentResult.success) {
      // Store pending payment in database
      const { error: dbError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        phonepe_merchant_transaction_id: paymentResult.data.merchantTransactionId,
        amount: planConfig.amount / 100, // Convert cents to dollars
        currency: planConfig.currency,
        plan_type: plan,
        status: "pending",
        email: user.email,
      })

      if (dbError) {
        console.error("Database error:", dbError)
        return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        paymentUrl: paymentResult.data.instrumentResponse?.redirectInfo?.url,
        merchantTransactionId: paymentResult.data.merchantTransactionId,
      })
    } else {
      return NextResponse.json({ error: paymentResult.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
