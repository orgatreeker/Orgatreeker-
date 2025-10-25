"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// BillingSDK UI component (locally scaffolded)
import { PricingTableTwo } from "@/components/billingsdk/pricing-table-two";
// Plans config mapped to your Dodo Products
import { plans } from "@/lib/billingsdk-config";

type PlanKey = "monthly" | "yearly";

export default function PricingClient() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    if (!productId) {
      alert("Missing product_id. Set NEXT_PUBLIC_DODO_PRODUCT_MONTHLY / NEXT_PUBLIC_DODO_PRODUCT_YEARLY in .env.local.");
      return;
    }

    try {
      setLoadingPlanId(productId);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          // Use production domain for return URL
          return_url: "https://app.orgatreeker.com/success",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create checkout session");
      }

      const data = await res.json();
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout_url returned from server");
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Something went wrong starting checkout");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              FT
            </div>
            <span className="font-semibold">FinanceTracker</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-3">
                Home
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-6xl">
        <PricingTableTwo
          plans={plans}
          title="Simple, transparent pricing"
          description="Choose a plan that fits your budgeting needs. Upgrade or cancel anytime."
          onPlanSelect={(planId) => handleCheckout(planId)}
          size="medium"
          theme="classic"
          loadingPlanId={loadingPlanId}
        />

        <div className="mt-12 text-center text-sm text-muted-foreground">
          Secure checkout is powered by Dodo Payments. Taxes may apply based on your location.
        </div>
      </main>
    </div>
  );
}
