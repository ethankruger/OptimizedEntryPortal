# Stripe Connect Implementation - Multi-Tenant Invoice System

## Overview

This document explains the **Stripe Connect** implementation that allows each business owner to use their own Stripe account. With this setup:

✅ **Business owners have ZERO technical setup**
- No copying/pasting API keys
- No Stripe dashboard configuration needed
- Just click "Connect with Stripe" and they're done

✅ **Money goes directly to business owners**
- Each user connects their own Stripe account
- Invoices are created on their account
- Payments go straight to their bank account
- You (the platform) never touch the money

✅ **Full branding control**
- Invoices show the business owner's name, logo, and branding
- Customer experience is completely white-labeled
- "Optimized Entry Portal" is invisible to end customers

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Business Owner (e.g., "Smith Plumbing")                │
│                                                           │
│  1. Clicks "Connect Stripe" in your portal               │
│  2. Redirected to Stripe OAuth                           │
│  3. Logs into their Stripe account                       │
│  4. Authorizes connection                                │
│  5. Returns to portal - connected! ✅                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Your Platform (Optimized Entry Portal)                  │
│                                                           │
│  - Stores connection token securely                      │
│  - Creates invoices on THEIR Stripe account              │
│  - Never sees their money                                │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Stripe                                                   │
│                                                           │
│  - Processes payments                                    │
│  - Money goes to business owner                          │
│  - You can optionally take platform fees                 │
└─────────────────────────────────────────────────────────┘
```

## Implementation Status

### ✅ Completed

1. **Database Schema** - `stripe_accounts` table created
   - Location: `supabase/migrations/001_stripe_connect.sql`
   - Stores connected Stripe accounts per user
   - Row-level security enabled

2. **TypeScript Types** - Added `StripeAccount` interface
   - Location: `src/types/schema.ts`

3. **Edge Functions** - Updated to use connected accounts
   - `create-invoice` - Creates invoices on user's Stripe account
   - `send-invoice` - Sends invoices from user's Stripe account
   - `stripe-connect-oauth` - Generates OAuth URL
   - `stripe-connect-callback` - Handles OAuth callback

4. **UI Component** - `StripeConnectButton`
   - Location: `src/components/invoices/StripeConnectButton.tsx`
   - Shows connection status
   - Initiates OAuth flow

### ⚠️ Remaining Work

1. **Platform Stripe Account Setup**
   - You need to create a Stripe **Platform** account (not regular)
   - Apply for Stripe Connect: https://dashboard.stripe.com/account/applications/settings
   - Get your `client_id` for OAuth

2. **Environment Variables**
   - Add to Supabase secrets:
     ```bash
     STRIPE_SECRET_KEY=sk_xxx  # Your PLATFORM secret key
     STRIPE_CONNECT_CLIENT_ID=ca_xxx  # From Stripe Connect settings
     STRIPE_CONNECT_REDIRECT_URI=https://xxx.supabase.co/functions/v1/stripe-connect-callback
     FRONTEND_URL=https://your-app.netlify.app  # Or localhost for dev
     ```

3. **UI Integration**
   - Add `<StripeConnectButton />` to Invoices page
   - Show connection status before allowing invoice creation
   - Display helpful messages if not connected

4. **Database Migration**
   - Run the SQL migration to create `stripe_accounts` table

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy stripe-connect-oauth
   supabase functions deploy stripe-connect-callback
   supabase functions deploy create-invoice
   supabase functions deploy send-invoice
   ```

6. **Update Documentation**
   - Revise `STRIPE_SETUP.md` for Stripe Connect flow
   - Update `BRANDING_GUIDE.md` to reflect new process

## Setup Instructions for Platform Owner (You)

### Step 1: Create Stripe Platform Account

1. Go to https://dashboard.stripe.com/account/applications/settings
2. Click "Build a Connect platform"
3. Fill in platform details:
   - Platform name: "Optimized Entry Portal"
   - Description: "Business management portal with invoicing"
   - Website: Your website
   - Support email: Your support email

4. Configure OAuth settings:
   - Redirect URI: `https://[your-project-ref].supabase.co/functions/v1/stripe-connect-callback`
   - Copy your `client_id` (starts with `ca_`)

### Step 2: Configure Supabase Secrets

```bash
# Your platform's Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx

# Stripe Connect client ID
supabase secrets set STRIPE_CONNECT_CLIENT_ID=ca_xxx

# OAuth redirect URI
supabase secrets set STRIPE_CONNECT_REDIRECT_URI=https://xxx.supabase.co/functions/v1/stripe-connect-callback

# Your frontend URL (for redirects after OAuth)
supabase secrets set FRONTEND_URL=https://your-app.com
```

