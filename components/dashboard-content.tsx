"use client"

import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Loader2, User, Settings, RefreshCw } from "lucide-react"
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
import { LogoutButton } from "@/components/logout-button"
import type { Profile } from "@/lib/profile-utils"
import { useData } from "@/contexts/data-context"

interface DashboardContentProps {
  user: any
  profile: Profile | null
}

export function DashboardContent({ user, profile }: DashboardContentProps) {
  // Use shared data context for real-time updates! 🚀
  const {
    incomeSources,
    budgetCategories,
    transactions,
    isLoading: contextLoading
  } = useData()

  const [sortBy, setSortBy] = useState("recent")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [previousMonthData, setPreviousMonthData] = useState<{ income: number; expenses: number }>({
    income: 0,
    expenses: 0,
  })
  const [historicalLoading, setHistoricalLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // Load historical data once on mount (dashboard-specific data)
  useEffect(() => {
    if (user) {
      loadHistoricalData()
    }
  }, [user])

  const loadHistoricalData = async () => {
    if (!user) return
    setHistoricalLoading(true)
    try {
      await Promise.all([
        fetchHistoricalData(user.id),
        fetchPreviousMonthData(user.id),
      ])
    } finally {
      setHistoricalLoading(false)
    }
  }

  const handleRefreshCharts = async () => {
    setIsRefreshing(true)
    try {
      await loadHistoricalData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchHistoricalData = async (userId: string) => {
    try {
      const { getIncomeSources, getTransactions } = await import('@/lib/supabase/database')
      
      // Prepare all months to fetch
      const monthsToFetch = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1)
        monthsToFetch.push({
          date,
          month: date.getMonth() + 1,
          year: date.getFullYear()
        })
      }
      
      // Fetch all months in parallel
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
      
      const prevDate = new Date(currentYear, currentMonth - 2, 1)
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

  const getUserInitials = () => {
    const name =
      profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "User"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserDisplayName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "User"
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
      const type = transaction.category || "Other"
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
      color: "#a855f7", // Purple-500
    },
    {
      name: "Wants",
      value: totalSpent > 0 ? Math.round(((expensesByType.Wants || 0) / totalSpent) * 100) : 0,
      amount: expensesByType.Wants || 0,
      color: "#06b6d4", // Cyan-500
    },
    {
      name: "Saving",
      value: totalSpent > 0 ? Math.round(((expensesByType.Saving || 0) / totalSpent) * 100) : 0,
      amount: expensesByType.Saving || 0,
      color: "#10b981", // Green-500
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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

  // Show loading only if both context and historical data are loading
  if (contextLoading || historicalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FT</span>
            </div>
            <h1 className="text-xl font-semibold">Hi, {getUserDisplayName()} 👋</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton variant="dropdown" />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          {error && <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>}

          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshCharts}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Charts'}
              </Button>
              <Badge variant="secondary" className="text-sm">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Badge>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
                <p className="text-xs text-muted-foreground">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                {growthPercentage > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {growthPercentage > 0 ? "+" : ""}
                  {growthPercentage}%
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
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
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#64748b"
                      strokeWidth={3}
                      name="Expenses"
                      dot={{ fill: "#64748b", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#64748b", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>
                  Breakdown by category for{" "}
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalSpent > 0 ? (
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
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest transactions for{" "}
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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
                    No transactions found for{" "}
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by adding some income sources and budget categories to track your finances.
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
      </main>
    </div>
  )
}
