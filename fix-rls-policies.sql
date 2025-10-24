-- Quick fix for RLS policies to work with Clerk + Supabase anon key
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                       r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create simple policies that allow all operations
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON income_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON budget_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
