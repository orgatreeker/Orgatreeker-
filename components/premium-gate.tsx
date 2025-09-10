"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock } from "lucide-react"

interface PremiumGateProps {
  children: React.ReactNode
  feature: string
  description?: string
  requiredPlan?: "monthly" | "annual"
}

export function PremiumGate({ children, feature, description, requiredPlan = "monthly" }: PremiumGateProps) {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  const checkPremiumStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_plan")
        .eq("id", user.id)
        .single()

      if (profile) {
        const hasActiveSub = profile.subscription_status === "active"
        const hasRequiredPlan =
          requiredPlan === "monthly"
            ? ["monthly", "annual"].includes(profile.subscription_plan)
            : profile.subscription_plan === "annual"

        setIsPremium(hasActiveSub && hasRequiredPlan)
        setUserPlan(profile.subscription_plan)
      }
    } catch (error) {
      console.error("Error checking premium status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded-lg h-32" />
  }

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Premium Feature
        </CardTitle>
        <CardDescription>{description || `${feature} is available with a premium subscription`}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {requiredPlan === "annual" ? "Pro Plan Required" : "Premium Plan Required"}
        </Badge>
        <Button className="w-full" onClick={() => (window.location.href = "/app?tab=billing")}>
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  )
}
