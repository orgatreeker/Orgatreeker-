"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  Globe,
  Moon,
  Sun,
  HelpCircle,
  User,
  Settings,
  Camera,
  Shield,
  Trash2,
  Crown,
  CreditCard,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"
import { BudgetSplitCustomization } from "@/components/budget-split-customization"
import { LogoutButton } from "@/components/logout-button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SettingsPageProps {
  profile?: any
  isPremium?: boolean
}

export function SettingsPage({ profile, isPremium = true }: SettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const { selectedCurrency, setCurrency } = useCurrency()
  const router = useRouter()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  const getPlanInfo = () => {
    if (!profile) return { name: "Free Plan", badge: "Free", variant: "secondary" as const }

    if (profile.subscription_status === "active") {
      if (profile.subscription_plan === "monthly") {
        return { name: "Monthly Pro", badge: "Pro Monthly", variant: "default" as const }
      } else if (profile.subscription_plan === "yearly") {
        return { name: "Annual Pro", badge: "Pro Annual", variant: "default" as const }
      }
    }

    return { name: "Free Plan", badge: "Free", variant: "secondary" as const }
  }

  const planInfo = getPlanInfo()

  const handleCancelSubscription = async () => {
    setIsProcessing(true)
    try {
      // In a real app, you'd call LemonSqueezy API to cancel the subscription
      // For now, we'll just update the local status
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
          subscription_plan: "free",
          subscription_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id)

      if (error) {
        console.error("Error cancelling subscription:", error)
        alert("Failed to cancel subscription. Please try again.")
      } else {
        alert("Subscription cancelled successfully. You'll retain access until the end of your billing period.")
        setShowCancelConfirm(false)
        // Refresh the page to update the UI
        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">App Settings</Badge>
          <Badge
            className={
              isPremium ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-gray-100 text-gray-600"
            }
          >
            <Crown className="w-3 h-3 mr-1" />
            {planInfo.badge}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your subscription plan and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Current Plan</Label>
                <p className="text-sm text-muted-foreground">
                  {planInfo.name} - {isPremium ? "Active subscription" : "Free tier with limited features"}
                </p>
              </div>
              <Badge variant={planInfo.variant}>{planInfo.badge}</Badge>
            </div>

            {profile?.subscription_status === "cancelled" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription has been cancelled. You'll retain access to premium features until the end of your
                  billing period.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Billing History</Label>
                <p className="text-sm text-muted-foreground">View your payment history and download invoices</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>

            <Separator />

            {isPremium && profile?.subscription_status === "active" ? (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Manage Subscription</Label>
                  <p className="text-sm text-muted-foreground">Cancel or modify your subscription plan</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent" onClick={() => router.push("/pricing")}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Change Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Upgrade Plan</Label>
                  <p className="text-sm text-muted-foreground">Unlock premium features with a subscription</p>
                </div>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push("/pricing")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </div>
            )}

            {showCancelConfirm && (
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium">Are you sure you want to cancel your subscription?</p>
                    <p className="text-sm">
                      You'll lose access to premium features at the end of your billing period. Your data will be
                      preserved and you can resubscribe anytime.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancelSubscription}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Cancelling..." : "Yes, Cancel Subscription"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isProcessing}
                      >
                        Keep Subscription
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your profile picture, display name, and personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Profile Picture</Label>
                <p className="text-sm text-muted-foreground">Upload and manage your profile picture</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                <Camera className="mr-2 h-4 w-4" />
                Change Picture
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Display Name</Label>
                <p className="text-sm text-muted-foreground">Update your name shown across the app</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Edit Name
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.email || "View your account email (managed by Google)"}
                </p>
              </div>
              <Button variant="outline" disabled className="bg-muted">
                <Mail className="mr-2 h-4 w-4" />
                View Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>Manage your account security, privacy, and account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Account Security</Label>
                <p className="text-sm text-muted-foreground">View account information and security settings</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                <Shield className="mr-2 h-4 w-4" />
                Manage Security
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sign Out</Label>
                <p className="text-sm text-muted-foreground">Sign out of your account securely</p>
              </div>
              <LogoutButton
                variant="button"
                className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground"
              >
                Sign Out
              </LogoutButton>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your app experience and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Currency</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred currency for displaying amounts</p>
              </div>
              <Select
                value={selectedCurrency.code}
                onValueChange={(code) => {
                  const currency = CURRENCIES.find((c) => c.code === code)
                  if (currency) setCurrency(currency)
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {currency.symbol} {currency.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">{currency.country}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </div>
          </CardContent>
        </Card>

        <BudgetSplitCustomization />

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </CardTitle>
            <CardDescription>Get help and contact support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <HelpCircle className="h-6 w-6" />
                <span>Help Center</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Mail className="h-6 w-6" />
                <span>Contact Support</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Globe className="h-6 w-6" />
                <span>Community</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
