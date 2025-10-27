"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Globe, Moon, Sun, HelpCircle, Percent, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"
import { useData } from "@/contexts/data-context"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { selectedCurrency, setCurrency } = useCurrency()
  const { userSettings, updateUserSettings } = useData()

  // Local state for budget percentages
  const [needsPercent, setNeedsPercent] = useState<number>(50)
  const [wantsPercent, setWantsPercent] = useState<number>(30)
  const [savingsPercent, setSavingsPercent] = useState<number>(20)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Load percentages from user settings
  useEffect(() => {
    if (userSettings) {
      setNeedsPercent(userSettings.needs_percentage ?? 50)
      setWantsPercent(userSettings.wants_percentage ?? 30)
      setSavingsPercent(userSettings.savings_percentage ?? 20)
    }
  }, [userSettings])

  // Calculate total percentage
  const totalPercent = needsPercent + wantsPercent + savingsPercent

  // Smart slider handlers that maintain 100% total
  const handleNeedsChange = (value: number) => {
    const newNeeds = value
    const remaining = 100 - newNeeds

    // If other two are both zero, split evenly
    if (wantsPercent === 0 && savingsPercent === 0) {
      setNeedsPercent(newNeeds)
      setWantsPercent(Math.round(remaining * 0.6)) // 60% of remaining
      setSavingsPercent(remaining - Math.round(remaining * 0.6)) // 40% of remaining
      return
    }

    // Distribute remaining proportionally between wants and savings
    const totalOthers = wantsPercent + savingsPercent
    const wantsRatio = wantsPercent / totalOthers
    const savingsRatio = savingsPercent / totalOthers

    setNeedsPercent(newNeeds)
    setWantsPercent(Math.round(remaining * wantsRatio))
    setSavingsPercent(remaining - Math.round(remaining * wantsRatio))
  }

  const handleWantsChange = (value: number) => {
    const newWants = value
    const remaining = 100 - newWants

    // If other two are both zero, split evenly
    if (needsPercent === 0 && savingsPercent === 0) {
      setWantsPercent(newWants)
      setNeedsPercent(Math.round(remaining * 0.7)) // 70% of remaining
      setSavingsPercent(remaining - Math.round(remaining * 0.7)) // 30% of remaining
      return
    }

    // Distribute remaining proportionally between needs and savings
    const totalOthers = needsPercent + savingsPercent
    const needsRatio = needsPercent / totalOthers
    const savingsRatio = savingsPercent / totalOthers

    setWantsPercent(newWants)
    setNeedsPercent(Math.round(remaining * needsRatio))
    setSavingsPercent(remaining - Math.round(remaining * needsRatio))
  }

  const handleSavingsChange = (value: number) => {
    const newSavings = value
    const remaining = 100 - newSavings

    // If other two are both zero, split evenly
    if (needsPercent === 0 && wantsPercent === 0) {
      setSavingsPercent(newSavings)
      setNeedsPercent(Math.round(remaining * 0.7)) // 70% of remaining
      setWantsPercent(remaining - Math.round(remaining * 0.7)) // 30% of remaining
      return
    }

    // Distribute remaining proportionally between needs and wants
    const totalOthers = needsPercent + wantsPercent
    const needsRatio = needsPercent / totalOthers
    const wantsRatio = wantsPercent / totalOthers

    setSavingsPercent(newSavings)
    setNeedsPercent(Math.round(remaining * needsRatio))
    setWantsPercent(remaining - Math.round(remaining * needsRatio))
  }

  // Handle save budget percentages
  const handleSaveBudgetPercentages = async () => {
    if (totalPercent !== 100) {
      setErrorMessage("The percentages must add up to 100%")
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      console.log("Saving budget percentages:", {
        needs_percentage: needsPercent,
        wants_percentage: wantsPercent,
        savings_percentage: savingsPercent,
      })

      const result = await updateUserSettings({
        needs_percentage: needsPercent,
        wants_percentage: wantsPercent,
        savings_percentage: savingsPercent,
      })

      console.log("Save result:", result)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error("Error saving budget percentages:", error)
      setErrorMessage(error?.message || "Failed to save budget percentages. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Badge variant="secondary">Account Settings</Badge>
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
                  Theme
                </Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
            </div>
          </CardContent>
        </Card>

        {/* Budget Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Budget Allocation
            </CardTitle>
            <CardDescription>
              Customize your budget percentages (Needs/Wants/Savings). Changes apply to current and future months.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-8">
              {/* Needs Percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="needs-percent" className="text-base">
                    Needs
                  </Label>
                  <span className="text-2xl font-bold text-primary">{needsPercent}%</span>
                </div>
                <Slider
                  id="needs-percent"
                  min={0}
                  max={100}
                  step={1}
                  value={[needsPercent]}
                  onValueChange={(value) => handleNeedsChange(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Essential expenses (rent, utilities, groceries)</p>
              </div>

              {/* Wants Percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="wants-percent" className="text-base">
                    Wants
                  </Label>
                  <span className="text-2xl font-bold text-primary">{wantsPercent}%</span>
                </div>
                <Slider
                  id="wants-percent"
                  min={0}
                  max={100}
                  step={1}
                  value={[wantsPercent]}
                  onValueChange={(value) => handleWantsChange(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Discretionary spending (entertainment, dining out, hobbies)</p>
              </div>

              {/* Savings Percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="savings-percent" className="text-base">
                    Savings
                  </Label>
                  <span className="text-2xl font-bold text-primary">{savingsPercent}%</span>
                </div>
                <Slider
                  id="savings-percent"
                  min={0}
                  max={100}
                  step={1}
                  value={[savingsPercent]}
                  onValueChange={(value) => handleSavingsChange(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Future goals (emergency fund, investments, retirement)</p>
              </div>
            </div>

            <Separator />

            {/* Total and Save Button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    Total: <span className={totalPercent === 100 ? "text-green-500" : "text-red-500"}>{totalPercent}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalPercent === 100 ? "Perfect! Your budget is balanced." : "Total must equal 100%"}
                  </p>
                </div>
                <Button onClick={handleSaveBudgetPercentages} disabled={totalPercent !== 100 || isSaving}>
                  {isSaving ? "Saving..." : saveSuccess ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Saved!
                    </span>
                  ) : "Save Budget Allocation"}
                </Button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                  {errorMessage}
                </div>
              )}

              {/* Success Message */}
              {saveSuccess && (
                <div className="text-sm text-green-500 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                  Budget allocation saved successfully! Changes will apply to current and future months.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a
                href="mailto:support@orgatreeker.com"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
