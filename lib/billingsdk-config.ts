/**
 * BillingSDK Config - Plans definition used by the PricingTable component.
 * Read NEXT_PUBLIC_* values at build-time for client usage.
 */

export type PricingPlan = {
  id: string; // product_id from Dodo
  key: 'monthly' | 'yearly';
  name: string;
  subtitle: string;
  priceLabel: string;
  features: string[];
  popular?: boolean;
};

const PRODUCT_IDS = {
  monthly: process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY || 'pdt_3c1A6P4Cpe8KhGYnJNiCN',
  yearly: process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY || 'pdt_SZ87OdK4dC9a9tpHTIUJZ',
};

export const plans: PricingPlan[] = [
  {
    id: PRODUCT_IDS.monthly,
    key: 'monthly',
    name: 'Monthly',
    subtitle: 'Full access, billed monthly',
    priceLabel: '$6.83 / month',
    features: [
      'Complete budget management',
      'Income and expense tracking',
      'Smart insights & reports',
      'Multi-currency support',
      'Email support',
    ],
  },
  {
    id: PRODUCT_IDS.yearly,
    key: 'yearly',
    name: 'Yearly',
    subtitle: 'Best value - save 58%',
    priceLabel: '$34.71 / year',
    features: [
      'Everything in Monthly',
      '7 months FREE',
      'Priority support',
      'Advanced analytics',
      'Early access to new features',
    ],
    popular: true,
  },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return plans.find((p) => p.id === id);
}