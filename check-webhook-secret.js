/**
 * Webhook Secret Verification Tool
 *
 * This script helps you verify your webhook secret is configured correctly
 * Run: node check-webhook-secret.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   Webhook Secret Configuration Check      ║');
console.log('╚════════════════════════════════════════════╝\n');

// Check .env.local
console.log('📁 Checking .env.local...\n');

const envLocalPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');

  const secretMatch = envContent.match(/DODO_WEBHOOK_SECRET=(.+)/);

  if (secretMatch) {
    const secret = secretMatch[1].trim();
    console.log('✅ DODO_WEBHOOK_SECRET is set in .env.local');
    console.log('   First 15 chars:', secret.substring(0, 15) + '...');
    console.log('   Full length:', secret.length, 'characters');

    if (secret.startsWith('whsec_')) {
      console.log('   ✅ Format looks correct (starts with whsec_)');
    } else {
      console.log('   ⚠️  Warning: Should start with whsec_');
    }

    if (secret === 'whsec_ko62zyrTktRwLxwxL+au3X2NOk0E6Iqe') {
      console.log('   ℹ️  Using the secret from .env.production');
    }
  } else {
    console.log('❌ DODO_WEBHOOK_SECRET not found in .env.local');
  }
} else {
  console.log('⚠️  .env.local file not found');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check .env.production
console.log('📁 Checking .env.production...\n');

const envProdPath = path.join(__dirname, '.env.production');

if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf8');

  const secretMatch = envContent.match(/DODO_WEBHOOK_SECRET=(.+)/);

  if (secretMatch) {
    const secret = secretMatch[1].trim();
    console.log('✅ DODO_WEBHOOK_SECRET is set in .env.production');
    console.log('   First 15 chars:', secret.substring(0, 15) + '...');
    console.log('   Full length:', secret.length, 'characters');

    if (secret.startsWith('whsec_')) {
      console.log('   ✅ Format looks correct (starts with whsec_)');
    } else {
      console.log('   ⚠️  Warning: Should start with whsec_');
    }
  } else {
    console.log('❌ DODO_WEBHOOK_SECRET not found in .env.production');
  }
} else {
  console.log('⚠️  .env.production file not found');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Instructions
console.log('📋 Next Steps:\n');
console.log('1. Go to Dodo Dashboard: https://dodo.link/dashboard');
console.log('2. Navigate to: Settings → Webhooks');
console.log('3. Find webhook: https://app.orgatreeker.com/api/webhooks/dodo');
console.log('4. Copy the "Signing Secret" (should start with whsec_)');
console.log('');
console.log('5. Update in Vercel:');
console.log('   • Go to: https://vercel.com');
console.log('   • Select your project');
console.log('   • Settings → Environment Variables');
console.log('   • Edit DODO_WEBHOOK_SECRET');
console.log('   • Paste the new secret');
console.log('   • Make sure "Production" is selected');
console.log('   • Save');
console.log('');
console.log('6. Redeploy:');
console.log('   • Go to Deployments tab');
console.log('   • Click ⋯ on latest deployment');
console.log('   • Click "Redeploy"');
console.log('');
console.log('7. Test webhook from Dodo Dashboard');
console.log('   • Should get 200 OK response');
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Common Issues:\n');
console.log('• Different secrets for Test vs Live mode');
console.log('• Secret copied with extra spaces/newlines');
console.log('• Forgot to redeploy after updating env var');
console.log('• Using localhost webhook secret instead of production');
console.log('');
