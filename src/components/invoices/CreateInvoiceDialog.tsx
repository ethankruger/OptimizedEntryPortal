import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Send, Save } from 'lucide-react'
import type { Inquiry, Appointment, InvoiceLineItem } from '../../types/schema'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

interface CreateInvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  inquiries: Inquiry[]
  appointments: Appointment[]
  preSelectedInquiry?: Inquiry | null
  preSelectedAppointment?: Appointment | null
}

export function CreateInvoiceDialog({
  isOpen,
  onClose,
  inquiries,
  appointments,
  preSelectedInquiry,
  preSelectedAppointment,
}: CreateInvoiceDialogProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'select' | 'create'>('select')
  const [selectedSource, setSelectedSource] = useState<'inquiry' | 'appointment' | 'manual'>('manual')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: '', quantity: 1, unit_amount: 0 },
  ])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (preSelectedInquiry) {
        setSelectedSource('inquiry')
        setSelectedInquiry(preSelectedInquiry)
        setStep('create')
      } else if (preSelectedAppointment) {
        setSelectedSource('appointment')
        setSelectedAppointment(preSelectedAppointment)
        setStep('create')
      } else {
        setStep('select')
      }
    }
  }, [isOpen, preSelectedInquiry, preSelectedAppointment])

  useEffect(() => {
    if (selectedInquiry) {
      setCustomerName(selectedInquiry.customer_name || '')
      setCustomerEmail(selectedInquiry.customer_email || '')
      setCustomerPhone(selectedInquiry.customer_phone || '')
      setLineItems([
        {
          description: selectedInquiry.description || selectedInquiry.inquiry_type || '',
          quantity: 1,
          unit_amount: 0,
        },
      ])
    } else if (selectedAppointment) {
      setCustomerName(selectedAppointment.customer_name || '')
      setCustomerEmail(selectedAppointment.customer_email || '')
      setCustomerPhone(selectedAppointment.customer_phone || '')

      const quotedPrice = selectedAppointment.quoted_price
        ? parseFloat(selectedAppointment.quoted_price.replace(/[^0-9.]/g, ''))
        : 0

      setLineItems([
        {
          description: selectedAppointment.service_description || selectedAppointment.service_type || '',
          quantity: 1,
          unit_amount: quotedPrice,
        },
      ])
    }
  }, [selectedInquiry, selectedAppointment])

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_amount: 0 }])
  }

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_amount, 0)
  }

  const handleProceed = () => {
    if (selectedSource === 'inquiry' && selectedInquiry) {
      setStep('create')
    } else if (selectedSource === 'appointment' && selectedAppointment) {
      setStep('create')
    } else if (selectedSource === 'manual') {
      setStep('create')
    }
  }

  const handleCreateInvoice = async (sendImmediately: boolean = false) => {
    if (!user) return

    setError(null)
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!customerName || !customerEmail) {
        throw new Error('Customer name and email are required')
      }

      if (lineItems.some(item => !item.description || item.unit_amount <= 0)) {
        throw new Error('All line items must have a description and amount greater than 0')
      }

      // Call Supabase Edge Function to create Stripe invoice
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'create-invoice',
        {
          body: {
            customerEmail,
            customerName,
            lineItems,
            dueDate,
            notes,
          },
        }
      )

      if (functionError) throw functionError
      if (!functionData.success) throw new Error(functionData.error)

      const subtotal = calculateSubtotal()
      const total = subtotal

      // Save invoice to database
      const { error: dbError } = await supabase.from('invoices').insert({
        user_id: user.id,
        inquiry_id: selectedInquiry?.id || null,
        appointment_id: selectedAppointment?.id || null,
        stripe_invoice_id: functionData.invoice.id,
        stripe_customer_id: functionData.invoice.customer_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        line_items: lineItems,
        subtotal,
        total,
        status: 'draft',
        due_date: dueDate || null,
        invoice_url: functionData.invoice.invoice_url,
        notes: notes || null,
      })

      if (dbError) throw dbError

      // Send invoice if requested
      if (sendImmediately) {
        const { data: sendData, error: sendError } = await supabase.functions.invoke(
          'send-invoice',
          {
            body: { invoiceId: functionData.invoice.id },
          }
        )

        if (sendError) throw sendError
        if (!sendData.success) throw new Error(sendData.error)

        // Update invoice status
        await supabase
          .from('invoices')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('stripe_invoice_id', functionData.invoice.id)
      }

      // Reset form and close
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('select')
    setSelectedSource('manual')
    setSelectedInquiry(null)
    setSelectedAppointment(null)
    setCustomerName('')
    setCustomerEmail('')
    setCustomerPhone('')
    setLineItems([{ description: '', quantity: 1, unit_amount: 0 }])
    setDueDate('')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {step === 'select' ? 'Select Invoice Source' : 'Create Invoice'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Choose how you want to create this invoice:
              </p>

              {/* Manual Invoice */}
              <label className="flex items-start gap-3 p-4 border border-[var(--border-primary)] rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                <input
                  type="radio"
                  name="source"
                  value="manual"
                  checked={selectedSource === 'manual'}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Manual Invoice</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Create a new invoice from scratch
                  </p>
                </div>
              </label>

              {/* From Inquiry */}
              <label className="flex items-start gap-3 p-4 border border-[var(--border-primary)] rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                <input
                  type="radio"
                  name="source"
                  value="inquiry"
                  checked={selectedSource === 'inquiry'}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">From Call/Inquiry</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    Pre-fill customer info from a call
                  </p>
                  {selectedSource === 'inquiry' && (
                    <select
                      value={selectedInquiry?.id || ''}
                      onChange={(e) => {
                        const inquiry = inquiries.find((i) => i.id === e.target.value)
                        setSelectedInquiry(inquiry || null)
                      }}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
                    >
                      <option value="">Select an inquiry...</option>
                      {inquiries.map((inquiry) => (
                        <option key={inquiry.id} value={inquiry.id}>
                          {inquiry.customer_name} - {inquiry.inquiry_type} (
                          {new Date(inquiry.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              {/* From Appointment */}
              <label className="flex items-start gap-3 p-4 border border-[var(--border-primary)] rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                <input
                  type="radio"
                  name="source"
                  value="appointment"
                  checked={selectedSource === 'appointment'}
                  onChange={(e) => setSelectedSource(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">From Appointment</p>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    Use appointment details and quoted price
                  </p>
                  {selectedSource === 'appointment' && (
                    <select
                      value={selectedAppointment?.id || ''}
                      onChange={(e) => {
                        const appointment = appointments.find((a) => a.id === e.target.value)
                        setSelectedAppointment(appointment || null)
                      }}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
                    >
                      <option value="">Select an appointment...</option>
                      {appointments.map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {appointment.customer_name} - {appointment.service_type} (
                          {appointment.appointment_date})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>

              <button
                onClick={handleProceed}
                disabled={
                  (selectedSource === 'inquiry' && !selectedInquiry) ||
                  (selectedSource === 'appointment' && !selectedAppointment)
                }
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">Line Items</h3>
                  <button
                    onClick={handleAddLineItem}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unit_amount}
                        onChange={(e) => handleLineItemChange(index, 'unit_amount', parseFloat(e.target.value) || 0)}
                        className="w-28 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm"
                        min="0"
                        step="0.01"
                      />
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveLineItem(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-secondary)]">Subtotal</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      ${calculateSubtotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] resize-none"
                  placeholder="Additional notes for this invoice..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'create' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-primary)]">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateInvoice(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleCreateInvoice(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Create & Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
