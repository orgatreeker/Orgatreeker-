"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { useDateContext } from "./date-context"
import {
  getBudgetCategories,
  getTransactions,
  getIncomeSources,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  createOrGetUser,
  getUserSettings,
  createOrUpdateUserSettings,
} from "@/lib/supabase/database"

interface Transaction {
  id: string
  transaction_date: string
  amount: number
  category: string
  subcategory: string
  notes: string
  category_id?: string
  clerk_user_id?: string
  month?: number
  year?: number
}

interface BudgetCategory {
  id: string
  name: string
  budgeted_amount: number
  type: string
  month: number
  year: number
  created_at?: string
  updated_at?: string
}

interface IncomeSource {
  id: string
  name: string
  category: string
  amount: number
  month: number
  year: number
  created_at?: string
  updated_at?: string
}

interface UserSettings {
  id?: string
  clerk_user_id?: string
  currency_code?: string
  currency_symbol?: string
  currency_name?: string
  theme?: string
  needs_percentage?: number
  wants_percentage?: number
  savings_percentage?: number
  applied_at?: string
  created_at?: string
  updated_at?: string
}

interface DataContextType {
  // Data
  transactions: Transaction[]
  budgetCategories: BudgetCategory[]
  incomeSources: IncomeSource[]
  userSettings: UserSettings | null

  // Loading states
  isLoading: boolean

  // Transaction operations
  addTransaction: (data: Omit<Transaction, "id">) => Promise<Transaction>
  updateTransactionById: (id: string, data: Partial<Transaction>) => Promise<Transaction>
  deleteTransactionById: (id: string) => Promise<void>

  // Budget category operations
  addBudgetCategory: (data: Omit<BudgetCategory, "id" | "created_at" | "updated_at">) => Promise<BudgetCategory>
  updateBudgetCategoryById: (id: string, data: Partial<BudgetCategory>) => Promise<BudgetCategory>
  deleteBudgetCategoryById: (id: string) => Promise<void>

  // Income source operations
  addIncomeSource: (data: Omit<IncomeSource, "id" | "created_at" | "updated_at">) => Promise<IncomeSource>
  updateIncomeSourceById: (id: string, data: Partial<IncomeSource>) => Promise<IncomeSource>
  deleteIncomeSourceById: (id: string) => Promise<void>

  // User settings operations
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<UserSettings | null>

  // Refresh operations
  refreshAll: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshBudgetCategories: () => Promise<void>
  refreshIncomeSources: () => Promise<void>
  refreshUserSettings: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const { selectedMonthNumber, selectedYear } = useDateContext()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch functions
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getTransactions(user.id, selectedMonthNumber, selectedYear)
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
  }, [user?.id, selectedMonthNumber, selectedYear])

  const fetchBudgetCategories = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getBudgetCategories(user.id, selectedMonthNumber, selectedYear)
      setBudgetCategories(data)
    } catch (error) {
      console.error("Error fetching budget categories:", error)
    }
  }, [user?.id, selectedMonthNumber, selectedYear])

  const fetchIncomeSources = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getIncomeSources(user.id, selectedMonthNumber, selectedYear)
      setIncomeSources(data)
    } catch (error) {
      console.error("Error fetching income sources:", error)
    }
  }, [user?.id, selectedMonthNumber, selectedYear])

  const fetchUserSettings = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getUserSettings(user.id)
      setUserSettings(data)
    } catch (error) {
      console.error("Error fetching user settings:", error)
    }
  }, [user?.id])

  const refreshAll = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      await Promise.all([
        fetchTransactions(),
        fetchBudgetCategories(),
        fetchIncomeSources(),
        fetchUserSettings(),
      ])
    } finally {
      setIsLoading(false)
    }
  }, [fetchTransactions, fetchBudgetCategories, fetchIncomeSources, fetchUserSettings, user?.id])

  // Initialize user and load data
  useEffect(() => {
    const initializeData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        await createOrGetUser(user.id, user.primaryEmailAddress?.emailAddress, user.fullName || undefined)
        await refreshAll()
      } catch (error) {
        console.error("Error initializing data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [user?.id])

  // Reload data when month/year changes
  useEffect(() => {
    if (user?.id) {
      refreshAll()
    }
  }, [selectedMonthNumber, selectedYear, refreshAll, user?.id])

  // Transaction operations with immediate state updates
  const addTransaction = useCallback(async (data: any) => {
    if (!user?.id) throw new Error("User not authenticated")

    const newTransaction = await createTransaction(data)
    setTransactions(prev => [newTransaction, ...prev])
    return newTransaction
  }, [user?.id])

  const updateTransactionById = useCallback(async (id: string, data: any) => {
    const updated = await updateTransaction(id, data)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const deleteTransactionById = useCallback(async (id: string) => {
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  // Budget category operations with immediate state updates
  const addBudgetCategory = useCallback(async (data: any) => {
    if (!user?.id) throw new Error("User not authenticated")

    const newCategory = await createBudgetCategory({
      ...data,
      clerk_user_id: user.id,
    })
    setBudgetCategories(prev => [...prev, newCategory])
    return newCategory
  }, [user?.id])

  const updateBudgetCategoryById = useCallback(async (id: string, data: any) => {
    const updated = await updateBudgetCategory(id, data)
    setBudgetCategories(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const deleteBudgetCategoryById = useCallback(async (id: string) => {
    await deleteBudgetCategory(id)
    setBudgetCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  // Income source operations with immediate state updates
  const addIncomeSource = useCallback(async (data: any) => {
    if (!user?.id) throw new Error("User not authenticated")

    const newSource = await createIncomeSource({
      ...data,
      clerk_user_id: user.id,
    })
    setIncomeSources(prev => [...prev, newSource])
    return newSource
  }, [user?.id])

  const updateIncomeSourceById = useCallback(async (id: string, data: any) => {
    const updated = await updateIncomeSource(id, data)
    setIncomeSources(prev => prev.map(s => s.id === id ? updated : s))
    return updated
  }, [])

  const deleteIncomeSourceById = useCallback(async (id: string) => {
    await deleteIncomeSource(id)
    setIncomeSources(prev => prev.filter(s => s.id !== id))
  }, [])

  // User settings operations with immediate state updates
  const updateUserSettingsData = useCallback(async (settings: Partial<UserSettings>) => {
    if (!user?.id) return null

    const updated = await createOrUpdateUserSettings(user.id, settings)
    setUserSettings(updated)
    return updated
  }, [user?.id])

  const value: DataContextType = {
    transactions,
    budgetCategories,
    incomeSources,
    userSettings,
    isLoading,
    addTransaction,
    updateTransactionById,
    deleteTransactionById,
    addBudgetCategory,
    updateBudgetCategoryById,
    deleteBudgetCategoryById,
    addIncomeSource,
    updateIncomeSourceById,
    deleteIncomeSourceById,
    updateUserSettings: updateUserSettingsData,
    refreshAll,
    refreshTransactions: fetchTransactions,
    refreshBudgetCategories: fetchBudgetCategories,
    refreshIncomeSources: fetchIncomeSources,
    refreshUserSettings: fetchUserSettings,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
