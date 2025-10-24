"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { getUserSettings, createOrUpdateUserSettings } from "@/lib/supabase/database"

export interface Currency {
  code: string
  name: string
  symbol: string
  country: string
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", country: "European Union" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "Switzerland" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", country: "Australia" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "New Zealand" },

  // Asian Currencies
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", country: "South Korea" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", country: "Hong Kong" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "Thailand" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "Malaysia" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "Indonesia" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "Philippines" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "Vietnam" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "Pakistan" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "Bangladesh" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", country: "Sri Lanka" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", country: "Nepal" },

  // Middle Eastern & African Currencies
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "United Arab Emirates" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", country: "Saudi Arabia" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", country: "Qatar" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", country: "Kuwait" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب", country: "Bahrain" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", country: "Oman" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", country: "Jordan" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", country: "Lebanon" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", country: "Egypt" },
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "South Africa" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", country: "Nigeria" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "Kenya" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", country: "Ghana" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", country: "Morocco" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", country: "Tunisia" },

  // European Currencies
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "Norway" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "Sweden" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "Denmark" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", country: "Poland" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", country: "Czech Republic" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", country: "Hungary" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", country: "Romania" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", country: "Bulgaria" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", country: "Croatia" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин", country: "Serbia" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "Russia" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", country: "Ukraine" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "Turkey" },

  // Latin American Currencies
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "Brazil" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "Mexico" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "Argentina" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "Chile" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "Colombia" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", country: "Peru" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U", country: "Uruguay" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", country: "Bolivia" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", country: "Paraguay" },
  { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs.S", country: "Venezuela" },

  // Other Notable Currencies
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", country: "Israel" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", country: "Iran" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", country: "Afghanistan" },
  { code: "BTC", name: "Bitcoin", symbol: "₿", country: "Digital Currency" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ", country: "Digital Currency" },
]

interface CurrencyContextType {
  selectedCurrency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  getCurrencySymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    CURRENCIES.find((c) => c.code === "USD") || CURRENCIES[0],
  )
  const [isLoading, setIsLoading] = useState(true)

  // Load saved currency from database on mount
  useEffect(() => {
    const loadCurrencySettings = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const settings = await getUserSettings(user.id)
        if (settings && settings.currency_code) {
          const currency = CURRENCIES.find((c) => c.code === settings.currency_code)
          if (currency) {
            setSelectedCurrency(currency)
          }
        }
      } catch (error) {
        console.error('Error loading currency settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrencySettings()
  }, [user?.id])

  const setCurrency = async (currency: Currency) => {
    setSelectedCurrency(currency)

    // Save to database if user is logged in
    if (user?.id) {
      try {
        await createOrUpdateUserSettings(user.id, {
          currency_code: currency.code,
          currency_symbol: currency.symbol,
          currency_name: currency.name,
        })
      } catch (error) {
        console.error('Error saving currency settings:', error)
      }
    }
  }

  const formatAmount = (amount: number): string => {
    return `${selectedCurrency.symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getCurrencySymbol = (): string => {
    return selectedCurrency.symbol
  }

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setCurrency,
        formatAmount,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
