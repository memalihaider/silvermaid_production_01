'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Search, 
  Zap, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Link as LinkIcon, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  DollarSign, 
  Truck,
  Briefcase
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Firebase Interfaces
interface FirebaseEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  status: string;
  supervisor: string;
  salary: number;
  salaryStructure: string;
  bankName: string;
  bankAccount: string;
  joinDate: string;
  createdAt: string;
  lastUpdated: string;
}

interface FirebaseMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  attendeeNames: string[];
  type: string;
  linkedJob: string;
  linkedClient: string;
  location: string;
  notes: string;
  vehicle: string;
  cost: number;
  status: string;
  agendaAI: string;
  summary: string;
  decisions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function MeetingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null)
  const [viewingMeeting, setViewingMeeting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Real Data States
  const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
  const [meetings, setMeetings] = useState<FirebaseMeeting[]>([])
  
  // Form State
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '30 mins',
    attendees: [] as string[],
    attendeeNames: [] as string[],
    type: 'Standup',
    linkedJob: '',
    linkedClient: '',
    vehicle: 'Company Car',
    cost: '',
    location: '',
    notes: '',
    status: 'Scheduled'
  })

  // Static data (unchanged)
  const vehicles = ['Company Car', 'Company Van', 'Company Truck', 'Personal Vehicle', 'Client Location', 'Office']
  const meetingTypes = ['all', 'Standup', 'Job Review', 'Financial', 'HR', 'Client Meeting', 'Review', 'Audit', 'Strategic']

  // Fetch all data from Firebase
  useEffect(() => {
    fetchEmployees()
    fetchMeetings()
  }, [])

  const fetchEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees')
      const snapshot = await getDocs(employeesRef)
      
      const employeesList: FirebaseEmployee[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.status === 'Active') {
          employeesList.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || '',
            supervisor: data.supervisor || '',
            salary: data.salary || 0,
            salaryStructure: data.salaryStructure || '',
            bankName: data.bankName || '',
            bankAccount: data.bankAccount || '',
            joinDate: data.joinDate || '',
            createdAt: data.createdAt || '',
            lastUpdated: data.lastUpdated || ''
          })
        }
      })
      
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchMeetings = async () => {
    try {
      const meetingsRef = collection(db, 'meetingCalendar')
      const q = query(meetingsRef, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      
      const meetingsList: FirebaseMeeting[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        meetingsList.push({
          id: doc.id,
          title: data.title || '',
          date: data.date || '',
          time: data.time || '',
          duration: data.duration || '30 mins',
          attendees: data.attendees || [],
          attendeeNames: data.attendeeNames || [],
          type: data.type || 'Standup',
          linkedJob: data.linkedJob || '',
          linkedClient: data.linkedClient || '',
          location: data.location || '',
          notes: data.notes || '',
          vehicle: data.vehicle || 'Company Car',
          cost: data.cost || 0,
          status: data.status || 'Scheduled',
          agendaAI: data.agendaAI || 'Auto-generated',
          summary: data.summary || 'Pending',
          decisions: data.decisions || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      
      setMeetings(meetingsList)
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  // Clean data for Firebase
  const cleanFirebaseData = (data: any) => {
    const cleanData: any = {}
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'string' && data[key].trim() === '') {
          cleanData[key] = ''
        } else {
          cleanData[key] = data[key]
        }
      } else {
        cleanData[key] = ''
      }
    })
    return cleanData
  }

  // Add Meeting to Firebase
  const handleAddMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time || newMeeting.attendees.length === 0) {
      alert('Please fill all required fields: Title, Date, Time, and Attendees')
      return
    }

    setLoading(true)
    try {
      // Get selected employee names
      const selectedAttendeeNames = employees
        .filter(emp => newMeeting.attendees.includes(emp.id))
        .map(emp => emp.name)

      const meetingData = {
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        attendees: newMeeting.attendees,
        attendeeNames: selectedAttendeeNames,
        type: newMeeting.type,
        linkedJob: newMeeting.linkedJob,
        linkedClient: newMeeting.linkedClient,
        location: newMeeting.location,
        notes: newMeeting.notes,
        vehicle: newMeeting.vehicle,
        cost: newMeeting.cost ? parseInt(newMeeting.cost) : 0,
        status: newMeeting.status,
        agendaAI: 'Auto-generated',
        summary: 'Pending',
        decisions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(meetingData)
      await addDoc(collection(db, 'meetingCalendar'), cleanData)

      // Reset form and refresh data
      resetForm()
      setShowMeetingForm(false)
      fetchMeetings()
      
      alert('Meeting scheduled successfully!')
    } catch (error) {
      console.error('Error adding meeting:', error)
      alert('Error adding meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Edit Meeting in Firebase
  const handleEditMeeting = async () => {
    if (!editingMeeting || !newMeeting.title || !newMeeting.date || !newMeeting.time || newMeeting.attendees.length === 0) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      // Get selected employee names
      const selectedAttendeeNames = employees
        .filter(emp => newMeeting.attendees.includes(emp.id))
        .map(emp => emp.name)

      const updatedMeeting = {
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        attendees: newMeeting.attendees,
        attendeeNames: selectedAttendeeNames,
        type: newMeeting.type,
        linkedJob: newMeeting.linkedJob,
        linkedClient: newMeeting.linkedClient,
        location: newMeeting.location,
        notes: newMeeting.notes,
        vehicle: newMeeting.vehicle,
        cost: newMeeting.cost ? parseInt(newMeeting.cost) : 0,
        status: newMeeting.status,
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(updatedMeeting)
      await updateDoc(doc(db, 'meetingCalendar', editingMeeting), cleanData)

      // Reset form and refresh data
      resetForm()
      setShowMeetingForm(false)
      setEditingMeeting(null)
      fetchMeetings()
      
      alert('Meeting updated successfully!')
    } catch (error) {
      console.error('Error updating meeting:', error)
      alert('Error updating meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Delete Meeting from Firebase
  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    try {
      await deleteDoc(doc(db, 'meetingCalendar', id))
      fetchMeetings()
      alert('Meeting deleted successfully!')
    } catch (error) {
      console.error('Error deleting meeting:', error)
      alert('Error deleting meeting. Please try again.')
    }
  }

  // Open Edit Form - FIXED THIS FUNCTION
  const openEditMeeting = (meeting: FirebaseMeeting) => {
    console.log('Opening edit for meeting:', meeting.id, meeting.title)
    
    setEditingMeeting(meeting.id)
    setNewMeeting({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      attendees: meeting.attendees || [],
      attendeeNames: meeting.attendeeNames || [],
      type: meeting.type,
      linkedJob: meeting.linkedJob || '',
      linkedClient: meeting.linkedClient || '',
      vehicle: meeting.vehicle || 'Company Car',
      cost: meeting.cost?.toString() || '',
      location: meeting.location || '',
      notes: meeting.notes || '',
      status: meeting.status || 'Scheduled'
    })
    setShowMeetingForm(true)
    setViewingMeeting(null)
  }

  // Reset Form
  const resetForm = () => {
    setNewMeeting({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: '30 mins',
      attendees: [],
      attendeeNames: [],
      type: 'Standup',
      linkedJob: '',
      linkedClient: '',
      vehicle: 'Company Car',
      cost: '',
      location: '',
      notes: '',
      status: 'Scheduled'
    })
  }

  // Open View Details
  const handleViewMeeting = (id: string) => {
    setViewingMeeting(viewingMeeting === id ? null : id)
  }

  // Filter functions
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch = searchTerm === '' || 
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.linkedClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.linkedJob?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.attendeeNames?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = selectedType === 'all' || meeting.type === selectedType
      return matchesSearch && matchesType
    })
  }, [searchTerm, selectedType, meetings])

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }, [currentMonth])

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatDate = (day: number) => {
    return `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Get meeting type color function
  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'Standup': return 'bg-blue-100 text-blue-700'
      case 'Job Review': return 'bg-pink-100 text-pink-700'
      case 'Financial': return 'bg-green-100 text-green-700'
      case 'HR': return 'bg-purple-100 text-purple-700'
      case 'Client Meeting': return 'bg-orange-100 text-orange-700'
      case 'Review': return 'bg-yellow-100 text-yellow-700'
      case 'Audit': return 'bg-red-100 text-red-700'
      case 'Strategic': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const currentMonthStr = currentMonth.getFullYear() + '-' + String(currentMonth.getMonth() + 1).padStart(2, '0')
    const currentMonthMeetings = meetings.filter(m => m.date.startsWith(currentMonthStr))
    
    return {
      totalMeetings: meetings.length,
      thisMonthMeetings: currentMonthMeetings.length,
      clientMeetings: meetings.filter(m => m.linkedClient && m.linkedClient.trim() !== '').length,
      jobMeetings: meetings.filter(m => m.linkedJob && m.linkedJob.trim() !== '').length,
      todayMeetings: meetings.filter(m => m.date === new Date().toISOString().split('T')[0]).length
    }
  }, [meetings, currentMonth])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Meeting Calendar</h1>
          <p className="text-muted-foreground mt-1">Dynamic calendar with auto agenda creation and full meeting management</p>
        </div>
        <button 
          onClick={() => {
            resetForm()
            setEditingMeeting(null)
            setShowMeetingForm(true)
          }} 
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Schedule Meeting</span>
        </button>
      </div>

      {/* Add/Edit Meeting Form Modal */}
      {showMeetingForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}</h3>
            <button 
              onClick={() => { 
                setShowMeetingForm(false); 
                setEditingMeeting(null); 
                resetForm();
              }} 
              className="p-1 hover:bg-blue-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Info */}
            <input
              type="text"
              placeholder="Meeting Title *"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-3"
              required
            />
            
            <input 
              type="date" 
              value={newMeeting.date} 
              onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            />
            <input 
              type="time" 
              value={newMeeting.time} 
              onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              required
            />
            <select 
              value={newMeeting.duration} 
              onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15 mins">15 mins</option>
              <option value="30 mins">30 mins</option>
              <option value="45 mins">45 mins</option>
              <option value="60 mins">1 hour</option>
              <option value="90 mins">1.5 hours</option>
              <option value="120 mins">2 hours</option>
            </select>

            {/* Meeting Type */}
            <select 
              value={newMeeting.type} 
              onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {meetingTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            {/* Location */}
            <input 
              type="text" 
              placeholder="Location" 
              value={newMeeting.location} 
              onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            
            {/* Vehicle */}
            <select 
              value={newMeeting.vehicle} 
              onChange={(e) => setNewMeeting({...newMeeting, vehicle: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vehicles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Cost */}
            <input 
              type="number" 
              placeholder="Cost (AED)" 
              value={newMeeting.cost} 
              onChange={(e) => setNewMeeting({...newMeeting, cost: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              min="0"
            />

            {/* Job & Client Links */}
            <input 
              type="text" 
              placeholder="Linked Job ID (Optional)" 
              value={newMeeting.linkedJob} 
              onChange={(e) => setNewMeeting({...newMeeting, linkedJob: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="text" 
              placeholder="Linked Client (Optional)" 
              value={newMeeting.linkedClient} 
              onChange={(e) => setNewMeeting({...newMeeting, linkedClient: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />

            {/* Team Members Multi-Select */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-bold">Team Members *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {employees.map(employee => (
                  <label 
                    key={employee.id} 
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-blue-100 cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      checked={newMeeting.attendees.includes(employee.id)} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewMeeting({
                            ...newMeeting, 
                            attendees: [...newMeeting.attendees, employee.id]
                          })
                        } else {
                          setNewMeeting({
                            ...newMeeting, 
                            attendees: newMeeting.attendees.filter(id => id !== employee.id)
                          })
                        }
                      }} 
                      className="w-4 h-4" 
                    />
                    <span className="text-sm">{employee.name.split(' ')[0]}</span>
                  </label>
                ))}
              </div>
              {newMeeting.attendees.length === 0 && (
                <p className="text-sm text-red-600">Please select at least one team member</p>
              )}
            </div>

            {/* Status */}
            <select 
              value={newMeeting.status} 
              onChange={(e) => setNewMeeting({...newMeeting, status: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Notes */}
            <textarea 
              placeholder="Meeting Notes (Optional)" 
              value={newMeeting.notes} 
              onChange={(e) => setNewMeeting({...newMeeting, notes: e.target.value})} 
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 h-20" 
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => { 
                setShowMeetingForm(false); 
                setEditingMeeting(null); 
                resetForm();
              }} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              onClick={editingMeeting ? handleEditMeeting : handleAddMeeting} 
              disabled={loading || newMeeting.attendees.length === 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold ${
                loading || newMeeting.attendees.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : editingMeeting ? 'Update Meeting' : 'Create Meeting'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Meetings</p>
          <p className="text-3xl font-black text-blue-700">{stats.totalMeetings}</p>
          <p className="text-xs text-blue-600 mt-1">All scheduled</p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-3xl font-black text-green-700">{stats.thisMonthMeetings}</p>
          <p className="text-xs text-green-600 mt-1">{currentMonth.toLocaleDateString('en-US', { month: 'long' })}</p>
        </div>
        <div className="bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">With Clients</p>
          <p className="text-3xl font-black text-orange-700">{stats.clientMeetings}</p>
          <p className="text-xs text-orange-600 mt-1">Client meetings</p>
        </div>
        <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Linked to Jobs</p>
          <p className="text-3xl font-black text-purple-700">{stats.jobMeetings}</p>
          <p className="text-xs text-purple-600 mt-1">Job-related</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search meetings by title, client name, job ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground mb-2 block">Meeting Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {meetingTypes.map(type => (
              <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid & Meetings List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-card border rounded-lg p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <button onClick={previousMonth} className="p-1 hover:bg-muted rounded">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-lg">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-xs text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dateStr = day ? formatDate(day) : ''
              const dayMeetings = dateStr ? meetings.filter(m => m.date === dateStr) : []
              const isToday = day && dateStr === new Date().toISOString().split('T')[0]
              const isSelected = day && dateStr === selectedDate

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (day) setSelectedDate(dateStr)
                  }}
                  disabled={!day}
                  className={`aspect-square p-2 rounded text-sm font-semibold transition-colors relative ${
                    !day ? 'text-muted-foreground/30' :
                    isSelected ? 'bg-blue-600 text-white' :
                    isToday ? 'bg-green-100 text-green-700 border border-green-300' :
                    dayMeetings.length > 0 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    'hover:bg-muted text-foreground'
                  }`}
                >
                  {day}
                  {dayMeetings.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayMeetings.slice(0, 3).map((_, i) => (
                        <div key={i} className="h-1 w-1 bg-current rounded-full"></div>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Meetings List for Selected Date */}
        <div className="bg-card border rounded-lg p-4 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Meetings - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>

          {filteredMeetings.filter(m => m.date === selectedDate).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No meetings scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeetings
                .filter(m => m.date === selectedDate)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((meeting) => (
                <div key={meeting.id} className={`border rounded-lg p-4 transition-all ${viewingMeeting === meeting.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-muted/30'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{meeting.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {meeting.time} ({meeting.duration})
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getMeetingTypeColor(meeting.type)}`}>
                          {meeting.type}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewMeeting(meeting.id)} 
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors" 
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openEditMeeting(meeting)} 
                        className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMeeting(meeting.id)} 
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {meeting.attendeeNames?.slice(0, 3).join(', ')}
                      {meeting.attendeeNames && meeting.attendeeNames.length > 3 ? ` +${meeting.attendeeNames.length - 3} more` : ''}
                    </span>
                  </div>

                  {/* Cost & Vehicle Display */}
                  <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    {meeting.cost > 0 && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                        <DollarSign className="h-3 w-3" />
                        AED {meeting.cost}
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      <Truck className="h-3 w-3" />
                      {meeting.vehicle}
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <CheckCircle className="h-3 w-3" />
                      {meeting.status}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {meeting.linkedJob && (
                      <div className="flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        <Briefcase className="h-3 w-3" />
                        Job: {meeting.linkedJob}
                      </div>
                    )}
                    {meeting.linkedClient && (
                      <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        <Users className="h-3 w-3" />
                        {meeting.linkedClient}
                      </div>
                    )}
                  </div>

                  {/* Expanded View */}
                  {viewingMeeting === meeting.id && (
                    <div className="pt-3 border-t space-y-2 text-sm">
                      {meeting.notes && (
                        <div>
                          <p className="font-bold text-muted-foreground">Notes:</p>
                          <p className="text-gray-700">{meeting.notes}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="font-bold text-muted-foreground">Status:</p>
                          <p className="text-gray-700">{meeting.status}</p>
                        </div>
                        <div>
                          <p className="font-bold text-muted-foreground">Created:</p>
                          <p className="text-gray-700">{new Date(meeting.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-bold text-muted-foreground">Last Updated:</p>
                          <p className="text-gray-700">{new Date(meeting.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-bold text-muted-foreground">Agenda:</p>
                          <p className="text-gray-700">{meeting.agendaAI}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-muted-foreground mb-1">All Attendees:</p>
                        <div className="flex flex-wrap gap-1">
                          {meeting.attendeeNames?.map((name, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
     
    </div>
  )
}