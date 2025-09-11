-- Remove Lemon Squeezy specific columns from subscriptions table
ALTER TABLE subscriptions 
DROP COLUMN IF EXISTS lemon_squeezy_id,
DROP COLUMN IF EXISTS order_id,
DROP COLUMN IF EXISTS subscription_item_id,
DROP COLUMN IF EXISTS variant_id,
DROP COLUMN IF EXISTS variant_name,
DROP COLUMN IF EXISTS renewals_paused,
DROP COLUMN IF EXISTS is_usage_based,
DROP COLUMN IF EXISTS trial_ends_at,
DROP COLUMN IF EXISTS price;

-- Add PhonePe specific columns
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS phonepe_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS phonepe_merchant_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Update profiles table to use simple subscription tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
