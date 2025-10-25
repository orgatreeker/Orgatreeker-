# Dodo Payments Setup Checklist

Use this checklist to ensure your Dodo Payments integration is properly configured.

## ✅ Pre-Deployment Checklist

### 1. Dodo Dashboard Configuration

- [ ] **Account Setup**
  - Logged into Dodo Payments dashboard
  - Business/app information completed
  - Payment methods enabled

- [ ] **Products Created**
  - Monthly plan created
  - Product ID: `pdt_3c1A6P4Cpe8KhGYnJNiCN` ✓
  - Yearly plan created
  - Product ID: `pdt_SZ87OdK4dC9a9tpHTIUJZ` ✓

- [ ] **Webhook Configuration**
  - Navigate to: Settings → Webhooks
  - Endpoint URL: `https://app.orgatreeker.com/api/webhooks/dodo`
  - Status: Active/Enabled
  - Events enabled:
    - `payment.succeeded`
    - `payment.failed`
    - `subscription.active`
    - `subscription.renewed`
    - `subscription.cancelled`
    - `subscription.failed`
    - `subscription.expired`

- [ ] **API Keys**
  - Bearer token copied to `.env.production`
  - Webhook secret copied to `.env.production`
  - Keys match environment (test vs production)

### 2. Environment Variables (Vercel)

Verify all these are set in Vercel → Settings → Environment Variables:

- [ ] `DODO_BEARER_TOKEN` = Your Dodo API token
- [ ] `DODO_WEBHOOK_SECRET` = Starts with `whsec_`
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` = `pdt_3c1A6P4Cpe8KhGYnJNiCN`
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` = `pdt_SZ87OdK4dC9a9tpHTIUJZ`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = Your Clerk public key
- [ ] `CLERK_SECRET_KEY` = Your Clerk secret key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- [ ] `DEFAULT_RETURN_URL` = `https://app.orgatreeker.com/success`

**IMPORTANT**: After updating environment variables, redeploy your app!

### 3. Database Setup (Supabase)

- [ ] **Subscriptions Table Created**
  ```sql
  -- Run this in Supabase SQL Editor if not already done
  -- See: supabase/migrations/001_create_subscriptions_table.sql
  ```

- [ ] **Table Permissions**
  - RLS enabled on `subscriptions` table
  - Service role policy exists
  - Users can read their own subscription

- [ ] **Verify Table**
  ```sql
  -- Should show the subscriptions table structure
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'subscriptions';
  ```

### 4. Code Verification

- [ ] **Webhook Handler** (`app/api/webhooks/dodo/route.ts`)
  - Signature verification enabled
  - All event types handled
  - Database upsert called
  - Error handling present
  - Logging present for debugging

- [ ] **Middleware** (`middleware.ts`)
  - Checks database for subscriptions
  - Protected routes configured:
    - `/` (home/app)
    - `/dashboard`
    - `/budget`
    - `/income`
    - `/settings`
    - `/transactions`
  - Public routes allowed:
    - `/sign-in`
    - `/sign-up`
    - `/pricing`
    - `/api/webhooks`
  - Redirects to `/pricing` when no subscription

- [ ] **Database Functions** (`lib/supabase/database.ts`)
  - `upsertSubscription()` exists
  - `getSubscription()` exists
  - `hasActiveSubscription()` exists
  - Uses service role key for admin operations

### 5. Clerk Configuration

- [ ] **Sign-up Flow**
  - After sign-up redirects to `/pricing`
  - User can select a plan

- [ ] **User Metadata**
  - Public metadata allows subscription object
  - No metadata restrictions blocking updates

- [ ] **Email Matching**
  - Clerk account email matches payment email
  - Email verification enabled (optional but recommended)

## ✅ Post-Deployment Checklist

### 1. Test Webhook Delivery

- [ ] **Option A: Dodo Dashboard Test**
  - Go to Dodo Dashboard → Webhooks
  - Click "Test Webhook" or "Send Test Event"
  - Select `payment.succeeded` event
  - Response should be `200 OK`

- [ ] **Option B: Local Test Script**
  - Update `USER_EMAIL` in `test-webhook.js`
  - Run: `node test-webhook.js`
  - Check response is 200
  - Verify database entry created

