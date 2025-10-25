import { supabase, supabaseAdmin } from './client'

export interface Subscription {
  id?: string
  clerk_user_id: string
  email: string
  status: 'active' | 'inactive' | 'trialing' | 'cancelled' | 'failed' | 'expired'
  plan?: 'monthly' | 'yearly'
  subscription_id?: string
  product_id?: string
  payment_id?: string
  created_at?: string
  updated_at?: string
  expires_at?: string
  last_event_type?: string
  last_event_id?: string
}

// User operations
export async function createOrGetUser(clerkUserId: string, email?: string, name?: string) {
  try {
    // Try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    // If user exists, return it
    if (existingUser) {
      return existingUser
    }

    // If no user exists, create one
    const { data, error } = await supabase
      .from('users')
      .insert({ clerk_user_id: clerkUserId, email, name })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error in createOrGetUser:', error)
    // Don't throw, just return null to allow app to continue
    return null
  }
}

// Income Sources operations
export async function getIncomeSources(clerkUserId: string, month: number, year: number) {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching income sources:', error)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getIncomeSources:', error)
    return []
  }
}

export async function createIncomeSource(data: any) {
  try {
    const { data: result, error } = await supabase
      .from('income_sources')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating income source:', error)
      throw error
    }
    
    return result
  } catch (error) {
    console.error('Error in createIncomeSource:', error)
    throw error
  }
}

export async function updateIncomeSource(id: string, data: any) {
  const { data: result, error } = await supabase
    .from('income_sources')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function deleteIncomeSource(id: string) {
  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Budget Categories operations
export async function getBudgetCategories(clerkUserId: string, month: number, year: number) {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createBudgetCategory(data: any) {
  const { data: result, error } = await supabase
    .from('budget_categories')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateBudgetCategory(id: string, data: any) {
  const { data: result, error } = await supabase
    .from('budget_categories')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function deleteBudgetCategory(id: string) {
  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Transactions operations
export async function getTransactions(clerkUserId: string, month?: number, year?: number) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('transaction_date', { ascending: false })

  if (month !== undefined && year !== undefined) {
    query = query.eq('month', month).eq('year', year)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createTransaction(data: any) {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateTransaction(id: string, data: any) {
  const { data: result, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// User Settings operations
export async function getUserSettings(clerkUserId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data
}

export async function createOrUpdateUserSettings(clerkUserId: string, settings: any) {
  const existing = await getUserSettings(clerkUserId)

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ clerk_user_id: clerkUserId, ...settings })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Subscription operations
export async function getSubscription(clerkUserId: string): Promise<Subscription | null> {
  try {
    const client = supabaseAdmin || supabase
    const { data, error } = await client
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getSubscription:', error)
    return null
  }
}

export async function upsertSubscription(subscription: Subscription): Promise<Subscription | null> {
  try {
    const client = supabaseAdmin || supabase

    // Use upsert to handle both insert and update
    const { data, error } = await client
      .from('subscriptions')
      .upsert(
        {
          clerk_user_id: subscription.clerk_user_id,
          email: subscription.email,
          status: subscription.status,
          plan: subscription.plan,
          subscription_id: subscription.subscription_id,
          product_id: subscription.product_id,
          payment_id: subscription.payment_id,
          expires_at: subscription.expires_at,
          last_event_type: subscription.last_event_type,
          last_event_id: subscription.last_event_id,
        },
        {
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in upsertSubscription:', error)
    return null
  }
}

export async function hasActiveSubscription(clerkUserId: string): Promise<boolean> {
  try {
    const subscription = await getSubscription(clerkUserId)

    if (!subscription) {
      return false
    }

    // Check if subscription is active or trialing
    const isActive = subscription.status === 'active' || subscription.status === 'trialing'

    // Check if subscription hasn't expired (if expires_at is set)
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at)
      const now = new Date()
      return isActive && expiresAt > now
    }

    return isActive
  } catch (error) {
    console.error('Error in hasActiveSubscription:', error)
    return false
  }
}
