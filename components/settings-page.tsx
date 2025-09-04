"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Globe, Moon, Sun, HelpCircle } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"
import { BudgetSplitCustomization } from "@/components/budget-split-customization"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { selectedCurrency, setCurrency } = useCurrency()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Badge variant="secondary">App Settings</Badge>
      </div>

      <div className="grid gap-6">
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
