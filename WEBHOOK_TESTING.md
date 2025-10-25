# Webhook Testing Guide for Dodo Payments

## Your Webhook Dashboard
You have access to the Svix webhook dashboard at:
**https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/**

This is where you can:
- View webhook delivery history
- See payload data
- Retry failed webhooks
- Test webhook endpoints

---

## Step 1: Verify Webhook Configuration

### Check Webhook Endpoint URL

Your webhook endpoint should be configured in Dodo Payments dashboard to point to:

**Production:**
```
https://app.orgatreeker.com/api/webhooks/dodo
```

**Development/Testing:**
```
https://your-vercel-preview.vercel.app/api/webhooks/dodo
```

### Verify Webhook Secret

The webhook secret in your environment variables should match the one in Dodo Payments dashboard.

**Current secret** (from `.env.production.example`):
```
DODO_WEBHOOK_SECRET=whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk
```

**⚠️ Important**: Make sure this exact value is set in:
- Vercel environment variables (for production)
- `.env.local` (for local testing)

---

## Step 2: Understanding Webhook Events

Your webhook handler supports these events:

### Payment Events
- `payment.succeeded` - One-time payment completed
- `payment.failed` - Payment failed

### Subscription Events
- `subscription.active` - New subscription activated
- `subscription.renewed` - Subscription renewed
- `subscription.cancelled` - User cancelled subscription
- `subscription.failed` - Subscription payment failed
- `subscription.expired` - Subscription expired

---

## Step 3: Test Webhook Delivery

### In Svix Dashboard

1. **Go to your dashboard**: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/

2. **Look for recent events**:
   - Click on any event to see details
   - Check the **Status** (should be 200 if successful)
   - View the **Payload** to see what data was sent
   - Check **Response** to see what your server returned

3. **Retry Failed Webhooks**:
   - If you see any failed webhooks (status 4xx or 5xx)
   - Click on the event
   - Click **Retry** button
   - This will resend the webhook to your endpoint

---

## Step 4: Expected Webhook Payload

### For `payment.succeeded` event:

```json
{
  "type": "payment.succeeded",
  "event_id": "evt_xxx",
  "data": {
    "payment_id": "pay_xxx",
    "subscription_id": "sub_xxx",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### For `subscription.active` event:

```json
{
  "type": "subscription.active",
  "event_id": "evt_xxx",
  "data": {
    "subscription_id": "sub_xxx",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## Step 5: Check Webhook Logs in Vercel

### Production Logs

1. Go to Vercel: https://vercel.com/dashboard
2. Click your project
3. Go to **Logs** tab
4. Filter by: `/api/webhooks/dodo`

### What to Look For

**✅ Success indicators:**
```
✅ payment.succeeded
✅ subscription.active
✅ Updated subscription for user user_xxx in both Clerk and Database
```

**❌ Error indicators:**
```
❌ Error updating user subscription
Missing Svix headers
Invalid signature
Webhook signature verification failed
```

---

## Step 6: Test End-to-End Flow

### Manual Test Process

1. **Make a test subscription** (use real or test payment)

2. **Check Svix Dashboard immediately**:
   - Go to: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/
   - You should see a new event within seconds
   - Status should be **200 OK**

3. **Check Vercel Logs**:
   - Should see: `✅ payment.succeeded` or `✅ subscription.active`
   - Should see: `✅ Updated subscription for user xxx in both Clerk and Database`

4. **Check Supabase Database**:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
   ```
   - Should see the new subscription record

5. **Check Clerk Dashboard**:
   - Go to Users → Find the user
   - Check Public Metadata
   - Should see `subscription` object with `status: "active"`

---

## Step 7: Troubleshooting Common Issues

### Issue 1: Webhook Returns 400/500 Error

**Check in Svix Dashboard:**
- Click the failed event
- Look at the error message in the response

**Common causes:**
- Missing Svix headers
- Invalid signature (wrong `DODO_WEBHOOK_SECRET`)
- Server error (check Vercel logs)

**Solution:**
1. Verify `DODO_WEBHOOK_SECRET` matches in Vercel
2. Redeploy if you changed environment variables
3. Check Vercel logs for detailed error

### Issue 2: Webhook Never Reaches Server

**Check:**
- Is the webhook URL correct in Dodo dashboard?
- Is your site deployed and accessible?
- Try accessing `https://app.orgatreeker.com/api/webhooks/dodo` directly (should return 405 Method Not Allowed, which is normal)

### Issue 3: Webhook Succeeds but Data Not Saved

**Check Vercel logs for:**
```
❌ Error updating user subscription
```

**Common causes:**
- Missing `SUPABASE_SERVICE_ROLE_KEY`
- Database table doesn't exist
- User not found in Clerk

**Solution:**
1. Create subscriptions table (see CHECK_SUPABASE.md)
2. Verify environment variables
3. Retry the webhook in Svix dashboard

### Issue 4: User Not Found in Clerk

**Error in logs:**
```
⚠️ No Clerk user found for email: user@example.com
```

**Cause:** User must sign up BEFORE subscribing

**Solution:**
1. Ensure user creates account first
2. Then they can subscribe
3. Webhook uses email to find the Clerk user

---

## Step 8: Test Webhook Locally (Development)

### Option 1: Use Svix CLI (Recommended)

```bash
# Install Svix CLI
npm install -g svix

# Forward webhooks to localhost
svix listen http://localhost:3000/api/webhooks/dodo
```

This will give you a temporary webhook URL to use in Dodo dashboard for testing.

### Option 2: Use ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose it
ngrok http 3000

# Use the ngrok URL in Dodo dashboard
# Example: https://abc123.ngrok.io/api/webhooks/dodo
```

### Option 3: Test with Production Data

Just use your production webhook URL and test with real payments. The Svix dashboard lets you retry webhooks, so you can test multiple times.

---

## Step 9: Verify Webhook is Working

### Quick Checklist

Run through this checklist:

- [ ] Webhook URL is configured in Dodo Payments dashboard
- [ ] `DODO_WEBHOOK_SECRET` matches between Dodo and Vercel
- [ ] Latest code is deployed to Vercel
- [ ] Subscriptions table exists in Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- [ ] Made a test subscription
- [ ] Webhook appears in Svix dashboard with 200 status
- [ ] Vercel logs show `✅ Updated subscription for user...`
- [ ] Subscription appears in Supabase database
- [ ] User can access protected routes without redirect

---

## Sample Webhook Test Responses

### Successful Response (200 OK)

**Request from Dodo:**
```json
{
  "type": "payment.succeeded",
  "data": {
    "customer": { "email": "test@example.com" },
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "payment_id": "pay_123"
  }
}
```

**Response from Your Server:**
```json
{
  "received": true
}
```

**Vercel Logs:**
```
✅ payment.succeeded { eventId: 'evt_123', payloadType: 'Payment', id: 'pay_123' }
✅ Updated subscription for user user_abc123 in both Clerk and Database: { status: 'active', plan: 'monthly', ... }
```

**Database Check:**
```sql
SELECT * FROM subscriptions WHERE email = 'test@example.com';
-- Should return 1 row with status = 'active'
```

---

## Next Steps

1. **Visit Svix Dashboard**: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/
   - Check recent webhook deliveries
   - Look for any failed webhooks
   - Retry any that failed

2. **If you see webhooks with 200 status**:
   - ✅ Webhook is working!
   - Check if data is in Supabase database
   - If not, check Vercel logs for errors

3. **If you see webhooks with error status**:
   - Click on the event to see error details
   - Fix the issue (usually env variables or table not existing)
   - Retry the webhook

4. **If you don't see any webhooks**:
   - Verify webhook URL in Dodo dashboard
   - Make a test payment to trigger a webhook
   - Check that your site is deployed and accessible

---

## Support Resources

- **Svix Dashboard**: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/
- **Vercel Logs**: https://vercel.com/dashboard → Your Project → Logs
- **Supabase SQL**: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql
- **Dodo Docs**: https://docs.dodopayments.com/webhooks

---

## Quick SQL Queries for Testing

### Check if subscription was created:
```sql
SELECT * FROM subscriptions
WHERE email = 'YOUR_TEST_EMAIL@example.com';
```

### See all recent subscriptions:
```sql
SELECT email, status, plan, created_at, last_event_type
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### Count subscriptions by status:
```sql
SELECT status, COUNT(*)
FROM subscriptions
GROUP BY status;
```

---

## Summary

✅ **Webhook URL**: https://app.orgatreeker.com/api/webhooks/dodo
✅ **Svix Dashboard**: https://play.svix.com/in/e_qeIjwT2ljUm9zRT2uKx37774elA/
✅ **What to check**: 200 status in Svix + data in Supabase
✅ **If failed**: Retry in Svix after fixing issues

**The webhook system is ready - you just need to:**
1. Create the subscriptions table in Supabase
2. Deploy your code to production
3. Test with a real subscription
