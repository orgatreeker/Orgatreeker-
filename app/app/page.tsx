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
  const [isPremium, setIsPremium] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Auth error:", error)
          router.replace("/auth/login")
          return
        }

        if (!session) {
          console.log("[v0] No session found, redirecting to login")
          router.replace("/auth/login")
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
                subscription_status: "free",
                subscription_plan: "free",
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

            const isUserPremium =
              fetchedProfile.subscription_status === "active" &&
              (fetchedProfile.subscription_plan === "monthly" || fetchedProfile.subscription_plan === "yearly")

            console.log("[v0] Premium status check:", {
              user_email: fetchedProfile.email,
              subscription_status: fetchedProfile.subscription_status,
              subscription_plan: fetchedProfile.subscription_plan,
              isPremium: isUserPremium,
              subscription_updated_at: fetchedProfile.subscription_updated_at,
            })

            setIsPremium(isUserPremium)

            if (isUserPremium) {
              console.log("[v0] ✅ User has PREMIUM access - all features unlocked!")
            } else {
              console.log("[v0] ⚠️ User has FREE access - some features locked")
            }
          }
        } catch (profileError) {
          console.error("[v0] Profile error:", profileError)

          const fallbackProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "",
            subscription_status: "free",
            subscription_plan: "free",
            onboarding_completed: false,
          }
          setProfile(fallbackProfile)
          setIsPremium(false)
          console.log("[v0] Using fallback profile with free access")
        }
      } catch (error) {
        console.error("[v0] Error checking auth:", error)
        router.replace("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const channel = supabase
      .channel("profile-subscription-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          console.log("[v0] Profile subscription updated:", payload.new)
          if (payload.new && user && payload.new.id === user.id) {
            setProfile(payload.new)
            const isUserPremium =
              payload.new.subscription_status === "active" &&
              (payload.new.subscription_plan === "monthly" || payload.new.subscription_plan === "yearly")
            setIsPremium(isUserPremium)

            if (isUserPremium) {
              console.log("[v0] 🎉 SUBSCRIPTION ACTIVATED! Premium features unlocked!")
            } else {
              console.log("[v0] ⚠️ Subscription status changed to free")
            }
          }
        },
      )
      .subscribe()

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
        router.replace("/")
      } else if (event === "SIGNED_IN" && session) {
        console.log("[v0] User signed in, setting authenticated state")
        setUser(session.user)
        setIsAuthenticated(true)
        // Don't reload the page, just update state
      }
    })

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [router, supabase.auth]) // Removed user?.id from the dependency array

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm md:text-base">Loading your dashboard...</p>
          <p className="text-xs text-muted-foreground mt-2">Checking subscription status...</p>
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
