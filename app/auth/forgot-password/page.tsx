"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
          ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/auth/reset-password`
          : `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        if (error.message.includes("email") || error.message.includes("SMTP")) {
          setError(
            "Unable to send password reset email. Please check your email address or contact support if the issue persists.",
          )
        } else if (error.message.includes("rate limit")) {
          setError("Too many password reset attempts. Please wait a few minutes before trying again.")
        } else if (error.message.includes("not found")) {
          setError("No account found with this email address. Please check your email or sign up for a new account.")
        } else {
          setError(`Password reset failed: ${error.message}`)
        }
        throw error
      }

      setMessage(
        "Password reset email sent successfully! Please check your inbox (and spam folder) for the reset link. The link will expire in 1 hour.",
      )
      setEmail("") // Clear the email field on success
    } catch (error: unknown) {
      console.error("Password reset error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">Forgot Password</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Enter your email address and we'll send you a secure link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-950 dark:border-green-800">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
                {isLoading ? "Sending Reset Link..." : "Send Password Reset Link"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                  Back to Login
                </Link>
              </p>
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
