/**
 * Test script to verify Supabase service role can write subscription data
 * Run this AFTER updating your SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npx tsx scripts/test-subscription-write.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { upsertSubscription, getSubscription, hasActiveSubscription } from '../lib/supabase/database';

async function testSubscriptionWrite() {
  console.log('\n🧪 Testing Supabase Subscription Write Access...\n');

  // Check if service role key is configured
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('1️⃣ Checking service role key...');

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set!');
    console.log('   Please set it in .env.local');
    process.exit(1);
  }

  if (!serviceRoleKey.startsWith('eyJ')) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY has wrong format!');
    console.log(`   Current format: ${serviceRoleKey.substring(0, 20)}...`);
    console.log('   Expected format: eyJ... (JWT token)');
    console.log('   See GET_SERVICE_ROLE_KEY.md for instructions');
    process.exit(1);
  }

  console.log('✅ Service role key format looks correct\n');

  // Test 1: Write a test subscription
  console.log('2️⃣ Testing subscription write...');
  const testUserId = `test_user_${Date.now()}`;
  const testSubscription = {
    clerk_user_id: testUserId,
    email: 'test@example.com',
    status: 'active' as const,
    plan: 'monthly' as const,
    subscription_id: 'test_sub_123',
    product_id: 'test_product_123',
    payment_id: 'test_payment_123',
  };

  try {
    const result = await upsertSubscription(testSubscription);

    if (!result) {
      console.error('❌ Failed to write subscription (returned null)');
      console.log('   This usually means RLS policies are blocking access');
      console.log('   Check Supabase logs: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/logs/postgres-logs');
      process.exit(1);
    }

    console.log('✅ Successfully wrote test subscription');
    console.log(`   User ID: ${result.clerk_user_id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Plan: ${result.plan}\n`);

    // Test 2: Read the subscription back
    console.log('3️⃣ Testing subscription read...');
    const retrieved = await getSubscription(testUserId);

    if (!retrieved) {
      console.error('❌ Failed to read subscription back');
      process.exit(1);
    }

    console.log('✅ Successfully read subscription');
    console.log(`   Email: ${retrieved.email}`);
    console.log(`   Status: ${retrieved.status}\n`);

    // Test 3: Check active subscription status
    console.log('4️⃣ Testing subscription status check...');
    const isActive = await hasActiveSubscription(testUserId);

    if (!isActive) {
      console.error('❌ Subscription not detected as active');
      process.exit(1);
    }

    console.log('✅ Subscription correctly detected as active\n');

    // Clean up test data
    console.log('5️⃣ Cleaning up test data...');
    const { supabaseAdmin } = await import('../lib/supabase/client');
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('clerk_user_id', testUserId);

      if (error) {
        console.warn('⚠️  Warning: Could not delete test data:', error.message);
      } else {
        console.log('✅ Test data cleaned up\n');
      }
    }

    // Success!
    console.log('🎉 All tests passed!');
    console.log('\n✨ Your Supabase subscription system is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Test a real payment flow: Sign up → Go to /pricing → Complete payment');
    console.log('2. Check webhook logs at: https://app.orgatreeker.com/api/webhooks/dodo');
    console.log('3. Verify subscription in database after payment');
    console.log('\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Verify service role key from: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/settings/api');
    console.log('2. Check RLS policies are correct');
    console.log('3. View Supabase logs for detailed errors');
    process.exit(1);
  }
}

testSubscriptionWrite().catch(console.error);
