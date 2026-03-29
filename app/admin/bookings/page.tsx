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
  collection, query, orderBy, deleteDoc, doc, updateDoc, where,
  Timestamp, onSnapshot, getDocs
} from 'firebase/firestore'
import { format, addDays, isSameDay, parseISO } from 'date-fns'

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
  estimatedPrice: number
  status: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected'
  paymentMethod?: string
  paymentStatus?: string
  materialsOption?: string
  schedule?: { date: string; time: string }[]
  notes?: string
  createdAt: string
  updatedAt: string
  propertyType?: string
  frequency?: string
  staffId?: string
  staffName?: string
  assignedStaff?: string
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
    if (!ts) return new Date().toISOString().split('T')[0]
    if (ts.toDate) return ts.toDate().toISOString().split('T')[0]
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString().split('T')[0]
    return ts
  }

  const getServiceInfo = (name: string, svcs: Service[]) => {
    const s = svcs.find(x => x.name.toLowerCase() === name.toLowerCase())
      ?? svcs.find(x => name.toLowerCase().includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(name.toLowerCase()))
    return s ? { id: s.id, name: s.name, price: s.price, duration: s.duration || 2 }
             : { id: '', name, price: 200, duration: 2 }
  }

  // Fetch services & employees once
  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [sSnap, eSnap] = await Promise.all([
          getDocs(query(collection(db, 'services'), where('status', '==', 'ACTIVE'))),
          getDocs(query(collection(db, 'employees'), where('status', '==', 'Active'))),
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
        })
        setServices(svcs)
        setEmployees(emps)
      } catch (e) { console.error(e) }
    }
    fetchStatic()
  }, [])

  // Real-time bookings via onSnapshot
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
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
        const duration = Number(r.serviceDuration || r.duration || svc.duration || 2)
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
          bookingDate: r.date || r.bookingDate || schedule[0]?.date || new Date().toISOString().split('T')[0],
          bookingTime: r.time || r.bookingTime || schedule[0]?.time || '09:00',
          bookingNumber: r.bookingId || `BK${d.id.slice(-6).toUpperCase()}`,
          duration,
          estimatedPrice,
          status: (r.status || 'pending') as Booking['status'],
          paymentMethod,
          paymentStatus,
          materialsOption: r.materialsOption || r.materialOption || '',
          schedule,
          notes: r.message || r.notes || '',
          propertyType: r.propertyType || '',
          frequency: r.frequency || 'once',
          staffId: r.staffId || r.assignedStaff || '',
          staffName: r.staffName || r.assignedStaffName || '',
          assignedStaff: r.assignedStaff || r.staffName || '',
          createdAt: formatFirebaseTimestamp(r.createdAt),
          updatedAt: formatFirebaseTimestamp(r.updatedAt),
        }
      })
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
      if (sortBy === 'date-desc') return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      if (sortBy === 'date-asc') return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
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
      try { return isSameDay(parseISO(b.bookingDate), selectedDate) } catch { return false }
    }),
    [bookings, selectedDate]
  )

  const filteredStaff = useMemo(() =>
    selectedEmployee === 'all' ? employees : employees.filter(e => e.name === selectedEmployee),
    [employees, selectedEmployee]
  )

  const convertTo24 = (t: string) => {
    if (!t) return '09:00'
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
    filteredAppointments.filter(a => a.staffName === emp.name || a.assignedStaff === emp.name)

  // Actions
  const handleStatusChange = async (id: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status, updatedAt: Timestamp.now() })
      if (selectedBooking?.id === id) setSelectedBooking(prev => prev ? { ...prev, status } : null)
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
      <div className="max-w-350 mx-auto p-6 space-y-6">

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
                  <p className="text-xs text-muted-foreground">{filteredAppointments.length} bookings on {format(selectedDate, 'MMMM dd, yyyy')}</p>
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
              <div className="overflow-auto max-h-145">
                <table className="min-w-max border-collapse w-full">
                  <thead className="sticky top-0 z-30 bg-muted">
                    <tr>
                      <th className="p-3 text-xs font-bold border-r border-b border-border text-left min-w-45 sticky left-0 bg-muted z-40">
                        Staff
                      </th>
                      {timeSlots.map((s, i) => (
                        <th key={i} className="p-2 text-[11px] font-medium border-r border-b border-border last:border-r-0 min-w-22.5 text-center text-muted-foreground">
                          {getSlotDisplay(s)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(emp => {
                      const empsApts = getEmpsForDate(emp)
                      return (
                        <tr key={emp.id} className="group">
                          <td className="sticky left-0 z-20 bg-card border-r border-b border-border p-3 group-hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xs shrink-0">
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm leading-tight truncate max-w-30">{emp.name}</p>
                                <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                              </div>
                            </div>
                          </td>
                          {timeSlots.map((slot, si) => {
                            const covering = empsApts.filter(a => doesCoverSlot(a, slot))
                            const starter = covering.find(a => isAptStart(a, slot))
                            if (starter) {
                              const span = getSpan(starter, slot)
                              return (
                                <td key={si} colSpan={span}
                                  className="p-1.5 border-b border-border cursor-pointer"
                                  onClick={() => handleViewDetails(starter)}>
                                  <div className={`h-full p-2 rounded-xl border-l-4 ${
                                    calendarDotColors[starter.status] ?? 'bg-muted-foreground'
                                  } bg-opacity-10 hover:bg-opacity-20 transition-all`}
                                    style={{ borderLeftColor: '', backgroundColor: 'rgb(var(--muted)/0.4)' }}>
                                    <p className="font-bold text-xs truncate">{starter.clientName}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{starter.serviceName}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{starter.bookingTime}</p>
                                  </div>
                                </td>
                              )
                            }
                            if (covering.length > 0) return null
                            return <td key={si} className="border-r border-b border-border/50 bg-muted/5 hover:bg-muted/20 transition-colors" />
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
                          <p className="text-xs text-muted-foreground">{b.duration}h session</p>
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
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {editFormData.duration}h</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> AED {editFormData.estimatedPrice.toLocaleString()}</span>
                    {editFormData.frequency && <span className="capitalize">{editFormData.frequency}</span>}
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
                        <p className="text-sm font-bold">{editFormData.duration}h</p>
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
