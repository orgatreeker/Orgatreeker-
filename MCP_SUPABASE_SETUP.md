# Supabase MCP Setup Guide

## ✅ Configuration Applied

I've configured your VS Code to connect to Supabase via MCP (Model Context Protocol). Here's what was set up:

### 1. VS Code Settings Updated
Location: `C:\Users\iamgo\AppData\Roaming\Code\User\settings.json`

Added MCP server configuration:
```json
"mcpServers": {
    "supabase": {
        "type": "http",
        "url": "https://mcp.supabase.com/mcp?project_ref=mxjbsxnmrlptfqgtbbmb&features=docs%2Caccount%2Cdebugging%2Cdatabase%2Cstorage%2Cbranching%2Cfunctions%2Cdevelopment"
    }
}
```

### 2. Environment Variables Prepared
Location: `.env.local`

Added placeholder for service role key (needed for MCP full access).

---

## 🔑 Next Steps: Get Your Service Role Key

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/mxjbsxnmrlptfqgtbbmb/settings/api
2. Or navigate manually:
   - Go to https://supabase.com/dashboard
   - Select your project: `mxjbsxnmrlptfqgtbbmb`
   - Click **Settings** (gear icon) → **API**

### Step 2: Copy Service Role Key
1. Scroll to **Project API keys** section
2. Find **service_role** key (starts with `eyJ...`)
3. Click **Reveal** or **Copy** button
4. **⚠️ WARNING**: This key has FULL database access - keep it secret!

### Step 3: Update .env.local
1. Open `.env.local` in your project root
2. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Save the file

### Step 4: Restart VS Code
1. Close VS Code completely
2. Reopen VS Code
3. Open your project

---

## 🎯 Features Enabled

With MCP connected to Supabase, you'll have access to:

- **📄 Documentation**: Supabase API docs and guides
- **👤 Account Management**: View project details
- **🐛 Debugging**: Query logs and error tracking
- **💾 Database**: Direct database operations via AI
- **📦 Storage**: File storage management
- **🌿 Branching**: Database branching features
- **⚡ Functions**: Edge functions management
- **🔧 Development**: Development tools and helpers

---

## 🧪 Testing the Connection

After completing the steps above, test the MCP connection:

### In VS Code Chat (Copilot/GitHub Copilot Chat):
1. Open VS Code Chat panel
2. Try commands like:
   ```
   @workspace Show me the Supabase database tables
   ```
   ```
   @workspace Query the transactions table from Supabase
   ```
   ```
   @workspace Show me the RLS policies in Supabase
   ```

### Expected Behavior:
- AI should be able to query your Supabase database
- Can suggest schema changes
- Can help debug database issues
- Can read and analyze your database structure

---

## 🔒 Security Best Practices

### ⚠️ NEVER commit service role key to Git!
The service role key is already excluded via `.env.local` in `.gitignore`.

### ✅ DO:
- Keep service role key in `.env.local` only
- Use anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) for client-side code
- Use service role key only for server-side/MCP operations
- Rotate keys if accidentally exposed

### ❌ DON'T:
- Don't share service role key in chat/email
- Don't commit it to version control
- Don't use it in client-side JavaScript
- Don't expose it in public repositories

---

## 🔧 Troubleshooting

### MCP Not Working?
1. **Verify VS Code Settings**: Check that `mcpServers` was added correctly
2. **Check Service Role Key**: Ensure it's properly set in `.env.local`
3. **Restart VS Code**: MCP settings load on startup
4. **Check MCP Extension**: Ensure VS Code has MCP support enabled
5. **View Logs**: Check VS Code → Help → Toggle Developer Tools → Console

### Common Issues:

#### "MCP Server Not Found"
- Restart VS Code completely
- Check that `chat.mcp.gallery.enabled` is `true` in settings

#### "Authentication Failed"
- Verify service role key is correct (no extra spaces)
- Check key hasn't expired in Supabase dashboard
- Ensure key starts with `eyJ` (JWT format)

#### "Permission Denied"
- Service role key has full permissions by default
- Check RLS policies aren't blocking operations

---

## 📚 Additional Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/mcp)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [VS Code MCP Support](https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview)

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all steps were completed
3. Check VS Code developer console for errors
4. Ensure Supabase project is active and accessible
