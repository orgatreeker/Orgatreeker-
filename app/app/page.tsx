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
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 10000))

        const authPromise = supabase.auth.getSession()

        const {
          data: { session },
          error,
        } = (await Promise.race([authPromise, timeoutPromise])) as any

        if (error) {
          console.error("Auth error:", error)
          router.push("/")
          return
        }

        if (!session) {
          router.push("/")
          return
        }

        setUser(session.user)
        setIsAuthenticated(true)

        try {
          const { data: fetchedProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            const { data: newProfile } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || "",
                subscription_status: "free",
                subscription_plan: "free",
              })
              .select()
              .single()

            if (newProfile) {
              setProfile(newProfile)
              setIsPremium(false)
            }
          } else if (fetchedProfile) {
            setProfile(fetchedProfile)
            const isUserPremium =
              fetchedProfile.subscription_status === "active" &&
              (fetchedProfile.subscription_plan === "monthly" || fetchedProfile.subscription_plan === "yearly")

            console.log("[v0] User premium status:", {
              subscription_status: fetchedProfile.subscription_status,
              subscription_plan: fetchedProfile.subscription_plan,
              isPremium: isUserPremium,
            })

            setIsPremium(isUserPremium)
          }
        } catch (profileError) {
          console.error("Profile error:", profileError)
          setProfile({
            id: session.user.id,
            email: session.user.email,
            subscription_status: "free",
          })
          setIsPremium(false)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/")
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
        setProfile(null)
        setIsPremium(false)
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

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
    return null // Will redirect to root
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
