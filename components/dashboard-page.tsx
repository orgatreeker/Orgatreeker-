"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Loader2, Lock, Crown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useRouter } from "next/navigation"
import { useDateContext } from "@/contexts/date-context"
import { useCurrency } from "@/contexts/currency-context"

interface IncomeSource {
  id: string
  name: string
  category: string
  amount: number
  month: number
  year: number
}

interface BudgetCategory {
  id: string
  name: string
  type: string
  budgeted_amount: number
  month: number
  year: number
}

interface Transaction {
  id: string
  description: string
  amount: number
  transaction_date: string
  category_id: string
  month: number
  year: number
  budget_categories: {
    name: string
    type: string
  }
}

interface DashboardPageProps {
  isPremium?: boolean
}

export function DashboardPage({ isPremium = false }: DashboardPageProps) {
  const [sortBy, setSortBy] = useState("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [previousMonthData, setPreviousMonthData] = useState<{ income: number; expenses: number }>({
    income: 0,
    expenses: 0,
  })
  const router = useRouter()
  const { selectedDate, selectedYear, selectedMonthNumber } = useDateContext()
  const { formatAmount } = useCurrency()

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchIncomeSources(user.id),
        fetchBudgetData(user.id),
        fetchTransactions(user.id),
        fetchHistoricalData(user.id),
        fetchPreviousMonthData(user.id),
      ])
    }
  }, [selectedYear, selectedMonthNumber, user])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await Promise.all([
        fetchIncomeSources(user.id),
        fetchBudgetData(user.id),
        fetchTransactions(user.id),
        fetchHistoricalData(user.id),
        fetchPreviousMonthData(user.id),
      ])
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/auth/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchIncomeSources = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)

      if (error) throw error
      setIncomeSources(data || [])
    } catch (error) {
      console.error("Error fetching income sources:", error)
      setError("Failed to load income data")
    }
  }

  const fetchBudgetData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)

      if (error) throw error
      setBudgetCategories(data || [])
    } catch (error) {
      console.error("Error fetching budget data:", error)
      setError("Failed to load budget data")
    }
  }

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          budget_categories (
            name,
            type
          )
        `,
        )
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)
        .order("transaction_date", { ascending: false })
        .limit(10)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError("Failed to load transactions")
    }
  }

  const fetchHistoricalData = async (userId: string) => {
    try {
      const [incomeData, transactionData] = await Promise.all([
        supabase
          .from("income_sources")
          .select("amount, month, year")
          .eq("user_id", userId)
          .gte("year", selectedYear - 1),
        supabase
          .from("transactions")
          .select("amount, month, year")
          .eq("user_id", userId)
          .gte("year", selectedYear - 1),
      ])

      if (incomeData.error) throw incomeData.error
      if (transactionData.error) throw transactionData.error

      const incomeByMonth = (incomeData.data || []).reduce((acc: any, item) => {
        const key = `${item.year}-${item.month}`
        acc[key] = (acc[key] || 0) + item.amount
        return acc
      }, {})

      const expensesByMonth = (transactionData.data || []).reduce((acc: any, item) => {
        const key = `${item.year}-${item.month}`
        acc[key] = (acc[key] || 0) + Math.abs(item.amount)
        return acc
      }, {})

      const chartData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonthNumber - 1 - i, 1)
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`
        chartData.push({
          month: date.toLocaleDateString("en-US", { month: "short" }),
          income: incomeByMonth[key] || 0,
          expenses: expensesByMonth[key] || 0,
        })
      }

      setHistoricalData(chartData)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const fetchPreviousMonthData = async (userId: string) => {
    try {
      const prevDate = new Date(selectedYear, selectedMonthNumber - 2, 1)
      const prevMonth = prevDate.getMonth() + 1
      const prevYear = prevDate.getFullYear()

      const [incomeData, transactionData] = await Promise.all([
        supabase
          .from("income_sources")
          .select("amount")
          .eq("user_id", userId)
          .eq("month", prevMonth)
          .eq("year", prevYear),
        supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("month", prevMonth)
          .eq("year", prevYear),
      ])

      if (incomeData.error) throw incomeData.error
      if (transactionData.error) throw transactionData.error

      const prevIncome = (incomeData.data || []).reduce((sum, item) => sum + item.amount, 0)
      const prevExpenses = (transactionData.data || []).reduce((sum, item) => sum + Math.abs(item.amount), 0)

      setPreviousMonthData({ income: prevIncome, expenses: prevExpenses })
    } catch (error) {
      console.error("Error fetching previous month data:", error)
    }
  }

  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)
  const totalBudgeted = budgetCategories.reduce((sum, category) => sum + category.budgeted_amount, 0)
  const totalSpent = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  const totalSavings = totalIncome - totalSpent

  const calculateGrowthPercentage = () => {
    const currentSavings = totalSavings
    const previousSavings = previousMonthData.income - previousMonthData.expenses

    if (previousSavings === 0) return 0
    return Math.round(((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100)
  }

  const growthPercentage = calculateGrowthPercentage()

  const expensesByType = transactions.reduce(
    (acc, transaction) => {
      const type = transaction.budget_categories?.type || "Other"
      acc[type] = (acc[type] || 0) + Math.abs(transaction.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = [
    {
      name: "Needs",
      value: totalSpent > 0 ? Math.round(((expensesByType.Needs || 0) / totalSpent) * 100) : 0,
      amount: expensesByType.Needs || 0,
      color: "#8b5cf6", // Purple-500
    },
    {
      name: "Wants",
      value: totalSpent > 0 ? Math.round(((expensesByType.Wants || 0) / totalSpent) * 100) : 0,
      amount: expensesByType.Wants || 0,
      color: "#06b6d4", // Cyan-500
    },
    {
      name: "Savings",
      value: totalSpent > 0 ? Math.round(((expensesByType.Savings || 0) / totalSpent) * 100) : 0,
      amount: expensesByType.Savings || 0,
      color: "#10b981", // Emerald-500
    },
  ]

  const formatCurrency = (amount: number) => {
    return formatAmount(amount)
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    switch (sortBy) {
      case "highest":
        return Math.abs(b.amount) - Math.abs(a.amount)
      case "lowest":
        return Math.abs(a.amount) - Math.abs(b.amount)
      case "recent":
      default:
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Badge>
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            {!isPremium ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : growthPercentage > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            {!isPremium ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-muted-foreground">--</div>
                <Button size="sm" variant="outline" className="text-xs h-6 bg-transparent">
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade to Pro
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {growthPercentage > 0 ? "+" : ""}
                  {growthPercentage}%
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Income"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>
                Breakdown by category for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </div>
            {!isPremium && (
              <Badge variant="outline" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Pro Only
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {!isPremium ? (
              <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Advanced Analytics Locked</p>
                  <p className="text-xs text-muted-foreground">Upgrade to Pro to see detailed expense breakdowns</p>
                  <Button size="sm" className="mt-2">
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            ) : totalSpent > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData.filter((item) => item.amount > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {pieData
                        .filter((item) => item.amount > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {pieData
                    .filter((entry) => entry.amount > 0)
                    .map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full border border-background"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">
                          {entry.name}: {formatCurrency(entry.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest transactions for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No transactions found for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                .
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some budget categories and transactions to see them here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.budget_categories?.name || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
                    <TableCell className="text-right">
                      {transaction.amount < 0 ? (
                        <span className="text-red-600 font-medium">
                          -{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">+{formatCurrency(transaction.amount)}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
