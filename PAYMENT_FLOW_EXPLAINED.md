# 💳 Payment Flow - How It Works in Your App

## Complete Flow: Payment → Subscription → Unlocked Features

---

## 🎯 The Complete Journey

```
Step 1: User Clicks "Subscribe" on Pricing Page
    ↓
Step 2: Dodo Payment Gateway Opens (Checkout Page)
    ↓
Step 3: User Enters Card Details & Pays
    ↓
Step 4: Dodo Processes Payment Successfully ✅
    ↓
Step 5: Dodo Sends Webhook to Your Backend
    ↓
Step 6: Your Backend Saves Subscription to Database
    ↓
Step 7: User Redirected Back to Your App (/success)
    ↓
Step 8: App Checks Database → Finds Subscription ✅
    ↓
Step 9: User Redirected to Dashboard (Features Unlocked!)
    ↓
Step 10: Middleware Checks Every Request → User Has Subscription → Access Granted!
```

---

## 📊 Detailed Step-by-Step Flow

### **Step 1: User Clicks "Subscribe"**

**File:** `app/pricing/pricing-client.tsx`

When user clicks "Subscribe Monthly" or "Subscribe Yearly":

```typescript
// User clicks subscribe button
const handleCheckout = async (productId: string) => {
  // Call your backend API
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  });

  const { checkout_url } = await response.json();

  // Redirect user to Dodo payment page
  window.location.href = checkout_url;
}
```

**What Happens:**
- Your frontend calls `/api/checkout`
- Backend creates a Dodo checkout session
- User is redirected to Dodo's payment page

---

### **Step 2: Backend Creates Checkout Session**

**File:** `app/api/checkout/route.ts`

Your backend talks to Dodo Payment Gateway:

```typescript
export async function POST(req: NextRequest) {
  // Get user info from Clerk
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  // Create checkout session with Dodo
  const session = await dodoClient.checkoutSessions.create({
    product_cart: [{ product_id, quantity: 1 }],
    return_url: process.env.DEFAULT_RETURN_URL, // Where to send user after payment
    customer: { email, name },
  });

  // Return Dodo checkout URL to frontend
  return Response.json({
    checkout_url: session.checkout_url // e.g., https://checkout.dodo.link/xyz
  });
}
```

**What Happens:**
- Backend creates a "checkout session" with Dodo
- Dodo returns a payment page URL
- User is redirected to Dodo's secure payment page

---

### **Step 3: User Pays on Dodo**

**What Happens:**
- User enters credit card details on Dodo's secure page
- Dodo processes the payment
- Payment either succeeds ✅ or fails ❌

---

### **Step 4: Dodo Processes Payment**

**What Dodo Does:**
- Charges the credit card
- Creates a subscription in Dodo's system
- Prepares to notify your backend

---

### **Step 5: Dodo Sends Webhook to Your Backend** ⚡ CRITICAL STEP

**File:** `app/api/webhooks/dodo/route.ts` (and aliased at `app/webhook/route.ts`)

**This is where the magic happens!**

Dodo automatically sends a webhook (HTTP POST request) to:
```
https://your-app.vercel.app/webhook
```

**Webhook Payload Example:**
```json
{
  "type": "payment.succeeded",
  "event_id": "evt_abc123",
  "data": {
    "payment_id": "pay_xyz789",
    "subscription_id": "sub_123456",
    "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN",
    "customer": {
      "email": "user@example.com",
      "name": "John Doe"
    },
    "total_amount": 683,
    "status": "succeeded"
  }
}
```

**Your Backend Receives This:**

