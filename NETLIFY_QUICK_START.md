# ⚡ Netlify Quick Start - Get Subscriptions Working

Simple step-by-step guide to deploy on Netlify and get subscriptions working.

---

## 🎯 What You'll Do

1. Add environment variables to Netlify (5 min)
2. Deploy your site (2 min)
3. Configure Dodo webhook (2 min)
4. Test everything (5 min)

**Total time: ~15 minutes**

---

## Step 1: Add Environment Variables to Netlify

### Go to Netlify
1. Open https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**

### Add These 10 Variables

Click **Add a variable** for each:

**Copy from your .env.local file:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DODO_BEARER_TOKEN`
- `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY`
- `NEXT_PUBLIC_DODO_PRODUCT_YEARLY`

**These two need special values:**

**Key:** `DODO_WEBHOOK_SECRET`
**Value:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

**Key:** `DEFAULT_RETURN_URL`
**Value:** `https://YOUR-SITE.netlify.app/success`
(Replace `YOUR-SITE` with your actual Netlify site name)

---

## Step 2: Get Your Site URL

After adding variables, find your site URL:

1. Go to **Site overview** in Netlify
2. Look for **Site URL** (e.g., `https://orgatreeker.netlify.app`)
3. **Write it down** - you'll need it for the next steps!

If you have a custom domain configured, use that instead.

---

## Step 3: Deploy Your Site

### Option A: Auto-Deploy from GitHub (Recommended)
1. Push your code to GitHub
2. Netlify automatically deploys
3. Go to **Deploys** tab
4. Wait for status: **Published** ✅

### Option B: Manual Deploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for completion

---

## Step 4: Configure Dodo Webhook

### Go to Dodo Dashboard
1. Open https://dodo.link/dashboard
2. Go to **Settings** → **Webhooks**
3. Click **Add Endpoint**

### Add Your Webhook

**Endpoint URL:**
```
https://YOUR-SITE.netlify.app/webhook
```
(Use the URL from Step 2, add `/webhook` at the end)

**Signing Secret:**
```
whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**Enable Events:**
- ✅ payment.succeeded
- ✅ payment.failed
- ✅ subscription.active
- ✅ subscription.renewed
- ✅ subscription.cancelled
- ✅ subscription.expired

Click **Save**

---

## Step 5: Test Webhook

In Dodo Dashboard:
1. Find your webhook endpoint
2. Click **Send Test Event**
3. Select `payment.succeeded`
4. Click **Send**

**Expected Result:** ✅ 200 OK

If it fails, check:
- Webhook URL is correct (`/webhook` at the end)
- Signing secret matches
- Site is deployed

---

## Step 6: Test Real Subscription

1. Go to your Netlify site
2. Sign up for an account
3. Go to pricing page
4. Click **Subscribe**
5. Complete payment on Dodo
6. Should redirect to `/success`, then dashboard

**Success:** You see dashboard, NOT pricing page! ✅

---

## ✅ Quick Checklist

Before you start testing:

- [ ] 10 environment variables added to Netlify
- [ ] `DODO_WEBHOOK_SECRET` = `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
- [ ] `DEFAULT_RETURN_URL` uses your Netlify domain (NOT localhost)
- [ ] Site deployed successfully
- [ ] Webhook URL configured in Dodo
- [ ] Webhook URL uses your Netlify domain + `/webhook`
- [ ] Test webhook returns 200 OK

---

## 🐛 Common Issues

### Webhook Returns 404
**Fix:** Make sure webhook URL is `https://YOUR-SITE.netlify.app/webhook` (don't forget `/webhook`)

### Webhook Returns 401/403
**Fix:** Check `DODO_WEBHOOK_SECRET` in Netlify matches `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

### User Still Sees Pricing After Subscribing
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to Netlify and redeploy

### Redirected to localhost After Payment
**Fix:** Update `DEFAULT_RETURN_URL` in Netlify to use your Netlify domain

---

## 📝 Important URLs

**Your Site:** `https://YOUR-SITE.netlify.app` (replace with actual)
**Webhook URL:** `https://YOUR-SITE.netlify.app/webhook`
**Return URL:** `https://YOUR-SITE.netlify.app/success`
**Signing Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

---

## 🎉 You're Done!

When test webhook returns 200 OK and a real user can subscribe → You're live!

For detailed instructions, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)
