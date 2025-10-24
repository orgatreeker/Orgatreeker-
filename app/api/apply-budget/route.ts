import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { needs, wants, savings } = await request.json()
    
    // Validate percentages
    if (!needs || !wants || !savings) {
      return NextResponse.json({ error: "Missing budget percentages" }, { status: 400 })
    }

    if (needs + wants + savings !== 100) {
      return NextResponse.json({ error: "Percentages must sum to 100" }, { status: 400 })
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store budget percentages in user_settings
    // First, check if user_settings exists
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    const budgetPreferences = {
      needs_percentage: needs,
      wants_percentage: wants,
      savings_percentage: savings,
      applied_at: new Date().toISOString()
    }

    if (existingSettings) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('user_settings')
        .update(budgetPreferences)
        .eq('clerk_user_id', userId)

      if (updateError) {
        console.error("Error updating user settings:", updateError)
        throw updateError
      }
    } else {
      // Create new settings
      const { error: insertError } = await supabase
        .from('user_settings')
        .insert({
          clerk_user_id: userId,
          ...budgetPreferences
        })

      if (insertError) {
        console.error("Error creating user settings:", insertError)
        throw insertError
      }
    }

    return NextResponse.json({ 
      success: true,
      message: "Budget preferences saved successfully",
      preferences: budgetPreferences
    })
  } catch (error) {
    console.error("Apply budget error:", error)
    return NextResponse.json({ 
      error: "Failed to apply budget",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
