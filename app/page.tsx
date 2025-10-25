"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { DashboardPage } from "@/components/dashboard-page"
import { IncomePage } from "@/components/income-page"
import { BudgetPage } from "@/components/budget-page"
import { TransactionsPage } from "@/components/transactions-page"
import { SettingsPage } from "@/components/settings-page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["dashboard"]))
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  // Track which tabs have been visited to enable lazy loading
  useEffect(() => {
    setLoadedTabs(prev => new Set(prev).add(activeTab))
  }, [activeTab])

  // Note: Subscription check is now handled by middleware (checking database first)
  // No need for redundant check here - middleware will redirect to /pricing if needed

  // Keep visited tabs mounted for smooth transitions and state preservation
  const renderAllTabs = () => {
    const isTabActive = (tab: string) => activeTab === tab ? "block" : "hidden"
    const tabAnimation = "transition-opacity duration-200 ease-in-out"

    // Since middleware already protects routes, all users here are subscribed
    // Middleware redirects non-subscribers to /pricing
    // Therefore, everyone who reaches this page has an active subscription
    const isPremium = true // Always true - middleware handles subscription check
    
    return (
      <>
        <div className={`${isTabActive("dashboard")} ${tabAnimation}`}>
          {loadedTabs.has("dashboard") && <DashboardPage isPremium={isPremium} />}
        </div>
        <div className={`${isTabActive("income")} ${tabAnimation}`}>
          {loadedTabs.has("income") && <IncomePage isPremium={isPremium} />}
        </div>
        <div className={`${isTabActive("budget")} ${tabAnimation}`}>
          {loadedTabs.has("budget") && <BudgetPage isPremium={isPremium} />}
        </div>
        <div className={`${isTabActive("transactions")} ${tabAnimation}`}>
          {loadedTabs.has("transactions") && <TransactionsPage />}
        </div>
        <div className={`${isTabActive("settings")} ${tabAnimation}`}>
          {loadedTabs.has("settings") && <SettingsPage />}
        </div>
      </>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Welcome to FinanceTracker</CardTitle>
                <CardDescription>
                  Sign in to manage your finances, track income and expenses, and create budgets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click "Sign In" or "Sign Up" in the navigation to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-4 md:px-6 md:py-8 max-w-7xl">
        <div className="w-full">{renderAllTabs()}</div>
      </main>
    </div>
  )
}
