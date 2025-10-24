# 🚀 Supabase Backend Setup Guide

This guide will help you set up Supabase as your backend database for real-time data persistence.

## ✅ Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `orgatreeker` (or any name you prefer)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

---

## 🔑 Step 2: Get Your API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. You'll see two keys:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGc...`)

**COPY THESE - YOU'LL NEED THEM!**

---

## 📝 Step 3: Add Credentials to .env.local

Open your `.env.local` file and ADD these lines at the bottom:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `https://your-project-id.supabase.co` with your **Project URL**
- `your-anon-key-here` with your **anon public key**

**IMPORTANT**: Keep your existing Clerk keys! Your `.env.local` should now have BOTH Clerk and Supabase credentials.

---

## 🗄️ Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (lightning icon in sidebar)
2. Click **"New query"**
3. Open the file `supabase-schema.sql` in your project folder
4. **COPY ALL THE SQL** from that file
5. **PASTE** it into the Supabase SQL editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see: ✅ **Success. No rows returned**

This creates:
- ✅ `users` table
- ✅ `income_sources` table
- ✅ `budget_categories` table
- ✅ `transactions` table
- ✅ `user_settings` table
- ✅ All security policies (RLS)
- ✅ Indexes for performance

---

## 🔒 Step 5: Configure Authentication (Important!)

Since you're using Clerk for authentication, we need to configure Supabase to work with Clerk:

### Option A: Simple Setup (Recommended)
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Disable email/password auth (we're using Clerk)
3. Our RLS policies use `clerk_user_id` instead of Supabase auth

### Option B: JWT Integration (Advanced)
If you want tighter integration:
1. Get your Clerk JWT template
2. Add it to Supabase Auth settings
3. Configure JWT secret

**For now, Option A works perfectly!** We're storing `clerk_user_id` directly in each table.

---

## ✅ Step 6: Verify Setup

After adding credentials to `.env.local`:

1. **Restart your dev server** (important!)
2. Once I update the components, you'll see data saving to Supabase
3. Check Supabase dashboard → **Table Editor** to see your data

---

## 🎯 What Happens Next?

Once you've completed steps 1-5 above:

✅ Tell me "Done! I've added the Supabase credentials"

Then I will:
1. Update all components to use Supabase instead of local state
2. Connect Clerk user IDs with Supabase tables
3. Implement real-time data saving
4. Add loading states and error handling
5. Test the complete flow

---

## 📊 What Gets Saved to Supabase?

Your app will save:
- ✅ **Income Sources** - All your income streams
- ✅ **Budget Categories** - Your budget allocations (Needs/Wants/Savings)
- ✅ **Transactions** - Every transaction you log
- ✅ **User Settings** - Currency and theme preferences
- ✅ **User Profile** - Synced with Clerk authentication

**All data is:**
- 🔒 Secured per user (Row Level Security)
- 💾 Automatically saved in real-time
- 🌐 Accessible from any device
- 🔄 Synced instantly across sessions

---

## 🆘 Troubleshooting

**Problem: Can't find API keys**
- Solution: Project Settings → API → Copy "Project URL" and "anon public" key

**Problem: SQL won't run**
- Solution: Make sure you copied the ENTIRE SQL file
- Check for any error messages in red

**Problem: RLS policies failing**
- Solution: Tables should have RLS enabled (done in SQL)
- Each user only sees their own data

**Problem: Data not saving**
- Solution: Restart dev server after adding .env.local credentials
- Check browser console for errors

---

## 📞 Ready to Continue?

Once you've:
1. ✅ Created Supabase project
2. ✅ Added credentials to .env.local
3. ✅ Run the SQL schema
4. ✅ Restarted dev server

**Just tell me: "Ready! Credentials added"**

And I'll update all your components to use Supabase! 🚀
