# Complete Setup Instructions - Stripe Connect Integration

Follow these steps to complete your Stripe Connect integration. This will allow business owners to connect their Stripe accounts with one click.

---

## Prerequisites

- ✅ Stripe account (you already have this)
- ✅ Supabase project set up
- ✅ Code deployed (we've written it)

---

## Step 1: Get Your Stripe Connect Credentials

You've already navigated to your Stripe Connect dashboard. Now let's get your credentials:

### 1.1 Get Your Client ID

1. In your Stripe Dashboard, you should see **Connect** in the left sidebar
2. Click on **Settings** under Connect
3. Look for **OAuth settings** or **Integration**
4. Find your **Client ID** - it starts with `ca_`
   - Example: `ca_xxxxxxxxxxxxxxxxxxxxx`
5. **Copy this** - you'll need it soon

### 1.2 Set Your Redirect URI

Still in the OAuth settings:

1. Look for **Redirect URIs** section
2. Click **Add URI**
3. Enter your Supabase function URL:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/functions/v1/stripe-connect-callback
   ```

   **To find YOUR-PROJECT-REF:**
   - Go to your Supabase dashboard
   - Look at the URL: `https://app.supabase.com/project/[THIS-IS-YOUR-REF]`
   - Or go to Settings > API > Project URL

4. Click **Save**

### 1.3 Get Your Platform Secret Key

1. Still in Stripe Dashboard
2. Click **Developers** (top right)
3. Click **API keys**
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
5. **Keep this safe** - never commit to git!

---

## Step 2: Configure Supabase Secrets

Now let's add your Stripe credentials to Supabase:

### 2.1 Install Supabase CLI (if not already)

```bash
# macOS
brew install supabase/tap/supabase

# Or use npm
npm install -g supabase
```

### 2.2 Login to Supabase

```bash
supabase login
```

### 2.3 Link Your Project

```bash
cd /Users/ethankruger/OE\ portal/OptimizedEntryPortal
supabase link --project-ref YOUR-PROJECT-REF
```

Replace `YOUR-PROJECT-REF` with your actual project reference.

### 2.4 Set the Secrets

```bash
# Your Stripe platform secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx

# Your Stripe Connect client ID (from step 1.1)
supabase secrets set STRIPE_CONNECT_CLIENT_ID=ca_xxxxx

# The redirect URI (must match what you set in Stripe)
supabase secrets set STRIPE_CONNECT_REDIRECT_URI=https://sjrntjjataqpueikvfei.supabase.co/functions/v1/stripe-connect-callback

# Your frontend URL (use your Netlify URL or localhost for testing)
supabase secrets set FRONTEND_URL=https://optimizedentryportal.netlify.app
# For local testing: supabase secrets set FRONTEND_URL=http://localhost:5174
```

**Important:** Replace all `YOUR-PROJECT-REF` and URLs with your actual values!

### 2.5 Verify Secrets

```bash
supabase secrets list
```

You should see all 4 secrets listed.

---

## Step 3: Create Database Table

Run the migration to create the `stripe_accounts` table:

### Option A: Using Supabase CLI

```bash
# Apply the migration
supabase db push
```

### Option B: Manually via Dashboard

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of:
   `/Users/ethankruger/OE portal/OptimizedEntryPortal/supabase/migrations/001_stripe_connect.sql`
5. Click **Run**

---

## Step 4: Deploy Edge Functions

Deploy all the Stripe-related functions:

```bash
# Navigate to your project
cd /Users/ethankruger/OE\ portal/OptimizedEntryPortal

# Deploy all functions
supabase functions deploy stripe-connect-oauth
supabase functions deploy stripe-connect-callback
supabase functions deploy create-invoice
supabase functions deploy send-invoice
supabase functions deploy stripe-webhook
```

### Verify Deployment

```bash
supabase functions list
```

You should see all 5 functions listed as deployed.

---

## Step 5: Test the Integration

### 5.1 Test Locally First

```bash
# Start your dev server
npm run dev
```

1. Open http://localhost:5174
2. Login to your portal
3. Navigate to **Invoices** page
4. You should see a **"Connect with Stripe"** button

### 5.2 Test the OAuth Flow

1. Click **"Connect with Stripe"**
2. You should be redirected to Stripe
3. Login with your test Stripe account
4. Click **"Connect"** or **"Authorize"**
5. You should be redirected back to your portal
6. The button should now show **"Stripe Connected ✓"**

### 5.3 Test Creating an Invoice

1. Click **"Create Invoice"** (should now be enabled)
2. Fill in customer details and line items
3. Click **"Create & Send"**
4. Check the customer's email (use your own email for testing)
5. Verify the invoice shows YOUR business name/branding

---

## Step 6: Deploy to Production

### 6.1 Update Environment Variables

If deploying to Netlify or another host:

1. Update `FRONTEND_URL` secret to your production URL:
   ```bash
   supabase secrets set FRONTEND_URL=https://your-actual-domain.com
   ```

2. Update Stripe redirect URI:
   - Go to Stripe Dashboard > Connect > Settings
   - Add your production callback URL:
     ```
     https://YOUR-PROJECT-REF.supabase.co/functions/v1/stripe-connect-callback
     ```

### 6.2 Switch to Live Mode (when ready)

⚠️ **Only do this when you're ready for real money!**

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get your **Live** secret key and client ID
3. Update Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
   supabase secrets set STRIPE_CONNECT_CLIENT_ID=ca_xxxxx  # Live client ID
   ```
4. Redeploy functions (they'll pick up new secrets automatically)

---

## Step 7: User Documentation

Update your user-facing docs to explain the new flow:

### For Business Owners:

**"How to Connect Stripe and Receive Payments"**

1. Go to the **Invoices** page
2. Click **"Connect with Stripe"**
3. Login to your Stripe account (or create one - takes 2 minutes)
4. Click **"Authorize"**
5. Done! You can now send invoices

**Money goes directly to your bank account** - we never touch it.

---

## Troubleshooting

### "Stripe account not connected" error when creating invoice

**Solution:** User needs to click "Connect with Stripe" first

### OAuth redirect fails

**Check:**
1. Redirect URI in Stripe settings matches exactly
2. `STRIPE_CONNECT_REDIRECT_URI` secret is set correctly
3. Function is deployed: `supabase functions list`

**Debug:**
```bash
supabase functions logs stripe-connect-callback
```

### "Invalid client_id" error

**Check:**
1. `STRIPE_CONNECT_CLIENT_ID` is set
2. It starts with `ca_`
3. It's from the Connect settings, not regular API keys

**Verify:**
```bash
supabase secrets list
```

### Invoice creation fails

**Check:**
1. User's Stripe account has `charges_enabled: true`
2. User completed Stripe onboarding
3. Access token is valid

**Debug:**
```bash
supabase functions logs create-invoice
```

### Users get stuck in OAuth loop

**Solution:** Clear the `stripe_accounts` table for that user:
```sql
DELETE FROM stripe_accounts WHERE user_id = 'user-id-here';
```

---

## Security Checklist

Before going live:

- [ ] All secrets are set in Supabase (never in code)
- [ ] Redirect URIs are exact matches in Stripe settings
- [ ] Row Level Security is enabled on `stripe_accounts` table
- [ ] Using HTTPS for production frontend URL
- [ ] Test mode works end-to-end
- [ ] Live keys are different from test keys
- [ ] `.env` files are in `.gitignore`

---

## What Users See

### User Experience:

1. **First visit to Invoices page:**
   - See "Connect with Stripe" button
   - See notice: "Connect your Stripe account to send invoices"
   - "Create Invoice" button is disabled

2. **After clicking Connect:**
   - Redirected to Stripe (stripe.com)
   - Login screen (or account creation)
   - Authorization page
   - Redirected back to your portal

3. **After connection:**
   - See "Stripe Connected ✓" with business name
   - "Create Invoice" button is enabled
   - Can send invoices immediately

4. **When customers receive invoice:**
   - Email from "Stripe on behalf of [Business Name]"
   - Invoice page shows business logo, name, address
   - Payment goes to business owner's bank account
   - No mention of "Optimized Entry Portal"

---

## Next Steps After Setup

1. **Test with real users** - Have a test business owner connect
2. **Monitor function logs** - Watch for errors
3. **Set up Stripe webhooks** - For invoice status updates (already coded)
4. **Consider platform fees** - You can take a % if desired (optional)
5. **Add dashboard** - Show total revenue across all users

---

## Quick Reference

### Important URLs

- Supabase Dashboard: `https://app.supabase.com/project/YOUR-REF`
- Stripe Dashboard: `https://dashboard.stripe.com`
- Stripe Connect Settings: `https://dashboard.stripe.com/settings/applications`
- Function Logs: `supabase functions logs FUNCTION-NAME`

### Important Commands

```bash
# Deploy a function
supabase functions deploy FUNCTION-NAME

# View logs
supabase functions logs FUNCTION-NAME --tail

# List secrets
supabase secrets list

# Set a secret
supabase secrets set KEY=value

# Run migration
supabase db push
```

---

## Support

If you get stuck:

1. Check function logs: `supabase functions logs stripe-connect-callback`
2. Verify secrets: `supabase secrets list`
3. Check Stripe webhook logs in Stripe Dashboard
4. Review [STRIPE_CONNECT_IMPLEMENTATION.md](STRIPE_CONNECT_IMPLEMENTATION.md) for architecture details

---

## Success Criteria

You'll know it's working when:

✅ User clicks "Connect with Stripe" → redirected to Stripe
✅ User authorizes → redirected back to portal
✅ Button shows "Stripe Connected ✓"
✅ "Create Invoice" button is enabled
✅ Invoice is sent successfully
✅ Customer receives email with business owner's branding
✅ Payment goes to business owner's Stripe account
✅ Invoice status updates automatically via webhooks

---

**You're almost there!** Just follow these steps and you'll have a fully functional multi-tenant invoicing system where users connect their own Stripe accounts with one click.
