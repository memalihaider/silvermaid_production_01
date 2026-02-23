'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Download, Mail, CheckCircle, AlertCircle, Eye, Printer, Palette, FileText, Layout } from 'lucide-react'
import Link from 'next/link'
import { getQuotations, Quotation } from '@/lib/quotations-data'

interface QuotationTemplate {
  id: string
  name: string
  description: string
  preview: string
}

const quotationTemplates: QuotationTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Clean white background with minimal styling',
    preview: 'Simple and professional'
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    description: 'Professional blue theme for corporate clients',
    preview: 'Blue accents and formal layout'
  },
  {
    id: 'modern',
    name: 'Modern Dark',
    description: 'Dark theme with modern typography',
    preview: 'Contemporary design'
  },
  {
    id: 'elegant',
    name: 'Elegant Gold',
    description: 'Luxury gold accents for premium services',
    preview: 'Sophisticated and premium'
  }
]

export default function QuotationPreview() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('minimal')

  useEffect(() => {
    const loadedQuotations = getQuotations()
    setQuotations(loadedQuotations)
    if (loadedQuotations.length > 0) {
      setSelectedQuotation(loadedQuotations[0])
    }
  }, [])

  const [showVersionComparison, setShowVersionComparison] = useState(false)
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const handleSendQuotation = useCallback(() => {
    if (!selectedQuotation) return
    alert(`Quotation sent to ${selectedQuotation.client.email}`)
  }, [selectedQuotation])

  const handleDownloadPDF = useCallback(() => {
    if (!selectedQuotation) return
    const templateName = quotationTemplates.find(t => t.id === selectedTemplate)?.name || 'Minimal'
    alert(`PDF download started for quotation #${selectedQuotation.id} using "${templateName}" template`)
  }, [selectedQuotation, selectedTemplate])

  const handleDigitalAcceptance = useCallback(() => {
    alert('Digital acceptance link sent to client')
  }, [])

  const handleDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date('2025-01-18')
    const expiry = new Date(expiryDate)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (!selectedQuotation) {
    return <div className="text-center py-12">No quotation selected</div>
  }

  const daysToExpiry = handleDaysUntilExpiry(selectedQuotation.expiryDate)
  const isExpiringSoon = daysToExpiry <= 7 && daysToExpiry > 0
  const isExpired = daysToExpiry <= 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Quotation Preview</h1>
                <p className="text-slate-600 mt-1">Review and export professional quotations with multiple templates</p>
              </div>
              <Link href="/admin/quotations/builder" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors border border-slate-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Builder
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quote Selection Sidebar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quotations
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quotations.map((quote) => (
                  <div
                    key={quote.id}
                    onClick={() => setSelectedQuotation(quote)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      selectedQuotation.id === quote.id
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{quote.client.name}</p>
                    <p className="text-xs text-slate-600 mt-1">{quote.selectedServices[0]?.name || 'No service'}</p>
                    <p className="text-sm font-bold text-blue-600 mt-2">AED {quote.totals.subtotal.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      quote.status === 'Sent'
                        ? 'bg-green-100 text-green-700'
                        : quote.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Preview Area */}
            <div className="lg:col-span-3 space-y-6">
            {/* Status Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedQuotation.client.name}</h3>
                  <p className="text-slate-600">Quotation #{selectedQuotation.id} • Version {selectedQuotation.version}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                    selectedQuotation.status === 'Sent'
                      ? 'bg-green-100 text-green-700'
                      : selectedQuotation.status === 'Accepted'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedQuotation.status}
                  </span>
                </div>
              </div>

              {/* Expiry Warning */}
              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700">Quotation has expired. Send renewal quotation to client.</p>
                  </div>
                </div>
              )}

              {isExpiringSoon && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">Quotation expires in {daysToExpiry} days. Follow up with client soon.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Created</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedQuotation.createdDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Expires</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedQuotation.expiryDate}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Views</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedQuotation.viewCount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Margin</p>
                  <p className="text-sm font-bold text-green-600 mt-1">{selectedQuotation.totals.margin}%</p>
                </div>
              </div>
            </div>

          {/* Template Selector */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">PDF Template</h3>
              </div>
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                {quotationTemplates.find(t => t.id === selectedTemplate)?.name}
              </button>
            </div>

            {showTemplateSelector && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {quotationTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setShowTemplateSelector(false)
                    }}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className="h-4 w-4" />
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <p className="text-xs text-slate-600">{template.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PDF Preview */}
          <div className={`border rounded-lg shadow-sm overflow-hidden ${
            selectedTemplate === 'minimal' ? 'bg-white text-slate-900' :
            selectedTemplate === 'corporate' ? 'bg-white text-slate-900 border-blue-200' :
            selectedTemplate === 'modern' ? 'bg-slate-900 text-white' :
            selectedTemplate === 'elegant' ? 'bg-white text-slate-900 border-yellow-200' : 'bg-white text-slate-900'
          }`}>
            {/* Template-specific header styling */}
            <div className={`p-8 ${
              selectedTemplate === 'corporate' ? 'bg-linear-to-r from-blue-50 to-slate-50 border-b border-blue-100' :
              selectedTemplate === 'modern' ? 'bg-slate-800 border-b border-slate-700' :
              selectedTemplate === 'elegant' ? 'bg-linear-to-r from-yellow-50 to-slate-50 border-b border-yellow-200' :
              'bg-slate-50 border-b'
            }`}>
              {/* Company Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className={`text-3xl font-bold mb-1 ${
                    selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                  }`}>Silver Maid Services</h1>
                  <p className={`text-sm ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Professional Cleaning & Maintenance Solutions</p>
                  <p className={`text-xs mt-1 ${
                    selectedTemplate === 'modern' ? 'text-slate-400' : 'text-slate-500'
                  }`}>Dubai, UAE | +971-50-123-4567</p>
                </div>
                <div className={`text-right ${
                  selectedTemplate === 'corporate' ? 'text-blue-900' :
                  selectedTemplate === 'modern' ? 'text-white' :
                  selectedTemplate === 'elegant' ? 'text-yellow-800' : 'text-slate-900'
                }`}>
                  <p className="text-sm font-bold">QUOTATION</p>
                  <p className="text-2xl font-black">#{selectedQuotation.id}</p>
                  <p className="text-xs mt-1 opacity-75">{selectedQuotation.createdDate}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Bill To</p>
                  <p className={`font-bold text-lg mb-1 ${
                    selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                  }`}>{selectedQuotation.client.name}</p>
                  <p className={`text-sm ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}>{selectedQuotation.client.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}>Quotation Details</p>
                  <p className={`text-sm mb-1 ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}><span className="font-medium">Service:</span> {selectedQuotation.selectedServices[0]?.name || 'No service'}</p>
                  <p className={`text-sm mb-1 ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}><span className="font-medium">Valid Until:</span> {selectedQuotation.expiryDate}</p>
                  <p className={`text-sm ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}><span className="font-medium">Version:</span> {selectedQuotation.version}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Service Description */}
              <div className="mb-8">
                <h2 className={`text-lg font-bold mb-3 ${
                  selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                }`}>Service Description</h2>
                <p className={`text-sm leading-relaxed ${
                  selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                }`}>{selectedQuotation.description}</p>
              </div>

              {/* Line Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      selectedTemplate === 'corporate' ? 'border-blue-200' :
                      selectedTemplate === 'modern' ? 'border-slate-700' :
                      selectedTemplate === 'elegant' ? 'border-yellow-200' : 'border-slate-200'
                    }`}>
                      <th className={`text-left font-bold py-3 text-sm uppercase tracking-wide ${
                        selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                      }`}>Description</th>
                      <th className={`text-center font-bold py-3 text-sm uppercase tracking-wide w-20 ${
                        selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                      }`}>Qty</th>
                      <th className={`text-right font-bold py-3 text-sm uppercase tracking-wide w-28 ${
                        selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                      }`}>Unit Price</th>
                      <th className={`text-right font-bold py-3 text-sm uppercase tracking-wide w-28 ${
                        selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                      }`}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items.map((item: any) => (
                      <tr key={item.id} className={`border-b ${
                        selectedTemplate === 'corporate' ? 'border-blue-50' :
                        selectedTemplate === 'modern' ? 'border-slate-800' :
                        selectedTemplate === 'elegant' ? 'border-yellow-50' : 'border-slate-100'
                      }`}>
                        <td className={`py-4 text-sm ${
                          selectedTemplate === 'modern' ? 'text-slate-200' : 'text-slate-700'
                        }`}>{item.description}</td>
                        <td className={`text-center py-4 text-sm font-medium ${
                          selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                        }`}>{item.quantity}</td>
                        <td className={`text-right py-4 text-sm font-medium ${
                          selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                        }`}>AED {item.unitPrice.toLocaleString()}</td>
                        <td className={`text-right py-4 text-sm font-bold ${
                          selectedTemplate === 'corporate' ? 'text-blue-900' :
                          selectedTemplate === 'modern' ? 'text-white' :
                          selectedTemplate === 'elegant' ? 'text-yellow-800' : 'text-slate-900'
                        }`}>AED {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className={`w-72 space-y-3 ${
                  selectedTemplate === 'corporate' ? 'bg-blue-50 p-4 rounded-lg border border-blue-100' :
                  selectedTemplate === 'modern' ? 'bg-slate-800 p-4 rounded-lg border border-slate-700' :
                  selectedTemplate === 'elegant' ? 'bg-yellow-50 p-4 rounded-lg border border-yellow-200' : 'bg-slate-50 p-4 rounded-lg'
                }`}>
                  <div className={`flex justify-between text-sm ${
                    selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    <span>Subtotal:</span>
                    <span className={`font-medium ${
                      selectedTemplate === 'modern' ? 'text-white' : 'text-slate-900'
                    }`}>AED {selectedQuotation.totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
                    selectedTemplate === 'corporate' ? 'border-blue-200 text-blue-900' :
                    selectedTemplate === 'modern' ? 'border-slate-600 text-white' :
                    selectedTemplate === 'elegant' ? 'border-yellow-300 text-yellow-800' : 'border-slate-300 text-slate-900'
                  }`}>
                    <span>Total:</span>
                    <span>AED {selectedQuotation.totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between text-xs pt-2 border-t ${
                    selectedTemplate === 'corporate' ? 'border-blue-200 text-blue-700' :
                    selectedTemplate === 'modern' ? 'border-slate-600 text-slate-400' :
                    selectedTemplate === 'elegant' ? 'border-yellow-300 text-yellow-700' : 'border-slate-300 text-slate-600'
                  }`}>
                    <span>Profit Margin:</span>
                    <span className="font-bold text-green-600">{selectedQuotation.totals.margin}%</span>
                  </div>
                </div>
              </div>

              {/* Terms & Footer */}
              <div className={`pt-6 border-t ${
                selectedTemplate === 'corporate' ? 'border-blue-200' :
                selectedTemplate === 'modern' ? 'border-slate-700' :
                selectedTemplate === 'elegant' ? 'border-yellow-200' : 'border-slate-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className={`text-sm font-bold mb-2 uppercase tracking-wide ${
                      selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                    }`}>Terms & Conditions</h3>
                    <ul className={`text-xs space-y-1 ${
                      selectedTemplate === 'modern' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <li>• Payment due within 30 days of invoice</li>
                      <li>• Service commences upon acceptance</li>
                      <li>• All prices exclude VAT</li>
                      <li>• Cancellation policy applies</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold mb-2 uppercase tracking-wide ${
                      selectedTemplate === 'modern' ? 'text-slate-300' : 'text-slate-600'
                    }`}>Contact Information</h3>
                    <div className={`text-xs space-y-1 ${
                      selectedTemplate === 'modern' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <p>📧 info@silvermaid.ae</p>
                      <p>📱 +971-50-123-4567</p>
                      <p>🏢 Dubai, UAE</p>
                      <p>🌐 www.silvermaid.ae</p>
                    </div>
                  </div>
                </div>

                <div className={`text-center pt-4 border-t ${
                  selectedTemplate === 'corporate' ? 'border-blue-200' :
                  selectedTemplate === 'modern' ? 'border-slate-700' :
                  selectedTemplate === 'elegant' ? 'border-yellow-200' : 'border-slate-200'
                }`}>
                  <p className={`text-xs ${
                    selectedTemplate === 'modern' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    This quotation is valid until {selectedQuotation.expiryDate} • Thank you for choosing Silver Maid Services
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Export Options
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                PDF ({quotationTemplates.find(t => t.id === selectedTemplate)?.name})
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={handleSendQuotation}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                onClick={() => setShowAcceptanceModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Digital Accept
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Current template: <span className="font-medium">{quotationTemplates.find(t => t.id === selectedTemplate)?.name}</span>
            </p>
          </div>
        </div>
      </div>

        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Activity History
        </h3>
        <div className="space-y-3">
          {selectedQuotation.auditLog.map((log: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{log.action}</p>
                <p className="text-xs text-slate-600">by {log.user} • {log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
