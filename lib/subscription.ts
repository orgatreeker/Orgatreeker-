import 'server-only';
import { currentUser } from '@clerk/nextjs/server';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan?: 'basic' | 'pro' | 'enterprise';
  subscriptionId?: string;
  status?: string;
  expiresAt?: string;
}

/**
 * Check if the current user has an active subscription
 * Reads from Clerk publicMetadata where webhook stores subscription info
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const user = await currentUser();

    if (!user) {
      return { isSubscribed: false };
    }

    // Check Clerk publicMetadata for subscription info
    const metadata = user.publicMetadata as any;
    const subscription = metadata?.subscription;

    if (!subscription) {
      return { isSubscribed: false };
    }

    // Check if subscription is active
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    // Check if subscription has expired
    if (subscription.expiresAt) {
      const expiresAt = new Date(subscription.expiresAt);
      const now = new Date();
      if (now > expiresAt) {
        return { isSubscribed: false };
      }
    }

    return {
      isSubscribed: isActive,
      plan: subscription.plan,
      subscriptionId: subscription.subscriptionId,
      status: subscription.status,
      expiresAt: subscription.expiresAt,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isSubscribed: false };
  }
}

/**
 * Check if user has access to premium features
 */
export async function hasAccessToApp(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status.isSubscribed;
}
