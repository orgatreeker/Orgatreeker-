/**
 * BillingSDK Config - Plans definition used by the PricingTable component.
 * Read NEXT_PUBLIC_* values at build-time for client usage.
 */

export type PricingPlan = {
  id: string; // product_id from Dodo
  key: 'monthly' | 'yearly' | 'custom';
  name: string;
  subtitle: string;
  priceLabel: string;
  originalPrice?: string; // For showing discount
  trial?: string; // Free trial period
  savings?: string; // Highlight savings
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  badge?: string;
  ctaText?: string;
  ctaVariant?: 'default' | 'outline' | 'secondary';
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
    subtitle: 'Perfect to get started',
    priceLabel: '$8/month',
    trial: '7-day free trial',
    features: [
      'Unlimited income & expense tracking',
      'Complete budget management',
      'Smart insights & analytics',
      'Multi-currency support',
      'Email support',
      'Mobile-friendly dashboard',
    ],
    ctaText: 'Start 7-Day Free Trial',
    ctaVariant: 'outline',
  },
  {
    id: PRODUCT_IDS.yearly,
    key: 'yearly',
    name: 'Yearly',
    subtitle: 'Most Popular Choice',
    priceLabel: '$49/year',
    originalPrice: '$96/year',
    trial: '14-day free trial',
    savings: 'Save $47/year',
    badge: 'BEST VALUE',
    features: [
      'Everything in Monthly plan',
      '14-day free trial (2x longer)',
      'Save 49% compared to monthly',
      'Priority email support',
      'Advanced analytics & reports',
      'Early access to new features',
      'Lifetime updates included',
    ],
    popular: true,
    recommended: true,
    ctaText: 'Start 14-Day Free Trial',
    ctaVariant: 'default',
  },
  {
    id: 'custom',
    key: 'custom',
    name: 'Enterprise',
    subtitle: 'For teams & businesses',
    priceLabel: '$299/year',
    badge: 'CUSTOM',
    features: [
      'Everything in Yearly plan',
      'Dedicated account manager',
      'Custom integrations & API access',
      'Team collaboration features',
      'Advanced security & compliance',
      'Custom training & onboarding',
      'SLA & priority support',
    ],
    ctaText: 'Contact Us',
    ctaVariant: 'secondary',
  },
];

export function getPlanById(id: string): PricingPlan | undefined {
  return plans.find((p) => p.id === id);
}