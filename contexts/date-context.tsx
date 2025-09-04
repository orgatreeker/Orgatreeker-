"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface DateContextType {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedMonth: string // Format: "2024-01"
  selectedYear: number
  selectedMonthNumber: number
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const selectedMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`
  const selectedYear = selectedDate.getFullYear()
  const selectedMonthNumber = selectedDate.getMonth() + 1

  return (
    <DateContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedMonth,
        selectedYear,
        selectedMonthNumber,
      }}
    >
      {children}
    </DateContext.Provider>
  )
}

export function useDateContext() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider")
  }
  return context
}
