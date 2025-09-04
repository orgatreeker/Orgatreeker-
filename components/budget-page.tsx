"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  PiggyBank,
  Receipt,
  Loader2,
  Lock,
  Crown,
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useRouter } from "next/navigation"
import { MonthPicker } from "@/components/month-picker"
import { useDateContext } from "@/contexts/date-context"
import { useCurrency } from "@/contexts/currency-context"
import { useBudgetSplit } from "@/hooks/use-budget-split"

interface Transaction {
  id: string
  category_id: string
  description: string
  amount: number
  transaction_date: string
  month: number
  year: number
  created_at?: string
  updated_at?: string
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
}

interface BudgetPageProps {
  isPremium?: boolean
}

export function BudgetPage({ isPremium = false }: BudgetPageProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { selectedDate, selectedYear, selectedMonthNumber } = useDateContext()
  const { formatAmount } = useCurrency() // Added currency context for dynamic formatting
  const { budgetSplit, isLoading: budgetSplitLoading } = useBudgetSplit()
  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    category: "",
  })
  const [transactionFormData, setTransactionFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      Promise.all([fetchBudgetCategories(user.id), fetchTransactions(user.id), fetchIncomeSources(user.id)])
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
      await Promise.all([fetchBudgetCategories(user.id), fetchTransactions(user.id), fetchIncomeSources(user.id)])
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/auth/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBudgetCategories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching budget categories:", error)
      setError("Failed to load budget categories")
    }
  }

  const fetchTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)
        .order("transaction_date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError("Failed to load transactions")
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
    }
  }

  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)
  const getTargetAmount = (percentage: number) => (totalIncome * percentage) / 100

  const getSpentAmount = (categoryId: string) => {
    return transactions
      .filter((transaction) => transaction.category_id === categoryId)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  const getBudgetOverviewData = () => {
    const needsCategories = categories.filter((cat) => cat.type === "Needs")
    const wantsCategories = categories.filter((cat) => cat.type === "Wants")
    const savingsCategories = categories.filter((cat) => cat.type === "Savings")

    const needsBudgeted = needsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const wantsBudgeted = wantsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const savingsBudgeted = savingsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)

    const needsSpent = needsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const wantsSpent = wantsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const savingsSpent = savingsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)

    return [
      {
        category: "Needs",
        budgeted: needsBudgeted,
        spent: needsSpent,
        percentage: budgetSplit.needs_percentage,
        color: "#8b5cf6",
      },
      {
        category: "Wants",
        budgeted: wantsBudgeted,
        spent: wantsSpent,
        percentage: budgetSplit.wants_percentage,
        color: "#06b6d4",
      },
      {
        category: "Savings",
        budgeted: savingsBudgeted,
        spent: savingsSpent,
        percentage: budgetSplit.savings_percentage,
        color: "#10b981",
      },
    ]
  }

  const budgetOverviewData = getBudgetOverviewData()

  const pieChartData = budgetOverviewData.map((item) => ({
    name: item.category,
    value: item.budgeted,
    color: item.color,
  }))

  const barChartData = budgetOverviewData.map((item) => ({
    category: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
  }))

  const handleOpenDialog = (category?: BudgetCategory) => {
    if (!category && !isPremium && formData.category === "Savings") {
      setError("Savings category management is a Pro feature. Upgrade to Pro to manage savings categories.")
      return
    }

    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        budget: category.budgeted_amount.toString(),
        category: category.type,
      })
    } else {
      setEditingCategory(null)
      setFormData({ name: "", budget: "", category: "" })
    }
    setIsDialogOpen(true)
  }

  const handleOpenTransactionDialog = (category: BudgetCategory, transaction?: Transaction) => {
    if (!isPremium && category.type === "Savings") {
      setError("Savings transactions are a Pro feature. Upgrade to Pro to manage savings.")
      return
    }

    setSelectedCategory(category)
    if (transaction) {
      setEditingTransaction(transaction)
      setTransactionFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.transaction_date,
      })
    } else {
      setEditingTransaction(null)
      setTransactionFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
    setIsTransactionDialogOpen(true)
  }

  const handleSaveTransaction = async () => {
    if (!selectedCategory || !transactionFormData.description || !transactionFormData.amount || !user) return

    setIsSaving(true)
    setError(null)

    try {
      const transactionData = {
        category_id: selectedCategory.id,
        description: transactionFormData.description,
        amount: Number.parseFloat(transactionFormData.amount),
        transaction_date: transactionFormData.date,
        month: selectedMonthNumber,
        year: selectedYear,
        user_id: user.id,
      }

      if (editingTransaction) {
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", editingTransaction.id)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("transactions").insert([transactionData])

        if (error) throw error
      }

      await fetchTransactions(user.id)
      setIsTransactionDialogOpen(false)
      setTransactionFormData({ description: "", amount: "", date: new Date().toISOString().split("T")[0] })
      setEditingTransaction(null)
    } catch (error) {
      console.error("Error saving transaction:", error)
      setError("Failed to save transaction")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      await fetchTransactions(user.id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      setError("Failed to delete transaction")
    }
  }

  const handleSaveCategory = async () => {
    if (!formData.name || !formData.budget || !formData.category || !user) return

    if (!isPremium && formData.category === "Savings") {
      setError("Savings category management is a Pro feature. Upgrade to Pro to create savings categories.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const categoryData = {
        name: formData.name,
        budgeted_amount: Number.parseFloat(formData.budget),
        type: formData.category,
        month: selectedMonthNumber,
        year: selectedYear,
        user_id: user.id,
      }

      if (editingCategory) {
        const { error } = await supabase
          .from("budget_categories")
          .update(categoryData)
          .eq("id", editingCategory.id)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("budget_categories").insert([categoryData])

        if (error) throw error
      }

      await fetchBudgetCategories(user.id)
      setIsDialogOpen(false)
      setFormData({ name: "", budget: "", category: "" })
      setEditingCategory(null)
    } catch (error) {
      console.error("Error saving category:", error)
      setError("Failed to save category")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!user) return

    try {
      // First delete all transactions for this category
      await supabase.from("transactions").delete().eq("category_id", id).eq("user_id", user.id)

      // Then delete the category
      const { error } = await supabase.from("budget_categories").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      await Promise.all([fetchBudgetCategories(user.id), fetchTransactions(user.id)])
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Failed to delete category")
    }
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage <= 75) return "bg-green-500"
    if (percentage <= 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  const filteredCategories =
    categoryFilter === "All" ? categories : categories.filter((category) => category.type === categoryFilter)

  if (isLoading || budgetSplitLoading) {
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <MonthPicker />
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {budgetOverviewData.map((item) => {
          const progressPercentage = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0
          const remaining = item.budgeted - item.spent
          const targetAmount = getTargetAmount(item.percentage)
          const targetDifference = item.budgeted - targetAmount

          return (
            <Card key={item.category} className={!isPremium && item.category === "Savings" ? "relative" : ""}>
              {!isPremium && item.category === "Savings" && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
                  <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-center mb-2">Savings Locked</p>
                  <Button size="sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.category}</CardTitle>
                {item.category === "Needs" && <Target className="h-4 w-4 text-muted-foreground" />}
                {item.category === "Wants" && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                {item.category === "Savings" && <PiggyBank className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Your Budget Target:</span>
                    <span>{item.percentage}% of income</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Recommended: {formatAmount(targetAmount)}</span>
                    <span className={targetDifference >= 0 ? "text-green-600" : "text-orange-600"}>
                      {targetDifference >= 0 ? "+" : ""}
                      {formatAmount(targetDifference)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Budgeted: {formatAmount(item.budgeted)}</span>
                  <span>({item.percentage}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatAmount(item.spent)}</span>
                  <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                    {remaining >= 0 ? "+" : ""}
                    {formatAmount(remaining)}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">{progressPercentage.toFixed(1)}% used</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>
              Distribution for {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.some((item) => item.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData.filter((item) => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {pieChartData
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatAmount(Number(value)), "Amount"]}
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
                  {pieChartData
                    .filter((entry) => entry.value > 0)
                    .map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-muted-foreground">
                          {entry.name}: {formatAmount(entry.value)}
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
            {barChartData.some((item) => item.budgeted > 0 || item.spent > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value, name) => [formatAmount(Number(value)), name]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                  <Bar
                    dataKey="budgeted"
                    fill="#8b5cf6"
                    name="Budgeted"
                    radius={[4, 4, 0, 0]}
                    filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))"
                  />
                  <Bar
                    dataKey="spent"
                    fill="#f59e0b"
                    name="Spent"
                    radius={[4, 4, 0, 0]}
                    filter="drop-shadow(0 2px 4px rgba(245, 158, 11, 0.2))"
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

      {/* Category Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Manage budget categories for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="filter" className="text-sm font-medium">
                  Filter:
                </Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[120px]" id="filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Needs">Needs</SelectItem>
                    <SelectItem value="Wants">Wants</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                      {editingCategory
                        ? "Update your budget category details."
                        : `Add a new budget category for ${selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Groceries"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Needs">Needs</SelectItem>
                          <SelectItem value="Wants">Wants</SelectItem>
                          <SelectItem value="Savings" disabled={!isPremium}>
                            Savings {!isPremium && <Lock className="w-3 h-3 ml-1" />}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="budget" className="text-right">
                        Budget
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="col-span-3"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSaveCategory} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCategory ? "Update" : "Add"} Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No budget categories added for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
              </p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Budget Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => {
                  const spent = getSpentAmount(category.id)
                  const remaining = category.budgeted_amount - spent
                  const categoryTransactions = transactions.filter((t) => t.category_id === category.id)

                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.name}
                          {!isPremium && category.type === "Savings" && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatAmount(category.budgeted_amount)}</TableCell>
                      <TableCell className="text-right">{formatAmount(spent)}</TableCell>
                      <TableCell className="text-right">
                        <span className={remaining >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {formatAmount(remaining)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTransactionDialog(category)}
                          className="h-8"
                          disabled={!isPremium && category.type === "Savings"}
                        >
                          <Receipt className="mr-1 h-3 w-3" />
                          {categoryTransactions.length}
                          {!isPremium && category.type === "Savings" && <Lock className="ml-1 h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenDialog(category)}
                              disabled={!isPremium && category.type === "Savings"}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                              {!isPremium && category.type === "Savings" && <Lock className="ml-2 h-3 w-3" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-destructive"
                              disabled={!isPremium && category.type === "Savings"}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                              {!isPremium && category.type === "Savings" && <Lock className="ml-2 h-3 w-3" />}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Management Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name} Transactions</DialogTitle>
            <DialogDescription>
              Manage transactions for this category in{" "}
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Total spent:{" "}
              {formatAmount(selectedCategory ? getSpentAmount(selectedCategory.id) : 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Transaction Form */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={transactionFormData.description}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                    placeholder="e.g., Weekly groceries"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transactionFormData.amount}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionFormData.date}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveTransaction} className="w-full" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingTransaction ? "Update" : "Add"} Transaction
                  </Button>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCategory &&
                    transactions
                      .filter((transaction) => transaction.category_id === selectedCategory.id)
                      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatAmount(transaction.amount)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenTransactionDialog(selectedCategory, transaction)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
