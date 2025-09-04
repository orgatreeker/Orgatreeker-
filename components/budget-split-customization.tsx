"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Target, TrendingUp, PiggyBank, Loader2, CheckCircle, RotateCcw, Sparkles } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"

interface BudgetSplit {
  needs: number
  wants: number
  savings: number
}

interface BudgetSplitCustomizationProps {
  userId?: string
  onSplitChange?: (split: BudgetSplit) => void
}

const PRESET_SPLITS = {
  "50-30-20": { needs: 50, wants: 30, savings: 20, name: "50/30/20 Rule", description: "Classic balanced approach" },
  "60-20-20": {
    needs: 60,
    wants: 20,
    savings: 20,
    name: "Conservative",
    description: "Higher needs, moderate savings",
  },
  "40-30-30": {
    needs: 40,
    wants: 30,
    savings: 30,
    name: "Aggressive Saver",
    description: "Maximize savings potential",
  },
  "70-20-10": {
    needs: 70,
    wants: 20,
    savings: 10,
    name: "Tight Budget",
    description: "High fixed costs, minimal savings",
  },
  "45-25-30": { needs: 45, wants: 25, savings: 30, name: "Wealth Builder", description: "Focus on long-term wealth" },
  custom: { needs: 50, wants: 30, savings: 20, name: "Custom", description: "Set your own percentages" },
}

