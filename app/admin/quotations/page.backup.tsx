'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Search, Plus, Trash2, Download, Eye, CheckCircle2, X, Filter, Calendar, DollarSign, User, Building, MapPin, Clock, AlertTriangle, FileText, Mail, Phone, Star, Settings, Copy, Archive, Send, CheckCircle, XCircle, Edit, Save, RotateCcw, Check, Zap, Package } from 'lucide-react'

// interface Client {
//   id: number
//   name: string
//   company: string
//   email: string
//   location: string
//   contactPerson: string
//   tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
// }

interface Quotation {
  id: number
  quoteNumber: string
  client: string
  clientId: number
  company: string
  email: string
  phone: string
  location: string
  amount: string
  baseAmount: number
  discountAmount: number
  discountPercentage: number
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled'
  date: string
  validUntil: string
  services: Array<string>
  products: Array<{ id: number; name: string; quantity: number; price: number; unit: string }>
  area: number
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  specialRequirements: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  terms: string
  notes: string
  version: number
  approvedBy: string
  approvedDate: string
  sentDate: string
  lastModified: string
  template: string
  recurring: boolean
  nextDueDate: string
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
  quotationId?: number
  startDate: string
  endDate: string
  value: string
  baseValue: number
  status: 'Draft' | 'Active' | 'Completed' | 'Terminated' | 'Expired'
  services: string[]
  terms: string
  paymentTerms: string
  renewalTerms: string
  specialConditions: string
  signedDate?: string
  lastModified: string
  version: number
}

interface Service {
  id: number
  name: string
  description: string
  categoryId: number
  categoryName: string
  price: number
  unit: string
  image?: string
  createdAt: string
}

interface Product {
  id: number
  name: string
  description: string
  categoryId: number
  categoryName: string
  price: number
  unit: string
  image?: string
  createdAt: string
}

// Service templates
// Service templates
const serviceTemplates = {
  'Residential Cleaning': {
    basePrice: 2.5,
    description: 'Complete home cleaning service',
    frequency: 'Weekly',
    estimatedHours: 4
  },
  'Commercial Office': {
    basePrice: 2.8,
    description: 'Office cleaning and maintenance',
    frequency: 'Daily',
    estimatedHours: 6
  },
  'Deep Cleaning': {
    basePrice: 4.5,
    description: 'Intensive deep cleaning service',
    frequency: 'Monthly',
    estimatedHours: 8
  },
  'Medical Facility': {
    basePrice: 5.2,
    description: 'Medical-grade sanitization and cleaning',
    frequency: 'Daily',
    estimatedHours: 10
  },
  'Industrial Cleaning': {
    basePrice: 3.8,
    description: 'Heavy-duty industrial cleaning',
    frequency: 'Weekly',
    estimatedHours: 12
  }
}

// Contract templates
const contractTemplates = {
  'Standard Service Contract': {
    duration: 12,
    paymentTerms: 'Monthly in advance',
    renewalTerms: 'Automatic renewal for 12 months unless 30 days notice given',
    terms: 'Service provider agrees to provide cleaning services as specified. Client agrees to provide access and payment as per terms.',
    specialConditions: 'Service level agreements apply. 24/7 emergency response available.'
  },
  'Premium Maintenance Contract': {
    duration: 24,
    paymentTerms: 'Quarterly in advance',
    renewalTerms: 'Automatic renewal for 12 months unless 60 days notice given',
    terms: 'Comprehensive facility maintenance including cleaning, repairs, and preventive maintenance.',
    specialConditions: 'Priority response within 4 hours. Annual facility audit included.'
  },
  'Medical Facility Contract': {
    duration: 12,
    paymentTerms: 'Monthly in advance',
    renewalTerms: 'Manual renewal required with 45 days notice',
    terms: 'Specialized medical facility cleaning with hospital-grade standards and compliance requirements.',
    specialConditions: 'HIPAA compliance required. Specialized training for medical waste handling.'
  }
}

