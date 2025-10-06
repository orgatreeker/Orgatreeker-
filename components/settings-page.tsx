"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, CreditCard, Globe, Moon, Sun, Bell, Shield, HelpCircle } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { selectedCurrency, setCurrency } = useCurrency()
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  })
  const [notifications, setNotifications] = useState(true)

  const handleProfileSave = () => {
    // In a real app, this would save to a backend
    console.log("Profile saved:", profileData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Badge variant="secondary">Account Settings</Badge>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleProfileSave}>Save Changes</Button>
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
                  Theme
                </Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications about your financial activities</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Account & Billing */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    Active
                  </Badge>
                  <span className="text-sm text-muted-foreground">Premium Plan</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground">January 15, 2024</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Export</Label>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Download My Data
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Actions</Label>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Plan</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Premium Plan</p>
                    <p className="text-sm text-muted-foreground">$9.99/month</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Next Billing Date</Label>
                <p className="text-sm text-muted-foreground">February 15, 2024</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">•••• •••• •••• 4242</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Billing Actions</Label>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Update Payment Method
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Billing History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
