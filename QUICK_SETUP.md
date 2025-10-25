# ⚡ Quick Setup Guide - Get Subscriptions Working

This is a simple, step-by-step checklist to get your webhook working so users can subscribe and use the app.

---

## ✅ Step 1: Copy Environment Variables to Vercel

Go to: https://vercel.com → Your Project → **Settings** → **Environment Variables**

Add these (set Environment to **Production**):

```bash
DODO_WEBHOOK_SECRET=whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
SUPABASE_SERVICE_ROLE_KEY=sbp_46129c069d0946a4c28b8f150da341d5f4536c0f
```

**These two are the most critical!** Without them:
- ❌ Webhook signature verification fails
- ❌ Can't save subscriptions to database

### Optional but Recommended:

Also add these if they're missing:

```bash
# Copy these from your .env.local file
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DODO_BEARER_TOKEN=0UnngA9-...
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P...
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK...
```

---

## ✅ Step 2: Redeploy on Vercel

**IMPORTANT:** Environment variables only apply after redeployment!

1. Go to **Deployments** tab in Vercel
2. Wait for auto-deployment to finish (from GitHub push)
3. **OR** manually redeploy:
   - Click latest deployment
   - Click **...** menu
   - Click **Redeploy**

---

## ✅ Step 3: Configure Dodo Webhook

Go to: https://dodo.link/dashboard → **Settings** → **Webhooks**

### **For Production:**

```
Webhook URL: https://app.orgatreeker.com/webhook
Signing Secret: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

### **For Testing (Svix Play):**

```
Webhook URL: https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/
Signing Secret: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**Enable these events:**
- ✅ payment.succeeded
- ✅ payment.failed
- ✅ subscription.active
- ✅ subscription.renewed
- ✅ subscription.cancelled
- ✅ subscription.expired

---

## ✅ Step 4: Test the Webhook

1. In Dodo Dashboard → Webhooks
2. Click **"Send Test Event"**
3. Select `payment.succeeded`
4. Click **Send**

**Expected Result:** ✅ 200 OK

**If it fails:**
- Check Vercel logs (Vercel → Logs → filter by `/webhook`)
- Check Dodo logs (Dodo → Webhooks → Logs)
- See [Troubleshooting](#troubleshooting) below

---

## ✅ Step 5: Test Real Subscription Flow

1. **Sign up** on your app
2. **Go to pricing page**
3. **Click Subscribe** (use test payment if available)
4. **Complete payment** on Dodo checkout
5. **You should be redirected to** `/success` page
6. **Then redirected to** dashboard (`/`)

**Expected:** User sees dashboard, NOT pricing page!

---

## 🎯 Quick Checklist

Before testing, verify:

- [ ] `DODO_WEBHOOK_SECRET` = `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d` in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `sbp_46129c069d09...` in Vercel
- [ ] Both set to **Production** environment
- [ ] Clicked **Redeploy** in Vercel
- [ ] Deployment completed successfully (check status)
- [ ] Webhook URL in Dodo = `https://app.orgatreeker.com/webhook`
- [ ] Signing secret in Dodo matches
- [ ] Test webhook returns 200 OK

---

## 🐛 Troubleshooting

### **Issue: 404 Not Found**
**Fix:** Wrong URL! Use `https://app.orgatreeker.com/webhook` (NOT `orgatreeker.com`)

### **Issue: Signature Verification Failed**
**Fix:**
1. Update `DODO_WEBHOOK_SECRET` in Vercel to `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
2. Redeploy
3. Test again

### **Issue: Webhook Succeeds But User Still Sees Pricing Page**
**Fix:**
1. Check if `SUPABASE_SERVICE_ROLE_KEY` is in Vercel
2. Check Vercel function logs for database errors
3. Manually check database:
   ```sql
   SELECT * FROM subscriptions WHERE email = 'your-email@example.com';
   ```

### **Issue: "Deployment Not Found"**
**Fix:** Make sure you're using `app.orgatreeker.com` NOT `orgatreeker.com`

---

## 📊 How to Check If It's Working

### **1. Check Vercel Logs:**

Vercel → Your Project → **Logs** → Filter by `/webhook`

Look for:
```
✅ Webhook signature verified successfully
💰 Processing payment for email@example.com: plan=monthly
✅ payment.succeeded
✅ Updated subscription for user user_abc123
```

### **2. Check Dodo Logs:**

Dodo Dashboard → Webhooks → **Logs**

Look for:
```
✅ 200 OK
Response time: < 1000ms
```

### **3. Check Supabase Database:**

Supabase → Table Editor → **subscriptions** table

Should see a row with:
- `email`: User's email
- `status`: "active"
- `plan`: "monthly" or "yearly"

### **4. Test in App:**

1. Sign in as subscribed user
2. Go to `/` (home)
3. Should see **dashboard**, NOT pricing page

---

## 🚀 What Happens When It Works

```
User subscribes
     ↓
Dodo sends webhook to app.orgatreeker.com/webhook
     ↓
Webhook verifies signature ✅
     ↓
Finds user by email in Clerk ✅
     ↓
Saves subscription to Supabase ✅
     ↓
Returns 200 OK to Dodo ✅
     ↓
User redirected to /success
     ↓
Success page checks database → subscription found ✅
     ↓
Redirects to dashboard (/)
     ↓
Middleware checks database → subscription active ✅
     ↓
User sees dashboard 🎉
```

---

## 📝 Need More Help?

- **Detailed Setup:** [NEW_WEBHOOK_SETUP.md](NEW_WEBHOOK_SETUP.md)
- **Webhook Config:** [WEBHOOK_CONFIGURATION.md](WEBHOOK_CONFIGURATION.md)
- **How It Works:** [HOW_IT_WORKS.md](HOW_IT_WORKS.md)
- **Webhook Explained:** [WEBHOOKS_EXPLAINED.md](WEBHOOKS_EXPLAINED.md)

---

## ✅ Success Checklist

When everything works:

- [x] Test webhook returns 200 OK
- [x] Vercel logs show subscription saved
- [x] Database has subscription entry
- [x] User sees dashboard after subscribing
- [x] User does NOT see pricing page
- [x] User can access all app features

**You're done!** 🎉
