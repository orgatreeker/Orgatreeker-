# 🔔 What is a Webhook? (Simple Explanation)

## 📱 Real-Life Analogy

Imagine you ordered food on Uber Eats:

```
You order pizza → Pay with card → Go back to watching TV
                                        ↓
                        (10 minutes later)
                                        ↓
                    📱 DING! Notification:
                    "Your pizza is ready!"
                                        ↓
                You didn't keep checking the app
                The app TOLD YOU when it was ready
```

**That notification is like a webhook!**

---

## 🌐 In Web Development

### **Without Webhooks** (Bad Way):
```
Your App: "Hey Dodo, did the user pay yet?"
Dodo: "No"

Your App: "How about now?"
Dodo: "No"

Your App: "Now?"
Dodo: "No"

Your App: "NOW??"
Dodo: "No"

Your App: "PLEASE TELL ME NOW??"
Dodo: "Yes! They paid 5 minutes ago"
Your App: "Why didn't you tell me?!"
```

This is called **polling** - constantly asking if something happened. It's:
- Slow ❌
- Wastes resources ❌
- Annoying ❌

### **With Webhooks** (Good Way):
```
Your App: "Hey Dodo, call this number when user pays:
          https://app.orgatreeker.com/api/webhooks/dodo"
Dodo: "Got it!"

(Your app goes about its business...)

                    USER PAYS!
                        ↓
Dodo: 📞 "Ring ring! User just paid $6.83!"
Your App: "Thanks! Saving subscription now..."
```

This is **instant**, **efficient**, and **automatic**! ✅

---

## 🎯 Your Specific Webhook

### **What Webhook Service Are You Using?**

You're using **2 services together**:

1. **Dodo Payments** - The payment processor
   - Website: https://dodo.link
   - This is who charges your customers
   - They SEND the webhooks

2. **Svix** - The webhook delivery system
   - Built into Dodo Payments
   - Handles signing and verifying webhooks
   - Makes webhooks secure

**Think of it like:**
- Dodo = The pizza restaurant
- Svix = The delivery driver who brings the notification

---

## 🔧 How Your Webhook Works

### **Step-by-Step Process:**

```
┌─────────────────────────────────────────────────┐
│  1. USER PAYS                                   │
│     User enters card on Dodo checkout page      │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  2. DODO PROCESSES PAYMENT                      │
│     Charges card: $6.83                         │
│     Payment Status: ✅ Success                  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  3. DODO PREPARES WEBHOOK                       │
│     Creates JSON message with:                  │
│     - type: "payment.succeeded"                 │
│     - customer email                            │
│     - payment ID                                │
│     - product ID                                │
│     - amount: 6.83                              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  4. SVIX SIGNS THE MESSAGE                      │
│     Creates cryptographic signature             │
│     (Like a tamper-proof seal)                  │
│     Uses: DODO_WEBHOOK_SECRET                   │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  5. DODO SENDS HTTP POST REQUEST                │
│     URL: https://app.orgatreeker.com/api/       │
│          webhooks/dodo                          │
│     Headers:                                    │
│       - svix-id: msg_abc123                     │
│       - svix-timestamp: 1234567890              │
│       - svix-signature: v1,abc123xyz...         │
│     Body: { type: "payment.succeeded", ... }    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  6. YOUR WEBHOOK ENDPOINT RECEIVES IT           │
│     File: app/api/webhooks/dodo/route.ts        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  7. YOUR APP VERIFIES SIGNATURE                 │
│     Uses Svix library to check:                 │
│     "Is this really from Dodo?"                 │
│     "Has message been tampered with?"           │
│     Uses: DODO_WEBHOOK_SECRET                   │
│                                                 │
│     ✅ Signature matches → Continue             │
│     ❌ Signature wrong → Reject (security!)     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  8. YOUR APP PROCESSES THE PAYMENT              │
│     - Extracts email from webhook               │
│     - Finds user in Clerk by email              │
│     - Gets Clerk user ID                        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  9. YOUR APP SAVES TO DATABASE                  │
│     Saves to Supabase subscriptions table:      │
│     - clerk_user_id: "user_2abc123"             │
│     - email: "user@example.com"                 │
│     - status: "active"                          │
│     - plan: "monthly"                           │
│     - subscription_id: "sub_xyz789"             │
│     - payment_id: "pay_abc456"                  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  10. YOUR APP RESPONDS                          │
│      Returns: HTTP 200 OK                       │
│      Tells Dodo: "Got it, thanks!"              │
└─────────────────────────────────────────────────┘
                   ↓
            ✅ USER IS NOW SUBSCRIBED!
```

---

## 📝 The Actual Webhook Message

When a user pays $6.83 for monthly plan, Dodo sends this:

```json
{
  "type": "payment.succeeded",
  "event_id": "evt_abc123xyz789",
  "data": {
    "payment_id": "pay_xyz123",
    "subscription_id": "sub_456def",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "amount": 683,
    "currency": "USD",
    "customer": {
      "email": "john@example.com",
      "name": "John Doe"
    },
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Your webhook endpoint** receives this and:
1. Finds user `john@example.com` in Clerk
2. Saves subscription to database
3. User can now access dashboard!

---

## 🔐 Security: Why Signatures Matter

### **The Problem:**
Anyone could send a fake webhook to your app:

```
Hacker: "Hey app! User paid $6.83!" (Fake!)
Your App: "Cool, activating subscription..."
Hacker: "Free premium access! 😈"
```

### **The Solution: Signatures**

Dodo signs the webhook with a **secret key** that only you and Dodo know:

```
Dodo has: DODO_WEBHOOK_SECRET (kept secret)
You have: DODO_WEBHOOK_SECRET (in Vercel env vars)

