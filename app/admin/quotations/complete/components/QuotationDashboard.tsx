'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign, Users, Building2, Calendar, RefreshCw, TrendingDown, Eye } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

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
  services: any[];
  products: any[];
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export default function QuotationDashboard() {
  const [quotations, setQuotations] = useState<FirebaseQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    approved: 0,
    sent: 0,
    draft: 0,
    rejected: 0,
    totalValue: 0,
    conversionRate: 0,
    averageValue: 0
  })

  // Fetch all quotations from Firebase
  const fetchQuotations = async () => {
    try {
      setLoading(true)
      const snapshot = await getDocs(collection(db, 'quotations'))
      
      const allQuotations: FirebaseQuotation[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseQuotation[]
      
      // Sort by creation date (newest first)
      allQuotations.sort((a, b) => {
        try {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
          return dateB - dateA
        } catch {
          return 0
        }
      })
      
      setQuotations(allQuotations)
      calculateStats(allQuotations)
      
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (data: FirebaseQuotation[]) => {
    const total = data.length
    const accepted = data.filter(q => q.status === 'Accepted').length
    const approved = data.filter(q => q.status === 'Approved').length
    const sent = data.filter(q => q.status === 'Sent').length
    const draft = data.filter(q => q.status === 'Draft').length
    const rejected = data.filter(q => q.status === 'Rejected').length
    const totalValue = data.reduce((sum, q) => sum + (q.total || 0), 0)
    const conversionRate = total > 0 ? ((accepted + approved) / total) * 100 : 0
    const averageValue = total > 0 ? totalValue / total : 0

    setTotalValue(totalValue)
    setStats({
      total,
      accepted,
      approved,
      sent,
      draft,
      rejected,
      totalValue,
      conversionRate,
      averageValue
    })
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
      case 'sent':
        return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
      case 'draft':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return <CheckCircle className="w-3 h-3" />
      case 'sent':
        return <Clock className="w-3 h-3" />
      case 'draft':
        return <FileText className="w-3 h-3" />
      case 'rejected':
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <FileText className="w-3 h-3" />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-black">Quotation Dashboard</h2>
          <p className="text-sm text-gray-500">Real-time analytics from Firebase</p>
        </div>
        <button 
          onClick={fetchQuotations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Quotations */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-black rounded">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Quotes</span>
          </div>
          <p className="text-xl font-bold text-black">{stats.total}</p>
          <p className="text-[10px] text-gray-400 mt-1">From Firebase</p>
        </div>

        {/* Accepted */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-500 rounded">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Accepted</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.accepted}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>

        {/* Approved */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-600 rounded">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Approved</span>
          </div>
          <p className="text-xl font-bold text-green-700">{stats.approved}</p>
          <p className="text-[10px] text-gray-400 mt-1">Ready for client</p>
        </div>

        {/* Draft */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-yellow-500 rounded">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Draft</span>
          </div>
          <p className="text-xl font-bold text-yellow-600">{stats.draft}</p>
          <p className="text-[10px] text-gray-400 mt-1">Awaiting approval</p>
        </div>

        {/* Total Value */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500 rounded">
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Total Value</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalValue)} AED</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Avg: {formatCurrency(stats.averageValue)} AED
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-300 rounded p-3 shadow-none">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-500 rounded">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Rejected</span>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
          <h3 className="text-[12px] uppercase font-bold text-black mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Status Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
              { label: 'Accepted', value: stats.accepted, color: 'bg-green-400' },
              { label: 'Sent', value: stats.sent, color: 'bg-blue-500' },
              { label: 'Draft', value: stats.draft, color: 'bg-yellow-500' },
              { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span className="text-[11px] font-bold text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-black">{item.value}</span>
                  <span className="text-[10px] text-gray-400">
                    ({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-none lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[12px] uppercase font-bold text-black flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Quotations
            </h3>
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Showing {Math.min(quotations.length, 5)} of {quotations.length}
            </span>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading quotations...</p>
            </div>
          ) : quotations.length > 0 ? (
            <div className="space-y-2">
              {quotations.slice(0, 5).map(q => {
                const statusColor = getStatusColor(q.status)
                return (
                  <div key={q.id} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${statusColor.bg} ${statusColor.border}`}>
                        {getStatusIcon(q.status)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-black">{q.quoteNumber}</p>
                        <p className="text-[11px] text-gray-500">{q.client} • {q.company}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(q.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-black">{formatCurrency(q.total)} {q.currency}</p>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${statusColor.bg} ${statusColor.text}`}>
                        {q.status}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-1 truncate max-w-[100px]">
                        ID: {q.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-400">No quotations found</p>
              <p className="text-xs text-gray-500 mt-1">Create your first quotation to see data here</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Overview */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
          <h3 className="text-[12px] uppercase font-bold text-black mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Financial Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Total Quotation Value</span>
              <span className="text-[13px] font-bold text-black">{formatCurrency(stats.totalValue)} AED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Average Quotation Value</span>
              <span className="text-[13px] font-bold text-black">{formatCurrency(stats.averageValue)} AED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Highest Single Quotation</span>
              <span className="text-[13px] font-bold text-black">
                {quotations.length > 0 
                  ? formatCurrency(Math.max(...quotations.map(q => q.total || 0))) 
                  : 0} AED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Conversion Rate</span>
              <span className="text-[13px] font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Client Insights */}
        <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
          <h3 className="text-[12px] uppercase font-bold text-black mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Client Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Total Clients</span>
              <span className="text-[13px] font-bold text-black">
                {Array.from(new Set(quotations.map(q => q.clientId || q.client))).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Repeat Clients</span>
              <span className="text-[13px] font-bold text-black">
                {(() => {
                  const clientCounts: Record<string, number> = {}
                  quotations.forEach(q => {
                    const clientKey = q.clientId || q.client
                    clientCounts[clientKey] = (clientCounts[clientKey] || 0) + 1
                  })
                  return Object.values(clientCounts).filter(count => count > 1).length
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-600">Top Company</span>
              <span className="text-[13px] font-bold text-black">
                {(() => {
                  const companyCounts: Record<string, number> = {}
                  quotations.forEach(q => {
                    if (q.company) {
                      companyCounts[q.company] = (companyCounts[q.company] || 0) + 1
                    }
                  })
                  const topCompany = Object.entries(companyCounts)
                    .sort(([,a], [,b]) => b - a)[0]
                  return topCompany ? `${topCompany[0]} (${topCompany[1]})` : 'N/A'
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Information */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-700">Firebase Data Source</p>
            <p className="text-[10px] text-gray-500">
              Collection: <span className="font-bold">quotations</span> | 
              Documents: <span className="font-bold">{stats.total}</span> | 
              Last Updated: Just now
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-gray-600">Connected</span>
            </div>
            <button 
              onClick={fetchQuotations}
              className="text-[10px] text-blue-600 font-bold hover:text-blue-800"
            >
              View Raw Data →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}