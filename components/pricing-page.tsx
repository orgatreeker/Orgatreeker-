"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Star, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface PricingPageProps {
  user?: User | null
}

export function PricingPage({ user }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const handleCheckout = (planType: "monthly" | "yearly") => {
    const checkoutUrl =
      planType === "monthly"
        ? "https://orgatreeker.lemonsqueezy.com/buy/0a307afb-5bfd-4b83-9219-1e144302c550"
        : "https://orgatreeker.lemonsqueezy.com/buy/f03f4299-f0cb-473a-849b-577e6b5d78e2"

    // Add user ID to checkout URL for tracking
    const urlWithUser = user ? `${checkoutUrl}?checkout[custom][user_id]=${user.id}` : checkoutUrl
    window.open(urlWithUser, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <Link href={user ? "/app" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FT</span>
            </div>
            <span className="font-semibold text-lg">FinanceTracker</span>
          </Link>
          {user && (
            <Link href="/app">
              <Button variant="outline">Back to App</Button>
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            Unlock Premium Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Your Money, Finally <span className="text-primary">Under Control</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Take control of your finances with advanced budgeting tools, detailed analytics, and personalized insights
            that help you achieve your financial goals.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-lg flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 31%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic budget tracking
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Income management
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Simple expense categories
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Basic dashboard
                </li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                Pro
                <Zap className="w-5 h-5 ml-2 text-primary" />
              </CardTitle>
              <CardDescription>Everything you need to master your finances</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${billingCycle === "monthly" ? "12" : "99"}</span>
                <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                {billingCycle === "yearly" && <div className="text-sm text-green-600 font-medium">Save $45/year</div>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Advanced budget analytics
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Custom budget categories
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Detailed financial reports
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Goal tracking & insights
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Export data & reports
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full" onClick={() => handleCheckout(billingCycle)}>
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground text-sm">
              Get detailed insights into your spending patterns and financial trends
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground text-sm">
              Your financial data is encrypted and stored securely with bank-level security
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-muted-foreground text-sm">
              Track your finances in real-time with instant updates and notifications
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Join thousands of users who have taken control of their finances</p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => handleCheckout(billingCycle)}>
              Start Your Pro Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!user && (
              <Link href="/auth">
                <Button variant="outline" size="lg">
                  Sign Up Free
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
