# 🔔 Webhook Configuration Guide

## 📍 Webhook Endpoints

Your app supports webhooks from Dodo Payments for handling subscription and payment events.

### **Production Webhook (PRIMARY - USE THIS)**

For production use when your app is deployed.

```
Webhook URL: https://app.orgatreeker.com/webhook
Signing Secret: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**Use this for:**
- ✅ Production deployment
- ✅ Real user payments
- ✅ Actual subscription management

### **Option 2: Svix Play (Testing & Development - OPTIONAL)**

Perfect for testing webhooks locally or debugging webhook payloads.

```
Webhook URL: https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/
Signing Secret: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**What is Svix Play?**
- A webhook testing playground provided by Svix
- Allows you to inspect and debug webhook payloads
- Can forward webhooks to your local development server
- Perfect for development and troubleshooting

**How to Use:**
1. Go to: https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/
2. Configure Dodo to send webhooks to this URL
3. View incoming webhooks in the Svix Play dashboard
4. See headers, payload, and signatures in real-time
5. Forward to your local dev server for testing

---

## 🔑 Webhook Signing Secret

The signing secret is used to verify that webhooks are genuinely from Dodo Payments:

```
whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**This secret must be:**
- Set in `.env.local` for local development
- Set in Vercel environment variables for production
- Kept private and never committed to git

---

## 🎯 Webhook Events Handled

Your app handles these Dodo Payments events:

### **Payment Events**
| Event | Description | What App Does |
|-------|-------------|---------------|
| `payment.succeeded` | Payment completed successfully | Create/activate subscription |
| `payment.failed` | Payment failed or declined | Mark subscription as failed |

### **Subscription Events**
| Event | Description | What App Does |
|-------|-------------|---------------|
| `subscription.active` | Subscription is now active | Activate user access |
| `subscription.renewed` | Subscription renewed (monthly/yearly) | Keep subscription active |
| `subscription.cancelled` | User cancelled subscription | Mark as cancelled |
| `subscription.expired` | Subscription expired | Deactivate user access |
| `subscription.plan_changed` | User changed plan (monthly ↔ yearly) | Update plan type |
| `subscription.on_hold` | Subscription on hold | Log event |

### **Other Events**
| Event | Description | What App Does |
|-------|-------------|---------------|
| `refund.succeeded` | Refund processed | Log event |
| `refund.failed` | Refund failed | Log event |
| `dispute.opened` | Chargeback dispute opened | Log event |
| `dispute.won` | Won dispute | Log event |
| `dispute.lost` | Lost dispute | Log event |
| `license_key.created` | License key generated | Log event |

---

## 📊 Webhook Payload Structure

Example of what Dodo sends:

```json
{
  "type": "payment.succeeded",
  "event_id": "evt_abc123xyz",
  "timestamp": "2025-10-26T00:11:31.032588Z",
  "data": {
    "payload_type": "Payment",
    "payment_id": "pay_PHKTHZitt26gUh45pD5Ot",
    "subscription_id": "sub_X1byuJ5wNDOAxvgOsoq27",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "checkout_session_id": "cks_AiJ30J8fomaxrFmuO6Khm",
    "total_amount": 683,
    "currency": "INR",
    "status": "succeeded",
    "customer": {
      "customer_id": "cus_CflgPNCdTo8YOKP94evKe",
      "email": "user@example.com",
      "name": "John Doe",
      "phone_number": null
    },
    "billing": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "IN",
      "zipcode": "400001"
    },
    "card_last_four": "0166",
    "card_network": "VISA",
    "card_type": "DEBIT",
    "created_at": "2025-10-25T18:40:51.280886Z"
  }
}
```

---

## 🔒 Webhook Security

### **Signature Verification**

Every webhook from Dodo includes these headers:

```
webhook-id: msg_34ZOaaHjvGIw1SBsS9TiIQFQqz9
webhook-timestamp: 1761417697
webhook-signature: v1,ywgf/myqTILd0aSvW4U4yr3m12+zX8pNexOy9j+PXOA=
```

Your app:
1. Reads these headers
2. Maps them to Svix format (`svix-id`, `svix-timestamp`, `svix-signature`)
3. Uses the Svix library to verify the signature
4. Only processes verified webhooks

**If signature verification fails:**
- Webhook is rejected with 400 error
- Event is logged for debugging
- Protects against fake/malicious webhooks

---

## 🧪 Testing Webhooks

### **Using Svix Play:**

1. **Go to Svix Play:**
   ```
   https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/
   ```

2. **Configure Dodo:**
   - Dodo Dashboard → Settings → Webhooks
   - Add endpoint: `https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/`
   - Signing secret: `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

