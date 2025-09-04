"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRightLeft, Calculator, TrendingUp, RefreshCw } from "lucide-react"
import { useCurrency, CURRENCIES } from "@/contexts/currency-context"

interface ConversionRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { selectedCurrency } = useCurrency()

  // Mock exchange rates - in a real app, you'd fetch from an API like exchangerate-api.com
  const mockExchangeRates: Record<string, Record<string, number>> = {
    USD: { EUR: 0.85, GBP: 0.73, JPY: 110.0, CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45 },
    EUR: { USD: 1.18, GBP: 0.86, JPY: 129.5, CAD: 1.47, AUD: 1.59, CHF: 1.08, CNY: 7.6 },
    GBP: { USD: 1.37, EUR: 1.16, JPY: 150.8, CAD: 1.71, AUD: 1.85, CHF: 1.26, CNY: 8.84 },
    JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, CAD: 0.011, AUD: 0.012, CHF: 0.0084, CNY: 0.059 },
    CAD: { USD: 0.8, EUR: 0.68, GBP: 0.58, JPY: 88.0, AUD: 1.08, CHF: 0.74, CNY: 5.16 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, JPY: 81.5, CAD: 0.93, CHF: 0.68, CNY: 4.78 },
    CHF: { USD: 1.09, EUR: 0.93, GBP: 0.79, JPY: 119.6, CAD: 1.35, AUD: 1.47, CNY: 7.03 },
    CNY: { USD: 0.155, EUR: 0.132, GBP: 0.113, JPY: 16.95, CAD: 0.194, AUD: 0.209, CHF: 0.142 },
  }

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      performConversion()
    }
  }, [amount, fromCurrency, toCurrency])

  const performConversion = async () => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount(null)
      setExchangeRate(null)
      return
    }

    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      let rate = 1

      if (fromCurrency === toCurrency) {
        rate = 1
      } else if (mockExchangeRates[fromCurrency] && mockExchangeRates[fromCurrency][toCurrency]) {
        rate = mockExchangeRates[fromCurrency][toCurrency]
      } else {
        // Fallback calculation through USD
        const fromToUsd =
          fromCurrency === "USD"
            ? 1
            : mockExchangeRates["USD"][fromCurrency]
              ? 1 / mockExchangeRates["USD"][fromCurrency]
              : 1
        const usdToTarget = toCurrency === "USD" ? 1 : mockExchangeRates["USD"][toCurrency] || 1
        rate = fromToUsd * usdToTarget
      }

      const converted = Number(amount) * rate
      setConvertedAmount(converted)
      setExchangeRate(rate)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error("Conversion error:", error)
      setConvertedAmount(null)
      setExchangeRate(null)
    } finally {
      setIsLoading(false)
    }
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount)
  }

  const getPopularPairs = () => {
    const userCurrency = selectedCurrency.code
    const popular = ["USD", "EUR", "GBP", "JPY"]
    return popular.filter((code) => code !== userCurrency).slice(0, 3)
  }

  const setQuickConversion = (from: string, to: string) => {
    setFromCurrency(from)
    setToCurrency(to)
    setAmount("100")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Currency Converter
        </CardTitle>
        <CardDescription>Convert between different currencies with live exchange rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conversion Input */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>From Currency</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{currency.code}</span>
                      <span>{currency.symbol}</span>
                      <span className="text-muted-foreground">{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={swapCurrencies}
            className="rounded-full h-10 w-10 p-0 bg-transparent"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label>To Currency</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{currency.code}</span>
                    <span>{currency.symbol}</span>
                    <span className="text-muted-foreground">{currency.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conversion Result */}
        {convertedAmount !== null && exchangeRate !== null && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{formatCurrency(convertedAmount, toCurrency)}</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(Number(amount), fromCurrency)} = {formatCurrency(convertedAmount, toCurrency)}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Exchange Rate:</span>
              </div>
              <div className="font-mono">
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </div>
            </div>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center">Last updated: {lastUpdated}</div>
            )}
          </div>
        )}

        {/* Quick Conversion Pairs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Popular Conversions</Label>
          <div className="grid gap-2 md:grid-cols-3">
            {getPopularPairs().map((targetCurrency) => (
              <Button
                key={targetCurrency}
                variant="outline"
                size="sm"
                onClick={() => setQuickConversion(selectedCurrency.code, targetCurrency)}
                className="justify-between bg-transparent"
              >
                <span>
                  {selectedCurrency.code} → {targetCurrency}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {mockExchangeRates[selectedCurrency.code]?.[targetCurrency]?.toFixed(3) || "N/A"}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={performConversion}
            disabled={isLoading}
            className="bg-transparent"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Rates
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Exchange rates are for demonstration purposes. Use official financial sources for actual transactions.
        </div>
      </CardContent>
    </Card>
  )
}
