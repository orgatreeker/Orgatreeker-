"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface CheckResult {
  tableExists: boolean
  hasServiceRoleKey?: boolean
  totalSubscriptions?: number
  recentSubscriptions?: Array<{
    email: string
    status: string
    plan?: string
    createdAt: string
    lastEventType?: string
  }>
  error?: string
  message?: string
  instructions?: string[]
}

export default function CheckSubscriptionsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)

  const checkSubscriptionsTable = async () => {
    setChecking(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/check-subscriptions')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        tableExists: false,
        error: 'Failed to check subscriptions table',
        message: error.message,
      })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkSubscriptionsTable()
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
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Subscriptions Table Check</h1>
          <p className="text-muted-foreground">
            Verify that the Supabase subscriptions table is set up correctly
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {checking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : result?.tableExists ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Table Status
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Table Status
                </>
              )}
            </CardTitle>
            <CardDescription>
              Database connection and table verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checking && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Checking Supabase...</p>
              </div>
            )}

            {!checking && result && (
              <>
                {/* Table Exists Status */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  {result.tableExists ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {result.tableExists
                        ? "✅ Subscriptions table exists"
                        : "❌ Subscriptions table not found"}
                    </p>
                    {result.message && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Role Key Status */}
                {result.hasServiceRoleKey !== undefined && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    {result.hasServiceRoleKey ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {result.hasServiceRoleKey
                          ? "✅ Service role key configured"
                          : "❌ Missing SUPABASE_SERVICE_ROLE_KEY"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {result.error && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-red-700">Error</p>
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {result.instructions && result.instructions.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="font-medium text-blue-700 mb-2">
                      📋 Setup Instructions:
                    </p>
                    <ol className="space-y-2 text-sm text-blue-600">
                      {result.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                    <div className="mt-4">
                      <a
                        href="https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        → Open Supabase SQL Editor
                      </a>
                    </div>
                  </div>
                )}

                {/* Subscription Stats */}
                {result.tableExists && result.totalSubscriptions !== undefined && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium mb-2">
                      📊 Total Subscriptions: {result.totalSubscriptions}
                    </p>

                    {result.recentSubscriptions && result.recentSubscriptions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Recent Subscriptions:</p>
                        <div className="space-y-2">
                          {result.recentSubscriptions.map((sub, i) => (
                            <div key={i} className="text-sm p-3 rounded bg-background">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{sub.email}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {sub.lastEventType || 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    sub.status === 'active'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {sub.status}
                                  </span>
                                  {sub.plan && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {sub.plan}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Refresh Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={checkSubscriptionsTable}
                    disabled={checking}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="default"
                  >
                    Back to Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:underline"
            >
              → Supabase Table Editor
            </a>
            <a
              href="https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:underline"
            >
              → Supabase SQL Editor
            </a>
            <a
              href="/QUICK_START.md"
              className="block text-sm text-blue-600 hover:underline"
            >
              → Quick Start Guide
            </a>
            <a
              href="/SUBSCRIPTION_FIX_DEPLOYMENT.md"
              className="block text-sm text-blue-600 hover:underline"
            >
              → Full Deployment Guide
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
