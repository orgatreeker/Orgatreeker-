# 🔧 Fix Netlify Deployment - "Site Cannot Be Reached"

If you're seeing "site cannot be reached" after deploying to Netlify, follow these steps.

---

## Step 1: Install Netlify Next.js Plugin

The Next.js plugin is required for Next.js to work on Netlify.

```bash
npm install --save-dev @netlify/plugin-nextjs
```

---

## Step 2: Verify Files Are Created

I've created these files for you:

### ✅ `netlify.toml`
This file configures Netlify to properly deploy Next.js

### ✅ Configuration is ready

Both files are already in your project.

---

## Step 3: Push to GitHub

```bash
git add netlify.toml
git commit -m "Add Netlify configuration for Next.js deployment"
git push origin main
```

---

## Step 4: Redeploy on Netlify

### Option A: Auto-Deploy (if connected to GitHub)
1. Push triggers automatic deployment
2. Go to Netlify → **Deploys** tab
3. Wait for build to complete

### Option B: Manual Redeploy
1. Go to Netlify Dashboard
2. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
3. Wait for completion

---

## Step 5: Check Build Logs

If deployment fails:

1. Go to Netlify → **Deploys**
2. Click on the failed deployment
3. Click **Deploy log**
4. Look for errors

**Common errors:**

### Error: "Module not found: Can't resolve 'xyz'"
**Fix:** Run `npm install` locally, then push

### Error: "Build script not found"
**Fix:** Verify `package.json` has:
```json
"scripts": {
  "build": "next build"
}
```

### Error: "Out of memory"
**Fix:** In Netlify → Site settings → Build & deploy → Environment:
```
NODE_OPTIONS=--max-old-space-size=4096
```

---

## Step 6: Verify Site is Live

After successful deployment:

1. Go to Netlify → **Site overview**
2. Click on your site URL (e.g., `https://yoursite.netlify.app`)
3. Site should load ✅

If you still see "site cannot be reached":
- Wait 2-3 minutes for DNS propagation
- Try in incognito/private browser window
- Check Netlify deploy status is "Published"

---

## Step 7: Configure Environment Variables

Once site is reachable, add environment variables:

1. Netlify → **Site settings** → **Environment variables**
2. Add all from your `.env.local` file
3. **IMPORTANT:** Change these for production:

**Key:** `DEFAULT_RETURN_URL`
**Value:** `https://YOUR-NETLIFY-SITE.netlify.app/success`
(Replace with your actual Netlify URL)

**Key:** `DODO_WEBHOOK_SECRET`
**Value:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

4. Redeploy after adding variables

---

## Step 8: Test Webhook

### Get Your Site URL
From Netlify dashboard, copy your site URL (e.g., `https://orgatreeker.netlify.app`)

### Configure in Dodo
1. Go to https://dodo.link/dashboard
2. **Settings** → **Webhooks** → **Add Endpoint**

**URL:** `https://YOUR-NETLIFY-SITE.netlify.app/webhook`
**Secret:** `whsec_CiZ71O5wJSN6lz73RCpR9Kr/0q0F8F3d`

3. Enable events: `payment.succeeded`, `subscription.active`, etc.
4. Save

### Send Test Webhook
1. In Dodo → Webhooks
2. Click **Send Test Event**
3. Select `payment.succeeded`
4. Send

**Expected:** ✅ 200 OK

---

## Troubleshooting Checklist

If site still not working:

- [ ] `netlify.toml` file exists in project root
- [ ] Pushed `netlify.toml` to GitHub
- [ ] Netlify build completed successfully (check Deploys tab)
- [ ] Build status shows "Published" (not "Building" or "Failed")
- [ ] Waited 2-3 minutes after deployment
- [ ] Tried accessing in incognito window
- [ ] Site URL is correct (from Netlify dashboard)

---

## Quick Fix Commands

Run these in order:

```bash
# 1. Install Netlify plugin
npm install --save-dev @netlify/plugin-nextjs

# 2. Add and commit files
git add netlify.toml package.json package-lock.json
git commit -m "Add Netlify Next.js configuration"

# 3. Push to GitHub
git push origin main

# 4. Check Netlify dashboard for automatic deployment
```

---

## Alternative: Use Vercel Instead

If Netlify continues to give issues, Vercel has native Next.js support:

1. Go to https://vercel.com
2. **Import Project** from GitHub
3. Select your repository
4. Click **Deploy** (no configuration needed!)
5. Vercel automatically handles Next.js

Vercel is made by Next.js creators, so it has zero-config deployment.

---

## Need More Help?

### Check Netlify Build Logs
Netlify Dashboard → Deploys → Latest Deploy → Deploy log

Look for:
```
✅ Build script success
✅ Site is live
```

### Check Netlify Function Logs
Netlify Dashboard → Functions → View logs

For webhook debugging

### Contact Netlify Support
If build succeeds but site still unreachable:
- Netlify Dashboard → Support → Get help

---

## What Should Work After Fix

1. ✅ Site loads at `https://yoursite.netlify.app`
2. ✅ Can sign up / sign in
3. ✅ Pricing page works
4. ✅ Webhook receives events (200 OK)
5. ✅ Subscriptions save to database
6. ✅ Users redirected to dashboard after payment

---

## Summary

The main issue is Next.js requires special configuration for Netlify. I've created:

1. ✅ `netlify.toml` - Netlify configuration
2. ✅ Next.js is compatible with Netlify

Just run:
```bash
npm install --save-dev @netlify/plugin-nextjs
git add .
git commit -m "Configure for Netlify deployment"
git push
```

Then redeploy on Netlify and your site should work!
