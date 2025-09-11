export interface PhonePeConfig {
  merchantId: string
  saltKey: string
  saltIndex: number
  baseUrl: string
}

export interface PhonePePaymentRequest {
  merchantTransactionId: string
  amount: number
  merchantUserId: string
  redirectUrl: string
  redirectMode: string
  callbackUrl: string
  paymentInstrument: {
    type: string
  }
}

export interface PhonePePaymentResponse {
  success: boolean
  code: string
  message: string
  data?: {
    merchantId: string
    merchantTransactionId: string
    transactionId: string
    amount: number
    state: string
    responseCode: string
    paymentInstrument: any
  }
}

export const PHONEPE_CONFIG: PhonePeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID || "",
  saltKey: process.env.PHONEPE_SALT_KEY || "",
  saltIndex: Number.parseInt(process.env.PHONEPE_SALT_INDEX || "1"),
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "https://api.phonepe.com/apis/hermes"
      : "https://api-preprod.phonepe.com/apis/hermes",
}

export const PRICING = {
  monthly: {
    amount: 500, // $5.00 in cents
    currency: "USD",
    plan: "monthly",
  },
  yearly: {
    amount: 2900, // $29.00 in cents
    currency: "USD",
    plan: "yearly",
  },
}
