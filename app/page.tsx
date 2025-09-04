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
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          router.push("/auth")
          return
        }

        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            await supabase.from("profiles").insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || "",
            })
          }
        } catch (profileErr) {
          // Continue without failing
        }

        setUser(session.user)
        setIsAuthenticated(true)
        setError(null)
      } catch (error) {
        setError("Authentication failed. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false)
        setUser(null)
        router.push("/auth")
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        setIsAuthenticated(true)
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
    return null
  }

  const renderContent = () => {
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl">
        <div className="w-full">{renderContent()}</div>
      </main>
    </div>
  )
}
