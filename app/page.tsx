"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { DashboardPage } from "@/components/dashboard-page"
import { IncomePage } from "@/components/income-page"
import { BudgetPage } from "@/components/budget-page"
import { SettingsPage } from "@/components/settings-page"
import { ProfileSettingsPage } from "@/components/profile-settings-page"
import { AccountSettingsPage } from "@/components/account-settings-page"
import { BillingSettingsPage } from "@/components/billing-settings-page"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] Starting authentication check...")

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[v0] Session error:", sessionError)
          setError("Authentication failed. Please try logging in again.")
          router.push("/auth")
          return
        }

        if (!session) {
          console.log("[v0] No session found, redirecting to auth")
          router.push("/auth")
          return
        }

        console.log("[v0] Session found, checking profile...")

        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            console.log("[v0] Profile not found, creating new profile...")
            const { error: insertError } = await supabase.from("profiles").insert({
              id: session.user.id,
              email: session.user.email,
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                `${session.user.user_metadata?.first_name || ""} ${session.user.user_metadata?.last_name || ""}`.trim() ||
                "",
            })

            if (insertError) {
              console.error("[v0] Error creating profile:", insertError)
              setError("Failed to create user profile. Please try again.")
              return
            }
          } else if (profileError) {
            console.error("[v0] Profile fetch error:", profileError)
            // Don't fail completely, just log the error
            console.log("[v0] Continuing without profile data")
          }
        } catch (profileErr) {
          console.error("[v0] Profile operation failed:", profileErr)
          // Continue without failing the entire auth flow
        }

        console.log("[v0] Authentication successful")
        setUser(session.user)
        setIsAuthenticated(true)
        setError(null)
      } catch (error) {
        console.error("[v0] Critical auth error:", error)
        setError("A critical error occurred. Please refresh the page.")
        // Don't redirect on critical errors, show error state instead
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("[v0] Auth state change:", event)
        if (event === "SIGNED_OUT" || !session) {
          setIsAuthenticated(false)
          setUser(null)
          setError(null)
          router.push("/auth")
        } else if (event === "SIGNED_IN" && session) {
          setUser(session.user)
          setIsAuthenticated(true)
          setError(null)
        }
      } catch (error) {
        console.error("[v0] Auth state change error:", error)
        setError("Authentication state error occurred.")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm md:text-base">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to auth
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case "dashboard":
          return <DashboardPage isPremium={false} />
        case "income":
          return <IncomePage isPremium={false} />
        case "budget":
          return <BudgetPage isPremium={false} />
        case "settings":
          return <SettingsPage />
        case "profile":
          return <ProfileSettingsPage onBack={() => setActiveTab("dashboard")} />
        case "account":
          return <AccountSettingsPage onBack={() => setActiveTab("dashboard")} />
        case "billing":
          return <BillingSettingsPage onBack={() => setActiveTab("dashboard")} />
        default:
          return <DashboardPage isPremium={false} />
      }
    } catch (error) {
      console.error("[v0] Content rendering error:", error)
      return (
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load content. Please try refreshing the page.</p>
        </div>
      )
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl">
          <div className="w-full">
            <ErrorBoundary>{renderContent()}</ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
