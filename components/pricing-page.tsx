"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PricingPageProps {
  user?: any
}

export function PricingPage({ user }: PricingPageProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const checkoutUrls = {
    monthly: "https://orgatreeker.lemonsqueezy.com/buy/0a307afb-5bfd-4b83-9219-1e144302c550",
    annual: "https://orgatreeker.lemonsqueezy.com/buy/f03f4299-f0cb-473a-849b-577e6b5d78e2",
  }

  const handleUpgrade = (plan: "monthly" | "annual") => {
    const baseUrl = checkoutUrls[plan]

    const params = new URLSearchParams()
    params.set("checkout[custom][redirect_url]", `${window.location.origin}/auth`)

    const checkoutUrl = `${baseUrl}?${params.toString()}`
    window.location.href = checkoutUrl
  }

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText("GREAT50OFF")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy coupon code:", err)
    }
  }

  const features = [
    "Unlimited income sources",
    "Advanced insights & analytics",
    "Full savings breakdown (50/30/20 or custom)",
    "Detailed subcategory tracking",
    "Multi-month financial history",
    "Priority email support",
    "Export data to CSV/Excel",
    "Multi-currency support",
    "Customizable budgeting percentages",
    "Real-time dashboard updates",
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-neutral-950 dark:text-neutral-50" />
            <span className="text-xl font-bold font-sans text-neutral-950 dark:text-neutral-50">Orgatreeker</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-neutral-950 dark:text-neutral-50 text-balance">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 text-pretty">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative bg-card border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl">
            <CardHeader className="py-6 px-6">
              <CardTitle className="text-2xl font-semibold font-sans flex items-center gap-2 text-card-foreground">
                <Crown className="h-6 w-6 text-neutral-950 dark:text-neutral-50" />
                Monthly Plan
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold font-mono text-neutral-950 dark:text-neutral-50">$12</span>
                <span className="text-muted-foreground font-sans">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6 px-6">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-sans text-card-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6 bg-neutral-950 hover:bg-neutral-800 text-neutral-50 font-sans font-medium"
                onClick={() => handleUpgrade("monthly")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Start Monthly Plan
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative bg-card border-neutral-950 dark:border-neutral-50 shadow-lg rounded-xl">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neutral-950 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 font-sans font-medium">
              Most Popular
            </Badge>
            <CardHeader className="py-6 px-6">
              <CardTitle className="text-2xl font-semibold font-sans flex items-center gap-2 text-card-foreground">
                <Crown className="h-6 w-6 text-neutral-950 dark:text-neutral-50" />
                Yearly Plan
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Best value - save $45 per year
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold font-mono text-neutral-950 dark:text-neutral-50">$99</span>
                <span className="text-muted-foreground font-sans">/year</span>
                <div className="text-sm text-green-600 font-medium font-sans mt-1">$8.25/month - Save $45!</div>
              </div>

              <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-sans text-muted-foreground mb-1">Special Offer Code:</p>
                    <code
                      className="text-sm font-mono font-bold text-neutral-950 dark:text-neutral-50 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                      onClick={handleCopyCoupon}
                      onMouseEnter={() => {
                        // Auto-copy on hover
                        navigator.clipboard.writeText("GREAT50OFF").catch(() => {})
                      }}
                    >
                      GREAT50OFF
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCoupon}
                    className="h-8 w-8 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && <p className="text-xs text-green-600 font-sans mt-1">Copied to clipboard!</p>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 py-6 px-6">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-sans text-card-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-6 bg-neutral-950 hover:bg-neutral-800 text-neutral-50 font-sans font-medium"
                onClick={() => handleUpgrade("annual")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Start Yearly Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">What happens after I pay?</h3>
              <p className="text-sm text-muted-foreground">
                After successful payment, you'll be redirected to create your account and access the full app.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll receive a notification in the app.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards and secure payment methods via Lemon Squeezy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. All your financial data is encrypted and stored securely with enterprise-grade security.
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
