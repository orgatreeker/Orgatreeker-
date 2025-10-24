-- Migration: Add budget percentage columns to user_settings table
-- This is a safe migration that can be run multiple times
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- Add budget percentage columns if they don't exist
DO $$
BEGIN
    -- Add needs_percentage column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'needs_percentage'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN needs_percentage INTEGER;
    END IF;

    -- Add wants_percentage column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'wants_percentage'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN wants_percentage INTEGER;
    END IF;

    -- Add savings_percentage column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'savings_percentage'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN savings_percentage INTEGER;
    END IF;

    -- Add applied_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_settings' AND column_name = 'applied_at'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN applied_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add constraints for valid percentage ranges (0-100)
DO $$
BEGIN
    -- Add check constraint for needs_percentage if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_needs_percentage'
    ) THEN
        ALTER TABLE user_settings
        ADD CONSTRAINT check_needs_percentage
        CHECK (needs_percentage IS NULL OR (needs_percentage >= 0 AND needs_percentage <= 100));
    END IF;

    -- Add check constraint for wants_percentage if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_wants_percentage'
    ) THEN
        ALTER TABLE user_settings
        ADD CONSTRAINT check_wants_percentage
        CHECK (wants_percentage IS NULL OR (wants_percentage >= 0 AND wants_percentage <= 100));
    END IF;

    -- Add check constraint for savings_percentage if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_savings_percentage'
    ) THEN
        ALTER TABLE user_settings
        ADD CONSTRAINT check_savings_percentage
        CHECK (savings_percentage IS NULL OR (savings_percentage >= 0 AND savings_percentage <= 100));
    END IF;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN user_settings.needs_percentage IS 'Percentage of income allocated to needs (essentials) - Value between 0-100';
COMMENT ON COLUMN user_settings.wants_percentage IS 'Percentage of income allocated to wants (lifestyle) - Value between 0-100';
COMMENT ON COLUMN user_settings.savings_percentage IS 'Percentage of income allocated to savings - Value between 0-100';
COMMENT ON COLUMN user_settings.applied_at IS 'Timestamp when budget preferences were last applied';

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name IN ('needs_percentage', 'wants_percentage', 'savings_percentage', 'applied_at')
ORDER BY column_name;
