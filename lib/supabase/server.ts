import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const client = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Get auth token from cookies if available
  const authToken = cookieStore.get("sb-access-token")?.value
  if (authToken) {
    client.auth.setSession({
      access_token: authToken,
      refresh_token: cookieStore.get("sb-refresh-token")?.value || "",
    })
  }

  return client
}
