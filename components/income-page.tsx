"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Plus, MoreHorizontal, Edit, Trash2, DollarSign, TrendingUp, Loader2, Lock, Crown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useRouter } from "next/navigation"
import { useDateContext } from "@/contexts/date-context"
import { useCurrency } from "@/contexts/currency-context"
import { MonthPicker } from "@/components/month-picker" // Import MonthPicker component

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

interface IncomePageProps {
  isPremium?: boolean
}

export function IncomePage({ isPremium = false }: IncomePageProps) {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const router = useRouter()
  const { selectedDate, selectedYear, selectedMonthNumber } = useDateContext()
  const { formatAmount } = useCurrency()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
  })

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchIncomeSources(user.id)
      fetchHistoricalData(user.id)
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
      await fetchIncomeSources(user.id)
      await fetchHistoricalData(user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/auth/login")
    }
  }

  const fetchIncomeSources = async (userId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonthNumber)
        .eq("year", selectedYear)
        .order("created_at", { ascending: false })

      if (error) throw error
      setIncomeSources(data || [])
    } catch (error) {
      console.error("Error fetching income sources:", error)
      setError("Failed to load income sources")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistoricalData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("income_sources")
        .select("amount, month, year")
        .eq("user_id", userId)
        .gte("year", selectedYear - 1)
        .order("year", { ascending: true })
        .order("month", { ascending: true })

      if (error) throw error

      const groupedData = (data || []).reduce((acc: any, item) => {
        const key = `${item.year}-${item.month}`
        if (!acc[key]) {
          acc[key] = {
            month: new Date(item.year, item.month - 1).toLocaleDateString("en-US", { month: "short" }),
            year: item.year,
            monthNum: item.month,
            income: 0,
          }
        }
        acc[key].income += item.amount
        return acc
      }, {})

      const chartData = Object.values(groupedData)
        .sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year
          return a.monthNum - b.monthNum
        })
        .slice(-7)

      setHistoricalData(chartData)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const totalMonthlyIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)

  const handleOpenDialog = (source?: IncomeSource) => {
    if (!source && !isPremium && incomeSources.length >= 5) {
      setError("Free users can only add up to 5 income sources. Upgrade to Pro for unlimited income sources.")
      return
    }

    if (source) {
      setEditingSource(source)
      setFormData({
        name: source.name,
        category: source.category,
        amount: source.amount.toString(),
      })
    } else {
      setEditingSource(null)
      setFormData({ name: "", category: "", amount: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSaveSource = async () => {
    if (!formData.name || !formData.category || !formData.amount || !user) return

    if (!editingSource && !isPremium && incomeSources.length >= 5) {
      setError("Free users can only add up to 5 income sources. Upgrade to Pro for unlimited income sources.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const sourceData = {
        name: formData.name,
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        month: selectedMonthNumber,
        year: selectedYear,
        user_id: user.id,
      }

      if (editingSource) {
        const { error } = await supabase
          .from("income_sources")
          .update(sourceData)
          .eq("id", editingSource.id)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("income_sources").insert([sourceData])

        if (error) throw error
      }

      await fetchIncomeSources(user.id)
      await fetchHistoricalData(user.id)
      setIsDialogOpen(false)
      setFormData({ name: "", category: "", amount: "" })
      setEditingSource(null)
    } catch (error) {
      console.error("Error saving income source:", error)
      setError("Failed to save income source")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSource = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("income_sources").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error
      await fetchIncomeSources(user.id)
      await fetchHistoricalData(user.id)
    } catch (error) {
      console.error("Error deleting income source:", error)
      setError("Failed to delete income source")
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <MonthPicker />
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && incomeSources.length >= 4 && (
            <Badge variant="outline" className="text-xs">
              {incomeSources.length}/5 sources used
            </Badge>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} disabled={!isPremium && incomeSources.length >= 5}>
                <Plus className="mr-2 h-4 w-4" />
                Add Income Source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingSource ? "Edit Income Source" : "Add Income Source"}</DialogTitle>
                <DialogDescription>
                  {editingSource
                    ? "Update your income source details."
                    : `Add a new source of income for ${selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`}
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
                    placeholder="e.g., Primary Job"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaveSource} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSource ? "Update" : "Add"} Income Source
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!isPremium && incomeSources.length >= 5 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Lock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">Income Source Limit Reached</p>
                  <p className="text-sm text-orange-700">You've reached the 5 income source limit for free users.</p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Crown className="w-3 h-3 mr-1" />
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Income - {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatAmount(totalMonthlyIncome)}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            Monthly income for selected period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Growth Trend</CardTitle>
          <CardDescription>Monthly income progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-muted-foreground" />
              <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
              <Tooltip
                formatter={(value) => [formatAmount(Number(value)), "Monthly Income"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
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
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>
            Manage your income sources for{" "}
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            {!isPremium && (
              <span className="ml-2 text-xs text-muted-foreground">({incomeSources.length}/5 sources used)</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomeSources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No income sources added for{" "}
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
              </p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Income Source
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{source.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatAmount(source.amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(source)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSource(source.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