export default function Quotations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [clientFilter, setClientFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'quotations' | 'contracts'>('quotations')
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    contactPerson: '',
    industry: '',
    notes: ''
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null)
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Product Management Integration
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [availableCategories, setAvailableCategories] = useState<{ id: number; name: string; description: string; color: string; image?: string }[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ id: number; name: string; quantity: number; price: number; unit: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [itemDescription, setItemDescription] = useState('')

  // Contract Builder States
  const [contracts, setContracts] = useState<any[]>([
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
      terms: 'Monthly cleaning services for residential properties. Service includes deep cleaning every 3 months.',
      paymentTerms: 'Monthly in advance',
      renewalTerms: 'Automatic renewal for 12 months unless 30 days notice given',
      specialConditions: '24/7 emergency response available. Priority scheduling for urgent requests.',
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
      terms: 'Comprehensive medical facility sanitization and cleaning services. Hospital-grade standards required.',
      paymentTerms: 'Quarterly in advance',
      renewalTerms: 'Automatic renewal for 12 months unless 60 days notice given',
      specialConditions: 'HIPAA compliance required. Specialized training for medical waste handling. Priority response within 4 hours.',
      signedDate: '2025-12-21',
      lastModified: '2025-12-21',
      version: 1
    }
  ])
  const [showContractBuilder, setShowContractBuilder] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [contractSearchTerm, setContractSearchTerm] = useState('')
  const [contractStatusFilter, setContractStatusFilter] = useState('All')

  const [sharedClients, setSharedClients] = useState([
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
  ])
  useEffect(() => {
    const loadProductData = () => {
      const savedCategories = localStorage.getItem('silvermaid_product_categories')
      const savedServices = localStorage.getItem('silvermaid_product_services')
      const savedProducts = localStorage.getItem('silvermaid_product_products')

      if (savedCategories) {
        setAvailableCategories(JSON.parse(savedCategories))
      }

      if (savedServices) {
        setAvailableServices(JSON.parse(savedServices))
      }

      if (savedProducts) {
        setAvailableProducts(JSON.parse(savedProducts))
      }
    }

    loadProductData()
  }, [])

  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: 1,
      quoteNumber: '#QT-001',
      client: 'Ahmed Al-Mansouri',
      clientId: 1,
      company: 'Dubai Properties LLC',
      email: 'ahmed@dubaiprop.ae',
      phone: '+971-50-1111111',
      location: 'Dubai Marina',
      amount: 'AED 6,250',
      baseAmount: 6250,
      discountAmount: 0,
      discountPercentage: 0,
      status: 'Accepted',
      date: '2025-12-15',
      validUntil: '2025-12-25',
      services: ['Residential Cleaning', 'Deep Cleaning'],
      products: [],
      area: 2500,
      frequency: 'Weekly',
      priority: 'Medium',
      specialRequirements: 'Focus on high-traffic areas',
      contactPerson: 'Ahmed Al-Mansouri',
      contactPhone: '+971-50-1111111',
      contactEmail: 'ahmed@dubaiprop.ae',
      terms: 'Payment due within 30 days. Service starts immediately upon acceptance.',
      notes: 'Premium client - ensure highest quality service',
      version: 1,
      approvedBy: 'Admin User',
      approvedDate: '2025-12-16',
      sentDate: '2025-12-15',
      lastModified: '2025-12-16',
      template: 'Residential Cleaning',
      recurring: true,
      nextDueDate: '2025-12-22'
    },
    {
      id: 2,
      quoteNumber: '#QT-002',
      client: 'Layla Hassan',
      clientId: 2,
      company: 'Paradise Hotels',
      email: 'layla@paradisehotels.ae',
      phone: '+971-50-4444444',
      location: 'Palm Jumeirah',
      amount: 'AED 23,400',
      baseAmount: 26000,
      discountAmount: 2600,
      discountPercentage: 10,
      status: 'Sent',
      date: '2025-12-18',
      validUntil: '2025-12-28',
      services: ['Commercial Office', 'Medical Facility'],
      products: [],
      area: 8500,
      frequency: 'Weekly',
      priority: 'High',
      specialRequirements: 'Medical-grade sanitization required. 24/7 access needed.',
      contactPerson: 'Layla Hassan',
      contactPhone: '+971-50-4444444',
      contactEmail: 'layla@paradisehotels.ae',
      terms: 'Monthly billing. 3-month minimum contract.',
      notes: 'Strategic partner - priority account',
      version: 2,
      approvedBy: 'John Smith',
      approvedDate: '2025-12-17',
      sentDate: '2025-12-18',
      lastModified: '2025-12-19',
      template: 'Medical Facility',
      recurring: true,
      nextDueDate: '2026-01-18'
    },
    {
      id: 3,
      quoteNumber: '#QT-003',
      client: 'Fatima Al-Noor',
      clientId: 3,
      company: 'Al Noor Logistics',
      email: 'fatima@alnoorlogistics.ae',
      phone: '+971-50-2222222',
      location: 'Dubai Industrial City',
      amount: 'AED 9,500',
      baseAmount: 9500,
      discountAmount: 0,
      discountPercentage: 0,
      status: 'Draft',
      date: '2025-12-20',
      validUntil: '2025-12-30',
      services: ['Industrial Cleaning'],
      products: [],
      area: 5000,
      frequency: 'Weekly',
      priority: 'Medium',
      specialRequirements: 'Heavy machinery areas require special attention',
      contactPerson: 'Fatima Al-Noor',
      contactPhone: '+971-50-2222222',
      contactEmail: 'fatima@alnoorlogistics.ae',
      terms: 'Payment due within 15 days.',
      notes: 'Industrial facility - safety protocols required',
      version: 1,
      approvedBy: '',
      approvedDate: '',
      sentDate: '',
      lastModified: '2025-12-20',
      template: 'Industrial Cleaning',
      recurring: false,
      nextDueDate: ''
    }
  ])

  const [newQuote, setNewQuote] = useState({
    clientId: '',
    services: [] as string[],
    products: [] as { id: number; name: string; quantity: number; price: number; unit: string }[],
    area: '',
    frequency: 'One-time' as Quotation['frequency'],
    priority: 'Medium' as Quotation['priority'],
    specialRequirements: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    discountPercentage: '',
    terms: 'Payment due within 30 days of invoice. Service commences upon acceptance of quotation.',
    notes: '',
    template: '',
    recurring: false
  })

  // Calculate quotation amount based on services and area
  const calculateQuoteAmount = useCallback((services: string[], products: { id: number; name: string; quantity: number; price: number; unit: string }[], area: number, discountPercentage: number = 0) => {
    let total = 0

    // Calculate service costs (per sq ft pricing)
    services.forEach(serviceName => {
      const service = availableServices.find(s => s.name === serviceName)
      if (service) {
        total += service.price * area
      } else {
        // Fallback to template pricing if service not found in catalog
        const template = serviceTemplates[serviceName as keyof typeof serviceTemplates]
        if (template) {
          total += template.basePrice * area
        }
      }
    })

    // Calculate product costs
    products.forEach(product => {
      total += product.price * product.quantity
    })

    const discountAmount = total * (discountPercentage / 100)
    const finalAmount = total - discountAmount

    return {
      baseAmount: total,
      discountAmount,
      finalAmount,
      formatted: `AED ${finalAmount.toLocaleString()}`
    }
  }, [availableServices])

  // Filtered quotations based on search and filters
  const filteredQuotes = useMemo(() => {
    return quotations.filter(quote => {
      const matchesSearch = quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'All' || quote.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || quote.priority === priorityFilter
      const matchesClient = clientFilter === 'All' || quote.clientId?.toString() === clientFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesClient
    })
  }, [quotations, searchTerm, statusFilter, priorityFilter, clientFilter])

  // Statistics calculations
  const stats = useMemo(() => {
    const totalValue = quotations.reduce((sum, q) => sum + q.baseAmount, 0)
    const acceptedValue = quotations.filter(q => q.status === 'Accepted').reduce((sum, q) => sum + q.baseAmount, 0)
    const pendingCount = quotations.filter(q => q.status === 'Draft' || q.status === 'Sent').length
    const acceptedCount = quotations.filter(q => q.status === 'Accepted').length
    const conversionRate = quotations.length > 0 ? (acceptedCount / quotations.length) * 100 : 0

    return {
      totalValue,
      acceptedValue,
      pendingCount,
      acceptedCount,
      conversionRate
    }
  }, [quotations])

  const handleAddQuote = useCallback(() => {
    if (!newQuote.clientId || !selectedService || !newQuote.area) {
      alert('Please fill in all required fields')
      return
    }

    const client = sharedClients.find(c => c.id.toString() === newQuote.clientId)
    if (!client) return

    const area = parseFloat(newQuote.area)
    const discountPercentage = parseFloat(newQuote.discountPercentage) || 0
    const calculation = calculateQuoteAmount([selectedService.name], selectedProducts, area, discountPercentage)

    // Generate automatic descriptions from selected service and products
    let autoDescription = ''

    if (selectedService) {
      autoDescription += 'Service Included:\n'
      autoDescription += `• ${selectedService.name}: ${selectedService.description}\n`
    }

    if (selectedProducts.length > 0) {
      if (autoDescription) autoDescription += '\n'
      autoDescription += 'Products/Materials Included:\n'
      selectedProducts.forEach(product => {
        const productData = availableProducts.find(p => p.id === product.id)
        if (productData && productData.description) {
          autoDescription += `• ${product.name} (x${product.quantity}): ${productData.description}\n`
        } else {
          autoDescription += `• ${product.name} (x${product.quantity})\n`
        }
      })
    }

    // Combine with item description
    if (itemDescription && itemDescription !== selectedService?.description) {
      if (autoDescription) autoDescription += '\n'
      autoDescription += `Additional Details:\n${itemDescription}`
    }

    // Combine auto-generated description with user input
    const finalSpecialRequirements = autoDescription
      ? (newQuote.specialRequirements
          ? `${autoDescription}\n\nAdditional Requirements:\n${newQuote.specialRequirements}`
          : autoDescription)
      : newQuote.specialRequirements

    const quote: Quotation = {
      id: Math.max(...quotations.map(q => q.id), 0) + 1,
      quoteNumber: `#QT-${String(quotations.length + 1).padStart(3, '0')}`,
      client: client.name,
      clientId: client.id,
      company: client.company,
      email: client.email,
      phone: client.phone,
      location: client.location,
      amount: calculation.formatted,
      baseAmount: calculation.finalAmount,
      discountAmount: calculation.discountAmount,
      discountPercentage,
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      services: [selectedService.name],
      products: selectedProducts,
      area,
      frequency: newQuote.frequency,
      priority: newQuote.priority,
      specialRequirements: finalSpecialRequirements,
      contactPerson: newQuote.contactPerson || client.contactPerson,
      contactPhone: newQuote.contactPhone || client.phone,
      contactEmail: newQuote.contactEmail || client.email,
      terms: newQuote.terms,
      notes: newQuote.notes,
      version: 1,
      approvedBy: '',
      approvedDate: '',
      sentDate: '',
      lastModified: new Date().toISOString().split('T')[0],
      template: newQuote.template,
      recurring: newQuote.recurring,
      nextDueDate: ''
    }

    setQuotations([...quotations, quote])
    setNewQuote({
      clientId: '',
      services: [],
      products: [],
      area: '',
      frequency: 'One-time',
      priority: 'Medium',
      specialRequirements: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      discountPercentage: '',
      terms: 'Payment due within 30 days of invoice. Service commences upon acceptance of quotation.',
      notes: '',
      template: '',
      recurring: false
    })
    setShowAddModal(false)
    alert(`✓ Quotation ${quote.quoteNumber} created successfully!`)
  }, [newQuote, quotations, calculateQuoteAmount])

  const handleDeleteQuote = useCallback((id: number) => {
    const quote = quotations.find(q => q.id === id)
    if (window.confirm(`Delete quotation ${quote?.quoteNumber}? This action cannot be undone.`)) {
      setQuotations(quotations.filter(q => q.id !== id))
      alert('✓ Quotation deleted')
    }
  }, [quotations])

  const handleStatusChange = useCallback((id: number, newStatus: string) => {
    setQuotations(quotations.map(q =>
      q.id === id ? {
        ...q,
        status: newStatus as Quotation['status'],
        approvedBy: newStatus === 'Accepted' ? 'Admin User' : q.approvedBy,
        approvedDate: newStatus === 'Accepted' ? new Date().toISOString().split('T')[0] : q.approvedDate,
        lastModified: new Date().toISOString().split('T')[0]
      } : q
    ))
    alert(`✓ Status updated to "${newStatus}"`)
  }, [quotations])

  const handleBulkStatusChange = useCallback((newStatus: string) => {
    setQuotations(quotations.map(q =>
      selectedQuotes.includes(q.id) ? {
        ...q,
        status: newStatus as Quotation['status'],
        approvedBy: newStatus === 'Accepted' ? 'Admin User' : q.approvedBy,
        approvedDate: newStatus === 'Accepted' ? new Date().toISOString().split('T')[0] : q.approvedDate,
        lastModified: new Date().toISOString().split('T')[0]
      } : q
    ))
    setSelectedQuotes([])
    setShowBulkActions(false)
    alert(`✓ ${selectedQuotes.length} quotations updated to "${newStatus}"`)
  }, [quotations, selectedQuotes])

  const handleDownload = useCallback((id: number) => {
    const quote = quotations.find(q => q.id === id)
    alert(`✓ Downloading ${quote?.quoteNumber} as PDF...`)
  }, [quotations])

  const handleSendQuote = useCallback((id: number) => {
    const quote = quotations.find(q => q.id === id)
    if (quote) {
      setQuotations(quotations.map(q =>
        q.id === id ? {
          ...q,
          status: 'Sent',
          sentDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0]
        } : q
      ))
      alert(`✓ Quotation ${quote.quoteNumber} sent to ${quote.contactEmail}`)
    }
  }, [quotations])

  const handleDuplicateQuote = useCallback((id: number) => {
    const originalQuote = quotations.find(q => q.id === id)
    if (originalQuote) {
      const duplicatedQuote: Quotation = {
        ...originalQuote,
        id: Math.max(...quotations.map(q => q.id), 0) + 1,
        quoteNumber: `#QT-${String(quotations.length + 1).padStart(3, '0')}`,
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        version: 1,
        approvedBy: '',
        approvedDate: '',
        sentDate: '',
        lastModified: new Date().toISOString().split('T')[0]
      }
      setQuotations([...quotations, duplicatedQuote])
      alert(`✓ Quotation duplicated as ${duplicatedQuote.quoteNumber}`)
    }
  }, [quotations])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700'
      case 'Sent': return 'bg-blue-100 text-blue-700'
      case 'Accepted': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      case 'Expired': return 'bg-orange-100 text-orange-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'High': return 'bg-orange-100 text-orange-700'
      case 'Urgent': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleTemplateSelect = useCallback((templateName: string) => {
    const template = serviceTemplates[templateName as keyof typeof serviceTemplates]
    if (template) {
      setNewQuote(prev => ({
        ...prev,
        template: templateName,
        services: [templateName],
        frequency: template.frequency as Quotation['frequency']
      }))
    }
  }, [])

  const handleServiceToggle = useCallback((service: string) => {
    setNewQuote(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }, [])

  const handleProductToggle = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) {
        return prev.filter(p => p.id !== product.id)
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
          unit: product.unit
        }]
      }
    })
  }, [])

  const handleProductQuantityChange = useCallback((productId: number, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p)
    )
  }, [])

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service)
    setItemDescription(service.description)
  }, [])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedService(null)
    setItemDescription('')
  }, [])

  const handleSelectAllQuotes = useCallback(() => {
    setSelectedQuotes(selectedQuotes.length === filteredQuotes.length ? [] : filteredQuotes.map(q => q.id))
  }, [selectedQuotes, filteredQuotes])

  const handleSelectQuote = useCallback((id: number) => {
    setSelectedQuotes(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    )
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">
            {activeTab === 'quotations' ? 'Quotations' : 'Contracts'}
          </h1>
          <p className="text-slate-500">
            {activeTab === 'quotations' 
              ? 'Manage service quotations and proposals with advanced features.' 
              : 'Create and manage service contracts with automated renewals.'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'quotations' ? (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 transition-all"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="h-5 w-5" />
                New Quotation
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setContractStatusFilter(contractStatusFilter === 'All' ? 'Active' : 'All')}
                className="inline-flex items-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-50 transition-all"
              >
                <Filter className="h-5 w-5" />
                {contractStatusFilter === 'All' ? 'All Status' : contractStatusFilter}
              </button>
              <button
                onClick={() => setShowContractBuilder(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
              >
                <Plus className="h-5 w-5" />
                New Contract
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm inline-flex">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${
            activeTab === 'quotations'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Quotations
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-6 py-3 rounded-xl font-black transition-all ${
            activeTab === 'contracts'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Contracts
        </button>
      </div>

      {activeTab === 'quotations' && (
        <>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-black text-slate-900">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-black text-slate-900">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-black text-slate-900">Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Clients</option>
                {sharedClients.map(client => (
                  <option key={client.id} value={client.id.toString()}>{client.name} - {client.company}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('All')
                  setPriorityFilter('All')
                  setClientFilter('All')
                  setSearchTerm('')
                }}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-black rounded-lg hover:bg-slate-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Value</p>
          <p className="text-3xl font-black text-slate-900 mt-2">AED {stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Accepted Value</p>
          <p className="text-3xl font-black text-green-600 mt-2">AED {stats.acceptedValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-black text-yellow-600 mt-2">{stats.pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Accepted</p>
          <p className="text-3xl font-black text-green-600 mt-2">{stats.acceptedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotations by client, quote number, or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {selectedQuotes.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkActions(true)}
              className="px-4 py-3 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700"
            >
              Bulk Actions ({selectedQuotes.length})
            </button>
            <button
              onClick={() => setSelectedQuotes([])}
              className="px-4 py-3 border border-slate-200 text-slate-700 font-black rounded-lg hover:bg-slate-50"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedQuotes.length === filteredQuotes.length && filteredQuotes.length > 0}
                    onChange={handleSelectAllQuotes}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Quote #</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Services</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Valid Until</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedQuotes.includes(quote.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.includes(quote.id)}
                      onChange={() => handleSelectQuote(quote.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-black text-blue-600">{quote.quoteNumber}</p>
                      <p className="text-xs text-slate-500">v{quote.version || 1}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{quote.client}</p>
                      <p className="text-sm text-slate-600">{quote.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {quote.services.slice(0, 2).map((service, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          {service}
                        </span>
                      ))}
                      {quote.services.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                          +{quote.services.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-black text-slate-900">{quote.amount}</p>
                      {quote.discountPercentage > 0 && (
                        <p className="text-xs text-green-600">-{quote.discountPercentage}% discount</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getPriorityColor(quote.priority)}`}>
                      {quote.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-sm border-0 cursor-pointer ${getStatusColor(quote.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {quote.validUntil}
                    {new Date(quote.validUntil) < new Date() && quote.status === 'Sent' && (
                      <span className="ml-2 text-red-500 text-xs">EXPIRED</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedQuote(quote)
                          setShowDetails(true)
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {quote.status === 'Draft' && (
                        <button
                          onClick={() => handleSendQuote(quote.id)}
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          title="Send Quote"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateQuote(quote.id)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600"
                        title="Duplicate Quote"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(quote.id)}
                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        title="Delete Quote"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No quotations found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Bulk Actions</h2>
              <button
                onClick={() => setShowBulkActions(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600">Apply action to {selectedQuotes.length} selected quotations:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleBulkStatusChange('Sent')}
                  className="p-3 border border-blue-200 text-blue-700 font-black rounded-lg hover:bg-blue-50"
                >
                  Mark as Sent
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Accepted')}
                  className="p-3 border border-green-200 text-green-700 font-black rounded-lg hover:bg-green-50"
                >
                  Mark as Accepted
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Rejected')}
                  className="p-3 border border-red-200 text-red-700 font-black rounded-lg hover:bg-red-50"
                >
                  Mark as Rejected
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Cancelled')}
                  className="p-3 border border-gray-200 text-gray-700 font-black rounded-lg hover:bg-gray-50"
                >
                  Mark as Cancelled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>

      )}

      {/* Enhanced Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Create New Quotation</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedProducts([])
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-black text-slate-900">Use Template</label>
                    <select
                      value={newQuote.template}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a template or create custom</option>
                      {Object.keys(serviceTemplates).map(template => (
                        <option key={template} value={template}>{template}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Client *</label>
                    <select
                      value={newQuote.clientId}
                      onChange={(e) => {
                        if (e.target.value === 'new') {
                          setShowAddClientModal(true)
                        } else {
                          setNewQuote({...newQuote, clientId: e.target.value})
                        }
                      }}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Client</option>
                      {sharedClients.map(client => (
                        <option key={client.id} value={client.id.toString()}>
                          {client.name} - {client.company} ({client.tier})
                        </option>
                      ))}
                      <option value="new">+ Add New Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Category *</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {availableCategories.map(category => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="text-sm font-black text-slate-900">Service *</label>
                      <div className="mt-2 grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {availableServices
                          .filter(service => service.categoryId.toString() === selectedCategory)
                          .map(service => (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => handleServiceSelect(service)}
                              className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                                selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                              }`}
                            >
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                  <Zap className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 text-left">
                                <div className="font-bold text-slate-900 text-sm">{service.name}</div>
                                <div className="text-xs text-slate-500">
                                  AED {service.price}/{service.unit}
                                </div>
                              </div>
                              {selectedService?.id === service.id && (
                                <Check className="h-5 w-5 text-blue-600" />
                              )}
                            </button>
                          ))}
                        {availableServices.filter(service => service.categoryId.toString() === selectedCategory).length === 0 && (
                          <p className="text-sm text-slate-500 py-4">No services available in this category.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-black text-slate-900">Item Description</label>
                    <textarea
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Service description will auto-populate when you select a service above..."
                      rows={4}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Products</label>
                    <div className="mt-2 grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {availableProducts.length > 0 ? (
                        availableProducts.map(product => (
                          <label key={product.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProducts.some(p => p.id === product.id)}
                              onChange={() => handleProductToggle(product)}
                              className="rounded border-slate-300"
                            />
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-bold text-slate-900">{product.name}</div>
                              <div className="text-sm text-slate-600 line-clamp-2">{product.description}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                AED {product.price} per {product.unit} • {product.categoryName}
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No products available. Please add products in Product Management.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-black text-slate-900">Area (sq ft) *</label>
                      <input
                        type="number"
                        value={newQuote.area}
                        onChange={(e) => setNewQuote({...newQuote, area: e.target.value})}
                        placeholder="2500"
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-slate-900">Discount %</label>
                      <input
                        type="number"
                        value={newQuote.discountPercentage}
                        onChange={(e) => setNewQuote({...newQuote, discountPercentage: e.target.value})}
                        placeholder="0"
                        min="0"
                        max="50"
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-black text-slate-900">Frequency</label>
                      <select
                        value={newQuote.frequency}
                        onChange={(e) => setNewQuote({...newQuote, frequency: e.target.value as Quotation['frequency']})}
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="One-time">One-time</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-black text-slate-900">Priority</label>
                      <select
                        value={newQuote.priority}
                        onChange={(e) => setNewQuote({...newQuote, priority: e.target.value as Quotation['priority']})}
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-black text-slate-900">Contact Person</label>
                    <input
                      type="text"
                      value={newQuote.contactPerson}
                      onChange={(e) => setNewQuote({...newQuote, contactPerson: e.target.value})}
                      placeholder="Contact person name"
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-black text-slate-900">Contact Phone</label>
                      <input
                        type="tel"
                        value={newQuote.contactPhone}
                        onChange={(e) => setNewQuote({...newQuote, contactPhone: e.target.value})}
                        placeholder="+971-50-XXXXXXX"
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-slate-900">Contact Email</label>
                      <input
                        type="email"
                        value={newQuote.contactEmail}
                        onChange={(e) => setNewQuote({...newQuote, contactEmail: e.target.value})}
                        placeholder="contact@company.com"
                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Special Requirements</label>
                    <textarea
                      value={newQuote.specialRequirements}
                      onChange={(e) => setNewQuote({...newQuote, specialRequirements: e.target.value})}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Terms & Conditions</label>
                    <textarea
                      value={newQuote.terms}
                      onChange={(e) => setNewQuote({...newQuote, terms: e.target.value})}
                      rows={3}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-slate-900">Internal Notes</label>
                    <textarea
                      value={newQuote.notes}
                      onChange={(e) => setNewQuote({...newQuote, notes: e.target.value})}
                      placeholder="Internal notes for the team..."
                      rows={2}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={newQuote.recurring}
                      onChange={(e) => setNewQuote({...newQuote, recurring: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="recurring" className="text-sm font-bold text-slate-900">
                      Recurring Quotation
                    </label>
                  </div>
                </div>
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-black text-blue-900 mb-3">Selected Products</h3>
                  <div className="space-y-2">
                    {selectedProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">AED {product.price} per {product.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold text-slate-700">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleProductQuantityChange(product.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-slate-200 rounded text-center"
                          />
                          <span className="text-sm text-slate-600 w-16 text-right">
                            AED {(product.price * product.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleProductToggle(availableProducts.find(p => p.id === product.id)!)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Preview */}
              {(newQuote.services.length > 0 || selectedProducts.length > 0) && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-black text-green-900 mb-3">Auto-Generated Description Preview</h3>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {(() => {
                        let preview = ''

                        if (newQuote.services.length > 0) {
                          preview += 'Services Included:\n'
                          newQuote.services.forEach(serviceName => {
                            const service = availableServices.find(s => s.name === serviceName)
                            if (service && service.description) {
                              preview += `• ${service.name}: ${service.description}\n`
                            } else {
                              preview += `• ${serviceName}\n`
                            }
                          })
                        }

                        if (selectedProducts.length > 0) {
                          if (preview) preview += '\n'
                          preview += 'Products/Materials Included:\n'
                          selectedProducts.forEach(product => {
                            const productData = availableProducts.find(p => p.id === product.id)
                            if (productData && productData.description) {
                              preview += `• ${product.name} (x${product.quantity}): ${productData.description}\n`
                            } else {
                              preview += `• ${product.name} (x${product.quantity})\n`
                            }
                          })
                        }

                        if (newQuote.specialRequirements) {
                          if (preview) preview += '\n'
                          preview += `Additional Requirements:\n${newQuote.specialRequirements}`
                        }

                        return preview || 'No services or products selected'
                      })()}
                    </pre>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    This description will be automatically added to the quotation's special requirements field.
                  </p>
                </div>
              )}

              {/* Price Preview */}
              {(newQuote.services.length > 0 || selectedProducts.length > 0) && newQuote.area && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-black text-slate-900 mb-2">Price Preview</h3>
                  {(() => {
                    const area = parseFloat(newQuote.area) || 0
                    const discount = parseFloat(newQuote.discountPercentage) || 0
                    const calculation = calculateQuoteAmount(newQuote.services, selectedProducts, area, discount)
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Base Amount</p>
                          <p className="font-black">AED {calculation.baseAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Discount</p>
                          <p className="font-black text-green-600">-AED {calculation.discountAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Final Amount</p>
                          <p className="font-black text-blue-600">{calculation.formatted}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Per sq ft</p>
                          <p className="font-black">AED {(calculation.finalAmount / area).toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedProducts([])
                    setSelectedCategory('')
                    setSelectedService(null)
                    setItemDescription('')
                  }}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-900 font-black rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddQuote}
                  className="flex-1 py-3 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700"
                >
                  Create Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Details Modal */}
      {showDetails && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedQuote.quoteNumber}</h2>
                  <p className="text-slate-500">Version {selectedQuote.version || 1} • Created {selectedQuote.date}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-blue-900">Quote Summary</h3>
                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getStatusColor(selectedQuote.status)}`}>
                        {selectedQuote.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Quote Number:</span>
                        <span className="font-black text-blue-900">{selectedQuote.quoteNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Amount:</span>
                        <span className="font-black text-blue-900 text-xl">{selectedQuote.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Valid Until:</span>
                        <span className="font-bold text-blue-900">{selectedQuote.validUntil}</span>
                      </div>
                      {selectedQuote.discountPercentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-700">Discount:</span>
                          <span className="font-bold text-green-700">-{selectedQuote.discountPercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Client Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold">{selectedQuote.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Services & Products</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-3">Services:</p>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedQuote.services.map((serviceName, i) => {
                            const service = availableServices.find(s => s.name === serviceName)
                            return (
                              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                {service?.image ? (
                                  <img
                                    src={service.image}
                                    alt={serviceName}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900">{serviceName}</div>
                                  {service?.description && (
                                    <div className="text-sm text-slate-600 mt-1">{service.description}</div>
                                  )}
                                  {service && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      AED {service.price}/{service.unit} • {service.categoryName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      {selectedQuote.products && selectedQuote.products.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-3">Products:</p>
                          <div className="grid grid-cols-1 gap-3">
                            {selectedQuote.products.map((product, i) => {
                              const productData = availableProducts.find(p => p.id === product.id)
                              return (
                                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                  {productData?.image ? (
                                    <img
                                      src={productData.image}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                                      <Package className="h-6 w-6 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-bold text-slate-900">{product.name} (x{product.quantity})</div>
                                    {productData?.description && (
                                      <div className="text-sm text-slate-600 mt-1">{productData.description}</div>
                                    )}
                                    <div className="text-xs text-slate-500 mt-1">
                                      AED {product.price} per {product.unit} • {productData?.categoryName || 'Unknown'}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-slate-900">
                                      AED {(product.price * product.quantity).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Area:</span>
                          <span className="font-bold ml-2">{selectedQuote.area?.toLocaleString()} sq ft</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Frequency:</span>
                          <span className="font-bold ml-2">{selectedQuote.frequency}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Priority:</span>
                          <span className={`font-bold ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedQuote.priority)}`}>
                            {selectedQuote.priority}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Recurring:</span>
                          <span className={`font-bold ml-2 ${selectedQuote.recurring ? 'text-green-600' : 'text-slate-500'}`}>
                            {selectedQuote.recurring ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      {selectedQuote.specialRequirements && (
                        <div>
                          <p className="text-sm font-bold text-slate-700">Special Requirements:</p>
                          <p className="text-sm text-slate-600 mt-1">{selectedQuote.specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Contact Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold">{selectedQuote.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{selectedQuote.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Terms & Conditions</h3>
                    <p className="text-sm text-slate-600">{selectedQuote.terms}</p>
                  </div>

                  {selectedQuote.notes && (
                    <div>
                      <h3 className="font-black text-slate-900 mb-3">Internal Notes</h3>
                      <p className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg">{selectedQuote.notes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-black text-slate-900 mb-3">Quote History</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created:</span>
                        <span className="font-bold">{selectedQuote.date}</span>
                      </div>
                      {selectedQuote.sentDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sent:</span>
                          <span className="font-bold">{selectedQuote.sentDate}</span>
                        </div>
                      )}
                      {selectedQuote.approvedDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Approved:</span>
                          <span className="font-bold">{selectedQuote.approvedDate}</span>
                        </div>
                      )}
                      {selectedQuote.approvedBy && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Approved By:</span>
                          <span className="font-bold">{selectedQuote.approvedBy}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Modified:</span>
                        <span className="font-bold">{selectedQuote.lastModified}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  onClick={() => handleDuplicateQuote(selectedQuote.id)}
                  className="px-4 py-2 border border-purple-200 text-purple-700 font-black rounded-lg hover:bg-purple-50"
                >
                  <Copy className="h-4 w-4 inline mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleDownload(selectedQuote.id)}
                  className="px-4 py-2 border border-indigo-200 text-indigo-700 font-black rounded-lg hover:bg-indigo-50"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download PDF
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Tab Content */}
      {activeTab === 'contracts' && (
        <>
          {/* Contracts Search */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={contractSearchTerm}
                  onChange={(e) => setContractSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Terminated">Terminated</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Contract #</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Services</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Start Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">End Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts
                    .filter(contract =>
                      contract.contractNumber.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
                      contract.client.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
                      contract.company.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
                      contract.services.some((s: string) => s.toLowerCase().includes(contractSearchTerm.toLowerCase()))
                    )
                    .filter(contract => contractStatusFilter === 'All' || contract.status === contractStatusFilter)
                    .map((contract) => (
                      <tr key={contract.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">{contract.contractNumber}</div>
                          <div className="text-xs text-slate-500">v{contract.version}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">{contract.client}</div>
                          <div className="text-sm text-slate-500">{contract.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {contract.services.map((service: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {service}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-green-600">{contract.value}</td>
                        <td className="px-6 py-4 text-slate-700">{contract.startDate}</td>
                        <td className="px-6 py-4 text-slate-700">{contract.endDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            contract.status === 'Active' ? 'bg-green-100 text-green-700' :
                            contract.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            contract.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedContract(contract)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {/* Handle contract edit */}}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                              title="Edit Contract"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {/* Handle contract download */}}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Contract Builder Modal */}
      {showContractBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Contract Builder</h2>
                <button
                  onClick={() => setShowContractBuilder(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-slate-900">Contract Template</label>
                    <select className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select Template</option>
                      <option value="standard">Standard Service Contract</option>
                      <option value="premium">Premium Maintenance Contract</option>
                      <option value="medical">Medical Facility Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Client</label>
                    <select className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select Client</option>
                      {sharedClients.map(client => (
                        <option key={client.id} value={client.id}>{client.name} - {client.company}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-slate-900">Start Date</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Duration (Months)</label>
                    <input
                      type="number"
                      placeholder="12"
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black text-slate-900">Services Included</label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableServices.slice(0, 6).map(service => (
                      <label key={service.id} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-slate-300" />
                        <span className="text-sm">{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-black text-slate-900">Payment Terms</label>
                    <select className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="monthly">Monthly in Advance</option>
                      <option value="quarterly">Quarterly in Advance</option>
                      <option value="annually">Annually in Advance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Contract Value</label>
                    <input
                      type="text"
                      placeholder="AED 50,000"
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black text-slate-900">Special Conditions</label>
                  <textarea
                    rows={3}
                    placeholder="Enter any special conditions or requirements..."
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  onClick={() => setShowContractBuilder(false)}
                  className="px-6 py-2 bg-slate-600 text-white font-black rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => {
                    // Handle contract creation
                    alert('Contract created successfully!')
                    setShowContractBuilder(false)
                  }}
                  className="px-6 py-2 bg-green-600 text-white font-black rounded-lg hover:bg-green-700"
                >
                  Create Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedContract.contractNumber}</h2>
                  <p className="text-slate-500">Version {selectedContract.version} • Created {selectedContract.lastModified}</p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">Client Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Client:</span>
                        <span className="font-black">{selectedContract.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Company:</span>
                        <span className="font-black">{selectedContract.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-black">{selectedContract.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-black">{selectedContract.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">Contract Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Start Date:</span>
                        <span className="font-black">{selectedContract.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">End Date:</span>
                        <span className="font-black">{selectedContract.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Value:</span>
                        <span className="font-black text-green-600">{selectedContract.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-black ${
                          selectedContract.status === 'Active' ? 'bg-green-100 text-green-700' :
                          selectedContract.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedContract.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">Services & Terms</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-500">Services:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedContract.services.map((service: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Payment Terms:</span>
                        <p className="mt-1 font-black">{selectedContract.paymentTerms}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Renewal Terms:</span>
                        <p className="mt-1 font-black">{selectedContract.renewalTerms}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">Contract Terms</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-700">{selectedContract.terms}</p>
                    </div>
                  </div>

                  {selectedContract.specialConditions && (
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-4">Special Conditions</h3>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">{selectedContract.specialConditions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  onClick={() => {/* Handle contract edit */}}
                  className="px-4 py-2 border border-blue-200 text-blue-700 font-black rounded-lg hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {/* Handle contract duplicate */}}
                  className="px-4 py-2 border border-purple-200 text-purple-700 font-black rounded-lg hover:bg-purple-50"
                >
                  <Copy className="h-4 w-4 inline mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => {/* Handle contract PDF download */}}
                  className="px-4 py-2 border border-green-200 text-green-700 font-black rounded-lg hover:bg-green-50"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download PDF
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="px-6 py-2 bg-green-600 text-white font-black rounded-lg hover:bg-green-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Add New Client</h2>
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-black text-slate-900">Client Name *</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Company</label>
                    <input
                      type="text"
                      value={newClient.company}
                      onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-black text-slate-900">Email *</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Phone *</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-black text-slate-900">Location</label>
                    <input
                      type="text"
                      value={newClient.location}
                      onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-black text-slate-900">Contact Person</label>
                    <input
                      type="text"
                      value={newClient.contactPerson}
                      onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact person"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black text-slate-900">Industry</label>
                  <input
                    type="text"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter industry type"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-slate-900">Notes</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    rows={3}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about the client"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-900 font-black rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newClient.name || !newClient.email || !newClient.phone) {
                      alert('Please fill in all required fields')
                      return
                    }

                    const client: any = {
                      id: Math.max(...sharedClients.map(c => c.id), 0) + 1,
                      name: newClient.name,
                      company: newClient.company || '',
                      email: newClient.email,
                      phone: newClient.phone,
                      location: newClient.location || '',
                      contactPerson: newClient.contactPerson || '',
                      industry: newClient.industry || '',
                      tier: 'Bronze',
                      joinDate: new Date().toISOString().split('T')[0],
                      lastService: '',
                      totalServices: 0,
                      totalSpent: 0,
                      loyaltyStatus: 'New',
                      communicationPreference: 'Email',
                      satisfactionIndex: 0,
                      satisfactionTrend: 'stable',
                      qualityScore: 0,
                      npsScores: [],
                      notes: newClient.notes || ''
                    }

                    const updatedClients = [...sharedClients, client]
                    setSharedClients(updatedClients)
                    localStorage.setItem('silvermaid_crm_clients', JSON.stringify(updatedClients))

                    setNewQuote({...newQuote, clientId: client.id.toString()})
                    setNewClient({
                      name: '',
                      company: '',
                      email: '',
                      phone: '',
                      location: '',
                      contactPerson: '',
                      industry: '',
                      notes: ''
                    })
                    setShowAddClientModal(false)
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
