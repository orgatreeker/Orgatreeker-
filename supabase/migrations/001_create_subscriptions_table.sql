-- Create subscriptions table to store user subscription data
-- This ensures subscription status persists reliably even if Clerk metadata has delays

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,

  -- Subscription status
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'trialing', 'cancelled', 'failed', 'expired')),
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),

  -- Payment provider details
  subscription_id TEXT,
  product_id TEXT,
  payment_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Metadata from webhook events
  last_event_type TEXT,
  last_event_id TEXT UNIQUE,

  CONSTRAINT subscriptions_clerk_user_id_key UNIQUE (clerk_user_id)
);

-- Create index for faster lookups
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

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Service role can do everything
CREATE POLICY "Service role has full access"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');
