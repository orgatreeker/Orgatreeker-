/**
 * Script to check if subscriptions table exists in Supabase
 * and verify we can save subscription data
 *
 * Run with: node scripts/check-subscriptions-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSubscriptionsTable() {
  console.log('\n🔍 Checking Supabase subscriptions table...\n');

  try {
    // Check if we can query the table
    console.log('1️⃣ Testing table access...');
    const { data, error, count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table does not exist!');
        console.error('\n📋 You need to run the migration first:');
        console.error('   1. Go to Supabase Dashboard → SQL Editor');
        console.error('   2. Run the SQL from: supabase/migrations/001_create_subscriptions_table.sql');
        console.error('\n   OR use the Quick Start guide in QUICK_START.md\n');
        return false;
      }
      console.error('❌ Error querying table:', error.message);
      return false;
    }

    console.log('✅ Table exists and is accessible!');
    console.log(`📊 Current subscriptions count: ${count || 0}`);

    if (data && data.length > 0) {
      console.log('\n📝 Recent subscriptions:');
      data.forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.email} - ${sub.status} (${sub.plan || 'N/A'})`);
      });
    } else {
      console.log('   (No subscriptions yet)');
    }

    // Test inserting a test record
    console.log('\n2️⃣ Testing insert operation...');
    const testSubscription = {
      clerk_user_id: 'test_user_' + Date.now(),
      email: 'test@example.com',
      status: 'active',
      plan: 'monthly',
      product_id: 'test_product',
      last_event_type: 'test',
      last_event_id: 'test_event_' + Date.now(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from('subscriptions')
      .insert(testSubscription)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert test record:', insertError.message);
      return false;
    }

    console.log('✅ Successfully inserted test record!');
    console.log(`   ID: ${insertData.id}`);

    // Clean up test record
    console.log('\n3️⃣ Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.warn('⚠️ Could not delete test record:', deleteError.message);
    } else {
      console.log('✅ Test record cleaned up!');
    }

    console.log('\n✅ All checks passed! Subscription table is working correctly.\n');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

// Run the check
checkSubscriptionsTable()
  .then(success => {
    if (success) {
      console.log('✨ Supabase is ready to save subscription data!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Please fix the issues above before deploying.\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
