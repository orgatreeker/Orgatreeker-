import { NextResponse, type NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { upsertSubscription } from "@/lib/supabase/database";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dodo Payments Webhook Endpoint
 *
 * Notes:
 * - Keep this endpoint fast and idempotent.
 * - Verify signatures using your webhook secret (DODO_WEBHOOK_SECRET).
 * - Handle retries: Dodo may retry delivery; dedupe by event id if provided.
 *
 * This webhook updates Clerk user metadata with subscription status
 *
 * Env:
 * - DODO_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  try {
    // Read raw body (required for signature verification)
    const rawBody = await req.text();

    // Get Svix headers for signature verification
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("DODO_WEBHOOK_SECRET not set. Skipping signature verification (DEV ONLY).");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify the webhook signature using Svix
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }

    let payload: any = {};
    try {
      const wh = new Webhook(webhookSecret);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch (err) {
      console.error("❌ Webhook signature verification failed!");
      console.error("Error details:", err);
      console.error("Secret being used (first 10 chars):", webhookSecret.substring(0, 10) + "...");
      console.error("Svix ID:", svixId);
      console.error("Svix Timestamp:", svixTimestamp);
      console.error("Svix Signature (first 20 chars):", svixSignature?.substring(0, 20) + "...");
      console.error("");
      console.error("🔧 TO FIX:");
      console.error("1. Go to Dodo Dashboard → Webhooks");
      console.error("2. Copy the Signing Secret");
      console.error("3. Update DODO_WEBHOOK_SECRET in Vercel env vars");
      console.error("4. Redeploy the app");
      console.error("");
      return NextResponse.json({
        error: "Invalid signature",
        hint: "Check DODO_WEBHOOK_SECRET in Vercel matches Dodo Dashboard"
      }, { status: 400 });
    }

    // Basic routing by type/payload_type (examples taken from docs listings)
    const eventType = payload?.type; // e.g., "payment.succeeded"
    const payloadType = payload?.data?.payload_type; // "Payment" | "Subscription" | "Refund" | "Dispute" | "LicenseKey"

    // TODO: Add idempotency dedupe here (e.g., store event_id in DB and ignore duplicates)
    const eventId = payload?.event_id || payload?.id || null;

    // Helper function to update user subscription in both Clerk and Database
    const updateUserSubscription = async (email: string, subscriptionData: any) => {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({ emailAddress: [email] });

        if (users.data.length === 0) {
          console.warn(`No Clerk user found for email: ${email}`);
          return;
        }

        const user = users.data[0];

        // Update Clerk metadata (for backward compatibility)
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            subscription: subscriptionData,
          },
        });

        // CRITICAL: Save to database for reliable persistence
        await upsertSubscription({
          clerk_user_id: user.id,
          email: email,
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          subscription_id: subscriptionData.subscriptionId,
          product_id: subscriptionData.productId,
          payment_id: subscriptionData.paymentId,
          last_event_type: eventType,
          last_event_id: eventId,
        });

        console.log(`✅ Updated subscription for user ${user.id} in both Clerk and Database:`, subscriptionData);
      } catch (error) {
        console.error("❌ Error updating user subscription:", error);
        // Log but don't throw - we still want to return 200 to Dodo
      }
    };

    switch (eventType) {
      case "payment.succeeded": {
        const email = payload?.data?.customer?.email;
        const productId = payload?.data?.product_id;
        const paymentId = payload?.data?.payment_id;

        if (email) {
          // Determine plan type from product ID
          let plan = 'monthly';
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) {
            plan = 'yearly';
          }

          updateUserSubscription(email, {
            status: 'active',
            plan,
            subscriptionId: payload?.data?.subscription_id || paymentId,
            productId,
            paymentId,
            updatedAt: new Date().toISOString(),
          }).catch((e) => console.error("updateUserSubscription error:", e));
        }
        console.log("✅ payment.succeeded", { eventId, payloadType, id: paymentId });
        break;
      }
      case "payment.failed":
        console.log("payment.failed", { eventId, payloadType, id: payload?.data?.payment_id });
        break;
      case "subscription.active": {
        const email = payload?.data?.customer?.email;
        const productId = payload?.data?.product_id;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          let plan = 'monthly';
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) {
            plan = 'yearly';
          }

          updateUserSubscription(email, {
            status: 'active',
            plan,
            subscriptionId,
            productId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e) => console.error("updateUserSubscription error:", e));
        }
        console.log("✅ subscription.active", { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.renewed": {
        const email = payload?.data?.customer?.email;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          updateUserSubscription(email, {
            status: 'active',
            subscriptionId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e) => console.error("updateUserSubscription error:", e));
        }
        console.log("✅ subscription.renewed", { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired": {
        const email = payload?.data?.customer?.email;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          updateUserSubscription(email, {
            status: eventType.replace('subscription.', '') as any,
            subscriptionId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e) => console.error("updateUserSubscription error:", e));
        }
        console.log(`⚠️ ${eventType}`, { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.on_hold":
      case "subscription.plan_changed":
        console.log(eventType, { eventId, payloadType, id: payload?.data?.subscription_id });
        break;
      case "refund.succeeded":
      case "refund.failed":
        console.log(eventType, { eventId, payloadType, id: payload?.data?.refund_id });
        break;
      case "dispute.opened":
      case "dispute.expired":
      case "dispute.accepted":
      case "dispute.cancelled":
      case "dispute.challenged":
      case "dispute.won":
      case "dispute.lost":
        console.log(eventType, { eventId, payloadType, id: payload?.data?.dispute_id });
        break;
      case "license_key.created":
        console.log(eventType, { eventId, payloadType, id: payload?.data?.id });
        break;
      default:
        console.log("Unhandled event", { eventType, payloadType, eventId });
        break;
    }

    // Always return 200 quickly so Dodo does not retry unnecessarily
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Return 500 for unexpected errors; Dodo may retry delivery
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}