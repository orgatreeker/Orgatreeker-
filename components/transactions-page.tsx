"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, Receipt } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { useDateContext } from "@/contexts/date-context"
import { useData } from "@/contexts/data-context"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

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
  type: string
  budgeted_amount?: number
}

export function TransactionsPage() {
  const { formatAmount } = useCurrency()
  const { selectedMonthNumber, selectedYear } = useDateContext()
  const { user } = useUser()
  const {
    transactions,
    budgetCategories,
    isLoading,
    addTransaction,
    updateTransactionById,
    deleteTransactionById
  } = useData()
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Auto-select today's date
    amount: "",
    category: "", // This will be: Needs, Wants, Saving
    subcategory: "", // This will be the budget category name
    notes: "",
  })

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Get budget categories filtered by type (Needs, Wants, Saving/Savings)
  const getBudgetCategoriesByType = (type: string): BudgetCategory[] => {
    // Handle both "Saving" and "Savings" for backward compatibility
    if (type === "Saving" || type === "Savings") {
      return budgetCategories.filter(cat => cat.type === "Saving" || cat.type === "Savings")
    }
    return budgetCategories.filter(cat => cat.type === type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error("Please sign in to add transactions")
      return
    }

    if (!formData.date || !formData.amount || !formData.category || !formData.subcategory) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      const transactionDate = new Date(formData.date)
      const month = transactionDate.getMonth() + 1
      const year = transactionDate.getFullYear()

      // Find the budget category by subcategory name
      const budgetCategory = budgetCategories.find(c => c.name === formData.subcategory)

      const transactionData = {
        clerk_user_id: user.id,
        category_id: budgetCategory?.id || null,
        category: formData.category, // Needs, Wants, or Savings
        subcategory: formData.subcategory, // Budget category name
        notes: formData.notes || '',
        amount: parseFloat(formData.amount),
        transaction_date: formData.date,
        month,
        year,
      }

      if (editingTransaction) {
        // Update existing transaction
        await updateTransactionById(editingTransaction.id, transactionData)
        toast.success("Transaction updated successfully!")
        setEditingTransaction(null)
      } else {
        // Add new transaction
        await addTransaction(transactionData)
        toast.success("Transaction added successfully!")
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        category: "",
        subcategory: "",
        notes: "",
      })
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast.error("Failed to save transaction")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      date: transaction.transaction_date,
      amount: transaction.amount.toString(),
      category: transaction.category,
      subcategory: transaction.subcategory,
      notes: transaction.notes,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }

    try {
      await deleteTransactionById(id)
      toast.success("Transaction deleted successfully!")
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error("Failed to delete transaction")
    }
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      category: "",
      subcategory: "",
      notes: "",
    })
  }

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Needs":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "Wants":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
      case "Saving":
      case "Savings":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions Log</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Total: {formatAmount(getTotalAmount())}
          </Badge>
        </div>
      </div>

      {/* Add Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </CardTitle>
          <CardDescription>
            {editingTransaction 
              ? "Update the transaction details below" 
              : "Enter transaction details to log a new expense"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Needs">Needs</SelectItem>
                    <SelectItem value="Wants">Wants</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (Budget Category) *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  disabled={!formData.category}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select budget category" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && getBudgetCategoriesByType(formData.category).length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No budget categories for {formData.category}
                      </div>
                    ) : (
                      getBudgetCategoriesByType(formData.category).map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
              </Button>
              {editingTransaction && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first transaction using the form above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead className="text-right">AMOUNT</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead>SUBCATEGORY</TableHead>
                    <TableHead>NOTES</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.category)}>
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.subcategory}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {transaction.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-8 px-2 hover:bg-accent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="h-8 px-2 hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
