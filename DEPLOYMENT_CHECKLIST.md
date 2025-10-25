# 🚀 Deployment Checklist - Fix Subscription Redirect Issue

Follow these steps in order to deploy the subscription fix.

---

## ✅ Pre-Deployment Checklist

### 1. Verify Environment Variables (Vercel)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Ensure these are set for **Production**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://mxjbsxnmrlptfqgtbbmb.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `sbp_46129c069d0946a4c28b8f150da341d5f4536c0f`
- [ ] `DODO_BEARER_TOKEN` = `0UnngA9-GRgdCdRJ...`
- [ ] `DODO_WEBHOOK_SECRET` = `whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk`
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` = `pdt_3c1A6P4Cpe8KhGYnJNiCN`
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` = `pdt_SZ87OdK4dC9a9tpHTIUJZ`

**⚠️ If you changed any variables**, you must redeploy after setting them.

---

## 📋 Step-by-Step Deployment

### Step 1: Create Subscriptions Table in Supabase

**Time: 2 minutes**

1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql

2. Click **"New Query"**

3. Copy and paste this entire SQL script:

```sql
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'trialing', 'cancelled', 'failed', 'expired')),
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  subscription_id TEXT,
  product_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_event_type TEXT,
  last_event_id TEXT UNIQUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_clerk_user_id_idx ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON subscriptions(email);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Service role has full access
CREATE POLICY "Service role has full access"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');
```

4. Click **"Run"** (or press Ctrl+Enter)

5. You should see: **"Success. No rows returned"**

✅ **Verify it worked:**
```sql
SELECT * FROM subscriptions;
```
Should return empty table (no error).

---

### Step 2: Deploy Code to Production

**Time: 5 minutes**

#### Option A: Git Push (Recommended)

```bash
# Make sure all files are added
git add .

# Commit the changes
git commit -m "fix: implement database-first subscription persistence to prevent pricing redirect loop

- Add subscriptions table migration
- Update webhook to save to database + Clerk
- Update middleware to check database first
- Improve success page retry logic (30s)
- Add subscription check API endpoint
- Remove redundant checks from home page"

# Push to main branch
git push origin main
```

Vercel will automatically deploy. Wait for deployment to complete (~2-3 minutes).

#### Option B: Vercel CLI

```bash
vercel --prod
```

#### Option C: Manual Redeploy

1. Go to: https://vercel.com/dashboard
2. Find your project
3. Click **"Redeploy"** on the latest deployment

---

### Step 3: Verify Webhook Configuration

**Time: 1 minute**

1. **Check Dodo Payments webhook URL**:
   - Should be: `https://app.orgatreeker.com/api/webhooks/dodo`

2. **Check webhook secret matches**:
   - Dodo secret = `whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk`
   - Vercel env var = `whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk`
   - Must be **exactly** the same

3. **Check Svix dashboard**:
   - Go to: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/
   - Look for recent webhook deliveries
   - If there are failed webhooks, click **Retry** after deployment

---

### Step 4: Test the Subscription Flow

**Time: 5 minutes**

#### Test Process

1. **Clear browser cache/cookies** or use incognito mode

2. **Sign up with a new test account**
   - Go to: https://app.orgatreeker.com/sign-up
   - Use a real email you can access

3. **Visit pricing page**
   - Should redirect to: https://app.orgatreeker.com/pricing

4. **Click "Subscribe"** and complete payment
   - Use real payment method or test card (if supported)

5. **After payment, watch the success page**
   - URL: https://app.orgatreeker.com/success
   - Should show: "Processing Your Payment..."
   - Retry counter will increment (0/30, 1/30, 2/30...)
   - When subscription confirmed: "Payment Successful!"
   - Auto-redirect to home page

6. **Verify you can access the app**
   - Should be at: https://app.orgatreeker.com/
   - Should see dashboard (NOT redirected to pricing)
   - Try accessing: /budget, /income, /transactions
   - All should work without redirect

#### What You Should See

**✅ Success flow:**
```
Subscribe → Payment Page → Success Page (confirms in ~5-10s) → Home Page ✅
```

**❌ Old broken flow:**
```
Subscribe → Payment Page → Success Page → Home → Pricing (redirect loop) ❌
```

---

### Step 5: Verify Data is Saving

**Time: 2 minutes**

#### Check Supabase Database

1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql

