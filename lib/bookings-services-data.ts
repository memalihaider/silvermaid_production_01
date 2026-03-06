// Services data structure
export interface Service {
  id: string
  name: string
  description: string
  category: 'cleaning' | 'maintenance' | 'inspection' | 'consultation' | 'specialized'
  basePrice: number
  duration: number // in hours
  icon: string
  image?: string
  isActive: boolean
  createdAt: string
}

// Booking data structure
export interface Booking {
  id: string
  bookingNumber: string
  serviceId: string
  serviceName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  bookingDate: string
  bookingTime: string
  duration: number // in hours
  serviceDuration?: string // user-selected duration e.g. "2 Hours"
  frequency?: 'once' | 'weekly' | 'biweekly' | 'monthly'
  numberOfMaids?: number
  estimatedPrice: number
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

// Mock services data
export const MOCK_SERVICES: Service[] = [
  {
    id: 'SVC001',
    name: 'Villa Deep Cleaning',
    description: 'Complete deep cleaning of residential villas including all rooms, carpets, and upholstery',
    category: 'cleaning',
    basePrice: 500,
    duration: 6,
    icon: 'Sparkles',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC002',
    name: 'Commercial Office Cleaning',
    description: 'Professional office cleaning including desks, common areas, restrooms, and waste management',
    category: 'cleaning',
    basePrice: 300,
    duration: 4,
    icon: 'Building2',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC003',
    name: 'Carpet Cleaning & Disinfection',
    description: 'Professional carpet cleaning with advanced steam cleaning and disinfection technology',
    category: 'maintenance',
    basePrice: 200,
    duration: 3,
    icon: 'Wind',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC004',
    name: 'Window & Glass Cleaning',
    description: 'Professional cleaning of windows, glass doors, and mirrors with streak-free finish',
    category: 'maintenance',
    basePrice: 150,
    duration: 2,
    icon: 'Square',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC005',
    name: 'Pest Control & Disinfection',
    description: 'Safe and eco-friendly pest control with complete disinfection service',
    category: 'specialized',
    basePrice: 350,
    duration: 3,
    icon: 'Bug',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC006',
    name: 'Kitchen Deep Clean',
    description: 'Specialized deep cleaning for kitchens including appliances, cabinets, and grease removal',
    category: 'cleaning',
    basePrice: 250,
    duration: 3,
    icon: 'UtensilsCrossed',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC007',
    name: 'Post-Construction Cleaning',
    description: 'Complete cleanup and waste removal after construction or renovation projects',
    category: 'specialized',
    basePrice: 600,
    duration: 8,
    icon: 'Hammer',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC008',
    name: 'Pool & Garden Maintenance',
    description: 'Professional pool cleaning, maintenance, and garden area cleaning service',
    category: 'maintenance',
    basePrice: 280,
    duration: 4,
    icon: 'Droplets',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC009',
    name: 'Health & Safety Inspection',
    description: 'Comprehensive health and safety inspection with detailed compliance report',
    category: 'inspection',
    basePrice: 400,
    duration: 2,
    icon: 'Shield',
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'SVC010',
    name: 'Hygiene Consultation',
    description: 'Expert consultation on cleaning protocols, hygiene standards, and best practices',
    category: 'consultation',
    basePrice: 200,
    duration: 1,
    icon: 'Lightbulb',
    isActive: true,
    createdAt: '2024-01-15'
  }
]

// Mock bookings data
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    bookingNumber: 'BK-2025-001',
    serviceId: 'SVC001',
    serviceName: 'Villa Deep Cleaning',
    clientName: 'Ahmed Al-Mansoori',
    clientEmail: 'ahmed@example.com',
    clientPhone: '+971-50-123-4567',
    clientAddress: 'Palm Jumeirah, Dubai',
    bookingDate: '2025-12-22',
    bookingTime: '09:00',
    duration: 6,
    estimatedPrice: 500,
    status: 'confirmed',
    notes: 'Please bring all necessary equipment. Client will provide parking pass.',
    createdAt: '2025-12-18',
    updatedAt: '2025-12-18'
  },
  {
    id: 'B002',
    bookingNumber: 'BK-2025-002',
    serviceId: 'SVC002',
    serviceName: 'Commercial Office Cleaning',
    clientName: 'Fatima Khan',
    clientEmail: 'fatima@example.com',
    clientPhone: '+971-50-234-5678',
    clientAddress: 'Downtown Dubai, Dubai',
    bookingDate: '2025-12-23',
    bookingTime: '18:00',
    duration: 4,
    estimatedPrice: 300,
    status: 'pending',
    notes: 'Office has 5 floors. Need to schedule after office hours.',
    createdAt: '2025-12-19',
    updatedAt: '2025-12-19'
  },
  {
    id: 'B003',
    bookingNumber: 'BK-2025-003',
    serviceId: 'SVC003',
    serviceName: 'Carpet Cleaning & Disinfection',
    clientName: 'Mohammed Said',
    clientEmail: 'mohammed@example.com',
    clientPhone: '+971-50-345-6789',
    clientAddress: 'JBR, Dubai',
    bookingDate: '2025-12-20',
    bookingTime: '10:00',
    duration: 3,
    estimatedPrice: 200,
    status: 'in-progress',
    createdAt: '2025-12-17',
    updatedAt: '2025-12-20'
  },
  {
    id: 'B004',
    bookingNumber: 'BK-2025-004',
    serviceId: 'SVC005',
    serviceName: 'Pest Control & Disinfection',
    clientName: 'Layla Al-Mazrouei',
    clientEmail: 'layla@example.com',
    clientPhone: '+971-50-456-7890',
    clientAddress: 'Marina, Dubai',
    bookingDate: '2025-12-25',
    bookingTime: '14:00',
    duration: 3,
    estimatedPrice: 350,
    status: 'confirmed',
    createdAt: '2025-12-19',
    updatedAt: '2025-12-19'
  },
  {
    id: 'B005',
    bookingNumber: 'BK-2025-005',
    serviceId: 'SVC001',
    serviceName: 'Villa Deep Cleaning',
    clientName: 'Hassan Al-Hajar',
    clientEmail: 'hassan@example.com',
    clientPhone: '+971-50-567-8901',
    clientAddress: 'Arabian Ranches, Dubai',
    bookingDate: '2025-12-28',
    bookingTime: '08:00',
    duration: 6,
    estimatedPrice: 500,
    status: 'completed',
    createdAt: '2025-12-10',
    updatedAt: '2025-12-28'
  }
]

// Helper functions
export function getServiceById(id: string): Service | undefined {
  return MOCK_SERVICES.find(s => s.id === id)
}

export function getBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find(b => b.id === id)
}

export function getServicesByCategory(category: Service['category']): Service[] {
  return MOCK_SERVICES.filter(s => s.category === category && s.isActive)
}

export function getBookingsByStatus(status: Booking['status']): Booking[] {
  return MOCK_BOOKINGS.filter(b => b.status === status)
}

export function countBookingsByStatus(status: Booking['status']): number {
  return MOCK_BOOKINGS.filter(b => b.status === status).length
}

export function getTotalRevenue(): number {
  return MOCK_BOOKINGS
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.estimatedPrice, 0)
}
