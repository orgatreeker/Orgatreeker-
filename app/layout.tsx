import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { DateProvider } from "@/contexts/date-context"
import { CurrencyProvider } from "@/contexts/currency-context"
import { PerformanceProvider } from "@/components/performance-provider"
import { OptimizedSmoothScroll } from "@/components/optimized-smooth-scroll"

export const metadata: Metadata = {
  title: "FinanceTracker - Personal Finance Management",
  description: "Track your income, expenses, and budgets with ease",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider>
          <CurrencyProvider>
            <DateProvider>
              <PerformanceProvider>
                <OptimizedSmoothScroll>{children}</OptimizedSmoothScroll>
              </PerformanceProvider>
            </DateProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
