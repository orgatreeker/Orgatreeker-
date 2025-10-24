import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * POST /api/set-subscription
 * Manually set subscription status for the current user (for testing when webhooks can't reach localhost)
 * Body: { status: 'active' | 'inactive', plan?: 'monthly' | 'yearly' }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status || 'active';
    const plan = body?.plan || 'monthly';

    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        subscription: {
          status,
          plan,
          subscriptionId: `manual_${Date.now()}`,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription set to ${status}`,
      subscription: {
        status,
        plan,
      },
    });
  } catch (err) {
    console.error("Set subscription error:", err);
    return NextResponse.json(
      {
        error: "Failed to set subscription",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/set-subscription
 * Check current subscription status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const metadata = user.publicMetadata as any;
    const subscription = metadata?.subscription;

    return NextResponse.json({
      subscription: subscription || null,
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
    });
  } catch (err) {
    console.error("Get subscription error:", err);
    return NextResponse.json(
      {
        error: "Failed to get subscription",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
