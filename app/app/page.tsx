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

export default function MainAppPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isPremium, setIsPremium] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] Checking authentication...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Auth error:", error)
          router.push("/auth/login")
          return
        }

        if (!session) {
          console.log("[v0] No session found, redirecting to login")
          router.push("/auth/login")
          return
        }

        console.log("[v0] User authenticated:", session.user.email)
        setUser(session.user)
        setIsAuthenticated(true)

        try {
          let { data: fetchedProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            console.log("[v0] Creating new profile for user:", session.user.email)

            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
                subscription_status: "active", // Set to active by default
                subscription_plan: "pro", // Set to pro by default
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (insertError) {
              console.error("[v0] Error creating profile:", insertError)
              throw insertError
            }

            fetchedProfile = newProfile
            console.log("[v0] Successfully created new profile")
          }

          if (fetchedProfile) {
            setProfile(fetchedProfile)

            console.log("[v0] ✅ User has FULL ACCESS - all features unlocked!")
            setIsPremium(true)
          }
        } catch (profileError) {
          console.error("[v0] Profile error:", profileError)

          const fallbackProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || "",
            subscription_status: "active", // Set to active by default
            subscription_plan: "pro", // Set to pro by default
            onboarding_completed: false,
          }
          setProfile(fallbackProfile)
          setIsPremium(true)
          console.log("[v0] Using fallback profile with full access")
        }
      } catch (error) {
        console.error("[v0] Error checking auth:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)

      if (event === "SIGNED_OUT" || !session) {
        console.log("[v0] User signed out, clearing state")
        setIsAuthenticated(false)
        setUser(null)
        setProfile(null)
        setIsPremium(false)
        router.push("/")
      } else if (event === "SIGNED_IN" && session) {
        console.log("[v0] User signed in, refreshing profile")
        // Refresh the page to reload profile data
        window.location.reload()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm md:text-base">Loading your dashboard...</p>
          <p className="text-xs text-muted-foreground mt-2">All features unlocked!</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage isPremium={isPremium} />
      case "income":
        return <IncomePage isPremium={isPremium} />
      case "budget":
        return <BudgetPage isPremium={isPremium} />
      case "settings":
        return <SettingsPage profile={profile} isPremium={isPremium} />
      case "profile":
        return <ProfileSettingsPage onBack={() => setActiveTab("dashboard")} />
      case "account":
        return <AccountSettingsPage onBack={() => setActiveTab("dashboard")} />
      case "billing":
        return <ProfileSettingsPage onBack={() => setActiveTab("dashboard")} />
      default:
        return <DashboardPage isPremium={isPremium} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} isPremium={isPremium} profile={profile} />
      <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl">
        <div className="w-full">{renderContent()}</div>
      </main>
    </div>
  )
}
