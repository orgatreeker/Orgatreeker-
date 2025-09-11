"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Globe, Moon, Sun, HelpCircle, User, Settings, CreditCard, Camera, Shield, Trash2 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"
import { BudgetSplitCustomization } from "@/components/budget-split-customization"
import { LogoutButton } from "@/components/logout-button"
import { useRouter } from "next/navigation"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { selectedCurrency, setCurrency } = useCurrency()
  const router = useRouter()

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Badge variant="secondary">App Settings</Badge>
      </div>

      <div className="grid gap-6">
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
                <p className="text-sm text-muted-foreground">View your account email (managed by Google)</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Settings
            </CardTitle>
            <CardDescription>Manage your subscription, billing history, and payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Current Plan</Label>
                <p className="text-sm text-muted-foreground">You are currently on the Free plan</p>
              </div>
              <Badge variant="secondary">Free Plan</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Upgrade to Pro</Label>
                <p className="text-sm text-muted-foreground">Unlock advanced features and unlimited budgets</p>
              </div>
              <Button variant="outline" className="bg-transparent" onClick={handleUpgrade}>
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Billing History</Label>
                <p className="text-sm text-muted-foreground">View your payment history and invoices</p>
              </div>
              <Button variant="outline" disabled className="bg-muted">
                <Mail className="mr-2 h-4 w-4" />
                View History
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
