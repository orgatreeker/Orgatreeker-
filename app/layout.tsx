import type React from "react"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { DateProvider } from "@/contexts/date-context"
import { CurrencyProvider } from "@/contexts/currency-context"
import { DataProvider } from "@/contexts/data-context"

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
    <ClerkProvider
      afterSignInUrl="/pricing"
      afterSignUpUrl="/pricing"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} style={{ fontFamily: GeistSans.style.fontFamily }}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <ThemeProvider>
            <CurrencyProvider>
              <DateProvider>
                <DataProvider>{children}</DataProvider>
              </DateProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
