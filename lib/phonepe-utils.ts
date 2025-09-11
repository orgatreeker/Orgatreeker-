import crypto from "crypto"
import { PHONEPE_CONFIG } from "./phonepe-config"

export function generateChecksum(payload: string, endpoint: string): string {
  const string = payload + endpoint + PHONEPE_CONFIG.saltKey
  const sha256 = crypto.createHash("sha256").update(string).digest("hex")
  return sha256 + "###" + PHONEPE_CONFIG.saltIndex
}

export function verifyChecksum(receivedChecksum: string, payload: string, endpoint: string): boolean {
  const expectedChecksum = generateChecksum(payload, endpoint)
  return receivedChecksum === expectedChecksum
}

export function generateMerchantTransactionId(): string {
  return `MT${Date.now()}${Math.random().toString(36).substr(2, 9)}`
}

export async function initiatePhonePePayment(
  amount: number,
  userId: string,
  plan: "monthly" | "yearly",
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const merchantTransactionId = generateMerchantTransactionId()

    const paymentRequest = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId,
      merchantUserId: userId,
      amount: amount,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?txnId=${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/phonepe/callback`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    }

    const payload = Buffer.from(JSON.stringify(paymentRequest)).toString("base64")
    const checksum = generateChecksum(payload, "/pg/v1/pay")

    const response = await fetch(`${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({
        request: payload,
      }),
    })

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        data: {
          ...result.data,
          merchantTransactionId,
          plan,
        },
      }
    } else {
      return {
        success: false,
        error: result.message || "Payment initiation failed",
      }
    }
  } catch (error) {
    console.error("PhonePe payment initiation error:", error)
    return {
      success: false,
      error: "Failed to initiate payment",
    }
  }
}
