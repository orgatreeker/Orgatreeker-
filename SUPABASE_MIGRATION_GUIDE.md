# Supabase Database Migration Guide

## Important: Run This SQL Update

Since you already have a Supabase project set up, you need to add the budget preference fields to your existing `user_settings` table.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mxjbsxnmrlptfqgtbbmb`
3. Click on **SQL Editor** in the left sidebar
4. Click **"New query"**

### Step 2: Run This Migration SQL

Copy and paste the following SQL into the editor and click **Run**:

```sql
-- Add budget preference columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS needs_percentage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS wants_percentage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS savings_percentage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_settings';
```

### Step 3: Verify Success

You should see a success message and a list of all columns in the `user_settings` table, including the new budget preference columns:
- `needs_percentage`
- `wants_percentage`
- `savings_percentage`
- `applied_at`

---

## What This Migration Does

This migration adds support for storing user budget preferences (the 50/30/20 rule percentages or custom percentages) directly in the database. This allows:

1. ✅ Budget preferences to persist across sessions
2. ✅ The budget assistant to save recommendations
3. ✅ Users to customize their budget split
4. ✅ Tracking when preferences were last applied

---

## If You Need to Create Fresh Tables

If you're setting up from scratch or want to recreate all tables, use the `supabase-schema.sql` file instead. But if you already have data, just run the migration above to add the missing columns.

---

## Next Steps

After running this migration:
1. ✅ Restart your development server (`npm run dev`)
2. ✅ Test the Budget Assistant feature
3. ✅ Verify that budget preferences are saved correctly
4. ✅ Check that all data loads properly in the Dashboard

---

## Troubleshooting

**Error: "column already exists"**
- This is fine! It means the columns were already added. You can proceed.

**Error: "relation user_settings does not exist"**
- You need to run the full `supabase-schema.sql` first to create all tables.
- Go to SQL Editor and paste the entire content of `supabase-schema.sql`

**Data not loading after migration**
- Clear your browser cache and reload
- Check browser console for any errors
- Verify your `.env.local` has correct Supabase credentials
- Restart your dev server
