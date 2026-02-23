'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Plus, Search, Filter, Download, Send, Trash2, Edit, Eye, MoreHorizontal, 
  ChevronDown, Check, AlertCircle, CheckCircle, X, Mail, Phone, FileText, 
  DollarSign, Calendar, User, Building2, MapPin, Percent, Tag, ShoppingCart, 
  Sparkles, Settings, FileCheck, Clock, TrendingUp, Copy, MessageSquare, 
  MessageCircle, Save, ArrowRight
} from 'lucide-react'

interface Quotation {
  id: number
  quoteNumber: string
  clientId: string | number
  client: string
  email: string
  phone: string
  location: string
  amount: number
  amountOriginal?: number
  discount?: number
  discountType?: 'percentage' | 'fixed'
  tax?: number
  taxRate?: number
  currency?: string
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled'
  date: string
  validUntil: string
  services: string[]
  products: any[]
  notes?: string
  company?: string
  version?: number
  lastModified?: string
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected'
  approvalMargin?: number
  approvalDiscount?: number
  contractId?: string | number
  sharedWith?: string[]
  attachments?: string[]
}

interface Service {
  id: number
  name: string
  price: number
  unit: string
  category?: string
  description?: string
}

interface Product {
  id: number
  name: string
  quantity: number
  price: number
  unit: string
  category?: string
  sku?: string
}

interface Client {
  id: number
  name: string
  company: string
  email: string
  phone: string
  location: string
  contactPerson: string
  industry?: string
  tier?: string
}

interface Contract {
  id: number
  contractNumber: string
  client: string
  clientId: number
  company: string
  email: string
  phone: string
  location: string
  quotationId: number
  startDate: string
  endDate: string
  value: string
  baseValue: number
  status: string
  services: string[]
  terms: string
  paymentTerms: string
  renewalTerms: string
  specialConditions: string
  signedDate: string
  lastModified: string
  version: number
}

