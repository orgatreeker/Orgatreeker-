"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type Plan = {
  id: string;
  key?: string;
  name: string;
  subtitle?: string;
  priceLabel?: string;
  features?: string[];
  popular?: boolean;
};

export interface PricingTableTwoProps {
  plans: Plan[];
  title?: string;
  description?: string;
  onPlanSelect?: (planId: string) => void;
  size?: "small" | "medium" | "large";
  theme?: "minimal" | "classic";
  loadingPlanId?: string | null;
}

const sizeClasses = (size: PricingTableTwoProps["size"]) => {
  switch (size) {
    case "small":
      return { title: "text-2xl md:text-3xl", price: "text-xl", features: "text-sm", gridGap: "gap-4", padding: "p-4" };
    case "large":
      return { title: "text-4xl md:text-5xl", price: "text-3xl", features: "text-base", gridGap: "gap-8", padding: "p-8" };
    case "medium":
    default:
      return { title: "text-3xl md:text-4xl", price: "text-2xl", features: "text-sm", gridGap: "gap-6", padding: "p-6" };
  }
};

export function PricingTableTwo({
  plans,
  title = "Choose Your Plan",
  description,
  onPlanSelect,
  size = "medium",
  theme = "classic",
  loadingPlanId = null,
}: PricingTableTwoProps) {
  const sz = sizeClasses(size);
  const borderClass = theme === "minimal" ? "border-border/50" : "border-primary/50";
  const badgeClass = theme === "minimal" ? "bg-muted text-foreground border-border/40" : "bg-primary/10 text-primary border-primary/20";

  return (
    <section className="w-full">
      <div className="text-center mb-8 md:mb-12">
        <h2 className={`${sz.title} font-bold tracking-tight`}>{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{description}</p>
        ) : null}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${sz.gridGap} max-w-4xl mx-auto`}>
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.popular ? `${borderClass} shadow-md` : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                {plan.popular ? (
                  <span className={`text-xs px-2 py-1 rounded-full border ${badgeClass}`}>
                    Best Value
                  </span>
                ) : null}
              </CardTitle>
              {plan.subtitle ? <CardDescription>{plan.subtitle}</CardDescription> : null}
            </CardHeader>
            <CardContent className={sz.padding}>
              {plan.priceLabel ? <div className={`${sz.price} font-bold mb-4`}>{plan.priceLabel}</div> : null}
              {plan.features?.length ? (
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 ${sz.features}`}>
                      <Check className="h-4 w-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button
                className="w-full"
                onClick={() => onPlanSelect?.(plan.id)}
                disabled={!onPlanSelect || !!loadingPlanId}
              >
                {loadingPlanId === plan.id ? "Redirecting..." : "Buy Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PricingTableTwo;