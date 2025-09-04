-- Add monthly tracking fields to existing tables

-- Add month and year fields to income_sources
ALTER TABLE income_sources 
ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add month and year fields to budget_categories  
ALTER TABLE budget_categories
ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add month and year fields to transactions
ALTER TABLE transactions
ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create indexes for better query performance on monthly data
CREATE INDEX idx_income_sources_user_month_year ON income_sources(user_id, year, month);
CREATE INDEX idx_budget_categories_user_month_year ON budget_categories(user_id, year, month);
CREATE INDEX idx_transactions_user_month_year ON transactions(user_id, year, month);
CREATE INDEX idx_transactions_category_month_year ON transactions(category_id, year, month);

-- Update RLS policies to include month/year filtering (optional - for additional security)
-- Users can only see their own data for any month/year
-- The existing RLS policies already handle user_id filtering, so no changes needed there
