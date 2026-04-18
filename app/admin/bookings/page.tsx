'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search, Calendar, Clock, User, Phone, Mail, MapPin, DollarSign,
  CheckCircle, AlertCircle, XCircle, Eye, Trash2, MessageSquare,
  TrendingUp, Users, X, Edit2, Save, Ban, ThumbsUp, ThumbsDown,
  CalendarDays, ChevronLeft, ChevronRight, RotateCcw, Settings,
  LayoutGrid, Scissors, UserCircle, EyeOff, Sun, Moon, Sunrise,
  Sunset, ArrowUpDown, ChevronDown, Loader2, Wifi, WifiOff,
  SlidersHorizontal, CheckCircle2, Clock3, Filter, Sparkles,
  Building2, Star, MoreVertical, List
} from 'lucide-react'

import { db } from '@/lib/firebase'
import {
  collection, query, deleteDoc, doc, updateDoc, where,
  Timestamp, onSnapshot, getDocs, addDoc
} from 'firebase/firestore'
import { format, addDays, isSameDay, parseISO, startOfDay } from 'date-fns'

interface Booking {
  id: string
  bookingId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  serviceName: string
  serviceId?: string
  bookingDate: string
  bookingTime: string
  bookingNumber: string
  duration: number
  serviceHours?: number
  hourlyRate?: number
  baseAmount?: number
  hoursAmount?: number
  estimatedPrice: number
  status: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected'
  paymentMethod?: string
  paymentStatus?: string
  materialsOption?: string
  schedule?: { date: string; time: string }[]
  notes?: string
  createdAt: string
  updatedAt: string
  createdAtMillis?: number
  propertyType?: string
  frequency?: string
  numberOfMaids?: number
  staffId?: string
  staffName?: string
  assignedStaff?: string
  assignedStaffIds?: string[]
  assignedStaffNames?: string[]
}

interface Service {
  id: string
  name: string
  categoryId: string
  categoryName: string
  price: number
  cost?: number
  duration?: number
  description: string
  status: string
  type: string
  sku?: string
  imageUrl?: string
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: string
  rating: number
}

interface ClientDirectoryItem {
  id: string
  name: string
  email: string
  phone: string
  location: string
}

interface ManualBookingFormData {
  clientId: string
  serviceId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  bookingDate: string
  bookingTime: string
  notes: string
  propertyType: string
  frequency: string
  area: string
  serviceHours: number
  staffId: string
  staffName: string
}

