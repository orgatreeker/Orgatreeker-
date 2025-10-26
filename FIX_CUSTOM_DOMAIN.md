# Fix Custom Domain - Point to Railway

## Problem
Your domain shows Netlify 404 error because DNS is pointing to Netlify, but your app is on Railway.

---

## Solution: Update DNS to Point to Railway

### Step 1: Get Railway Domain

1. Go to Railway Dashboard: https://railway.app
2. Select your project
3. Click on your service
4. Go to **Settings** tab
5. Under **Networking** → **Public Networking**, find your Railway domain
6. Example: `orgatreeker-production.up.railway.app`
7. **Copy this domain**

### Step 2: Add Custom Domain in Railway

1. Still in Railway **Settings** → **Networking**
2. Click **+ Custom Domain**
3. Enter your domain: `app.orgatreeker.com`
4. Railway will show you the DNS settings needed

Railway will show something like:
```
Add this CNAME record to your DNS:

Name: app
Value: orgatreeker-production.up.railway.app
```

### Step 3: Update Your DNS Settings

Go to where your domain DNS is managed (choose one):

#### Option A: If using Cloudflare
1. Go to https://dash.cloudflare.com
2. Select your domain `orgatreeker.com`
3. Go to **DNS** → **Records**
4. Find the CNAME record for `app`
5. Edit it:
   - **Type:** CNAME
   - **Name:** app
   - **Target:** `orgatreeker-production.up.railway.app` (your Railway domain)
   - **Proxy status:** DNS only (gray cloud, NOT orange)
6. Save

#### Option B: If using GoDaddy
1. Go to https://dcc.godaddy.com/manage/dns
2. Find your domain
3. Click **DNS** → **Manage Zones**
4. Find CNAME record for `app`
5. Edit:
   - **Type:** CNAME
   - **Host:** app
   - **Points to:** `orgatreeker-production.up.railway.app`
   - **TTL:** 600 (or default)
6. Save

#### Option C: If using Namecheap
1. Go to Namecheap Dashboard
2. Domain List → Manage
3. **Advanced DNS** tab
4. Find CNAME record for `app`
5. Edit:
   - **Type:** CNAME Record
   - **Host:** app
   - **Value:** `orgatreeker-production.up.railway.app`
   - **TTL:** Automatic
6. Save

#### Option D: Other DNS Provider
1. Log into your DNS provider
2. Find DNS management
3. Update the CNAME record for `app`:
   - **Name/Host:** app
   - **Type:** CNAME
   - **Value/Target:** Your Railway domain (from Step 1)
4. Save changes

### Step 4: Remove Old Netlify DNS (IMPORTANT!)

**Delete any DNS records pointing to Netlify:**

Look for records with values like:
- `*.netlify.app`
- `netlify.com`
- Any Netlify IP addresses

Delete these records!

### Step 5: Wait for DNS Propagation

- Changes can take 5 minutes to 48 hours
- Usually works in 10-30 minutes
- Check status: https://dnschecker.org

Enter `app.orgatreeker.com` and check if CNAME points to Railway

### Step 6: Verify in Railway

1. Railway Dashboard → Your Service → **Settings**
2. Under **Networking** → **Custom Domains**
3. Your domain should show as **Active** with a green checkmark

### Step 7: Update Environment Variables

Make sure these use your custom domain:

**In Railway Variables:**
```
DEFAULT_RETURN_URL=https://app.orgatreeker.com/success
```

**In Dodo Webhook:**
```
URL: https://app.orgatreeker.com/webhook
```

---

## Quick Test

After DNS updates:

1. Wait 15-30 minutes
2. Visit: `https://app.orgatreeker.com`
3. Should show your app (NOT Netlify 404!) ✅

---

## Troubleshooting

### Still Seeing Netlify 404?

**Wait longer:** DNS can take up to 48 hours
**Clear DNS cache:**
```bash
# Windows
ipconfig /flushdns

# Mac
sudo dscacheutil -flushcache
```
**Try incognito window:** Browser may cache old DNS

### Railway Shows "Domain Not Active"?

**Check DNS:** Use https://dnschecker.org
- Enter: `app.orgatreeker.com`
- Should point to Railway domain
**Check CNAME:** Make sure it's exactly your Railway domain
**Cloudflare users:** Turn OFF proxy (gray cloud, not orange)

### Certificate Error (SSL)?

**Railway auto-provisions SSL** - just wait 5-10 minutes after DNS is active

---

## Summary

1. ✅ Get Railway domain from Railway Settings
2. ✅ Add custom domain in Railway
3. ✅ Update DNS CNAME to point to Railway (NOT Netlify!)
4. ✅ Delete old Netlify DNS records
5. ✅ Wait for DNS propagation
6. ✅ Visit your domain - should work!

The key issue: Your DNS is pointing to Netlify but app is on Railway. Update DNS to point to Railway!
