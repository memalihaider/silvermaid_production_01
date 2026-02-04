'use client'

import { useState, useEffect } from 'react'
import { 
  Search, Filter, MoreVertical, Eye, Edit, Trash2, Mail, 
  Download, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

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
      alert('Error loading quotations from Firebase')
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
      // Remove from local state
      setQuotations(prev => prev.filter(q => q.id !== id))
      alert('✅ Quotation deleted successfully!')
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('❌ Error deleting quotation. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
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
      case 'accepted':
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

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 border border-gray-300 rounded shadow-none">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotes, clients, companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black appearance-none bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <button 
          onClick={fetchQuotations}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-bold uppercase tracking-tight hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Total Quotes</p>
          <p className="text-2xl font-black text-black">{quotations.length}</p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Drafts</p>
          <p className="text-2xl font-black text-gray-700">
            {quotations.filter(q => q.status === 'Draft').length}
          </p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Sent</p>
          <p className="text-2xl font-black text-blue-700">
            {quotations.filter(q => q.status === 'Sent').length}
          </p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Accepted</p>
          <p className="text-2xl font-black text-green-700">
            {quotations.filter(q => q.status === 'Accepted').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-300 rounded overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50">
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Quote Info</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Client / Company</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500">Amount</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-center">Date</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-center">Status</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500">Loading quotations from Firebase...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
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
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                        {q.company}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{q.email}</p>
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
                      <p className="text-[10px] text-gray-400">
                        Items: {q.services?.length || 0 + q.products?.length || 0}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <p className="text-[11px] font-bold text-gray-700">{formatDate(q.date)}</p>
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
                        <button 
                          onClick={() => onView?.(q)}
                          title="View Preview" 
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onEdit(q)}
                          title="Edit" 
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onSend?.(q)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" 
                          title="Send Quotation"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
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

      {/* Footer Info */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <p>
          Showing <span className="font-bold">{filtered.length}</span> of{' '}
          <span className="font-bold">{quotations.length}</span> quotations
        </p>
        <p className="text-[10px] uppercase font-bold">
          Data loaded from Firebase collection "quotations"
        </p>
      </div>
    </div>
  )
}

// Add this import if not already present
const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)