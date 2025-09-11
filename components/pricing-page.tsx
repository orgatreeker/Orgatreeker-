"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

interface PricingPageProps {
  user?: any
}

export function PricingPage({ user }: PricingPageProps) {
  const router = useRouter()

  const checkoutUrls = {
    monthly: "https://orgatreeker.lemonsqueezy.com/buy/0a307afb-5bfd-4b83-9219-1e144302c550",
    annual: "https://orgatreeker.lemonsqueezy.com/buy/f03f4299-f0cb-473a-849b-577e6b5d78e2",
  }

  const handleUpgrade = (plan: "monthly" | "annual") => {
    const baseUrl = checkoutUrls[plan]

    const params = new URLSearchParams()
    params.set("checkout[custom][redirect_url]", `${window.location.origin}/auth/login`)

    const checkoutUrl = `${baseUrl}?${params.toString()}`
    window.location.href = checkoutUrl
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Orgatreeker</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground mb-8">Choose the plan that works best for you</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                Monthly Plan
              </CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full mt-6 bg-primary hover:bg-primary/90" onClick={() => handleUpgrade("monthly")}>
                <Crown className="h-4 w-4 mr-2" />
                Start Monthly Plan
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative border-primary shadow-lg">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" />
                Yearly Plan
              </CardTitle>
              <CardDescription>Best value - save $45 per year</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/year</span>
                <div className="text-sm text-green-600 font-medium mt-1">$8.25/month - Save $45!</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full mt-6 bg-primary hover:bg-primary/90" onClick={() => handleUpgrade("annual")}>
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
              <h3 className="font-semibeld mb-2">Is my data secure?</h3>
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
