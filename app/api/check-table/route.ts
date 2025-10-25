import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/client";

/**
 * Simple endpoint to check if subscriptions table exists
 * Visit: http://localhost:3000/api/check-table
 */
export async function GET() {
  try {
    // Check if we have admin client
    if (!supabaseAdmin) {
      return NextResponse.json({
        exists: false,
        error: "Supabase admin client not available",
        message: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable",
        needsSetup: true,
      });
    }

    // Try to query the subscriptions table
    const { data, error, count } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          exists: false,
          message: "❌ Subscriptions table does NOT exist yet",
          instructions: [
            "1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql",
            "2. Copy the SQL from: supabase/migrations/001_create_subscriptions_table.sql",
            "3. Paste it into the SQL editor",
            "4. Click RUN",
            "5. Refresh this page to verify"
          ],
          sqlFile: "supabase/migrations/001_create_subscriptions_table.sql",
          supabaseUrl: "https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql",
          needsSetup: true,
        });
      }

      // Other error
      return NextResponse.json({
        exists: false,
        error: error.message,
        code: error.code,
        needsSetup: true,
      });
    }

    // Table exists!
    return NextResponse.json({
      exists: true,
      message: "✅ Subscriptions table EXISTS and is working!",
      totalSubscriptions: count || 0,
      status: "ready",
      needsSetup: false,
      nextSteps: count === 0
        ? [
            "1. Deploy your code: git push",
            "2. Test a subscription",
            "3. User should NOT be redirected to pricing page"
          ]
        : [
            "✅ Table exists with data!",
            "You're all set. Just deploy: git push"
          ]
    });

  } catch (err: any) {
    return NextResponse.json({
      exists: false,
      error: "Unexpected error",
      message: err.message,
      needsSetup: true,
    }, { status: 500 });
  }
}
