# Webhook Setup Verification Script (PowerShell)
# This script helps verify your webhook configuration

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Webhook Configuration Verification      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
Write-Host ""

$envFile = ".env.local"
$envProdFile = ".env.production"

function Check-EnvVariable {
    param (
        [string]$file,
        [string]$varName
    )

    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "$varName=(.+)") {
            Write-Host "  ✓ $varName is set" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ✗ $varName is missing" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ⚠ $file not found" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "Local Environment (.env.local):" -ForegroundColor Cyan
$localChecks = @{
    "DODO_BEARER_TOKEN" = Check-EnvVariable -file $envFile -varName "DODO_BEARER_TOKEN"
    "DODO_WEBHOOK_SECRET" = Check-EnvVariable -file $envFile -varName "DODO_WEBHOOK_SECRET"
    "NEXT_PUBLIC_DODO_PRODUCT_MONTHLY" = Check-EnvVariable -file $envFile -varName "NEXT_PUBLIC_DODO_PRODUCT_MONTHLY"
    "NEXT_PUBLIC_DODO_PRODUCT_YEARLY" = Check-EnvVariable -file $envFile -varName "NEXT_PUBLIC_DODO_PRODUCT_YEARLY"
    "SUPABASE_SERVICE_ROLE_KEY" = Check-EnvVariable -file $envFile -varName "SUPABASE_SERVICE_ROLE_KEY"
}

Write-Host ""
Write-Host "Production Environment (.env.production):" -ForegroundColor Cyan
$prodChecks = @{
    "DODO_BEARER_TOKEN" = Check-EnvVariable -file $envProdFile -varName "DODO_BEARER_TOKEN"
    "DODO_WEBHOOK_SECRET" = Check-EnvVariable -file $envProdFile -varName "DODO_WEBHOOK_SECRET"
    "DEFAULT_RETURN_URL" = Check-EnvVariable -file $envProdFile -varName "DEFAULT_RETURN_URL"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check if required files exist
Write-Host ""
Write-Host "Checking required files..." -ForegroundColor Yellow
Write-Host ""

$files = @(
    "app/api/webhooks/dodo/route.ts",
    "middleware.ts",
    "lib/supabase/database.ts",
    "supabase/migrations/001_create_subscriptions_table.sql"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Summary
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test webhook locally:" -ForegroundColor White
Write-Host "   • Edit test-webhook.js (update USER_EMAIL)"
Write-Host "   • Run: npm run dev"
Write-Host "   • Run: node test-webhook.js"
Write-Host ""
Write-Host "2. Test in production:" -ForegroundColor White
Write-Host "   • Go to Dodo Dashboard → Webhooks"
Write-Host "   • Click 'Send Test Event'"
Write-Host "   • Check Vercel logs for response"
Write-Host ""
Write-Host "3. Verify database:" -ForegroundColor White
Write-Host "   • Open Supabase Dashboard"
Write-Host "   • Check subscriptions table"
Write-Host "   • Run: SELECT * FROM subscriptions;"
Write-Host ""
Write-Host "4. Test app access:" -ForegroundColor White
Write-Host "   • Log into app"
Write-Host "   • Try accessing /"
Write-Host "   • Should NOT redirect to /pricing"
Write-Host ""
Write-Host "For detailed guides, see:" -ForegroundColor Yellow
Write-Host "  • QUICK_WEBHOOK_TEST.md"
Write-Host "  • WEBHOOK_TESTING_GUIDE.md"
Write-Host "  • DODO_SETUP_CHECKLIST.md"
Write-Host ""
