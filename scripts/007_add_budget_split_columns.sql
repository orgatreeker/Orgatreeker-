-- Add budget split percentage columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS budget_needs_percentage INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS budget_wants_percentage INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS budget_savings_percentage INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add check constraint to ensure percentages add up to 100
ALTER TABLE profiles 
ADD CONSTRAINT budget_percentages_sum_check 
CHECK (
  (budget_needs_percentage + budget_wants_percentage + budget_savings_percentage) = 100
);

-- Update existing profiles to have default budget split if they don't have values
UPDATE profiles 
SET 
  budget_needs_percentage = 50,
  budget_wants_percentage = 30,
  budget_savings_percentage = 20,
  onboarding_completed = FALSE
WHERE 
  budget_needs_percentage IS NULL 
  OR budget_wants_percentage IS NULL 
  OR budget_savings_percentage IS NULL;
