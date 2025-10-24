export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export async function getProfileServer(userId: string): Promise<Profile | null> {
  console.warn("getProfileServer called but Supabase has been removed")
  return null
}

export async function createProfileServer(userId: string, email: string, fullName?: string): Promise<Profile | null> {
  console.warn("createProfileServer called but Supabase has been removed")
  return null
}

export async function updateProfileServer(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  console.warn("updateProfileServer called but Supabase has been removed")
  return null
}
