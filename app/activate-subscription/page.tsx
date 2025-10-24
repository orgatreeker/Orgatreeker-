"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ActivateSubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const activateSubscription = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/set-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          plan: "monthly",
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to activate subscription")
      }

      const data = await res.json()
      setResult(data)

      // Wait a bit then redirect
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const checkSubscription = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/set-subscription", {
        method: "GET",
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to check subscription")
      }

      const data = await res.json()
      setResult(data)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manual Subscription Activation</CardTitle>
          <CardDescription>
            For testing purposes only - Activate your subscription manually since webhooks can't reach localhost
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={activateSubscription}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Activate Subscription
                </>
              )}
            </Button>

            <Button
              onClick={checkSubscription}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Check Current Status
            </Button>
          </div>

          {result && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm space-y-1">
                  <p><strong>Success!</strong> {result.message}</p>
                  {result.subscription && (
                    <>
                      <p>Status: {result.subscription.status}</p>
                      <p>Plan: {result.subscription.plan}</p>
                    </>
                  )}
                  {result.email && <p>Email: {result.email}</p>}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Why do I need this?</p>
            <p>
              Dodo Payments webhooks cannot reach your localhost development environment.
              This tool manually sets your subscription status in Clerk for testing.
              In production, webhooks will work automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
