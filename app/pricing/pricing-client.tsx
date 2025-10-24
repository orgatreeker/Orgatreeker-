"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

// Expose product IDs via NEXT_PUBLIC_* so client can read them at build-time
const PRODUCT_IDS = {
  monthly: process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY || "pdt_3c1A6P4Cpe8KhGYnJNiCN",
  yearly: process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY || "pdt_SZ87OdK4dC9a9tpHTIUJZ",
};

type PlanKey = "monthly" | "yearly";

const PLANS: {
  key: PlanKey;
  name: string;
  subtitle: string;
  priceLabel: string;
  productEnvKey: string;
  productId: string;
  features: string[];
  cta: string;
  popular?: boolean;
}[] = [
  {
    key: "monthly",
    name: "Monthly",
    subtitle: "Full access, billed monthly",
    priceLabel: "$6.83 / month",
    productEnvKey: "NEXT_PUBLIC_DODO_PRODUCT_MONTHLY",
    productId: PRODUCT_IDS.monthly,
    features: [
      "Complete budget management",
      "Income and expense tracking",
      "Smart insights & reports",
      "Multi-currency support",
      "Email support",
    ],
    cta: "Start Monthly Plan",
  },
  {
    key: "yearly",
    name: "Yearly",
    subtitle: "Best value - save 58%",
    priceLabel: "$34.71 / year",
    productEnvKey: "NEXT_PUBLIC_DODO_PRODUCT_YEARLY",
    productId: PRODUCT_IDS.yearly,
    features: [
      "Everything in Monthly",
      "7 months FREE",
      "Priority support",
      "Advanced analytics",
      "Early access to new features",
    ],
    cta: "Start Yearly Plan",
    popular: true,
  },
];

export default function PricingClient() {
  const [loadingKey, setLoadingKey] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: (typeof PLANS)[number]) => {
    if (!plan.productId) {
      alert(
        `Missing product_id for ${plan.name}. Set ${plan.productEnvKey} in .env.local.`
      );
      return;
    }

    try {
      setLoadingKey(plan.key);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: plan.productId,
          quantity: 1,
          // Redirect to success page after payment completion
          return_url: window.location.origin + "/success",
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
      setLoadingKey(null);
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
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-6xl">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Choose a plan that fits your budgeting needs. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <Card key={plan.key} className={plan.popular ? "border-primary/50 shadow-md" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.popular ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Best Value
                    </span>
                  ) : null}
                </CardTitle>
                <CardDescription>{plan.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">{plan.priceLabel}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleCheckout(plan)}
                  disabled={!!loadingKey}
                >
                  {loadingKey === plan.key ? "Redirecting..." : plan.cta}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Product: <code>{plan.productId}</code>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          Secure checkout is powered by Dodo Payments. Taxes may apply based on your location.
        </div>
      </main>
    </div>
  );
}
