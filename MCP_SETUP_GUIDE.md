# Supabase MCP Setup Guide

## You Have Supabase MCP Connected! 🎉

According to your MCP configuration, you have direct access to your Supabase database:
- **Project**: `mxjbsxnmrlptfqgtbbmb`
- **MCP URL**: `https://mcp.supabase.com/mcp?project_ref=mxjbsxnmrlptfqgtbbmb`

This means you can interact with your database directly through AI assistants!

---

## Step 1: Check if Subscriptions Table Exists

### Using AI with MCP (Easiest Method)

Just ask your AI assistant:

```
"Can you check if the subscriptions table exists in my Supabase database?"
```

The AI can use MCP to query your database directly.

### Using Supabase Dashboard

1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/editor
2. Look for `subscriptions` in the table list (left sidebar)
3. If you see it → ✅ Table exists
4. If not → ❌ Need to create it

---

## Step 2: Create Subscriptions Table

### Method A: Ask AI to Create It

```
"Please create the subscriptions table in my Supabase database using the migration SQL from supabase/migrations/001_create_subscriptions_table.sql"
```

### Method B: Use SQL Editor

1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql

2. Run this SQL:

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
  last_event_id TEXT UNIQUE,
  CONSTRAINT subscriptions_clerk_user_id_key UNIQUE (clerk_user_id)
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

---

## Step 3: Verify Table Creation

### Ask AI:

```
"Show me the schema of the subscriptions table"
```

OR

```
"How many subscriptions are currently in the database?"
```

### Manual Check:

```sql
SELECT * FROM subscriptions LIMIT 5;
```

---

## Step 4: Check Subscription Data with MCP

### Real-Time Queries (Using AI)

You can now ask questions like:

**Check if table exists:**
```
"Does the subscriptions table exist?"
```

**View recent subscriptions:**
```
"Show me the last 5 subscriptions from the database"
```

**Count active subscriptions:**
```
"How many active subscriptions are there?"
```

**Find specific user subscription:**
```
"Show me the subscription for user with email test@example.com"
```

**Check subscription status:**
```
"What is the status of subscriptions created in the last 24 hours?"
```

---

## Step 5: Test Webhook Data Flow

After a user subscribes, you can verify with AI:

```
"Check if a new subscription was added to the database in the last 5 minutes"
```

OR manually:

```sql
SELECT * FROM subscriptions
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

---

## MCP-Powered Debugging

### During Development

**Check if webhook saved data:**
```
AI: "Show me the most recent subscription in the database"
```

**Verify subscription status:**
```
AI: "What subscriptions have status='active'?"
```

**Count subscriptions by plan:**
```
AI: "Group subscriptions by plan and show counts"
```

### After User Reports Issue

**Find user subscription:**
```
AI: "Find the subscription for email user@example.com and show all details"
```

**Check webhook events:**
```
AI: "Show subscriptions ordered by last_event_type"
```

---

## Benefits of MCP for Your Subscription System

✅ **Real-time verification**: Ask AI to check database instantly
✅ **No manual SQL**: AI can query for you
✅ **Faster debugging**: Check subscription status during development
✅ **Easy monitoring**: Ask questions in natural language

---

## Common MCP Queries for Subscriptions

### Setup & Verification

```
"Create the subscriptions table from the migration file"
"Check if subscriptions table exists"
"Show me the table schema for subscriptions"
```

### Data Inspection

```
"Show me all active subscriptions"
"Count subscriptions by status"
"Find the newest subscription"
"Show subscriptions created today"
```

### Debugging

```
"Are there any subscriptions for user@example.com?"
"What was the last webhook event type saved?"
"Show failed or expired subscriptions"
"List all subscriptions with monthly plan"
```

### Analytics

```
"How many total subscriptions do we have?"
"What's the breakdown of monthly vs yearly subscriptions?"
"Show subscription growth over the last 7 days"
```

---

## Integration with Your Code

The code I created earlier works perfectly with MCP:

### Webhook Handler
When Dodo sends a webhook, it:
1. ✅ Saves to Supabase (MCP can verify instantly)
2. ✅ Updates Clerk metadata
3. ✅ Logs success/failure

**Verify with MCP:**
```
"After I test a subscription, show me if it was saved to the database"
```

### Middleware
Checks database first:
1. ✅ Queries Supabase for active subscription
2. ✅ Falls back to Clerk if needed

**Test with MCP:**
```
"Check the subscription status for clerk_user_id = 'user_xxx'"
```

---

## Complete Setup Workflow with MCP

### Step-by-Step

1. **Ask AI to check table:**
   ```
   "Does the subscriptions table exist in my Supabase database?"
   ```

2. **If no, ask AI to create it:**
   ```
   "Create the subscriptions table using the SQL from supabase/migrations/001_create_subscriptions_table.sql"
   ```

3. **Verify creation:**
   ```
   "Show me the schema of the subscriptions table"
   ```

4. **Deploy your code:**
   ```bash
   git add .
   git commit -m "fix: implement database-first subscription persistence"
   git push
   ```

5. **Test subscription:**
   - Make a test payment
   - Wait 10 seconds

6. **Verify with AI:**
   ```
   "Show me subscriptions created in the last minute"
   ```

7. **Check specific user:**
   ```
   "Find subscription for email YOUR_TEST_EMAIL@example.com"
   ```

---

## Troubleshooting with MCP

### Issue: Subscription not saving

**Ask AI:**
```
"Are there any subscriptions in the database?"
"Show me the most recent subscription"
```

**If empty:**
- Check Vercel logs for webhook errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Retry webhook in Svix dashboard

### Issue: User redirected to pricing

**Ask AI:**
```
"Show me the subscription for user user@example.com"
"What is the status of subscription for clerk_user_id 'user_xxx'?"
```

**If subscription exists but user still redirected:**
- Check middleware is deployed
- Clear browser cache
- Verify subscription status is 'active'

---

## MCP Query Examples

### Check Table Exists
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'subscriptions'
);
```

**With AI:**
```
"Does the subscriptions table exist?"
```

---

### View All Subscriptions
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 10;
```

**With AI:**
```
"Show me the 10 most recent subscriptions"
```

---

### Count by Status
```sql
SELECT status, COUNT(*) as count
FROM subscriptions
GROUP BY status;
```

**With AI:**
```
"Show me a breakdown of subscriptions by status"
```

---

### Find Specific User
```sql
SELECT * FROM subscriptions
WHERE email = 'user@example.com';
```

**With AI:**
```
"Find subscription for user@example.com"
```

---

## Next Steps

1. ✅ **Verify table exists** (Ask AI or check Supabase dashboard)
2. ✅ **Create table if needed** (Ask AI or run SQL)
3. ✅ **Deploy code** (`git push`)
4. ✅ **Test subscription** (Make test payment)
5. ✅ **Verify with MCP** (Ask AI to check database)

---

## Summary

You have Supabase MCP connected, which means:

✅ Direct database access through AI
✅ Real-time subscription verification
✅ Natural language queries
✅ Faster debugging and monitoring

**All the code is ready - just need to:**
1. Create the subscriptions table (if not exists)
2. Deploy to production
3. Use MCP to verify subscriptions are saving

**MCP makes it easy to check everything is working!** 🚀