// Mock data
const mockQuotations: Quotation[] = [
  {
    id: 1,
    quoteNumber: '#QT-001-2025',
    clientId: 1,
    client: 'Ahmed Al-Mansouri',
    email: 'ahmed@dubaiprop.ae',
    phone: '+971-50-1111111',
    location: 'Dubai Marina',
    company: 'Dubai Properties LLC',
    amount: 25500,
    amountOriginal: 30000,
    discount: 15,
    discountType: 'percentage',
    taxRate: 5,
    currency: 'AED',
    status: 'Sent',
    date: '2025-01-18',
    validUntil: '2025-02-18',
    services: ['Residential Cleaning', 'Deep Cleaning'],
    products: [
      { id: 1, name: 'Cleaning Supplies Kit', quantity: 2, price: 500, unit: 'per unit' },
      { id: 2, name: 'Equipment Rental', quantity: 1, price: 1000, unit: 'per month' }
    ],
    notes: 'Initial quote for monthly cleaning services',
    version: 1,
    approvalStatus: 'Approved',
    approvalMargin: 22,
    approvalDiscount: 15,
    lastModified: '2025-01-17'
  },
  {
    id: 2,
    quoteNumber: '#QT-002-2025',
    clientId: 2,
    client: 'Layla Hassan',
    email: 'layla@paradisehotels.ae',
    phone: '+971-50-4444444',
    location: 'Palm Jumeirah',
    company: 'Paradise Hotels & Resorts',
    amount: 102000,
    amountOriginal: 102000,
    discount: 0,
    discountType: 'percentage',
    taxRate: 5,
    currency: 'AED',
    status: 'Accepted',
    date: '2025-01-17',
    validUntil: '2025-02-17',
    services: ['Medical Facility Sanitization'],
    products: [],
    notes: 'High-value hotel maintenance contract',
    version: 2,
    approvalStatus: 'Approved',
    approvalMargin: 28,
    approvalDiscount: 0,
    contractId: 2,
    lastModified: '2025-01-18'
  },
  {
    id: 3,
    quoteNumber: '#QT-003-2025',
    clientId: 3,
    client: 'Fatima Al-Noor',
    email: 'fatima@alnoorlogistics.ae',
    phone: '+971-50-2222222',
    location: 'Dubai Industrial City',
    company: 'Al Noor Logistics',
    amount: 45000,
    amountOriginal: 50000,
    discount: 10,
    discountType: 'percentage',
    taxRate: 5,
    currency: 'AED',
    status: 'Draft',
    date: '2025-01-18',
    validUntil: '2025-02-18',
    services: ['Commercial Office'],
    products: [],
    notes: 'Warehouse cleaning proposal',
    version: 1,
    approvalStatus: 'Pending',
    approvalMargin: 18,
    approvalDiscount: 10,
    lastModified: '2025-01-18'
  },
  {
    id: 4,
    quoteNumber: '#QT-004-2025',
    clientId: 4,
    client: 'Mohammed Al-Zahra',
    email: 'mohammed@emmc.ae',
    phone: '+971-50-3333333',
    location: 'Dubai Healthcare City',
    company: 'Emirates Medical Center',
    amount: 32000,
    amountOriginal: 32000,
    discount: 5,
    discountType: 'percentage',
    taxRate: 5,
    currency: 'AED',
    status: 'Rejected',
    date: '2025-01-15',
    validUntil: '2025-02-15',
    services: ['Medical Facility'],
    products: [],
    notes: 'Medical facility sanitization - client negotiating price',
    version: 1,
    approvalStatus: 'Approved',
    approvalMargin: 25,
    approvalDiscount: 5,
    lastModified: '2025-01-15'
  },
  {
    id: 5,
    quoteNumber: '#QT-005-2025',
    clientId: 5,
    client: 'Sara Al-Mahmoud',
    email: 'sara@royalmall.ae',
    phone: '+971-50-5555555',
    location: 'Dubai Mall Area',
    company: 'Royal Mall Group',
    amount: 68000,
    amountOriginal: 68000,
    discount: 8,
    discountType: 'percentage',
    taxRate: 5,
    currency: 'AED',
    status: 'Expired',
    date: '2025-01-10',
    validUntil: '2025-02-10',
    services: ['Deep Cleaning', 'Commercial Office'],
    products: [],
    notes: 'Mall premises quarterly cleaning contract',
    version: 1,
    approvalStatus: 'Approved',
    approvalMargin: 20,
    approvalDiscount: 8,
    lastModified: '2025-01-10'
  }
]

const mockContracts: Contract[] = [
  {
    id: 1,
    contractNumber: '#CT-001',
    client: 'Ahmed Al-Mansouri',
    clientId: 1,
    company: 'Dubai Properties LLC',
    email: 'ahmed@dubaiprop.ae',
    phone: '+971-50-1111111',
    location: 'Dubai Marina',
    quotationId: 1,
    startDate: '2025-12-20',
    endDate: '2026-12-19',
    value: 'AED 75,000',
    baseValue: 75000,
    status: 'Active',
    services: ['Residential Cleaning', 'Deep Cleaning'],
    terms: 'Monthly cleaning services for residential properties.',
    paymentTerms: 'Monthly in advance',
    renewalTerms: 'Automatic renewal for 12 months unless 30 days notice given',
    specialConditions: '24/7 emergency response available.',
    signedDate: '2025-12-19',
    lastModified: '2025-12-19',
    version: 1
  },
  {
    id: 2,
    contractNumber: '#CT-002',
    client: 'Layla Hassan',
    clientId: 2,
    company: 'Paradise Hotels & Resorts',
    email: 'layla@paradisehotels.ae',
    phone: '+971-50-4444444',
    location: 'Palm Jumeirah',
    quotationId: 2,
    startDate: '2025-12-22',
    endDate: '2027-12-21',
    value: 'AED 408,000',
    baseValue: 408000,
    status: 'Active',
    services: ['Medical Facility Sanitization'],
    terms: 'Comprehensive facility sanitization and cleaning services.',
    paymentTerms: 'Quarterly in advance',
    renewalTerms: 'Automatic renewal for 12 months unless 60 days notice given',
    specialConditions: 'HIPAA compliance required. Priority response within 4 hours.',
    signedDate: '2025-12-21',
    lastModified: '2025-12-21',
    version: 1
  }
]

