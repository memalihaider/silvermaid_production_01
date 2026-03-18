'use client'

import { useState } from 'react'
import { 
  Plus, FileText, TrendingUp, Bell, CheckSquare, 
  Download, History, LayoutGrid, Sparkles
} from 'lucide-react'

import QuotationDashboard from './components/QuotationDashboard'
import QuotationList from './components/QuotationList'
import QuotationBuilder from './components/QuotationBuilder'
import QuotationApproval from './components/QuotationApproval'
import QuotationReminders from './components/QuotationReminders'

// Common interface for all components
interface BaseQuotation {
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
}

// For QuotationBuilder and local state
export interface LocalQuotation extends BaseQuotation {
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
  amount?: number;
  version?: number;
  lastModified?: string;
}

export default function QuotationsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'builder' | 'approval' | 'reminders'>('dashboard')
  const [editingQuotation, setEditingQuotation] = useState<LocalQuotation | null>(null)

  const handleEdit = (quotation: any) => {
    // Convert any quotation format to LocalQuotation
    const editedQuotation: LocalQuotation = {
      id: quotation.id?.toString() || '',
      quoteNumber: quotation.quoteNumber || `QUOTE-${Date.now()}`,
      client: quotation.client || 'No Client',
      company: quotation.company || 'No Company',
      email: quotation.email || '',
      phone: quotation.phone || '',
      total: quotation.total || quotation.amount || 0,
      currency: quotation.currency || 'AED',
      status: quotation.status || 'Draft',
      date: quotation.date || new Date().toISOString().split('T')[0],
      validUntil: quotation.validUntil || '',
      services: quotation.services || [],
      products: quotation.products || [],
      notes: quotation.notes || '',
      terms: quotation.terms || '',
      subtotal: quotation.subtotal || quotation.total || 0,
      taxAmount: quotation.taxAmount || 0,
      taxRate: quotation.taxRate || 0,
      discountAmount: quotation.discountAmount || 0,
      discount: quotation.discount || 0,
      discountType: quotation.discountType || 'percentage',
      location: quotation.location || '',
      amount: quotation.amount || quotation.total || 0,
      version: quotation.version || 1,
      lastModified: quotation.lastModified || new Date().toISOString()
    }
    setEditingQuotation(editedQuotation)
    setActiveTab('builder')
  }

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: TrendingUp },
    { id: 'list', label: 'Quotation List', icon: FileText },
    { id: 'builder', label: editingQuotation ? 'Edit Quotation' : 'Create New', icon: Plus },
    { id: 'approval', label: 'Approval Queue', icon: CheckSquare },
    { id: 'reminders', label: 'Notifications', icon: Bell },
  ] as const

  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Overview'

  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-linear-to-b from-[#f8fbff] to-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-5 md:p-7 mb-6 shadow-sm">
        <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-[11px] font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Quotation Control Center
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Quotation Management</h1>
            <p className="text-sm md:text-base text-slate-600 font-medium max-w-2xl">
              Create professional quotes, monitor approvals, and keep client follow-ups organized from one clear workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:min-w-105">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current View</p>
              <p className="text-sm font-black text-slate-800 truncate">{activeTabLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Currency</p>
              <p className="text-sm font-black text-slate-800">AED</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Workflow</p>
              <p className="text-sm font-black text-slate-800">Draft to Approval</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
           <button className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Overview
           </button>
           <button className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
           </button>
           <button className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-[11px] font-bold uppercase tracking-tight text-slate-600 hover:bg-slate-50 transition-colors">
              <History className="w-4 h-4" />
              Audit Log
           </button>
           <button
             onClick={() => {
               setEditingQuotation(null)
               setActiveTab('builder')
             }}
             className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors"
           >
             <Plus className="w-4 h-4" />
             New Quotation
           </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 mb-6 flex gap-1.5 overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.id !== 'builder') setEditingQuotation(null)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-[12px] uppercase font-bold tracking-tight ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-150 rounded-2xl">
        {activeTab === 'dashboard' && <QuotationDashboard />}
        {activeTab === 'list' && (
          <QuotationList 
            onEdit={handleEdit}
          />
        )}
        {activeTab === 'builder' && (
          <QuotationBuilder 
            initialData={editingQuotation}
            onSave={() => {
              setEditingQuotation(null)
              setActiveTab('list')
            }}
            onCancel={() => {
              setEditingQuotation(null)
              setActiveTab('list')
            }}
          />
        )}
        {activeTab === 'approval' && <QuotationApproval />}
        {activeTab === 'reminders' && <QuotationReminders />}
      </div>
    </div>
  )
}