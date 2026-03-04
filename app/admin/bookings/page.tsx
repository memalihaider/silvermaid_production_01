'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  XCircle,
  Eye,
  Trash2,
  Download,
  MessageSquare,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin as LocationIcon,
  TrendingUp,
  Users,
  X,
  Edit2,
  Save,
  Ban,
  ThumbsUp,
  ThumbsDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  RotateCcw,
  Settings,
  PlusCircle,
  LayoutGrid,
  List,
  Scissors,
  UserCircle,
  EyeOff,
  Eye as EyeIcon,
  Clock as ClockIcon2,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react'

import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where, Timestamp } from 'firebase/firestore'
import { format, addDays, startOfDay, addMinutes, isSameDay, parseISO } from 'date-fns'

interface Booking {
  id: string;
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  serviceName: string;
  serviceId?: string;
  bookingDate: string;
  bookingTime: string;
  bookingNumber: string;
  duration: number;
  estimatedPrice: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  propertyType?: string;
  frequency?: string;
  staffId?: string;
  staffName?: string;
  assignedStaff?: string;
}

interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost?: number;
  duration?: number;
  description: string;
  status: string;
  type: string;
  sku?: string;
  imageUrl?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  rating: number;
  position?: string;
  assignedRoles?: string[];
  team?: string[];
}

// Status icons and colors
const statusIcons = {
  pending: AlertCircle,
  accepted: ThumbsUp,
  confirmed: CheckCircle,
  'in-progress': ClockIcon,
  completed: CheckCircle,
  cancelled: XCircle,
  rejected: ThumbsDown
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  accepted: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  'in-progress': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
}

const calendarStatusColors = {
  pending: 'bg-amber-500',
  accepted: 'bg-teal-500',
  confirmed: 'bg-blue-500',
  'in-progress': 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-rose-500'
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
  
  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedService, setSelectedService] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [timeSlotGap, setTimeSlotGap] = useState(30)
  const [layoutMode, setLayoutMode] = useState<'staff-top' | 'time-top'>('staff-top')
  const [visibleHours, setVisibleHours] = useState<number[]>(() => {
    return Array.from({ length: 13 }, (_, i) => i + 6)
  })
  const [showSettings, setShowSettings] = useState(false)
  const [hourSelectionMode, setHourSelectionMode] = useState<'visible' | 'hidden'>('visible')

  const allHours = Array.from({ length: 24 }, (_, i) => i)
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const generateTimeSlots = () => {
    const slots: string[] = []
    const sortedHours = [...visibleHours].sort((a, b) => a - b)
    
    for (const hour of sortedHours) {
      for (let minute = 0; minute < 60; minute += timeSlotGap) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }
    }
    return slots
  }

  const timeSlots = useMemo(() => generateTimeSlots(), [visibleHours, timeSlotGap])

  const toggleHourVisibility = (hour: number) => {
    setVisibleHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort((a, b) => a - b)
    )
  }

  const showAllHours = () => setVisibleHours([...allHours])
  const hideAllHours = () => setVisibleHours([])
  const showBusinessHours = () => setVisibleHours(Array.from({ length: 17 }, (_, i) => i + 6))
  const showMorningHours = () => setVisibleHours(Array.from({ length: 7 }, (_, i) => i + 6))
  const showAfternoonHours = () => setVisibleHours(Array.from({ length: 7 }, (_, i) => i + 12))
  const showEveningHours = () => setVisibleHours(Array.from({ length: 7 }, (_, i) => i + 18).filter(h => h < 24))
  const showNightHours = () => setVisibleHours(Array.from({ length: 6 }, (_, i) => i))

 // Sirf ye function change karna hai - baaki code exactly waisa hi rahega

