# 🚀 Production Deployment Checklist

Follow these steps in order to deploy your subscription system to production.

---

## Step 1: Add Environment Variables to Vercel

### Go to Vercel Dashboard
1. Open: https://vercel.com
2. Select your project (Orgatreeker)
3. Go to **Settings** → **Environment Variables**

### Add These Variables (CRITICAL)

Set each to **Production** environment:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://mxjbsxnmrlptfqgtbbmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase Service Role (MOST CRITICAL - for webhook writes)
SUPABASE_SERVICE_ROLE_KEY=sbp_...

# Dodo Payments
DODO_BEARER_TOKEN=0UnngA9-...
DODO_WEBHOOK_SECRET=whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d

# Dodo Product IDs
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_3c1A6P4Cpe8KhGYnJNiCN
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_SZ87OdK4dC9a9tpHTIUJZ

# Return URL (IMPORTANT - must be production URL)
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success
```

**Note:** Copy the actual values from your `.env.local` file - the values above are masked for security.

### Verify Each Variable
- [ ] All variables added
- [ ] All set to **Production** environment
- [ ] No typos or extra spaces
- [ ] `DEFAULT_RETURN_URL` uses `https://app.orgatreeker.com` (NOT localhost)

---

## Step 2: Redeploy on Vercel

### Method 1: Automatic (Recommended)
1. Vercel will auto-deploy from GitHub
2. Go to **Deployments** tab
3. Wait for deployment to complete (usually 2-3 minutes)
4. Check status shows **"Ready"**

### Method 2: Manual Redeploy
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **⋯** (three dots menu)
4. Click **Redeploy**
5. Wait for completion

### Verify Deployment
- [ ] Status = "Ready" ✅
- [ ] No build errors
- [ ] Domain shows: `app.orgatreeker.com`

---

## Step 3: Configure Webhook in Dodo Dashboard

### Go to Dodo Dashboard
1. Open: https://dodo.link/dashboard
2. Go to **Settings** → **Webhooks**
3. Click **Add Endpoint** (or edit existing)

### Configure Endpoint

```
Endpoint URL: https://app.orgatreeker.com/webhook
Description: Production Webhook
```

### Add Signing Secret

```
Signing Secret: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

### Enable Events

Select these events:
- [x] payment.succeeded
- [x] payment.failed
- [x] subscription.active
- [x] subscription.renewed
- [x] subscription.cancelled
- [x] subscription.expired

### Save Configuration
- [ ] Endpoint saved
- [ ] Events enabled
- [ ] Signing secret matches

---

## Step 4: Test the Webhook

### Send Test Event from Dodo

1. In Dodo Dashboard → Webhooks
2. Find your webhook endpoint
3. Click **"Send Test Event"** or **"Test"**
4. Select event: `payment.succeeded`
5. Click **Send**

### Expected Result: ✅ 200 OK

If you see **200 OK** → Webhook is working!

If you see an error:
- **404**: Wrong URL (make sure it's `app.orgatreeker.com/webhook`)
- **401/403**: Signature verification failed (check `DODO_WEBHOOK_SECRET` in Vercel)
- **500**: Server error (check Vercel logs)

### Verify in Logs

**Check Vercel Logs:**
1. Vercel Dashboard → Your Project → **Logs**
2. Filter by: `/webhook`
3. Look for:
   ```
   ✅ Webhook signature verified successfully
   💰 Processing payment for email@example.com
   ✅ payment.succeeded
   ```

**Check Dodo Logs:**
1. Dodo Dashboard → Webhooks → **Logs**
2. Should show: `200 OK` response
3. Response time: < 1000ms

---

## Step 5: Test Real Subscription Flow

### Test with Real User Account

1. **Sign Up:**
   - Go to: https://app.orgatreeker.com
   - Create new account (use real email you can access)
   - Verify email if needed

2. **Go to Pricing:**
   - After signup, you should see pricing page
   - Or manually go to: https://app.orgatreeker.com/pricing

3. **Click Subscribe:**
   - Choose Monthly or Yearly plan
   - Click **Subscribe** button

4. **Complete Payment on Dodo:**
   - You'll be redirected to Dodo checkout
   - Enter payment details (use test card if available)
   - Complete payment

5. **Verify Redirect:**
   - After payment, should redirect to: `https://app.orgatreeker.com/success`
   - Success page checks database
   - Should then redirect to: `https://app.orgatreeker.com/` (dashboard)

6. **Verify Access:**
   - You should see the **dashboard** (NOT pricing page)
   - User has full access to app features

### What Success Looks Like

