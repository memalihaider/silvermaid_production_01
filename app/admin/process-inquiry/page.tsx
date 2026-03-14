'use client'
import React from 'react'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Filter, 
  Search, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  status: string
  source: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export default function ProcessInquiry() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [services, setServices] = useState<{[key: string]: string}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // Fetch inquiries from Firebase
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const inquiriesRef = collection(db, 'process-inquiry')
        const q = query(inquiriesRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const inquiriesData: Inquiry[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          inquiriesData.push({
            id: doc.id,
            ...data
          } as Inquiry)
        })
        
        setInquiries(inquiriesData)
      } catch (error) {
        console.error('Error fetching inquiries:', error)
      }
    }

    fetchInquiries()
  }, [])

  // Fetch services for name mapping
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, 'services')
        const querySnapshot = await getDocs(servicesRef)
        
        const servicesMap: {[key: string]: string} = {}
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          servicesMap[doc.id] = data.name || 'Unknown Service'
        })
        
        setServices(servicesMap)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchServices()
  }, [])

  // Update status function
  const updateStatus = async (inquiryId: string, newStatus: string) => {
    setLoading(inquiryId)
    
    try {
      const inquiryRef = doc(db, 'process-inquiry', inquiryId)
      
      await updateDoc(inquiryRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })

      // Update local state
      setInquiries(prevInquiries => 
        prevInquiries.map(inquiry => 
          inquiry.id === inquiryId 
            ? { 
                ...inquiry, 
                status: newStatus,
                updatedAt: Timestamp.now()
              } 
            : inquiry
        )
      )

      console.log(`Status updated to ${newStatus} for inquiry ${inquiryId}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  // Mark as In Progress
  const markAsInProgress = (inquiryId: string) => {
    updateStatus(inquiryId, 'in-progress')
  }

  // Mark as Completed
  const markAsCompleted = (inquiryId: string) => {
    updateStatus(inquiryId, 'completed')
  }

  // Mark as New
  const markAsNew = (inquiryId: string) => {
    updateStatus(inquiryId, 'new')
  }

  // Mark as Cancelled
  const markAsCancelled = (inquiryId: string) => {
    updateStatus(inquiryId, 'cancelled')
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-500 text-white'
      case 'in-progress': return 'bg-yellow-500 text-white'
      case 'completed': return 'bg-green-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'in-progress': return <Filter className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getServiceName = (serviceId: string) => {
    return services[serviceId] || serviceId
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' || 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.includes(searchTerm) ||
      getServiceName(inquiry.service).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.createdAt.seconds - a.createdAt.seconds
    } else {
      return a.createdAt.seconds - b.createdAt.seconds
    }
  })

  const toggleInquiry = (id: string) => {
    setExpandedInquiry(expandedInquiry === id ? null : id)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-pink-600" />
          <h1 className="text-3xl font-bold tracking-tight">Process Inquiries</h1>
        </div>
        <p className="text-muted-foreground">Manage and respond to customer inquiries from contact form submissions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">New Inquiries</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {inquiries.filter(i => i.status === 'new').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {inquiries.filter(i => i.status === 'in-progress').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Filter className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {inquiries.filter(i => i.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Inquiries</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {inquiries.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inquiries by name, email, phone, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-12 py-3 bg-muted border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-3 bg-muted border rounded-xl hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              {sortOrder === 'desc' ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Newest First</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Oldest First</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {sortedInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-muted-foreground mb-2">No inquiries found</h3>
            <p className="text-muted-foreground">No customer inquiries match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Customer</th>
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Contact</th>
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Service</th>
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left p-6 font-bold text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedInquiries.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">
                            {inquiry.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{inquiry.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Via {inquiry.source === 'contact-page' ? 'Contact Form' : inquiry.source}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-sm hover:text-pink-600 transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                            {inquiry.email}
                          </a>
                          <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-sm hover:text-pink-600 transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                            {inquiry.phone}
                          </a>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground">{getServiceName(inquiry.service)}</p>
                          {inquiry.message && (
                            <button
                              onClick={() => toggleInquiry(inquiry.id)}
                              className="text-sm text-muted-foreground hover:text-pink-600 transition-colors flex items-center gap-1 mt-1"
                            >
                              {expandedInquiry === inquiry.id ? 'Hide Message' : 'View Message'}
                              {expandedInquiry === inquiry.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 inline mr-2" />
                            {formatDate(inquiry.createdAt)}
                          </p>
                          {inquiry.updatedAt && inquiry.updatedAt !== inquiry.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              Updated: {formatDate(inquiry.updatedAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(inquiry.status)}`}>
                          {getStatusIcon(inquiry.status)}
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleInquiry(inquiry.id)}
                            className="p-2 rounded-lg border hover:bg-muted transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={`mailto:${inquiry.email}?subject=Regarding your inquiry about ${getServiceName(inquiry.service)}&body=Dear ${inquiry.name},%0D%0A%0D%0AThank you for your inquiry...`}
                            className="p-2 rounded-lg border hover:bg-muted transition-colors"
                            title="Reply via Email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="p-2 rounded-lg border hover:bg-muted transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Message Row */}
                    {expandedInquiry === inquiry.id && inquiry.message && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="p-6">
                          <div className="bg-white dark:bg-slate-900 rounded-xl border p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-bold text-lg mb-1">Customer Message</h4>
                                <p className="text-sm text-muted-foreground">
                                  From: {inquiry.name} ({inquiry.email})
                                </p>
                              </div>
                              <button
                                onClick={() => setExpandedInquiry(null)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border">
                              <p className="whitespace-pre-line text-foreground">{inquiry.message}</p>
                            </div>
                            <div className="mt-4 flex gap-3 flex-wrap">
                              <a
                                href={`mailto:${inquiry.email}?subject=Regarding your inquiry about ${getServiceName(inquiry.service)}&body=Dear ${inquiry.name},%0D%0A%0D%0AThank you for your inquiry about "${getServiceName(inquiry.service)}". We have received your message: "%0D%0A%0D%0A${encodeURIComponent(inquiry.message)}"%0D%0A%0D%0AOur team will review your requirements and get back to you shortly.%0D%0A%0D%0ABest regards,%0D%0ASilver Maid Team`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                              >
                                <Mail className="h-4 w-4" />
                                Send Response
                              </a>
                              
                              <button 
                                onClick={() => markAsInProgress(inquiry.id)}
                                disabled={loading === inquiry.id || inquiry.status === 'in-progress'}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-pink-600 text-pink-600 rounded-lg font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading === inquiry.id && inquiry.status !== 'in-progress' ? (
                                  <>
                                    <Filter className="h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Filter className="h-4 w-4" />
                                    {inquiry.status === 'in-progress' ? 'Already In Progress' : 'Mark as In Progress'}
                                  </>
                                )}
                              </button>
                              
                              <button 
                                onClick={() => markAsCompleted(inquiry.id)}
                                disabled={loading === inquiry.id || inquiry.status === 'completed'}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading === inquiry.id && inquiry.status !== 'completed' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    {inquiry.status === 'completed' ? 'Already Completed' : 'Mark Complete'}
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => markAsNew(inquiry.id)}
                                disabled={loading === inquiry.id || inquiry.status === 'new'}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Clock className="h-4 w-4" />
                                Mark as New
                              </button>

                              <button 
                                onClick={() => markAsCancelled(inquiry.id)}
                                disabled={loading === inquiry.id || inquiry.status === 'cancelled'}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="h-4 w-4" />
                                Mark as Cancelled
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {sortedInquiries.length} of {inquiries.length} total inquiries
        {searchTerm && ` • Filtered by: "${searchTerm}"`}
        {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
      </div>
    </div>
  )
}