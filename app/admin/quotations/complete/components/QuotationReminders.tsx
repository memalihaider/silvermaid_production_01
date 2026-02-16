'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, File, Send, CheckCircle, AlertCircle, RefreshCw, User, Building2, Phone, Calendar, FileText, Loader2, MessageSquare, Smartphone, Filter, X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { getPDFAsBlob } from '@/lib/pdfGenerator'
import { sendEmailWithAttachment } from '@/lib/gmailService'
import { openWhatsAppWithQuotation, formatPhoneForWhatsApp } from '@/lib/whatsappService'

interface Quotation {
  id: string;
  quoteNumber: string;
  client: string;
  company: string;
  email: string;
  phone: string;
  total: number;
  currency: string;
  status: string;
  date: string;
  validUntil: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes: string;
  terms: string;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discount: number;
  discountType: string;
  location: string;
  dueDate?: string;
  paymentMethods?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
}

// Helper function to convert Quotation to QuotationData format
const convertToQuotationData = (quotation: Quotation): any => {
  return {
    id: quotation.id,
    quoteNumber: quotation.quoteNumber,
    client: quotation.client,
    company: quotation.company,
    email: quotation.email,
    phone: quotation.phone,
    total: quotation.total,
    currency: quotation.currency,
    status: quotation.status,
    date: quotation.date,
    validUntil: quotation.validUntil,
    services: quotation.services,
    products: quotation.products,
    notes: quotation.notes,
    terms: quotation.terms,
    subtotal: quotation.subtotal,
    taxAmount: quotation.taxAmount,
    taxRate: quotation.taxRate,
    discountAmount: quotation.discountAmount,
    discount: quotation.discount,
    discountType: quotation.discountType,
    location: quotation.location,
    dueDate: quotation.dueDate || quotation.validUntil || quotation.date,
    paymentMethods: quotation.paymentMethods || [],
    createdAt: quotation.createdAt || quotation.date || new Date(),
    updatedAt: quotation.updatedAt || new Date(),
    createdBy: quotation.createdBy || 'admin'
  }
}

