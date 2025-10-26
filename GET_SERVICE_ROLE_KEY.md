# URGENT: Update Your Supabase Service Role Key

## Problem
Your current `SUPABASE_SERVICE_ROLE_KEY` format is **incorrect**:
```
sbp_46129c069d0946a4c28b8f150da341d5f4536c0f  ❌ WRONG FORMAT
```

Service role keys should be **JWT tokens** that look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14amJzeG5tcmxwdGZxZ3RiYm1iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDk3MjUxNSwiZXhwIjoyMDM2NTQ4NTE1fQ... ✓ CORRECT FORMAT
```

## How to Get the Correct Key

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: **mxjbsxnmrlptfqgtbbmb**
3. Go to **Settings** → **API**
4. Find **Project API keys** section
5. Copy the **`service_role` key** (NOT the anon key)
6. It should be a very long string starting with `eyJ...`

### Option 2: Direct Link
Visit: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/settings/api

## Update Your Environment Variables

### 1. Update `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Paste the FULL service_role key here
```

### 2. Update `.env.production`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Same key
```

### 3. Update Vercel Environment Variables:
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Find `SUPABASE_SERVICE_ROLE_KEY`
3. Update it with the new key
4. **Important**: Redeploy your app after updating

## Why This Matters
Without the correct service role key:
- ❌ Webhooks cannot write subscription data to Supabase
- ❌ Payment confirmations won't update user subscriptions
- ❌ Users will be stuck on the pricing page even after paying
- ❌ Middleware cannot check subscription status properly

## After Updating
1. Restart your development server: `npm run dev`
2. Test the payment flow:
   - Sign up → Go to pricing → Make a test payment
   - Webhook should now successfully write to database
   - User should be redirected to dashboard with active subscription

## Need Help?
If you're still having issues after updating the key, check:
1. The key starts with `eyJ` and is very long (500+ characters)
2. It's set in BOTH local and production environments
3. Your app has been redeployed after changing Vercel env vars
