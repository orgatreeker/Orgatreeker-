# 🆕 New Webhook Setup Complete!

## ✅ What Was Done

I've set up your new Dodo Payments webhook with the updated configuration:

### **New Webhook Details:**
- **URL:** `https://app.orgatreeker.com/webhook` ← **IMPORTANT: Use app. subdomain!**
- **Signing Secret:** `whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj`
- **Headers:** Dodo sends `webhook-id`, `webhook-signature`, `webhook-timestamp` (not `svix-*`)

---

## 📝 Changes Made

### 1. **Webhook Route Created**
- File: [app/webhook/route.ts](app/webhook/route.ts)
- This route already existed and points to the main webhook handler
- It handles all Dodo payment events

### 2. **Environment Variable Updated**
- File: `.env.local` (local development)
- Updated `DODO_WEBHOOK_SECRET` to new value
- Old: `whsec_ko62zyrTktRwLxwxL+au3X2NOk0E6Iqe`
- New: `whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj`

### 3. **Middleware Updated**
- File: [middleware.ts](middleware.ts)
- Added `/webhook(.*)` to public routes
- Allows Dodo to call webhook without authentication

---

## 🚀 What You Need to Do Now

### **Step 1: Update Vercel Environment Variables**

This is **CRITICAL** - Vercel (production) needs the new webhook secret:

1. Go to: https://vercel.com
2. Click your project → **Settings** → **Environment Variables**
3. Find `DODO_WEBHOOK_SECRET`
4. Click **Edit** (pencil icon)
5. Replace with new value: `whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj`
6. Make sure it's set for **Production** environment
7. Click **Save**

### **Step 2: Add Missing Environment Variable**

While you're in Vercel, also add this if it's missing:

**Variable:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** `sbp_46129c069d0946a4c28b8f150da341d5f4536c0f`
**Environment:** Production

This is required for the webhook to save subscriptions to the database!

### **Step 3: Redeploy**

After updating environment variables:

1. Go to **Deployments** tab in Vercel
2. Click latest deployment → **...** menu → **Redeploy**
3. Wait 2-3 minutes for deployment to complete

**Important:** Environment variable changes ONLY apply after redeployment!

### **Step 4: Test the Webhook**

After redeployment:

1. Go to Dodo Dashboard: https://dodo.link/dashboard
2. Navigate to: **Settings** → **Webhooks**
3. Find your webhook: `https://orgatreeker.com/webhook`
4. Click **"Send Test Event"**
5. Select event: `payment.succeeded`
6. Click **Send**

**Expected Result:** ✅ 200 OK

---

## 🔍 Verify Webhook Configuration in Dodo

Make sure your Dodo webhook is set up correctly:

### **Dodo Dashboard Settings:**

1. **Webhook URL:** `https://app.orgatreeker.com/webhook` ← **Use app. subdomain!**
2. **Signing Secret:** `whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj`
3. **Events Enabled:**
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`
   - ✅ `subscription.active`
   - ✅ `subscription.renewed`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.expired`
   - ✅ `subscription.plan_changed`

---

## 🧪 Testing Locally

To test the webhook on your local machine:

### **1. Update test script:**

Edit `test-webhook.js` line 18:
```javascript
const USER_EMAIL = 'your@email.com'; // ← Your actual email
```

### **2. Run dev server:**
```bash
npm run dev
```

### **3. Run test webhook:**
```bash
node test-webhook.js
```

### **4. Expected output:**
```
✅ Webhook sent successfully!
✅ Subscription saved to database
```

### **5. Check database:**
```sql
SELECT * FROM subscriptions WHERE email = 'your@email.com';
```

You should see a new subscription entry!

---

## 📊 How It Works

```
User pays $6.83 on Dodo
        ↓
Dodo processes payment ✅
        ↓
Dodo sends webhook to: https://app.orgatreeker.com/webhook
        ↓
Your webhook receives:
  - Headers: webhook-id, webhook-timestamp, webhook-signature
  - Body: { type: "payment.succeeded", customer: {...}, ... }
        ↓
Your webhook verifies signature using: whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj
        ↓
Maps webhook-* headers to svix-* format for verification
        ↓
✅ Signature matches! (Authentic webhook)
        ↓
Extract user email from webhook
        ↓
Find user in Clerk by email
        ↓
Save subscription to Supabase:
  - clerk_user_id: "user_abc123"
  - email: "user@example.com"
  - status: "active"
  - plan: "monthly"
        ↓
Return 200 OK to Dodo
        ↓
✅ User now has active subscription!
        ↓
User can access dashboard 🎉
```

