import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { needs, wants, savings } = await request.json()
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update user's budget preferences
    const { error } = await supabase
      .from("profiles")
      .update({
        budget_needs_percentage: needs,
        budget_wants_percentage: wants,
        budget_savings_percentage: savings,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Failed to update budget preferences:", error)
      return NextResponse.json({ error: "Failed to save budget" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Apply budget error:", error)
    return NextResponse.json({ error: "Failed to apply budget" }, { status: 500 })
  }
}
