"use client"

import { useState, useEffect } from "react"
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
import { useUser } from "@clerk/nextjs"
import { MonthPicker } from "@/components/month-picker"
import { useDateContext } from "@/contexts/date-context"
import { useCurrency } from "@/contexts/currency-context"
import { useData } from "@/contexts/data-context"

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
  const {
    budgetCategories: categories,
    transactions,
    incomeSources,
    userSettings,
    isLoading,
    addBudgetCategory,
    updateBudgetCategoryById,
    deleteBudgetCategoryById,
  } = useData()

  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { selectedDate, selectedYear, selectedMonthNumber } = useDateContext()
  const { formatAmount } = useCurrency()
  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    category: "",
  })

  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)
  const getTargetAmount = (percentage: number) => (totalIncome * percentage) / 100

  const getSpentAmount = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return 0
    
    return transactions
      .filter((transaction) => transaction.subcategory === category.name)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  }

  const getBudgetOverviewData = () => {
    // Get custom percentages from user settings or use defaults
    const needsPercentage = userSettings?.needs_percentage ?? 50
    const wantsPercentage = userSettings?.wants_percentage ?? 30
    const savingsPercentage = userSettings?.savings_percentage ?? 20

    // Calculate total income
    const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)

    // Calculate target amounts based on percentages
    const needsTarget = (totalIncome * needsPercentage) / 100
    const wantsTarget = (totalIncome * wantsPercentage) / 100
    const savingsTarget = (totalIncome * savingsPercentage) / 100

    const needsCategories = categories.filter((cat) => cat.type === "Needs")
    const wantsCategories = categories.filter((cat) => cat.type === "Wants")
    const savingsCategories = categories.filter((cat) => cat.type === "Savings" || cat.type === "Saving")

    const needsBudgeted = needsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const wantsBudgeted = wantsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
    const savingsBudgeted = savingsCategories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)

    const needsSpent = needsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const wantsSpent = wantsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)
    const savingsSpent = savingsCategories.reduce((sum, cat) => sum + getSpentAmount(cat.id), 0)

    return [
      { category: "Needs", budgeted: needsBudgeted, spent: needsSpent, percentage: needsPercentage, target: needsTarget, color: "#8b5cf6" },
      { category: "Wants", budgeted: wantsBudgeted, spent: wantsSpent, percentage: wantsPercentage, target: wantsTarget, color: "#06b6d4" },
      { category: "Saving", budgeted: savingsBudgeted, spent: savingsSpent, percentage: savingsPercentage, target: savingsTarget, color: "#10b981" },
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

  const handleOpenTransactionDialog = (category: BudgetCategory) => {
    if (!isPremium && category.type === "Savings") {
      setError("Savings transactions are a Pro feature. Upgrade to Pro to view savings transactions.")
      return
    }

    setSelectedCategory(category)
    setIsTransactionDialogOpen(true)
  }





  const handleSaveCategory = async () => {
    if (!formData.name || !formData.budget || !formData.category || !user?.id) return

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
      }

      if (editingCategory) {
        await updateBudgetCategoryById(editingCategory.id, categoryData)
      } else {
        await addBudgetCategory(categoryData)
      }

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

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${categoryName}" category?\n\nThis will not delete associated transactions, but they will no longer be linked to this category.`
    )

    if (!confirmed) return

    try {
      await deleteBudgetCategoryById(id)
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
          const targetDifference = item.budgeted - item.target

          return (
            <Card key={item.category} className={!isPremium && item.category === "Saving" ? "relative" : ""}>
              {!isPremium && item.category === "Saving" && (
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
                {item.category === "Saving" && <PiggyBank className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Budget Target:</span>
                    <span className="font-bold text-primary">{item.percentage}% of income</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Target Amount: {formatAmount(item.target)}</span>
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
                  const categoryTransactions = transactions.filter((t) => t.subcategory === category.name)

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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(category)}
                            disabled={!isPremium && category.type === "Savings"}
                            className="h-8 px-2 hover:bg-accent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={!isPremium && category.type === "Savings"}
                            className="h-8 px-2 hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction View Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name} - Transaction Summary</DialogTitle>
            <DialogDescription>
              Viewing transactions for this category in{" "}
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Total spent:{" "}
              {formatAmount(selectedCategory ? getSpentAmount(selectedCategory.id) : 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Info Message */}
            <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">These are transactions from the Transactions tab</p>
              </div>
              <p className="text-xs text-muted-foreground">
                To add, edit, or delete transactions, click the <strong>Transactions</strong> tab in the navigation and create a transaction with this category name (<strong>{selectedCategory?.name}</strong>) as the subcategory.
              </p>
            </div>

            {/* Transactions List */}
            <div className="max-h-[400px] overflow-y-auto">
              {selectedCategory && transactions.filter((transaction) => transaction.subcategory === selectedCategory.name).length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No transactions recorded for this category</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add transactions in the Transactions tab
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCategory &&
                      transactions
                        .filter((transaction) => transaction.subcategory === selectedCategory.name)
                        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                        .map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {transaction.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatAmount(Math.abs(transaction.amount))}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
