import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) throw new Error('Unauthorized')

    // Get user's connected Stripe account
    const { data: stripeAccount, error: accountError } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (accountError || !stripeAccount) {
      throw new Error('Stripe account not connected. Please connect your Stripe account first.')
    }

    if (!stripeAccount.charges_enabled) {
      throw new Error('Your Stripe account is not fully set up. Please complete your Stripe account setup.')
    }

    const { customerEmail, customerName, lineItems, dueDate, notes } = await req.json()

    // Initialize Stripe with the platform secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create or retrieve Stripe customer on the connected account
    const customers = await stripe.customers.list(
      { email: customerEmail, limit: 1 },
      { stripeAccount: stripeAccount.stripe_account_id }
    )

    let customer: Stripe.Customer

    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create(
        {
          email: customerEmail,
          name: customerName,
        },
        { stripeAccount: stripeAccount.stripe_account_id }
      )
    }

    // Create invoice on the connected account
    const invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: dueDate ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
        description: notes,
      },
      { stripeAccount: stripeAccount.stripe_account_id }
    )

    // Add line items to invoice
    for (const item of lineItems) {
      await stripe.invoiceItems.create(
        {
          customer: customer.id,
          invoice: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount: Math.round(item.unit_amount * 100), // Convert to cents
        },
        { stripeAccount: stripeAccount.stripe_account_id }
      )
    }

    // Finalize the invoice (but don't send yet)
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      invoice.id,
      {},
      { stripeAccount: stripeAccount.stripe_account_id }
    )

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          id: finalizedInvoice.id,
          customer_id: customer.id,
          invoice_url: finalizedInvoice.hosted_invoice_url,
          total: finalizedInvoice.total / 100, // Convert from cents
          status: finalizedInvoice.status,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
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