```typescript
export async function POST(req: Request) {
  console.log('📨 Webhook received from Dodo!');

  // 1. VERIFY SIGNATURE (Security!)
  const svixSignature = req.headers.get("webhook-signature");
  const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET!);
  const payload = wh.verify(body, svixSignature); // ✅ Authentic!

  // 2. EXTRACT DATA
  const { type, data } = payload;
  const email = data.customer?.email;
  const productId = data.product_id;
  const subscriptionId = data.subscription_id;

  // 3. FIND USER IN CLERK
  const clerkUsers = await clerkClient.users.getUserList({
    emailAddress: [email]
  });
  const clerkUser = clerkUsers.data[0];
  const userId = clerkUser.id; // e.g., "user_abc123"

  // 4. DETERMINE PLAN (monthly or yearly)
  let plan = 'monthly';
  if (productId === process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY) {
    plan = 'yearly';
  }

  // 5. SAVE TO DATABASE (Supabase)
  await upsertSubscription({
    clerk_user_id: userId,
    email: email,
    status: 'active',
    plan: plan,
    subscription_id: subscriptionId,
    product_id: productId,
    payment_id: data.payment_id,
  });

  console.log('✅ Subscription saved to database!');

  // 6. RETURN SUCCESS TO DODO
  return Response.json({ success: true }, { status: 200 });
}
```

**What Happens:**
1. ✅ Dodo webhook arrives at your backend
2. ✅ Backend verifies it's really from Dodo (signature check)
3. ✅ Backend extracts customer email
4. ✅ Backend finds the user in Clerk by email
5. ✅ Backend saves subscription to Supabase database
6. ✅ Backend responds "200 OK" to Dodo

---

### **Step 6: Subscription Saved in Database**

**File:** `lib/supabase/database.ts`

**Database Table:** `subscriptions`

**What Gets Saved:**

| Column | Example Value | Description |
|--------|---------------|-------------|
| `clerk_user_id` | `user_abc123` | Clerk user ID |
| `email` | `user@example.com` | User's email |
| `status` | `active` | Subscription status |
| `plan` | `monthly` | Monthly or yearly |
| `subscription_id` | `sub_123456` | Dodo subscription ID |
| `product_id` | `pdt_3c1A6P...` | Dodo product ID |
| `payment_id` | `pay_xyz789` | Dodo payment ID |
| `created_at` | `2025-10-26...` | When subscription created |

**Code:**
```typescript
export async function upsertSubscription(subscription: Subscription) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      clerk_user_id: subscription.clerk_user_id,
      email: subscription.email,
      status: subscription.status,
      plan: subscription.plan,
      subscription_id: subscription.subscription_id,
      // ... other fields
    }, {
      onConflict: 'clerk_user_id', // Update if exists
    })
    .select()
    .single();

  return data;
}
```

**Important:** Uses `supabaseAdmin` (service role key) to bypass Row Level Security!

---

### **Step 7: User Redirected Back to Your App**

After successful payment, Dodo redirects user to:
```
https://your-app.vercel.app/success
```

This is the `DEFAULT_RETURN_URL` you set in environment variables.

---

### **Step 8: Success Page Checks Database**

**File:** `app/success/page.tsx`

```typescript
export default function SuccessPage() {
  const { userId } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check database for subscription
      const response = await fetch('/api/check-subscription');
      const { isSubscribed } = await response.json();

      if (isSubscribed) {
        // ✅ Subscription found! Redirect to dashboard
        router.push('/');
      } else {
        // ⏳ Still processing... keep checking
        // (Retry logic here)
      }
    };

    checkSubscription();
  }, [userId]);

  return <div>Processing your subscription...</div>;
}
```

**What Happens:**
- Success page waits 2 seconds (for webhook to process)
- Checks if subscription exists in database
- If found → Redirect to dashboard ("/")
- If not found → Keep checking (webhook might be slow)

---

### **Step 9: User Redirected to Dashboard**

Once subscription is found, user is redirected to:
```
https://your-app.vercel.app/
```

This is the main dashboard!

---

### **Step 10: Middleware Checks Subscription** 🔒

**File:** `middleware.ts`

**This runs on EVERY request!**

