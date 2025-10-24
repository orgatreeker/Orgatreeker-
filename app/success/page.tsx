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
  const maxRetries = 10 // Check for 10 seconds

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    // Function to check subscription status
    const checkSubscription = async () => {
      try {
        // Force reload user data from Clerk
        await user?.reload()

        const metadata = user?.publicMetadata as any
        const subscription = metadata?.subscription
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

        if (isActive) {
          // Subscription found! Redirect to home
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
          setChecking(false)
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        // On error, still redirect after a delay
        setTimeout(() => {
          router.push('/')
        }, 3000)
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
