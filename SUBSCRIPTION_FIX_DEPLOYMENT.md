# Subscription Fix Deployment Guide

## Problem Fixed
Users were being redirected to the pricing page even after successfully subscribing. This was caused by:
1. **Clerk Metadata Delays**: Subscriptions were only stored in Clerk's publicMetadata, which has cache propagation delays
2. **Race Conditions**: Multiple redirect checks (middleware + page-level) created timing issues
3. **No Persistent Storage**: If webhooks failed or were delayed, subscription status was lost

## Solution Implemented
**Database-First Subscription Persistence**
- Subscriptions are now saved to Supabase database (primary source of truth)
- Clerk metadata is still updated for backward compatibility
- Middleware checks database first, then falls back to Clerk
- Success page has improved retry logic (30s instead of 10s)

---

## Deployment Steps

### Step 1: Run Database Migration

You need to create the `subscriptions` table in your Supabase database.

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of: `supabase/migrations/001_create_subscriptions_table.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Verify success: You should see "Success. No rows returned"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref mxjbsxnmrlptfqgtbbmb

# Run the migration
supabase db push
```

#### Verify Migration

Run this query in SQL Editor to confirm the table was created:

```sql
SELECT * FROM subscriptions;
```

You should see an empty table with columns: id, clerk_user_id, email, status, plan, etc.

---

### Step 2: Deploy to Vercel

The code changes are already complete. Now deploy:

#### Option A: Git Push (Recommended if connected to GitHub)

```bash
git add .
git commit -m "fix: implement database-first subscription persistence to prevent redirect loop"
git push origin main
```

Vercel will automatically deploy.

#### Option B: Vercel CLI

```bash
vercel --prod
```

#### Option C: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your Orgatreeker project
3. Click **Deploy** → **Redeploy**

---

### Step 3: Verify Environment Variables

Ensure these environment variables are set in Vercel (Project Settings → Environment Variables):

**Required for Subscription Webhooks:**
- `DODO_BEARER_TOKEN` ✓ (already set)
- `DODO_WEBHOOK_SECRET` ✓ (already set)
- `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` ✓
- `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` ✓

**Required for Database:**
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

All these are already set according to `.env.production.example`.

---

### Step 4: Test Subscription Flow

#### Test with Real Payment (Production)

1. **Clear Cookies/Cache**: Use incognito mode or clear browser cache
2. **Sign Up**: Create a new test account
3. **Subscribe**: Go to /pricing and purchase a subscription
4. **Wait on Success Page**: Should see "Processing Your Payment..." with retry counter
5. **Verify Redirect**: After confirmation, should redirect to home (/)
6. **Check Database**: In Supabase SQL Editor, run:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   ```
   You should see the new subscription record.

#### Test Webhook Delivery

Check Vercel logs to see webhook processing:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → **Logs** tab
3. Look for webhook events with ✅ or ❌ emojis:
   - `✅ payment.succeeded`
   - `✅ subscription.active`
   - `✅ Updated subscription for user xxx in both Clerk and Database`

#### Test Protected Routes

1. As subscribed user, visit: `/dashboard`, `/budget`, `/income`
2. Should load without redirect
3. Sign out
4. Sign in as different user (no subscription)
5. Try to access `/dashboard` → Should redirect to `/pricing`

---

## How It Works Now

### Payment Flow (Updated)

```
1. User clicks "Subscribe" on /pricing
   ↓
2. Redirected to Dodo Payments checkout
   ↓
3. User completes payment
   ↓
4. Dodo sends webhook to /api/webhooks/dodo
   ↓
5. Webhook handler saves subscription to:
   - ✅ Supabase database (primary)
   - ✅ Clerk publicMetadata (fallback)
   ↓
6. User lands on /success page
   ↓
7. Success page polls /api/check-subscription every 1s (up to 30s)
   - Checks DATABASE first
   - Falls back to Clerk
   ↓
8. Once confirmed, redirect to /
   ↓
9. Middleware checks subscription:
   - DATABASE first (most reliable)
   - Clerk metadata (fallback)
   ↓
10. User accesses app ✅
```

### Protection Flow

```
User visits /dashboard
   ↓
Middleware intercepts request
   ↓
1. Check database: hasActiveSubscription(userId)
   ↓
   YES → Allow access ✅
   ↓
   NO → Check Clerk metadata
      ↓
      YES → Allow access ✅
      ↓
      NO → Redirect to /pricing ❌
```

---

## Files Changed

| File | Changes |
|------|---------|
| `lib/supabase/database.ts` | Added subscription CRUD operations |
| `app/api/webhooks/dodo/route.ts` | Save to database + Clerk |
| `app/api/check-subscription/route.ts` | New API to check DB subscription |
| `middleware.ts` | Check database first, Clerk fallback |
| `app/success/page.tsx` | Call DB API, 30s retry (was 10s) |
| `app/page.tsx` | Removed redundant check (middleware handles it) |
| `supabase/migrations/001_create_subscriptions_table.sql` | New subscription table |

---

## Monitoring & Debugging

### Check Subscription Status for a User

Run in Supabase SQL Editor:

```sql
-- Replace with actual email
SELECT * FROM subscriptions WHERE email = 'user@example.com';
```

### View Recent Subscriptions

```sql
SELECT
  email,
  status,
  plan,
  created_at,
  last_event_type
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### Check Webhook Logs

In Vercel:
1. Dashboard → Project → Logs
2. Filter by `/api/webhooks/dodo`
3. Look for:
   - ✅ Success indicators
   - ❌ Error indicators
   - Event types (payment.succeeded, subscription.active, etc.)

### If Subscription Still Not Working

1. **Check webhook secret**: Ensure `DODO_WEBHOOK_SECRET` matches Dodo dashboard
2. **Check webhook URL**: In Dodo dashboard, webhook URL should be:
   ```
   https://app.orgatreeker.com/api/webhooks/dodo
   ```
3. **Check database**: Verify subscription record exists:
   ```sql
   SELECT * FROM subscriptions WHERE clerk_user_id = 'user_xxx';
   ```
4. **Check Clerk**: Verify publicMetadata has subscription:
   - Go to Clerk Dashboard → Users
   - Click user → Public Metadata tab
5. **Clear Clerk cache**: In success page, user?.reload() forces cache refresh

---

## Rollback Plan

If something goes wrong, you can rollback:

1. **Revert code**:
   ```bash
   git revert HEAD
   git push
   ```

2. **Remove database table** (optional):
   ```sql
   DROP TABLE IF EXISTS subscriptions;
   ```

3. The app will fall back to using only Clerk metadata (original behavior)

---

## Support

If issues persist:
1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Check Dodo Payments webhook delivery logs
4. Verify all environment variables are set correctly

---

## Summary

✅ Subscriptions now persist in database (reliable)
✅ Webhook saves to both DB and Clerk
✅ Middleware checks DB first (eliminates cache delays)
✅ Success page has 30s retry (was 10s)
✅ Better logging with ✅/❌ emojis
✅ Backward compatible with Clerk metadata

**Result**: Users will no longer be redirected to pricing after subscribing!
