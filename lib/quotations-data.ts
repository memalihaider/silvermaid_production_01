export interface QuotationItem {
  id: number
  type: 'service' | 'product'
  itemId: number
  name: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  image?: string
  categoryName: string
}

export interface Service {
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

export interface Product {
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

export interface Category {
  id: number
  name: string
  description: string
  color?: string
  image?: string
}

export interface SelectedService {
  id: number
  name: string
  description: string
  categoryId: number
  categoryName: string
  price: number
  unit: string
  quantity: number
  image?: string
}

export interface Client {
  id: number
  name: string
  company: string
  email: string
  phone: string
  location: string
  contactPerson: string
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze'
}

export interface Quotation {
  id: number
  quoteNumber: string
  client: Client
  selectedServices: SelectedService[]
  selectedProducts: QuotationItem[]
  items: QuotationItem[]
  totals: {
    subtotal: number
    discountAmount: number
    finalTotal: number
    totalCost: number
    margin: number
    marginValid: boolean
  }
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired'
  createdDate: string
  expiryDate: string
  version: number
  viewCount?: number
  description?: string
  auditLog: {
    action: string
    user: string
    timestamp: string
    changes?: string
  }[]
}

// Shared quotation data store
let quotationsData: Quotation[] = [
  {
    id: 1,
    quoteNumber: '#QB-001',
    client: {
      id: 1,
      name: 'Emirates Medical Center',
      company: 'Emirates Medical Center LLC',
      email: 'procurement@emiratesmedical.ae',
      phone: '+971-4-123-4567',
      location: 'Dubai Healthcare City',
      contactPerson: 'Dr. Ahmed Al-Mansouri',
      tier: 'Gold'
    },
    selectedServices: [
      {
        id: 3,
        name: 'Medical Facility Sanitization',
        description: 'Specialized sanitization services for medical facilities with hospital-grade disinfectants.',
        categoryId: 3,
        categoryName: 'Specialized Services',
        price: 250,
        unit: 'per sq ft',
        quantity: 20,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
      }
    ],
    selectedProducts: [
      {
        id: 2,
        type: 'product',
        itemId: 2,
        name: 'Medical Grade Disinfectant',
        description: 'Hospital-grade disinfectant solution effective against bacteria, viruses, and fungi.',
        quantity: 5,
        unitPrice: 75,
        discount: 0,
        total: 375,
        categoryName: 'Specialized Services',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031e21f?w=400'
      }
    ],
    items: [
      {
        id: 1,
        type: 'service',
        itemId: 3,
        name: 'Medical Facility Sanitization',
        description: 'Specialized sanitization services for medical facilities with hospital-grade disinfectants.',
        quantity: 20,
        unitPrice: 250,
        discount: 0,
        total: 5000,
        categoryName: 'Specialized Services',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
      },
      {
        id: 2,
        type: 'product',
        itemId: 2,
        name: 'Medical Grade Disinfectant',
        description: 'Hospital-grade disinfectant solution effective against bacteria, viruses, and fungi.',
        quantity: 5,
        unitPrice: 75,
        discount: 0,
        total: 375,
        categoryName: 'Specialized Services',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031e21f?w=400'
      }
    ],
    totals: {
      subtotal: 5375,
      discountAmount: 269,
      finalTotal: 5106,
      totalCost: 3000,
      margin: 41,
      marginValid: true
    },
    status: 'Accepted',
    createdDate: '2025-01-10',
    expiryDate: '2025-02-10',
    version: 1,
    auditLog: [
      {
        action: 'Created',
        user: 'Admin User',
        timestamp: '2025-01-10T10:00:00Z',
        changes: 'Initial creation'
      },
      {
        action: 'Accepted',
        user: 'Client',
        timestamp: '2025-01-16T16:45:00Z',
        changes: 'Digital signature received'
      }
    ]
  },
  {
    id: 2,
    quoteNumber: '#QB-002',
    client: {
      id: 2,
      name: 'Downtown Office Tower',
      company: 'Downtown Properties LLC',
      email: 'facilities@downtown.ae',
      phone: '+971-4-987-6543',
      location: 'Business Bay, Dubai',
      contactPerson: 'Sarah Johnson',
      tier: 'Silver'
    },
    selectedServices: [
      {
        id: 2,
        name: 'Office Cleaning',
        description: 'Professional office cleaning services including desks, floors, restrooms, and common areas.',
        categoryId: 1,
        categoryName: 'Cleaning Services',
        price: 120,
        unit: 'per sq ft',
        quantity: 150,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
      }
    ],
    selectedProducts: [
      {
        id: 1,
        type: 'product',
        itemId: 1,
        name: 'Professional Cleaning Supplies Kit',
        description: 'Complete set of professional cleaning supplies including detergents, microfiber cloths, and protective equipment.',
        quantity: 10,
        unitPrice: 150,
        discount: 0,
        total: 1500,
        categoryName: 'Cleaning Services',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
      }
    ],
    items: [
      {
        id: 3,
        type: 'service',
        itemId: 2,
        name: 'Office Cleaning',
        description: 'Professional office cleaning services including desks, floors, restrooms, and common areas.',
        quantity: 150,
        unitPrice: 120,
        discount: 0,
        total: 18000,
        categoryName: 'Cleaning Services',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
      },
      {
        id: 4,
        type: 'product',
        itemId: 1,
        name: 'Professional Cleaning Supplies Kit',
        description: 'Complete set of professional cleaning supplies including detergents, microfiber cloths, and protective equipment.',
        quantity: 10,
        unitPrice: 150,
        discount: 0,
        total: 1500,
        categoryName: 'Cleaning Services',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
      }
    ],
    totals: {
      subtotal: 19500,
      discountAmount: 1950,
      finalTotal: 17550,
      totalCost: 11700,
      margin: 33,
      marginValid: true
    },
    status: 'Expired',
    createdDate: '2025-01-08',
    expiryDate: '2025-02-08',
    version: 2,
    description: 'Monthly office cleaning service for large commercial facility',
    viewCount: 3,
    auditLog: [
      { action: 'Created', user: 'Sales Executive', timestamp: '2025-01-08 09:00', changes: 'Initial quotation created' },
      { action: 'Sent', user: 'Sales Executive', timestamp: '2025-01-08 10:00', changes: 'Email sent to client' },
      { action: 'Rejected', user: 'System', timestamp: '2025-01-18 14:00', changes: 'Client selected competitor with lower pricing' }
    ]
  },
  {
    id: 3,
    quoteNumber: '#QB-003',
    client: {
      id: 3,
      name: 'Tech Hub Dubai',
      company: 'Tech Hub Dubai LLC',
      email: 'operations@techhub.ae',
      phone: '+971-4-555-0123',
      location: 'Dubai Internet City',
      contactPerson: 'Michael Chen',
      tier: 'Gold'
    },
    selectedServices: [
      {
        id: 2,
        name: 'Office Cleaning',
        description: 'Professional office cleaning services including desks, floors, restrooms, and common areas.',
        categoryId: 1,
        categoryName: 'Cleaning Services',
        price: 120,
        unit: 'per sq ft',
        quantity: 80,
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
      },
      {
        id: 4,
        name: 'HVAC Maintenance',
        description: 'Complete HVAC system maintenance, cleaning, and filter replacement services.',
        categoryId: 2,
        categoryName: 'Facility Maintenance',
        price: 300,
        unit: 'per system',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'
      }
    ],
    selectedProducts: [],
    items: [
      {
        id: 5,
        type: 'service',
        itemId: 2,
        name: 'Office Cleaning',
        description: 'Professional office cleaning services including desks, floors, restrooms, and common areas.',
        quantity: 80,
        unitPrice: 120,
        discount: 0,
        total: 9600,
        categoryName: 'Cleaning Services',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
      },
      {
        id: 6,
        type: 'service',
        itemId: 4,
        name: 'HVAC Maintenance',
        description: 'Complete HVAC system maintenance, cleaning, and filter replacement services.',
        quantity: 2,
        unitPrice: 300,
        discount: 0,
        total: 600,
        categoryName: 'Facility Maintenance',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'
      }
    ],
    totals: {
      subtotal: 10200,
      discountAmount: 0,
      finalTotal: 10200,
      totalCost: 6120,
      margin: 40,
      marginValid: true
    },
    status: 'Sent',
    createdDate: '2025-01-20',
    expiryDate: '2025-02-20',
    version: 1,
    description: 'Combined office cleaning and HVAC maintenance services',
    viewCount: 1,
    auditLog: [
      { action: 'Created', user: 'Sales Executive', timestamp: '2025-01-20 14:00', changes: 'Initial quotation with combined services' },
      { action: 'Sent', user: 'Sales Executive', timestamp: '2025-01-20 15:00', changes: 'Email sent to client' },
      { action: 'Viewed', user: 'Client', timestamp: '2025-01-22 10:30', changes: 'Client viewed quotation' }
    ]
  }
]

// Functions to manage quotations data
export const getQuotations = (): Quotation[] => {
  // Try to load from localStorage first
  const saved = localStorage.getItem('silvermaid_quotations')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading quotations from localStorage:', e)
    }
  }
  return quotationsData
}

export const saveQuotations = (quotations: Quotation[]) => {
  quotationsData = quotations
  localStorage.setItem('silvermaid_quotations', JSON.stringify(quotations))
}

export const addQuotation = (quotation: Quotation) => {
  const quotations = getQuotations()
  const newQuotations = [...quotations, quotation]
  saveQuotations(newQuotations)
  return newQuotations
}

export const updateQuotation = (id: number, updates: Partial<Quotation>) => {
  const quotations = getQuotations()
  const updatedQuotations = quotations.map(q =>
    q.id === id ? { ...q, ...updates } : q
  )
  saveQuotations(updatedQuotations)
  return updatedQuotations
}

export const deleteQuotation = (id: number) => {
  const quotations = getQuotations()
  const filteredQuotations = quotations.filter(q => q.id !== id)
  saveQuotations(filteredQuotations)
  return filteredQuotations
}

export const getQuotationById = (id: number): Quotation | undefined => {
  const quotations = getQuotations()
  return quotations.find(q => q.id === id)
}

// Initialize with default data if localStorage is empty
if (typeof window !== 'undefined' && !localStorage.getItem('silvermaid_quotations')) {
  localStorage.setItem('silvermaid_quotations', JSON.stringify(quotationsData))
}