```typescript
export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // If accessing protected route (/, /dashboard, etc.)
  if (isProtectedAppRoute(request)) {
    // CHECK DATABASE for active subscription
    const hasSubscription = await hasActiveSubscription(userId);

    if (hasSubscription) {
      // ✅ User has subscription → Allow access!
      return NextResponse.next();
    } else {
      // ❌ No subscription → Redirect to pricing
      return NextResponse.redirect('/pricing');
    }
  }

  return NextResponse.next();
});
```

**What Happens:**
- Every time user visits `/` (dashboard) or any protected page
- Middleware checks Supabase database
- Looks for active subscription with user's `clerk_user_id`
- If found → ✅ Access granted!
- If not found → ❌ Redirect to `/pricing`

---

## 🗄️ How User Data is Saved

### **Database: Supabase (PostgreSQL)**

**Table Name:** `subscriptions`

**Schema:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'cancelled', 'expired'
  plan TEXT NOT NULL, -- 'monthly', 'yearly'
  subscription_id TEXT,
  product_id TEXT,
  payment_id TEXT,
  expires_at TIMESTAMP,
  last_event_type TEXT,
  last_event_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## 🔐 Security: Row Level Security (RLS)

**Policies on `subscriptions` table:**

```sql
-- Service role (backend) has full access
CREATE POLICY "Service role has full access"
ON subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (clerk_user_id = auth.uid());
```

**Why This Matters:**
- Webhook uses **service role key** → Can write to database
- Regular users can only **read** their own subscription
- Prevents users from modifying subscriptions directly

---

## 🔄 How Features Get Unlocked

### **Before Payment:**
1. User visits `/` (dashboard)
2. Middleware checks database → No subscription found
3. **Redirect to `/pricing`** ⛔
4. User sees pricing page only

### **After Payment:**
1. User visits `/` (dashboard)
2. Middleware checks database → **Subscription found!** ✅
3. **Allow access** → User sees dashboard
4. All features unlocked! 🎉

---

## 🎯 Key Files Summary

| File | Purpose |
|------|---------|
| `app/api/checkout/route.ts` | Creates Dodo checkout session |
| `app/api/webhooks/dodo/route.ts` | Receives webhook, saves subscription |
| `lib/supabase/database.ts` | Database operations |
| `middleware.ts` | Checks subscription on every request |
| `app/success/page.tsx` | Verifies payment, redirects to dashboard |
| `app/pricing/page.tsx` | Shows pricing (only if no subscription) |
| `app/page.tsx` | Dashboard (only if has subscription) |

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│ (Frontend)  │
└──────┬──────┘
       │ 1. Click Subscribe
       ▼
┌─────────────────┐
│ /api/checkout   │
│ (Your Backend)  │
└────────┬────────┘
         │ 2. Create checkout session
         ▼
┌──────────────────┐
│ Dodo Payment     │
│ Gateway          │
└────────┬─────────┘
         │ 3. User pays
         │ 4. Payment succeeds
         │
         ├─── 5. Webhook ───────────┐
         │                          ▼
         │                  ┌───────────────┐
         │                  │   /webhook    │
         │                  │ (Your Backend)│
         │                  └───────┬───────┘
         │                          │ 6. Save to DB
         │                          ▼
         │                  ┌───────────────┐
         │                  │   Supabase    │
         │                  │   Database    │
         │                  └───────────────┘
         │
         │ 7. Redirect user
         ▼
┌──────────────────┐
│  /success        │
│  (Your App)      │
└────────┬─────────┘
         │ 8. Check DB
         │ 9. Subscription found!
         ▼
