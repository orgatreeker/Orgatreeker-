"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Mail, Zap } from "lucide-react";
import type { PricingPlan } from "@/lib/billingsdk-config";

export interface EnhancedPricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  onPlanSelect?: (planId: string) => void;
  loadingPlanId?: string | null;
}

export function EnhancedPricing({
  plans,
  title = "Choose Your Plan",
  description,
  onPlanSelect,
  loadingPlanId = null,
}: EnhancedPricingProps) {

  const handlePlanSelect = (plan: PricingPlan) => {
    if (plan.key === 'custom') {
      // Open email for custom plan
      window.location.href = 'mailto:support@orgatreeker.com?subject=Enterprise Plan Inquiry&body=Hi, I\'m interested in the Enterprise plan for $299/year. Please provide more details.';
    } else {
      onPlanSelect?.(plan.id);
    }
  };

  return (
    <section className="w-full">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Money-back guarantee</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isYearly = plan.key === 'yearly';
          const isCustom = plan.key === 'custom';
          const isMonthly = plan.key === 'monthly';

          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                isYearly
                  ? 'border-primary shadow-xl scale-105 md:scale-110 z-10 bg-gradient-to-br from-background to-primary/5'
                  : 'hover:scale-105'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className={`absolute top-0 right-0 ${
                  isYearly
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-primary'
                } text-white px-4 py-1 text-xs font-bold rounded-bl-lg`}>
                  {plan.badge}
                </div>
              )}

              {/* Recommended Pulse Effect */}
              {isYearly && (
                <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-primary/20 to-orange-500/20 blur-xl -z-10 animate-pulse" />
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  {isYearly && (
                    <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  )}
                </div>
                <CardDescription className="text-base">{plan.subtitle}</CardDescription>

                {/* Trial Badge */}
                {plan.trial && !isCustom && (
                  <Badge variant="secondary" className="mt-3 w-fit text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    {plan.trial}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing Section */}
                <div>
                  {/* Original Price (crossed out) */}
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        49% OFF
                      </Badge>
                    </div>
                  )}

                  {/* Current Price */}
                  <div className="flex items-baseline gap-2">
                    <span className={`font-bold ${
                      isYearly ? 'text-5xl' : 'text-4xl'
                    }`}>
                      {plan.priceLabel.split('/')[0]}
                    </span>
                    <span className="text-lg text-muted-foreground">
                      /{plan.priceLabel.split('/')[1]}
                    </span>
                  </div>

                  {/* Savings Highlight */}
                  {plan.savings && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      {plan.savings}
                    </div>
                  )}

                  {/* Value Comparison */}
                  {isYearly && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Just $4.08/month when paid annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    isYearly
                      ? 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 shadow-lg text-base font-semibold'
                      : ''
                  }`}
                  variant={plan.ctaVariant || 'default'}
                  size="lg"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={!!loadingPlanId}
                >
                  {loadingPlanId === plan.id ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      {isCustom && <Mail className="h-4 w-4 mr-2" />}
                      {plan.ctaText || 'Get Started'}
                    </>
                  )}
                </Button>

                {/* No Card Required Text */}
                {!isCustom && (
                  <p className="text-xs text-center text-muted-foreground">
                    No credit card required for trial
                  </p>
                )}

                {/* Divider */}
                <div className="border-t pt-6">
                  <p className="text-sm font-semibold mb-4">
                    {isCustom ? 'Enterprise Features:' : 'Everything included:'}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className={`h-5 w-5 mt-0.5 shrink-0 ${
                          isYearly ? 'text-primary' : 'text-green-500'
                        }`} />
                        <span className={idx === 0 && isYearly ? 'font-semibold' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social Proof for Yearly */}
                {isYearly && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-center text-muted-foreground italic">
                      ⭐ Chosen by 83% of our customers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Reassurance Section */}
      <div className="mt-16 text-center max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div>
            <p className="font-medium mb-2">Can I cancel anytime?</p>
            <p className="text-sm text-muted-foreground">
              Yes! Cancel your subscription anytime with no penalties or fees. Your access continues until the end of your billing period.
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">What happens after the trial?</p>
            <p className="text-sm text-muted-foreground">
              After your trial ends, you'll be charged automatically. Cancel before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Is my data secure?</p>
            <p className="text-sm text-muted-foreground">
              Absolutely! We use bank-level encryption and never share your financial data. Your privacy is our priority.
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Can I upgrade or downgrade?</p>
            <p className="text-sm text-muted-foreground">
              Yes! Switch between plans anytime. We'll prorate the difference and adjust your next billing accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Questions about the Enterprise plan?{" "}
          <a
            href="mailto:support@orgatreeker.com"
            className="text-primary hover:underline font-medium"
          >
            Contact us at support@orgatreeker.com
          </a>
        </p>
      </div>
    </section>
  );
}

export default EnhancedPricing;
