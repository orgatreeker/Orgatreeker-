# 🎯 How Your Orgatreeker Web App Works

## 📱 What Is Your App?

**Orgatreeker** is a **personal finance tracking web app** that helps users:
- Track income from different sources
- Create budgets (Needs, Wants, Savings)
- Record transactions and expenses
- View financial reports and insights
- Manage money with the 50/30/20 budgeting rule

**The app requires a paid subscription** to use (monthly or yearly plan).

---

## 🏗️ Architecture Overview

Your app uses these technologies:

```
┌─────────────────────────────────────────────────────┐
│                    YOUR WEB APP                      │
│              (Orgatreeker Finance Tracker)           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Frontend: Next.js 14 (React)                       │
│  Styling: Tailwind CSS                              │
│  Hosting: Vercel                                    │
│                                                      │
└─────────────────────────────────────────────────────┘
         ↓                 ↓                 ↓
    ┌────────┐      ┌──────────┐      ┌──────────┐
    │ Clerk  │      │  Dodo    │      │ Supabase │
    │ (Auth) │      │(Payment) │      │(Database)│
    └────────┘      └──────────┘      └──────────┘
```

### Technologies Used:

1. **Next.js 14** - Web framework (React-based)
2. **Clerk** - User authentication (sign in/sign up)
3. **Dodo Payments** - Payment processing (subscriptions)
4. **Supabase** - PostgreSQL database (stores user data)
5. **Vercel** - Cloud hosting platform

---

## 🔄 Complete User Flow (Step by Step)

### **Step 1: User Signs Up** 👤

```
User visits app → Clicks "Sign Up" → Clerk shows sign-up form
                                          ↓
User enters email/password → Clerk creates account
                                          ↓
                            User is now authenticated
                                          ↓
                        User is redirected to /pricing page
```

**What happens:**
- Clerk creates a user account
- Clerk gives the user a unique ID (like `user_2abc123xyz`)
- User is logged in but has NO subscription yet

---

### **Step 2: User Subscribes** 💳

```
User on /pricing page → Clicks "Subscribe Monthly" ($6.83/month)
                                    ↓
                    Browser sends request to /api/checkout
                                    ↓
              Server creates Dodo checkout session
                                    ↓
              Dodo returns checkout_url (payment page)
                                    ↓
         User redirected to Dodo's secure payment page
                                    ↓
               User enters credit card details
                                    ↓
                    Dodo processes payment
                                    ↓
            ✅ Payment successful! → User redirected to /success
```

