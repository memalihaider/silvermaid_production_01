'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  CreditCard,
  Clock,
  Calendar,
  Printer,
  Mail,
  ChevronDown,
  Building2,
  Phone,
  MapPin,
  User,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'

// Types
interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalSpent: number;
  projects: number;
  lastService: string;
  status: string;
  tier: string;
  notes: string;
  contracts?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes: string;
  paymentTerms: string;
  currencyCode: string;
  sentDate?: string;
  paidDate?: string;
  createdBy: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionRef: string;
  status: string;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  vendor: string;
  approvalStatus: string;
  notes: string;
}

export default function UnifiedFinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, unit: 'service' }],
    notes: '',
    paymentTerms: '30 days',
    dueDate: '',
    attachments: [] as { name: string; size: string; type: string }[]
  })

  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    notes: ''
  })

  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Supplies',
    amount: 0,
    vendor: '',
    notes: ''
  })

  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
    amount: 0,
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    attachments: [] as { name: string; size: string; type: string }[]
  })

  // Firebase se data fetch
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Clients fetch
      const clientsRef = collection(db, 'clients')
      const clientsSnapshot = await getDocs(clientsRef)
      const clientsData: Client[] = []
      clientsSnapshot.forEach(doc => {
        const data = doc.data()
        clientsData.push({
          id: doc.id,
          name: data.name || '',
          company: data.company || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          joinDate: data.joinDate || '',
          totalSpent: data.totalSpent || 0,
          projects: data.projects || 0,
          lastService: data.lastService || '',
          status: data.status || 'Active',
          tier: data.tier || 'Bronze',
          notes: data.notes || '',
          contracts: data.contracts || [],
          createdAt: formatFirebaseTimestamp(data.createdAt),
          updatedAt: formatFirebaseTimestamp(data.updatedAt)
        })
      })
      setClients(clientsData)

      // Invoices fetch
      const invoicesRef = collection(db, 'invoices')
      const invoicesQuery = query(invoicesRef, orderBy('invoiceDate', 'desc'))
      const invoicesSnapshot = await getDocs(invoicesQuery)
      const invoicesData: Invoice[] = []
      invoicesSnapshot.forEach(doc => {
        const data = doc.data()
        invoicesData.push({
          id: doc.id,
          invoiceNumber: data.invoiceNumber || '',
          clientId: data.clientId || '',
          clientName: data.clientName || '',
          clientEmail: data.clientEmail || '',
          invoiceDate: data.invoiceDate || '',
          dueDate: data.dueDate || '',
          status: data.status || 'Draft',
          lineItems: data.lineItems || [],
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          taxRate: data.taxRate || 0.10,
          total: data.total || 0,
          notes: data.notes || '',
          paymentTerms: data.paymentTerms || '30 days',
          currencyCode: data.currencyCode || 'AED',
          sentDate: data.sentDate || '',
          paidDate: data.paidDate || '',
          createdBy: data.createdBy || 'Admin',
          updatedAt: data.updatedAt || ''
        })
      })
      setInvoices(invoicesData)

      // Payments fetch
      const paymentsRef = collection(db, 'record-payment')
      const paymentsSnapshot = await getDocs(paymentsRef)
      const paymentsData: Payment[] = []
      paymentsSnapshot.forEach(doc => {
        const data = doc.data()
        paymentsData.push({
          id: doc.id,
          invoiceId: data.invoiceId || '',
          clientId: data.clientId || '',
          amount: data.amount || 0,
          paymentDate: data.paymentDate || '',
          paymentMethod: data.paymentMethod || '',
          transactionRef: data.transactionRef || '',
          status: data.status || 'Completed'
        })
      })
      setPayments(paymentsData)

      // Expenses fetch
      const expensesRef = collection(db, 'record-expense')
      const expensesSnapshot = await getDocs(expensesRef)
      const expensesData: Expense[] = []
      expensesSnapshot.forEach(doc => {
        const data = doc.data()
        expensesData.push({
          id: doc.id,
          description: data.description || '',
          category: data.category || 'Supplies',
          amount: data.amount || 0,
          date: data.date || '',
          paymentMethod: data.paymentMethod || 'Bank Transfer',
          vendor: data.vendor || '',
          approvalStatus: data.approvalStatus || 'Pending',
          notes: data.notes || ''
        })
      })
      setExpenses(expensesData)

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const formatFirebaseTimestamp = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString().split('T')[0]
    
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0]
    }
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString().split('T')[0]
    }
    
    return timestamp as string
  }

  // Calculate financial summary
  const summary = useMemo(() => {
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalPending = invoices
      .filter(inv => inv.status === 'Sent')
      .reduce((sum, inv) => sum + inv.total, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const profit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0
    
    return {
      totalIncome,
      totalPending,
      totalExpenses,
      profit,
      profitMargin,
      paidInvoices: invoices.filter(inv => inv.status === 'Paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'Sent').length,
      overdueInvoices: invoices.filter(inv => inv.status === 'Overdue').length
    }
  }, [invoices, payments, expenses])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, filterStatus])

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clients, searchTerm])

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp =>
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [expenses, searchTerm])

  const handleAddInvoice = async () => {
    if (!newInvoice.clientId || newInvoice.lineItems.length === 0 || !newInvoice.dueDate) {
      alert('Please fill all required fields')
      return
    }

    const client = clients.find(c => c.id === newInvoice.clientId)
    if (!client) {
      alert('Client not found')
      return
    }

    const subtotal = newInvoice.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * 0.10
    const total = subtotal + tax

    const invoiceData = {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientId: newInvoice.clientId,
      clientName: client.name,
      clientEmail: client.email,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate,
      status: 'Sent' as const,
      lineItems: newInvoice.lineItems.map((item, idx) => ({
        id: `LI${Date.now()}${idx}`,
        ...item,
        amount: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      taxRate: 0.10,
      total,
      notes: newInvoice.notes,
      paymentTerms: newInvoice.paymentTerms,
      currencyCode: 'AED',
      sentDate: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
      updatedAt: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    }

    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData)
      
      // Add to local state
      const newInvoiceObj: Invoice = {
        id: docRef.id,
        ...invoiceData
      }
      
      setInvoices([...invoices, newInvoiceObj])
      setNewInvoice({ 
        clientId: '', 
        lineItems: [{ description: '', quantity: 1, unitPrice: 0, unit: 'service' }], 
        notes: '', 
        paymentTerms: '30 days', 
        dueDate: '', 
        attachments: [] 
      })
      setShowInvoiceModal(false)
      alert('Invoice created successfully!')
      
      // Generate PDF (simple browser print)
      generateInvoicePDF(newInvoiceObj)
      
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    }
  }

  const generateInvoicePDF = (invoice: Invoice) => {
    // Simple browser print function
    const printContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { margin-bottom: 20px; }
            .line-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .totals { float: right; margin-top: 20px; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoice.invoiceNumber}</h2>
          </div>
          
          <div class="invoice-info">
            <p><strong>Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
            <p><strong>Client:</strong> ${invoice.clientName}</p>
            <p><strong>Email:</strong> ${invoice.clientEmail}</p>
          </div>
          
          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: ${formatCurrency(invoice.subtotal)}</p>
            <p>Tax (10%): ${formatCurrency(invoice.tax)}</p>
            <p class="total-row">Total: ${formatCurrency(invoice.total)}</p>
            <p><strong>Payment Terms:</strong> ${invoice.paymentTerms}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      alert('Please fill required fields')
      return
    }

    const clientData = {
      name: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      location: newClient.location,
      joinDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      projects: 0,
      lastService: 'No service yet',
      status: 'Active',
      tier: 'Bronze',
      notes: newClient.notes,
      contracts: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'clients'), clientData)
      
      // Add to local state
      const newClientObj: Client = {
        id: docRef.id,
        ...clientData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setClients([...clients, newClientObj])
      setNewClient({ name: '', company: '', email: '', phone: '', location: '', notes: '' })
      setShowClientModal(false)
      alert('Client added successfully!')
      
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Failed to add client')
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Please fill required fields')
      return
    }

    const expenseData = {
      description: newExpense.description,
      category: newExpense.category,
      amount: newExpense.amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      vendor: newExpense.vendor,
      approvalStatus: 'Pending',
      notes: newExpense.notes
    }

    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'record-expense'), expenseData)
      
      // Add to local state
      const newExpenseObj: Expense = {
        id: docRef.id,
        ...expenseData
      }
      
      setExpenses([...expenses, newExpenseObj])
      setNewExpense({ description: '', category: 'Supplies', amount: 0, vendor: '', notes: '' })
      setShowExpenseModal(false)
      alert('Expense recorded successfully!')
      
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Failed to record expense')
    }
  }

  const handleAddPayment = async () => {
    if (!newPayment.invoiceId || !newPayment.amount) {
      alert('Please fill required fields')
      return
    }

    const invoice = invoices.find(inv => inv.id === newPayment.invoiceId)
    if (!invoice) {
      alert('Invoice not found')
      return
    }

    const paymentData = {
      invoiceId: newPayment.invoiceId,
      clientId: invoice.clientId,
      amount: newPayment.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: newPayment.paymentMethod,
      transactionRef: newPayment.transactionRef,
      status: 'Completed'
    }

    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'record-payment'), paymentData)
      
      // Add to local state
      const newPaymentObj: Payment = {
        id: docRef.id,
        ...paymentData
      }
      
      setPayments([...payments, newPaymentObj])
      
      // Update invoice status to Paid if full amount received
      if (newPayment.amount >= invoice.total) {
        await updateDoc(doc(db, 'invoices', invoice.id), {
          status: 'Paid',
          paidDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        })
        
        // Update local state
        setInvoices(invoices.map(inv =>
          inv.id === invoice.id ? { 
            ...inv, 
            status: 'Paid', 
            paidDate: new Date().toISOString().split('T')[0] 
          } : inv
        ))
      }
      
      setNewPayment({ invoiceId: '', amount: 0, paymentMethod: 'Bank Transfer', transactionRef: '', attachments: [] })
      setShowPaymentModal(false)
      alert('Payment recorded successfully!')
      
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Failed to record payment')
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Delete this invoice?')) {
      try {
        await deleteDoc(doc(db, 'invoices', id))
        setInvoices(invoices.filter(inv => inv.id !== id))
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('Failed to delete invoice')
      }
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'record-expense', id))
        setExpenses(expenses.filter(exp => exp.id !== id))
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Failed to delete expense')
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700'
      case 'Sent': return 'bg-blue-100 text-blue-700'
      case 'Overdue': return 'bg-red-100 text-red-700'
      case 'Draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-blue-100 text-blue-700'
      case 'Gold': return 'bg-yellow-100 text-yellow-700'
      case 'Silver': return 'bg-gray-100 text-gray-700'
      case 'Bronze': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'payment') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const fileSize = (file.size / 1024).toFixed(1) + ' KB'
      const fileObj = { name: file.name, size: fileSize, type: file.type }
      
      if (type === 'invoice') {
        setNewInvoice(prev => ({
          ...prev,
          attachments: [...prev.attachments, fileObj]
        }))
      } else {
        setNewPayment(prev => ({
          ...prev,
          attachments: [...prev.attachments, fileObj]
        }))
      }
    })
  }

  const removeAttachment = (index: number, type: 'invoice' | 'payment') => {
    if (type === 'invoice') {
      setNewInvoice(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }))
    } else {
      setNewPayment(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }))
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    return '📎'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Finance & Accounting</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete financial management with invoicing, payments, expenses & reports</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Total Income</p>
          <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(summary.totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.paidInvoices} paid</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Pending</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(summary.totalPending)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.pendingInvoices} pending, {summary.overdueInvoices} overdue</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Total Expenses</p>
          <p className="text-2xl font-black text-red-600 mt-1">{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} expenses</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Net Profit</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{formatCurrency(summary.profit)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.profitMargin.toFixed(1)}% margin</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b bg-card rounded-t-2xl px-4 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview', icon: 'overview' },
          { id: 'invoices', label: '📄 Invoices', icon: 'invoices' },
          { id: 'payments', label: '💳 Payments', icon: 'payments' },
          { id: 'expenses', label: '💰 Expenses', icon: 'expenses' },
          { id: 'clients', label: '👥 Clients', icon: 'clients' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
        >
          <CreditCard className="h-4 w-4" />
          Record Payment
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700"
        >
          <DollarSign className="h-4 w-4" />
          Add Expense
        </button>
        <button
          onClick={() => setShowClientModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700"
        >
          <Users className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-card border rounded-2xl p-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices, clients, expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
            />
          </div>
          {activeTab === 'invoices' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Invoices */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="font-black mb-4">Recent Invoices</h3>
            <div className="space-y-2">
              {invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{inv.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="font-black mb-4">Recent Expenses</h3>
            <div className="space-y-2">
              {expenses.slice(0, 5).map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{exp.description}</p>
                    <p className="text-xs text-muted-foreground">{exp.category}</p>
                  </div>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(exp.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="font-black mb-4">Top Clients</h3>
            <div className="space-y-2">
              {clients.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map(client => (
                <div key={client.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.projects} projects</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(client.totalSpent)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Status Summary */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="font-black mb-4">Invoice Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">Paid</p>
                <p className="font-bold text-green-600">{summary.paidInvoices} ({formatCurrency(summary.totalIncome)})</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Pending</p>
                <p className="font-bold text-blue-600">{summary.pendingInvoices} ({formatCurrency(summary.totalPending)})</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Overdue</p>
                <p className="font-bold text-red-600">{summary.overdueInvoices}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-3">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map(inv => (
              <div key={inv.id} className="bg-card border rounded-2xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black">{inv.invoiceNumber}</h3>
                        <p className="text-xs text-muted-foreground">{inv.clientName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold">{formatCurrency(inv.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Issued</p>
                        <p className="font-bold">{formatDate(inv.invoiceDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due</p>
                        <p className="font-bold">{formatDate(inv.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="font-bold">{inv.lineItems.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-2 hover:bg-muted rounded-lg">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length > 0 ? (
            payments.map(payment => {
              const invoice = invoices.find(inv => inv.id === payment.invoiceId)
              return (
                <div key={payment.id} className="bg-card border rounded-2xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Invoice</p>
                      <p className="font-bold text-sm">{invoice?.invoiceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Client</p>
                      <p className="font-bold text-sm">{invoice?.clientName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-bold text-sm">{formatDate(payment.paymentDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Method</p>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No payments recorded</p>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(exp => (
              <div key={exp.id} className="bg-card border rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black">{exp.description}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{exp.vendor || 'No vendor'} • {exp.notes || 'No notes'}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-muted inline-block mt-1">{exp.category}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold text-red-600">{formatCurrency(exp.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-bold">{formatDate(exp.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                          exp.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                          exp.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {exp.approvalStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-3">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div key={client.id} className="bg-card border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-black">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">{client.company}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{client.location}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-bold text-green-600">{formatCurrency(client.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Projects</p>
                        <p className="font-bold">{client.projects}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tier</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getTierColor(client.tier)}`}>
                          {client.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No clients found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b">
              <h2 className="text-2xl font-black">Create Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Select Client *</label>
                <div className="space-y-2 mb-4">
                  {clients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setNewInvoice({ ...newInvoice, clientId: client.id })}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        newInvoice.clientId === client.id
                          ? 'bg-blue-100 border-blue-600'
                          : 'bg-muted/50 hover:bg-muted border-muted'
                      }`}
                    >
                      <p className="font-bold">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.company} • {client.email}</p>
                    </button>
                  ))}
                </div>

                {/* Add Custom Client Option */}
                <button
                  onClick={() => setShowClientModal(true)}
                  className="w-full p-3 rounded-lg border-2 border-dashed border-blue-400 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
                >
                  + Add New Client
                </button>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Line Items *</label>
                <div className="space-y-3">
                  {newInvoice.lineItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...newInvoice.lineItems]
                          updated[idx].description = e.target.value
                          setNewInvoice({ ...newInvoice, lineItems: updated })
                        }}
                        className="col-span-2 px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...newInvoice.lineItems]
                          updated[idx].quantity = Number(e.target.value)
                          setNewInvoice({ ...newInvoice, lineItems: updated })
                        }}
                        className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...newInvoice.lineItems]
                          updated[idx].unitPrice = Number(e.target.value)
                          setNewInvoice({ ...newInvoice, lineItems: updated })
                        }}
                        className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setNewInvoice({
                      ...newInvoice,
                      lineItems: [...newInvoice.lineItems, { description: '', quantity: 1, unitPrice: 0, unit: 'service' }]
                    })}
                    className="w-full px-3 py-2 border-2 border-dashed rounded-lg text-sm font-bold hover:bg-muted"
                  >
                    + Add Line Item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Due Date *</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Payment Terms</label>
                  <input
                    type="text"
                    value={newInvoice.paymentTerms}
                    onChange={(e) => setNewInvoice({ ...newInvoice, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Attachments (Documents, Proofs, etc.)</label>
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'invoice')}
                    className="hidden"
                    id="invoice-file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  />
                  <label htmlFor="invoice-file-upload" className="cursor-pointer block">
                    <p className="text-sm font-bold text-blue-600">📤 Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT</p>
                  </label>
                </div>

                {newInvoice.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">Attached Files:</p>
                    {newInvoice.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(idx, 'invoice')}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Notes</label>
                <textarea
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-20 resize-none"
                  placeholder="Invoice notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInvoice}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b">
              <h2 className="text-2xl font-black">Add New Client</h2>
              <button onClick={() => setShowClientModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Name *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Company</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="+971-4-XXXX-XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Location</label>
                <input
                  type="text"
                  value={newClient.location}
                  onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="Dubai, UAE"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-16 resize-none"
                  placeholder="Client notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-orange-600/10 to-red-600/10 border-b">
              <h2 className="text-2xl font-black">Record Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Description *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="Expense description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  >
                    <option value="Supplies">Supplies</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Amount *</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Vendor</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="Vendor name"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Notes</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-16 resize-none"
                  placeholder="Expense notes..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-sm"
                >
                  Record Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b">
              <h2 className="text-2xl font-black">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Invoice *</label>
                <select
                  value={newPayment.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value)
                    setNewPayment({ ...newPayment, invoiceId: e.target.value, amount: inv?.total || 0 })
                  }}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                >
                  <option value="">Select invoice...</option>
                  {invoices.filter(inv => inv.status !== 'Paid').map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} - {formatCurrency(inv.total)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Amount *</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Payment Method</label>
                <select
                  value={newPayment.paymentMethod}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Transaction Reference</label>
                <input
                  type="text"
                  value={newPayment.transactionRef}
                  onChange={(e) => setNewPayment({ ...newPayment, transactionRef: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="TXN-XXXX-XXXX"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Proof of Payment (Receipt, Bank Statement, etc.)</label>
                <div className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'payment')}
                    className="hidden"
                    id="payment-file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <label htmlFor="payment-file-upload" className="cursor-pointer block">
                    <p className="text-sm font-bold text-green-600">📤 Click to upload proof of payment</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG, TXT</p>
                  </label>
                </div>

                {newPayment.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">Attached Files:</p>
                    {newPayment.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getFileIcon(file.type)}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(idx, 'payment')}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}