3. **Send Test Event:**
   - In Dodo dashboard, click "Send Test Event"
   - Select `payment.succeeded`
   - Click Send

4. **View in Svix Play:**
   - See the webhook payload in real-time
   - Inspect headers and signature
   - Debug any issues

### **Testing Locally:**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Update `.env.local`:**
   ```bash
   DODO_WEBHOOK_SECRET=whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
   ```

3. **Use test script:**
   ```bash
   # Edit test-webhook.js - set your email
   node test-webhook.js
   ```

4. **Expected output:**
   ```
   ✅ Webhook sent successfully!
   ✅ Subscription saved to database
   ```

---

## 📝 Environment Variables

### **Local Development (`.env.local`):**

```bash
DODO_WEBHOOK_SECRET=whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

### **Production (Vercel):**

```bash
DODO_WEBHOOK_SECRET=whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
```

**IMPORTANT:** This must match in both places!

---

## 🗺️ Webhook Flow

```
User pays $6.83 on Dodo
        ↓
Dodo processes payment ✅
        ↓
Dodo sends webhook to:
  - Svix Play (testing): https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/
  - OR Production: https://app.orgatreeker.com/webhook
        ↓
Webhook receives:
  - Headers: webhook-id, webhook-timestamp, webhook-signature
  - Body: { type: "payment.succeeded", customer: {...}, ... }
        ↓
Your app verifies signature using: whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d
        ↓
✅ Signature matches! (Authentic webhook)
        ↓
Extract customer email from payload
        ↓
Find user in Clerk by email
        ↓
Save subscription to Supabase:
  - clerk_user_id: "user_abc123"
  - email: "user@example.com"
  - status: "active"
  - plan: "monthly" or "yearly"
        ↓
Return 200 OK to Dodo
        ↓
✅ User now has active subscription!
        ↓
User can access dashboard 🎉
```

---

## 🐛 Troubleshooting

### **Webhook Not Receiving Events:**
- Check URL is correct in Dodo dashboard
- Verify signing secret matches
- Check Vercel deployment is live
- Review Dodo webhook logs for delivery attempts

### **Signature Verification Fails:**
- Ensure `DODO_WEBHOOK_SECRET` matches in Vercel
- Check for extra spaces or characters in secret
- Verify secret is from the correct webhook endpoint
- Redeploy after changing environment variables

### **Subscription Not Saving:**
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Review Vercel function logs for errors
- Verify Supabase RLS policies allow service role access
- Check database connection

### **404 Not Found:**
- Wrong URL! Use `https://app.orgatreeker.com/webhook`
- NOT `orgatreeker.com` (missing `app.` subdomain)
- Ensure route is deployed on Vercel

---

## 📚 Related Documentation

- [HOW_IT_WORKS.md](HOW_IT_WORKS.md) - Complete app architecture
- [WEBHOOKS_EXPLAINED.md](WEBHOOKS_EXPLAINED.md) - What are webhooks?
- [NEW_WEBHOOK_SETUP.md](NEW_WEBHOOK_SETUP.md) - Setup instructions
- [QUICK_SETUP.md](QUICK_SETUP.md) - Quick checklist

---

## ✅ Quick Reference

**Svix Play URL:** `https://play.svix.com/in/e_OxgBBYUmNx8XOCqDfBPBU9KDtSR/`
**Production URL:** `https://app.orgatreeker.com/webhook`
**Signing Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`
**Webhook Handler:** `app/webhook/route.ts` → `app/api/webhooks/dodo/route.ts`
