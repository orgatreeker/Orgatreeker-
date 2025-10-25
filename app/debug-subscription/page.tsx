"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"

export default function DebugSubscriptionPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runDiagnostics = async () => {
    setChecking(true)
    setResults(null)

    try {
      const diagnostics: any = {
        timestamp: new Date().toISOString(),
        checks: {}
      }

      // Check 1: User authentication
      diagnostics.checks.authentication = {
        isSignedIn,
        userId: user?.id || null,
        email: user?.primaryEmailAddress?.emailAddress || null,
        status: isSignedIn ? 'success' : 'error'
      }

      // Check 2: Clerk metadata
      await user?.reload()
      const metadata = user?.publicMetadata as any
      const clerkSubscription = metadata?.subscription
      diagnostics.checks.clerkMetadata = {
        hasSubscription: !!clerkSubscription,
        subscription: clerkSubscription || null,
        isActive: clerkSubscription?.status === 'active' || clerkSubscription?.status === 'trialing',
        status: clerkSubscription ? 'success' : 'warning'
      }

      // Check 3: Database subscription
      try {
        const dbResponse = await fetch('/api/check-subscription')
        const dbData = await dbResponse.json()
        diagnostics.checks.database = {
          isSubscribed: dbData.isSubscribed,
          userId: dbData.userId,
          checkedAt: dbData.checkedAt,
          error: dbData.error || null,
          status: dbData.isSubscribed ? 'success' : 'error'
        }
      } catch (error: any) {
        diagnostics.checks.database = {
          error: error.message,
          status: 'error'
        }
      }

      // Check 4: Environment variables (client-side only)
      diagnostics.checks.environment = {
        hasClerkKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasDodoMonthlyProduct: !!process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY,
        hasDodoYearlyProduct: !!process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY,
        status: 'info'
      }

      // Check 5: Manual subscription activation option
      diagnostics.manualActivation = {
        userId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        sqlQuery: `INSERT INTO subscriptions (clerk_user_id, email, status, plan, subscription_id, product_id)
VALUES ('${user?.id}', '${user?.primaryEmailAddress?.emailAddress}', 'active', 'monthly', 'manual_activation', 'pdt_3c1A6P4Cpe8KhGYnJNiCN')
ON CONFLICT (clerk_user_id) DO UPDATE SET status = 'active', plan = 'monthly', updated_at = now();`
      }

      setResults(diagnostics)
    } catch (error: any) {
      setResults({
        error: error.message,
        stack: error.stack
      })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      runDiagnostics()
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to use the subscription debugger</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'success') return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />
    if (status === 'warning') return <XCircle className="h-5 w-5 text-yellow-500" />
    return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Subscription Debugger</CardTitle>
            <CardDescription>
              This page helps diagnose subscription issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={checking}>
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Diagnostics
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <>
            {/* Authentication Check */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">1. Authentication</CardTitle>
                  <StatusIcon status={results.checks.authentication?.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Signed In:</strong> {results.checks.authentication?.isSignedIn ? 'Yes' : 'No'}</div>
                <div><strong>User ID:</strong> <code className="bg-muted px-1 py-0.5 rounded">{results.checks.authentication?.userId || 'N/A'}</code></div>
                <div><strong>Email:</strong> {results.checks.authentication?.email || 'N/A'}</div>
              </CardContent>
            </Card>

            {/* Clerk Metadata Check */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">2. Clerk Metadata (Fallback)</CardTitle>
                  <StatusIcon status={results.checks.clerkMetadata?.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Has Subscription:</strong> {results.checks.clerkMetadata?.hasSubscription ? 'Yes' : 'No'}</div>
                <div><strong>Is Active:</strong> {results.checks.clerkMetadata?.isActive ? 'Yes' : 'No'}</div>
                {results.checks.clerkMetadata?.subscription && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(results.checks.clerkMetadata.subscription, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Check */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">3. Database (Primary Source)</CardTitle>
                  <StatusIcon status={results.checks.database?.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Is Subscribed:</strong> {results.checks.database?.isSubscribed ? 'Yes ✅' : 'No ❌'}</div>
                <div><strong>Checked At:</strong> {results.checks.database?.checkedAt || 'N/A'}</div>
                {results.checks.database?.error && (
                  <div className="text-red-500"><strong>Error:</strong> {results.checks.database.error}</div>
                )}
                {!results.checks.database?.isSubscribed && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ No subscription found in database</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      This is why you're being redirected to the pricing page. The webhook may not have saved the subscription.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Environment Variables (Client-Side)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Clerk Key:</strong> {results.checks.environment?.hasClerkKey ? '✅ Set' : '❌ Missing'}</div>
                <div><strong>Supabase URL:</strong> {results.checks.environment?.hasSupabaseUrl ? '✅ Set' : '❌ Missing'}</div>
                <div><strong>Supabase Anon Key:</strong> {results.checks.environment?.hasSupabaseAnonKey ? '✅ Set' : '❌ Missing'}</div>
                <div><strong>Dodo Monthly Product:</strong> {results.checks.environment?.hasDodoMonthlyProduct ? '✅ Set' : '❌ Missing'}</div>
                <div><strong>Dodo Yearly Product:</strong> {results.checks.environment?.hasDodoYearlyProduct ? '✅ Set' : '❌ Missing'}</div>
              </CardContent>
            </Card>

            {/* Manual Activation */}
            {!results.checks.database?.isSubscribed && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">5. Manual Subscription Activation</CardTitle>
                  <CardDescription>
                    If the webhook isn't working, you can manually activate your subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Step 1: Go to Supabase SQL Editor</p>
                    <a
                      href="https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Open Supabase SQL Editor →
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Step 2: Run this SQL query:</p>
                    <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                      {results.manualActivation?.sqlQuery}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Step 3: Refresh this page</p>
                    <Button onClick={runDiagnostics} variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Diagnostics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success */}
            {results.checks.database?.isSubscribed && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800 dark:text-green-200">✅ Subscription Active!</CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Your subscription is working correctly. You should have access to the dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => window.location.href = '/'}>
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-center">
              Last checked: {new Date(results.timestamp).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