---

## 🗺️ Webhook Endpoints

Your app now has **2 webhook URLs** (both work):

| URL | File | Purpose |
|-----|------|---------|
| `https://app.orgatreeker.com/webhook` | `app/webhook/route.ts` | New, cleaner URL (recommended) |
| `https://app.orgatreeker.com/api/webhooks/dodo` | `app/api/webhooks/dodo/route.ts` | Original URL (still works) |

Both point to the same handler code, so either works fine.

**Recommendation:** Use the new `/webhook` URL in Dodo (cleaner and simpler).

---

## ⚙️ Environment Variables Checklist

Make sure these are set in **Vercel Production**:

```bash
# Clerk (Authentication)
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
✅ CLERK_SECRET_KEY=sk_live_...

# Supabase (Database)
✅ NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
✅ SUPABASE_SERVICE_ROLE_KEY=sbp_46129c069d09...  ← CRITICAL!

# Dodo Payments
✅ DODO_BEARER_TOKEN=0UnngA9-GRgdCdRJ...
✅ DODO_WEBHOOK_SECRET=whsec_3NJTaOxYLlAdVcsZo/jFWV4UpO07+mPj  ← NEW!
✅ NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P4Cpe8KhGYnJNiCN
✅ NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK4dC9a9tpHTIUJZ
```

---

## 🎯 Expected Behavior After Setup

### **When user subscribes:**

1. User clicks "Subscribe" on pricing page
2. Redirected to Dodo checkout
3. User enters card details and pays
4. Payment succeeds ✅
5. Dodo sends webhook to `https://orgatreeker.com/webhook`
6. Webhook verifies signature ✅
7. Webhook saves subscription to database ✅
8. User redirected to `/success` page
9. Success page checks database → finds subscription ✅
10. User redirected to dashboard `/`
11. Middleware checks database → subscription active ✅
12. User sees dashboard with full access! 🎉

**User should NOT see pricing page after subscribing!**

---

## 🚨 Troubleshooting

### **If webhook still doesn't work:**

1. **Check Vercel Logs:**
   - Go to: Vercel → Your Project → Logs
   - Filter: `/webhook`
   - Look for errors

2. **Check Dodo Logs:**
   - Go to: Dodo Dashboard → Webhooks → Logs
   - Look for failed deliveries

3. **Use Debug Page:**
   - Visit: `https://orgatreeker.com/debug-subscription`
   - Shows exactly what's wrong

4. **Manual Activation (Temporary Fix):**
   - Go to debug page
   - Copy SQL query
   - Run in Supabase SQL Editor
   - Instant subscription activation

### **Common Issues:**

| Issue | Solution |
|-------|----------|
| **404 Not Found** | Wrong URL! Use `https://app.orgatreeker.com/webhook` (NOT `orgatreeker.com`) |
| **Signature verification fails** | Update `DODO_WEBHOOK_SECRET` in Vercel, redeploy |
| **"Deployment not found"** | Domain mismatch - use `app.orgatreeker.com` subdomain |
| **Webhook receives but doesn't save** | Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel, redeploy |
| **Missing product_id** | Webhook defaults to 'monthly' plan when product_id is null |
| **User still sees pricing page** | Check database for subscription entry |

---

## 📚 Related Documentation

- [HOW_IT_WORKS.md](HOW_IT_WORKS.md) - Complete app architecture explanation
- [WEBHOOKS_EXPLAINED.md](WEBHOOKS_EXPLAINED.md) - What webhooks are and how they work
- [SUBSCRIPTION_FIX_GUIDE.md](SUBSCRIPTION_FIX_GUIDE.md) - Troubleshooting guide
- [FIX_WEBHOOK_SIGNATURE.md](FIX_WEBHOOK_SIGNATURE.md) - Signature verification issues

---

## ✅ Quick Checklist

Before testing, make sure:

- [ ] Updated `DODO_WEBHOOK_SECRET` in Vercel (new value)
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- [ ] Clicked "Redeploy" in Vercel
- [ ] Deployment completed successfully
- [ ] Webhook URL in Dodo is: `https://orgatreeker.com/webhook`
- [ ] Signing secret in Dodo matches new value
- [ ] Sent test event from Dodo → returns 200 OK
- [ ] Checked database for test subscription entry

---

## 🎉 You're All Set!

Your new webhook is configured and ready to use!

**Next step:** Update environment variables in Vercel and redeploy.

After that, your subscriptions will work automatically! 🚀
