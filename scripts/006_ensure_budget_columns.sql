-- Ensure budget split columns exist in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS budget_needs_percentage INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS budget_wants_percentage INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS budget_savings_percentage INTEGER DEFAULT 20;

-- Update any existing profiles that might have NULL values
UPDATE profiles 
SET 
  budget_needs_percentage = COALESCE(budget_needs_percentage, 50),
  budget_wants_percentage = COALESCE(budget_wants_percentage, 30),
  budget_savings_percentage = COALESCE(budget_savings_percentage, 20)
WHERE budget_needs_percentage IS NULL 
   OR budget_wants_percentage IS NULL 
   OR budget_savings_percentage IS NULL;
