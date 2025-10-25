# Webhook Production Setup - app.orgatreeker.com

## ✅ Current Configuration

Your webhook URL is correctly set to:
```
https://app.orgatreeker.com/api/webhooks/dodo
```

---

## 🔑 Required Environment Variables

Make sure these are set in **Vercel Production Environment**:

### 1. Webhook Secret
```
DODO_WEBHOOK_SECRET=whsec_YvVgD3N4iqHgNoxWqe6VMQs5NJKv6Ukk
```
**Important:** This must match EXACTLY what's in your Dodo Payments dashboard.

### 2. Return URL
```
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success
```

### 3. Production Domain (Optional but Recommended)
```
NEXT_PUBLIC_APP_URL=https://app.orgatreeker.com
```

---

## 🎯 How to Verify Webhook is Working

### Step 1: Check Vercel Environment Variables
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify:
   - ✅ `DODO_WEBHOOK_SECRET` is set
   - ✅ `DEFAULT_RETURN_URL` is set
   - ✅ `NEXT_PUBLIC_APP_URL` is set (optional)

### Step 2: Test a Payment
1. Go to: https://app.orgatreeker.com/pricing
2. Select a plan (monthly or yearly)
3. Complete payment in test mode
4. You should be redirected to: https://app.orgatreeker.com/success
5. After 1-2 seconds, you should be redirected to the dashboard

### Step 3: Check Webhook Logs
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Functions" tab
4. Look for logs from `/api/webhooks/dodo`
5. You should see webhook events being processed

---

## 🐛 Troubleshooting

### Issue: Webhook Not Firing

**Symptoms:**
- Payment succeeds
- User redirected to success page
- But subscription doesn't activate

**Solutions:**

1. **Check Webhook URL in Dodo Dashboard**
   - Go to Dodo Payments Dashboard
   - Settings → Webhooks
   - Verify URL is: `https://app.orgatreeker.com/api/webhooks/dodo`
   - Make sure it's enabled/active

2. **Check Webhook Secret**
   - In Dodo Dashboard, copy the webhook secret
   - Compare with Vercel environment variable
   - They must match exactly

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Project → Functions
   - Look for error messages
   - Check if webhook endpoint is being called

4. **Verify Domain is Public**
   - Test if `https://app.orgatreeker.com/api/webhooks/dodo` is accessible
   - It should return 200 OK (even if just for GET requests)

### Issue: "Invalid Signature" Error

**Solution:**
```
DODO_WEBHOOK_SECRET in Vercel ≠ Secret in Dodo Dashboard
```

1. Go to Dodo Dashboard → Settings → Webhooks
2. Copy the webhook secret
3. Go to Vercel → Settings → Environment Variables
4. Update `DODO_WEBHOOK_SECRET` to match exactly
5. Redeploy if needed

### Issue: Redirect Goes to Localhost

**Solution:**
This should already be fixed in the latest code. The checkout API now uses:
```typescript
return_url: "https://app.orgatreeker.com/success"
```

If it's still happening:
1. Check Vercel deployment logs
2. Verify latest code is deployed
3. Hard refresh browser (Ctrl+Shift+R)

---

## 📋 Webhook Events Received

Your webhook handles these Dodo events:

### Payment Events
- ✅ `payment.succeeded` - Payment completed successfully
- ⚠️ `payment.failed` - Payment failed (logged only)

### Subscription Events
- ✅ `subscription.active` - Subscription activated
- ✅ `subscription.renewed` - Subscription renewed
- ⚠️ `subscription.cancelled` - Subscription cancelled
- ⚠️ `subscription.failed` - Subscription payment failed
- ⚠️ `subscription.expired` - Subscription expired

### Other Events
- ℹ️ `refund.succeeded` - Refund completed
- ℹ️ `refund.failed` - Refund failed
- ℹ️ `dispute.*` - Various dispute events

---

## 🔒 Security

### Webhook Signature Verification
- ✅ All webhooks are verified using Svix signatures
- ✅ Only legitimate webhooks from Dodo are processed
- ✅ Invalid signatures return 400 error

### Database Updates
- ✅ Subscription status saved to Supabase database
- ✅ User metadata updated in Clerk
- ✅ Double-write for reliability

---

## 📊 Webhook Flow

```
User pays on Dodo
    ↓
Dodo sends webhook to https://app.orgatreeker.com/api/webhooks/dodo
    ↓
Webhook verifies signature with DODO_WEBHOOK_SECRET
    ↓
Update Supabase database (subscriptions table)
    ↓
Update Clerk user metadata (publicMetadata.subscription)
    ↓
Return 200 OK to Dodo
    ↓
User redirected to /success page
    ↓
Success page checks database
    ↓
User redirected to dashboard
```

---

## ✅ Checklist

- [ ] `DODO_WEBHOOK_SECRET` set in Vercel
- [ ] `DEFAULT_RETURN_URL` set in Vercel
- [ ] Webhook URL configured in Dodo Dashboard
- [ ] Test payment completes successfully
- [ ] Webhook appears in Vercel logs
- [ ] Subscription saved to database
- [ ] User can access dashboard after payment

---

## 🎉 Success Indicators

If everything is working:
1. ✅ Payment completes on Dodo
2. ✅ User redirected to `https://app.orgatreeker.com/success`
3. ✅ Success page shows "Processing Your Payment..."
4. ✅ After 1-2 seconds, redirects to dashboard
5. ✅ User has access to all app features
6. ✅ Database shows active subscription
7. ✅ Vercel logs show webhook events

---

## 🆘 Need Help?

If webhook is still not working:
1. Check Vercel function logs for detailed error messages
2. Verify webhook URL is accessible: `curl https://app.orgatreeker.com/api/webhooks/dodo`
3. Test with Dodo's webhook testing tool (if available)
4. Contact Dodo Payments support for webhook delivery status
