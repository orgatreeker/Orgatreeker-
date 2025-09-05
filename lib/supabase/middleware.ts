import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Check if user is authenticated
  const authHeader = request.headers.get("authorization")
  if (!authHeader && !request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