### Step 3: Run Database Migration

```bash
# Apply the migration
supabase db push

# Or manually run the SQL in Supabase dashboard
```

### Step 4: Deploy Functions

```bash
supabase functions deploy stripe-connect-oauth
supabase functions deploy stripe-connect-callback
supabase functions deploy create-invoice
supabase functions deploy send-invoice
```

### Step 5: Update Frontend

Add the Stripe Connect button to the Invoices page and prevent invoice creation if not connected.

## User Experience (Business Owner)

### First Time Setup

1. User logs into your portal
2. Goes to Invoices page
3. Sees "Connect with Stripe" button
4. Clicks button → Redirected to Stripe
5. Logs into Stripe (or creates account)
6. Clicks "Authorize"
7. Redirected back to your portal
8. ✅ Connected! Can now send invoices

**Total time: ~2 minutes**

### Creating Invoices

Once connected, the flow is:
1. Select call/appointment or create manual invoice
2. Fill in line items and amounts
3. Click "Send Invoice"
4. Invoice is created on THEIR Stripe account
5. Customer receives email from THEIR business
6. Payment goes to THEIR bank account

## Security Considerations

### Access Tokens
- Stored in `stripe_accounts` table
- Protected by Row Level Security (RLS)
- Users can only see their own tokens
- Encrypted in transit (Supabase uses SSL)
- ⚠️ For production, consider encrypting at rest using Supabase Vault

### OAuth Flow
- State parameter prevents CSRF attacks
- Tokens are exchanged server-side (edge functions)
- Never exposed to frontend/browser

### Scopes
- Default scope: `read_write`
- Can be restricted to only invoice-related permissions
- Refresh tokens allow re-authentication without user intervention

## Platform Fees (Optional)

With Stripe Connect, you can optionally take a fee from each transaction:

### Application Fees
```typescript
await stripe.invoices.create({
  customer: customer.id,
  // ... other params
  application_fee_amount: 50, // $0.50 fee to platform
}, {
  stripeAccount: userStripeAccountId
})
```

### Transfer Fees
Alternative: Take a percentage
```typescript
application_fee_percent: 2.5, // 2.5% to platform
```

## Account Types

Stripe Connect supports different account types:

### Standard (Recommended for this use case)
- User creates/owns their own Stripe account
- Full control over their Stripe dashboard
- You facilitate payments via OAuth
- **This is what we've implemented**

### Express
- Stripe-hosted onboarding
- Limited dashboard access
- Faster setup

### Custom
- You handle all UX
- Most control
- Most complexity

## Troubleshooting

### User Can't Connect
- Check `STRIPE_CONNECT_CLIENT_ID` is set
- Verify redirect URI matches exactly in Stripe settings
- Check function logs: `supabase functions logs stripe-connect-oauth`

### Invoices Not Creating
- Verify user's Stripe account has `charges_enabled: true`
- Check function logs: `supabase functions logs create-invoice`
- Ensure access token is valid (doesn't expire with Standard accounts)

### Money Not Reaching User
- This is a Stripe account issue, not your platform
- User needs to complete Stripe onboarding
- Check their Stripe dashboard for payout settings

## Testing

### Test Mode
1. Use test mode client ID and secret key
2. Connect test Stripe accounts
3. Use test credit cards: `4242 4242 4242 4242`

### Production
1. Switch to live keys
2. Submit for Stripe review if needed
3. Complete platform verification

## Benefits Over Alternative Approaches

### ❌ Single Stripe Account (What we DON'T want)
- All money goes to you
- You have to pay out to business owners
- Tax complications
- More liability
- Business owners don't own customer relationships

### ❌ Per-User API Keys
- Users must copy/paste API keys
- Security risk (key exposure)
- Poor user experience
- Keys stored in your database

### ✅ Stripe Connect (What we implemented)
- Zero setup for users
- Direct payments to business owners
- Secure OAuth flow
- Professional integration
- Scalable for growth

## Next Steps

1. Complete Stripe Platform application
2. Set environment variables
3. Deploy functions
4. Integrate UI component
5. Test with test accounts
6. Deploy to production
7. Update user documentation

## Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [OAuth for Connect](https://stripe.com/docs/connect/oauth-reference)
- [Connect Account Types](https://stripe.com/docs/connect/accounts)
- [Testing Connect](https://stripe.com/docs/connect/testing)
