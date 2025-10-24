"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
  BarChart,
  Bar,
} from "recharts"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useDateContext } from "@/contexts/date-context"
import { useCurrency } from "@/contexts/currency-context"
import { useData } from "@/contexts/data-context"

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
  category: string
  subcategory: string
  notes: string
  amount: number
  transaction_date: string
  category_id?: string
  month: number
  year: number
}

interface DashboardPageProps {
  isPremium?: boolean
}

export function DashboardPage({ isPremium = false }: DashboardPageProps) {
  const {
    incomeSources,
    budgetCategories,
    transactions,
    isLoading,
  } = useData()

  const [sortBy, setSortBy] = useState("recent")
  const [error, setError] = useState<string | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const { user } = useUser()
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [historicalIncomeData, setHistoricalIncomeData] = useState<any[]>([])
  const [previousMonthData, setPreviousMonthData] = useState<{ income: number; expenses: number }>({
    income: 0,
    expenses: 0,
  })
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)
  const router = useRouter()
  const { selectedDate, selectedYear, selectedMonthNumber } = useDateContext()
  const { formatAmount } = useCurrency()

  // Only fetch historical data once on mount or when month/year changes
  useEffect(() => {
    const initializeHistoricalData = async () => {
      if (!user?.id) return

      setIsLoadingCharts(true)
      try {
        await Promise.all([
          fetchHistoricalData(user.id),
          fetchPreviousMonthData(user.id),
          fetchHistoricalIncomeData(user.id)
        ])
      } catch (error) {
        console.error("Error initializing data:", error)
      } finally {
        setIsLoadingCharts(false)
      }
    }

    initializeHistoricalData()
  }, [user?.id, selectedYear, selectedMonthNumber])

  const fetchHistoricalIncomeData = async (userId: string) => {
    try {
      const { getIncomeSources } = await import('@/lib/supabase/database')

      // Prepare all months we need to fetch
      const monthsToFetch = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonthNumber - 1 - i, 1)
        monthsToFetch.push({
          date,
          month: date.getMonth() + 1,
          year: date.getFullYear()
        })
      }

      // Fetch all months in parallel
      const results = await Promise.all(
        monthsToFetch.map(({ month, year }) => getIncomeSources(userId, month, year))
      )

      // Process results
      const historicalMonths = monthsToFetch.map((monthData, index) => {
        const sources = results[index]
        const totalIncome = sources.reduce((sum: number, source: IncomeSource) => sum + source.amount, 0)

        return {
          month: monthData.date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          income: totalIncome,
        }
      })

      setHistoricalIncomeData(historicalMonths)
    } catch (error) {
      console.error("Error fetching historical income data:", error)
    }
  }

  const fetchHistoricalData = async (userId: string) => {
    try {
      const { getIncomeSources, getTransactions } = await import('@/lib/supabase/database')
      
      // Prepare all months to fetch
      const monthsToFetch = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonthNumber - 1 - i, 1)
        monthsToFetch.push({
          date,
          month: date.getMonth() + 1,
          year: date.getFullYear()
        })
      }
      
      // Fetch all months in parallel (12 parallel requests instead of 6 sequential)
      const allResults = await Promise.all(
        monthsToFetch.flatMap(({ month, year }) => [
          getIncomeSources(userId, month, year),
          getTransactions(userId, month, year)
        ])
      )
      
      // Process results
      const historicalMonths = monthsToFetch.map((monthData, index) => {
        const incomeData = allResults[index * 2]
        const transactionData = allResults[index * 2 + 1]
        
        const income = incomeData.reduce((sum, item) => sum + item.amount, 0)
        const expenses = transactionData.reduce((sum, item) => sum + Math.abs(item.amount), 0)
        
        return {
          month: monthData.date.toLocaleDateString("en-US", { month: "short" }),
          income,
          expenses,
        }
      })
      
      setHistoricalData(historicalMonths)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const fetchPreviousMonthData = async (userId: string) => {
    try {
      const { getIncomeSources, getTransactions } = await import('@/lib/supabase/database')
      
      const prevDate = new Date(selectedYear, selectedMonthNumber - 2, 1)
      const prevMonth = prevDate.getMonth() + 1
      const prevYear = prevDate.getFullYear()

      const [incomeData, transactionData] = await Promise.all([
        getIncomeSources(userId, prevMonth, prevYear),
        getTransactions(userId, prevMonth, prevYear)
      ])

      const prevIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
      const prevExpenses = transactionData.reduce((sum, item) => sum + Math.abs(item.amount), 0)

      setPreviousMonthData({ income: prevIncome, expenses: prevExpenses })
    } catch (error) {
      console.error("Error fetching previous month data:", error)
    }
  }

  // Memoize calculated values to prevent unnecessary recalculations
  const totalIncome = useMemo(
    () => incomeSources.reduce((sum, source) => sum + source.amount, 0),
    [incomeSources]
  )

  const totalBudgeted = useMemo(
    () => budgetCategories.reduce((sum, category) => sum + category.budgeted_amount, 0),
    [budgetCategories]
  )

  const totalSpent = useMemo(
    () => transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [transactions]
  )

  const totalSavings = useMemo(() => totalIncome - totalSpent, [totalIncome, totalSpent])

  // Memoize budget overview data
  const budgetOverviewData = useMemo(() => {
    const getSpentAmount = (categoryId: string) => {
      return transactions
        .filter((transaction) => transaction.category_id === categoryId)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    }

    const needsCategories = budgetCategories.filter((cat) => cat.type === "Needs")
    const wantsCategories = budgetCategories.filter((cat) => cat.type === "Wants")
    const savingsCategories = budgetCategories.filter((cat) => cat.type === "Savings")

    const needsBudgeted = needsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const wantsBudgeted = wantsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const savingsBudgeted = savingsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)

    const needsSpent = needsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const wantsSpent = wantsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const savingsSpent = savingsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)

    return [
      { category: "Needs", budgeted: needsBudgeted, spent: needsSpent, color: "#8b5cf6" },
      { category: "Wants", budgeted: wantsBudgeted, spent: wantsSpent, color: "#06b6d4" },
      { category: "Savings", budgeted: savingsBudgeted, spent: savingsSpent, color: "#10b981" },
    ]
  }, [budgetCategories, transactions])

  const budgetPieChartData = useMemo(
    () => budgetOverviewData.map((item) => ({
      name: item.category,
      value: item.budgeted,
      color: item.color,
    })),
    [budgetOverviewData]
  )

  const budgetBarChartData = useMemo(
    () => budgetOverviewData.map((item) => ({
      category: item.category,
      budgeted: item.budgeted,
      spent: item.spent,
    })),
    [budgetOverviewData]
  )

  const growthPercentage = useMemo(() => {
    const currentSavings = totalSavings
    const previousSavings = previousMonthData.income - previousMonthData.expenses

    if (previousSavings === 0) return 0
    return Math.round(((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100)
  }, [totalSavings, previousMonthData])

  // Memoize pie chart data
  const pieData = useMemo(() => {
    const expensesBySubcategory = transactions.reduce(
      (acc, transaction) => {
        const subcategory = transaction.subcategory || "Other"
        acc[subcategory] = (acc[subcategory] || 0) + Math.abs(transaction.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    const generateColor = (index: number, total: number) => {
      const hue = (index * 360) / total
      return `hsl(${hue}, 70%, 60%)`
    }

    return Object.entries(expensesBySubcategory)
      .map(([name, amount], index, arr) => ({
        name,
        value: totalSpent > 0 ? ((amount / totalSpent) * 100) : 0,
        amount,
        color: generateColor(index, arr.length),
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, totalSpent])

  const formatCurrency = (amount: number) => {
    return formatAmount(amount)
  }

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
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
  }, [transactions, sortBy])

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

      {/* Income Growth Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income Growth Trend</CardTitle>
          <CardDescription>
            Monthly income progression over the last 6 months ending in {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCharts ? (
            <div className="space-y-3 h-[300px] flex flex-col justify-center">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : historicalIncomeData.length > 0 && historicalIncomeData.some(d => d.income > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalIncomeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `$${(value / 1000).toFixed(1)}k`
                    }
                    return `$${value}`
                  }}
                />
                <Tooltip
                  formatter={(value) => [formatAmount(Number(value)), "Monthly Income"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  animationDuration={300}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{
                    fill: "#10b981",
                    strokeWidth: 3,
                    r: 5,
                    stroke: "#ffffff",
                    strokeOpacity: 0.8,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#10b981",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))",
                  }}
                  name="Monthly Income"
                  filter="drop-shadow(0 2px 4px rgba(16, 185, 129, 0.2))"
                  animationDuration={800}
                  animationEasing="ease-in-out"
                  isAnimationActive={!isLoadingCharts}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No income data to display</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add income sources to see your growth trend
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <div className="space-y-3 h-[300px] flex flex-col justify-center">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
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
                    animationDuration={300}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Income"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Expenses"
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
              <ResponsiveContainer width="100%" height={450}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                    animationDuration={200}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>
              Distribution for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <div className="space-y-3 h-[300px] flex flex-col justify-center">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : budgetPieChartData.some((item) => item.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetPieChartData.filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {budgetPieChartData
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                      animationDuration={200}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {budgetPieChartData
                    .filter((entry) => entry.value > 0)
                    .map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">
                          {entry.name}: {formatCurrency(entry.value)}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No budget data available for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actual vs Budget</CardTitle>
            <CardDescription>
              Comparison for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <div className="space-y-3 h-[300px] flex flex-col justify-center">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : budgetBarChartData.some((item) => item.budgeted > 0 || item.spent > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetBarChartData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                    animationDuration={200}
                  />
                  <Bar
                    dataKey="budgeted"
                    fill="#8b5cf6"
                    name="Budgeted"
                    radius={[4, 4, 0, 0]}
                    filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="spent"
                    fill="#f59e0b"
                    name="Spent"
                    radius={[4, 4, 0, 0]}
                    filter="drop-shadow(0 2px 4px rgba(245, 158, 11, 0.2))"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No budget data available for{" "}
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
                  <TableHead>Budget Category</TableHead>
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
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{transaction.subcategory}</TableCell>
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
