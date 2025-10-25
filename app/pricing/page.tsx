"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import PricingClient from "./pricing-client"
import { Loader2 } from "lucide-react"

export default function PricingPage() {
  const { isLoaded, isSignedIn, user, userId } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    // Require authentication to view pricing
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }

    // Check subscription status from database and Clerk
    const checkSubscription = async () => {
      try {
        // Priority 1: Check database (primary source of truth)
        const response = await fetch('/api/check-subscription')
        const data = await response.json()

        if (data.isSubscribed) {
          setHasSubscription(true)
          setChecking(false)
          router.push("/")
          return
        }

        // Priority 2: Fall back to Clerk metadata
        await user?.reload()
        const metadata = user?.publicMetadata as any
        const subscription = metadata?.subscription
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

        if (isActive) {
          setHasSubscription(true)
          setChecking(false)
          router.push("/")
        } else {
          setHasSubscription(false)
          setChecking(false)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        // On error, assume no subscription and show pricing page
        setHasSubscription(false)
        setChecking(false)
      }
    }

    checkSubscription()
  }, [isLoaded, isSignedIn, user, userId, router])

  if (!isLoaded || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  // If user has subscription, redirect (handled in useEffect)
  if (hasSubscription) {
    return null
  }

  return <PricingClient />
}
