import { createClient } from "@/lib/supabase/client"

export interface LogoutOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export async function logout(options: LogoutOptions = {}) {
  const { redirectTo = "/auth/login", onSuccess, onError } = options
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    // Clear any local storage or session data if needed
    if (typeof window !== "undefined") {
      // Clear any cached data
      localStorage.removeItem("supabase.auth.token")
      sessionStorage.clear()
    }

    onSuccess?.()

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = redirectTo
    }
  } catch (error) {
    console.error("Error during logout:", error)
    onError?.(error as Error)

    // Still redirect to login even if logout fails
    if (typeof window !== "undefined") {
      window.location.href = redirectTo
    }
  }
}

export function useLogout() {
  const handleLogout = async (options: LogoutOptions = {}) => {
    await logout(options)
  }

  return { logout: handleLogout }
}
