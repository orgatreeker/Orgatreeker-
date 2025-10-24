-- Add budget percentage columns to user_settings table
-- This migration adds support for customizable budget percentages

-- Add the percentage columns if they don't exist
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS needs_percentage DECIMAL(5, 2) DEFAULT 50,
ADD COLUMN IF NOT EXISTS wants_percentage DECIMAL(5, 2) DEFAULT 30,
ADD COLUMN IF NOT EXISTS savings_percentage DECIMAL(5, 2) DEFAULT 20;

-- Update existing records to have default values
UPDATE user_settings
SET
  needs_percentage = COALESCE(needs_percentage, 50),
  wants_percentage = COALESCE(wants_percentage, 30),
  savings_percentage = COALESCE(savings_percentage, 20)
WHERE needs_percentage IS NULL
   OR wants_percentage IS NULL
   OR savings_percentage IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name IN ('needs_percentage', 'wants_percentage', 'savings_percentage');
