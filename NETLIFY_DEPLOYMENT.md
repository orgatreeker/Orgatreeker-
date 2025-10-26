# 🚀 Netlify Production Deployment Guide

Complete guide to deploy your subscription system on Netlify.

---

## Step 1: Add Environment Variables to Netlify

### Go to Netlify Dashboard
1. Open: https://app.netlify.com
2. Select your site/project (Orgatreeker)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**

### Add These Variables

For each variable below, click **Add a variable** and paste:

#### Clerk Authentication
- **Key:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value:** (copy from .env.local)

- **Key:** `CLERK_SECRET_KEY`
- **Value:** (copy from .env.local)

#### Supabase Database
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://mxjbsxnmrlptfqgtbbmb.supabase.co`

- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (copy from .env.local)

- **Key:** `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITICAL**
- **Value:** `sbp_46129c069d0946a4c28b8f150da341d5f4536c0f`

#### Dodo Payments
- **Key:** `DODO_BEARER_TOKEN`
- **Value:** (copy from .env.local)

- **Key:** `DODO_WEBHOOK_SECRET` ⚠️ **CRITICAL**
- **Value:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

- **Key:** `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY`
- **Value:** `pdt_3c1A6P4Cpe8KhGYnJNiCN`

- **Key:** `NEXT_PUBLIC_DODO_PRODUCT_YEARLY`
- **Value:** `pdt_SZ87OdK4dC9a9tpHTIUJZ`

#### Return URL
- **Key:** `DEFAULT_RETURN_URL` ⚠️ **IMPORTANT**
- **Value:** `https://YOUR-NETLIFY-SITE.netlify.app/success`

**Note:** Replace `YOUR-NETLIFY-SITE` with your actual Netlify site name (found in Site settings → General → Site details → Site name)

Example: If your site is `orgatreeker.netlify.app`, use:
```
DEFAULT_RETURN_URL=https://orgatreeker.netlify.app/success
```

If you have a custom domain on Netlify (like `app.orgatreeker.com`), use:
```
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success
```

---

## Step 2: Deploy to Netlify

### If Already Connected to Git:
Netlify will auto-deploy when you push to GitHub.

### If Not Connected Yet:

#### Option A: Connect to GitHub (Recommended)
1. Go to Netlify Dashboard → **Add new site** → **Import an existing project**
2. Connect to GitHub
3. Select repository: `orgatreeker/Orgatreeker-`
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Framework preset:** Next.js
5. Click **Deploy site**

#### Option B: Manual Deploy
1. Build locally: `npm run build`
2. Go to Netlify → **Deploys** → Drag and drop `.next` folder

### Wait for Deployment
- Check **Deploys** tab
- Wait for status: **Published** ✅
- Note your site URL (e.g., `https://orgatreeker.netlify.app`)

---

## Step 3: Configure Custom Domain (Optional)

If you want to use `app.orgatreeker.com`:

1. Go to **Site settings** → **Domain management** → **Add custom domain**
2. Enter: `app.orgatreeker.com`
3. Follow Netlify's DNS instructions
4. Wait for DNS propagation (can take up to 48 hours, usually faster)
5. Enable HTTPS (automatic with Netlify)

After custom domain is set up, update `DEFAULT_RETURN_URL` in environment variables to use custom domain.

---

## Step 4: Configure Dodo Webhook

### Get Your Webhook URL

Your webhook URL will be one of:
- **Custom domain:** `https://app.orgatreeker.com/webhook`
- **Netlify subdomain:** `https://YOUR-SITE.netlify.app/webhook`

Use whichever domain you're using for your site.

### Configure in Dodo Dashboard

1. Go to: https://dodo.link/dashboard
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Endpoint** (or edit existing)

**Endpoint Configuration:**
- **URL:** `https://YOUR-DOMAIN/webhook` (see above)
- **Signing Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

**Enable Events:**
- ✅ payment.succeeded
- ✅ payment.failed
- ✅ subscription.active
- ✅ subscription.renewed
- ✅ subscription.cancelled
- ✅ subscription.expired

4. Click **Save**

---

## Step 5: Test the Webhook

### Send Test Event from Dodo

1. In Dodo Dashboard → Webhooks
2. Find your endpoint
3. Click **"Send Test Event"** or **"Test"**
4. Select event: `payment.succeeded`
5. Click **Send**

### Expected Result: ✅ 200 OK

### Check Netlify Function Logs

1. Netlify Dashboard → **Functions**
2. Look for your webhook function
3. Click to view logs
4. Should see:
   ```
   ✅ Webhook signature verified successfully
   💰 Processing payment for email@example.com
   ✅ payment.succeeded
   ```