2. Run this query:
```sql
SELECT
  email,
  status,
  plan,
  created_at,
  last_event_type
FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

3. You should see your test subscription!

**Example output:**
```
email                  | status | plan    | created_at          | last_event_type
-----------------------|--------|---------|---------------------|------------------
test@example.com       | active | monthly | 2025-01-15 10:30:00 | payment.succeeded
```

#### Check Svix Webhook Dashboard

1. Go to: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/

2. Look for the most recent event

3. Should show:
   - **Status**: 200 OK
   - **Type**: `payment.succeeded` or `subscription.active`
   - **Timestamp**: Within last few minutes

4. Click the event to see response from your server:
```json
{
  "received": true
}
```

#### Check Vercel Logs

1. Go to: https://vercel.com/dashboard → Your Project → Logs

2. Filter by: `/api/webhooks/dodo`

3. Look for:
```
✅ payment.succeeded { eventId: 'evt_xxx', ... }
✅ Updated subscription for user user_xxx in both Clerk and Database
```

---

## 🔍 Post-Deployment Verification

### Run These Checks

- [ ] **Database table exists**
  ```sql
  SELECT COUNT(*) FROM subscriptions;
  ```

- [ ] **Test subscription was saved**
  ```sql
  SELECT * FROM subscriptions WHERE email = 'YOUR_TEST_EMAIL';
  ```

- [ ] **Webhook delivered successfully** (200 status in Svix)

- [ ] **User can access protected routes** (/dashboard, /budget, etc.)

- [ ] **User is NOT redirected to pricing after subscribing**

- [ ] **Vercel logs show no errors**

---

## ⚠️ Troubleshooting

### Issue: Table doesn't exist error

**Symptom**: Error in logs: `relation "subscriptions" does not exist`

**Solution**: Go back to Step 1 and run the migration SQL

---

### Issue: Webhook returns 500 error

**Check Svix dashboard** for error message

**Common causes:**
- Missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- Table doesn't exist
- Deployment hasn't finished

**Solution:**
1. Verify all environment variables
2. Wait for deployment to complete
3. Retry webhook in Svix dashboard

---

### Issue: User still redirected to pricing

**Possible causes:**

1. **Webhook not delivered yet**
   - Check Svix dashboard
   - Look for the event
   - Retry if failed

2. **Database not updated**
   - Check Supabase for subscription record
   - Check Vercel logs for errors

3. **Old deployment still active**
   - Verify deployment finished
   - Check deployment URL matches production URL
   - Hard refresh browser (Ctrl+F5)

**Solution:**
```sql
-- Manually check if subscription exists
SELECT * FROM subscriptions WHERE email = 'YOUR_EMAIL';

-- If not, the webhook didn't save it
-- Check Vercel logs for errors
```

---

### Issue: Webhook never fired

**Check:**
1. Did payment actually complete?
2. Is webhook URL correct in Dodo dashboard?
3. Is site accessible at webhook URL?

**Test webhook endpoint:**
```bash
# Should return "Method not allowed" (this is normal)
curl -X GET https://app.orgatreeker.com/api/webhooks/dodo
```

---

## 📊 Success Metrics

After deployment, you should have:

✅ `subscriptions` table in Supabase with rows
✅ Webhooks showing 200 status in Svix
✅ Users can subscribe and access app without redirect
✅ Subscription data in both Clerk and Supabase
✅ No errors in Vercel logs

---

## 🎉 You're Done!

If all checks pass, your subscription system is now working with database persistence!

### What Changed

**Before:**
- Subscriptions only in Clerk (slow, unreliable)
- Users redirected to pricing after subscribing
- 10-second timeout

**After:**
- Subscriptions in Supabase database (fast, reliable)
- Users access app immediately after subscribing
- 30-second retry timeout
- Better logging and monitoring

---

## 📚 Reference Documents

- [QUICK_START.md](QUICK_START.md) - Quick 3-step guide
- [CHECK_SUPABASE.md](CHECK_SUPABASE.md) - How to verify database
- [WEBHOOK_TESTING.md](WEBHOOK_TESTING.md) - Webhook testing guide
- [SUBSCRIPTION_FIX_DEPLOYMENT.md](SUBSCRIPTION_FIX_DEPLOYMENT.md) - Full technical details

---

## 🆘 Need Help?

If something isn't working:

1. Check Svix webhook dashboard for delivery status
2. Check Vercel logs for error messages
3. Check Supabase for subscription records
4. Verify all environment variables are set
5. Try the `/check-subscriptions` page on your site

**Test Page:** https://app.orgatreeker.com/check-subscriptions
(Sign in to see table status and subscription data)
