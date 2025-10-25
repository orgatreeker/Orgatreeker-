# Webhook Testing Documentation

Complete guide to testing and verifying your Dodo Payments webhook integration.

## 📚 Documentation Files

### 🚀 Start Here
- **[QUICK_WEBHOOK_TEST.md](./QUICK_WEBHOOK_TEST.md)** - Fast 3-step testing guide (read this first!)

### 📖 Detailed Guides
- **[WEBHOOK_TESTING_GUIDE.md](./WEBHOOK_TESTING_GUIDE.md)** - Comprehensive testing and debugging guide
- **[DODO_SETUP_CHECKLIST.md](./DODO_SETUP_CHECKLIST.md)** - Complete setup and verification checklist

### 🛠 Tools
- **[test-webhook.js](./test-webhook.js)** - Node.js script to simulate webhook calls locally

## 🎯 Quick Start

### Option 1: Test via Dodo Dashboard (Recommended for Production)

1. Go to https://dodo.link/dashboard
2. Settings → Webhooks → Send Test Event
3. Choose `payment.succeeded`
4. Verify 200 OK response
5. Check database for new subscription

### Option 2: Test Locally (Recommended for Development)

1. Update email in `test-webhook.js`:
   ```javascript
   const USER_EMAIL = 'your-email@example.com';
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Run test:
   ```bash
   node test-webhook.js
   ```

4. Check output and database

## ✅ How to Know It's Working

After testing, verify:

1. ✅ Webhook returns **200 OK**
2. ✅ New row in `subscriptions` table
3. ✅ `status = 'active'` in database
4. ✅ User can access app without redirect to pricing
5. ✅ Logs show success messages

## 🔍 Quick Database Check

```sql
-- Check if subscription was created
SELECT
  email,
  status,
  plan,
  created_at,
  last_event_type
FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

## 📊 Monitoring & Logs

### Vercel Logs
- Dashboard: https://vercel.com/[your-project]/logs
- Filter: `/api/webhooks/dodo`
- Look for: `✅ payment.succeeded`

### Dodo Dashboard Logs
- Dashboard: https://dodo.link/dashboard
- Webhooks → Logs
- Look for: 200 responses

### Supabase Database
- Dashboard: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb
- Table Editor → subscriptions

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Check webhook secret matches |
| 500 Server Error | Check Vercel logs for details |
| No database entry | Check email matches Clerk account |
| Still redirected to pricing | Log out/in, verify service role key |

See full troubleshooting in [WEBHOOK_TESTING_GUIDE.md](./WEBHOOK_TESTING_GUIDE.md)

## 🎯 End-to-End Test Flow

1. **New user signs up** → Redirected to pricing
2. **User selects plan** → Redirected to Dodo checkout
3. **User completes payment** → Dodo sends webhook
4. **Webhook received** → Subscription saved to database
5. **User redirected back** → Can access app
6. **Middleware checks** → Finds subscription, allows access

## 📞 Need Help?

1. Read [QUICK_WEBHOOK_TEST.md](./QUICK_WEBHOOK_TEST.md) for fast testing
2. Read [WEBHOOK_TESTING_GUIDE.md](./WEBHOOK_TESTING_GUIDE.md) for detailed guide
3. Check [DODO_SETUP_CHECKLIST.md](./DODO_SETUP_CHECKLIST.md) for configuration
4. Review Dodo Payments docs: https://docs.dodo.link/webhooks

## 🔐 Security Notes

- Never commit `.env` files with secrets
- Always use HTTPS for webhook endpoints
- Verify Svix signatures (already implemented)
- Keep service role key secret (server-side only)

## 📝 Manual Subscription Activation

If you need to manually activate a subscription for testing:

See [ACTIVATE_SUBSCRIPTION_NOW.sql](./ACTIVATE_SUBSCRIPTION_NOW.sql)

1. Get your Clerk user ID from Clerk dashboard
2. Update the SQL with your email and user ID
3. Run in Supabase SQL Editor
4. Log out and log back in

**Warning**: Only use this for testing. Real subscriptions should come from webhooks.

---

## 🎉 Success Checklist

Your integration is complete when:

- [x] Webhook endpoint configured in Dodo
- [x] Environment variables set in Vercel
- [x] Database schema deployed
- [x] Test webhook returns 200 OK
- [x] Subscription appears in database
- [x] User can access app after payment
- [x] Middleware properly protects routes
- [x] Logs show no errors

---

**Last Updated**: $(date +%Y-%m-%d)
**Project**: Orgatreeker Web App
**Webhook URL**: https://app.orgatreeker.com/api/webhooks/dodo
