# How to Check if Subscription Data is Saving in Supabase

## Quick Check (3 ways)

### Method 1: Use the Built-in Test Page (Easiest)

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Visit the check page**:
   ```
   http://localhost:3000/check-subscriptions
   ```

3. **Sign in** if needed

4. **See the result**:
   - ✅ Green checkmarks = Table exists and working
   - ❌ Red X = Table doesn't exist (need to run migration)
   - Shows count of subscriptions and recent records

---

### Method 2: Check Supabase Dashboard Directly

1. **Go to Supabase Dashboard**:
   https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/editor

2. **Look for `subscriptions` table** in the left sidebar

3. **If you see it**:
   - Click on it to view data
   - Check if any rows exist
   - ✅ Table is working!

4. **If you DON'T see it**:
   - ❌ Table doesn't exist yet
   - You need to run the migration (see below)

---

### Method 3: Run SQL Query

1. **Go to SQL Editor**:
   https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql

2. **Run this query**:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;
   ```

3. **Results**:
   - **Success**: You see a table with columns (even if empty) = ✅ Table exists
   - **Error "relation does not exist"**: ❌ Table not created yet

---

## If Table Doesn't Exist - Create It

### Step 1: Open SQL Editor
https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql

### Step 2: Click "New Query"

### Step 3: Copy & Paste this SQL

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

### Step 4: Click "Run" or press Ctrl+Enter

### Step 5: Verify
You should see: **"Success. No rows returned"**

---

## Test That Subscriptions Are Saving

### Option A: Make a Test Subscription

1. Deploy your app to production (or use dev server)
2. Create a test account
3. Subscribe with real/test payment
4. Go to Supabase → subscriptions table
5. Check if a new row appears

### Option B: Manual Test Insert

Run this in SQL Editor:

```sql
-- Insert test subscription
INSERT INTO subscriptions (clerk_user_id, email, status, plan)
VALUES ('test_user_123', 'test@example.com', 'active', 'monthly');

-- Check if it was inserted
SELECT * FROM subscriptions WHERE clerk_user_id = 'test_user_123';

-- Clean up test data
DELETE FROM subscriptions WHERE clerk_user_id = 'test_user_123';
```

If all 3 queries succeed, your table is working! ✅

---

## Verify Webhook is Saving Data

After a user subscribes, check the webhook logs:

### In Vercel (Production):

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Logs** tab
4. Filter by `/api/webhooks/dodo`
5. Look for:
   ```
   ✅ Updated subscription for user xxx in both Clerk and Database
   ```

### Then Check Database:

Run in SQL Editor:
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

You should see the new subscription!

---

## Common Issues

### Issue: Table doesn't exist
**Solution**: Run the migration SQL above

### Issue: "permission denied for table subscriptions"
**Solution**: Check RLS policies are set up (they're in the migration SQL)

### Issue: Webhook not saving data
**Checklist**:
- [ ] SUPABASE_SERVICE_ROLE_KEY is set in environment variables
- [ ] Webhook secret (DODO_WEBHOOK_SECRET) is correct
- [ ] Webhook URL in Dodo dashboard is correct: `https://app.orgatreeker.com/api/webhooks/dodo`
- [ ] Check Vercel logs for errors

### Issue: Data in Clerk but not Supabase
**Cause**: Webhook is updating Clerk but failing to save to DB
**Solution**:
1. Check Vercel logs for database errors
2. Verify SUPABASE_SERVICE_ROLE_KEY is set
3. Re-deploy if needed

---

## Quick Status Check Commands

### Check table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'subscriptions'
);
```

### Count subscriptions:
```sql
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
```

### Count active subscriptions:
```sql
SELECT COUNT(*) as active_subscriptions
FROM subscriptions
WHERE status = 'active';
```

### See all subscription statuses:
```sql
SELECT status, COUNT(*)
FROM subscriptions
GROUP BY status;
```

---

## Summary

✅ **Table exists**: Run migration SQL in Supabase
✅ **Webhooks work**: Check Vercel logs for "✅ Updated subscription"
✅ **Data persists**: Query subscriptions table in Supabase
✅ **Test page**: Visit `/check-subscriptions` in your app

**Need more help?** See [SUBSCRIPTION_FIX_DEPLOYMENT.md](SUBSCRIPTION_FIX_DEPLOYMENT.md)