Dodo creates signature:
  hash(message + secret) → "v1,abc123xyz789..."

Dodo sends:
  - Message
  - Signature

Your app verifies:
  hash(message + secret) → "v1,abc123xyz789..."
  Does it match? ✅ Real webhook!
  Doesn't match? ❌ Fake, reject it!
```

**This is why `DODO_WEBHOOK_SECRET` must be:**
- The SAME in Dodo and Vercel
- Kept SECRET (never share publicly)

---

## 🎭 Types of Events Your Webhook Handles

| Event Type | When It Happens | What Your App Does |
|-----------|----------------|-------------------|
| `payment.succeeded` | User paid successfully | Create/activate subscription |
| `payment.failed` | Payment declined | Mark subscription as failed |
| `subscription.active` | Subscription is active | Set status to active |
| `subscription.renewed` | Monthly/yearly renewal | Keep subscription active |
| `subscription.cancelled` | User cancelled | Mark as cancelled (still active until expiry) |
| `subscription.expired` | Subscription expired | Deactivate, redirect to pricing |
| `subscription.plan_changed` | User switched plans | Update plan (monthly ↔ yearly) |

---

## 🧪 Testing Your Webhook

You have a test script: `test-webhook.js`

**What it does:**
1. Creates a fake payment webhook message
2. Signs it with your webhook secret (like Dodo does)
3. Sends it to your local app
4. Tests if your webhook handler works

**How to use it:**

```bash
# 1. Start your local dev server
npm run dev

# 2. Edit test-webhook.js
# Change line 18: USER_EMAIL = 'your@email.com'

# 3. Run the test
node test-webhook.js
```

**Expected output:**
```
✅ Webhook sent successfully!
✅ Subscription saved to database
```

---

## 🗺️ Where Everything Is

### **Your Webhook Files:**

```
orgatreeker/
├── app/
│   └── api/
│       └── webhooks/
│           └── dodo/
│               └── route.ts          ← Main webhook handler
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Database connection
│   │   └── database.ts               ← upsertSubscription()
│   └── dodo.ts                       ← Dodo Payments client
│
├── test-webhook.js                   ← Test script
├── check-webhook-secret.js           ← Signature test
└── .env.local                        ← Secrets (local only)
```

### **Your Webhook URL:**

**Local Development:**
```
http://localhost:3000/api/webhooks/dodo
```

**Production (Vercel):**
```
https://app.orgatreeker.com/api/webhooks/dodo
```

This URL must be set in **Dodo Dashboard → Webhooks**

---

## ❓ Common Questions

### **Q: Who sends the webhook?**
**A:** Dodo Payments sends it automatically when payment events happen.

### **Q: When is the webhook sent?**
**A:** Immediately when:
- User pays
- Subscription renews
- User cancels
- Payment fails

### **Q: How fast is it?**
**A:** Usually within 1-2 seconds after payment.

### **Q: What if webhook fails?**
**A:** Dodo automatically retries:
- After 1 minute
- After 5 minutes
- After 30 minutes
- Up to 3 days

### **Q: Can I see webhook history?**
**A:** Yes! Go to:
- **Dodo Dashboard** → Webhooks → Logs
- **Vercel Dashboard** → Your Project → Logs → Filter by `/api/webhooks/dodo`

### **Q: What's the difference between Dodo and Svix?**
**A:**
- **Dodo** = Payment processor (charges cards)
- **Svix** = Webhook infrastructure (delivers notifications)
- Dodo uses Svix internally for webhooks

### **Q: Do I need to create a Svix account?**
**A:** No! Svix is built into Dodo. You only need:
- Dodo account
- Dodo webhook secret

---

## 🚨 Why Your Webhook Isn't Working

### **Problem:**
Webhook receives the event, but doesn't save to database.

### **Most Likely Cause:**
Missing `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

**Why?**
```javascript
// In your webhook (route.ts):
const client = supabaseAdmin || supabase

// supabaseAdmin needs SUPABASE_SERVICE_ROLE_KEY
// Without it, supabaseAdmin = null
// Falls back to supabase (anon key)
// Anon key has limited permissions
// Can't write to subscriptions table
// Subscription NOT saved ❌
```

**Fix:**
1. Copy `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`
2. Add to Vercel → Environment Variables
3. Redeploy
4. Test webhook again

---

## 🎯 Summary

**Webhook = Automatic notification from Dodo to your app**

**Your webhook:**
- URL: `https://app.orgatreeker.com/api/webhooks/dodo`
- Service: Dodo Payments (using Svix)
- Purpose: Tell your app when users pay
- Security: Signed with `DODO_WEBHOOK_SECRET`

**Flow:**
```
User pays → Dodo sends webhook → Your app saves subscription
         → User gets access to dashboard
```

**Current issue:**
```
User pays → Dodo sends webhook → App receives it → ❌ Can't save to DB
         → User stuck on pricing page
```

**Solution:**
Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel!

---

Hope this makes webhooks crystal clear! 🎯
