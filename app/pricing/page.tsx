import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { PricingPage } from "@/components/pricing-page"

export default async function Pricing() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <PricingPage user={user} />
      </Suspense>
    </div>
  )
}