---

## Step 6: Test Real Subscription Flow

1. **Sign up** on your Netlify site
2. **Go to pricing page**
3. **Click Subscribe**
4. **Complete payment** on Dodo
5. **Should redirect to** `/success` page
6. **Then redirect to** dashboard

**Expected:** User sees dashboard, NOT pricing page! ✅

---

## Environment Variables Checklist

Before testing, verify all these are set in Netlify:

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (critical!)
- [ ] `DODO_BEARER_TOKEN`
- [ ] `DODO_WEBHOOK_SECRET` (critical!)
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY`
- [ ] `NEXT_PUBLIC_DODO_PRODUCT_YEARLY`
- [ ] `DEFAULT_RETURN_URL` (must use your Netlify domain!)

---

## Most Critical Variables

These 3 are ABSOLUTELY required:

1. **`DODO_WEBHOOK_SECRET`** = `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
   - Without this: Webhook signature verification fails

2. **`SUPABASE_SERVICE_ROLE_KEY`** = `sbp_46129c069d0946a4c28b8f150da341d5f4536c0f`
   - Without this: Can't save subscriptions to database

3. **`DEFAULT_RETURN_URL`** = `https://YOUR-NETLIFY-SITE/success`
   - Without this: Users redirected to localhost after payment

---

## Troubleshooting

### Issue: 404 Not Found (Webhook)

**Problem:** Wrong webhook URL

**Fix:**
- Verify webhook URL matches your Netlify site domain
- Use custom domain if configured, or `.netlify.app` subdomain
- Format: `https://YOUR-DOMAIN/webhook`

### Issue: Signature Verification Failed

**Problem:** `DODO_WEBHOOK_SECRET` doesn't match or is missing

**Fix:**
1. Check `DODO_WEBHOOK_SECRET` in Netlify = `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
2. Redeploy site (Netlify → Deploys → Trigger deploy)
3. Test again

### Issue: User Still Sees Pricing After Subscribing

**Problem:** `SUPABASE_SERVICE_ROLE_KEY` missing or subscription not saving

**Fix:**
1. Add `SUPABASE_SERVICE_ROLE_KEY` in Netlify
2. Check Netlify function logs for database errors
3. Verify subscription in Supabase table

### Issue: Redirected to localhost After Payment

**Problem:** `DEFAULT_RETURN_URL` still points to localhost

**Fix:**
1. Update `DEFAULT_RETURN_URL` in Netlify to your production domain
2. Redeploy site
3. Test subscription again

---

## Netlify-Specific Notes

### Functions
Next.js API routes automatically become Netlify Functions. Your webhook at `app/api/webhooks/dodo/route.ts` will be accessible at `/webhook`.

### Build Settings
If build fails, verify in Netlify:
- **Build command:** `npm run build` or `next build`
- **Publish directory:** `.next`
- **Node version:** 18.x or higher (set in `netlify.toml` or site settings)

### Environment Variables Scope
All variables added in Netlify apply to:
- Production deploys
- Deploy previews (optional)
- Branch deploys (optional)

Make sure variables are enabled for **Production** at minimum.

---

## After Everything is Set Up

### Verification Checklist

- [ ] All environment variables added to Netlify
- [ ] Site deployed successfully
- [ ] Webhook URL configured in Dodo
- [ ] Signing secret matches
- [ ] Test webhook returns 200 OK
- [ ] Test subscription works end-to-end
- [ ] User can access dashboard after subscribing
- [ ] Subscription appears in Supabase database

---

## Quick Reference

**Webhook URL:** `https://YOUR-NETLIFY-DOMAIN/webhook`
**Signing Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
**Return URL:** `https://YOUR-NETLIFY-DOMAIN/success`

Replace `YOUR-NETLIFY-DOMAIN` with:
- Your custom domain (e.g., `app.orgatreeker.com`), OR
- Your Netlify subdomain (e.g., `orgatreeker.netlify.app`)

---

## Need Help?

- **Netlify Docs:** https://docs.netlify.com
- **Function Logs:** Netlify Dashboard → Functions
- **Deploy Logs:** Netlify Dashboard → Deploys → View logs
- **Environment Variables:** Site settings → Environment variables

---

## Success! 🎉

When everything works:
1. ✅ Test webhook returns 200 OK
2. ✅ Real user can subscribe
3. ✅ After payment, user sees dashboard
4. ✅ Subscription in Supabase database

**Your subscription system is live on Netlify!**
