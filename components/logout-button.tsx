"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LogOut, Loader2 } from "lucide-react"
import { logout } from "@/lib/auth-utils"

interface LogoutButtonProps {
  variant?: "button" | "dropdown"
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ variant = "button", className, children }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    await logout({
      onError: (error) => {
        console.error("Logout failed:", error)
        // Could show a toast notification here
      },
      onSuccess: () => {
        console.log("Logout successful")
      },
    })

    // Note: setIsLoggingOut(false) is not needed as the page will redirect
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className={className}>
        {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
        <span>{isLoggingOut ? "Logging out..." : children || "Logout"}</span>
      </DropdownMenuItem>
    )
  }

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut} className={className}>
      {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      {isLoggingOut ? "Logging out..." : children || "Logout"}
    </Button>
  )
}
