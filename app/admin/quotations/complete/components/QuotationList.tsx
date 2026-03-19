'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Eye, Edit, Trash2, Mail,
  CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, FileDown, FileText, Phone, CalendarDays, Building2
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { getPDFAsBlob } from '@/lib/pdfGenerator'

interface FirebaseQuotation {
  id: string;
  quoteNumber: string;
  client: string;
  company: string;
  clientId: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  validUntil: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  discountAmount: number;
  discountType: string;
  template: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  paymentMethods: string[];
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
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

interface Props {
  onEdit: (quotation: FirebaseQuotation) => void
  onView?: (quotation: FirebaseQuotation) => void
  onSend?: (quotation: FirebaseQuotation) => void
  refreshTrigger?: boolean
}

export default function QuotationList({ onEdit, onView, onSend, refreshTrigger }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [quotations, setQuotations] = useState<FirebaseQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Fetch real quotations from Firebase
  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const quotationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseQuotation[]
      
      setQuotations(quotationsData)
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchQuotations()
    }
  }, [refreshTrigger])

  // Delete quotation from Firebase
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return
    }
    
    try {
      setDeletingId(id)
      await deleteDoc(doc(db, 'quotations', id))
      setQuotations(prev => prev.filter(q => q.id !== id))
    } catch (error) {
      console.error('Error deleting quotation:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // Download PDF for quotation
  const handleDownloadPDF = async (quotation: FirebaseQuotation) => {
    try {
      setDownloadingId(quotation.id)
      
      // Prepare quotation data for PDF generator
      const quotationData = {
        ...quotation,
        // Add any missing properties with default values
        createdAt: quotation.createdAt || new Date(),
        updatedAt: quotation.updatedAt || new Date(),
        createdBy: quotation.createdBy || 'admin'
      }
      
      // Generate PDF blob
      const pdfBlob = getPDFAsBlob(quotationData)
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Quotation_${quotation.quoteNumber.replace('#', '')}_${quotation.client.replace(/\s+/g, '_')}.pdf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      // Show success message
      setTimeout(() => {
        alert(`✅ PDF downloaded successfully for ${quotation.quoteNumber}!`)
      }, 500)
      
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('❌ Error downloading PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'sent':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-700 border border-gray-200'
      case 'expired':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-2.5 h-2.5" />
      case 'sent':
        return <Clock className="w-2.5 h-2.5" />
      case 'rejected':
        return <XCircle className="w-2.5 h-2.5" />
      case 'draft':
        return <AlertCircle className="w-2.5 h-2.5" />
      default:
        return <AlertCircle className="w-2.5 h-2.5" />
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  // Filter quotations
  const filtered = quotations.filter(q => {
    const matchesSearch = 
      q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const summary = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'Draft').length,
    sent: quotations.filter(q => q.status === 'Sent').length,
    approved: quotations.filter(q => q.status === 'Approved').length,
    rejected: quotations.filter(q => q.status === 'Rejected').length,
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotes, clients, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-slate-900"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-slate-900 appearance-none bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <button 
          onClick={fetchQuotations}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold uppercase tracking-tight hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>

        <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-xs font-semibold text-slate-600">
            Showing <span className="text-slate-900 font-black">{filtered.length}</span> of <span className="text-slate-900 font-black">{quotations.length}</span> quotations
          </p>
          {(searchTerm || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('All')
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Total Quotes</p>
          <p className="text-2xl font-black text-slate-900">{summary.total}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Drafts</p>
          <p className="text-2xl font-black text-slate-700">
            {summary.draft}
          </p>
        </div>
        <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Sent</p>
          <p className="text-2xl font-black text-blue-700">
            {summary.sent}
          </p>
        </div>
        <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Approved</p>
          <p className="text-2xl font-black text-green-700">
            {summary.approved}
          </p>
        </div>
        <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] uppercase font-bold text-slate-500">Rejected</p>
          <p className="text-2xl font-black text-red-700">
            {summary.rejected}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Quote Info</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Client / Company</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Contact</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Amount</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-center">Date</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-center">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No quotations found</p>
                      <p className="text-xs text-gray-400">
                        {searchTerm || statusFilter !== 'All' ? 'Try changing your search/filter' : 'Create your first quotation'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-[13px] text-black mb-0.5">{q.quoteNumber}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                          Created: {formatTimestamp(q.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[13px] text-black mb-0.5">{q.client}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium truncate max-w-55">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        {q.company}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-[11px] text-gray-600 font-semibold flex items-center gap-1.5 max-w-55 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {q.email || 'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        {q.phone || 'N/A'}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-[13px] text-black mb-0.5">
                        {q.total?.toLocaleString()} {q.currency || 'AED'}
                      </p>
                      {q.discount && q.discount > 0 && (
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">
                          -{q.discount}{q.discountType === 'percentage' ? '%' : ' ' + (q.currency || 'AED')} Off
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <p className="text-[11px] font-bold text-gray-700 flex items-center justify-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(q.date)}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        Valid Until {formatDate(q.validUntil)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusBadgeStyle(q.status)}`}>
                        {getStatusIcon(q.status)}
                        {q.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(q)}
                            title="View"
                            className="p-1.5 hover:bg-gray-100 rounded text-slate-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* PDF Download Button - NEW */}
                        <button 
                          onClick={() => handleDownloadPDF(q)}
                          disabled={downloadingId === q.id}
                          title="Download PDF" 
                          className={`p-1.5 rounded transition-colors ${
                            downloadingId === q.id 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-100 text-green-600'
                          }`}
                        >
                          {downloadingId === q.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button 
                          onClick={() => onEdit(q)}
                          title="Edit" 
                          className="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {onSend && (
                          <button
                            onClick={() => onSend(q)}
                            title="Send"
                            className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          title="Delete" 
                          className={`p-1.5 rounded transition-colors ${
                            deletingId === q.id 
                              ? 'bg-red-100 text-red-400 cursor-not-allowed'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          {deletingId === q.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-semibold">No quotations found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust your search or status filter.</p>
          </div>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-slate-900">{q.quoteNumber}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Created {formatTimestamp(q.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusBadgeStyle(q.status)}`}>
                  {getStatusIcon(q.status)}
                  {q.status || 'Draft'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <p className="font-bold text-slate-900">{q.client}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {q.company || 'N/A'}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {q.email || 'N/A'}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {q.phone || 'N/A'}</p>
                <p className="text-slate-600 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(q.date)} (Valid: {formatDate(q.validUntil)})</p>
              </div>

              <div className="flex items-end justify-between">
                <p className="text-sm font-black text-slate-900">
                  {q.total?.toLocaleString()} {q.currency || 'AED'}
                </p>
                <div className="flex items-center gap-1">
                  {onView && (
                    <button onClick={() => onView(q)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDownloadPDF(q)} disabled={downloadingId === q.id} className="p-2 rounded-lg hover:bg-slate-100 text-green-600 disabled:text-slate-400" title="Download PDF">
                    {downloadingId === q.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onEdit(q)} className="p-2 rounded-lg hover:bg-slate-100 text-blue-600" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} disabled={deletingId === q.id} className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:text-red-300" title="Delete">
                    {deletingId === q.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}