const getSlotDisplay = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour = hours
  const minute = minutes
  
  // Format hour for display (e.g., 5 -> 5 AM, 14 -> 2 PM)
  const formatHourOnly = (h: number): string => {
    if (h === 0) return '12 AM'
    if (h === 12) return '12 PM'
    return h < 12 ? `${h} AM` : `${h - 12} PM`
  }
  
  if (minute === 0) {
    return formatHourOnly(hour)
  } else {
    // Return format: "5:15 AM" instead of "5 AM : 15"
    const hourDisplay = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    return `${hourDisplay}:${minute.toString().padStart(2, '0')} ${ampm}`
  }
}

  useEffect(() => {
    fetchBookings()
    fetchServices()
    fetchEmployees()
  }, [])

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings')
      const q = query(bookingsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const bookingsData: Booking[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const serviceName = data.service || data.serviceName || 'N/A'
        const serviceInfo = getServiceInfo(serviceName)
        
        bookingsData.push({
          id: doc.id,
          bookingId: data.bookingId || `BK${Date.now()}`,
          clientName: data.name || data.clientName || 'N/A',
          clientEmail: data.email || data.clientEmail || 'N/A',
          clientPhone: data.phone || data.clientPhone || 'N/A',
          clientAddress: data.area || data.clientAddress || 'N/A',
          serviceName: serviceInfo.name,
          serviceId: data.serviceId || serviceInfo.id,
          bookingDate: data.date || data.bookingDate || new Date().toISOString().split('T')[0],
          bookingTime: data.time || data.bookingTime || '09:00',
          bookingNumber: data.bookingId || `BK${Date.now()}`,
          duration: serviceInfo.duration,
          estimatedPrice: serviceInfo.price,
          status: (data.status || 'pending') as Booking['status'],
          notes: data.message || data.notes || '',
          propertyType: data.propertyType || '',
          frequency: data.frequency || 'once',
          staffId: data.staffId || data.assignedStaff || '',
          staffName: data.staffName || data.assignedStaffName || '',
          assignedStaff: data.assignedStaff || data.staffName || '',
          createdAt: formatFirebaseTimestamp(data.createdAt),
          updatedAt: formatFirebaseTimestamp(data.updatedAt)
        })
      })
      
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, 'services')
      const q = query(servicesRef, where('status', '==', 'ACTIVE'))
      const querySnapshot = await getDocs(q)
      
      const servicesData: Service[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        servicesData.push({
          id: doc.id,
          name: data.name || 'Unknown Service',
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || 'Uncategorized',
          price: data.price || 0,
          cost: data.cost || 0,
          duration: data.duration ? Math.ceil(data.duration / 60) : 2,
          description: data.description || '',
          status: data.status || 'ACTIVE',
          type: data.type || 'SERVICE',
          sku: data.sku || '',
          imageUrl: data.imageUrl || ''
        })
      })
      
      setServices(servicesData)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees')
      const q = query(employeesRef, where('status', '==', 'Active'))
      const querySnapshot = await getDocs(q)
      
      const employeesData: Employee[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        employeesData.push({
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'CLEANER',
          department: data.department || 'Operations',
          status: data.status || 'Active',
          rating: data.rating || 0,
          position: data.position || '',
          assignedRoles: data.assignedRoles || [],
          team: data.team || []
        })
      })
      
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const getServiceInfo = (serviceName: string): { id: string; name: string; price: number; duration: number } => {
    let service = services.find(s => s.name.toLowerCase() === serviceName.toLowerCase())
    if (!service) {
      service = services.find(s => serviceName.toLowerCase().includes(s.name.toLowerCase()) || 
                                       s.name.toLowerCase().includes(serviceName.toLowerCase()))
    }
    if (!service) {
      return { id: '', name: serviceName, price: 200, duration: 2 }
    }
    return {
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration || 2
    }
  }

  const formatFirebaseTimestamp = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString().split('T')[0]
    if (timestamp.toDate) return timestamp.toDate().toISOString().split('T')[0]
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString().split('T')[0]
    return timestamp
  }

  const filteredAppointments = useMemo(() => 
    bookings.filter(apt => {
      const aptDate = parseISO(apt.bookingDate)
      const matchesDate = isSameDay(aptDate, selectedDate)
      const matchesService = selectedService === 'all' || apt.serviceId === selectedService || apt.serviceName === selectedService
      const matchesEmployee = selectedEmployee === 'all' || apt.staffId === selectedEmployee || apt.staffName === selectedEmployee || apt.assignedStaff === selectedEmployee
      return matchesDate && matchesService && matchesEmployee
    }),
    [bookings, selectedDate, selectedService, selectedEmployee]
  )

  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "09:00"
    if (time12h.includes(':') && !time12h.includes(' ')) return time12h
    
    const [time, period] = time12h.split(' ')
    if (!period) return time12h
    
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)
    
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    else if (period === 'AM' && hour24 === 12) hour24 = 0
    
    return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`
  }

  const parseDuration = (duration: number): number => duration * 60

  const doesAppointmentCoverSlot = (appointment: Booking, timeStr: string): boolean => {
    const [slotHours, slotMinutes] = timeStr.split(':').map(Number)
    const appointmentTime24 = convertTo24Hour(appointment.bookingTime)
    const appointmentDuration = parseDuration(appointment.duration)
    
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number)
    
    const slotStartMinutes = slotHours * 60 + slotMinutes
    const slotEndMinutes = slotStartMinutes + timeSlotGap
    const appointmentStartMinutes = aptHours * 60 + aptMinutes
    const appointmentEndMinutes = appointmentStartMinutes + appointmentDuration
    
    return (appointmentStartMinutes < slotEndMinutes) && (appointmentEndMinutes > slotStartMinutes)
  }

  const getAppointmentsForEmployee = (employee: Employee): Booking[] => {
    return filteredAppointments.filter(apt => 
      apt.staffName === employee.name || 
      apt.assignedStaff === employee.name ||
      apt.staffName?.includes(employee.name) ||
      employee.name.includes(apt.staffName || '')
    )
  }

  const isAppointmentStart = (appointment: Booking, timeStr: string): boolean => {
    const appointmentTime24 = convertTo24Hour(appointment.bookingTime)
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number)
    const appointmentStartMinutes = aptHours * 60 + aptMinutes
    
    const [slotHours, slotMinutes] = timeStr.split(':').map(Number)
    const slotStartMinutes = slotHours * 60 + slotMinutes
    const slotEndMinutes = slotStartMinutes + timeSlotGap
    
    return appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < slotEndMinutes
  }

  const getAppointmentSpan = (appointment: Booking, startTimeStr: string): number => {
    const appointmentTime24 = convertTo24Hour(appointment.bookingTime)
    const duration = parseDuration(appointment.duration)
    const [aptHours, aptMinutes] = appointmentTime24.split(':').map(Number)
    const appointmentStartMinutes = aptHours * 60 + aptMinutes
    const appointmentEndMinutes = appointmentStartMinutes + duration
    
    let startSlotIndex = -1
    for (let i = 0; i < timeSlots.length; i++) {
      const [h, m] = timeSlots[i].split(':').map(Number)
      const slotStart = h * 60 + m
      
      if (appointmentStartMinutes >= slotStart && appointmentStartMinutes < slotStart + timeSlotGap) {
        startSlotIndex = i
        break
      }
    }
    
    if (startSlotIndex === -1) return 1
    
    let span = 0
    for (let i = startSlotIndex; i < timeSlots.length; i++) {
      const [h, m] = timeSlots[i].split(':').map(Number)
      const slotStart = h * 60 + m
      
      if (slotStart < appointmentEndMinutes) {
        span++
      } else {
        break
      }
    }
    
    return span
  }

  const getStatusColor = (status: string): string => {
    return calendarStatusColors[status as keyof typeof calendarStatusColors] || 'bg-gray-500'
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1))
  }

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = 
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.staffName || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        case 'date-asc': return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
        case 'price-desc': return b.estimatedPrice - a.estimatedPrice
        case 'price-asc': return a.estimatedPrice - b.estimatedPrice
        case 'name-asc': return a.clientName.localeCompare(b.clientName)
        case 'name-desc': return b.clientName.localeCompare(a.clientName)
        default: return 0
      }
    })

    return filtered
  }, [bookings, searchTerm, selectedStatus, sortBy])

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    revenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.estimatedPrice, 0)
  }

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      })
      
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : b
      ))
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Status update failed!')
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId))
        setBookings(bookings.filter(b => b.id !== bookingId))
        setShowDetailsModal(false)
        setSelectedBooking(null)
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert('Delete failed!')
      }
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditFormData({ ...booking })
    setShowDetailsModal(true)
    setIsEditingDetails(false)
  }

  const handleSaveEdits = async () => {
    if (!editFormData) return
    
    try {
      const bookingRef = doc(db, 'bookings', editFormData.id)
      await updateDoc(bookingRef, {
        name: editFormData.clientName,
        email: editFormData.clientEmail,
        phone: editFormData.clientPhone,
        area: editFormData.clientAddress,
        service: editFormData.serviceName,
        date: editFormData.bookingDate,
        time: editFormData.bookingTime,
        status: editFormData.status,
        message: editFormData.notes || '',
        staffName: editFormData.staffName || '',
        assignedStaff: editFormData.assignedStaff || '',
        updatedAt: Timestamp.now()
      })
      
      setBookings(bookings.map(b => b.id === editFormData.id ? editFormData : b))
      setSelectedBooking(editFormData)
      setIsEditingDetails(false)
      
      await fetchBookings()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Update failed!')
    }
  }

  const statuses = ['all', 'pending', 'accepted', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected']
  const statusLabels = {
    all: 'All Bookings',
    pending: 'Pending',
    accepted: 'Accepted',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected'
  }

  const filteredStaff = useMemo(() => {
    if (selectedEmployee === 'all') {
      return employees
    }
    return employees.filter(emp => emp.name === selectedEmployee)
  }, [employees, selectedEmployee])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Bookings Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookings.length} bookings, {services.length} services, {employees.length} staff
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              showCalendar 
                ? 'bg-purple-600 text-white shadow-purple-500/20 hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? <LayoutGrid className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            {showCalendar ? 'Show List View' : 'Show Calendar View'}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
            onClick={() => {
              fetchBookings()
              fetchServices()
              fetchEmployees()
            }}
          >
            <Download className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {!showCalendar && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-950/30 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Pending</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Active Staff</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{employees.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                <UserCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Revenue</p>
                <p className="text-2xl font-black text-green-600 mt-1">AED {stats.revenue.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {showCalendar ? (
        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600" />
              Staff Booking Calendar
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredAppointments.length} bookings on {format(selectedDate, 'MMM dd, yyyy')})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                
              </div>

              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-1.5 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all min-w-[180px]"
              >
                <option value="all">All Staff ({employees.length})</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} - {emp.role} ⭐{emp.rating}
                  </option>
                ))}
              </select>

             

              <select
                value={timeSlotGap.toString()}
                onChange={(e) => setTimeSlotGap(parseInt(e.target.value))}
                className="px-3 py-1.5 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              >
                <option value="15">15 min slots</option>
                <option value="30">30 min slots</option>
                <option value="60">1 hour slots</option>
                <option value="120">2 hour slots</option>
              </select>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-purple-600 text-white' : 'hover:bg-muted'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium min-w-[120px] text-center px-2">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </span>
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showSettings && (
            <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hour Visibility Settings
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setHourSelectionMode('visible')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                      hourSelectionMode === 'visible' ? 'bg-purple-600 text-white' : 'bg-muted'
                    }`}
                  >
                    <EyeIcon className="w-3 h-3" />
                    Visible ({visibleHours.length})
                  </button>
                  <button
                    onClick={() => setHourSelectionMode('hidden')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                      hourSelectionMode === 'hidden' ? 'bg-purple-600 text-white' : 'bg-muted'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    Hidden ({24 - visibleHours.length})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={showAllHours} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <Sun className="w-3 h-3" /> All 24 Hours
                </button>
                <button onClick={showBusinessHours} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Business (6 AM - 10 PM)
                </button>
                <button onClick={showMorningHours} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors flex items-center gap-1">
                  <Sunrise className="w-3 h-3" /> Morning (6 AM - 12 PM)
                </button>
                <button onClick={showAfternoonHours} className="px-3 py-1 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700 transition-colors flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Afternoon (12 PM - 6 PM)
                </button>
                <button onClick={showEveningHours} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors flex items-center gap-1">
                  <Sunset className="w-3 h-3" /> Evening (6 PM - 12 AM)
                </button>
                <button onClick={showNightHours} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1">
                  <Moon className="w-3 h-3" /> Night (12 AM - 6 AM)
                </button>
                <button onClick={hideAllHours} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Hide All
                </button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {hourSelectionMode === 'visible' ? 'Click hours to show/hide:' : 'Hidden hours (click to show):'}
                </p>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                  {allHours.map(hour => {
                    const isVisible = visibleHours.includes(hour)
                    const shouldShow = hourSelectionMode === 'visible' ? true : !isVisible
                    
                    if (!shouldShow) return null
                    
                    return (
                      <button
                        key={hour}
                        onClick={() => toggleHourVisibility(hour)}
                        className={`
                          p-2 text-xs rounded-lg transition-all font-medium
                          ${isVisible 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 line-through'
                          }
                        `}
                      >
                        {formatHour(hour)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Total visible hours: {visibleHours.length}</span>
                <span>Total slots: {timeSlots.length}</span>
              </div>
            </div>
          )}

          {/* ===== PERFECT FIX: Table-based layout for absolute alignment ===== */}
          {timeSlots.length > 0 && filteredStaff.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] w-full border rounded-lg">
              <table className="min-w-max border-collapse">
                <thead className="sticky top-0 z-30 bg-muted">
                  <tr>
                    <th className="p-3 text-sm font-bold border-r border-b text-left">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Staff Members
                      </div>
                    </th>
                    {timeSlots.map((slot, index) => (
                      <th key={`header-${index}`} className="p-2 text-xs font-medium border-r border-b last:border-r-0 min-w-[100px] text-center">
                        {getSlotDisplay(slot)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map(employee => {
                    const employeeBookings = getAppointmentsForEmployee(employee)
                    
                    return (
                      <tr key={`row-${employee.id}`}>
                        {/* Staff Cell - Sticky */}
                        <td className="sticky left-0 z-20 bg-muted/80 p-3 border-r border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                              <UserCircle className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm truncate">{employee.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span>{employee.role}</span>
                                <span>⭐ {employee.rating}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Time Slot Cells */}
                        {timeSlots.map((slot, slotIndex) => {
                          const slotBookings = employeeBookings.filter(apt => 
                            doesAppointmentCoverSlot(apt, slot)
                          )
                          
                          const startBooking = slotBookings.find(apt => isAppointmentStart(apt, slot))
                          
                          if (startBooking) {
                            const span = getAppointmentSpan(startBooking, slot)
                            
                            // For multi-span bookings, we need to handle colspan
                            if (isAppointmentStart(startBooking, slot)) {
                              return (
                                <td
                                  key={`${employee.id}-${slotIndex}`}
                                  colSpan={span}
                                  className="p-2 border-2 rounded cursor-pointer hover:shadow-md transition-all border-b"
                                >
                                  <div
                                    className={`h-full w-full ${getStatusColor(startBooking.status)}/10 p-1 rounded ${
                                      startBooking.status === 'completed' ? 'border-green-500' :
                                      startBooking.status === 'cancelled' ? 'border-red-500' :
                                      startBooking.status === 'rejected' ? 'border-rose-500' :
                                      'border-purple-500'
                                    } border-2`}
                                    onClick={() => handleViewDetails(startBooking)}
                                  >
                                    <div className="flex flex-col text-xs">
                                      <div className="flex items-center gap-1 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(startBooking.status)}`} />
                                        <span className="font-bold truncate">{startBooking.clientName}</span>
                                      </div>
                                      <div className="text-muted-foreground truncate text-[10px]">
                                        {startBooking.serviceName}
                                      </div>
                                      <div className="text-muted-foreground text-[10px] mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {startBooking.bookingTime} ({startBooking.duration}h)
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              )
                            } else {
                              // Skip this cell as it's covered by previous colspan
                              return null
                            }
                          }
                          
                          // Empty slot
                          return (
                            <td
                              key={`${employee.id}-empty-${slotIndex}`}
                              className="p-2 border border-dashed border-muted-foreground/30 rounded bg-muted/5 min-h-[80px] border-b"
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
            <div className="p-8 text-center text-muted-foreground border rounded-lg">
              {timeSlots.length === 0 ? (
                <>
                  <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No hours selected</p>
                  <p className="text-sm">Click the settings button and show some hours</p>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No staff members found</p>
                  <p className="text-sm">Check your staff filter or Firebase data</p>
                </>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>Pending</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500" /><span>Accepted</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>Confirmed</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span>In Progress</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Completed</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Cancelled</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /><span>Rejected</span></div>
          </div>

          {/* Staff Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">Active Staff </span> {employees.length} staff members
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {employees.map(emp => (
                <div key={emp.id} className="px-2 py-1 bg-background rounded border text-xs flex items-center gap-1">
                  <UserCircle className="w-3 h-3" />
                  <span className="font-medium">{emp.name}</span>
                  <span className="text-purple-600">{emp.role}</span>
                  <span className="text-amber-600">⭐{emp.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by booking number, client name, email, service, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-muted/50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {statusLabels[status as keyof typeof statusLabels]}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-muted/50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredAndSortedBookings.length > 0 ? (
              filteredAndSortedBookings.map((booking) => {
                const StatusIcon = statusIcons[booking.status]
                return (
                  <div key={booking.id} className="bg-card border rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${statusColors[booking.status]}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-foreground truncate">{booking.serviceName}</p>
                            <p className="text-xs text-muted-foreground">{booking.bookingNumber}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-foreground font-bold">{booking.clientName}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-muted-foreground truncate">{booking.clientEmail}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-muted-foreground">{booking.clientPhone}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <LocationIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-muted-foreground truncate">{booking.clientAddress}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-muted-foreground">{booking.bookingDate}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-muted-foreground">{booking.bookingTime} ({booking.duration}h)</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                              <p className="text-foreground font-bold">AED {booking.estimatedPrice.toLocaleString()}</p>
                            </div>
                            {booking.staffName && (
                              <div className="flex items-center gap-2 text-sm">
                                <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-purple-600 font-medium">{booking.staffName}</p>
                              </div>
                            )}
                            <div>
                              <select
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none outline-none transition-all cursor-pointer ${statusColors[booking.status]}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg border-l-2 border-amber-500">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">Notes</p>
                            <p className="text-sm text-muted-foreground">{booking.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleViewDetails(booking)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-lg text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-green-100 dark:hover:bg-green-950/30 rounded-lg text-green-600 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-card border rounded-2xl p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No bookings found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Booking Details</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedBooking.bookingNumber}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Service</p>
                <p className="text-lg font-black">{editFormData.serviceName}</p>
              </div>

              {(editFormData.staffName || editFormData.assignedStaff) && (
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <UserCircle className="w-4 h-4" />
                    Assigned Staff
                  </p>
                  <p className="font-bold text-purple-700 dark:text-purple-300">
                    {editFormData.staffName || editFormData.assignedStaff}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </h3>
                <div className="space-y-3">
                  {isEditingDetails ? (
                    <>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Full Name</label>
                        <input type="text" value={editFormData.clientName} onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Email</label>
                        <input type="email" value={editFormData.clientEmail} onChange={(e) => setEditFormData({ ...editFormData, clientEmail: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Phone</label>
                        <input type="tel" value={editFormData.clientPhone} onChange={(e) => setEditFormData({ ...editFormData, clientPhone: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Address</label>
                        <input type="text" value={editFormData.clientAddress} onChange={(e) => setEditFormData({ ...editFormData, clientAddress: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Assigned Staff</label>
                        <select value={editFormData.staffName || ''} onChange={(e) => setEditFormData({ ...editFormData, staffName: e.target.value, assignedStaff: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                          <option value="">Select Staff</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.name}>
                              {emp.name} - {emp.role} ⭐{emp.rating}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Name</p><p className="font-bold">{editFormData.clientName}</p></div>
                        <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone</p><p className="font-bold">{editFormData.clientPhone}</p></div>
                      </div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p><p className="font-bold">{editFormData.clientEmail}</p></div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Service Address</p><p className="font-bold">{editFormData.clientAddress}</p></div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </h3>
                <div className="space-y-3">
                  {isEditingDetails ? (
                    <>
                      <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Date</label><input type="date" value={editFormData.bookingDate} onChange={(e) => setEditFormData({ ...editFormData, bookingDate: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                      <div><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Time</label><input type="time" value={editFormData.bookingTime} onChange={(e) => setEditFormData({ ...editFormData, bookingTime: e.target.value })} className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</p><p className="font-bold">{editFormData.bookingDate}</p></div>
                        <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Time</p><p className="font-bold">{editFormData.bookingTime}</p></div>
                      </div>
                      <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Duration</p><p className="font-bold">{editFormData.duration} hours</p></div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Price</p><p className="text-xl font-black">AED {editFormData.estimatedPrice.toLocaleString()}</p></div>
                  <div className="bg-muted/50 rounded-xl p-3"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Booking['status'] })} className={`w-full px-2 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer ${statusColors[editFormData.status]}`}>
                      <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="confirmed">Confirmed</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black mb-3">Special Notes</h3>
                {isEditingDetails ? (
                  <textarea value={editFormData.notes || ''} onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} placeholder="Add any special notes or requests..." className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24" />
                ) : (
                  <div className="bg-muted/50 rounded-lg p-3"><p className="text-sm text-muted-foreground">{editFormData.notes || 'No notes added'}</p></div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                <p>Created: {editFormData.createdAt}</p>
                <p>Updated: {editFormData.updatedAt}</p>
                {editFormData.propertyType && <p>Property Type: {editFormData.propertyType}</p>}
                {editFormData.frequency && <p>Frequency: {editFormData.frequency}</p>}
              </div>
            </div>

            <div className="sticky bottom-0 bg-muted/50 border-t p-4 flex items-center justify-between gap-3">
              <button onClick={() => handleDeleteBooking(selectedBooking.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">Delete Booking</button>
              <div className="flex gap-3">
                <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border rounded-lg font-bold text-sm hover:bg-muted transition-colors">Close</button>
                {isEditingDetails ? (
                  <button onClick={handleSaveEdits} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</button>
                ) : (
                  <button onClick={() => setIsEditingDetails(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"><Edit2 className="h-4 w-4" /> Edit Details</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}