export default function QuotationReminders() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([])
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, {
    email?: 'sending' | 'sent' | 'error';
    whatsapp?: 'sending' | 'sent' | 'error';
  }>>({})
  
  // Date filter states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDateFilter, setShowDateFilter] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    draft: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0
  })

  // Fetch all quotations
  const fetchAllQuotations = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'quotations'))
      
      const allQuotations: Quotation[] = snapshot.docs.map(doc => {
        const data = doc.data()
        
        return {
          id: doc.id,
          quoteNumber: data.quoteNumber || 'N/A',
          client: data.client || 'No Client',
          company: data.company || 'No Company',
          email: data.email || '',
          phone: data.phone || '',
          total: data.total || 0,
          currency: data.currency || 'AED',
          status: data.status || 'Draft',
          date: data.date || '',
          validUntil: data.validUntil || '',
          services: data.services || [],
          products: data.products || [],
          notes: data.notes || '',
          terms: data.terms || '',
          subtotal: data.subtotal || 0,
          taxAmount: data.taxAmount || 0,
          taxRate: data.taxRate || 0,
          discountAmount: data.discountAmount || 0,
          discount: data.discount || 0,
          discountType: data.discountType || 'percentage',
          location: data.location || '',
          dueDate: data.dueDate || data.validUntil || data.date,
          paymentMethods: data.paymentMethods || [],
          createdAt: data.createdAt || data.date || new Date(),
          updatedAt: data.updatedAt || new Date(),
          createdBy: data.createdBy || 'admin'
        }
      })
      
      // Sort by date (newest first)
      allQuotations.sort((a, b) => {
        return (b.date || '').localeCompare(a.date || '')
      })
      
      setQuotations(allQuotations)
      applyDateFilter(allQuotations, startDate, endDate)
      calculateStats(allQuotations)
      
    } catch (error) {
      console.error('Error fetching quotations:', error)
    }
  }

  // Apply date filter
  const applyDateFilter = (data: Quotation[], start: string, end: string) => {
    if (!start && !end) {
      setFilteredQuotations(data)
      return
    }
    
    const filtered = data.filter(q => {
      const quoteDate = q.date || ''
      if (!quoteDate) return false
      
      if (start && end) {
        return quoteDate >= start && quoteDate <= end
      } else if (start) {
        return quoteDate >= start
      } else if (end) {
        return quoteDate <= end
      }
      return true
    })
    
    setFilteredQuotations(filtered)
  }

  // Handle filter change
  const handleFilterChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    applyDateFilter(quotations, start, end)
  }

  // Clear date filter
  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setFilteredQuotations(quotations)
    setShowDateFilter(false)
  }

  // Calculate statistics
  const calculateStats = (data: Quotation[]) => {
    const total = data.length
    const sent = data.filter(q => q.status === 'Sent').length
    const draft = data.filter(q => q.status === 'Draft').length
    const approved = data.filter(q => q.status === 'Approved' || q.status === 'Accepted').length
    const rejected = data.filter(q => q.status === 'Rejected').length
    const totalValue = data.reduce((sum, q) => sum + (q.total || 0), 0)
    
    setStats({
      total,
      sent,
      draft,
      approved,
      rejected,
      totalValue
    })
  }

  useEffect(() => {
    fetchAllQuotations()
  }, [])

  // Update stats when quotations change
  useEffect(() => {
    calculateStats(quotations)
  }, [quotations])

  // Send email with PDF
  const handleSendEmail = async (quotation: Quotation) => {
    if (!quotation.email) {
      alert('Email address not available for this client')
      return
    }

    try {
      setSendingEmail(quotation.id)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], email: 'sending' } }))

      const quotationData = convertToQuotationData(quotation)
      const pdfBlob = getPDFAsBlob(quotationData)
      
      await sendEmailWithAttachment(
        quotationData,
        pdfBlob,
        // Success callback
        () => {
          setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], email: 'sent' } }))
          updateQuotationStatus(quotation.id, 'Sent')
          
          setTimeout(() => {
            alert(`✅ Email sent successfully to ${quotation.email}!`)
          }, 1000)
        },
        // Error callback
        (error) => {
          setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], email: 'error' } }))
          alert(`❌ Email error: ${error}`)
        }
      )

    } catch (error) {
      console.error('Error sending email:', error)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], email: 'error' } }))
      alert('❌ Error sending email')
    } finally {
      setSendingEmail(null)
    }
  }

  // Send WhatsApp with complete quotation details (NO PDF)
  const handleSendWhatsApp = async (quotation: Quotation) => {
    if (!quotation.phone) {
      alert('Phone number not available for this client')
      return
    }

    try {
      setSendingWhatsApp(quotation.id)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'sending' } }))

      const quotationData = convertToQuotationData(quotation)
      
      // Use the new function that opens WhatsApp with pre-filled message
      openWhatsAppWithQuotation(
        quotationData,
        // Success callback
        () => {
          setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'sent' } }))
          updateQuotationStatus(quotation.id, 'Sent')
        },
        // Error callback
        (error) => {
          setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'error' } }))
          alert(`❌ WhatsApp error: ${error}`)
        }
      )

    } catch (error) {
      console.error('Error opening WhatsApp:', error)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'error' } }))
      alert('❌ Error opening WhatsApp')
    } finally {
      setSendingWhatsApp(null)
    }
  }

  // Update quotation status
  const updateQuotationStatus = async (quotationId: string, status: string) => {
    try {
      const quotationRef = doc(db, 'quotations', quotationId)
      await updateDoc(quotationRef, {
        status: status,
        sentAt: new Date(),
        updatedAt: new Date()
      })
      
      // Update local state
      setQuotations(prev => prev.map(q => 
        q.id === quotationId ? { ...q, status } : q
      ))
      
    } catch (error) {
      console.error('Error updating quotation status:', error)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  // Get status icon
  const getStatusIcon = (type: 'email' | 'whatsapp', status?: string) => {
    if (status === 'sending') {
      return <Loader2 className="w-4 h-4 animate-spin" />
    } else if (status === 'sent') {
      return <CheckCircle className="w-4 h-4" />
    } else if (status === 'error') {
      return <AlertCircle className="w-4 h-4" />
    }
    return type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[12px] uppercase font-bold text-black flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Send Quotations via Email & WhatsApp
            </h3>
            <p className="text-xs text-gray-500">All quotations - Email with PDF, WhatsApp with details</p>
          </div>
          <button 
            onClick={fetchAllQuotations}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] uppercase font-bold rounded hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded p-2">
            <p className="text-[9px] uppercase font-bold text-gray-400">Total</p>
            <p className="text-lg font-black text-black">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <p className="text-[9px] uppercase font-bold text-gray-400">Sent</p>
            <p className="text-lg font-black text-blue-600">{stats.sent}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <p className="text-[9px] uppercase font-bold text-gray-400">Approved</p>
            <p className="text-lg font-black text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <p className="text-[9px] uppercase font-bold text-gray-400">Draft</p>
            <p className="text-lg font-black text-yellow-600">{stats.draft}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-2">
            <p className="text-[9px] uppercase font-bold text-gray-400">Total Value</p>
            <p className="text-lg font-black text-black">{formatCurrency(stats.totalValue)} AED</p>
          </div>
        </div>

        {/* Date Filter Section */}
        <div className="mb-4">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] uppercase font-bold rounded hover:bg-gray-200 transition-colors mb-2"
          >
            <Filter className="w-3 h-3" />
            {showDateFilter ? 'Hide Date Filter' : 'Show Date Filter'}
          </button>
          
          {showDateFilter && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-500">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleFilterChange(e.target.value, endDate)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-500">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleFilterChange(startDate, e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <button
                  onClick={clearDateFilter}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] uppercase font-bold rounded hover:bg-red-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear Filter
                </button>
              </div>
              
              {/* Filter Stats */}
              <div className="mt-2 text-[10px] text-gray-500">
                Showing {filteredQuotations.length} of {quotations.length} quotations
                {(startDate || endDate) && (
                  <span className="ml-1 text-blue-600">
                    (Filtered: {startDate || '∞'} to {endDate || '∞'})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Communication Options Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-bold text-blue-700">Email with PDF</p>
            </div>
            <p className="text-[11px] text-blue-600 mt-1">
              Opens Gmail with PDF attached
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <p className="text-xs font-bold text-green-700">WhatsApp with Details</p>
            </div>
            <p className="text-[11px] text-green-600 mt-1">
              Opens WhatsApp with complete quotation details
            </p>
          </div>
        </div>

        {filteredQuotations.length > 0 ? (
          <div className="space-y-3">
            {filteredQuotations.map(q => {
              const emailStatus = status[q.id]?.email
              const whatsappStatus = status[q.id]?.whatsapp
              const emailSent = emailStatus === 'sent'
              const whatsappSent = whatsappStatus === 'sent'
              
              return (
                <div 
                  key={q.id} 
                  className={`border rounded p-4 transition-all ${
                    emailSent || whatsappSent ? 'bg-green-50 border-green-200' :
                    q.status === 'Sent' ? 'bg-blue-50 border-blue-200' :
                    'bg-white border-gray-300 hover:border-black'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Section - Quotation Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-black rounded">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[15px] font-bold text-black">{q.quoteNumber}</p>
                            {(emailSent || whatsappSent) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3" />
                                Sent
                              </span>
                            )}
                            {!emailSent && !whatsappSent && q.status === 'Sent' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-100 text-blue-700">
                                <CheckCircle className="w-3 h-3" />
                                {q.status}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] font-bold text-gray-700">{q.client}</p>
                          <p className="text-[11px] text-gray-500">{q.company}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(q.date)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">Email</p>
                              <p className="text-[11px] font-bold text-gray-700 truncate">{q.email || 'No email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">WhatsApp</p>
                              <p className="text-[11px] font-bold text-gray-700">{q.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">Valid Until</p>
                              <p className="text-[11px] font-bold text-gray-700">{formatDate(q.validUntil)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <File className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">Total Amount</p>
                              <p className="text-[11px] font-bold text-gray-700">{formatCurrency(q.total)} {q.currency}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Communication Buttons */}
                    <div className="md:text-right">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-black">{formatCurrency(q.total)} {q.currency}</p>
                        <p className="text-[11px] text-gray-500">Total Amount</p>
                      </div>
                      
                      {/* Communication Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Email Button */}
                        <button 
                          onClick={() => handleSendEmail(q)}
                          disabled={sendingEmail === q.id || emailSent || !q.email}
                          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded text-[10px] uppercase font-bold transition-colors ${
                            emailSent
                              ? 'bg-green-500 text-white cursor-not-allowed'
                              : emailStatus === 'sending'
                              ? 'bg-blue-500 text-white cursor-not-allowed'
                              : emailStatus === 'error'
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : !q.email
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon('email', emailStatus)}
                            <span>Email</span>
                          </div>
                          {emailStatus === 'sending' && <span className="text-[9px]">Sending...</span>}
                          {emailSent && <span className="text-[9px]">Sent</span>}
                        </button>
                        
                        {/* WhatsApp Button - Opens with complete details */}
                        <button 
                          onClick={() => handleSendWhatsApp(q)}
                          disabled={sendingWhatsApp === q.id || whatsappSent || !q.phone}
                          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded text-[10px] uppercase font-bold transition-colors ${
                            whatsappSent
                              ? 'bg-green-500 text-white cursor-not-allowed'
                              : whatsappStatus === 'sending'
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : whatsappStatus === 'error'
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : !q.phone
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon('whatsapp', whatsappStatus)}
                            <span>WhatsApp</span>
                          </div>
                          {whatsappStatus === 'sending' && <span className="text-[9px]">Opening...</span>}
                          {whatsappSent && <span className="text-[9px]">Sent</span>}
                        </button>
                      </div>
                      
                      {/* Contact Status */}
                      <div className="mt-2 space-y-1">
                        {!q.email && (
                          <p className="text-[9px] text-red-500 text-center">No email address</p>
                        )}
                        {!q.phone && (
                          <p className="text-[9px] text-red-500 text-center">No phone number</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Communication Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Email Details</p>
                        {q.email ? (
                          <>
                            <p className="text-[11px] text-gray-600">
                              To: <span className="font-bold">{q.email}</span>
                            </p>
                            <p className="text-[9px] text-gray-500">
                              PDF attached, opens Gmail
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">No email available</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">WhatsApp Details</p>
                        {q.phone ? (
                          <>
                            <p className="text-[11px] text-gray-600">
                              To: <span className="font-bold">{q.phone}</span>
                            </p>
                            <p className="text-[9px] text-gray-500">
                              Complete quotation details pre-filled
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">No phone available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No Quotations Found</p>
            <p className="text-xs text-gray-500 mt-1">
              {startDate || endDate ? 'Try changing your date filter' : 'Create quotations to send via Email or WhatsApp'}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-700">Communication Summary</p>
            <p className="text-[10px] text-gray-500">
              Total: {filteredQuotations.length} quotations (filtered) | 
              Email Ready: {filteredQuotations.filter(q => q.email).length} | 
              WhatsApp Ready: {filteredQuotations.filter(q => q.phone).length} |
              Sent Status: {filteredQuotations.filter(q => q.status === 'Sent').length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-blue-500" />
                <p className="text-[11px] font-bold text-gray-700">Email with PDF</p>
              </div>
              <p className="text-[10px] text-gray-500">Opens Gmail automatically</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <p className="text-[11px] font-bold text-gray-700">WhatsApp Details</p>
              </div>
              <p className="text-[10px] text-gray-500">Opens with pre-filled text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}