┌──────────────────┐
│  Dashboard (/)   │
│  Features        │
│  Unlocked! ✅    │
└──────────────────┘
```

---

## 🔍 How Middleware Checks Subscription

**File:** `lib/supabase/database.ts`

```typescript
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .single();

    return !!data; // true if subscription exists
  } catch (error) {
    return false;
  }
}
```

**SQL Query (What Actually Runs):**
```sql
SELECT * FROM subscriptions
WHERE clerk_user_id = 'user_abc123'
AND status = 'active'
LIMIT 1;
```

If this returns a row → User has subscription ✅
If no row → User doesn't have subscription ❌

---

## 📝 Complete User Journey Example

**Scenario:** John wants to subscribe to your app

1. **John signs up** → Creates account in Clerk
   - Clerk assigns ID: `user_2abc123xyz`
   - Email: `john@example.com`

2. **John redirected to /pricing** → No subscription yet
   - Middleware checks database → No subscription found
   - Shows pricing page

3. **John clicks "Subscribe Monthly" ($6.83/month)**
   - Frontend calls `/api/checkout`
   - Backend creates Dodo session
   - John redirected to: `https://checkout.dodo.link/session_xyz`

4. **John enters card details and pays**
   - Dodo charges card: $6.83 ✅
   - Creates subscription: `sub_123456`

5. **Dodo sends webhook to your backend**
   ```json
   {
     "type": "payment.succeeded",
     "data": {
       "customer": { "email": "john@example.com" },
       "subscription_id": "sub_123456",
       "product_id": "pdt_3c1A6P4Cpe8KhGYnJNiCN"
     }
   }
   ```

6. **Your backend processes webhook**
   - Finds John in Clerk by email
   - Gets Clerk ID: `user_2abc123xyz`
   - Saves to Supabase:
     ```
     clerk_user_id: user_2abc123xyz
     email: john@example.com
     status: active
     plan: monthly
     subscription_id: sub_123456
     ```

7. **John redirected to /success**
   - Page waits 2 seconds
   - Checks database → Subscription found! ✅
   - Redirects to dashboard (/)

8. **John sees dashboard**
   - Middleware checks database
   - Finds active subscription
   - Grants access ✅
   - All features unlocked!

9. **John returns tomorrow**
   - Visits `your-app.vercel.app`
   - Middleware checks database
   - Still finds active subscription ✅
   - Goes straight to dashboard (no pricing page!)

10. **John's subscription renews next month**
    - Dodo charges card again
    - Sends `subscription.renewed` webhook
    - Your backend updates `updated_at` timestamp
    - John continues using app seamlessly

---

## 🔐 Security Features

### **1. Webhook Signature Verification**
Prevents fake webhooks:
```typescript
const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET);
const payload = wh.verify(body, headers); // Throws error if invalid
```

### **2. Database Row Level Security**
Prevents users from modifying subscriptions:
- Only service role can write
- Users can only read their own data

### **3. Idempotency**
Prevents duplicate processing:
```typescript
const processedEvents = new Set<string>();

if (processedEvents.has(eventId)) {
  return Response.json({ success: true, message: 'Already processed' });
}
processedEvents.add(eventId);
```

---

## ✅ Success Criteria

**User has active subscription when:**

1. ✅ Row exists in `subscriptions` table
2. ✅ `clerk_user_id` matches user
3. ✅ `status` = `'active'`
4. ✅ (Optional) `expires_at` is in future OR null

**When ALL true:**
- Middleware allows access
- User sees dashboard
- Features unlocked!

---

## 🎉 Summary

**How Payment Gateway Talks to Backend:**
1. User pays on Dodo → Dodo sends webhook to `/webhook`
2. Backend verifies signature → Processes webhook
3. Backend saves subscription to Supabase database

**How Features Get Unlocked:**
1. Middleware checks database on every request
2. If active subscription found → Access granted ✅
3. If no subscription → Redirect to pricing ❌

**How User Data is Saved:**
1. Webhook finds user by email in Clerk
2. Gets Clerk user ID
3. Saves to Supabase `subscriptions` table
4. Links Clerk user ID to subscription

**Result:**
- Paid users see dashboard immediately after payment
- Unpaid users always see pricing page
- No manual intervention needed
- Fully automated! 🚀
