# Quick Start: Fix Subscription Redirect Issue

## What's Fixed
Users can now subscribe and use the app immediately without being redirected back to pricing!

## 🎉 You Have Supabase MCP Connected!

You can use AI to interact with your database directly. See [MCP_SETUP_GUIDE.md](MCP_SETUP_GUIDE.md) for AI-powered setup.

**Quick MCP commands:**
- "Check if subscriptions table exists in my database"
- "Create the subscriptions table from the migration SQL"
- "Show me recent subscriptions"

## Deploy in 3 Steps

### 1️⃣ Create Database Table

**Option A: Ask AI (Easiest)**
```
"Create the subscriptions table using the SQL from supabase/migrations/001_create_subscriptions_table.sql"
```

**Option B: Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor and run this:

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

### 2️⃣ Deploy to Vercel

```bash
git add .
git commit -m "fix: implement database-first subscription persistence"
git push
```

### 3️⃣ Test It

1. Subscribe with test payment
2. Watch success page confirm subscription
3. Access dashboard without redirect!

---

## What Changed

**Before:**
- Subscriptions only in Clerk metadata (slow cache)
- Users redirected to pricing after subscribing
- 10-second timeout

**After:**
- Subscriptions saved to database (instant, reliable)
- Webhook saves to both DB + Clerk
- Middleware checks DB first
- 30-second retry timeout
- Better logging

---

## Need Help?

See [SUBSCRIPTION_FIX_DEPLOYMENT.md](SUBSCRIPTION_FIX_DEPLOYMENT.md) for detailed instructions.

## Verify It Worked

**With AI (Using MCP):**
```
"Show me the 5 most recent subscriptions"
"How many subscriptions are in the database?"
```

**Manual check in Supabase:**
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

**Check logs in Vercel for:**
- `✅ payment.succeeded`
- `✅ Updated subscription for user xxx in both Clerk and Database`

## MCP-Powered Debugging

See [MCP_SETUP_GUIDE.md](MCP_SETUP_GUIDE.md) for:
- Real-time subscription queries
- AI-powered database verification
- Natural language debugging commands
