"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PricingPage } from "@/components/pricing-page"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.push("/app")
      } else {
        setIsLoading(false)
      }
    }

    checkAuthAndRedirect()
  }, [router, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <PricingPage />
}
