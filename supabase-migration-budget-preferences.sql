-- Migration: Add budget preference columns to user_settings table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/sql

-- Add budget percentage columns to user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS needs_percentage INTEGER,
ADD COLUMN IF NOT EXISTS wants_percentage INTEGER,
ADD COLUMN IF NOT EXISTS savings_percentage INTEGER,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure percentages are valid (0-100)
ALTER TABLE user_settings 
ADD CONSTRAINT check_needs_percentage CHECK (needs_percentage IS NULL OR (needs_percentage >= 0 AND needs_percentage <= 100)),
ADD CONSTRAINT check_wants_percentage CHECK (wants_percentage IS NULL OR (wants_percentage >= 0 AND wants_percentage <= 100)),
ADD CONSTRAINT check_savings_percentage CHECK (savings_percentage IS NULL OR (savings_percentage >= 0 AND savings_percentage <= 100));

-- Add comment for documentation
COMMENT ON COLUMN user_settings.needs_percentage IS 'Percentage of income allocated to needs (essentials)';
COMMENT ON COLUMN user_settings.wants_percentage IS 'Percentage of income allocated to wants (lifestyle)';
COMMENT ON COLUMN user_settings.savings_percentage IS 'Percentage of income allocated to savings';
COMMENT ON COLUMN user_settings.applied_at IS 'Timestamp when budget preferences were last applied';
