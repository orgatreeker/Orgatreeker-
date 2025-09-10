import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCheckout, LEMON_SQUEEZY_CONFIG } from "@/lib/lemonsqueezy"

export async function POST(request: NextRequest) {
  try {
    const { variantId, userId } = await request.json()

    if (!variantId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user exists
    const supabase = createClient()
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create checkout session
    const checkout = await createCheckout(LEMON_SQUEEZY_CONFIG.storeId, variantId, {
      checkoutOptions: {
        embed: false,
        media: false,
        logo: true,
      },
      checkoutData: {
        email: profile.email,
        name: profile.display_name || profile.email,
        custom: {
          user_id: userId,
        },
      },
      productOptions: {
        enabledVariants: [Number.parseInt(variantId)],
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
        receiptButtonText: "Go to Dashboard",
        receiptThankYouNote: "Thank you for upgrading to Pro!",
      },
    })

    if (checkout.error) {
      console.error("Checkout creation error:", checkout.error)
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
    }

    return NextResponse.json({ checkoutUrl: checkout.data?.data.attributes.url })
  } catch (error) {
    console.error("Checkout API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
