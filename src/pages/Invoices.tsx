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
  const { data: stripeAccounts } = useCollection<StripeAccount>('stripe_accounts')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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
    if (!invoices) return []
    if (!searchTerm) return invoices

    const term = searchTerm.toLowerCase()
    return invoices.filter(
      inv =>
        inv.customer_name.toLowerCase().includes(term) ||
        inv.customer_email.toLowerCase().includes(term) ||
        inv.status.toLowerCase().includes(term)
    )
  }, [invoices, searchTerm])

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
            className="px-6 py-3 rounded-lg shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-300 hover:scale-105 border border-primary flex items-center gap-2"
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Invoices</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Draft</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.draft}</p>
            </div>
            <Clock className="w-8 h-8 text-slate-500 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Sent</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.sent}</p>
            </div>
            <Send className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Paid</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{stats.paid}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search invoices by customer name, email, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {invoice.customer_name}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {invoice.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        ${invoice.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {invoice.due_date
                          ? new Date(invoice.due_date).toLocaleDateString()
                          : 'No due date'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
