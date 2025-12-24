import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user_id
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    if (error) {
      // Redirect to frontend with error
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${Deno.env.get('FRONTEND_URL')}/invoices?stripe_connect_error=${encodeURIComponent(errorDescription || error)}`,
        },
      })
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    const userId = state

    // Exchange authorization code for access token
    const response = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: Deno.env.get('STRIPE_SECRET_KEY')!,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code')
    }

    const data = await response.json()

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(data.stripe_user_id)

    // Store the connected account in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('stripe_accounts')
      .upsert({
        user_id: userId,
        stripe_account_id: data.stripe_user_id,
        stripe_user_id: data.stripe_user_id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        scope: data.scope,
        account_type: account.type,
        business_name: account.business_profile?.name || account.settings?.dashboard?.display_name,
        business_email: account.email,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      }, {
        onConflict: 'user_id'
      })

    if (dbError) throw dbError

    // Redirect back to frontend with success
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get('FRONTEND_URL')}/invoices?stripe_connect_success=true`,
      },
    })
  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get('FRONTEND_URL')}/invoices?stripe_connect_error=${encodeURIComponent(error.message)}`,
      },
    })
  }
})
