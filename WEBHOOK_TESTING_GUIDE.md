# Dodo Payments Webhook Testing Guide

This guide will help you test and verify that your subscription webhooks are working correctly.

## 🔍 Step 1: Verify Webhook Configuration in Dodo Dashboard

1. **Log in to Dodo Payments Dashboard**
   - Go to: https://dodo.link/dashboard
   - Navigate to Settings → Webhooks

2. **Check Webhook Endpoint URL**
   - Your webhook URL should be: `https://app.orgatreeker.com/api/webhooks/dodo`
   - Make sure it's using HTTPS (not HTTP)
   - Verify the URL is correct (no typos)

3. **Check Webhook Events**
   - Ensure these events are enabled:
     - ✅ `payment.succeeded`
     - ✅ `subscription.active`
     - ✅ `subscription.renewed`
     - ✅ `subscription.cancelled`
     - ✅ `subscription.failed`
     - ✅ `subscription.expired`

4. **Verify Webhook Secret**
   - The webhook secret in Dodo dashboard should match: `DODO_WEBHOOK_SECRET` in your `.env.production`
   - Current secret starts with: `whsec_ko62zyrTktRwLxwxL+au...`

## 🧪 Step 2: Test Using Dodo Dashboard

### Option A: Use Dodo's Built-in Webhook Testing

1. In Dodo Dashboard → Webhooks
2. Look for "Test Webhook" or "Send Test Event" button
3. Select event type: `payment.succeeded`
4. Click "Send Test Event"
5. Check the response (should be 200 OK)

### Option B: Make a Real Test Payment

1. **Create a test payment link** in Dodo dashboard
2. Use test card details (if in test mode):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
3. Complete the payment
4. Webhook should fire automatically

## 📊 Step 3: Monitor Webhook Delivery

### Check Dodo Dashboard Webhook Logs

1. Go to Dodo Dashboard → Webhooks → Logs
2. Look for recent webhook deliveries
3. Check for:
   - ✅ **200 response** = Success
   - ❌ **4xx/5xx response** = Error

### What to look for in logs:

- **Event ID**: Unique identifier for each webhook
- **Event Type**: e.g., `payment.succeeded`
- **Response Code**: Should be `200`
- **Response Time**: Should be < 5 seconds
- **Retry Count**: Should be 0 (no retries needed)

## 🔍 Step 4: Verify Database Changes

After webhook is triggered, verify the subscription was saved:

### Check Supabase Database

1. Go to Supabase Dashboard → Table Editor
2. Open `subscriptions` table
3. You should see a new row with:
   - `clerk_user_id`: Your Clerk user ID
   - `email`: Your email address
   - `status`: `active`
   - `plan`: `monthly` or `yearly`
   - `subscription_id`: From Dodo
   - `last_event_type`: `payment.succeeded` or `subscription.active`

### SQL Query to Check:

```sql
SELECT * FROM subscriptions
WHERE email = 'YOUR_EMAIL@example.com'
ORDER BY created_at DESC;
```

## 🐛 Step 5: Debug Issues

### Issue: Webhook Returns 400 "Missing webhook headers"

**Cause**: Svix headers not being sent by Dodo

**Fix**: Check Dodo is sending:
- `svix-id`
- `svix-timestamp`
- `svix-signature`

### Issue: Webhook Returns 400 "Invalid signature"

**Cause**: Webhook secret mismatch

**Fix**:
1. Get the webhook secret from Dodo dashboard
2. Update `DODO_WEBHOOK_SECRET` in Vercel environment variables
3. Redeploy the app

### Issue: Webhook Returns 200 but no database entry

**Cause**: Email doesn't match any Clerk user

**Fix**:
1. Check the email in webhook payload matches your Clerk account email
2. Check Vercel logs for "No Clerk user found for email" message

### Issue: Database entry created but middleware still redirects

**Cause**: Database not being checked properly or RLS policy blocking access

**Fix**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Check the `hasActiveSubscription()` function is being called
3. Try logging out and back in to refresh session

## 📝 Step 6: Check Application Logs

### View Vercel Logs:

1. Go to Vercel Dashboard
2. Select your project (orgatreeker)
3. Click "Logs" tab
4. Filter by:
   - Function: `/api/webhooks/dodo`
   - Time: Last 1 hour

### Look for these log messages:

✅ **Success indicators:**
```
✅ payment.succeeded
✅ Updated subscription for user user_xxxxx in both Clerk and Database
💾 ===== UPSERTING SUBSCRIPTION TO DATABASE =====
✅ Subscription upserted successfully!
```

❌ **Error indicators:**
```
❌ Error updating user subscription
❌ Error upserting subscription
Missing Svix headers
Webhook signature verification failed
No Clerk user found for email
```

## 🎯 Step 7: End-to-End Test Checklist

Use this checklist to verify everything works:

- [ ] Webhook URL configured in Dodo dashboard
- [ ] Webhook secret matches between Dodo and Vercel env vars
- [ ] Test webhook sent from Dodo dashboard returns 200
- [ ] Subscription row appears in Supabase `subscriptions` table
- [ ] Subscription has `status = 'active'`
- [ ] User can access protected routes (`/`, `/dashboard`, etc.)
- [ ] No redirect to `/pricing` page
- [ ] Vercel logs show successful webhook processing
- [ ] Clerk metadata also updated (check in Clerk dashboard)

## 🚨 Common Mistakes

1. **Wrong webhook URL** - Using `localhost` instead of production URL
2. **HTTP instead of HTTPS** - Webhooks must use HTTPS
3. **Wrong environment** - Testing in dev but webhook secret is for production
4. **Email mismatch** - Payment email doesn't match Clerk account email
5. **Missing env vars** - Forgot to set env vars in Vercel after local testing
6. **Not redeployed** - Changed env vars but didn't redeploy

## 🔧 Manual Testing Script

If you want to test locally, use the `test-webhook.js` script (see separate file).

## 📞 Need Help?

If webhooks still aren't working after following this guide:

1. Check Dodo Payments documentation: https://docs.dodo.link/webhooks
2. Contact Dodo support with:
   - Your webhook endpoint URL
   - Event type you're testing
   - Error response from your server
3. Check Vercel logs for detailed error messages
