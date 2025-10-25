/**
 * Dodo Payments Webhook Test Script
 *
 * This script simulates a Dodo Payments webhook call to test your webhook handler locally
 *
 * Usage:
 * 1. Make sure your dev server is running: npm run dev
 * 2. Update the USER_EMAIL below to match your Clerk account email
 * 3. Run: node test-webhook.js
 */

const crypto = require('crypto');

// ========================================
// CONFIGURATION - UPDATE THESE VALUES
// ========================================

const USER_EMAIL = 'YOUR_EMAIL@example.com'; // ← CHANGE THIS to your email
const WEBHOOK_URL = 'http://localhost:3000/webhook'; // Local dev URL (new route alias)
const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || 'whsec_ko62zyrTktRwLxwxL+au3X2NOk0E6Iqe';
const PRODUCT_ID = process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY || 'pdt_3c1A6P4Cpe8KhGYnJNiCN';

// ========================================
// WEBHOOK PAYLOAD TEMPLATES
// ========================================

const webhookPayloads = {
  'payment.succeeded': {
    type: 'payment.succeeded',
    event_id: `evt_test_${Date.now()}`,
    data: {
      payload_type: 'Payment',
      payment_id: `pay_test_${Date.now()}`,
      subscription_id: `sub_test_${Date.now()}`,
      product_id: PRODUCT_ID,
      amount: 1000,
      currency: 'USD',
      customer: {
        email: USER_EMAIL,
        name: 'Test User',
      },
      created_at: new Date().toISOString(),
    },
  },

  'subscription.active': {
    type: 'subscription.active',
    event_id: `evt_test_${Date.now()}`,
    data: {
      payload_type: 'Subscription',
      subscription_id: `sub_test_${Date.now()}`,
      product_id: PRODUCT_ID,
      status: 'active',
      customer: {
        email: USER_EMAIL,
        name: 'Test User',
      },
      created_at: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },

  'subscription.cancelled': {
    type: 'subscription.cancelled',
    event_id: `evt_test_${Date.now()}`,
    data: {
      payload_type: 'Subscription',
      subscription_id: `sub_test_${Date.now()}`,
      product_id: PRODUCT_ID,
      status: 'cancelled',
      customer: {
        email: USER_EMAIL,
        name: 'Test User',
      },
      cancelled_at: new Date().toISOString(),
    },
  },
};

// ========================================
// SVIX SIGNATURE GENERATION
// ========================================

function generateSvixSignature(payload, secret, timestamp, msgId) {
  const toSign = `${msgId}.${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret.split('_')[1] || secret) // Remove whsec_ prefix if present
    .update(toSign, 'utf8')
    .digest('base64');

  return `v1,${expectedSignature}`;
}

// ========================================
// SEND WEBHOOK
// ========================================

async function sendWebhook(eventType) {
  const payload = webhookPayloads[eventType];

  if (!payload) {
    console.error(`❌ Unknown event type: ${eventType}`);
    console.log('Available event types:', Object.keys(webhookPayloads));
    return;
  }

  const payloadString = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const msgId = `msg_${Date.now()}`;
  const signature = generateSvixSignature(payloadString, WEBHOOK_SECRET, timestamp, msgId);

  console.log('\n🚀 Sending webhook...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Event Type:', eventType);
  console.log('Email:', USER_EMAIL);
  console.log('URL:', WEBHOOK_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': msgId,
        'svix-timestamp': timestamp,
        'svix-signature': signature,
      },
      body: payloadString,
    });

    const responseText = await response.text();

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ Webhook sent successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Check your terminal/console for webhook handler logs');
      console.log('2. Check Supabase for new subscription entry:');
      console.log(`   SELECT * FROM subscriptions WHERE email = '${USER_EMAIL}';`);
      console.log('3. Try accessing the app - you should not be redirected to /pricing');
    } else {
      console.log('\n❌ Webhook failed!');
      console.log('Check the response above for error details');
    }

  } catch (error) {
    console.error('\n❌ Error sending webhook:', error.message);
    console.log('\nTroubleshooting:');
    console.log('• Make sure your dev server is running (npm run dev)');
    console.log('• Check that the webhook URL is correct');
    console.log('• Verify your DODO_WEBHOOK_SECRET in .env.local');
  }
}

// ========================================
// MAIN
// ========================================

const eventType = process.argv[2] || 'payment.succeeded';

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   Dodo Payments Webhook Test Script       ║');
console.log('╚════════════════════════════════════════════╝\n');

// Validate configuration
if (USER_EMAIL === 'YOUR_EMAIL@example.com') {
  console.error('❌ ERROR: Please update USER_EMAIL in the script!');
  console.log('\nEdit test-webhook.js and set USER_EMAIL to your Clerk account email\n');
  process.exit(1);
}

console.log('Configuration:');
console.log('• User Email:', USER_EMAIL);
console.log('• Webhook URL:', WEBHOOK_URL);
console.log('• Event Type:', eventType);
console.log('• Product ID:', PRODUCT_ID);

sendWebhook(eventType);
