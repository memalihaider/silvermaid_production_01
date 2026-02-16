'use client'

import { useState, useEffect } from 'react'
import { FileCheck, AlertCircle, CheckCircle, XCircle, Info, ArrowRight, MessageCircle, Calendar, Phone, Mail, Building2, FileText, DollarSign, Percent, Hash } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

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
  services: ServiceItem[];
  products: ProductItem[];
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export default function QuotationApproval() {
  const [quotations, setQuotations] = useState<FirebaseQuotation[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [selectedQuotation, setSelectedQuotation] = useState<FirebaseQuotation | null>(null)

  // Fetch all quotations and filter for Draft status
  const fetchQuotations = async () => {
    try {
      console.log('Fetching quotations ...')
      const snapshot = await getDocs(collection(db, 'quotations'))
      console.log('Total documents:', snapshot.docs.length)
      
      const allQuotations: FirebaseQuotation[] = []
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        console.log('Document data:', { id: doc.id, ...data })
        
        allQuotations.push({
          id: doc.id,
          quoteNumber: data.quoteNumber || 'N/A',
          client: data.client || 'No Client',
          company: data.company || 'No Company',
          clientId: data.clientId || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          date: data.date || new Date().toISOString().split('T')[0],
          validUntil: data.validUntil || '',
          dueDate: data.dueDate || '',
          currency: data.currency || 'AED',
          taxRate: data.taxRate || 0,
          discount: data.discount || 0,
          discountAmount: data.discountAmount || 0,
          discountType: data.discountType || 'percentage',
          template: data.template || 'standard',
          status: data.status || 'Draft',
          subtotal: data.subtotal || 0,
          taxAmount: data.taxAmount || 0,
          total: data.total || 0,
          notes: data.notes || '',
          terms: data.terms || '',
          paymentMethods: data.paymentMethods || [],
          services: data.services || [],
          products: data.products || [],
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          createdBy: data.createdBy || 'user'
        })
      })
      
      // Filter for Draft status quotations
      const draftQuotations = allQuotations.filter(q => q.status === 'Draft')
      console.log('Draft quotations found:', draftQuotations.length)
      
      // Sort by creation date (newest first)
      draftQuotations.sort((a, b) => {
        try {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()
          return dateB - dateA
        } catch {
          return 0
        }
      })
      
      setQuotations(draftQuotations)
    } catch (error) {
      console.error('Error fetching quotations:', error)
      alert('Error loading quotations  Please check console for details.')
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [])

  // Approve quotation - Change status to "Approved"
  const handleApprove = async (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    if (!quotation) return
    
    if (!confirm(`Approve quotation ${quotation.quoteNumber} for ${quotation.client}?`)) {
      return
    }

    try {
      setProcessingId(quotationId)
      const quotationRef = doc(db, 'quotations', quotationId)
      
      await updateDoc(quotationRef, {
        status: 'Approved',
        updatedAt: new Date(),
        approvedBy: 'admin',
        approvedAt: new Date()
      })

      console.log('Quotation approved :', quotationId)
      
      // Remove from local state
      setQuotations(prev => prev.filter(q => q.id !== quotationId))
      alert(`✅ Quotation ${quotation.quoteNumber} approved successfully! Status changed to "Approved".`)
      
    } catch (error) {
      console.error('Error approving quotation:', error)
      alert('❌ Error approving quotation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  // Reject quotation - Change status to "Rejected"
  const handleReject = async (quotationId: string, reason: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    if (!quotation) return
    
    try {
      setProcessingId(quotationId)
      const quotationRef = doc(db, 'quotations', quotationId)
      
      await updateDoc(quotationRef, {
        status: 'Rejected',
        updatedAt: new Date(),
        rejectedBy: 'admin',
        rejectedAt: new Date(),
        rejectionReason: reason.trim()
      })

      console.log('Quotation rejected :', quotationId)
      
      // Remove from local state
      setQuotations(prev => prev.filter(q => q.id !== quotationId))
      
      alert(`✅ Quotation ${quotation.quoteNumber} rejected successfully! Status changed to "Rejected".`)
      setRejectionReason('')
      setShowRejectModal(null)
      
    } catch (error) {
      console.error('Error rejecting quotation:', error)
      alert('❌ Error rejecting quotation. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  // Quick reject with predefined reasons
  const handleQuickReject = async (quotationId: string, reason: string) => {
    const quotation = quotations.find(q => q.id === quotationId)
    if (!quotation) return
    
    if (!confirm(`Reject quotation ${quotation.quoteNumber} with reason: "${reason}"?`)) {
      return
    }
    await handleReject(quotationId, reason)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  // View quotation details
  const viewQuotationDetails = (quotation: FirebaseQuotation) => {
    setSelectedQuotation(quotation)
  }

  // Close details modal
  const closeDetailsModal = () => {
    setSelectedQuotation(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-black mb-1">Draft Quotation Approvals</h2>
            <p className="text-sm text-gray-500">Review and approve/reject draft quotations </p>
          </div>
          <button 
            onClick={fetchQuotations}
            className="px-4 py-2 bg-black text-white text-sm font-bold rounded hover:bg-gray-800"
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Draft Quotes</p>
          <p className="text-2xl font-black text-yellow-600">{quotations.length}</p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Total Value</p>
          <p className="text-2xl font-black text-green-600">
            {quotations.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()} AED
          </p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Services</p>
          <p className="text-2xl font-black text-blue-600">
            {quotations.reduce((sum, q) => sum + (q.services?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-3 border border-gray-300 rounded shadow-none">
          <p className="text-[10px] uppercase font-bold text-gray-400">Last Updated</p>
          <p className="text-xs font-bold text-gray-700 truncate">
            {quotations.length > 0 ? formatTimestamp(quotations[0].updatedAt) : 'No data'}
          </p>
        </div>
      </div>

      {/* Draft Quotations List */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] uppercase font-bold text-black flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Draft Quotations ({quotations.length})
          </h3>
          <span className="text-[10px] uppercase font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            Status: Draft
          </span>
        </div>
        
        {quotations.length > 0 ? (
          <div className="space-y-4">
            {quotations.map((q) => (
              <div key={q.id} className="bg-white border border-gray-300 rounded overflow-hidden hover:border-black transition-all">
                {/* Quotation Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <FileText className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-black">{q.quoteNumber}</h4>
                        <p className="text-[11px] text-gray-500">Created: {formatDate(q.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-black">{q.total?.toLocaleString()} {q.currency}</p>
                      <p className="text-[11px] text-gray-500">Total Amount</p>
                    </div>
                  </div>
                </div>

                {/* Quotation Body */}
                <div className="p-4">
                  {/* Client Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">CLIENT</p>
                          <p className="text-[13px] font-bold text-black">{q.client}</p>
                          <p className="text-[11px] text-gray-500">{q.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">CONTACT</p>
                          <p className="text-[12px] text-gray-700">{q.email}</p>
                          <p className="text-[12px] text-gray-700">{q.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">VALIDITY</p>
                          <p className="text-[12px] text-gray-700">Until: {formatDate(q.validUntil)}</p>
                          <p className="text-[12px] text-gray-700">Due: {formatDate(q.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Summary */}
                  {(q.services?.length > 0 || q.products?.length > 0) && (
                    <div className="mb-4">
                      <p className="text-[11px] uppercase font-bold text-gray-500 mb-2 flex items-center gap-2">
                        <Hash className="w-3 h-3" /> ITEMS
                      </p>
                      <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500">Item</th>
                              <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 text-center">Qty</th>
                              <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 text-right">Price</th>
                              <th className="px-3 py-2 text-[10px] uppercase font-bold text-gray-500 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {q.services?.map((service, index) => (
                              <tr key={service.id || index}>
                                <td className="px-3 py-2">
                                  <p className="text-[11px] font-bold text-gray-700">{service.name}</p>
                                  {service.description && (
                                    <p className="text-[10px] text-gray-500">{service.description}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center text-[11px] font-bold">{service.quantity}</td>
                                <td className="px-3 py-2 text-right text-[11px] font-bold">{service.unitPrice?.toLocaleString()} AED</td>
                                <td className="px-3 py-2 text-right text-[11px] font-bold text-black">{service.total?.toLocaleString()} AED</td>
                              </tr>
                            ))}
                            {q.products?.map((product, index) => (
                              <tr key={product.id || index}>
                                <td className="px-3 py-2">
                                  <p className="text-[11px] font-bold text-gray-700">{product.name}</p>
                                  {product.sku && (
                                    <p className="text-[10px] text-gray-500">SKU: {product.sku}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center text-[11px] font-bold">{product.quantity}</td>
                                <td className="px-3 py-2 text-right text-[11px] font-bold">{product.unitPrice?.toLocaleString()} AED</td>
                                <td className="px-3 py-2 text-right text-[11px] font-bold text-black">{product.total?.toLocaleString()} AED</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="mb-4">
                    <p className="text-[11px] uppercase font-bold text-gray-500 mb-2 flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> FINANCIAL SUMMARY
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Subtotal</p>
                        <p className="text-lg font-bold text-gray-700">{q.subtotal?.toLocaleString()} AED</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          Discount {q.discountType === 'percentage' ? `(${q.discount}%)` : ''}
                        </p>
                        <p className="text-lg font-bold text-red-600">-{q.discountAmount?.toLocaleString()} AED</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Tax ({q.taxRate}%)</p>
                        <p className="text-lg font-bold text-gray-700">+{q.taxAmount?.toLocaleString()} AED</p>
                      </div>
                      <div className="bg-black p-3 rounded">
                        <p className="text-[10px] uppercase font-bold text-white">Total Amount</p>
                        <p className="text-lg font-bold text-white">{q.total?.toLocaleString()} AED</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        onClick={() => handleApprove(q.id)}
                        disabled={processingId === q.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-[11px] uppercase font-bold rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === q.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve Quotation
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => setShowRejectModal(q.id)}
                        disabled={processingId === q.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-[11px] uppercase font-bold rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>

                      <button 
                        onClick={() => viewQuotationDetails(q)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-[11px] uppercase font-bold rounded hover:bg-gray-50 transition-colors"
                      >
                        <Info className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                    
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded">
            <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No Draft Quotations Found</p>
            <p className="text-xs text-gray-500 mt-1">All quotations are either approved, rejected, or have other statuses.</p>
            <button 
              onClick={fetchQuotations}
              className="mt-3 px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded hover:bg-gray-700"
            >
              Check Again
            </button>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-black mb-2">Reject Quotation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this quotation. Status will be changed to "Rejected" 
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black resize-none mb-4"
              rows={4}
              required
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal, rejectionReason)}
                disabled={!rejectionReason.trim() || processingId === showRejectModal}
                className={`px-4 py-2 rounded text-sm font-medium text-white ${
                  !rejectionReason.trim() || processingId === showRejectModal
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === showRejectModal ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-black">{selectedQuotation.quoteNumber}</h3>
                  <p className="text-sm text-gray-500">Detailed View</p>
                </div>
                <button 
                  onClick={closeDetailsModal}
                  className="p-2 hover:bg-gray-100 rounded text-gray-400"
                >
                  ✕
                </button>
              </div>

              {/* Full Quotation Data */}
              <div className="space-y-6">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> CLIENT INFORMATION
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500">Client Name</p>
                      <p className="text-sm font-bold text-black">{selectedQuotation.client}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Company</p>
                      <p className="text-sm font-bold text-black">{selectedQuotation.company}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Email</p>
                      <p className="text-sm text-gray-700">{selectedQuotation.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Phone</p>
                      <p className="text-sm text-gray-700">{selectedQuotation.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Location</p>
                      <p className="text-sm text-gray-700">{selectedQuotation.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Client ID</p>
                      <p className="text-xs font-mono text-gray-500">{selectedQuotation.clientId}</p>
                    </div>
                  </div>
                </div>

                {/* Dates Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="text-xs font-bold text-gray-500">Issue Date</p>
                    <p className="text-sm font-bold text-black">{formatDate(selectedQuotation.date)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="text-xs font-bold text-gray-500">Valid Until</p>
                    <p className="text-sm font-bold text-black">{formatDate(selectedQuotation.validUntil)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="text-xs font-bold text-gray-500">Due Date</p>
                    <p className="text-sm font-bold text-black">{formatDate(selectedQuotation.dueDate)}</p>
                  </div>
                </div>

              
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-black text-white text-sm font-bold rounded hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Info */}
      <div className="bg-gray-50 border border-gray-300 rounded p-4 text-center">
        
       
      </div>
    </div>
  )
}