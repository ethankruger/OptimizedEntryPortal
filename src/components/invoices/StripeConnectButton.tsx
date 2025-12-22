import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { StripeAccount } from '../../types/schema'

export function StripeConnectButton() {
  const { user } = useAuth()
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchStripeAccount()
    }
  }, [user])

  useEffect(() => {
    // Check for OAuth callback status
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_connect_success')) {
      setError(null)
      fetchStripeAccount()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('stripe_connect_error')) {
      setError(params.get('stripe_connect_error'))
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchStripeAccount = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      setStripeAccount(data)
    } catch (err: any) {
      console.error('Error fetching Stripe account:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!user) return

    setConnecting(true)
    setError(null)

    try {
      // Get the session to include auth token
      const { data: { session } } = await supabase.auth.getSession()

      const { data, error } = await supabase.functions.invoke('stripe-connect-oauth', {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)

      // Redirect to Stripe OAuth
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Failed to connect Stripe')
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-400 rounded-lg border border-slate-500/20">
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading Stripe status...</span>
      </div>
    )
  }

  if (stripeAccount) {
    const isFullySetup = stripeAccount.charges_enabled && stripeAccount.details_submitted

    return (
      <div className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          isFullySetup
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {isFullySetup ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isFullySetup ? 'Stripe Connected' : 'Stripe Setup Incomplete'}
            </p>
            {stripeAccount.business_name && (
              <p className="text-xs opacity-75">{stripeAccount.business_name}</p>
            )}
          </div>
        </div>

        {!isFullySetup && (
          <p className="text-xs text-[var(--text-secondary)]">
            Please complete your Stripe account setup to start sending invoices.
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-1 text-blue-400 hover:text-blue-300"
            >
              Go to Stripe Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#635BFF] hover:bg-[#0A2540] disabled:bg-[#635BFF]/50 text-white rounded-lg font-medium transition-colors"
      >
        {connecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
            </svg>
            Connect with Stripe
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 px-2">{error}</p>
      )}

      <p className="text-xs text-[var(--text-secondary)] px-2">
        Connect your Stripe account to start sending invoices. Money goes directly to your account.
      </p>
    </div>
  )
}
