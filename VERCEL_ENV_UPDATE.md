# ⚠️ IMPORTANT: Update Vercel Environment Variables

## You Need to Change These in Vercel Dashboard

After the code deploys, you MUST update these environment variables in Vercel:

### Go to Vercel Dashboard:
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Update These 2 Variables:

1. **NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL**
   - **Old value**: `/`
   - **New value**: `/pricing`

2. **NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL**
   - **Old value**: `/`
   - **New value**: `/pricing`

### Steps:

1. Go to: https://vercel.com/dashboard
2. Click your project (Orgatreeker)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Find `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - Click the **3 dots** (•••) → **Edit**
   - Change value to: `/pricing`
   - Click **Save**
6. Find `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
   - Click the **3 dots** (•••) → **Edit**
   - Change value to: `/pricing`
   - Click **Save**
7. **Redeploy** (Vercel will prompt you, or go to Deployments → click **•••** → Redeploy)

---

## Why This is Important:

**Before (Wrong):**
```
User signs up → Redirected to / (home) → Can use app WITHOUT subscribing ❌
```

**After (Correct):**
```
User signs up → Redirected to /pricing → Must subscribe first ✅
User subscribes → Can access app ✅
```

---

## After You Update:

1. ✅ New users will be redirected to /pricing after sign up/sign in
2. ✅ They CANNOT access the app without subscription
3. ✅ After subscribing, they can use the full app
4. ✅ Non-subscribers only see pricing page

---

**DO THIS NOW** before testing the app!
