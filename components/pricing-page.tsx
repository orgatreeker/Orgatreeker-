"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Crown, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PricingPageProps {
  user?: any
}

export function PricingPage({ user }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const router = useRouter()

  const checkoutUrls = {
    monthly: "https://orgatreeker.lemonsqueezy.com/buy/0a307afb-5bfd-4b83-9219-1e144302c550",
    annual: "https://orgatreeker.lemonsqueezy.com/buy/f03f4299-f0cb-473a-849b-577e6b5d78e2",
  }

  const handleUpgrade = (plan: "monthly" | "annual") => {
    const baseUrl = checkoutUrls[plan]
    const checkoutUrl = user?.email
      ? `${baseUrl}?checkout[custom][user_email]=${encodeURIComponent(user.email)}&checkout[email]=${encodeURIComponent(user.email)}`
      : baseUrl

    console.log("[v0] Opening checkout with URL:", checkoutUrl)
    window.open(checkoutUrl, "_blank")
  }

  const features = {
    free: [
      "Track income from up to 5 sources",
      "Dashboard with basic insights",
      "Manual expense tracking",
      "Customizable budgeting percentages",
      "Multi-currency support",
    ],
    premium: [
      "Everything in Free Plan",
      "Unlimited income sources",
      "Advanced insights & analytics",
      "Full savings breakdown (50/30/20 or custom)",
      "Detailed subcategory tracking",
      "Multi-month financial history",
      "Priority email support",
      "Export data to CSV/Excel",
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => (user ? router.push("/app") : router.push("/"))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {user ? "Back to App" : "Back to Home"}
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Orgatreeker</span>
            </div>
          </div>
          {user && <Badge variant="secondary">Signed in as {user.email}</Badge>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start free and upgrade when you're ready for advanced features
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              onClick={() => setBillingCycle("monthly")}
              className="px-6"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "annual" ? "default" : "outline"}
              onClick={() => setBillingCycle("annual")}
              className="px-6 relative"
            >
              Annual
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">Save $45</Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Forever free</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Limitations */}
              <div className="pt-4 border-t">
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm">Advanced analytics & insights</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm">Unlimited income sources</span>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm">Detailed subcategory tracking</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 bg-transparent"
                onClick={() => (user ? router.push("/app") : router.push("/auth/sign-up"))}
              >
                {user ? "Continue with Free" : "Start Free Trial"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                Pro Plan
              </CardTitle>
              <CardDescription>
                {billingCycle === "monthly"
                  ? "Billed monthly or save with annual plan"
                  : "Billed annually - save $45 per year"}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${billingCycle === "monthly" ? "12" : "99"}</span>
                <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                {billingCycle === "annual" && (
                  <div className="text-sm text-muted-foreground mt-1">$8.25/month when billed annually</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6 bg-primary hover:bg-primary/90"
                onClick={() => handleUpgrade(billingCycle)}
              >
                <Crown className="h-4 w-4 mr-2" />
                Start Pro Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! The free plan is available forever with core features. Pro plan includes a trial period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and other secure payment methods via Lemon Squeezy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. You can cancel your subscription at any time with no cancellation fees.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            For support, contact{" "}
            <a href="mailto:support@orgatreeker.com" className="text-primary hover:underline">
              support@orgatreeker.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
