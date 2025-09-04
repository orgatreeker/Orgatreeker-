-- Add budget split percentage fields to profiles table if they don't exist
DO $$ 
BEGIN
    -- Check if budget_needs_percentage column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'budget_needs_percentage') THEN
        ALTER TABLE public.profiles ADD COLUMN budget_needs_percentage INTEGER DEFAULT 50;
    END IF;
    
    -- Check if budget_wants_percentage column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'budget_wants_percentage') THEN
        ALTER TABLE public.profiles ADD COLUMN budget_wants_percentage INTEGER DEFAULT 30;
    END IF;
    
    -- Check if budget_savings_percentage column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'budget_savings_percentage') THEN
        ALTER TABLE public.profiles ADD COLUMN budget_savings_percentage INTEGER DEFAULT 20;
    END IF;
    
    -- Check if onboarding_completed column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for better query performance on budget preferences
CREATE INDEX IF NOT EXISTS idx_profiles_budget_preferences 
ON public.profiles(budget_needs_percentage, budget_wants_percentage, budget_savings_percentage);
