"use client"

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDateContext } from "@/contexts/date-context"

export function MonthPicker() {
  const { selectedDate, setSelectedDate } = useDateContext()

  const currentMonth = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setSelectedDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setSelectedDate(newDate)
  }

  const goToCurrentMonth = () => {
    setSelectedDate(new Date())
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear()
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="h-8 w-8 p-0 bg-transparent">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={isCurrentMonth() ? "default" : "outline"}
        size="sm"
        onClick={goToCurrentMonth}
        className="h-8 px-3 min-w-[140px]"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {currentMonth}
      </Button>

      <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-8 w-8 p-0 bg-transparent">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