**Code responsible:**
- **Frontend:** [app/pricing/pricing-client.tsx](app/pricing/pricing-client.tsx#L17) - `handleCheckout()` function
- **Backend API:** [app/api/checkout/route.ts](app/api/checkout/route.ts) - Creates Dodo checkout session
- **Dodo Client:** [lib/dodo.ts](lib/dodo.ts) - Connects to Dodo Payments API

**Environment Variables Used:**
- `DODO_BEARER_TOKEN` - Your Dodo account credentials
- `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` - Product ID for $6.83/month plan
- `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` - Product ID for $34.71/year plan

---

### **Step 3: Webhook Receives Payment Event** 🔔

This is the **MOST IMPORTANT PART** - where the magic happens (or should happen):

```
User completes payment on Dodo
            ↓
Dodo's servers detect payment success
            ↓
Dodo sends webhook to: https://app.orgatreeker.com/api/webhooks/dodo
            ↓
Your webhook endpoint receives the event
            ↓
Webhook verifies signature (security check)
            ↓
Webhook extracts: email, product_id, payment_id
            ↓
Webhook finds user in Clerk by email
            ↓
Webhook saves subscription to Supabase database
            ↓
✅ User now has active subscription!
```

**Code responsible:**
- **Webhook Endpoint:** [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
- **Database Functions:** [lib/supabase/database.ts](lib/supabase/database.ts) - `upsertSubscription()`

**Environment Variables Used:**
- `DODO_WEBHOOK_SECRET` - Secret key to verify webhook is really from Dodo
- `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL!** Allows webhook to write to database
- `CLERK_SECRET_KEY` - Allows webhook to find user by email

---

### **Step 4: User Accesses Dashboard** 🎉

```
User lands on /success page
            ↓
Success page checks database for subscription
            ↓
✅ Found subscription! → Redirect to / (home/dashboard)
            ↓
Middleware checks subscription again (security)
            ↓
✅ Confirmed! → User sees dashboard with full app access
```

**Code responsible:**
- **Success Page:** [app/success/page.tsx](app/success/page.tsx) - Checks subscription before redirecting
- **Middleware:** [middleware.ts](middleware.ts) - Protects routes, requires subscription
- **Main App:** [app/page.tsx](app/page.tsx) - Dashboard with income, budget, transactions tabs

---

## 🔐 How Security Works

### **1. Authentication (Clerk)**
- User logs in → Clerk gives them a session token
- Every request includes this token
- Your app verifies: "Is this user really logged in?"

### **2. Subscription Protection (Middleware)**
```typescript
// middleware.ts checks on EVERY page visit:
1. Is user logged in? (Clerk token valid?)
2. Does user have active subscription? (Database check)
3. If NO subscription → Redirect to /pricing
4. If YES subscription → Allow access to app
```

### **3. Webhook Security (Svix)**
```typescript
// Webhook verifies signature:
1. Dodo signs webhook with secret key
2. Your app verifies signature using same secret
3. If signatures match → Webhook is authentic
4. If signatures don't match → Reject (prevent fake webhooks)
```

**This is why `DODO_WEBHOOK_SECRET` must match exactly!**

---

## 🗄️ Database Structure (Supabase)

Your app stores data in these tables:

### **1. subscriptions** (Most Important!)
```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY,
  clerk_user_id   TEXT UNIQUE,        -- Links to Clerk user
  email           TEXT,                -- User's email
  status          TEXT,                -- 'active', 'cancelled', 'expired'
  plan            TEXT,                -- 'monthly' or 'yearly'
  subscription_id TEXT,                -- Dodo subscription ID
  product_id      TEXT,                -- Which product they bought
  payment_id      TEXT,                -- Payment transaction ID
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,         -- When subscription expires
  last_event_type TEXT,                -- Last webhook event received
  last_event_id   TEXT UNIQUE          -- Prevents duplicate webhooks
);
```

### **2. users**
Stores basic user info (name, email, Clerk ID)

### **3. income_sources**
User's income entries (salary, freelance, etc.)

### **4. budget_categories**
User's budget allocations (Needs, Wants, Savings)

### **5. transactions**
User's expenses and spending records

### **6. user_settings**
User preferences (currency, theme, budget percentages)

---

## 🌐 Webhook Details

### **What is a Webhook?**

A webhook is like a **notification** that Dodo sends to your app when something happens:

> "Hey! A user just paid you $6.83. Here's their info..."

### **Webhook URL:**
```
https://app.orgatreeker.com/api/webhooks/dodo
```

### **Webhook Events Your App Handles:**

| Event | What It Means | What Your App Does |
|-------|---------------|-------------------|
| `payment.succeeded` | User paid successfully | Create subscription, set status to 'active' |
| `payment.failed` | Payment declined | Set subscription status to 'failed' |
| `subscription.active` | Subscription is now active | Update subscription status to 'active' |
| `subscription.renewed` | User's subscription auto-renewed | Keep subscription active |
| `subscription.cancelled` | User cancelled subscription | Set status to 'cancelled' (still active until expiry) |
| `subscription.expired` | Subscription expired | Set status to 'expired', block app access |
| `subscription.plan_changed` | User switched monthly ↔ yearly | Update plan type |

### **Webhook Payload Example:**

When a user pays, Dodo sends this JSON data:

```json
{
  "type": "payment.succeeded",
  "event_id": "evt_abc123",
  "data": {
    "payment_id": "pay_xyz789",
    "subscription_id": "sub_123abc",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    },
    "amount": 6.83,
    "currency": "USD"
  }
}
```

Your webhook receives this, verifies it's real, then saves the subscription.

---

## 🔧 Environment Variables Explained

These are **secret keys and settings** your app needs to work:

### **Production (Vercel):**

```bash
# Clerk - User Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # Public, safe to expose
CLERK_SECRET_KEY=sk_live_...                    # SECRET! Server only

# Supabase - Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  # Public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...          # Public (limited access)
SUPABASE_SERVICE_ROLE_KEY=sbp_...                 # SECRET! Full database access

# Dodo Payments
DODO_BEARER_TOKEN=0UnngA9-...                     # SECRET! Your Dodo account key
DODO_WEBHOOK_SECRET=whsec_ko62zyr...              # SECRET! Verifies webhooks
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P...    # Public product ID
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK...    # Public product ID

# App Settings
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success  # Where to send users after payment
```

### **Why Some Are "Secret":**

- **Public keys** (`NEXT_PUBLIC_*`) - Safe to expose, limited permissions
- **Secret keys** - If someone steals these, they can:
  - Access your database
  - Charge payments to your account
  - Impersonate your app

**That's why you removed `.env.production` from Git!** 🔒

---

## 🐛 Why Subscriptions Aren't Working

### **The Current Problem:**

```
User pays → Dodo sends webhook → Webhook receives event
                                        ↓
                            ❌ Subscription NOT saved to database
                                        ↓
                            User redirected to /success
                                        ↓
                     Success page checks database
                                        ↓
                            ❌ No subscription found!
                                        ↓
                     Middleware checks database
                                        ↓
                            ❌ No subscription found!
                                        ↓
                      User redirected BACK to /pricing 😢
