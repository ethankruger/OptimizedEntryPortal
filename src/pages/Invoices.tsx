import { useState, useMemo } from 'react'
import { Plus, Send, FileText, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '../components/layout/PageComponents'
import { PageContainer } from '../components/layout/PageComponents'
import { useCollection } from '../hooks/useCollection'
import type { Invoice, Inquiry, Appointment, StripeAccount } from '../types/schema'
import { CreateInvoiceDialog } from '../components/invoices/CreateInvoiceDialog'
import { StripeConnectButton } from '../components/invoices/StripeConnectButton'
import { useAuth } from '../context/AuthContext'

export function Invoices() {
  const { user } = useAuth()
  const { data: invoices, loading: invoicesLoading } = useCollection<Invoice>('invoices')
  const { data: inquiries } = useCollection<Inquiry>('inquiries')
  const { data: appointments } = useCollection<Appointment>('appointments')
  const { data: stripeAccounts } = useCollection<StripeAccount>('stripe_accounts', { orderBy: 'connected_at' })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const stripeAccount = useMemo(() => {
    if (!user || !stripeAccounts) return null
    return stripeAccounts.find(acc => acc.user_id === user.id) || null
  }, [user, stripeAccounts])

  const isStripeConnected = useMemo(() => {
    return stripeAccount?.charges_enabled && stripeAccount?.details_submitted
  }, [stripeAccount])

  const stats = useMemo(() => {
    const total = invoices?.length || 0
    const sent = invoices?.filter(inv => inv.status === 'sent').length || 0
    const paid = invoices?.filter(inv => inv.status === 'paid').length || 0
    const draft = invoices?.filter(inv => inv.status === 'draft').length || 0
    const totalRevenue = invoices?.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0) || 0

    return { total, sent, paid, draft, totalRevenue }
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    return invoices || []
  }, [invoices])

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'sent':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'draft':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'void':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'uncollectible':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'sent':
        return <Send className="w-3.5 h-3.5" />
      case 'draft':
        return <FileText className="w-3.5 h-3.5" />
      case 'void':
      case 'uncollectible':
        return <XCircle className="w-3.5 h-3.5" />
      default:
        return <Clock className="w-3.5 h-3.5" />
    }
  }

  const handleCreateInvoice = (inquiry?: Inquiry, appointment?: Appointment) => {
    setSelectedInquiry(inquiry || null)
    setSelectedAppointment(appointment || null)
    setIsCreateDialogOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Invoices"
        description="Create and manage customer invoices"
      >
        <div className="flex items-center gap-3">
          <StripeConnectButton />
          <button
            onClick={() => handleCreateInvoice()}
            disabled={!isStripeConnected}
            className="px-6 py-3 rounded-lg shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-primary-foreground)] text-sm font-medium transition-all duration-300 hover:scale-105 border border-primary flex items-center gap-2"
            title={!isStripeConnected ? 'Connect Stripe to create invoices' : 'Create a new invoice'}
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>
      </PageHeader>

      {/* Stripe Connection Notice */}
      {!isStripeConnected && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Connect your Stripe account</strong> to start sending invoices to customers. Money goes directly to your bank account.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
          <div className="p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">Total Invoices</span>
              <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                <FileText size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{stats.total}</h3>
              <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                All time
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
          <div className="p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">Draft</span>
              <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                <Clock size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{stats.draft}</h3>
              <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                Not sent
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
          <div className="p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">Sent</span>
              <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                <Send size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{stats.sent}</h3>
              <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                Awaiting payment
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
          <div className="p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">Paid</span>
              <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{stats.paid}</h3>
              <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
          <div className="p-4 flex flex-col h-full justify-between gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">Total Revenue</span>
              <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">
                ${stats.totalRevenue.toFixed(2)}
              </h3>
              <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                Total earned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 dark:border-white/10 border-black/10">
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 dark:border-white/10 border-black/10 bg-black/20 dark:bg-black/20 bg-white/20 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-2 font-semibold">Customer</th>
                <th className="px-4 py-2 font-semibold">Amount</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Due Date</th>
                <th className="px-4 py-2 font-semibold">Created</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 dark:divide-white/5 divide-black/5 text-sm">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] italic">
                    Accessing database...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-5">
                      <div className="p-5 rounded-full bg-white/5 dark:bg-white/5 bg-black/5">
                        <FileText size={24} />
                      </div>
                      <p>No invoices found. Create your first invoice to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors cursor-default">
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--text-primary)] group-hover:text-primary transition-colors leading-tight text-sm">
                          {invoice.customer_name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {invoice.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        ${invoice.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-2 justify-end">
                        {invoice.invoice_url && (
                          <a
                            href={invoice.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 transition-colors"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false)
          setSelectedInquiry(null)
          setSelectedAppointment(null)
        }}
        inquiries={inquiries || []}
        appointments={appointments || []}
        preSelectedInquiry={selectedInquiry}
        preSelectedAppointment={selectedAppointment}
      />
    </PageContainer>
  )
}
