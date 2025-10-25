# Fix Webhook Signature Verification Error

## 🔴 Error You're Seeing

```
Webhook signature verification failed
Secret: whsec_ko62zyrTktRwLxwxL+au3X2NOk0E6Iqe
```

This means the webhook secret in Vercel doesn't match the secret Dodo Payments is using.

## ✅ Quick Fix (5 Steps)

### Step 1: Get the Correct Secret from Dodo Dashboard

1. Go to https://dodo.link/dashboard
2. Click **Settings** → **Webhooks**
3. Find your webhook endpoint: `https://app.orgatreeker.com/api/webhooks/dodo`
4. Look for **"Signing Secret"** or **"Webhook Secret"**
5. Copy the FULL secret (starts with `whsec_`)

**IMPORTANT**: Make sure you're copying from the PRODUCTION webhook, not test/development!

### Step 2: Update Vercel Environment Variables

1. Go to https://vercel.com (your dashboard)
2. Select your project: **Orgatreeker**
3. Click **Settings** → **Environment Variables**
4. Find `DODO_WEBHOOK_SECRET`
5. Click **Edit** (pencil icon)
6. Paste the NEW secret from Dodo dashboard
7. Make sure it's set for **Production** environment
8. Click **Save**

### Step 3: Redeploy Your App

**CRITICAL**: Changing environment variables doesn't auto-update your app!

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. OR push a small change to trigger redeploy

### Step 4: Test Again

After redeployment completes (2-3 minutes):

1. Go back to Dodo Dashboard → Webhooks
2. Click **Send Test Event**
3. Select `payment.succeeded`
4. Click **Send**

Should now return: ✅ **200 OK**

### Step 5: Verify It Worked

Check Vercel logs:
1. Vercel → Your Project → Logs
2. Filter: `/api/webhooks/dodo`
3. Look for: `✅ payment.succeeded` (no signature errors)

---

## 🔍 Detailed Troubleshooting

### Issue 1: Secret Has Extra Characters

**Symptom**: Secret looks like `whsec_ko62zyrTktRwLxwxL+au3X2NOk0E6Iqe`

**Fix**:
- Copy the secret again from Dodo
- Make sure you don't accidentally copy extra spaces or newlines
- The secret should be one continuous string

### Issue 2: Wrong Environment

**Symptom**: Works locally but fails in production

**Fix**:
- Make sure `DODO_WEBHOOK_SECRET` is set in Vercel for **Production** environment
- NOT just "Development" or "Preview"
- Select "Production" when setting the env var

### Issue 3: Multiple Webhook Endpoints

**Symptom**: You have multiple webhooks in Dodo dashboard

**Fix**:
- Find the webhook for `https://app.orgatreeker.com/api/webhooks/dodo`
- Use THAT webhook's secret (not localhost or other URLs)
- Each webhook endpoint has its own unique secret

### Issue 4: Test vs Production Mode

**Symptom**: Different secrets for test vs production

**Fix**:
- Check if Dodo is in "Test Mode" or "Live Mode"
- Make sure you're using the secret from the same mode
- Production app should use Live Mode secret

---

## 🧪 Test Secret Locally First

To verify the secret works before updating Vercel:

1. Update `.env.local`:
   ```
   DODO_WEBHOOK_SECRET=whsec_YOUR_NEW_SECRET_HERE
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Run test script:
   ```bash
   node test-webhook.js
   ```

4. If this works locally, update Vercel with the same secret

---

## 📋 Verification Checklist

After fixing, verify all these are true:

- [ ] Secret copied from Dodo Dashboard → Webhooks → Signing Secret
- [ ] Secret pasted into Vercel → Environment Variables → DODO_WEBHOOK_SECRET
- [ ] Environment is set to **Production** in Vercel
- [ ] App has been **redeployed** after changing env var
- [ ] Test webhook from Dodo returns **200 OK**
- [ ] Vercel logs show no signature errors
- [ ] Subscription appears in database after test

---

## 🔧 Alternative: Temporarily Disable Signature Verification (DEV ONLY)

**⚠️ WARNING**: Only do this for testing! Never in production!

If you need to test urgently, you can temporarily disable verification:

1. Edit `app/api/webhooks/dodo/route.ts`
2. Find line ~46
3. Comment out verification temporarily:

```typescript
// TEMPORARY - FOR TESTING ONLY
let payload: any = {};
try {
  // Skip signature verification temporarily
  payload = JSON.parse(rawBody);
  console.log("⚠️ SIGNATURE VERIFICATION DISABLED - FOR TESTING ONLY");
} catch (err) {
  console.error("Failed to parse webhook payload:", err);
  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
```

**IMPORTANT**: Re-enable signature verification immediately after testing!

---

## 🎯 Root Cause Explanation

Dodo Payments uses **Svix** to sign webhooks for security. Here's what happens:

1. Dodo creates webhook payload
2. Dodo signs it with the **signing secret**
3. Dodo sends payload + signature to your endpoint
4. Your endpoint verifies signature using the **same secret**
5. If secrets don't match → ❌ Signature verification fails

The secret in Vercel must EXACTLY match the secret in Dodo.

---

## 📞 Still Not Working?

If you've tried all the above and it still fails:

1. **Check Dodo Logs**:
   - Dodo Dashboard → Webhooks → Logs
   - Look for the exact error response from your server

2. **Check Vercel Logs**:
   - Look for the full error message
   - Check what secret is being used (partially logged)

3. **Contact Dodo Support**:
   - Show them the error
   - Ask them to verify your webhook endpoint is configured correctly
   - They can see webhook delivery attempts on their side

4. **Regenerate Webhook Secret**:
   - In Dodo Dashboard, delete and recreate the webhook
   - Get the NEW secret
   - Update Vercel with new secret
   - Redeploy

---

## ✅ Success Looks Like This

When working correctly, Dodo webhook logs will show:

```
✅ 200 OK
Response time: < 1000ms
No retries needed
```

And Vercel logs will show:

```
✅ payment.succeeded
✅ Updated subscription for user user_xxxxx
✅ Subscription upserted successfully!
```