```

### **Root Causes (Most Likely):**

1. **Missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel**
   - Webhook can't write to database without it
   - Check: Vercel → Settings → Environment Variables

2. **Wrong `DODO_WEBHOOK_SECRET` in Vercel**
   - Webhook signature verification fails
   - Webhook rejects all events
   - Check: Dodo Dashboard → Webhooks → Copy correct secret

3. **Webhook Not Configured in Dodo**
   - Dodo doesn't know where to send events
   - Check: Dodo Dashboard → Webhooks → Add endpoint

4. **RLS (Row Level Security) Blocking Writes**
   - Supabase security policies prevent webhook from writing
   - Fixed: We have correct policies set up ✅

---

## 🎯 How to Test Everything

### **Test 1: Webhook Signature**

Use the test script in your docs:

```bash
node check-webhook-secret.js
```

Expected: ✅ Signature verification passed

### **Test 2: Database Write**

Go to `/debug-subscription` page:
- Shows if database connection works
- Shows if subscription exists
- Provides manual SQL to activate subscription

### **Test 3: Manual Subscription Activation**

If webhook doesn't work, manually insert:

```sql
INSERT INTO subscriptions (clerk_user_id, email, status, plan)
VALUES ('user_YOUR_ID', 'your@email.com', 'active', 'monthly');
```

Then test if app unlocks.

---

## 📊 Complete Data Flow Diagram

```
┌──────────┐
│  USER    │
│ Browser  │
└────┬─────┘
     │
     │ 1. Sign Up
     ↓
┌─────────────┐
│   CLERK     │  Creates user account
│   (Auth)    │  Returns: user_2abc123xyz
└──────┬──────┘
       │
       │ 2. View Pricing
       ↓
┌──────────────┐
│  YOUR APP    │
│  /pricing    │  Shows $6.83/month plan
└──────┬───────┘
       │
       │ 3. Click Subscribe
       ↓
┌──────────────┐
│ /api/checkout│  Creates Dodo checkout session
│              │  Returns: checkout_url
└──────┬───────┘
       │
       │ 4. Redirect to Dodo
       ↓
┌──────────────┐
│DODO PAYMENTS │
│ Checkout Page│  User enters card details
└──────┬───────┘
       │
       │ 5. Payment Success
       ↓
┌──────────────────────┐
│  DODO SERVERS        │
│  Webhook Sender      │  Sends payment.succeeded event
└──────┬───────────────┘
       │
       │ 6. POST to webhook endpoint
       ↓
┌────────────────────────────┐
│  YOUR APP                  │
│  /api/webhooks/dodo        │
│                            │
│  1. Verify signature ✓     │
│  2. Extract user email     │
│  3. Find user in Clerk     │
│  4. Save to Supabase       │
└──────┬─────────────────────┘
       │
       │ 7. Write to database
       ↓
┌──────────────┐
│  SUPABASE    │
│  Database    │  subscriptions table updated
│              │  status = 'active' ✓
└──────┬───────┘
       │
       │ 8. User redirected to /success
       ↓
┌──────────────┐
│  /success    │  Checks database
│  Page        │  Finds subscription ✓
└──────┬───────┘
       │
       │ 9. Redirect to dashboard
       ↓
┌──────────────┐
│  MIDDLEWARE  │  Checks subscription
│              │  Allows access ✓
└──────┬───────┘
       │
       │ 10. Show dashboard
       ↓
┌──────────────┐
│  DASHBOARD   │
│              │  🎉 User can use app!
│  - Income    │
│  - Budget    │
│  - Expenses  │
└──────────────┘
```

---

## 🚀 Summary

**Your app works like this:**

1. **User signs up** with Clerk
2. **User subscribes** via Dodo Payments
3. **Dodo sends webhook** to your app
4. **Webhook saves subscription** to Supabase
5. **Middleware checks subscription** on every page
6. **If subscribed** → User sees dashboard
7. **If not subscribed** → User sees pricing page

**The problem:** Step 4 (webhook saves to database) is failing.

**The fix:** Make sure Vercel has all environment variables, especially `SUPABASE_SERVICE_ROLE_KEY`.

---

## 📞 Need More Help?

Use these tools:

1. **Debug Page:** https://app.orgatreeker.com/debug-subscription
2. **Detailed Guide:** [SUBSCRIPTION_FIX_GUIDE.md](SUBSCRIPTION_FIX_GUIDE.md)
3. **Webhook Docs:** [FIX_WEBHOOK_SIGNATURE.md](FIX_WEBHOOK_SIGNATURE.md)

---

Hope this helps you understand how everything works! 🎯
