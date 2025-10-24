"use client"

import { useState } from "react"
import Link from "next/link"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useUser()

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsMobileMenuOpen(false)
  }

  const getUserName = () => {
    if (!user) return "Guest"
    return user.firstName || user.fullName || user.username || "User"
  }

  const navigationItems = [
    { value: "dashboard", label: "Dashboard" },
    { value: "income", label: "Income" },
    { value: "budget", label: "Budget" },
    { value: "transactions", label: "Transactions" },
    { value: "settings", label: "Settings" },
  ]

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Greeting */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs md:text-sm">FT</span>
          </div>
          <SignedIn>
            <span className="font-semibold text-base md:text-lg hidden sm:block">
              Hi, {getUserName()} 👋
            </span>
            <span className="font-semibold text-base md:text-lg sm:hidden">
              Hi, {getUserName()}
            </span>
          </SignedIn>
          <SignedOut>
            <span className="font-semibold text-base md:text-lg hidden sm:block">FinanceTracker</span>
            <span className="font-semibold text-base md:text-lg sm:hidden">FT</span>
          </SignedOut>
        </div>

        {/* Desktop Navigation Tabs - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {navigationItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="text-xs lg:text-sm">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Pricing is visible to both signed-in and signed-out users */}
          <Link href="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>

          <SignedOut>
            <SignInButton mode="redirect">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
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
                  <SignedIn>
                    <span className="font-semibold text-lg">Hi, {getUserName()} 👋</span>
                  </SignedIn>
                  <SignedOut>
                    <span className="font-semibold text-lg">FinanceTracker</span>
                  </SignedOut>
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

                  {/* Link to Pricing page */}
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/pricing">Pricing</Link>
                  </Button>
                </div>

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t space-y-2">
                  <SignedOut>
                    <SignInButton mode="redirect">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="redirect">
                      <Button className="w-full">Sign Up</Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-sm font-medium">Account</span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
