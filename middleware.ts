import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  // NOTE: '/' (home) is NOT public - it contains the app and requires subscription!
]);

// Routes that need auth but NOT subscription (like pricing, test pages, success page)
const isAuthOnlyRoute = createRouteMatcher([
  '/pricing(.*)',
  '/success(.*)',
  '/activate-subscription(.*)',
  '/api/set-subscription(.*)',
  '/test-subscription(.*)',
  '/api/test-subscription(.*)',
]);

const isProtectedAppRoute = createRouteMatcher([
  '/',  // Home page contains the full app - requires subscription!
  '/dashboard(.*)',
  '/budget(.*)',
  '/income(.*)',
  '/settings(.*)',
  '/transactions(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Routes that need authentication but NOT subscription (pricing, test pages)
  if (isAuthOnlyRoute(request)) {
    if (!userId) {
      await auth.protect();
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  // Protected app routes require authentication AND subscription
  if (isProtectedAppRoute(request)) {
    if (!userId) {
      await auth.protect();
      return NextResponse.next();
    }

    // Check subscription status from Clerk metadata
    // NOTE: Webhook updates this metadata when user subscribes
    try {
      const user = await currentUser();
      const subscription = user?.publicMetadata?.subscription as any;
      const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing';

      if (!hasActiveSubscription) {
        // No active subscription - redirect to pricing page
        const pricingUrl = new URL('/pricing', request.url);
        return NextResponse.redirect(pricingUrl);
      }
    } catch (error) {
      console.error('Error checking subscription in middleware:', error);
      // On error, redirect to pricing to be safe
      const pricingUrl = new URL('/pricing', request.url);
      return NextResponse.redirect(pricingUrl);
    }

    return NextResponse.next();
  }

  // For all other routes, just require authentication
  if (!userId) {
    await auth.protect();
    return NextResponse.next();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
