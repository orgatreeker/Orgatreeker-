# 🚀 Complete Setup Checklist - Orgatreeker Finance Tracker

Follow this checklist to get your app fully working. Complete each step in order.

---

## ✅ Step 1: Verify Environment Variables

**File**: `.env.local`

Make sure you have these variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sbp_46129c069d0946a4c28b8f150da341d5f4536c0f
```

**Action**: ✅ Verify all values are present and correct

---

## ✅ Step 2: Set Up Supabase Database

### Option A: First Time Setup (No Tables Yet)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select project: `mxjbsxnmrlptfqgtbbmb`

2. **Run Full Schema**
   - Click **SQL Editor** → **New query**
   - Open `supabase-schema.sql` in your project
   - Copy ALL the SQL
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Wait for Success**
   - Should see: "Success. No rows returned"
   - This creates all tables, indexes, and policies

### Option B: Tables Exist, Need to Update

If you already ran the schema before:

1. **Add Missing Columns** (for budget preferences)
   - Open Supabase SQL Editor
   - Run this SQL:
   ```sql
   ALTER TABLE user_settings 
   ADD COLUMN IF NOT EXISTS needs_percentage DECIMAL(5, 2),
   ADD COLUMN IF NOT EXISTS wants_percentage DECIMAL(5, 2),
   ADD COLUMN IF NOT EXISTS savings_percentage DECIMAL(5, 2),
   ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE;
   ```

2. **Fix RLS Policies**
   - Still in SQL Editor
   - Open `fix-supabase-rls.sql` in your project
   - Copy ALL the SQL
   - Paste and Run

**Action**: ✅ Choose Option A or B and complete it

---

## ✅ Step 3: Fix RLS Policies (Critical!)

Even if you ran the schema, you need to fix the RLS policies to allow data access.

1. **Open**: `fix-supabase-rls.sql` in your project
2. **Copy**: All SQL from the file
3. **Go to**: Supabase Dashboard → SQL Editor
4. **Paste**: The SQL
5. **Run**: Click Run or press Ctrl/Cmd + Enter
6. **Verify**: Should see "Success. No rows returned"

**Why**: The default policies are too restrictive. This fixes them.

**Action**: ✅ Run the RLS fix SQL

---

## ✅ Step 4: Restart Development Server

After any `.env.local` or database changes:

```bash
npm run dev
```

**Or if already running**:
1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`

**Action**: ✅ Restart your dev server

---

## ✅ Step 5: Test Authentication

1. **Open**: http://localhost:3000

2. **Sign Up**:
   - Click "Sign Up"
   - Enter email and password
   - Verify email (check inbox)
   - Should redirect to home page

3. **Sign In**:
   - If already have account, click "Sign In"
   - Enter credentials
   - Should redirect to home page

4. **Verify**:
   - Should see your user avatar (top right)
   - Should see Dashboard, Income, Budget, etc. tabs

**Action**: ✅ Sign in successfully

---

## ✅ Step 6: Test Income Page

1. **Click**: "Income" tab in navigation

2. **Add Income**:
   - Click "Add Income Source"
   - Fill in:
     - Name: "Test Salary"
     - Category: "Salary"
     - Amount: "5000"
   - Click "Add Income Source"

3. **Verify**:
   - Should see income in table
   - No error messages
   - Can edit and delete

4. **Refresh Page**:
   - Data should still be there
   - Loaded from Supabase

**Action**: ✅ Add test income successfully

---

## ✅ Step 7: Test Budget Page

1. **Click**: "Budget" tab

2. **Add Category**:
   - Click "Add Category"
   - Fill in:
     - Name: "Groceries"
     - Type: "Needs"
     - Budget: "500"
   - Click "Add Category"

3. **Add Transaction**:
   - Click transaction icon for the category
   - Fill in transaction details
   - Click "Add Transaction"

4. **Verify**:
   - Category appears in table
   - Transaction recorded
   - Budget calculations working

**Action**: ✅ Add test budget category and transaction

---

## ✅ Step 8: Test Dashboard

1. **Click**: "Dashboard" tab

2. **Verify**:
   - Income total shows correctly
   - Budget categories display
   - Charts render with data
   - No error messages

**Action**: ✅ Dashboard loads with all data

---

## ✅ Step 9: Test Transactions Page

1. **Click**: "Transactions" tab

2. **Add Transaction**:
   - Fill in form with transaction details
   - Click "Add Transaction"

3. **Verify**:
   - Transaction appears in list
   - Can edit and delete transactions
   - Total amount calculates correctly

**Action**: ✅ Transactions working

---

## ✅ Step 10: Test Settings Page

1. **Click**: "Settings" tab

2. **Change Currency**:
   - Select different currency from dropdown
   - Verify amounts update throughout app

3. **Toggle Theme**:
   - Switch between light and dark mode
   - Verify theme applies correctly

**Action**: ✅ Settings working

---

## 🐛 Troubleshooting Common Issues

### Issue: "Failed to load data"

**Solution**:
1. Check browser console for errors (F12)
2. Run `fix-supabase-rls.sql` in Supabase SQL Editor
3. Verify `.env.local` has correct credentials
4. Restart dev server

**Docs**: See `INCOME_ERROR_FIX.md` for detailed fix

---

### Issue: 404 on /sign-in or /sign-up

**Solution**:
- Already fixed! ✅
- Routes now exist in `app/sign-in/` and `app/sign-up/`

**Docs**: See `AUTH_FIX_COMPLETE.md` for details

---

### Issue: Supabase connection errors

**Solution**:
1. Verify Supabase URL and keys in `.env.local`
2. Check project is active in Supabase Dashboard
3. Run full schema SQL if tables missing
4. Check Supabase Dashboard → Logs for errors

**Docs**: See `SUPABASE_FIXES_COMPLETE.md` for setup guide

---

### Issue: Data not persisting

**Solution**:
1. Make sure you ran the schema SQL
2. Check tables exist in Supabase Table Editor
3. Run RLS fix SQL
4. Verify user is signed in (check Clerk)

---

### Issue: Build errors

**Solution**:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## 📚 Documentation Files

All documentation files in your project:

| File | Purpose |
|------|---------|
| `SETUP_CHECKLIST.md` | **This file** - Complete setup guide |
| `SUPABASE_FIXES_COMPLETE.md` | Supabase integration details |
| `SUPABASE_MIGRATION_GUIDE.md` | Database migration steps |
| `AUTH_FIX_COMPLETE.md` | Authentication setup and fixes |
| `INCOME_ERROR_FIX.md` | Fix for "failed to load data" error |
| `supabase-schema.sql` | Full database schema |
| `fix-supabase-rls.sql` | RLS policy fix script |

---

## 🎯 Quick Start Commands

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## ✨ You're All Set!

Once you complete all steps in this checklist, your app will be fully functional with:

- ✅ Authentication (Clerk)
- ✅ Database (Supabase)
- ✅ Income tracking
- ✅ Budget management
- ✅ Transaction logging
- ✅ Dashboard analytics
- ✅ Settings & preferences

**Happy budgeting! 🚀**

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Review error messages** carefully
4. **Verify each step** was completed
5. **Restart everything** (server, browser, etc.)

If you see specific error messages, note them down and refer to the troubleshooting sections in the documentation files above.
