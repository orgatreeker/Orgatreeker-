import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getDodoClient } from "@/lib/dodo";
import { z } from "zod";
import crypto from "crypto";

/**
 * Robust request schema validation
 */
const BodySchema = z.object({
  product_id: z.string().min(1, "product_id is required"),
  quantity: z.number().int().positive().max(100).optional(),
  // allow relative or absolute; we'll resolve later
  return_url: z.string().min(1).optional(),
});

function jsonWithCID(cid: string, data: unknown, init?: number | ResponseInit) {
  const res = NextResponse.json(data, typeof init === "number" ? { status: init } : init);
  res.headers.set("x-correlation-id", cid);
  return res;
}

function isZodError(err: unknown): err is z.ZodError {
  return !!err && typeof err === "object" && "issues" in (err as any);
}

function redactUrl(u?: string | null) {
  if (!u) return u;
  try {
    const url = new URL(u);
    url.search = "";
    return url.toString();
  } catch {
    return u;
  }
}

/**
 * POST /api/checkout
 * Body: { product_id: string; quantity?: number; return_url?: string }
 * Creates a Dodo Payments Checkout Session and returns { checkout_url }
 */
export async function POST(req: NextRequest) {
  // Correlation ID for tracing end-to-end across logs and responses
  const cid = crypto.randomUUID();

  try {
    // Read raw once, then JSON parse for better error messages
    const raw = await req.text();
    let parsedBody: unknown = {};
    try {
      parsedBody = raw ? JSON.parse(raw) : {};
    } catch {
      // Will be handled by zod validation with better message
      parsedBody = {};
    }

    const body = BodySchema.parse(parsedBody);
    const product_id = body.product_id;
    const quantity = body.quantity ?? 1;
    const providedReturnUrl = body.return_url;

    // Determine origin (prod uses configured domain, otherwise request origin)
    const productionDomain =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.DEFAULT_RETURN_URL?.replace("/success", "") ||
      "https://app.orgatreeker.com";
    const origin = process.env.NODE_ENV === "production" ? productionDomain : req.nextUrl.origin;

    // Build return URL (absolute or relative supported; default to /success to allow webhook delay)
    const rawDefault = process.env.DEFAULT_RETURN_URL || `${origin}/success`;
    const resolveReturnUrl = (input: string | undefined, base: string) => {
      try {
        const val = input ?? rawDefault;
        if (/^https?:\/\//i.test(val)) return val; // already absolute
        return new URL(val, base).toString(); // relative -> absolute
      } catch {
        return new URL("/success", base).toString();
      }
    };
    const return_url = resolveReturnUrl(providedReturnUrl, origin);

    console.log(
      `[checkout][${cid}] Creating checkout session -> product_id=${product_id} qty=${quantity} return_url=${redactUrl(
        return_url,
      )}`,
    );

    // Attach Clerk user as Dodo customer when email is available
    const user = await currentUser().catch(() => null);
    const customer =
      user?.emailAddresses?.[0]?.emailAddress
        ? {
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || undefined,
          }
        : undefined;

    const client = getDodoClient();

    // Create a Checkout Session using Dodo Payments Node SDK
    // Reference (server_name=dodopayments_api search_docs): POST /checkouts -> checkoutSessions.create
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id,
          quantity,
        },
      ],
      // Always include fallback per docs
      allowed_payment_method_types: ["credit", "debit"],
      return_url,
      show_saved_payment_methods: true,
      customer,
      customization: {
        theme: "system",
        show_order_details: true,
        show_on_demand_tag: true,
      },
      feature_flags: {
        allow_discount_code: true,
        allow_currency_selection: true,
        allow_tax_id: true,
        allow_phone_number_collection: true,
      },
    });

    console.log(`[checkout][${cid}] Created session: ${session.session_id}`);

    return jsonWithCID(cid, { session_id: session.session_id, checkout_url: session.checkout_url }, 200);
  } catch (err: any) {
    // Validation failures
    if (isZodError(err)) {
      console.warn(`[checkout][${cid}] Validation error`, err.issues);
      return jsonWithCID(cid, { error: "Invalid request body", issues: err.issues }, 400);
    }

    // Attempt to surface structured SDK/API error details without leaking sensitive info
    const status: number | undefined =
      typeof err?.status === "number"
        ? err.status
        : typeof err?.response?.status === "number"
        ? err.response.status
        : undefined;

    const errorPayload = {
      error: "Failed to create checkout session",
      message: err?.message || "Unknown error",
      code: err?.code || err?.response?.data?.error_code || undefined,
    };

    if (status && status >= 400 && status < 500) {
      console.warn(`[checkout][${cid}] Dodo API 4xx`, { status, code: errorPayload.code });
      return jsonWithCID(cid, errorPayload, status);
    }

    console.error(`[checkout][${cid}] Unexpected error`, {
      message: err?.message,
      status,
    });
    return jsonWithCID(cid, errorPayload, 500);
  }
}