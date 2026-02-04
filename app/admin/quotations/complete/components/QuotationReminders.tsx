'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, File,Send, CheckCircle, AlertCircle, RefreshCw, User, Building2, Phone, Calendar, FileText, Loader2, MessageSquare, Smartphone } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { getPDFAsBlob } from '@/lib/pdfGenerator'
import { sendEmailWithAttachment } from '@/lib/gmailService'
import { sharePDFViaWhatsApp, formatPhoneForWhatsApp } from '@/lib/whatsappService'

interface TodayQuotation {
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
  services: any[];
  products: any[];
  notes: string;
  terms: string;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  discount: number;
  discountType: string;
  location: string;
}

export default function QuotationReminders() {
  const [todayQuotations, setTodayQuotations] = useState<TodayQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, {
    email?: 'sending' | 'sent' | 'error';
    whatsapp?: 'sending' | 'sent' | 'error';
  }>>({})

  // Fetch today's quotations
  const fetchTodayQuotations = async () => {
    try {
      setLoading(true)
      const todayDate = new Date().toISOString().split('T')[0]
      
      const snapshot = await getDocs(collection(db, 'quotations'))
      
      const allQuotations: TodayQuotation[] = snapshot.docs.map(doc => {
        const data = doc.data()
        const quoteDate = data.date || ''
        
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
          date: quoteDate,
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
          location: data.location || ''
        }
      })
      
      // Filter for today's quotations
      const todays = allQuotations.filter(q => q.date === todayDate)
      
      setTodayQuotations(todays)
      
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayQuotations()
  }, [])

  // Send email with PDF
  const handleSendEmail = async (quotation: TodayQuotation) => {
    if (!quotation.email) {
      alert('Email address not available for this client')
      return
    }

    try {
      setSendingEmail(quotation.id)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], email: 'sending' } }))

      const pdfBlob = getPDFAsBlob(quotation)
      
      await sendEmailWithAttachment(
        quotation,
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

  // Send WhatsApp with PDF
  const handleSendWhatsApp = async (quotation: TodayQuotation) => {
    if (!quotation.phone) {
      alert('Phone number not available for this client')
      return
    }

    // Check if phone number is valid for WhatsApp
    const formattedPhone = formatPhoneForWhatsApp(quotation.phone)
    if (!formattedPhone) {
      alert('Invalid phone number format for WhatsApp')
      return
    }

    try {
      setSendingWhatsApp(quotation.id)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'sending' } }))

      await sharePDFViaWhatsApp(
        quotation,
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
      console.error('Error sending WhatsApp:', error)
      setStatus(prev => ({ ...prev, [quotation.id]: { ...prev[quotation.id], whatsapp: 'error' } }))
      alert('❌ Error sending WhatsApp')
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
    return type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[12px] uppercase font-bold text-black flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Send Quotations via Email & WhatsApp
            </h3>
            <p className="text-xs text-gray-500">One-click sending with PDF attachment</p>
          </div>
          <button 
            onClick={fetchTodayQuotations}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] uppercase font-bold rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Refresh
          </button>
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
              <Phone className="w-4 h-4 text-green-600" />
              <p className="text-xs font-bold text-green-700">WhatsApp with PDF</p>
            </div>
            <p className="text-[11px] text-green-600 mt-1">
              Opens WhatsApp Web with PDF download
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading today's quotations...</p>
          </div>
        ) : todayQuotations.length > 0 ? (
          <div className="space-y-3">
            {todayQuotations.map(q => {
              const emailStatus = status[q.id]?.email
              const whatsappStatus = status[q.id]?.whatsapp
              const emailSent = emailStatus === 'sent'
              const whatsappSent = whatsappStatus === 'sent'
              
              return (
                <div 
                  key={q.id} 
                  className={`border rounded p-4 transition-all ${
                    emailSent || whatsappSent ? 'bg-green-50 border-green-200' :
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
                            <Phone className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">Phone</p>
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
                              <p className="text-[10px] uppercase font-bold text-gray-400">PDF Ready</p>
                              <p className="text-[11px] font-bold text-gray-700">Professional Format</p>
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
                        
                        {/* WhatsApp Button */}
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
                          {whatsappStatus === 'sending' && <span className="text-[9px]">Sending...</span>}
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
                              PDF download, opens WhatsApp Web
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
            <p className="text-sm font-bold text-gray-400">No Quotations Today</p>
            <p className="text-xs text-gray-500 mt-1">Create quotations to send via Email or WhatsApp</p>
          </div>
        )}
      </div>

      {/* Communication Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Guide */}
        <div className="bg-white border border-gray-300 rounded p-4">
          <h4 className="text-[12px] uppercase font-bold text-black mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            Email Sending Process
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">1</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">Click Email Button</p>
                <p className="text-[10px] text-gray-600">System generates PDF automatically</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">2</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">Gmail Opens</p>
                <p className="text-[10px] text-gray-600">Compose window with everything pre-filled</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">3</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">Review & Send</p>
                <p className="text-[10px] text-gray-600">Check everything and click send in Gmail</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-[10px] font-bold text-blue-700 mb-1">Includes:</p>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-blue-600">PDF Attachment</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-blue-600">Professional Email</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-blue-600">Auto Recipient</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-blue-600">Company Branding</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Guide */}
        <div className="bg-white border border-gray-300 rounded p-4">
          <h4 className="text-[12px] uppercase font-bold text-black mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-500" />
            WhatsApp Sending Process
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">1</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">Click WhatsApp Button</p>
                <p className="text-[10px] text-gray-600">PDF downloads automatically</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">2</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">WhatsApp Web Opens</p>
                <p className="text-[10px] text-gray-600">Chat window with client pre-filled</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">3</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-700">Attach & Send</p>
                <p className="text-[10px] text-gray-600">Attach downloaded PDF and send message</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-[10px] font-bold text-green-700 mb-1">Includes:</p>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-[9px] text-green-600">PDF Download</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-[9px] text-green-600">Pre-filled Message</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-[9px] text-green-600">Phone Auto-filled</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-[9px] text-green-600">Step-by-step Guide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-300 rounded p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-700">Communication Summary</p>
            <p className="text-[10px] text-gray-500">
              Today: {todayQuotations.length} quotations | 
              Email Ready: {todayQuotations.filter(q => q.email).length} | 
              WhatsApp Ready: {todayQuotations.filter(q => q.phone).length}
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
                <Phone className="w-4 h-4 text-green-500" />
                <p className="text-[11px] font-bold text-gray-700">WhatsApp with PDF</p>
              </div>
              <p className="text-[10px] text-gray-500">Opens WhatsApp Web</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}