"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CreditCard, ArrowLeft, DollarSign, Receipt, Crown } from "lucide-react"
import { getProfile, createProfile, type Profile } from "@/lib/profile-utils"

interface BillingSettingsPageProps {
  onBack?: () => void
}

export function BillingSettingsPage({ onBack }: BillingSettingsPageProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Error getting user:", userError)
        return
      }

      setUser(user)

      let profileData = await getProfile(user.id)
      if (!profileData) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim()

        profileData = await createProfile(user.id, user.email || "", fullName)
      }

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error fetching user and profile:", error)
      setMessage({ type: "error", text: "Failed to load billing information" })
    } finally {
      setIsLoading(false)
    }
  }

  const initiatePayment = async (plan: "monthly" | "yearly") => {
    setIsProcessingPayment(true)
    setMessage(null)

    try {
      const response = await fetch("/api/phonepe/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      })

      const result = await response.json()

      if (result.success && result.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = result.paymentUrl
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to initiate payment",
        })
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      setMessage({
        type: "error",
        text: "Failed to initiate payment. Please try again.",
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const isSubscribed =
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing Settings</h1>
            <p className="text-muted-foreground">Manage your subscription and payment information</p>
          </div>
        </div>
        <Badge variant="secondary">Billing</Badge>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>Your current subscription plan and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {isSubscribed
                    ? `${profile?.subscription_plan === "yearly" ? "Annual" : "Monthly"} Plan`
                    : "Free Plan"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed ? "All premium features unlocked" : "Perfect for getting started with basic features"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {isSubscribed ? (profile?.subscription_plan === "yearly" ? "$29" : "$5") : "$0"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed ? (profile?.subscription_plan === "yearly" ? "per year" : "per month") : "per month"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Plan Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Basic budget tracking</li>
                <li>• Income and expense management</li>
                {isSubscribed && (
                  <>
                    <li>• Unlimited income sources</li>
                    <li>• Advanced analytics</li>
                    <li>• Detailed financial insights</li>
                    <li>• Export capabilities</li>
                    <li>• Priority support</li>
                  </>
                )}
                {!isSubscribed && <li>• Simple financial insights</li>}
                <li>• Mobile-friendly interface</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
              <Badge variant="secondary">{isSubscribed ? "Pro User" : "Free Tier"}</Badge>
              {isSubscribed && profile?.subscription_expires_at && (
                <Badge variant="outline">
                  Expires {new Date(profile.subscription_expires_at).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {!isSubscribed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Upgrade Options
              </CardTitle>
              <CardDescription>Unlock all premium features with our paid plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Plan */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Monthly Plan</h4>
                    <Badge variant="default">Popular</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">$5</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Unlimited income sources</li>
                    <li>• Advanced budget analytics</li>
                    <li>• Detailed financial insights</li>
                    <li>• Export data capabilities</li>
                    <li>• Priority support</li>
                  </ul>
                  <Button className="w-full" onClick={() => initiatePayment("monthly")} disabled={isProcessingPayment}>
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade Monthly - $5"
                    )}
                  </Button>
                </div>

                {/* Annual Plan */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Annual Plan</h4>
                    <Badge variant="secondary">Best Value</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">$29</p>
                    <p className="text-sm text-muted-foreground">per year</p>
                    <p className="text-xs text-green-600 font-medium">Save $31/year!</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Everything in Monthly</li>
                    <li>• 2 months free</li>
                    <li>• Advanced reporting</li>
                    <li>• Custom categories</li>
                    <li>• Premium support</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => initiatePayment("yearly")}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade Yearly - $29"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>View your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No billing history</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to a paid plan to see billing history here.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setMessage({ type: "error", text: "Billing history will appear after your first payment" })
                }
              >
                View All Invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment methods and billing information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No payment method added</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a payment method to upgrade to a premium plan</p>
              <Button
                variant="outline"
                onClick={() => setMessage({ type: "error", text: "Payment method management coming soon!" })}
              >
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
