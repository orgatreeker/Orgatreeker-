-- Adding comprehensive RLS policies for all tables to ensure proper security

-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

DROP POLICY IF EXISTS "income_sources_select_own" ON income_sources;
DROP POLICY IF EXISTS "income_sources_insert_own" ON income_sources;
DROP POLICY IF EXISTS "income_sources_update_own" ON income_sources;
DROP POLICY IF EXISTS "income_sources_delete_own" ON income_sources;

DROP POLICY IF EXISTS "budget_categories_select_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_insert_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_update_own" ON budget_categories;
DROP POLICY IF EXISTS "budget_categories_delete_own" ON budget_categories;

DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
DROP POLICY IF EXISTS "transactions_update_own" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_own" ON transactions;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Create comprehensive RLS policies for income_sources table
CREATE POLICY "income_sources_select_own" ON income_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "income_sources_insert_own" ON income_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "income_sources_update_own" ON income_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "income_sources_delete_own" ON income_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for budget_categories table
CREATE POLICY "budget_categories_select_own" ON budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budget_categories_insert_own" ON budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_categories_update_own" ON budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "budget_categories_delete_own" ON budget_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for transactions table
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