- [ ] **Option C: Real Payment Test**
  - Make a test payment (if in test mode)
  - Or make a real payment and refund it
  - Check webhook was triggered

### 2. Verify Database

After webhook test:

```sql
-- Check subscription was created
SELECT * FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

Expected result:
- At least 1 row exists
- `status` = 'active'
- `email` matches your test user
- `clerk_user_id` is populated
- `subscription_id` or `payment_id` is populated

### 3. Test User Flow

- [ ] **Sign Up Flow**
  1. Create new account (or use test account)
  2. Should redirect to `/pricing`
  3. Cannot access `/` without subscription

- [ ] **Purchase Flow**
  1. Click "Subscribe" on pricing page
  2. Complete payment
  3. Should redirect to `/success`
  4. Webhook should trigger
  5. Database should update

- [ ] **Access Control**
  1. Try accessing `/`
  2. Should NOT redirect to `/pricing`
  3. Can access all app features
  4. Dashboard, budget, income work

- [ ] **Subscription Status**
  1. Settings page shows subscription status
  2. Plan type shows correctly (monthly/yearly)

### 4. Monitor Logs

- [ ] **Vercel Logs**
  - Go to Vercel → Project → Logs
  - Filter by `/api/webhooks/dodo`
  - Check for successful webhook processing
  - No 400/500 errors

- [ ] **Dodo Dashboard Logs**
  - Go to Dodo → Webhooks → Logs
  - All deliveries show 200 response
  - No failed deliveries
  - Response time < 5 seconds

- [ ] **Supabase Logs** (Optional)
  - Go to Supabase → Logs → Postgres Logs
  - Check for successful inserts/updates

### 5. Error Scenarios

Test these edge cases:

- [ ] **Wrong Email**
  - Payment with email not in Clerk
  - Should log warning but not crash
  - No subscription created

- [ ] **Duplicate Webhook**
  - Send same webhook twice
  - Should handle gracefully (upsert, not duplicate)

- [ ] **Invalid Signature**
  - Send webhook with wrong signature
  - Should reject with 400

- [ ] **Cancelled Subscription**
  - Test `subscription.cancelled` event
  - User should lose access
  - Status in DB should update to 'cancelled'

## 🐛 Troubleshooting Guide

### Webhook Returns 400

**Possible causes:**
- Missing Svix headers → Check Dodo is sending headers
- Invalid signature → Check webhook secret matches
- Malformed payload → Check Dodo payload format

### Webhook Returns 500

**Possible causes:**
- Database connection error → Check Supabase credentials
- Clerk API error → Check Clerk credentials
- Code error → Check Vercel logs for stack trace

### Webhook Returns 200 but No Database Entry

**Possible causes:**
- Email mismatch → Payment email ≠ Clerk email
- RLS blocking insert → Check service role key is set
- Code error in upsertSubscription → Check Vercel logs

### User Still Redirected to Pricing After Payment

**Possible causes:**
- Database not updating → Check webhook logs
- Middleware not checking DB → Check middleware code
- Cache issue → Try logging out and back in
- Wrong user → Check clerk_user_id matches

## 📞 Support Resources

- **Dodo Payments Docs**: https://docs.dodo.link
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🎯 Quick Start Command

To test everything quickly:

1. **Update email in test script**
   ```bash
   # Edit test-webhook.js, change USER_EMAIL
   ```

2. **Run test**
   ```bash
   node test-webhook.js
   ```

3. **Check database**
   ```sql
   SELECT * FROM subscriptions WHERE email = 'YOUR_EMAIL@example.com';
   ```

4. **Test app access**
   - Log in to app
   - Go to `/`
   - Should NOT redirect to pricing

## ✅ Success Criteria

Your integration is working correctly when:

1. ✅ Webhook returns 200 in Dodo dashboard
2. ✅ Subscription appears in Supabase database
3. ✅ User can access protected routes
4. ✅ No redirect to `/pricing` for subscribed users
5. ✅ Logs show successful processing
6. ✅ No errors in Vercel, Dodo, or Supabase logs
