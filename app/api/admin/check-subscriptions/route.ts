import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";

/**
 * Admin API endpoint to check if subscriptions table exists
 * and view current subscription data
 *
 * GET /api/admin/check-subscriptions
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: "Supabase admin client not available (missing SUPABASE_SERVICE_ROLE_KEY)",
        tableExists: false,
        hasServiceRoleKey: false,
      });
    }

    // Try to query the subscriptions table
    const { data, error, count } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          tableExists: false,
          error: 'Subscriptions table does not exist',
          message: 'Please run the migration: supabase/migrations/001_create_subscriptions_table.sql',
          instructions: [
            '1. Go to Supabase Dashboard → SQL Editor',
            '2. Copy the SQL from supabase/migrations/001_create_subscriptions_table.sql',
            '3. Paste and run it',
            '4. Refresh this page',
          ],
        });
      }

      return NextResponse.json({
        tableExists: false,
        error: error.message,
        code: error.code,
      });
    }

    // Table exists and query succeeded
    return NextResponse.json({
      tableExists: true,
      hasServiceRoleKey: true,
      totalSubscriptions: count || 0,
      recentSubscriptions: data?.map(sub => ({
        email: sub.email,
        status: sub.status,
        plan: sub.plan,
        createdAt: sub.created_at,
        lastEventType: sub.last_event_type,
      })) || [],
      message: '✅ Subscriptions table is working correctly!',
    });

  } catch (err: any) {
    console.error('Error checking subscriptions table:', err);
    return NextResponse.json({
      error: 'Unexpected error',
      message: err.message,
      tableExists: false,
    });
  }
}
