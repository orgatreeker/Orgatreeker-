import { createClient } from "@/lib/supabase/client"

export interface PremiumFeatures {
  advancedAnalytics: boolean
  unlimitedCategories: boolean
  goalTracking: boolean
  dataExport: boolean
  investmentTracking: boolean
  customReports: boolean
  apiAccess: boolean
}

export async function checkPremiumStatus(userId: string): Promise<{ isPremium: boolean; plan: string | null }> {
  const supabase = createClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_plan")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    return { isPremium: false, plan: null }
  }

  return {
    isPremium: profile.subscription_status === "active",
    plan: profile.subscription_plan,
  }
}

export function getPremiumFeatures(subscriptionPlan: string | null): PremiumFeatures {
  const baseFeatures: PremiumFeatures = {
    advancedAnalytics: false,
    unlimitedCategories: false,
    goalTracking: false,
    dataExport: false,
    investmentTracking: false,
    customReports: false,
    apiAccess: false,
  }

  if (subscriptionPlan === "monthly") {
    return {
      ...baseFeatures,
      advancedAnalytics: true,
      unlimitedCategories: true,
      goalTracking: true,
      dataExport: true,
    }
  }

  if (subscriptionPlan === "annual") {
    return {
      advancedAnalytics: true,
      unlimitedCategories: true,
      goalTracking: true,
      dataExport: true,
      investmentTracking: true,
      customReports: true,
      apiAccess: true,
    }
  }

  return baseFeatures
}
