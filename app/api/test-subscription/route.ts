import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

/**
 * TEST ENDPOINT - Manually activate subscription for current user
 * This is for testing purposes when webhooks can't reach localhost
 * DELETE THIS IN PRODUCTION!
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clerkClient();

    // Manually set subscription as active for testing
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        subscription: {
          status: 'active',
          plan: 'yearly', // or 'monthly' - change as needed
          subscriptionId: 'test_sub_' + Date.now(),
          productId: process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated for testing!",
      userId: user.id
    });
  } catch (error) {
    console.error("Error activating test subscription:", error);
    return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
  }
}

/**
 * GET - Check current subscription status
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const subscription = user.publicMetadata?.subscription as any;

    return NextResponse.json({
      subscription: subscription || null,
      hasActiveSubscription: subscription?.status === 'active'
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}
