import { createClient } from "@/lib/supabase/server"

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export async function getProfileServer(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function createProfileServer(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  const supabase = await createClient()

  const profileData = {
    id: userId,
    email,
    full_name: fullName || null,
  }

  const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return data
}

export async function updateProfileServer(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}
