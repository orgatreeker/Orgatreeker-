-- QUICK FIX: Supabase RLS Policies for Development
-- Run this in Supabase SQL Editor to fix "failed to load data" errors
-- This creates permissive policies that allow all operations

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all operations for service role" ON users;
DROP POLICY IF EXISTS "Enable all operations for service role" ON income_sources;
DROP POLICY IF EXISTS "Enable all operations for service role" ON budget_categories;
DROP POLICY IF EXISTS "Enable all operations for service role" ON transactions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON user_settings;

-- Make sure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies for development
-- These allow all authenticated operations (bypasses RLS for service role and anon key)

-- Users table policies
CREATE POLICY "Allow all operations on users"
ON users
FOR ALL
USING (true)
WITH CHECK (true);

-- Income sources policies
CREATE POLICY "Allow all operations on income_sources"
ON income_sources
FOR ALL
USING (true)
WITH CHECK (true);

-- Budget categories policies
CREATE POLICY "Allow all operations on budget_categories"
ON budget_categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Transactions policies
CREATE POLICY "Allow all operations on transactions"
ON transactions
FOR ALL
USING (true)
WITH CHECK (true);

-- User settings policies
CREATE POLICY "Allow all operations on user_settings"
ON user_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
