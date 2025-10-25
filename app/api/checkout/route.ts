import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getDodoClient } from "@/lib/dodo";

/**
 * POST /api/checkout
 * Body: { product_id: string; quantity?: number; return_url?: string }
 * Creates a Dodo Payments Checkout Session and returns { checkout_url }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const product_id = typeof body?.product_id === "string" ? body.product_id : "";
    const quantity = Number.isFinite(body?.quantity) && body.quantity > 0 ? Number(body.quantity) : 1;
    const providedReturnUrl = typeof body?.return_url === "string" ? body.return_url : undefined;

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    // Build return URL (absolute or relative supported; default to success page for webhook delay tolerance)
    const origin = req.nextUrl.origin;
    const rawDefault = process.env.DEFAULT_RETURN_URL || `${origin}/success`;
    const resolveReturnUrl = (input: string | undefined, base: string) => {
      try {
        const val = input ?? rawDefault;
        // if absolute URL, return as-is
        if (/^https?:\/\//i.test(val)) return val;
        // else treat as relative against origin
        return new URL(val, base).toString();
      } catch {
        return new URL("/success", base).toString();
      }
    };
    const return_url = resolveReturnUrl(providedReturnUrl, origin);

    // Optionally attach Clerk user as Dodo customer (by email/name)
    const user = await currentUser();
    const customer =
      user?.emailAddresses?.[0]?.emailAddress
        ? {
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || undefined,
            // phone_number can be added if you capture it in Clerk
          }
        : undefined;

    const client = getDodoClient();

    // Create a Checkout Session (reference: Dodo Payments API)
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id,
          quantity,
        },
      ],
      // Always include at least credit/debit per docs guidance
      allowed_payment_method_types: ["credit", "debit"],
      return_url,
      show_saved_payment_methods: true,
      customer, // attach if available (email required)
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
      // force_3ds: false, // optional
      // billing_address: { country: "US" }, // optional - if provided, country is required
    });

    return NextResponse.json(
      {
        session_id: session.session_id,
        checkout_url: session.checkout_url,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}