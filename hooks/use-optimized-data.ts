"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseOptimizedDataOptions {
  userId: string
  month: number
  year: number
  enabled?: boolean
}

// Custom hook for optimized data fetching with batching
export function useOptimizedFinanceData({ userId, month, year, enabled = true }: UseOptimizedDataOptions) {
  const [data, setData] = useState({
    income: [],
    budgets: [],
    transactions: [],
    isLoading: true,
    error: null,
  })

  const supabase = useMemo(() => createClient(), [])

  // Batch all queries into a single function to reduce database calls
  const fetchAllData = useCallback(async () => {
    if (!enabled || !userId) return

    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }))

      const [incomeResult, budgetResult, transactionResult] = await Promise.all([
        supabase.from("income_sources").select("*").eq("user_id", userId).eq("month", month).eq("year", year),

        supabase.from("budget_categories").select("*").eq("user_id", userId).eq("month", month).eq("year", year),

        supabase
          .from("transactions")
          .select(`
            *,
            budget_categories (
              name,
              type
            )
          `)
          .eq("user_id", userId)
          .eq("month", month)
          .eq("year", year)
          .order("transaction_date", { ascending: false })
          .limit(50), // Limit to improve performance
      ])

      // Check for errors
      if (incomeResult.error) throw incomeResult.error
      if (budgetResult.error) throw budgetResult.error
      if (transactionResult.error) throw transactionResult.error

      setData({
        income: incomeResult.data || [],
        budgets: budgetResult.data || [],
        transactions: transactionResult.data || [],
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error fetching finance data:", error)
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      }))
    }
  }, [supabase, userId, month, year, enabled])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Memoized calculations to prevent unnecessary recalculations
  const calculations = useMemo(() => {
    const totalIncome = data.income.reduce((sum: number, source: any) => sum + source.amount, 0)
    const totalSpent = data.transactions.reduce(
      (sum: number, transaction: any) => sum + Math.abs(transaction.amount),
      0,
    )
    const totalBudgeted = data.budgets.reduce((sum: number, budget: any) => sum + budget.budgeted_amount, 0)
    const totalSavings = totalIncome - totalSpent

    return {
      totalIncome,
      totalSpent,
      totalBudgeted,
      totalSavings,
    }
  }, [data.income, data.transactions, data.budgets])

  return {
    ...data,
    ...calculations,
    refetch: fetchAllData,
  }
}
