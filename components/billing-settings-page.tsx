"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUserAndProfile()

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("[v0] Profile updated:", payload.new)
          if (payload.new) {
            setProfile(payload.new as Profile)
            const isUserPremium =
              payload.new.subscription_status === "active" &&
              (payload.new.subscription_plan === "monthly" || payload.new.subscription_plan === "yearly")
            setIsPremium(isUserPremium)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

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
        const isUserPremium =
          profileData.subscription_status === "active" &&
          (profileData.subscription_plan === "monthly" || profileData.subscription_plan === "yearly")
        setIsPremium(isUserPremium)

        console.log("[v0] Billing page - Premium status:", {
          subscription_status: profileData.subscription_status,
          subscription_plan: profileData.subscription_plan,
          isPremium: isUserPremium,
        })
      }
    } catch (error) {
      console.error("Error fetching user and profile:", error)
      setMessage({ type: "error", text: "Failed to load billing information" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const getPlanInfo = () => {
    if (!profile)
      return { name: "Free Plan", price: "$0", period: "per month", badge: "Free Plan", variant: "secondary" as const }

    if (profile.subscription_status === "active") {
      if (profile.subscription_plan === "monthly") {
        return {
          name: "Pro Monthly",
          price: "$12",
          period: "per month",
          badge: "Pro Monthly",
          variant: "default" as const,
        }
      } else if (profile.subscription_plan === "yearly") {
        return {
          name: "Pro Yearly",
          price: "$99",
          period: "per year",
          badge: "Pro Yearly",
          variant: "default" as const,
        }
      }
    }

    return { name: "Free Plan", price: "$0", period: "per month", badge: "Free Plan", variant: "secondary" as const }
  }

  const planInfo = getPlanInfo()

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
                <h3 className="text-lg font-semibold">{planInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isPremium
                    ? "Premium features unlocked with advanced analytics"
                    : "Perfect for getting started with basic features"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{planInfo.price}</p>
                <p className="text-sm text-muted-foreground">{planInfo.period}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Plan Features</h4>
              {isPremium ? (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Everything in Free Plan</li>
                  <li>• Unlimited income sources</li>
                  <li>• Advanced insights & analytics</li>
                  <li>• Full savings breakdown (50/30/20 or custom)</li>
                  <li>• Detailed subcategory tracking</li>
                  <li>• Multi-month financial history</li>
                  <li>• Priority email support</li>
                  <li>• Export data to CSV/Excel</li>
                </ul>
              ) : (
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Track income from up to 5 sources</li>
                  <li>• Dashboard with basic insights</li>
                  <li>• Manual expense tracking</li>
                  <li>• Customizable budgeting percentages</li>
                  <li>• Multi-currency support</li>
                </ul>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
              <Badge
                variant={planInfo.variant}
                className={isPremium ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : ""}
              >
                {isPremium && <Crown className="w-3 h-3 mr-1" />}
                {planInfo.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {!isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>Unlock premium features and unlimited access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border-2 border-primary p-6 space-y-4 bg-primary/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Pro Plan
                  </h4>
                  <Badge variant="default">Most Popular</Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">$12</span>
                  <span className="text-muted-foreground">/month</span>
                  <span className="text-sm text-muted-foreground">or $99/year (save $45)</span>
                </div>

                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Everything in Free Plan
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Unlimited income sources
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Advanced insights & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Full savings breakdown (50/30/20 or custom)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Detailed subcategory tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Multi-month financial history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Priority email support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    Export data to CSV/Excel
                  </li>
                </ul>

                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleUpgrade}>
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manage Subscription */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Manage Subscription
              </CardTitle>
              <CardDescription>Update your subscription and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Subscription Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Your subscription is active and all features are unlocked
                  </p>
                  {profile?.subscription_current_period_end && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Next billing: {new Date(profile.subscription_current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Update Payment Method
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Cancel Subscription
                </Button>
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
            {isPremium ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Your billing history will appear here. Contact support if you need assistance with invoices.
                </div>
                <Button variant="outline">
                  <Receipt className="mr-2 h-4 w-4" />
                  Download Invoices
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No billing history</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You're currently on the free plan. Upgrade to a paid plan to see billing history here.
                </p>
                <Button variant="outline" onClick={handleUpgrade}>
                  Upgrade to See History
                </Button>
              </div>
            )}
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
            {isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Payment Method Active</p>
                      <p className="text-sm text-muted-foreground">Managed through Lemon Squeezy</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No payment method added</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a payment method to upgrade to a premium plan</p>
                <Button variant="outline" onClick={handleUpgrade}>
                  Add Payment Method
                </Button>
              </div>
            )}
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
