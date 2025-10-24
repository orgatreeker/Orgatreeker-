"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import PricingClient from "./pricing-client"
import { Loader2 } from "lucide-react"

export default function PricingPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    // Require authentication to view pricing
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }

    // Check if user already has an active subscription
    const metadata = user?.publicMetadata as any
    const subscription = metadata?.subscription
    const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'

    // If user already has active subscription, redirect to home/dashboard
    if (hasActiveSubscription) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, user, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  // Check subscription status
  const metadata = user?.publicMetadata as any
  const subscription = metadata?.subscription
  const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'

  if (hasActiveSubscription) {
    return null // Will redirect via useEffect
  }

  return <PricingClient />
}