const mockClients: Client[] = [
  {
    id: 1,
    name: 'Ahmed Al-Mansouri',
    company: 'Dubai Properties LLC',
    email: 'ahmed@dubaiprop.ae',
    phone: '+971-50-1111111',
    location: 'Dubai Marina',
    contactPerson: 'Ahmed Al-Mansouri',
    tier: 'Gold'
  },
  {
    id: 2,
    name: 'Layla Hassan',
    company: 'Paradise Hotels',
    email: 'layla@paradisehotels.ae',
    phone: '+971-50-4444444',
    location: 'Palm Jumeirah',
    contactPerson: 'Layla Hassan',
    tier: 'Platinum'
  },
  {
    id: 3,
    name: 'Fatima Al-Noor',
    company: 'Al Noor Logistics',
    email: 'fatima@alnoorlogistics.ae',
    phone: '+971-50-2222222',
    location: 'Dubai Industrial City',
    contactPerson: 'Fatima Al-Noor',
    tier: 'Silver'
  },
  {
    id: 4,
    name: 'Mohammed Al-Zahra',
    company: 'Emirates Medical Center',
    email: 'mohammed@emmc.ae',
    phone: '+971-50-3333333',
    location: 'Dubai Healthcare City',
    contactPerson: 'Dr. Mohammed Al-Zahra',
    tier: 'Platinum'
  },
  {
    id: 5,
    name: 'Sara Al-Mahmoud',
    company: 'Royal Mall Group',
    email: 'sara@royalmall.ae',
    phone: '+971-50-5555555',
    location: 'Dubai Mall Area',
    contactPerson: 'Sara Al-Mahmoud',
    tier: 'Gold'
  }
]

