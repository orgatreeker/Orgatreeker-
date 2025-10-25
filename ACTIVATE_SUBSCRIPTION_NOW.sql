-- ============================================
-- MANUAL SUBSCRIPTION ACTIVATION
-- ============================================
-- Use this to manually activate a subscription
-- Replace the email and user ID with YOUR account details
-- ============================================

-- STEP 1: Find your Clerk User ID
-- Go to: https://dashboard.clerk.com/apps/app_xxxx/users
-- Click on your user
-- Copy the "User ID" (starts with "user_")

-- STEP 2: Run this SQL in Supabase
-- Replace 'YOUR_EMAIL@example.com' with your actual email
-- Replace 'user_xxxxxxxxxxxxx' with your actual Clerk User ID

INSERT INTO subscriptions (
  clerk_user_id,
  email,
  status,
  plan,
  subscription_id,
  product_id,
  created_at,
  updated_at
) VALUES (
  'user_xxxxxxxxxxxxx',  -- ← REPLACE THIS with your Clerk User ID
  'YOUR_EMAIL@example.com',  -- ← REPLACE THIS with your email
  'active',  -- ← Status is active
  'monthly',  -- ← Change to 'yearly' if you bought yearly plan
  'manual_activation',  -- Subscription ID
  'pdt_3c1A6P4Cpe8KhGYnJNiCN',  -- Product ID (monthly)
  NOW(),
  NOW()
)
ON CONFLICT (clerk_user_id)
DO UPDATE SET
  status = 'active',
  plan = 'monthly',
  updated_at = NOW();

-- After running this, refresh your app and you should have access!

-- ============================================
-- VERIFY IT WORKED
-- ============================================
-- Run this to check if subscription was added:
SELECT * FROM subscriptions WHERE email = 'YOUR_EMAIL@example.com';
