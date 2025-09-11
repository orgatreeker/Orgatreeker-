"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { PricingPage } from "@/components/pricing-page"
import { Loader2 } from "lucide-react"

export default function Pricing() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </div>
    )
  }

  return <PricingPage user={user} />
}
