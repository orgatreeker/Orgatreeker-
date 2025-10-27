"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { EnhancedPricing } from "@/components/billingsdk/enhanced-pricing";
import { plans } from "@/lib/billingsdk-config";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              OT
            </div>
            <span className="font-semibold">OrgaTreeker</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-accent hover:text-accent-foreground h-9 px-3">
                Dashboard
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-10 md:py-20 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            🎉 Limited Time: Extended Free Trials Available
          </div>
        </div>

        <EnhancedPricing
          plans={plans}
          title="Take Control of Your Finances Today"
          description="Join thousands of users who are already managing their money smarter. Start your free trial today!"
          onPlanSelect={(planId) => handleCheckout(planId)}
          loadingPlanId={loadingPlanId}
        />

        {/* Trust Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          <div className="p-6">
            <div className="text-3xl font-bold mb-2">10,000+</div>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold mb-2">$2M+</div>
            <p className="text-muted-foreground">Money Tracked</p>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold mb-2">4.9/5</div>
            <p className="text-muted-foreground">User Rating</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Secure checkout powered by Dodo Payments •
            <Link href="/terms" className="hover:underline ml-1">Terms</Link> •
            <Link href="/privacy" className="hover:underline ml-1">Privacy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
