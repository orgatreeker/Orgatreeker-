"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function SuccessPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 30 // Check for 30 seconds (increased from 10)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    // Function to check subscription status from DATABASE (primary) and Clerk (fallback)
    const checkSubscription = async () => {
      try {
        // Check database first (most reliable and up-to-date)
        const dbCheckResponse = await fetch('/api/check-subscription')
        const dbData = await dbCheckResponse.json()

        if (dbData.isSubscribed) {
          // Subscription found in database! Redirect to home
          console.log('✅ Subscription confirmed from database')
          setChecking(false)
          setTimeout(() => {
            router.push('/')
          }, 1500)
          return
        }

        // Fallback: Check Clerk metadata
        await user?.reload()
        const metadata = user?.publicMetadata as any
        const subscription = metadata?.subscription
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

        if (isActive) {
          // Subscription found in Clerk! Redirect to home
          console.log('✅ Subscription confirmed from Clerk')
          setChecking(false)
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else if (retryCount < maxRetries) {
          // Not found yet, retry after 1 second
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 1000)
        } else {
          // Max retries reached, but still redirect to home
          // The middleware will handle redirecting back to pricing if still no subscription
          console.warn('⚠️ Max retries reached, redirecting anyway')
          setChecking(false)
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (error) {
        console.error('❌ Error checking subscription:', error)
        // On error, retry if not at max retries
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 1000)
        } else {
          // Max retries reached, redirect anyway
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      }
    }

    checkSubscription()
  }, [isLoaded, isSignedIn, user, router, retryCount])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {checking ? (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {checking ? "Processing Your Payment..." : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {checking
              ? "We're confirming your subscription. This usually takes a few seconds."
              : "Your subscription is now active. Redirecting you to the app..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {checking ? (
            <div className="text-sm text-muted-foreground">
              <p>Checking subscription status... ({retryCount}/{maxRetries})</p>
              <p className="mt-2">Please wait, this may take a moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Thank you for subscribing! You now have full access to all features.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
