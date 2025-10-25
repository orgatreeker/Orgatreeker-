# Quick Webhook Testing - One Page Guide

## 🚀 Fastest Way to Test (3 Steps)

### Step 1: Get Your Info

You need:
- Your Clerk account email
- Your production URL: `https://app.orgatreeker.com`

### Step 2: Test Using Dodo Dashboard

1. Go to https://dodo.link/dashboard
2. Navigate to **Settings** → **Webhooks**
3. Find your webhook endpoint
4. Click **"Send Test Event"** or **"Test Webhook"**
5. Select event type: **payment.succeeded**
6. Click **Send**

**Expected result**: ✅ 200 OK response

### Step 3: Verify It Worked

Open Supabase and run:

```sql
SELECT * FROM subscriptions
ORDER BY created_at DESC
LIMIT 1;
```

**Expected result**: New row with your email and `status = 'active'`

---

## 🧪 Alternative: Local Testing

### Quick Local Test (Node.js script)

1. **Edit the test file**
   ```bash
   # Open test-webhook.js
   # Change line: USER_EMAIL = 'YOUR_EMAIL@example.com'
   # To your actual email that matches your Clerk account
   ```

2. **Start your dev server**
   ```bash
   npm run dev
   ```

3. **Run the test**
   ```bash
   node test-webhook.js
   ```

**Expected output**:
```
✅ Webhook sent successfully!
Response Status: 200 OK
```

### Using curl (Manual)

If you want to send a raw request:

```bash
curl -X POST http://localhost:3000/api/webhooks/dodo \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_test_123" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,test" \
  -d '{
    "type": "payment.succeeded",
    "event_id": "evt_test_123",
    "data": {
      "payload_type": "Payment",
      "payment_id": "pay_test_123",
      "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
      "customer": {
        "email": "YOUR_EMAIL@example.com"
      }
    }
  }'
```

**Note**: This will fail signature verification. Use the Node.js script instead for proper testing.

---

## 🔍 How to Know It's Working

### ✅ Success Indicators

1. **Webhook Response**: 200 OK
2. **Vercel Logs** show:
   ```
   ✅ payment.succeeded
   ✅ Updated subscription for user user_xxxxx
   ✅ Subscription upserted successfully!
   ```
3. **Database** has new row in `subscriptions` table
4. **App Access**: You can access `/` without redirect to pricing

### ❌ Failure Indicators

1. **400 Bad Request**: Missing headers or invalid signature
2. **500 Server Error**: Database or API error
3. **No database entry**: Email mismatch or RLS issue
4. **Still redirected**: Middleware not finding subscription

---

## 🐛 Quick Fixes

### Problem: "Missing webhook headers"

**Fix**: Make sure you're using the Dodo dashboard test or the Node.js script. Don't use raw curl without proper Svix headers.

### Problem: "Invalid signature"

**Fix**:
```bash
# Check webhook secret matches in both places
# Dodo Dashboard → Settings → Webhooks → Secret
# Should match DODO_WEBHOOK_SECRET in Vercel env vars
```

### Problem: "No Clerk user found for email"

**Fix**: Make sure:
- Email in webhook matches your Clerk account email exactly
- User exists in Clerk before sending webhook
- Email is verified in Clerk (if verification enabled)

### Problem: "Database entry created but still redirected"

**Fix**:
1. Log out and log back in
2. Clear browser cookies
3. Check Vercel has `SUPABASE_SERVICE_ROLE_KEY` set
4. Redeploy app after setting env vars

---

## 📊 Monitoring Dashboard URLs

Quick links to check logs:

1. **Vercel Logs**
   - https://vercel.com/[your-project]/logs
   - Filter: `/api/webhooks/dodo`

2. **Dodo Webhook Logs**
   - https://dodo.link/dashboard
   - Settings → Webhooks → Logs

3. **Supabase Database**
   - https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb
   - Table Editor → subscriptions

---

## ✅ 30-Second Verification

Run this to verify everything:

```bash
# 1. Check env vars are set (Vercel dashboard)
# 2. Send test webhook from Dodo dashboard
# 3. Check Vercel logs for success message
# 4. Run this SQL:

SELECT
  email,
  status,
  plan,
  created_at,
  last_event_type
FROM subscriptions
WHERE email = 'YOUR_EMAIL@example.com';

# 5. Log into app and try accessing /
```

If all these work → **You're done! ✅**

---

## 🎯 Real Payment Test

When you're ready to test with a real payment:

1. **Go to pricing page**: https://app.orgatreeker.com/pricing
2. **Click Subscribe** on Monthly or Yearly plan
3. **Complete payment** with Dodo Payments
4. **Wait 2-3 seconds** for webhook
5. **Check you were redirected** to `/success`
6. **Try accessing app** at `/` - should work!

---

## 📞 Still Having Issues?

Check the full guide: `WEBHOOK_TESTING_GUIDE.md`

Or verify configuration: `DODO_SETUP_CHECKLIST.md`
