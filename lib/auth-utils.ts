export interface LogoutOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export async function logout(options: LogoutOptions = {}) {
  const { redirectTo = "/auth/login", onSuccess } = options

  // Clear any local storage or session data if needed
  if (typeof window !== "undefined") {
    localStorage.clear()
    sessionStorage.clear()
  }

  onSuccess?.()

  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = redirectTo
  }
}

export function useLogout() {
  const handleLogout = async (options: LogoutOptions = {}) => {
    await logout(options)
  }

  return { logout: handleLogout }
}