```
✅ User completes payment on Dodo
✅ Redirected to /success page
✅ Success page finds subscription in database
✅ Redirected to dashboard (/)
✅ Dashboard loads (NOT pricing page)
✅ User can use all app features
```

---

## Step 6: Verify in Database

### Check Supabase Subscriptions Table

1. Go to: https://supabase.com/dashboard
2. Select project: `mxjbsxnmrlptfqgtbbmb`
3. Go to **Table Editor** → **subscriptions**

### Verify Subscription Entry

Should see a row with:
- **clerk_user_id**: `user_xxxxx` (matches your test user)
- **email**: Your test email
- **status**: `active`
- **plan**: `monthly` or `yearly`
- **subscription_id**: `sub_xxxxx`
- **created_at**: Recent timestamp

### If NO Entry in Database

This means webhook didn't save the subscription. Check:
1. Vercel logs for errors
2. `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
3. Webhook actually fired (check Dodo logs)

---

## Step 7: Final Verification Checklist

### Environment Variables
- [ ] All env vars added to Vercel Production
- [ ] `DODO_WEBHOOK_SECRET` matches Dodo dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `DEFAULT_RETURN_URL` = `https://app.orgatreeker.com/success`

### Deployment
- [ ] Vercel deployment successful
- [ ] Status = "Ready"
- [ ] Domain = `app.orgatreeker.com`

### Webhook Configuration
- [ ] Webhook URL = `https://app.orgatreeker.com/webhook`
- [ ] Signing secret matches
- [ ] Events enabled
- [ ] Test webhook returns 200 OK

### Database
- [ ] Subscription appears in Supabase
- [ ] Status = "active"
- [ ] Correct user email and plan

### User Experience
- [ ] User can complete payment
- [ ] Redirected to /success
- [ ] Then redirected to dashboard
- [ ] Dashboard loads (NOT pricing page)
- [ ] User has full access

---

## 🐛 Troubleshooting

### Issue: Webhook Returns 404

**Problem:** URL is wrong

**Fix:**
- Use `https://app.orgatreeker.com/webhook` (with `app.` subdomain)
- NOT `https://orgatreeker.com/webhook`

### Issue: Webhook Returns 401/403

**Problem:** Signature verification failed

**Fix:**
1. Check `DODO_WEBHOOK_SECRET` in Vercel = `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
2. Redeploy Vercel
3. Test again

### Issue: Webhook Returns 200 But User Still Sees Pricing

**Problem:** Subscription not saving to database

**Fix:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is in Vercel
2. Check Vercel function logs for database errors
3. Verify Supabase subscriptions table exists
4. Manually check database for subscription entry

### Issue: User Not Redirected After Payment

**Problem:** Wrong return URL

**Fix:**
1. Check `DEFAULT_RETURN_URL` in Vercel = `https://app.orgatreeker.com/success`
2. Redeploy
3. Try payment again

### Issue: "Deployment Not Found" Error

**Problem:** Domain mismatch

**Fix:**
- Ensure webhook uses `app.orgatreeker.com` (your Vercel deployment domain)
- Check Vercel domain settings

---

## 📊 How to Monitor Production

### Vercel Logs
- Vercel → Your Project → **Logs**
- Filter by `/webhook` to see webhook events
- Filter by `/api/checkout` to see payment initiations

### Dodo Dashboard
- Dodo → Webhooks → **Logs**
- Shows all webhook deliveries
- Response codes and timing

### Supabase Database
- Table Editor → **subscriptions**
- See all active subscriptions
- Monitor new entries

### Clerk Users
- Clerk Dashboard → **Users**
- See authenticated users
- Match with subscriptions by email

---

## ✅ Success Criteria

Your system is **fully functional** when:

1. ✅ Test webhook from Dodo returns 200 OK
2. ✅ Vercel logs show "Subscription saved to database"
3. ✅ Supabase has subscription entry
4. ✅ User can complete payment on Dodo
5. ✅ User redirected to /success then dashboard
6. ✅ Dashboard loads (user does NOT see pricing)
7. ✅ User has full app access

**When all 7 are ✅ → You're production ready! 🎉**

---

## 📝 Quick Reference

**Webhook URL:** `https://app.orgatreeker.com/webhook`
**Signing Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
**Return URL:** `https://app.orgatreeker.com/success`
**Vercel Domain:** `app.orgatreeker.com`

---

## Need Help?

If something isn't working:
1. Check Vercel logs first
2. Check Dodo webhook logs
3. Verify environment variables
4. Check Supabase database
5. Review this checklist again

Common issues are usually:
- Missing/wrong environment variables
- Wrong webhook URL
- Deployment not complete
