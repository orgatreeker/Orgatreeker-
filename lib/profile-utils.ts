export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  console.warn("getProfile called but Supabase has been removed")
  return null
}

export async function createProfile(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  console.warn("createProfile called but Supabase has been removed")
  return null
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  console.warn("updateProfile called but Supabase has been removed")
  return null
}
