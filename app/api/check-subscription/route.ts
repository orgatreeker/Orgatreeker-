import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasActiveSubscription } from "@/lib/supabase/database";

// Force dynamic rendering - this route uses auth() which requires headers
export const dynamic = 'force-dynamic';

/**
 * API endpoint to check if the current user has an active subscription
 * Checks the database for the most up-to-date subscription status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isSubscribed: false, error: "Not authenticated" }, { status: 401 });
    }

    // Check database for active subscription
    const isSubscribed = await hasActiveSubscription(userId);

    return NextResponse.json({
      isSubscribed,
      userId,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { isSubscribed: false, error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
