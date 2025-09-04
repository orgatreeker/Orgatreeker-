"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, DollarSign, Home, CreditCard, MapPin, Target } from "lucide-react"
import { useRouter } from "next/navigation"

interface BudgetRecommendation {
  needs: number
  wants: number
  savings: number
  recommendation: string
}

interface OnboardingData {
  monthlyIncome: string
  fixedExpenses: string
  rent: string
  debtAmount: string
  location: string
  financialGoal: string
  additionalInfo: string
}

const steps = [
  { id: "income", title: "Monthly Income", icon: DollarSign },
  { id: "expenses", title: "Fixed Expenses", icon: Home },
  { id: "debt", title: "Debt Information", icon: CreditCard },
  { id: "location", title: "Location", icon: MapPin },
  { id: "goals", title: "Financial Goals", icon: Target },
]

export default function BudgetOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    monthlyIncome: "",
    fixedExpenses: "",
    rent: "",
    debtAmount: "",
    location: "",
    financialGoal: "",
    additionalInfo: "",
  })
  const [recommendation, setRecommendation] = useState<BudgetRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      generateRecommendation()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRecommendation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/budget-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setRecommendation(result)
        setIsComplete(true)
      }
    } catch (error) {
      console.error("Failed to generate recommendation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyRecommendation = async () => {
    if (!recommendation) return

    try {
      // Apply the budget split to user's account
      const response = await fetch("/api/apply-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needs: recommendation.needs,
          wants: recommendation.wants,
          savings: recommendation.savings,
        }),
      })

      if (response.ok) {
        router.push("/app")
      }
    } catch (error) {
      console.error("Failed to apply budget:", error)
    }
  }

  if (isComplete && recommendation) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Your Personalized Budget Plan</CardTitle>
            <CardDescription>Based on your financial situation, here's your recommended budget split</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{recommendation.needs}%</div>
                <div className="text-sm text-gray-600">NEEDS</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{recommendation.wants}%</div>
                <div className="text-sm text-gray-600">WANTS</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{recommendation.savings}%</div>
                <div className="text-sm text-gray-600">SAVINGS</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Why this split works for you:</h3>
              <p className="text-gray-700">{recommendation.recommendation}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setIsComplete(false)} variant="outline" className="flex-1">
                Adjust Details
              </Button>
              <Button onClick={applyRecommendation} className="flex-1">
                Apply This Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Analyzing your financial situation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const CurrentStepIcon = steps[currentStep].icon

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Budget Setup</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-gray-600">Let's create your personalized budget plan</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CurrentStepIcon className="w-6 h-6 text-blue-600" />
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">What's your monthly take-home income?</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g., 5000"
                  value={data.monthlyIncome}
                  onChange={(e) => setData({ ...data, monthlyIncome: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">Enter your after-tax monthly income</p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="rent">Monthly rent or mortgage payment</Label>
                <Input
                  id="rent"
                  type="number"
                  placeholder="e.g., 1200"
                  value={data.rent}
                  onChange={(e) => setData({ ...data, rent: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expenses">Other fixed monthly expenses</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="e.g., 800"
                  value={data.fixedExpenses}
                  onChange={(e) => setData({ ...data, fixedExpenses: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">Include utilities, insurance, phone, etc.</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="debt">Total debt amount (if any)</Label>
                <Input
                  id="debt"
                  type="number"
                  placeholder="e.g., 15000 (or 0 if no debt)"
                  value={data.debtAmount}
                  onChange={(e) => setData({ ...data, debtAmount: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">Include credit cards, loans, etc.</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Where do you live?</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York City, Rural Texas, etc."
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">This helps us understand your cost of living</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal">What's your main financial goal?</Label>
                <Select
                  value={data.financialGoal}
                  onValueChange={(value) => setData({ ...data, financialGoal: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="save_aggressively">Save aggressively for the future</SelectItem>
                    <SelectItem value="clear_debt">Pay off debt as quickly as possible</SelectItem>
                    <SelectItem value="balanced_life">Maintain a balanced lifestyle</SelectItem>
                    <SelectItem value="enjoy_lifestyle">Enjoy life while saving responsibly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="additional">Any additional financial details?</Label>
                <Textarea
                  id="additional"
                  placeholder="e.g., planning for a wedding, have kids, irregular income, etc."
                  value={data.additionalInfo}
                  onChange={(e) => setData({ ...data, additionalInfo: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={
                (currentStep === 0 && !data.monthlyIncome) ||
                (currentStep === 1 && (!data.rent || !data.fixedExpenses)) ||
                (currentStep === 2 && !data.debtAmount) ||
                (currentStep === 3 && !data.location) ||
                (currentStep === 4 && !data.financialGoal)
              }
            >
              {currentStep === steps.length - 1 ? "Get My Budget Plan" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
