# Email Confirmation Troubleshooting Guide

## Issue: "Error sending confirmation email"

This error typically occurs when there are issues with the SMTP configuration in your Supabase project. Since you mentioned recently connecting custom SMTP, here's what to check:

### 1. Supabase Dashboard - SMTP Settings

**Location:** Project Settings → Auth → SMTP Settings

**Check these settings:**
- **SMTP Host:** Verify the correct server (e.g., smtp.gmail.com, smtp.outlook.com)
- **SMTP Port:** 
  - 587 for TLS (recommended)
  - 465 for SSL
  - 25 for unencrypted (not recommended)
- **SMTP Username:** Usually your full email address
- **SMTP Password:** 
  - For Gmail: Use App Password, not regular password
  - For Outlook: Use App Password or regular password
  - For custom domains: Use the provided SMTP credentials

**Test the connection:**
- Use the "Send test email" button in Supabase dashboard
- If this fails, the SMTP configuration is incorrect

### 2. Email Templates

**Location:** Project Settings → Auth → Email Templates

**Verify:**
- "Confirm signup" template is enabled
- Template content is properly formatted
- Redirect URL is correct: `{{ .SiteURL }}/auth/callback`

### 3. Auth Settings

**Location:** Project Settings → Auth → Settings

**Check:**
- "Enable email confirmations" is turned ON
- "Secure email change" is properly configured
- Site URL matches your application URL exactly

### 4. Common SMTP Provider Issues

#### Gmail
- Enable 2-factor authentication
- Generate App Password (not regular password)
- Use smtp.gmail.com:587 with TLS

#### Outlook/Hotmail
- May require App Password
- Use smtp-mail.outlook.com:587
- Ensure account is not flagged for suspicious activity

#### Custom Domain/Provider
- Verify domain authentication
- Check SPF/DKIM records
- Ensure sending limits aren't exceeded

### 5. Environment Variables

Verify these are correctly set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Code-Level Checks

The authentication code is correctly implemented with:
- Proper `emailRedirectTo` configuration
- Error handling for SMTP issues
- Fallback mechanisms for profile creation

### 7. Testing Steps

1. **Test SMTP in Supabase Dashboard first**
2. **Check spam/junk folders**
3. **Try with a different email provider**
4. **Verify email template formatting**
5. **Check Supabase logs for detailed error messages**

### 8. Alternative Solutions

If SMTP continues to fail:
- Temporarily disable email confirmation in Auth settings
- Use Supabase's default email service (remove custom SMTP)
- Contact Supabase support for SMTP configuration help

### 9. Debug Information

When reporting issues, include:
- SMTP provider being used
- Error messages from Supabase dashboard
- Whether test emails work from dashboard
- Browser console errors during signup
