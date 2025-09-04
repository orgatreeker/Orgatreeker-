"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface BudgetSplit {
  needs_percentage: number
  wants_percentage: number
  savings_percentage: number
}

export function useBudgetSplit() {
  const [budgetSplit, setBudgetSplit] = useState<BudgetSplit>({
    needs_percentage: 50,
    wants_percentage: 30,
    savings_percentage: 20,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchBudgetSplit()
  }, [])

  const fetchBudgetSplit = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("budget_needs_percentage, budget_wants_percentage, budget_savings_percentage")
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (data) {
        setBudgetSplit({
          needs_percentage: data.budget_needs_percentage || 50,
          wants_percentage: data.budget_wants_percentage || 30,
          savings_percentage: data.budget_savings_percentage || 20,
        })
      }
    } catch (error) {
      console.error("Error fetching budget split:", error)
      setError("Failed to load budget preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBudgetSplit = () => {
    setIsLoading(true)
    fetchBudgetSplit()
  }

  return {
    budgetSplit,
    isLoading,
    error,
    refreshBudgetSplit,
  }
}
