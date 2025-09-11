import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BudgetOnboarding from "@/components/budget-onboarding"

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <BudgetOnboarding showPricingAfter={true} />
      </Suspense>
    </div>
  )
}
