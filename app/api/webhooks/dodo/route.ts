import { NextResponse, type NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import crypto from "crypto";
import { upsertSubscription } from "@/lib/supabase/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-memory dedupe for recent events (best-effort; use DB for production durability)
 */
const RECENT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RECENT = 1000;
const recentEvents = new Map<string, number>();

function purgeOld(now: number) {
  for (const [id, ts] of recentEvents) {
    if (now - ts > RECENT_TTL_MS) recentEvents.delete(id);
  }
  if (recentEvents.size > MAX_RECENT) {
    // Drop oldest entries if over limit
    const toDrop = recentEvents.size - MAX_RECENT;
    const keys = Array.from(recentEvents.entries()).sort((a, b) => a[1] - b[1]).slice(0, toDrop);
    for (const [id] of keys) recentEvents.delete(id);
  }
}
function isDuplicateEvent(eventId?: string | null) {
  if (!eventId) return false;
  const now = Date.now();
  purgeOld(now);
  if (recentEvents.has(eventId)) return true;
  recentEvents.set(eventId, now);
  return false;
}

function jsonWithCID(cid: string, data: unknown, init?: number | ResponseInit) {
  const res = NextResponse.json(data, typeof init === "number" ? { status: init } : init);
  res.headers.set("x-correlation-id", cid);
  return res;
}

function first20(x?: string | null) {
  return x ? x.slice(0, 20) + "..." : null;
}

/**
 * Dodo Payments Webhook Endpoint
 *
 * - Verifies Svix signatures (strict by default)
 * - Accepts either 'svix-*' or 'webhook-*' header names
 * - Idempotency: de-dupes same event_id within short TTL
 */
export async function POST(req: NextRequest) {
  // Read raw body first for signature verification
  const rawBody = await req.text();

  // Support both header styles
  const svixId = req.headers.get("svix-id") || req.headers.get("webhook-id");
  const svixTimestamp = req.headers.get("svix-timestamp") || req.headers.get("webhook-timestamp");
  const svixSignature = req.headers.get("svix-signature") || req.headers.get("webhook-signature");

  console.log("📨 Webhook received - Headers:", {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": first20(svixSignature),
  });

  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  const relaxed = process.env.DODO_WEBHOOK_RELAXED === "true";

  if (!webhookSecret && !relaxed) {
    const cid = crypto.randomUUID();
    console.warn(`[webhook][${cid}] DODO_WEBHOOK_SECRET not set`);
    return jsonWithCID(cid, { error: "Webhook secret not configured" }, 500);
  }

  let payload: any = {};
  let cid: string = crypto.randomUUID();

  if (!relaxed) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing webhook headers (svix-id/timestamp/signature)");
      return jsonWithCID(cid, { error: "Missing webhook headers" }, 400);
    }
    try {
      const wh = new Webhook(webhookSecret as string);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
      console.log(`[webhook][${cid}] ✅ Signature verified`);
    } catch (err) {
      console.error(`[webhook][${cid}] ❌ Signature verification failed`);
      console.error("Error details:", err);
      console.error("Secret (first 10):", (webhookSecret || "").substring(0, 10) + "...");
      console.error("svix-id:", svixId);
      console.error("svix-timestamp:", svixTimestamp);
      console.error("svix-signature:", first20(svixSignature || ""));
      return jsonWithCID(
        cid,
        { error: "Invalid signature", hint: "Ensure DODO_WEBHOOK_SECRET matches Dashboard signing secret" },
        400,
      );
    }
  } else {
    try {
      payload = JSON.parse(rawBody);
      console.warn(`[webhook][${cid}] ⚠️ Relaxed mode: signature verification DISABLED`);
    } catch (err) {
      console.error(`[webhook][${cid}] Invalid JSON in relaxed mode`, err);
      return jsonWithCID(cid, { error: "Invalid payload" }, 400);
    }
  }

  const eventType = payload?.type;
  const payloadType = payload?.data?.payload_type;
  const eventId = payload?.event_id || payload?.id || null;

  // Prefer eventId as correlation id when available
  if (eventId) cid = String(eventId);

  // Idempotency de-dupe
  if (isDuplicateEvent(eventId)) {
    console.log(`[webhook][${cid}] 🔁 Duplicate event received, ignoring`);
    return jsonWithCID(cid, { received: true, duplicate: true }, 200);
  }

  console.log(`[webhook][${cid}] 📊 Event`, {
    type: eventType,
    payloadType,
    eventId,
    email: payload?.data?.customer?.email,
    subscriptionId: payload?.data?.subscription_id,
    paymentId: payload?.data?.payment_id,
    checkoutSessionId: payload?.data?.checkout_session_id,
  });

  // Helper function to update user subscription in both Clerk and Database
  const updateUserSubscription = async (email: string, subscriptionData: any) => {
    try {
      const anyClerk = clerkClient as any;
      const client = typeof anyClerk === "function" ? await anyClerk() : anyClerk;
      const users = await client.users.getUserList({ emailAddress: [email] });

      if (users.data.length === 0) {
        console.warn(`[webhook][${cid}] No Clerk user found for email: ${email}`);
        return;
      }

      const user = users.data[0];

      // Update Clerk metadata
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          subscription: subscriptionData,
        },
      });

      // Persist to DB
      await upsertSubscription({
        clerk_user_id: user.id,
        email,
        status: subscriptionData.status,
        plan: subscriptionData.plan,
        subscription_id: subscriptionData.subscriptionId,
        product_id: subscriptionData.productId,
        payment_id: subscriptionData.paymentId,
        last_event_type: eventType,
        last_event_id: eventId,
      });

      console.log(`[webhook][${cid}] ✅ Updated subscription for user ${user.id}`, subscriptionData);
    } catch (error) {
      console.error(`[webhook][${cid}] ❌ Error updating subscription`, error);
      // Do not throw; still acknowledge to avoid retries storm
    }
  };

  try {
    switch (eventType) {
      case "payment.succeeded": {
        const email = payload?.data?.customer?.email;
        let productId = payload?.data?.product_id;
        const paymentId = payload?.data?.payment_id;
        const checkoutSessionId = payload?.data?.checkout_session_id;

        if (!productId && checkoutSessionId) {
          console.log(`[webhook][${cid}] ⚠️ product_id missing, checkout_session_id=${checkoutSessionId}`);
          // Optionally fetch session details via API if needed
        }

        if (email) {
          let plan: "monthly" | "yearly" = "monthly";
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) {
            plan = "yearly";
          } else if (!productId) {
            console.warn(`[webhook][${cid}] ⚠️ product_id null, defaulting to monthly`);
            plan = "monthly";
          }

          await updateUserSubscription(email, {
            status: "active",
            plan,
            subscriptionId: payload?.data?.subscription_id || paymentId,
            productId: productId || null,
            paymentId,
            updatedAt: new Date().toISOString(),
          });
        }
        console.log(`[webhook][${cid}] ✅ payment.succeeded`, { eventId, payloadType, id: payload?.data?.payment_id });
        break;
      }
      case "payment.failed": {
        const email = payload?.data?.customer?.email;
        const productId = payload?.data?.product_id;
        const paymentId = payload?.data?.payment_id;

        if (email) {
          let plan = "monthly";
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) plan = "yearly";

          updateUserSubscription(email, {
            status: "failed",
            plan,
            subscriptionId: payload?.data?.subscription_id || paymentId,
            productId,
            paymentId,
            updatedAt: new Date().toISOString(),
          }).catch((e: any) => console.error(`[webhook][${cid}] updateUserSubscription error:`, e));
        }
        console.log(`[webhook][${cid}] payment.failed`, { eventId, payloadType, id: payload?.data?.payment_id });
        break;
      }
      case "subscription.active": {
        const email = payload?.data?.customer?.email;
        const productId = payload?.data?.product_id;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          let plan = "monthly";
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) plan = "yearly";

          updateUserSubscription(email, {
            status: "active",
            plan,
            subscriptionId,
            productId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e: any) => console.error(`[webhook][${cid}] updateUserSubscription error:`, e));
        }
        console.log(`[webhook][${cid}] ✅ subscription.active`, { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.renewed": {
        const email = payload?.data?.customer?.email;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          updateUserSubscription(email, {
            status: "active",
            subscriptionId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e: any) => console.error(`[webhook][${cid}] updateUserSubscription error:`, e));
        }
        console.log(`[webhook][${cid}] ✅ subscription.renewed`, { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.cancelled":
      case "subscription.failed":
      case "subscription.expired": {
        const email = payload?.data?.customer?.email;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          updateUserSubscription(email, {
            status: eventType.replace("subscription.", "") as any,
            subscriptionId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e: any) => console.error(`[webhook][${cid}] updateUserSubscription error:`, e));
        }
        console.log(`[webhook][${cid}] ⚠️ ${eventType}`, { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "subscription.on_hold": {
        console.log(`[webhook][${cid}] subscription.on_hold`, { eventId, payloadType, id: payload?.data?.subscription_id });
        break;
      }
      case "subscription.plan_changed": {
        const email = payload?.data?.customer?.email;
        const productId = payload?.data?.product_id;
        const subscriptionId = payload?.data?.subscription_id;

        if (email) {
          let plan = "monthly";
          if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) plan = "yearly";

          updateUserSubscription(email, {
            status: "active",
            plan,
            subscriptionId,
            productId,
            paymentId: null,
            updatedAt: new Date().toISOString(),
          }).catch((e: any) => console.error(`[webhook][${cid}] updateUserSubscription error:`, e));
        }
        console.log(`[webhook][${cid}] subscription.plan_changed`, { eventId, payloadType, id: subscriptionId });
        break;
      }
      case "refund.succeeded":
      case "refund.failed": {
        console.log(`[webhook][${cid}] ${eventType}`, { eventId, payloadType, id: payload?.data?.refund_id });
        break;
      }
      case "dispute.opened":
      case "dispute.expired":
      case "dispute.accepted":
      case "dispute.cancelled":
      case "dispute.challenged":
      case "dispute.won":
      case "dispute.lost": {
        console.log(`[webhook][${cid}] ${eventType}`, { eventId, payloadType, id: payload?.data?.dispute_id });
        break;
      }
      case "license_key.created": {
        console.log(`[webhook][${cid}] ${eventType}`, { eventId, payloadType, id: payload?.data?.id });
        break;
      }
      default: {
        console.log(`[webhook][${cid}] Unhandled event`, { eventType, payloadType, eventId });
        break;
      }
    }

    // Always acknowledge quickly
    return jsonWithCID(cid, { received: true }, 200);
  } catch (err: any) {
    const cid = crypto.randomUUID();
    console.error(`[webhook][${cid}] Handler error`, err);
    return jsonWithCID(cid, { error: "Webhook handler error" }, 500);
  }
}

/**
 * Simple health check to validate deployment & env wiring
 */
export async function GET() {
  const mode = process.env.DODO_WEBHOOK_RELAXED === "true" ? "relaxed" : "strict";
  const secretConfigured = !!process.env.DODO_WEBHOOK_SECRET;
  const serviceRoleConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cid = crypto.randomUUID();

  return jsonWithCID(cid, {
    ok: true,
    mode,
    secretConfigured,
    serviceRoleConfigured,
    note:
      mode === "relaxed"
        ? "Relaxed mode disables signature verification (dev only). Turn off in production."
        : "Strict mode verifies Svix signatures.",
  });
}