const EXTRA_HOURLY_RATE_AED = 35
const getLocalSystemDate = () => format(new Date(), 'yyyy-MM-dd')
const getLocalSystemTime = () => format(new Date(), 'HH:mm')

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500',   icon: AlertCircle },
  accepted:    { label: 'Accepted',    color: 'bg-teal-100 text-teal-700 border-teal-200',       dot: 'bg-teal-500',    icon: ThumbsUp },
  confirmed:   { label: 'Confirmed',   color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',    icon: CheckCircle2 },
  'in-progress':{ label: 'In Progress', color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500',  icon: Clock3 },
  completed:   { label: 'Completed',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle },
  cancelled:   { label: 'Cancelled',   color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',     icon: XCircle },
  rejected:    { label: 'Rejected',    color: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500',    icon: ThumbsDown },
}

const calendarDotColors: Record<string, string> = {
  pending: 'bg-amber-500', accepted: 'bg-teal-500', confirmed: 'bg-blue-500',
  'in-progress': 'bg-violet-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500', rejected: 'bg-rose-500',
}

const calendarCardColors: Record<string, string> = {
  pending: 'bg-amber-900/90 border-amber-500 text-amber-50',
  accepted: 'bg-teal-900/90 border-teal-500 text-teal-50',
  confirmed: 'bg-blue-900/90 border-blue-500 text-blue-50',
  'in-progress': 'bg-violet-900/90 border-violet-500 text-violet-50',
  completed: 'bg-emerald-900/90 border-emerald-500 text-emerald-50',
  cancelled: 'bg-red-900/90 border-red-500 text-red-50',
  rejected: 'bg-rose-900/90 border-rose-500 text-rose-50',
}

const PAYMENT_STATUS_CONFIG = {
  paid: { label: 'Paid (Stripe)', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'after-work': { label: 'After Work', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
}

const getPaymentStatus = (status?: string, method?: string) => {
  if (status) return status
  if (method === 'card') return 'paid'
  if (method === 'after-work') return 'after-work'
  return 'pending'
}

const getPaymentMethodLabel = (method?: string) => {
  if (method === 'card') return 'Card (Stripe)'
  if (method === 'after-work') return 'After Work (Onsite)'
  return 'Not set'
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function PaymentBadge({ status, method }: { status?: string; method?: string }) {
  const resolved = getPaymentStatus(status, method) as keyof typeof PAYMENT_STATUS_CONFIG
  const cfg = PAYMENT_STATUS_CONFIG[resolved] ?? PAYMENT_STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [clientsDirectory, setClientsDirectory] = useState<ClientDirectoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [editFormData, setEditFormData] = useState<Booking | null>(null)
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [isLive, setIsLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [createFormData, setCreateFormData] = useState<ManualBookingFormData>({
    clientId: '',
    serviceId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    bookingDate: '',
    bookingTime: '',
    notes: '',
    propertyType: 'apartment',
    frequency: 'once',
    area: '',
    serviceHours: 1,
    staffId: '',
    staffName: '',
  })

  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [timeSlotGap, setTimeSlotGap] = useState(30)
  const [visibleHours, setVisibleHours] = useState<number[]>(() => Array.from({ length: 13 }, (_, i) => i + 6))
  const [showSettings, setShowSettings] = useState(false)

  const allHours = Array.from({ length: 24 }, (_, i) => i)
  const formatHour = (h: number) => h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (const hour of [...visibleHours].sort((a, b) => a - b))
      for (let m = 0; m < 60; m += timeSlotGap)
        slots.push(`${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    return slots
  }, [visibleHours, timeSlotGap])

  const getSlotDisplay = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    if (m === 0) return formatHour(h)
    const hd = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${hd}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  }

  const formatFirebaseTimestamp = (ts: any): string => {
    if (!ts) return getLocalSystemDate()
    if (ts.toDate) return format(ts.toDate(), 'yyyy-MM-dd')
    if (ts.seconds) return format(new Date(ts.seconds * 1000), 'yyyy-MM-dd')
    return ts
  }

  const getTimestampMillis = (ts: any): number => {
    if (!ts) return 0
    if (typeof ts === 'number') return ts
    if (typeof ts === 'string') {
      const parsed = new Date(ts).getTime()
      return Number.isNaN(parsed) ? 0 : parsed
    }
    if (ts?.toDate) return ts.toDate().getTime()
    if (typeof ts?.seconds === 'number') return ts.seconds * 1000
    return 0
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length >= 10

  const resetCreateForm = () => {
    setCreateFormData({
      clientId: '',
      serviceId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      bookingDate: '',
      bookingTime: '',
      notes: '',
      propertyType: 'apartment',
      frequency: 'once',
      area: '',
      serviceHours: 1,
      staffId: '',
      staffName: '',
    })
    setCreateErrors({})
  }

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCreateFormData(prev => {
      const next = {
        ...prev,
        [name]: name === 'serviceHours' ? Math.max(1, Number(value) || 1) : value,
      }

      if (name === 'clientId') {
        const byId = clientsDirectory.find(c => c.id.toLowerCase() === value.trim().toLowerCase())
        if (byId) {
          next.clientId = byId.id
          next.clientName = byId.name || next.clientName
          next.clientEmail = byId.email || next.clientEmail
          next.clientPhone = byId.phone || next.clientPhone
          next.clientAddress = byId.location || next.clientAddress
          next.area = byId.location || next.area
        }
      }

      if (name === 'clientName') {
        const byName = clientsDirectory.find(c => c.name.toLowerCase() === value.trim().toLowerCase())
        if (byName) {
          next.clientId = byName.id
          next.clientEmail = byName.email || next.clientEmail
          next.clientPhone = byName.phone || next.clientPhone
          next.clientAddress = byName.location || next.clientAddress
          next.area = byName.location || next.area
        }
      }

      return next
    })
    if (createErrors[name]) {
      setCreateErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateCreateForm = () => {
    const errors: Record<string, string> = {}
    if (!createFormData.serviceId) errors.serviceId = 'Please select a service'
    if (!createFormData.clientName.trim()) errors.clientName = 'Name is required'
    if (!createFormData.clientEmail.trim()) errors.clientEmail = 'Email is required'
    else if (!validateEmail(createFormData.clientEmail)) errors.clientEmail = 'Please enter a valid email'
    if (!createFormData.clientPhone.trim()) errors.clientPhone = 'Phone is required'
    else if (!validatePhone(createFormData.clientPhone)) errors.clientPhone = 'Please enter a valid phone number'
    if (!createFormData.clientAddress.trim()) errors.clientAddress = 'Address is required'
    if (!createFormData.bookingDate) errors.bookingDate = 'Please select a date'
    if (!createFormData.bookingTime) errors.bookingTime = 'Please select a time'
    if (!createFormData.serviceHours || createFormData.serviceHours < 1) errors.serviceHours = 'Please select at least 1 hour'
    return errors
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateCreateForm()
    setCreateErrors(errors)
    if (Object.keys(errors).length > 0) return

    const selectedService = services.find(s => s.id === createFormData.serviceId)
    if (!selectedService) {
      setCreateErrors(prev => ({ ...prev, serviceId: 'Selected service is not available' }))
      return
    }

    const selectedOrRandomStaff = createFormData.staffId
      ? employees.find(emp => emp.id === createFormData.staffId)
      : employees[Math.floor(Math.random() * employees.length)]

    const calculatedTotalAmount = selectedService.price + (createFormData.serviceHours * EXTRA_HOURLY_RATE_AED)

    setCreatingBooking(true)
    try {
      const bookingRef = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
      await addDoc(collection(db, 'bookings'), {
        bookingId: bookingRef,
        clientId: createFormData.clientId || '',
        service: selectedService.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceHours: createFormData.serviceHours,
        name: createFormData.clientName,
        email: createFormData.clientEmail,
        phone: createFormData.clientPhone,
        propertyType: createFormData.propertyType,
        area: createFormData.area,
        frequency: createFormData.frequency,
        date: createFormData.bookingDate,
        time: createFormData.bookingTime,
        message: createFormData.notes,
        clientAddress: createFormData.clientAddress,
        staffId: selectedOrRandomStaff?.id || '',
        staffName: selectedOrRandomStaff?.name || '',
        assignedStaff: selectedOrRandomStaff?.name || '',
        assignedStaffName: selectedOrRandomStaff?.name || '',
        baseAmount: selectedService.price,
        hourlyRate: EXTRA_HOURLY_RATE_AED,
        totalAmount: calculatedTotalAmount,
        serviceDuration: createFormData.serviceHours,
        paymentMethod: 'after-work',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      setShowCreateModal(false)
      resetCreateForm()
    } catch (err) {
      console.error('Failed to create booking:', err)
      alert('Failed to create booking. Please try again.')
    } finally {
      setCreatingBooking(false)
    }
  }

  const getServiceInfo = (name: string, svcs: Service[]) => {
    const s = svcs.find(x => x.name.toLowerCase() === name.toLowerCase())
      ?? svcs.find(x => name.toLowerCase().includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(name.toLowerCase()))
    return s ? { id: s.id, name: s.name, price: s.price, duration: s.duration || 2 }
             : { id: '', name, price: 200, duration: 2 }
  }

  const parseBookingDate = (value: string) => {
    if (!value) return null
    try {
      const isoParsed = parseISO(value)
      if (!Number.isNaN(isoParsed.getTime())) return isoParsed
    } catch {
      // Fall through to native parsing fallback.
    }

    const nativeParsed = new Date(value)
    if (!Number.isNaN(nativeParsed.getTime())) return nativeParsed
    return null
  }

  const normalizeDateValue = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (value?.toDate) return format(value.toDate(), 'yyyy-MM-dd')
    if (typeof value?.seconds === 'number') return format(new Date(value.seconds * 1000), 'yyyy-MM-dd')
    if (value instanceof Date) return format(value, 'yyyy-MM-dd')
    return ''
  }

  const normalizeTimeValue = (value: any): string => {
    if (!value) return ''
    const text = String(value).trim()
    if (/^\d{2}:\d{2}$/.test(text)) return text
    const amPm = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (amPm) {
      let hour = Number(amPm[1])
      const minute = Number(amPm[2])
      const period = amPm[3].toUpperCase()
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
    return text
  }

  const openCreateFromSlot = (slot: string, staff?: Employee) => {
    setCreateErrors({})
    setCreateFormData(prev => ({
      ...prev,
      bookingDate: format(selectedDate, 'yyyy-MM-dd'),
      bookingTime: slot,
      staffId: staff?.id || '',
      staffName: staff?.name || '',
    }))
    setShowCreateModal(true)
  }

  // Fetch services & employees once
  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [sSnap, eSnap, cSnap] = await Promise.all([
          getDocs(query(collection(db, 'services'), where('status', '==', 'ACTIVE'))),
          getDocs(collection(db, 'employees')),
          getDocs(collection(db, 'clients')),
        ])
        const svcs: Service[] = sSnap.docs.map(d => {
          const data = d.data()
          return { id: d.id, name: data.name || '', categoryId: data.categoryId || '', categoryName: data.categoryName || '',
            price: data.price || 0, cost: data.cost || 0,
            duration: data.duration ? Math.ceil(data.duration / 60) : 2,
            description: data.description || '', status: data.status || 'ACTIVE', type: data.type || 'SERVICE',
            sku: data.sku || '', imageUrl: data.imageUrl || '' }
        })
        const emps: Employee[] = eSnap.docs.map(d => {
          const data = d.data()
          return { id: d.id, name: data.name || '', email: data.email || '', phone: data.phone || '',
            role: data.role || 'CLEANER', department: data.department || '', status: data.status || '', rating: data.rating || 0 }
        }).filter(emp => String(emp.status || '').toLowerCase() === 'active')
        const clients: ClientDirectoryItem[] = cSnap.docs.map(d => {
          const data = d.data() as Record<string, any>
          return {
            id: String(data.clientId || data.id || d.id),
            name: String(data.name || ''),
            email: String(data.email || ''),
            phone: String(data.phone || ''),
            location: String(data.location || data.address || ''),
          }
        }).filter(client => Boolean(client.name || client.id))
        setServices(svcs)
        setEmployees(emps)
        setClientsDirectory(clients)
      } catch (e) { console.error(e) }
    }
    fetchStatic()
  }, [])

  // Real-time bookings via onSnapshot
  useEffect(() => {
    const q = query(collection(db, 'bookings'))
    setLoadingBookings(true)
    const unsub = onSnapshot(q, (snap) => {
      const data: Booking[] = snap.docs.map(d => {
        const r = d.data()
        const svc = getServiceInfo(r.service || r.serviceName || '', services)
        const paymentMethod = r.paymentMethod || r.payment_method || ''
        const paymentStatus = r.paymentStatus || r.payment_status || ''
        const schedule = Array.isArray(r.schedule)
          ? r.schedule
          : Array.isArray(r.selectedSchedule)
            ? r.selectedSchedule
            : []
        const normalizedSchedule = schedule
          .map((slot: any) => ({
            date: normalizeDateValue(slot?.date),
            time: normalizeTimeValue(slot?.time),
          }))
          .filter((slot: { date: string; time: string }) => Boolean(slot.date && slot.time))
        const normalizedDate = normalizeDateValue(r.date || r.bookingDate || normalizedSchedule[0]?.date)
        const normalizedTime = normalizeTimeValue(r.time || r.bookingTime || normalizedSchedule[0]?.time)
        const assignedStaffIds = Array.isArray(r.assignedStaffIds)
          ? r.assignedStaffIds.map((id: any) => String(id))
          : []
        const assignedStaffNames = Array.isArray(r.assignedStaffNames)
          ? r.assignedStaffNames.map((name: any) => String(name))
          : []
        const normalizedStaffName =
          r.staffName ||
          r.assignedStaffName ||
          assignedStaffNames[0] ||
          r.assignedStaff ||
          ''
        const duration = Number(r.serviceHours || r.serviceDuration || r.duration || svc.duration || 2)
        const hourlyRate = Number(r.hourlyRate || EXTRA_HOURLY_RATE_AED)
        const baseAmount = Number(r.baseAmount || 0)
        const hoursAmount = Number(r.hoursAmount || (duration * hourlyRate))
        const estimatedPrice = Number(r.totalAmount ?? r.estimatedPrice ?? svc.price ?? 0)
        return {
          id: d.id,
          bookingId: r.bookingId || `BK${d.id.slice(-6).toUpperCase()}`,
          clientName: r.name || r.clientName || 'N/A',
          clientEmail: r.email || r.clientEmail || 'N/A',
          clientPhone: r.phone || r.clientPhone || 'N/A',
          clientAddress: r.area || r.clientAddress || 'N/A',
          serviceName: svc.name,
          serviceId: r.serviceId || svc.id,
          bookingDate: normalizedDate || getLocalSystemDate(),
          bookingTime: normalizedTime || getLocalSystemTime(),
          bookingNumber: r.bookingId || `BK${d.id.slice(-6).toUpperCase()}`,
          duration,
          serviceHours: duration,
          hourlyRate,
          baseAmount,
          hoursAmount,
          estimatedPrice,
          status: (r.status || 'pending') as Booking['status'],
          paymentMethod,
          paymentStatus,
          materialsOption: r.materialsOption || r.materialOption || '',
          schedule: normalizedSchedule,
          notes: r.message || r.notes || '',
          propertyType: r.propertyType || '',
          frequency: r.frequency || 'once',
          numberOfMaids: Number(r.numberOfMaids || 1),
          staffId: r.staffId || assignedStaffIds[0] || '',
          staffName: normalizedStaffName,
          assignedStaff: r.assignedStaff || normalizedStaffName,
          assignedStaffIds,
          assignedStaffNames,
          createdAt: formatFirebaseTimestamp(r.createdAt),
          updatedAt: formatFirebaseTimestamp(r.updatedAt),
          createdAtMillis: getTimestampMillis(r.createdAt),
        }
      })
      data.sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0))
      setBookings(data)
      setLastUpdate(new Date())
      setIsLive(true)
      setLoadingBookings(false)
    }, (err) => {
      console.error('onSnapshot error:', err)
      setIsLive(false)
      setLoadingBookings(false)
    })
    return () => unsub()
  }, [services]) // re-subscribes if services load (for name mapping)

  // Ensure every booking has an assigned staff member so calendar slots can render consistently.
  useEffect(() => {
    if (employees.length === 0 || bookings.length === 0) return

    const unassigned = bookings.filter(b => !b.staffId && !b.staffName && !b.assignedStaff)
    if (unassigned.length === 0) return

    let cancelled = false

    const assignMissingStaff = async () => {
      for (const booking of unassigned) {
        if (cancelled) return
        const randomEmployee = employees[Math.floor(Math.random() * employees.length)]
        if (!randomEmployee) return

        try {
          await updateDoc(doc(db, 'bookings', booking.id), {
            staffId: randomEmployee.id,
            staffName: randomEmployee.name,
            assignedStaff: randomEmployee.name,
            assignedStaffName: randomEmployee.name,
            updatedAt: Timestamp.now(),
          })
        } catch (err) {
          console.error('Failed to auto-assign staff for booking:', booking.id, err)
        }
      }
    }

    assignMissingStaff()

    return () => {
      cancelled = true
    }
  }, [bookings, employees])

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.estimatedPrice, 0),
  }), [bookings])

  const filteredAndSortedBookings = useMemo(() => {
    let list = bookings.filter(b => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q || b.clientName.toLowerCase().includes(q) || b.serviceName.toLowerCase().includes(q)
        || b.bookingNumber.toLowerCase().includes(q) || b.clientEmail.toLowerCase().includes(q)
        || (b.staffName || '').toLowerCase().includes(q)
      const matchStatus = selectedStatus === 'all' || b.status === selectedStatus
      return matchSearch && matchStatus
    })
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const aTime = a.createdAtMillis || new Date(a.bookingDate).getTime()
        const bTime = b.createdAtMillis || new Date(b.bookingDate).getTime()
        return bTime - aTime
      }
      if (sortBy === 'date-asc') {
        const aTime = a.createdAtMillis || new Date(a.bookingDate).getTime()
        const bTime = b.createdAtMillis || new Date(b.bookingDate).getTime()
        return aTime - bTime
      }
      if (sortBy === 'price-desc') return b.estimatedPrice - a.estimatedPrice
      if (sortBy === 'price-asc') return a.estimatedPrice - b.estimatedPrice
      if (sortBy === 'name-asc') return a.clientName.localeCompare(b.clientName)
      if (sortBy === 'name-desc') return b.clientName.localeCompare(a.clientName)
      return 0
    })
    return list
  }, [bookings, searchTerm, selectedStatus, sortBy])

  // Calendar helpers
  const filteredAppointments = useMemo(() =>
    bookings.filter(b => {
      const parsed = parseBookingDate(b.bookingDate)
      if (!parsed) return false
      const isCalendarVisibleStatus = b.status === 'confirmed' || b.status === 'in-progress' || b.status === 'completed'
      return isSameDay(parsed, selectedDate) && isCalendarVisibleStatus
    }),
    [bookings, selectedDate]
  )

  const upcomingBookings = useMemo(() => {
    const today = startOfDay(new Date())
    return bookings
      .filter(b => {
        const parsed = parseBookingDate(b.bookingDate)
        if (!parsed) return false
        return parsed >= today && b.status !== 'cancelled' && b.status !== 'rejected'
      })
      .sort((a, b) => {
        const aTime = parseBookingDate(a.bookingDate)?.getTime() || 0
        const bTime = parseBookingDate(b.bookingDate)?.getTime() || 0
        if (aTime !== bTime) return aTime - bTime
        return (a.bookingTime || '').localeCompare(b.bookingTime || '')
      })
  }, [bookings])

  const filteredStaff = useMemo(() =>
    selectedEmployee === 'all' ? employees : employees.filter(e => e.name === selectedEmployee),
    [employees, selectedEmployee]
  )

  const convertTo24 = (t: string) => {
    if (!t) return getLocalSystemTime()
    if (t.includes(':') && !t.includes(' ')) return t
    const [time, period] = t.split(' ')
    if (!period) return t
    const [h, m] = time.split(':')
    let hr = parseInt(h)
    if (period === 'PM' && hr !== 12) hr += 12
    else if (period === 'AM' && hr === 12) hr = 0
    return `${hr.toString().padStart(2, '0')}:${m || '00'}`
  }

  const doesCoverSlot = (b: Booking, slot: string) => {
    const [sh, sm] = slot.split(':').map(Number)
    const [ah, am] = convertTo24(b.bookingTime).split(':').map(Number)
    const slotStart = sh * 60 + sm, slotEnd = slotStart + timeSlotGap
    const aptStart = ah * 60 + am, aptEnd = aptStart + b.duration * 60
    return aptStart < slotEnd && aptEnd > slotStart
  }
  const isAptStart = (b: Booking, slot: string) => {
    const [sh, sm] = slot.split(':').map(Number)
    const [ah, am] = convertTo24(b.bookingTime).split(':').map(Number)
    const aptStart = ah * 60 + am
    return aptStart >= sh * 60 + sm && aptStart < sh * 60 + sm + timeSlotGap
  }
  const getSpan = (b: Booking, slot: string) => {
    const [ah, am] = convertTo24(b.bookingTime).split(':').map(Number)
    const aptEnd = ah * 60 + am + b.duration * 60
    let span = 0
    for (const s of timeSlots) {
      const [h, m] = s.split(':').map(Number)
      if (h * 60 + m < aptEnd) span++; else break
    }
    return Math.max(1, span)
  }
  const getEmpsForDate = (emp: Employee) =>
    filteredAppointments.filter((a) => {
      const assignedNames = [
        a.staffName,
        a.assignedStaff,
        ...(a.assignedStaffNames || []),
      ]
        .flatMap((name) => String(name || '').split(','))
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean)

      const assignedIds = [a.staffId, ...(a.assignedStaffIds || [])]
        .map((id) => String(id || '').trim())
        .filter(Boolean)

      return assignedIds.includes(emp.id) || assignedNames.includes(emp.name.trim().toLowerCase())
    })

  const upsertClientFromBooking = async (booking: Booking) => {
    const email = booking.clientEmail?.trim()
    if (!email) return

    const clientsQuery = query(collection(db, 'clients'), where('email', '==', email))
    const snapshot = await getDocs(clientsQuery)

    if (snapshot.empty) {
      await addDoc(collection(db, 'clients'), {
        name: booking.clientName || 'Client',
        company: '',
        email,
        phone: booking.clientPhone || '',
        location: booking.clientAddress || '',
        joinDate: getLocalSystemDate(),
        totalSpent: Number(booking.estimatedPrice || 0),
        projects: 1,
        lastService: booking.serviceName || 'Service Booking',
        status: 'Active',
        tier: 'Bronze',
        notes: `Auto-created from booking ${booking.bookingNumber || booking.bookingId}`,
        contracts: [],
        lastConfirmedBookingId: booking.bookingId || booking.bookingNumber || booking.id,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      return
    }

    const clientDoc = snapshot.docs[0]
    const clientData = clientDoc.data() as Record<string, any>
    const bookingRef = booking.bookingId || booking.bookingNumber || booking.id
    const alreadyCounted = clientData.lastConfirmedBookingId === bookingRef

    await updateDoc(doc(db, 'clients', clientDoc.id), {
      name: booking.clientName || clientData.name || 'Client',
      phone: booking.clientPhone || clientData.phone || '',
      location: booking.clientAddress || clientData.location || '',
      lastService: booking.serviceName || clientData.lastService || 'Service Booking',
      status: 'Active',
      totalSpent: alreadyCounted
        ? Number(clientData.totalSpent || 0)
        : Number(clientData.totalSpent || 0) + Number(booking.estimatedPrice || 0),
      projects: alreadyCounted
        ? Number(clientData.projects || 0)
        : Number(clientData.projects || 0) + 1,
      lastConfirmedBookingId: bookingRef,
      updatedAt: new Date().toISOString(),
    })
  }

  // Actions
  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      const booking = bookings.find(b => b.id === id)
      if (!booking) {
        await updateDoc(doc(db, 'bookings', id), { status, updatedAt: Timestamp.now() })
        if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status } : null)
        return
      }

      let assignedEmployee = employees.find(emp => emp.id === booking.staffId)
      if (!assignedEmployee && booking.staffName) {
        assignedEmployee = employees.find(emp => emp.name === booking.staffName)
      }
      if (!assignedEmployee && booking.assignedStaff) {
        assignedEmployee = employees.find(emp => emp.name === booking.assignedStaff)
      }

      if (!assignedEmployee && status === 'confirmed' && employees.length > 0) {
        assignedEmployee = employees[Math.floor(Math.random() * employees.length)]
      }

      const normalizedSchedule = Array.isArray(booking.schedule) && booking.schedule.length > 0
        ? booking.schedule
        : [{ date: booking.bookingDate, time: booking.bookingTime }]

      const updatePayload: Record<string, any> = {
        status,
        updatedAt: Timestamp.now(),
      }

      if (status === 'confirmed') {
        updatePayload.schedule = normalizedSchedule
        updatePayload.date = booking.bookingDate
        updatePayload.time = booking.bookingTime
        if (assignedEmployee) {
          updatePayload.staffId = assignedEmployee.id
          updatePayload.staffName = assignedEmployee.name
          updatePayload.assignedStaff = assignedEmployee.name
          updatePayload.assignedStaffName = assignedEmployee.name
        }
      }

      await updateDoc(doc(db, 'bookings', id), updatePayload)

      if (status === 'confirmed') {
        await upsertClientFromBooking({
          ...booking,
          status,
          schedule: normalizedSchedule,
          staffId: assignedEmployee?.id || booking.staffId,
          staffName: assignedEmployee?.name || booking.staffName,
          assignedStaff: assignedEmployee?.name || booking.assignedStaff,
        })
      }

      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => prev ? {
          ...prev,
          status,
          staffId: assignedEmployee?.id || prev.staffId,
          staffName: assignedEmployee?.name || prev.staffName,
          assignedStaff: assignedEmployee?.name || prev.assignedStaff,
          schedule: normalizedSchedule,
        } : null)
      }

      setEditFormData(prev => prev && prev.id === id ? {
        ...prev,
        status,
        staffId: assignedEmployee?.id || prev.staffId,
        staffName: assignedEmployee?.name || prev.staffName,
        assignedStaff: assignedEmployee?.name || prev.assignedStaff,
        schedule: normalizedSchedule,
      } : prev)
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking permanently?')) return
    try {
      await deleteDoc(doc(db, 'bookings', id))
      setShowDetailsModal(false)
      setSelectedBooking(null)
    } catch (e) { console.error(e) }
  }

  const handleViewDetails = (b: Booking) => {
    setSelectedBooking(b)
    setEditFormData({ ...b })
    setShowDetailsModal(true)
    setIsEditingDetails(false)
  }

  const handleSaveEdits = async () => {
    if (!editFormData) return
    setSavingEdit(true)
    try {
      await updateDoc(doc(db, 'bookings', editFormData.id), {
        name: editFormData.clientName, email: editFormData.clientEmail, phone: editFormData.clientPhone,
        area: editFormData.clientAddress, service: editFormData.serviceName, date: editFormData.bookingDate,
        time: editFormData.bookingTime, status: editFormData.status, message: editFormData.notes || '',
        staffName: editFormData.staffName || '', assignedStaff: editFormData.assignedStaff || '',
        updatedAt: Timestamp.now()
      })
      setSelectedBooking(editFormData)
      setIsEditingDetails(false)
    } catch (e) { console.error(e); alert('Update failed!') }
    finally { setSavingEdit(false) }
  }

  const INPUT_CLS = 'w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all'
  const LABEL_CLS = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'

  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto space-y-6 ${showCalendar ? 'w-full max-w-none p-3 sm:p-4 lg:p-6' : 'max-w-350 p-6'}`}>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black tracking-tight">Bookings</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                {isLive ? 'Live' : 'Connecting...'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lastUpdate ? `Updated ${format(lastUpdate, 'HH:mm:ss')} · ` : ''}{bookings.length} total bookings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCreateErrors({})
                setCreateFormData(prev => ({
                  ...prev,
                  bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                }))
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              <Calendar className="h-4 w-4" />
              Create Manual Booking
            </button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                showCalendar ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-500/20' : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              {showCalendar ? <List className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
              {showCalendar ? 'List View' : 'Calendar View'}
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {!showCalendar && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/60', icon: Users },
              { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50', icon: AlertCircle },
              { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle2 },
              { label: 'In Progress', value: stats.inProgress, color: 'text-violet-700', bg: 'bg-violet-50', icon: Clock3 },
              { label: 'Completed', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
              { label: 'Revenue', value: `AED ${stats.revenue.toLocaleString()}`, color: 'text-rose-700', bg: 'bg-rose-50', icon: DollarSign },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-border flex items-center gap-3`}>
                <Icon className={`h-5 w-5 ${color} shrink-0`} />
                <div className="min-w-0">
                  <p className={`text-lg font-black leading-tight ${color} truncate`}>{value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Calendar View ── */}
        {showCalendar ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Calendar toolbar */}
            <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Staff Booking Calendar</h2>
                  <p className="text-xs text-muted-foreground">
                    {filteredAppointments.length} bookings on {format(selectedDate, 'MMMM dd, yyyy')} · {upcomingBookings.length} upcoming
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                  className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none min-w-40">
                  <option value="all">All Staff ({employees.length})</option>
                  {employees.map(e => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
                </select>
                <select value={timeSlotGap.toString()} onChange={e => setTimeSlotGap(parseInt(e.target.value))}
                  className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hr</option>
                  <option value="120">2 hr</option>
                </select>
                <button onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl border transition-colors ${showSettings ? 'bg-violet-600 text-white border-violet-600' : 'bg-card border-border hover:bg-muted'}`}>
                  <Settings className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-xl p-1">
                  <button onClick={() => setSelectedDate(d => addDays(d, -1))} className="p-1.5 hover:bg-background rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="font-semibold text-sm min-w-27.5 text-center">{format(selectedDate, 'MMM dd, yyyy')}</span>
                  <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-1.5 hover:bg-background rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Hour settings panel */}
            {showSettings && (
              <div className="p-4 border-b border-border bg-muted/30 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[['All 24h', () => setVisibleHours([...allHours]), 'bg-blue-600'],
                    ['Business', () => setVisibleHours(Array.from({length:17},(_,i)=>i+6)), 'bg-emerald-600'],
                    ['Morning', () => setVisibleHours(Array.from({length:7},(_,i)=>i+6)), 'bg-amber-600'],
                    ['Afternoon', () => setVisibleHours(Array.from({length:7},(_,i)=>i+12)), 'bg-orange-600'],
                    ['Evening', () => setVisibleHours(Array.from({length:6},(_,i)=>i+18)), 'bg-violet-600'],
                    ['Night', () => setVisibleHours(Array.from({length:6},(_,i)=>i)), 'bg-indigo-600'],
                  ].map(([label, fn, cls]) => (
                    <button key={label as string} onClick={fn as () => void}
                      className={`px-3 py-1.5 ${cls} text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity`}>
                      {label as string}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                  {allHours.map(h => (
                    <button key={h} onClick={() => setVisibleHours(prev =>
                      prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort((a,b)=>a-b))}
                      className={`py-1.5 text-[11px] rounded-lg font-medium transition-colors ${
                        visibleHours.includes(h) ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground line-through'
                      }`}>
                      {formatHour(h)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar grid */}
            {timeSlots.length > 0 && filteredStaff.length > 0 ? (
              <div className="overflow-auto max-h-[calc(100vh-260px)] md:max-h-[calc(100vh-230px)]">
                <table className="min-w-max border-collapse w-full">
                  <thead className="sticky top-0 z-30 bg-muted">
                    <tr>
                      <th className="p-3 text-xs font-bold border-r border-b border-border text-left min-w-28 sticky left-0 bg-muted z-40">
                        Time
                      </th>
                      {filteredStaff.map((emp) => (
                        <th key={emp.id} className="p-2 border-r border-b border-border last:border-r-0 min-w-44 text-left bg-muted">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xs shrink-0">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground truncate max-w-32">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-32">{emp.role}</p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((slot, slotIndex) => {
                      return (
                        <tr key={`${slot}-${slotIndex}`} className="group">
                          <td className="sticky left-0 z-20 bg-card border-r border-b border-border p-2.5 group-hover:bg-muted/30 transition-colors">
                            <p className="text-xs font-semibold text-foreground">{getSlotDisplay(slot)}</p>
                          </td>
                          {filteredStaff.map((emp) => {
                            const empsApts = getEmpsForDate(emp)
                            const covering = empsApts.filter(a => doesCoverSlot(a, slot))
                            const starter = covering.find(a => isAptStart(a, slot))
                            if (starter) {
                              const cardColor = calendarCardColors[starter.status] ?? 'bg-slate-900/90 border-slate-500 text-slate-50'
                              return (
                                <td key={`${slot}-${emp.id}`}
                                  className="p-1.5 border-b border-border cursor-pointer"
                                  onClick={() => handleViewDetails(starter)}>
                                  <div className={`h-full p-2 rounded-xl border-l-4 ${cardColor} transition-all hover:brightness-110`}>
                                    <p className="font-bold text-xs truncate">{starter.clientName}</p>
                                    <p className="text-[10px] text-white/85 truncate">{starter.serviceName}</p>
                                    <p className="text-[10px] text-white/75 mt-0.5">{starter.bookingTime} · {starter.duration}h</p>
                                  </div>
                                </td>
                              )
                            }
                            if (covering.length > 0) {
                              return (
                                <td
                                  key={`${slot}-${emp.id}`}
                                  className="border-r border-b border-border/50 bg-slate-200/40 dark:bg-slate-700/40 cursor-pointer"
                                  onClick={() => handleViewDetails(covering[0])}
                                  title={`${emp.name} is occupied at ${getSlotDisplay(slot)}`}
                                />
                              )
                            }
                            return (
                              <td
                                key={`${slot}-${emp.id}`}
                                className="border-r border-b border-border/50 bg-muted/5 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                onClick={() => openCreateFromSlot(slot, emp)}
                                title={`Create booking for ${emp.name} at ${getSlotDisplay(slot)}`}
                              />
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">{timeSlots.length === 0 ? 'No hours selected' : 'No staff found'}</p>
                <p className="text-sm mt-1">{timeSlots.length === 0 ? 'Select hours in settings' : 'Adjust the staff filter above'}</p>
              </div>
            )}

            {/* Legend */}
            <div className="p-4 border-t border-border flex flex-wrap gap-4">
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${calendarDotColors[k]}`} />
                  {v.label}
                </div>
              ))}
            </div>

            {/* Upcoming bookings */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming Bookings</h3>
                <span className="text-xs text-muted-foreground">{upcomingBookings.length} total</span>
              </div>
              {upcomingBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground">No upcoming bookings yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {upcomingBookings.slice(0, 10).map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => handleViewDetails(booking)}
                      className="w-full text-left p-2 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <p className="text-xs font-semibold text-foreground truncate">{booking.clientName} · {booking.serviceName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {booking.bookingDate} {booking.bookingTime} · {booking.staffName || booking.assignedStaff || 'Unassigned'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── List View ── */
          <>
            {/* Filters bar */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Search client, service, booking #, staff..."
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-40">
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                </select>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(['all', 'pending', 'accepted', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'] as const).map(s => {
                  const count = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length
                  const active = selectedStatus === s
                  const cfg = s !== 'all' ? STATUS_CONFIG[s] : null
                  return (
                    <button key={s} onClick={() => setSelectedStatus(s)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? (cfg ? cfg.color : 'bg-foreground text-background border-foreground')
                          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                      }`}>
                      {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                      {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                      <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/30' : 'bg-muted'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Booking Cards */}
            {loadingBookings ? (
              <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-medium">Loading bookings...</span>
              </div>
            ) : filteredAndSortedBookings.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl py-20 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="font-semibold text-muted-foreground">No bookings found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedBookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending
                  const StatusIcon = cfg.icon
                  return (
                    <div key={b.id}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-border/80 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleViewDetails(b)}
                    >
                      {/* Top row: booking# + status badge + actions */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                            {b.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">{b.clientName}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.bookingNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={b.status} />
                          {/* Quick status change */}
                          <select
                            value={b.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); handleStatusChange(b.id, e.target.value as Booking['status']) }}
                            className="text-xs border border-border bg-muted/50 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 text-foreground"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Service */}
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Service</p>
                          <p className="text-sm font-semibold text-foreground leading-snug">{b.serviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.serviceHours || b.duration}h session · {(b.frequency || 'once').replace('-', ' ')}
                          </p>
                        </div>

                        {/* Date & Time */}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Date & Time</p>
                          <div className="flex items-center gap-1.5 text-sm font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {b.bookingDate}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3 shrink-0" />
                            {b.bookingTime}
                          </div>
                        </div>

                        {/* Price */}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                          <p className="text-sm font-black text-emerald-600">AED {b.estimatedPrice.toLocaleString()}</p>
                          <div className="mt-1">
                            <PaymentBadge status={b.paymentStatus} method={b.paymentMethod} />
                          </div>
                          {b.clientAddress && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-30">{b.clientAddress}</p>
                          )}
                        </div>

                        {/* Staff */}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Staff</p>
                          {b.staffName ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                {b.staffName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-violet-700 dark:text-violet-400 truncate">{b.staffName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                          {b.clientPhone && (
                            <p className="text-xs text-muted-foreground mt-0.5">{b.clientPhone}</p>
                          )}
                        </div>
                      </div>

                      {/* Notes strip */}
                      {b.notes && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-semibold text-foreground mr-1">Note:</span>{b.notes}
                          </p>
                        </div>
                      )}

                      {/* Footer: contact + action buttons */}
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />{b.clientEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleViewDetails(b)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors">
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button onClick={() => handleDelete(b.id)}
                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Footer count */}
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Create Booking Modal ── */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowCreateModal(false)
              resetCreateForm()
            }}
          >
            <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="font-black text-base">Create Manual Booking</h2>
                  <p className="text-xs text-muted-foreground mt-1">Use the same options available in the public booking form.</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="overflow-y-auto flex-1 p-6 space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Service</h3>
                  <select
                    name="serviceId"
                    value={createFormData.serviceId}
                    onChange={handleCreateInputChange}
                    className={INPUT_CLS}
                  >
                    <option value="">Select a service...</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - AED {service.price}
                      </option>
                    ))}
                  </select>
                  {createErrors.serviceId && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.serviceId}</p>}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_CLS}>Client ID</label>
                      <input
                        name="clientId"
                        value={createFormData.clientId}
                        onChange={handleCreateInputChange}
                        className={INPUT_CLS}
                        list="manual-booking-client-id-list"
                        placeholder="Select existing ID or type new"
                      />
                      <datalist id="manual-booking-client-id-list">
                        {clientsDirectory.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Full Name</label>
                      <input
                        name="clientName"
                        value={createFormData.clientName}
                        onChange={handleCreateInputChange}
                        className={INPUT_CLS}
                        list="manual-booking-client-name-list"
                        placeholder="Search existing client or type new"
                      />
                      <datalist id="manual-booking-client-name-list">
                        {clientsDirectory.map(client => (
                          <option key={`${client.id}-${client.name}`} value={client.name}>{client.id}</option>
                        ))}
                      </datalist>
                      {createErrors.clientName && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.clientName}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Phone</label>
                      <input name="clientPhone" value={createFormData.clientPhone} onChange={handleCreateInputChange} className={INPUT_CLS} />
                      {createErrors.clientPhone && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.clientPhone}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Email</label>
                      <input name="clientEmail" type="email" value={createFormData.clientEmail} onChange={handleCreateInputChange} className={INPUT_CLS} />
                      {createErrors.clientEmail && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.clientEmail}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Property Type</label>
                      <select name="propertyType" value={createFormData.propertyType} onChange={handleCreateInputChange} className={INPUT_CLS}>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="office">Office</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={LABEL_CLS}>Service Address</label>
                      <input name="clientAddress" value={createFormData.clientAddress} onChange={handleCreateInputChange} className={INPUT_CLS} />
                      {createErrors.clientAddress && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.clientAddress}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Frequency</label>
                      <select name="frequency" value={createFormData.frequency} onChange={handleCreateInputChange} className={INPUT_CLS}>
                        <option value="once">One-Time</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_CLS}>General Area / Location</label>
                      <input name="area" value={createFormData.area} onChange={handleCreateInputChange} className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Assign Staff (Optional)</label>
                      <select
                        name="staffId"
                        value={createFormData.staffId}
                        onChange={(e) => {
                          const selectedId = e.target.value
                          const selectedEmployee = employees.find(emp => emp.id === selectedId)
                          setCreateFormData(prev => ({
                            ...prev,
                            staffId: selectedId,
                            staffName: selectedEmployee?.name || '',
                          }))
                        }}
                        className={INPUT_CLS}
                      >
                        <option value="">Auto assign random staff</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_CLS}>Date</label>
                      <input name="bookingDate" type="date" value={createFormData.bookingDate} onChange={handleCreateInputChange} className={INPUT_CLS} />
                      {createErrors.bookingDate && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.bookingDate}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Preferred Time</label>
                      <select name="bookingTime" value={createFormData.bookingTime} onChange={handleCreateInputChange} className={INPUT_CLS}>
                        <option value="">Select a time...</option>
                        <option value="08:00">08:00 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                      </select>
                      {createErrors.bookingTime && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.bookingTime}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Service Hours</label>
                      <select name="serviceHours" value={createFormData.serviceHours} onChange={handleCreateInputChange} className={INPUT_CLS}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                        ))}
                      </select>
                      {createErrors.serviceHours && <p className="text-red-600 text-xs font-semibold mt-1">{createErrors.serviceHours}</p>}
                      <p className="text-xs text-muted-foreground mt-1">AED {EXTRA_HOURLY_RATE_AED} added per selected hour</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLS}>Special Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={createFormData.notes}
                    onChange={handleCreateInputChange}
                    rows={4}
                    className={`${INPUT_CLS} resize-none`}
                    placeholder="Any specific instructions or priorities for the team?"
                  />
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm">
                  <p className="font-semibold text-muted-foreground">Estimated Price</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">
                    AED {((services.find(s => s.id === createFormData.serviceId)?.price || 0) + (createFormData.serviceHours * EXTRA_HOURLY_RATE_AED)).toLocaleString()}
                  </p>
                </div>
              </form>

              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                  className="px-4 py-2 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={creatingBooking}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {creatingBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {creatingBooking ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Details Modal ── */}
        {showDetailsModal && selectedBooking && editFormData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black">
                    {editFormData.clientName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-black text-base">{editFormData.clientName}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{editFormData.bookingNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={editFormData.status} />
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5">

                {/* Service */}
                <div className="bg-linear-to-r from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Service</p>
                  <p className="font-black text-lg">{editFormData.serviceName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {editFormData.serviceHours || editFormData.duration}h</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> AED {editFormData.estimatedPrice.toLocaleString()}</span>
                    {editFormData.frequency && <span className="capitalize">{editFormData.frequency.replace('-', ' ')}</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-muted-foreground">
                    <div className="bg-white/70 dark:bg-background/40 rounded-lg px-2 py-1.5">
                      <p className="font-semibold">Hours</p>
                      <p>{editFormData.serviceHours || editFormData.duration}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-background/40 rounded-lg px-2 py-1.5">
                      <p className="font-semibold">Hourly Rate</p>
                      <p>AED {Number(editFormData.hourlyRate || EXTRA_HOURLY_RATE_AED).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-background/40 rounded-lg px-2 py-1.5">
                      <p className="font-semibold">Frequency</p>
                      <p className="capitalize">{(editFormData.frequency || 'once').replace('-', ' ')}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-background/40 rounded-lg px-2 py-1.5">
                      <p className="font-semibold">Professionals</p>
                      <p>{editFormData.numberOfMaids || 1}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-muted-foreground">
                    <PaymentBadge status={editFormData.paymentStatus} method={editFormData.paymentMethod} />
                    <span>{getPaymentMethodLabel(editFormData.paymentMethod)}</span>
                    {editFormData.materialsOption && (
                      <span className="capitalize">
                        {editFormData.materialsOption === 'with-materials' ? 'With materials' : 'Without materials'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned staff */}
                {(editFormData.staffName || editFormData.assignedStaff) && !isEditingDetails && (
                  <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black">
                      {(editFormData.staffName || editFormData.assignedStaff || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Assigned Staff</p>
                      <p className="font-bold text-sm">{editFormData.staffName || editFormData.assignedStaff}</p>
                    </div>
                  </div>
                )}

                {/* Client info */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Client Information
                  </h3>
                  {isEditingDetails ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className={LABEL_CLS}>Full Name</label>
                        <input type="text" value={editFormData.clientName} onChange={e => setEditFormData({...editFormData, clientName: e.target.value})} className={INPUT_CLS} /></div>
                      <div><label className={LABEL_CLS}>Email</label>
                        <input type="email" value={editFormData.clientEmail} onChange={e => setEditFormData({...editFormData, clientEmail: e.target.value})} className={INPUT_CLS} /></div>
                      <div><label className={LABEL_CLS}>Phone</label>
                        <input type="tel" value={editFormData.clientPhone} onChange={e => setEditFormData({...editFormData, clientPhone: e.target.value})} className={INPUT_CLS} /></div>
                      <div className="col-span-2"><label className={LABEL_CLS}>Address</label>
                        <input type="text" value={editFormData.clientAddress} onChange={e => setEditFormData({...editFormData, clientAddress: e.target.value})} className={INPUT_CLS} /></div>
                      <div className="col-span-2"><label className={LABEL_CLS}>Assigned Staff</label>
                        <select value={editFormData.staffName || ''} onChange={e => setEditFormData({...editFormData, staffName: e.target.value, assignedStaff: e.target.value})} className={INPUT_CLS}>
                          <option value="">Unassigned</option>
                          {employees.map(e => <option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: User, label: 'Name', val: editFormData.clientName },
                        { icon: Phone, label: 'Phone', val: editFormData.clientPhone },
                        { icon: Mail, label: 'Email', val: editFormData.clientEmail },
                        { icon: MapPin, label: 'Address', val: editFormData.clientAddress },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-muted/40 rounded-lg p-3">
                          <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                            <Icon className="h-3 w-3" />{label}
                          </p>
                          <p className="text-sm font-medium truncate">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Schedule
                  </h3>
                  {isEditingDetails ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={LABEL_CLS}>Date</label>
                        <input type="date" value={editFormData.bookingDate} onChange={e => setEditFormData({...editFormData, bookingDate: e.target.value})} className={INPUT_CLS} /></div>
                      <div><label className={LABEL_CLS}>Time</label>
                        <input type="time" value={editFormData.bookingTime} onChange={e => setEditFormData({...editFormData, bookingTime: e.target.value})} className={INPUT_CLS} /></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Date</p>
                        <p className="text-sm font-bold">{editFormData.bookingDate}</p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Time</p>
                        <p className="text-sm font-bold">{editFormData.bookingTime}</p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 text-center">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-1">Duration</p>
                        <p className="text-sm font-bold">{editFormData.serviceHours || editFormData.duration}h</p>
                      </div>
                      {!isEditingDetails && editFormData.schedule && editFormData.schedule.length > 1 && (
                        <div className="bg-muted/40 rounded-lg p-3 col-span-3">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-2">Additional Days</p>
                          <div className="flex flex-wrap gap-2">
                            {editFormData.schedule.map((slot) => (
                              <span key={`${slot.date}-${slot.time}`} className="px-2 py-1 bg-background border border-border rounded-full text-xs font-semibold">
                                {slot.date} {slot.time}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status change */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <button key={k}
                        onClick={() => {
                          setEditFormData({...editFormData, status: k as Booking['status']})
                          if (!isEditingDetails) handleStatusChange(editFormData.id, k as Booking['status'])
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          editFormData.status === k ? v.color : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                        }`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                  {isEditingDetails ? (
                    <textarea value={editFormData.notes || ''} onChange={e => setEditFormData({...editFormData, notes: e.target.value})}
                      placeholder="Add special notes or requests..." className={`${INPUT_CLS} resize-none h-20`} />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
                      {editFormData.notes || <span className="italic opacity-50">No notes</span>}
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground/60 flex gap-4 pt-2 border-t border-border">
                  <span>Created: {editFormData.createdAt}</span>
                  <span>Updated: {editFormData.updatedAt}</span>
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                <button onClick={() => handleDelete(selectedBooking.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowDetailsModal(false); setIsEditingDetails(false) }}
                    className="px-4 py-2 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-colors">
                    {isEditingDetails ? 'Cancel' : 'Close'}
                  </button>
                  {isEditingDetails ? (
                    <button onClick={handleSaveEdits} disabled={savingEdit}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
                      {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  ) : (
                    <button onClick={() => setIsEditingDetails(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
