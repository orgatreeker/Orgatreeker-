-- Supabase Database Schema for Orgatreeker Finance Tracker
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income Sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Needs', 'Wants', 'Savings')),
  budgeted_amount DECIMAL(10, 2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT UNIQUE NOT NULL,
  currency_code TEXT DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  currency_name TEXT DEFAULT 'US Dollar',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  needs_percentage DECIMAL(5, 2),
  wants_percentage DECIMAL(5, 2),
  savings_percentage DECIMAL(5, 2),
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_sources_user ON income_sources(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_month_year ON income_sources(month, year);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user ON budget_categories(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_month_year ON budget_categories(month, year);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_month_year ON transactions(month, year);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(clerk_user_id);

-- Enable Row Level Security (RLS)
-- Note: With Clerk authentication, we use the service role key for backend operations
-- RLS provides an additional security layer, allowing all authenticated operations
-- The application code filters by clerk_user_id to ensure data isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations when using service role key
-- The application handles user-specific filtering via clerk_user_id
-- Drop existing policies first to allow re-running
DROP POLICY IF EXISTS "Enable all operations for service role" ON users;
DROP POLICY IF EXISTS "Enable all operations for service role" ON income_sources;
DROP POLICY IF EXISTS "Enable all operations for service role" ON budget_categories;
DROP POLICY IF EXISTS "Enable all operations for service role" ON transactions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON user_settings;

CREATE POLICY "Enable all operations for service role" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role" ON income_sources FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role" ON budget_categories FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role" ON transactions FOR ALL USING (true);
CREATE POLICY "Enable all operations for service role" ON user_settings FOR ALL USING (true);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (drop if exists first to allow re-running)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_sources_updated_at ON income_sources;
CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
