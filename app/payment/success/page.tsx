"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, XCircle, Crown } from "lucide-react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const txnId = searchParams.get("txnId")

    if (!txnId) {
      setStatus("failed")
      setMessage("Invalid transaction ID")
      return
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/phonepe/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ merchantTransactionId: txnId }),
        })

        const result = await response.json()

        if (result.success && result.status === "COMPLETED") {
          setStatus("success")
          setMessage("Payment completed successfully! Your subscription is now active.")
          localStorage.setItem("payment_success", "true")
          console.log("[v0] Payment success - setting localStorage flag")
        } else {
          setStatus("failed")
          setMessage("Payment verification failed. Please contact support.")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setStatus("failed")
        setMessage("Failed to verify payment. Please contact support.")
      }
    }

    verifyPayment()
  }, [searchParams])

  const handleGoToDashboard = () => {
    if (status === "success") {
      localStorage.setItem("payment_success", "true")
    }
    router.push("/app")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === "failed" && <XCircle className="h-6 w-6 text-red-600" />}
            Payment {status === "loading" ? "Processing" : status === "success" ? "Successful" : "Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                <Crown className="h-4 w-4" />
                Welcome to Pro!
              </div>
              <p className="text-sm text-green-600">All premium features are now unlocked in your dashboard.</p>
            </div>
          )}

          {status !== "loading" && (
            <div className="space-y-2">
              <Button onClick={handleGoToDashboard} className="w-full">
                {status === "success" ? "View Pro Dashboard" : "Go to Dashboard"}
              </Button>
              {status === "failed" && (
                <Button variant="outline" onClick={() => router.push("/app")} className="w-full">
                  Try Again
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