export default function UnifiedQuotations() {
  const [activeTab, setActiveTab] = useState<'quotations' | 'approval' | 'builder' | 'preview' | 'contracts' | 'history'>('quotations')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([])
  const [quotations, setQuotations] = useState(mockQuotations)
  const [contracts, setContracts] = useState(mockContracts)
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMethod, setShareMethod] = useState<'email' | 'whatsapp' | null>(null)

  // Filter quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = q.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || q.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [quotations, searchTerm, statusFilter])

  // Quotation statistics
  const stats = useMemo(() => {
    const total = quotations.length
    const sent = quotations.filter(q => q.status === 'Sent').length
    const accepted = quotations.filter(q => q.status === 'Accepted').length
    const pending = quotations.filter(q => q.status === 'Draft').length
    const totalAmount = quotations.reduce((sum, q) => sum + q.amount, 0)
    
    return { total, sent, accepted, pending, totalAmount }
  }, [quotations])

  // Share quotation handler
  const handleShareQuotation = (quote: Quotation, method: 'email' | 'whatsapp') => {
    if (method === 'email') {
      const subject = `Quotation ${quote.quoteNumber} - ${quote.company}`
      const body = `
Dear ${quote.client},

Please find attached quotation ${quote.quoteNumber} for your review.

Amount: ${quote.currency} ${quote.amount.toLocaleString()}
Valid Until: ${quote.validUntil}
Services: ${quote.services.join(', ')}

${quote.notes ? `Notes: ${quote.notes}` : ''}

Best regards,
Silver Maid Team
      `
      window.location.href = `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    } else if (method === 'whatsapp') {
      const message = `
Hi ${quote.client},

I wanted to share quotation ${quote.quoteNumber} with you.

Amount: ${quote.currency} ${quote.amount.toLocaleString()}
Valid Until: ${quote.validUntil}
Services: ${quote.services.join(', ')}

${quote.notes ? `Notes: ${quote.notes}` : ''}

Please let me know if you have any questions!
      `
      const whatsappUrl = `https://wa.me/${quote.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  // Delete quotation
  const handleDeleteQuotation = (id: number) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter(q => q.id !== id))
      setSelectedQuote(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-blue-100 text-blue-800'
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="w-full px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Quotations Management</h1>
          <p className="text-slate-600 mt-2">Manage, approve, and share quotations with clients</p>
        </div>

        {/* Tab Navigation - Grid Layout */}
        <div className="mb-8 bg-white rounded-xl border border-slate-200 p-1 shadow-sm grid grid-cols-3 lg:grid-cols-6 gap-2">
          {(['quotations', 'approval', 'builder', 'preview', 'contracts', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedQuote(null)
              }}
              className={`py-3 px-2 rounded-lg font-semibold transition-all flex flex-col items-center gap-1 text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'quotations' && <FileText size={18} />}
              {tab === 'approval' && <CheckCircle size={18} />}
              {tab === 'builder' && <Plus size={18} />}
              {tab === 'preview' && <Eye size={18} />}
              {tab === 'contracts' && <FileCheck size={18} />}
              {tab === 'history' && <Clock size={18} />}
              <span className="text-xs lg:text-sm capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Quotations</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <FileText className="text-blue-600" size={28} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Sent</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.sent}</p>
                  </div>
                  <Send className="text-purple-600" size={28} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Accepted</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.accepted}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={28} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">AED {(stats.totalAmount / 1000).toFixed(0)}K</p>
                  </div>
                  <DollarSign className="text-green-600" size={28} />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by client, quote number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>All</option>
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Accepted</option>
                    <option>Rejected</option>
                    <option>Expired</option>
                    <option>Cancelled</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={20} />
                    <span className="hidden lg:inline">New Quote</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quotations List */}
            <div className="space-y-4">
              {filteredQuotations.map(quote => (
                <div
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className={`bg-white rounded-xl border ${selectedQuote?.id === quote.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} p-4 lg:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    <div className="lg:col-span-2">
                      <p className="font-bold text-slate-900">{quote.client}</p>
                      <p className="text-sm text-slate-600">{quote.quoteNumber}</p>
                      <p className="text-xs text-slate-500 mt-1">{quote.company}</p>
                    </div>
                    <div className="hidden lg:block">
                      <p className="font-semibold text-slate-900">AED {quote.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-600">Valid: {quote.validUntil}</p>
                    </div>
                    <div className="hidden lg:block">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                    <div className="hidden lg:block">
                      {quote.approvalStatus && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          quote.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                          quote.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quote.approvalStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedQuote(quote)
                          setShowShareModal(true)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Share quotation"
                      >
                        <Send size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteQuotation(quote.id)
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete quotation"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile details */}
                  <div className="lg:hidden mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-semibold">AED {quote.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(quote.status)}`}>{quote.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valid Until:</span>
                      <span>{quote.validUntil}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Quote Details */}
            {selectedQuote && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Quotation Details</h2>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Client</p>
                      <p className="text-lg font-semibold text-slate-900">{selectedQuote.client}</p>
                      <p className="text-sm text-slate-600">{selectedQuote.company}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-slate-600 font-medium flex items-center gap-1">
                          <Mail size={16} /> Email
                        </p>
                        <p className="text-slate-900">{selectedQuote.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium flex items-center gap-1">
                          <Phone size={16} /> Phone
                        </p>
                        <p className="text-slate-900">{selectedQuote.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium flex items-center gap-1">
                        <MapPin size={16} /> Location
                      </p>
                      <p className="text-slate-900">{selectedQuote.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Quote Number</p>
                      <p className="text-slate-900 font-mono">{selectedQuote.quoteNumber}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Date</p>
                        <p className="text-slate-900">{selectedQuote.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium">Valid Until</p>
                        <p className="text-slate-900">{selectedQuote.validUntil}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600 font-medium mb-2">Amount Breakdown</p>
                      <div className="space-y-2">
                        {selectedQuote.amountOriginal && (
                          <div className="flex justify-between">
                            <span className="text-slate-700">Original:</span>
                            <span className="font-semibold">AED {selectedQuote.amountOriginal.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedQuote.discount && (
                          <div className="flex justify-between text-red-600">
                            <span>Discount ({selectedQuote.discountType === 'percentage' ? selectedQuote.discount + '%' : 'AED'}):</span>
                            <span className="font-semibold">-AED {(selectedQuote.amountOriginal ? selectedQuote.amountOriginal - selectedQuote.amount : selectedQuote.discount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold">Final Amount:</span>
                          <span className="text-lg font-bold text-blue-600">AED {selectedQuote.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuote.services.map((service, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-2">Status</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedQuote.status)}`}>
                          Quote: {selectedQuote.status}
                        </span>
                        {selectedQuote.approvalStatus && (
                          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            selectedQuote.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            selectedQuote.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Approval: {selectedQuote.approvalStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedQuote.notes && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">Notes</p>
                    <p className="text-slate-700">{selectedQuote.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedQuote(selectedQuote)
                      setShowShareModal(true)
                      setShareMethod('email')
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Mail size={18} /> Send via Email
                  </button>
                  <button
                    onClick={() => {
                      handleShareQuotation(selectedQuote, 'whatsapp')
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                  >
                    <MessageCircle size={18} /> Share on WhatsApp
                  </button>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 flex items-center gap-2">
                    <Download size={18} /> Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* APPROVAL TAB */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quotation Approval Queue</h2>
              
              {quotations.filter(q => q.approvalStatus === 'Pending').length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                  <p className="text-slate-600">All quotations have been approved!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.filter(q => q.approvalStatus === 'Pending').map(quote => (
                    <div key={quote.id} className="border border-slate-200 rounded-lg p-4 bg-yellow-50">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{quote.client}</p>
                          <p className="text-sm text-slate-600">{quote.quoteNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Services</p>
                          <p className="font-semibold text-slate-900">{quote.services[0]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Amount</p>
                          <p className="font-semibold text-slate-900">AED {quote.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Margin</p>
                          <p className="font-semibold text-slate-900">{quote.approvalMargin}%</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex-1">
                            Approve
                          </button>
                          <button className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 flex-1">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BUILDER TAB */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Quotation</h2>
              
              <div className="space-y-6">
                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Select Client</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Choose a client...</option>
                    {mockClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.company}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Services</label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {['Residential Cleaning', 'Commercial Office', 'Deep Cleaning', 'Medical Facility', 'Industrial Cleaning'].map(service => (
                      <label key={service} className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-slate-900 font-medium">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Base Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Discount %</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Tax %</label>
                    <input
                      type="number"
                      placeholder="5"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Notes</label>
                  <textarea
                    placeholder="Add any additional notes or terms..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Save size={18} /> Save as Draft
                  </button>
                  <button className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                    <Send size={18} /> Create & Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Preview & Export Quotations</h2>
              
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Select Template</p>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {['Minimal Clean', 'Corporate Blue', 'Modern Dark', 'Elegant Gold'].map(template => (
                      <button
                        key={template}
                        className="p-4 border-2 border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                      >
                        <p className="font-semibold text-slate-900">{template}</p>
                        <p className="text-xs text-slate-600 mt-1">Professional design</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quotation Selection & Preview */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Select Quotation to Preview</p>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-4">
                    <option value="">Choose quotation...</option>
                    {quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.quoteNumber} - {q.client} (AED {q.amount.toLocaleString()})
                      </option>
                    ))}
                  </select>

                  {/* Preview Placeholder */}
                  <div className="bg-slate-100 rounded-lg p-8 min-h-96 flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <Eye className="mx-auto text-slate-400 mb-3" size={48} />
                      <p className="text-slate-600">Select a quotation to preview</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Download size={18} /> Download PDF
                  </button>
                  <button className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                    <Send size={18} /> Send to Client
                  </button>
                  <button className="flex-1 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Share WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Contracts</h2>
              
              <div className="space-y-4">
                {contracts.map(contract => (
                  <div
                    key={contract.id}
                    className="border border-slate-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{contract.client}</p>
                        <p className="text-sm text-slate-600">{contract.contractNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Company</p>
                        <p className="font-semibold text-slate-900">{contract.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Value</p>
                        <p className="font-semibold text-slate-900">{contract.value}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Duration</p>
                        <p className="font-semibold text-slate-900">{contract.startDate} - {contract.endDate}</p>
                      </div>
                      <div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {contract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Contract Details */}
            {selectedContract && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">Contract Details</h3>
                  <button onClick={() => setSelectedContract(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Client</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedContract.client}</p>
                    <p className="text-sm text-slate-600 mt-1">{selectedContract.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Contract Number</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedContract.contractNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Duration</p>
                    <p className="font-semibold text-slate-900">{selectedContract.startDate} to {selectedContract.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Contract Value</p>
                    <p className="font-semibold text-slate-900">{selectedContract.value}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-sm text-slate-600 font-medium">Services Included</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContract.services.map((service, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-sm text-slate-600 font-medium">Terms</p>
                    <p className="text-slate-700 mt-2">{selectedContract.terms}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-sm text-slate-600 font-medium">Payment Terms</p>
                    <p className="text-slate-700">{selectedContract.paymentTerms}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quotation History</h2>

              {/* Timeline View */}
              <div className="space-y-6">
                {quotations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((quote, idx) => (
                  <div key={quote.id} className="relative">
                    {/* Timeline Connector */}
                    {idx < quotations.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-12 bg-slate-200"></div>
                    )}

                    {/* Timeline Item */}
                    <div className="flex gap-6">
                      {/* Timeline Dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                          quote.status === 'Accepted' ? 'bg-green-600' :
                          quote.status === 'Sent' ? 'bg-blue-600' :
                          quote.status === 'Draft' ? 'bg-gray-600' :
                          quote.status === 'Rejected' ? 'bg-red-600' :
                          quote.status === 'Expired' ? 'bg-yellow-600' :
                          'bg-slate-600'
                        }`}>
                          {quote.status === 'Accepted' && <Check size={20} />}
                          {quote.status === 'Sent' && <Send size={20} />}
                          {quote.status === 'Draft' && <FileText size={20} />}
                          {quote.status === 'Rejected' && <X size={20} />}
                          {quote.status === 'Expired' && <Clock size={20} />}
                        </div>
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 mb-3">
                            <div>
                              <p className="font-bold text-slate-900">{quote.client}</p>
                              <p className="text-sm text-slate-600">{quote.quoteNumber}</p>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(quote.status)}`}>
                              {quote.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-slate-600">Amount</p>
                              <p className="font-semibold text-slate-900">AED {quote.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Date</p>
                              <p className="font-semibold text-slate-900">{quote.date}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Valid Until</p>
                              <p className="font-semibold text-slate-900">{quote.validUntil}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Services</p>
                              <p className="font-semibold text-slate-900">{quote.services.length} services</p>
                            </div>
                          </div>

                          {quote.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-300">
                              <p className="text-sm text-slate-600 font-medium mb-1">Notes:</p>
                              <p className="text-slate-700 text-sm">{quote.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Share Quotation</h3>
                <button
                  onClick={() => {
                    setShowShareModal(false)
                    setShareMethod(null)
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {!shareMethod ? (
                <div className="space-y-3">
                  <p className="text-slate-600 text-sm">Choose how you'd like to share this quotation</p>
                  <button
                    onClick={() => setShareMethod('email')}
                    className="w-full p-4 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <Mail className="text-blue-600" size={24} />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Email</p>
                      <p className="text-xs text-slate-600">Send via email client</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleShareQuotation(selectedQuote, 'whatsapp')
                      setShowShareModal(false)
                    }}
                    className="w-full p-4 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <MessageCircle className="text-green-600" size={24} />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">WhatsApp</p>
                      <p className="text-xs text-slate-600">Share on WhatsApp</p>
                    </div>
                  </button>
                </div>
              ) : shareMethod === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">To</label>
                    <input
                      type="email"
                      value={selectedQuote.email}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                    <input
                      type="text"
                      value={`Quotation ${selectedQuote.quoteNumber} - ${selectedQuote.company}`}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      readOnly
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleShareQuotation(selectedQuote, 'email')
                      setShowShareModal(false)
                      setShareMethod(null)
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Send Email
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
