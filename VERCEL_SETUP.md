# Vercel Deployment Setup Guide

## Quick Fix for Current Error

Your deployment is failing with:
```
Error: @clerk/clerk-react: Missing publishableKey
```

This is because **Vercel doesn't have your environment variables**. Follow this guide to fix it.

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Clerk Secret Key

You provided the **publishable key**, but you also need the **secret key**:

1. Go to: https://dashboard.clerk.com/last-active?path=api-keys
2. Find your **LIVE** keys (production):
   - ✅ Publishable Key: `pk_live_Y2xlcmsub3JnYXRyZWVrZXIuY29tJA` (you have this)
   - ❓ Secret Key: `sk_live_...` (you need this)
3. Copy the **Secret Key** - you'll need it in Step 3

---

### Step 2: Open Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your **Orgatreeker** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

---

### Step 3: Add Environment Variables

Add each variable below by clicking **"Add New"** button:

#### ✅ **Required Variables (13 total):**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_Y2xlcmsub3JnYXRyZWVrZXIuY29tJA` | Production, Preview |
| `CLERK_SECRET_KEY` | `sk_live_YOUR_SECRET_KEY` | Production, Preview |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production, Preview |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | Production, Preview |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` | Production, Preview |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mxjbsxnmrlptfqgtbbmb.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (see .env.local) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `sbp_46129c069d0946a4c28b8f150da341d5f4536c0f` | Production, Preview |
| `DODO_BEARER_TOKEN` | `0UnngA9-GRgdCdRJ.bJBdRDTE90cIzXjjwBKdfcvaREdyzb0OU-kBvuJVQglRA1ap` | Production, Preview |
| `DODO_WEBHOOK_SECRET` | `whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk` | Production, Preview |
| `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` | `pdt_3c1A6P4Cpe8KhGYnJNiCN` | Production, Preview |
| `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` | `pdt_SZ87OdK4dC9a9tpHTIUJZ` | Production, Preview |
| `DEFAULT_RETURN_URL` | `https://app.orgatreeker.com/success` | Production |

**For each variable:**
1. Click **"Add New"**
2. Enter the **Name** (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
3. Enter the **Value** (from table above)
4. Select **Environment**: Check ☑️ Production (and optionally Preview)
5. Click **Save**

---

### Step 4: Redeploy

After adding all variables:

1. Go to **Deployments** tab (top menu)
2. Find the latest failed deployment
3. Click the **⋮** (three dots menu) on the right
4. Click **"Redeploy"**
5. Wait for deployment to complete (2-3 minutes)

---

## 📋 Copy-Paste Format

If you prefer, here's a format you can copy and paste directly:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsub3JnYXRyZWVrZXIuY29tJA
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14amJzeG5tcmxwdGZxZ3RiYm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzI1MTUsImV4cCI6MjA3NjU0ODUxNX0.3REBG-IpxMVXhQG7209vEVxPDaVJxfnTOsQ4z7BbJ2Y
SUPABASE_SERVICE_ROLE_KEY=sbp_46129c069d0946a4c28b8f150da341d5f4536c0f

# Dodo Payments
DODO_BEARER_TOKEN=0UnngA9-GRgdCdRJ.bJBdRDTE90cIzXjjwBKdfcvaREdyzb0OU-kBvuJVQglRA1ap
DODO_WEBHOOK_SECRET=whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P4Cpe8KhGYnJNiCN
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK4dC9a9tpHTIUJZ

# App Config
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success
```

---

## 🔍 Verification Checklist

After redeployment, verify:

- [ ] Deployment status shows ✓ **Ready**
- [ ] Visit `https://app.orgatreeker.com`
- [ ] Sign-in page loads without errors
- [ ] Can sign up/sign in successfully
- [ ] Pricing page displays correctly
- [ ] Checkout flow works

---

## 🐛 Troubleshooting

### Issue: Still getting "Missing publishableKey" error

**Solutions:**
1. Double-check you spelled variable names **exactly** as shown (case-sensitive)
2. Make sure you selected **Production** environment when adding variables
3. Wait 30 seconds after adding variables, then redeploy
4. Clear browser cache and try again

### Issue: Clerk authentication not working

**Solutions:**
1. Verify you're using **LIVE keys** (`pk_live_*` and `sk_live_*`), not test keys
2. Check Clerk Dashboard → Domains: ensure `app.orgatreeker.com` is added
3. Check redirect URLs in Clerk Dashboard match your environment variables

### Issue: Payments not working

**Solutions:**
1. Verify Dodo webhook is configured: `https://app.orgatreeker.com/api/webhooks/dodo`
2. Check Dodo Dashboard → Webhooks → Logs for delivery errors
3. Ensure `DEFAULT_RETURN_URL` points to production domain, not localhost

### Issue: Database errors

**Solutions:**
1. Verify Supabase URL and keys are correct
2. Check Supabase Dashboard → API Settings
3. Ensure RLS policies are configured correctly

---

## 🔐 Security Best Practices

1. **Never commit** `.env.local` or `.env.production` to git (already in `.gitignore`)
2. **Never share** secret keys publicly (CLERK_SECRET_KEY, DODO_BEARER_TOKEN, etc.)
3. **Rotate keys** if accidentally exposed
4. Use **test keys** for local development
5. Use **live keys** for production only

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)
- [Dodo Payments Webhooks](https://docs.dodopayments.com/webhooks)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💡 Quick Tips

- **Environment Selection**:
  - `Production` = Live site (app.orgatreeker.com)
  - `Preview` = Pull request previews
  - `Development` = Local development (usually not needed in Vercel)

- **Variables starting with `NEXT_PUBLIC_`**:
  - Exposed to the browser (client-side)
  - Safe for public keys only
  - Required at build time

- **Variables without `NEXT_PUBLIC_`**:
  - Server-side only
  - Keep sensitive data secure
  - Not exposed to browser

---

## ✅ What's Next?

After successful deployment:

1. **Configure Custom Domain**:
   - Vercel → Settings → Domains
   - Add: `app.orgatreeker.com`
   - Follow DNS configuration instructions

2. **Test Subscription Flow**:
   - Sign up for an account
   - Go to pricing page
   - Complete a test payment
   - Verify subscription activates

3. **Monitor Webhooks**:
   - Check Dodo Dashboard for webhook delivery
   - Monitor Vercel logs for any errors

4. **Set up Monitoring**:
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)
   - Monitor Clerk Dashboard for auth metrics

---

**Need Help?** Check the troubleshooting section above or review the error logs in Vercel Dashboard.
