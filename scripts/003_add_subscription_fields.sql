-- Add subscription tracking fields to profiles table for Lemon Squeezy integration

-- Add subscription status and plan information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_lemon_squeezy_customer ON profiles(lemon_squeezy_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- Add constraint to ensure valid subscription statuses
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_subscription_status 
CHECK (subscription_status IN ('free', 'active', 'cancelled', 'expired', 'past_due', 'unpaid'));

-- Add constraint to ensure valid subscription plans  
ALTER TABLE profiles
ADD CONSTRAINT IF NOT EXISTS check_subscription_plan
CHECK (subscription_plan IN ('free', 'monthly', 'annual'));

-- Update existing users to have default free status
UPDATE profiles 
SET subscription_status = 'free', subscription_plan = 'free' 
WHERE subscription_status IS NULL OR subscription_plan IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.subscription_status IS 'Current subscription status from Lemon Squeezy';
COMMENT ON COLUMN profiles.subscription_plan IS 'Current subscription plan type (free, monthly, annual)';
COMMENT ON COLUMN profiles.lemon_squeezy_customer_id IS 'Customer ID from Lemon Squeezy';
COMMENT ON COLUMN profiles.lemon_squeezy_subscription_id IS 'Subscription ID from Lemon Squeezy';
