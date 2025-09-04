"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, CreditCard, Menu, Settings } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { getProfile, createProfile, type Profile } from "@/lib/profile-utils"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Error getting user:", error)
          return
        }

        setUser(user)

        if (user) {
          let profileData = await getProfile(user.id)

          if (!profileData) {
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim()

            profileData = await createProfile(user.id, user.email || "", fullName)
          }

          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error in getUser:", error)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        let profileData = await getProfile(session.user.id)

        if (!profileData) {
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            `${session.user.user_metadata?.first_name || ""} ${session.user.user_metadata?.last_name || ""}`.trim()

          profileData = await createProfile(session.user.id, session.user.email || "", fullName)
        }

        setProfile(profileData)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const getUserInitials = () => {
    if (!user) return "U"
    const name = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || ""
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "User"
  }

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsMobileMenuOpen(false) // Close mobile menu when tab changes
  }

  const handleProfileNavigation = () => {
    onTabChange("profile")
  }

  const handleAccountNavigation = () => {
    onTabChange("account")
  }

  const handleBillingNavigation = () => {
    onTabChange("billing")
  }

  const navigationItems = [
    { value: "dashboard", label: "Dashboard" },
    { value: "income", label: "Income" },
    { value: "budget", label: "Budget" },
    { value: "settings", label: "Settings" },
  ]

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs md:text-sm">FT</span>
          </div>
          <span className="font-semibold text-base md:text-lg hidden sm:block">FinanceTracker</span>
          <span className="font-semibold text-base md:text-lg sm:hidden">FT</span>
        </div>

        {/* Desktop Navigation Tabs - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {navigationItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="text-xs lg:text-sm">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Menu Button - Visible on mobile only */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">FT</span>
                  </div>
                  <span className="font-semibold text-lg">FinanceTracker</span>
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.value}
                      variant={activeTab === item.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleTabChange(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>

                {/* Mobile User Info */}
                {user && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
                        <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleProfileNavigation}>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleAccountNavigation}>
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleBillingNavigation}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing Settings
                    </Button>
                    <LogoutButton className="w-full justify-start text-destructive" />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Profile Dropdown - Hidden on mobile */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                  <AvatarFallback className="text-xs md:text-sm">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {user && (
                <>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleProfileNavigation}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAccountNavigation}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBillingNavigation}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton variant="dropdown" />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
