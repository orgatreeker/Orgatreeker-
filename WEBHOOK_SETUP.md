# Webhook Setup Guide

## The Problem: Webhooks Can't Reach Localhost

When developing locally on `http://localhost:3000`, Dodo Payments **cannot send webhooks** to your application because:
- Localhost is not accessible from the internet
- Webhooks are HTTP POST requests sent from Dodo's servers
- Your computer is behind a router/firewall

This means after a successful payment, the webhook that updates the user's subscription status in Clerk **will not fire**.

---

## Solutions

### Option 1: Manual Subscription Activation (Development Only)

For local testing, we've created a manual activation tool:

**Steps:**
1. After completing a payment on Dodo, you'll be redirected to `/success`
2. Open a new tab and go to: **http://localhost:3000/activate-subscription**
3. Click "Activate Subscription"
4. Your subscription will be set to active in Clerk
5. Refresh the app - you'll now have access to all features

**API Endpoints:**
- `POST /api/set-subscription` - Manually activate subscription
- `GET /api/set-subscription` - Check current subscription status

---

### Option 2: Use ngrok (Recommended for Testing Webhooks)

ngrok creates a public URL that tunnels to your localhost:

**Steps:**

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or via package manager
   npm install -g ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

4. **Update Dodo Payments webhook URL:**
   - Go to Dodo Payments Dashboard
   - Settings → Webhooks
   - Set webhook URL to: `https://abc123.ngrok.io/api/webhooks/dodo`
   - Save

5. **Test the payment flow:**
   - Complete a payment
   - Webhook will be delivered to your local app via ngrok
   - Subscription will be updated automatically

**Note:** ngrok URLs change each time you restart. You'll need to update the webhook URL in Dodo dashboard each time.

---

### Option 3: Production Deployment (Webhooks Work Automatically)

When deployed to a production environment (Vercel, Netlify, etc.), webhooks work out of the box:

1. **Deploy your app** to a production URL (e.g., `https://yourapp.vercel.app`)

2. **Configure Dodo webhook:**
   - Go to Dodo Payments Dashboard
   - Settings → Webhooks
   - Set webhook URL to: `https://yourapp.vercel.app/api/webhooks/dodo`
   - Save

3. **Test in production:**
   - Payments and subscriptions work automatically
   - No manual activation needed

---

## How the Subscription Flow Works

### Normal Flow (Production):
```
User pays → Dodo redirects to /success → Webhook fires → Updates Clerk → User has access
```

### Development Flow (Without ngrok):
```
User pays → Dodo redirects to /success → ❌ No webhook → User goes to /activate-subscription → Manually activate → User has access
```

### Development Flow (With ngrok):
```
User pays → Dodo redirects to /success → Webhook fires via ngrok → Updates Clerk → User has access
```

---

## Webhook Endpoint Details

**Endpoint:** `POST /api/webhooks/dodo`

**Events Handled:**
- `payment.succeeded` - Sets subscription to active
- `subscription.active` - Sets subscription to active
- `subscription.renewed` - Renews active subscription
- `subscription.cancelled` - Cancels subscription
- `subscription.expired` - Expires subscription
- `subscription.failed` - Marks subscription as failed

**What it does:**
1. Verifies webhook signature using Svix
2. Extracts user email from payment data
3. Finds Clerk user by email
4. Updates Clerk user's `publicMetadata.subscription` with:
   - `status` - active, cancelled, expired, etc.
   - `plan` - monthly or yearly
   - `subscriptionId` - Dodo subscription ID
   - `productId` - Dodo product ID
   - `updatedAt` - ISO timestamp

---

## Testing Checklist

### ✅ Local Testing (Manual Activation)
- [ ] User can sign up/sign in
- [ ] User sees pricing page
- [ ] User can click subscribe
- [ ] Payment redirects to Dodo
- [ ] After payment, redirects to `/success`
- [ ] User goes to `/activate-subscription`
- [ ] User clicks "Activate Subscription"
- [ ] User is redirected to home
- [ ] User can access dashboard/features
- [ ] User cannot see pricing page again

### ✅ Production Testing (Webhooks)
- [ ] Webhook URL configured in Dodo dashboard
- [ ] User completes payment
- [ ] Redirects to `/success`
- [ ] Success page detects subscription (usually within 1-3 seconds)
- [ ] Automatically redirects to home
- [ ] User has full access

---

## Troubleshooting

### Webhook Not Received
1. Check Dodo webhook logs in dashboard
2. Verify webhook URL is correct
3. Ensure URL is publicly accessible (not localhost)
4. Check for SSL/TLS errors

### Subscription Not Updating
1. Check server logs for webhook errors
2. Verify `DODO_WEBHOOK_SECRET` is correct
3. Check Clerk user exists with matching email
4. Verify Clerk API keys are correct

### User Still Sees Pricing Page
1. Hard refresh the page (Ctrl+Shift+R)
2. Check `/api/set-subscription` to see current status
3. Check Clerk dashboard for user metadata
4. Try signing out and back in

---

## Environment Variables Required

```env
# Dodo Payments
DODO_BEARER_TOKEN=your_bearer_token
DODO_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_DODO_PRODUCT_MONTHLY=pdt_monthly_id
NEXT_PUBLIC_DODO_PRODUCT_YEARLY=pdt_yearly_id

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# App Config
DEFAULT_RETURN_URL=http://localhost:3000/success  # Or production URL
```

---

## Additional Resources

- [Dodo Payments Webhooks Documentation](https://docs.dodopayments.com)
- [ngrok Documentation](https://ngrok.com/docs)
- [Clerk User Metadata](https://clerk.com/docs/users/metadata)
- [Svix Webhook Verification](https://docs.svix.com)
