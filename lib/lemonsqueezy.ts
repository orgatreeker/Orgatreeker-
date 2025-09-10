import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js"

// Initialize Lemon Squeezy with API key
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error("Lemon Squeezy Error:", error),
})

export {
  createCheckout,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getCustomer,
  listSubscriptions,
} from "@lemonsqueezy/lemonsqueezy.js"

export const LEMON_SQUEEZY_CONFIG = {
  storeId: process.env.LEMONSQUEEZY_STORE_ID!,
  monthlyVariantId: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
  annualVariantId: process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
}