export function BudgetSplitCustomization({ userId, onSplitChange }: BudgetSplitCustomizationProps) {
  const [currentSplit, setCurrentSplit] = useState<BudgetSplit>({ needs: 50, wants: 30, savings: 20 })
  const [selectedPreset, setSelectedPreset] = useState<string>("50-30-20")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [totalIncome, setTotalIncome] = useState(0)
  const { formatAmount } = useCurrency()
  const supabase = createClient()

  useEffect(() => {
    fetchUserAndBudgetData()
  }, [])

  const fetchUserAndBudgetData = async () => {
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

      // Fetch user's current budget preferences
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("budget_needs_percentage, budget_wants_percentage, budget_savings_percentage")
        .eq("id", user.id)
        .single()

      if (profile && !profileError) {
        const split = {
          needs: profile.budget_needs_percentage || 50,
          wants: profile.budget_wants_percentage || 30,
          savings: profile.budget_savings_percentage || 20,
        }
        setCurrentSplit(split)

        // Find matching preset or set to custom
        const matchingPreset = Object.entries(PRESET_SPLITS).find(
          ([key, preset]) =>
            key !== "custom" &&
            preset.needs === split.needs &&
            preset.wants === split.wants &&
            preset.savings === split.savings,
        )
        setSelectedPreset(matchingPreset ? matchingPreset[0] : "custom")
      }

      // Fetch current month's income for calculations
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      const { data: income, error: incomeError } = await supabase
        .from("income_sources")
        .select("amount")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)

      if (income && !incomeError) {
        const total = income.reduce((sum, source) => sum + source.amount, 0)
        setTotalIncome(total)
      }
    } catch (error) {
      console.error("Error fetching budget data:", error)
      setMessage({ type: "error", text: "Failed to load budget preferences" })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)
    if (presetKey !== "custom") {
      const preset = PRESET_SPLITS[presetKey as keyof typeof PRESET_SPLITS]
      const newSplit = { needs: preset.needs, wants: preset.wants, savings: preset.savings }
      setCurrentSplit(newSplit)
      onSplitChange?.(newSplit)
    }
  }

  const handleSliderChange = (type: keyof BudgetSplit, value: number[]) => {
    const newValue = value[0]
    const newSplit = { ...currentSplit, [type]: newValue }

    // Auto-adjust other values to maintain 100% total
    const total = newSplit.needs + newSplit.wants + newSplit.savings
    if (total !== 100) {
      const diff = 100 - total
      const otherTypes = Object.keys(newSplit).filter((key) => key !== type) as (keyof BudgetSplit)[]

      // Distribute the difference proportionally
      otherTypes.forEach((otherType, index) => {
        if (index === otherTypes.length - 1) {
          // Last item gets the remainder
          newSplit[otherType] = Math.max(0, newSplit[otherType] + diff)
        } else {
          const adjustment = Math.floor(diff / otherTypes.length)
          newSplit[otherType] = Math.max(0, newSplit[otherType] + adjustment)
        }
      })
    }

    setCurrentSplit(newSplit)
    setSelectedPreset("custom")
    onSplitChange?.(newSplit)
  }

  const handleSaveBudgetSplit = async () => {
    if (!user) return

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          budget_needs_percentage: currentSplit.needs,
          budget_wants_percentage: currentSplit.wants,
          budget_savings_percentage: currentSplit.savings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "Budget split saved successfully! Changes will reflect across all pages." })
      onSplitChange?.(currentSplit)
    } catch (error) {
      console.error("Error saving budget split:", error)
      setMessage({ type: "error", text: "Failed to save budget split" })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefault = () => {
    const defaultSplit = { needs: 50, wants: 30, savings: 20 }
    setCurrentSplit(defaultSplit)
    setSelectedPreset("50-30-20")
    onSplitChange?.(defaultSplit)
  }

  const total = currentSplit.needs + currentSplit.wants + currentSplit.savings

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading budget preferences...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Budget Split Customization
        </CardTitle>
        <CardDescription>Customize how your income is allocated across needs, wants, and savings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Choose a Budget Strategy</Label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a budget strategy" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESET_SPLITS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">{preset.name}</span>
                      {key !== "custom" && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({preset.needs}/{preset.wants}/{preset.savings})
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPreset !== "custom" && (
            <p className="text-sm text-muted-foreground">
              {PRESET_SPLITS[selectedPreset as keyof typeof PRESET_SPLITS].description}
            </p>
          )}
        </div>

        <Separator />

        {/* Current Split Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{currentSplit.needs}%</div>
            <div className="text-sm text-muted-foreground">NEEDS</div>
            {totalIncome > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatAmount((totalIncome * currentSplit.needs) / 100)}
              </div>
            )}
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{currentSplit.wants}%</div>
            <div className="text-sm text-muted-foreground">WANTS</div>
            {totalIncome > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatAmount((totalIncome * currentSplit.wants) / 100)}
              </div>
            )}
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <PiggyBank className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{currentSplit.savings}%</div>
            <div className="text-sm text-muted-foreground">SAVINGS</div>
            {totalIncome > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatAmount((totalIncome * currentSplit.savings) / 100)}
              </div>
            )}
          </div>
        </div>

        {/* Custom Sliders */}
        {selectedPreset === "custom" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <Label className="text-base font-medium">Custom Allocation</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Needs: {currentSplit.needs}%
                  </Label>
                  <Badge variant="outline">{formatAmount((totalIncome * currentSplit.needs) / 100)}</Badge>
                </div>
                <Slider
                  value={[currentSplit.needs]}
                  onValueChange={(value) => handleSliderChange("needs", value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Essential expenses: rent, utilities, groceries, insurance
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Wants: {currentSplit.wants}%
                  </Label>
                  <Badge variant="outline">{formatAmount((totalIncome * currentSplit.wants) / 100)}</Badge>
                </div>
                <Slider
                  value={[currentSplit.wants]}
                  onValueChange={(value) => handleSliderChange("wants", value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Entertainment, dining out, hobbies, subscriptions</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-purple-600" />
                    Savings: {currentSplit.savings}%
                  </Label>
                  <Badge variant="outline">{formatAmount((totalIncome * currentSplit.savings) / 100)}</Badge>
                </div>
                <Slider
                  value={[currentSplit.savings]}
                  onValueChange={(value) => handleSliderChange("savings", value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Emergency fund, investments, retirement, debt payments</p>
              </div>
            </div>

            {total !== 100 && (
              <Alert>
                <AlertDescription>Total allocation: {total}%. Please adjust to equal 100%.</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefault} className="flex-1 bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to 50/30/20
          </Button>
          <Button onClick={handleSaveBudgetSplit} disabled={isSaving || total !== 100} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Budget Split"
            )}
          </Button>
        </div>

        {totalIncome > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Based on your current monthly income of {formatAmount(totalIncome)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
