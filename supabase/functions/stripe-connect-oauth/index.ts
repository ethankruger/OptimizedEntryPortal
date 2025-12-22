import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    const clientId = Deno.env.get('STRIPE_CONNECT_CLIENT_ID')
    const redirectUri = Deno.env.get('STRIPE_CONNECT_REDIRECT_URI')

    if (!clientId || !redirectUri) {
      throw new Error('Stripe Connect not configured. Please set STRIPE_CONNECT_CLIENT_ID and STRIPE_CONNECT_REDIRECT_URI')
    }

    // Generate Stripe Connect OAuth URL
    const stripeOAuthUrl = new URL('https://connect.stripe.com/oauth/authorize')
    stripeOAuthUrl.searchParams.set('response_type', 'code')
    stripeOAuthUrl.searchParams.set('client_id', clientId)
    stripeOAuthUrl.searchParams.set('scope', 'read_write')
    stripeOAuthUrl.searchParams.set('redirect_uri', redirectUri)
    stripeOAuthUrl.searchParams.set('state', userId) // Pass user ID as state for callback

    return new Response(
      JSON.stringify({
        success: true,
        url: stripeOAuthUrl.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('stripe-connect-oauth error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
