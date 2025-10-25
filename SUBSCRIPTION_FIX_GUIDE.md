# 🔧 Subscription Not Working - Complete Fix Guide

## Problem
After subscribing, users are redirected back to the pricing page instead of accessing the dashboard. The subscription is not being saved to the database.

## Root Cause
The webhook from Dodo Payments is either:
1. Not receiving payment events
2. Not saving to the Supabase database
3. Missing environment variables in Vercel

---

## ✅ Step-by-Step Fix

### Step 1: Check Vercel Environment Variables

**CRITICAL**: Make sure ALL these variables are set in Vercel:

1. Go to: https://vercel.com → Your Project → Settings → Environment Variables

2. Verify these variables exist for **Production** environment:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=sbp_46129c069d09...
DODO_WEBHOOK_SECRET=whsec_ko62zyrTkt...
DODO_BEARER_TOKEN=0UnngA9-GRgdCdRJ...
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P4Cpe8KhGYnJNiCN
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK4dC9a9tpHTIUJZ
```

3. **IMPORTANT**: After adding/updating any variable, you MUST **Redeploy** the app:
   - Go to Deployments tab
   - Click latest deployment → ... → Redeploy

---

### Step 2: Verify Dodo Webhook Configuration

1. Go to: https://dodo.link/dashboard → Settings → Webhooks

2. Make sure webhook endpoint is set to:
   ```
   https://app.orgatreeker.com/api/webhooks/dodo
   ```

3. Make sure these events are enabled:
   - ✅ payment.succeeded
   - ✅ payment.failed
   - ✅ subscription.active
   - ✅ subscription.renewed
   - ✅ subscription.cancelled
   - ✅ subscription.expired

4. Test the webhook:
   - Click "Send Test Event"
   - Select "payment.succeeded"
   - Click Send
   - **Expected result**: Status 200 OK

---

### Step 3: Check Supabase RLS Policies

The subscriptions table needs proper Row Level Security (RLS) policies:

1. Go to: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/auth/policies

2. For the `subscriptions` table, you need these policies:

**Policy 1: Allow service role to insert/update**
```sql
-- This is for webhook writes (using service role key)
CREATE POLICY "Service role can manage subscriptions"
ON subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Policy 2: Allow users to read their own subscription**
```sql
-- This is for users reading their own subscription
CREATE POLICY "Users can read own subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (clerk_user_id = auth.jwt() ->> 'sub');
```

**To add these policies**:
- Go to Supabase → SQL Editor
- Run the SQL commands above
- Click "Run"

---

### Step 4: Test Subscription Flow Manually

Let's test if the webhook can save subscriptions:

1. **Test webhook locally first**:
   ```bash
   npm run dev
   ```

2. **Use this test script** (create test-webhook-manual.js):
   ```javascript
   const testWebhook = async () => {
     const payload = {
       type: 'payment.succeeded',
       event_id: 'test_' + Date.now(),
       data: {
         customer: {
           email: 'YOUR_TEST_EMAIL@gmail.com'  // ← Use your actual email
         },
         product_id: 'pdt_3c1A6P4Cpe8KhGYnJNiCN',
         payment_id: 'test_payment_123',
         subscription_id: 'test_sub_123'
       }
     };

     console.log('Sending test webhook...');
     const response = await fetch('http://localhost:3000/api/webhooks/dodo', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload)
     });

     console.log('Response:', response.status);
     console.log('Body:', await response.json());
   };

   testWebhook();
   ```

3. Run the test:
   ```bash
   node test-webhook-manual.js
   ```

4. Check if subscription was saved:
   - Go to Supabase → Table Editor → subscriptions
   - Look for your email

---

### Step 5: Manual Subscription Activation (Temporary Workaround)

If the webhook is still not working, you can manually activate a subscription:

1. Go to Supabase → SQL Editor

2. Run this query (replace with your Clerk user ID and email):
   ```sql
   INSERT INTO subscriptions (
     clerk_user_id,
     email,
     status,
     plan,
     subscription_id,
     product_id
   ) VALUES (
     'user_xxxxxxxxxxxxx',  -- ← Your Clerk user ID
     'your-email@gmail.com',  -- ← Your email
     'active',
     'monthly',
     'manual_activation',
     'pdt_3c1A6P4Cpe8KhGYnJNiCN'
   )
   ON CONFLICT (clerk_user_id)
   DO UPDATE SET
     status = 'active',
     plan = 'monthly',
     updated_at = now();
   ```

3. To find your Clerk user ID:
   - Go to https://dashboard.clerk.com → Users
   - Click on your user
   - Copy the User ID (starts with `user_`)

---

### Step 6: Check Webhook Logs

**In Vercel**:
1. Go to your project → Logs
2. Filter by: `/api/webhooks/dodo`
3. Look for errors like:
   - "Webhook signature verification failed"
   - "Error upserting subscription"
   - "Supabase client is null"

**In Dodo Dashboard**:
1. Go to Webhooks → Logs
2. Check recent webhook deliveries
3. Look for failed attempts or error responses

---

## 🧪 Testing Checklist

After making changes, verify:

- [ ] All environment variables are in Vercel (Production)
- [ ] App has been redeployed after env var changes
- [ ] Dodo webhook endpoint is correct: `https://app.orgatreeker.com/api/webhooks/dodo`
- [ ] Dodo webhook secret matches `DODO_WEBHOOK_SECRET` in Vercel
- [ ] Webhook test from Dodo returns 200 OK
- [ ] Supabase RLS policies allow service role to write to subscriptions table
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- [ ] Manual subscription insert works in Supabase
- [ ] After manual insert, you can access the dashboard

---

## 🎯 Expected Flow

When everything is working:

1. User clicks "Subscribe" on pricing page
2. User completes payment on Dodo checkout
3. Dodo sends webhook to your endpoint
4. Webhook verifies signature ✅
5. Webhook saves subscription to Supabase ✅
6. User redirected to `/success` page
7. Success page checks database → finds subscription ✅
8. User redirected to `/` (dashboard)
9. Middleware checks database → finds subscription ✅
10. User sees dashboard with full app access ✅

---

## ❌ Common Mistakes

1. **Forgetting to redeploy after changing env vars** - Changes only apply after redeploy!
2. **Wrong webhook secret** - Must match exactly between Dodo and Vercel
3. **Missing SUPABASE_SERVICE_ROLE_KEY** - Webhook can't write without it
4. **RLS blocking writes** - Need service role policy on subscriptions table
5. **Wrong webhook URL** - Must be production URL, not localhost

---

## 📞 Still Not Working?

If you've tried everything above:

1. **Enable debug logging**: The webhook already has extensive logging
2. **Check Vercel Function Logs**: Real-time logs show exactly what's happening
3. **Test webhook manually**: Use the test script above to isolate the issue
4. **Use manual activation**: Temporarily activate subscription while debugging
5. **Contact Dodo Support**: They can see webhook delivery attempts on their end

---

## 🚀 Quick Fix Summary

Most common issue: **Environment variables not in Vercel**

Quick fix:
1. Copy ALL variables from `.env.local` to Vercel (Production)
2. Redeploy the app
3. Test webhook from Dodo dashboard
4. If still not working, manually activate subscription (see Step 5)

---

## 📝 Notes

- The app checks database FIRST, then Clerk metadata as fallback
- Middleware protects routes and redirects non-subscribers to `/pricing`
- `/success` page verifies subscription before redirecting to dashboard
- Webhook uses `supabaseAdmin` (service role) to bypass RLS
