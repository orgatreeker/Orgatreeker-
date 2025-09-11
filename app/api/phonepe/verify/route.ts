import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateChecksum } from "@/lib/phonepe-utils"
import { PHONEPE_CONFIG } from "@/lib/phonepe-config"

export async function POST(request: NextRequest) {
  try {
    const { merchantTransactionId } = await request.json()

    if (!merchantTransactionId) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check payment status with PhonePe
    const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${merchantTransactionId}`
    const checksum = generateChecksum("", endpoint)

    const response = await fetch(`${PHONEPE_CONFIG.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": PHONEPE_CONFIG.merchantId,
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: result.success,
      status: result.data?.state || "UNKNOWN",
      data: result.data,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
