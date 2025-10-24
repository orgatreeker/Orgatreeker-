import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  
  // Auth callback disabled - Supabase has been removed
  return NextResponse.redirect(`${origin}/auth/error`)
}
