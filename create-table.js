// Simple script to create subscriptions table in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read from .env.local
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let SUPABASE_URL = '';
let SUPABASE_SERVICE_KEY = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    SUPABASE_URL = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    SUPABASE_SERVICE_KEY = line.split('=')[1].trim();
  }
});

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read the SQL migration file
const sql = fs.readFileSync('supabase/migrations/001_create_subscriptions_table.sql', 'utf-8');

async function createTable() {
  console.log('🔧 Creating subscriptions table in Supabase...\n');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If rpc doesn't work, try creating table directly
      console.log('Trying alternative method...');

      // Check if table exists first
      const { data: existingData, error: checkError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

      if (!checkError) {
        console.log('✅ Table already exists!');
        console.log('Total subscriptions:', existingData);
        return;
      }

      console.error('❌ Could not create table automatically.');
      console.log('\n📋 Please create it manually:');
      console.log('1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql');
      console.log('2. Copy the SQL from: supabase/migrations/001_create_subscriptions_table.sql');
      console.log('3. Paste and click RUN\n');
      process.exit(1);
    }

    console.log('✅ Table created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Please create it manually:');
    console.log('1. Go to: https://app.supabase.com/project/mxjbsxnmrlptfqgtbbmb/sql');
    console.log('2. Copy the SQL from: supabase/migrations/001_create_subscriptions_table.sql');
    console.log('3. Paste and click RUN\n');
  }
}

createTable();
