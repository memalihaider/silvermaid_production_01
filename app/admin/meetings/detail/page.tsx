'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  ArrowLeft, 
  Edit2, 
  Share2, 
  Download, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  FileText, 
  Eye, 
  Save, 
  MessageSquare, 
  Link as LinkIcon, 
  Trash2, 
  Plus,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter, useSearchParams } from 'next/navigation'

// Firebase Interfaces
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

interface FirebaseEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  status: string;
}

export default function MeetingDetail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const meetingId = searchParams?.get('id')
  
  const [selectedTab, setSelectedTab] = useState<'details' | 'agenda' | 'notes' | 'summary'>('details')
  const [isEditing, setIsEditing] = useState(false)
  const [meetingNotes, setMeetingNotes] = useState('')
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [newDecision, setNewDecision] = useState({ title: '', description: '', linkedItems: '' })
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'>('all')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [activeFilteredMeetings, setActiveFilteredMeetings] = useState<FirebaseMeeting[]>([])

  // Real Data States
  const [meetings, setMeetings] = useState<FirebaseMeeting[]>([])
  const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<FirebaseMeeting | null>(null)
  const [pendingMeetings, setPendingMeetings] = useState<FirebaseMeeting[]>([])
  const [inProgressMeetings, setInProgressMeetings] = useState<FirebaseMeeting[]>([])

  // Fetch all data from Firebase
  useEffect(() => {
    fetchEmployees()
    fetchMeetings()
  }, [])

  // When meetings are loaded, select the first one or by ID
  useEffect(() => {
    if (meetings.length > 0) {
      if (meetingId) {
        const foundMeeting = meetings.find(m => m.id === meetingId)
        if (foundMeeting) {
          setSelectedMeeting(foundMeeting)
          // Single date filter for entire page
          setSelectedDate(foundMeeting.date)
        } else {
          setSelectedMeeting(meetings[0])
          setSelectedDate(meetings[0].date)
        }
      } else {
        setSelectedMeeting(meetings[0])
        setSelectedDate(meetings[0].date)
      }
      
      // Set pending and in-progress meetings
      setPendingMeetings(meetings.filter(m => m.status === 'Scheduled'))
      setInProgressMeetings(meetings.filter(m => m.status === 'In Progress'))
      
      // Set meeting notes if available
      if (selectedMeeting?.notes) {
        setMeetingNotes(selectedMeeting.notes)
      }
    }
  }, [meetings, meetingId, selectedMeeting?.notes])

  const fetchEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees')
      const snapshot = await getDocs(employeesRef)
      
      const employeesList: FirebaseEmployee[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        employeesList.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || '',
          role: data.role || '',
          status: data.status || ''
        })
      })
      
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchMeetings = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  // Single date filter for entire page
  const handleDateFilter = () => {
    if (!selectedDate) {
      // If no date selected, reset to all meetings
      if (meetings.length > 0) {
        setSelectedMeeting(meetings[0])
      }
      setActiveFilteredMeetings(filteredMeetings)
      return
    }

    console.log('Filtering for date:', selectedDate)
    
    // Filter meetings for selected date
    const meetingsForDate = meetings.filter(meeting => meeting.date === selectedDate)
    console.log('Found meetings:', meetingsForDate.length)
    
    if (meetingsForDate.length > 0) {
      // Select the first meeting for the date
      setSelectedMeeting(meetingsForDate[0])
      setActiveFilteredMeetings(meetingsForDate)
    } else {
      // No meetings found for this date
      alert(`No meetings found for date: ${selectedDate}`)
      // Keep the current selected meeting or select first meeting
      if (meetings.length > 0) {
        setSelectedMeeting(meetings[0])
        setSelectedDate('') // Clear the date filter
        setActiveFilteredMeetings(meetings)
      }
    }
  }

  // Handle status filter
  const handleStatusFilter = () => {
    if (filterStatus === 'all') {
      // Reset to all meetings
      if (meetings.length > 0) {
        setSelectedMeeting(meetings[0])
      }
      setActiveFilteredMeetings(meetings)
      return
    }

    console.log('Filtering for status:', filterStatus)
    
    // Filter meetings for selected status
    const meetingsForStatus = meetings.filter(meeting => meeting.status === filterStatus)
    console.log('Found meetings:', meetingsForStatus.length)
    
    if (meetingsForStatus.length > 0) {
      // Select the first meeting for the status
      setSelectedMeeting(meetingsForStatus[0])
      setActiveFilteredMeetings(meetingsForStatus)
    } else {
      // No meetings found for this status
      alert(`No meetings found with status: ${filterStatus}`)
      // Keep the current selected meeting or select first meeting
      if (meetings.length > 0) {
        setSelectedMeeting(meetings[0])
        setActiveFilteredMeetings(meetings)
      }
    }
  }

  // Get attendees with details
  const getAttendeesWithDetails = () => {
    if (!selectedMeeting) return []
    
    return selectedMeeting.attendeeNames.map((name, index) => {
      const employee = employees.find(emp => emp.name === name)
      return {
        name: name,
        role: employee?.position || 'Team Member',
        status: 'Accepted',
        accountability: index === 0 ? 'Lead' : 'Participant'
      }
    })
  }

  // Get AI Agenda items for selected meeting
  const getAIAgenda = () => {
    if (!selectedMeeting) return []
    
    const baseAgenda = [
      { item: 'Opening and introductions', timeAllocated: '5 mins', owner: selectedMeeting.attendeeNames[0] || 'Host' },
      { item: 'Agenda review and objectives', timeAllocated: '5 mins', owner: selectedMeeting.attendeeNames[0] || 'Host' }
    ]
    
    if (selectedMeeting.linkedJob) {
      baseAgenda.push({ 
        item: `Review: ${selectedMeeting.linkedJob}`, 
        timeAllocated: '10 mins', 
        owner: selectedMeeting.attendeeNames[0] || 'Host' 
      })
    }
    
    if (selectedMeeting.linkedClient) {
      baseAgenda.push({ 
        item: `Client discussion: ${selectedMeeting.linkedClient}`, 
        timeAllocated: '10 mins', 
        owner: selectedMeeting.attendeeNames[0] || 'Host' 
      })
    }
    
    baseAgenda.push({ 
      item: 'Action items and next steps', 
      timeAllocated: '5 mins', 
      owner: selectedMeeting.attendeeNames[0] || 'Host' 
    })
    
    return baseAgenda
  }

  // Get accountability tracking info
  const getAccountabilityInfo = () => {
    if (!selectedMeeting) return {
      createdBy: 'Admin',
      createdDate: selectedMeeting?.createdAt?.split('T')[0] || 'N/A',
      owner: selectedMeeting?.attendeeNames[0] || 'Host',
      stakeholders: selectedMeeting?.attendeeNames || []
    }
    
    return {
      createdBy: 'Admin',
      createdDate: selectedMeeting.createdAt?.split('T')[0] || 'N/A',
      owner: selectedMeeting.attendeeNames[0] || 'Host',
      stakeholders: selectedMeeting.attendeeNames.slice(1) || []
    }
  }

  // Handle back to calendar
  const handleBack = () => {
    router.push('/admin/meeting-calendar')
  }

  // Filter meetings based on selected date and status
  const filteredMeetings = useMemo(() => {
    let result = meetings
    
    // Apply date filter
    if (selectedDate) {
      result = result.filter(meeting => meeting.date === selectedDate)
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(meeting => meeting.status === filterStatus)
    }
    
    return result
  }, [meetings, selectedDate, filterStatus])

  // Select a meeting from the list
  const handleSelectMeeting = (meeting: FirebaseMeeting) => {
    setSelectedMeeting(meeting)
    if (meeting.notes) {
      setMeetingNotes(meeting.notes)
    }
    // Update date filter to match selected meeting
    setSelectedDate(meeting.date)
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedDate('')
    setFilterStatus('all')
    if (meetings.length > 0) {
      setSelectedMeeting(meetings[0])
    }
    setActiveFilteredMeetings(meetings)
  }

  // Get meetings for selected date
  const getMeetingsForSelectedDate = () => {
    if (!selectedDate) return meetings
    return meetings.filter(meeting => meeting.date === selectedDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading meeting details...</p>
        </div>
      </div>
    )
  }

  if (!selectedMeeting && meetings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black">Meeting Details</h1>
              <p className="text-muted-foreground mt-1">No meetings found</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No meetings scheduled yet</p>
          <button 
            onClick={() => router.push('/admin/meeting-calendar')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule a Meeting
          </button>
        </div>
      </div>
    )
  }

  if (!selectedMeeting) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black">{selectedMeeting.title}</h1>
            <p className="text-muted-foreground mt-1">
              {selectedMeeting.type} • {selectedMeeting.date} • {selectedMeeting.time} • 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedMeeting.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                selectedMeeting.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                selectedMeeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                selectedMeeting.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {selectedMeeting.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Main Date and Status Filters - SINGLE FILTER FOR ENTIRE PAGE */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Filter Meetings</h3>
          <button 
            onClick={clearFilters}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Single Date Filter for Entire Page */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Filter by Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleDateFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
            {selectedDate && (
              <p className="text-xs text-green-600 mt-1">
                Showing meetings for: {selectedDate}
                {filteredMeetings.length > 0 && ` (${filteredMeetings.length} meetings)`}
              </p>
            )}
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Filter by Status</label>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any)
                  // Auto apply filter when status changes
                  setTimeout(() => {
                    handleStatusFilter()
                  }, 100)
                }}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
            {filterStatus !== 'all' && (
              <p className="text-xs text-green-600 mt-1">
                Showing: {filterStatus} meetings
                {filteredMeetings.length > 0 && ` (${filteredMeetings.length} meetings)`}
              </p>
            )}
          </div>
          
          {/* Quick Select */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Quick Select Meeting</label>
            <select
              value={selectedMeeting.id}
              onChange={(e) => {
                const meeting = filteredMeetings.find(m => m.id === e.target.value)
                if (meeting) handleSelectMeeting(meeting)
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map(meeting => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.date} - {meeting.title} ({meeting.status})
                  </option>
                ))
              ) : (
                <option value="">No meetings match filters</option>
              )}
            </select>
            {filteredMeetings.length === 0 && meetings.length > 0 && (
              <p className="text-xs text-red-600 mt-1">
                No meetings match current filters
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meeting Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Meetings</p>
          <p className="text-3xl font-black text-blue-700">{meetings.length}</p>
          <p className="text-xs text-blue-600 mt-1">All meetings</p>
        </div>
        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Pending (Scheduled)</p>
          <p className="text-3xl font-black text-yellow-700">{pendingMeetings.length}</p>
          <p className="text-xs text-yellow-600 mt-1">Awaiting</p>
        </div>
        <div className="bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-3xl font-black text-orange-700">{inProgressMeetings.length}</p>
          <p className="text-xs text-orange-600 mt-1">Ongoing</p>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-black text-green-700">
            {meetings.filter(m => m.status === 'Completed').length}
          </p>
          <p className="text-xs text-green-600 mt-1">Finished</p>
        </div>
      </div>

      {/* Show filtered meetings count */}
      {(selectedDate || filterStatus !== 'all') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-yellow-900">Active Filters Applied</p>
              <div className="flex gap-2 mt-1">
                {selectedDate && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    Date: {selectedDate}
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Status: {filterStatus}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-yellow-900">
                {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} found
              </p>
              <button 
                onClick={clearFilters}
                className="text-xs text-yellow-700 hover:text-yellow-900 mt-1"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('details')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            selectedTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setSelectedTab('agenda')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            selectedTab === 'agenda'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="h-4 w-4" />
          AI Agenda
        </button>
        <button
          onClick={() => setSelectedTab('summary')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            selectedTab === 'summary'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          AI Summary
        </button>
      </div>

      {/* DETAILS TAB - Uses Global Date Filter */}
      {selectedTab === 'details' && (
        <div className="space-y-6">
          {/* Info about current filter */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900">
                    Showing Details for: {selectedDate}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    This section shows details for meetings on the selected date. 
                    Currently viewing: <strong>{selectedMeeting.title}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Info */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Meeting Information</h3>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {selectedMeeting.date}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-bold">{selectedMeeting.date} at {selectedMeeting.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-bold">{selectedMeeting.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-bold">{selectedMeeting.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="font-bold">{selectedMeeting.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Vehicle</p>
                    <p className="font-bold">{selectedMeeting.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost</p>
                    <p className="font-bold">AED {selectedMeeting.cost || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Meeting Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedMeeting.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                    selectedMeeting.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    selectedMeeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    selectedMeeting.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedMeeting.status}
                  </span>
                </div>
              </div>

              {/* Cross-Linked Resources */}
              {(selectedMeeting.linkedJob || selectedMeeting.linkedClient) && (
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h3 className="font-bold">Cross-Linked Resources</h3>
                  <div className="space-y-3">
                    {selectedMeeting.linkedJob && (
                      <div className="p-3 border rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer">
                        <p className="text-xs text-muted-foreground mb-1">Linked Job</p>
                        <p className="font-bold">{selectedMeeting.linkedJob}</p>
                        <p className="text-xs text-pink-600 mt-1">Status: Active</p>
                      </div>
                    )}
                    {selectedMeeting.linkedClient && (
                      <div className="p-3 border rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                        <p className="text-xs text-muted-foreground mb-1">Linked Client</p>
                        <p className="font-bold">{selectedMeeting.linkedClient}</p>
                        <p className="text-xs text-orange-600 mt-1">Status: Active</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendees & Accountability
                </h3>
                <div className="space-y-3">
                  {getAttendeesWithDetails().map((attendee, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground">{attendee.role}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            attendee.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {attendee.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{attendee.accountability}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Accountability Tracking */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Accountability Tracking
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Created By</p>
                    <p className="font-bold text-sm">{getAccountabilityInfo().createdBy}</p>
                    <p className="text-xs text-muted-foreground mt-1">{getAccountabilityInfo().createdDate}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Meeting Owner</p>
                    <p className="font-bold text-sm">{getAccountabilityInfo().owner}</p>
                    <p className="text-xs text-muted-foreground mt-1">Responsible for outcomes</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Stakeholders</p>
                    <div className="space-y-1 mt-1">
                      {getAccountabilityInfo().stakeholders.map((stakeholder, idx) => (
                        <p key={idx} className="text-sm font-semibold">{stakeholder}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-bold mb-3">Meeting Timeline</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-bold">{new Date(selectedMeeting.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-bold">{new Date(selectedMeeting.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Date</p>
                    <p className="text-sm font-bold">{selectedMeeting.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI AGENDA TAB - Uses Global Date Filter */}
      {selectedTab === 'agenda' && (
        <div className="space-y-4">
          {/* Info about current filter */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900">
                    Showing AI Agenda for: {selectedDate}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    This section shows AI-generated agenda for meetings on the selected date. 
                    Currently viewing: <strong>{selectedMeeting.title}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">AI-Generated Agenda</p>
              <p className="text-sm text-blue-800 mt-1">
                {selectedMeeting.agendaAI === 'Auto-generated' 
                  ? `This agenda was automatically created for meeting on ${selectedMeeting.date}.`
                  : selectedMeeting.agendaAI}
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Meeting Agenda</h3>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {selectedMeeting.date} • {selectedMeeting.time}
              </span>
            </div>
            <div className="space-y-3">
              {getAIAgenda().map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold">{idx + 1}. {item.item}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timeAllocated}
                        </span>
                        <span>Owner: {item.owner}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Total Meeting Time: {selectedMeeting.duration}</p>
              <p className="text-xs text-muted-foreground mt-1">Meeting Date: {selectedMeeting.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI SUMMARY TAB - Uses Global Date Filter */}
      {selectedTab === 'summary' && (
        <div className="space-y-4">
          {/* Info about current filter */}
          {selectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-900">
                    Showing AI Summary for: {selectedDate}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    This section shows AI-generated summary for meetings on the selected date. 
                    Currently viewing: <strong>{selectedMeeting.title}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
            <Eye className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-900">AI Meeting Summary</p>
              <p className="text-sm text-purple-800 mt-1">
                {selectedMeeting.summary === 'Pending' 
                  ? `Post-meeting AI summary for meeting on ${selectedMeeting.date}.`
                  : selectedMeeting.summary}
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            

            <div className="p-4 border rounded-lg bg-green-50">
              <p className="text-sm font-bold text-green-900 mb-2">Key Decisions from Meeting</p>
              <div className="space-y-2">
                {selectedMeeting.decisions && selectedMeeting.decisions.length > 0 ? (
                  selectedMeeting.decisions.map((decision, idx) => (
                    <p key={idx} className="text-sm text-green-800">✓ {decision}</p>
                  ))
                ) : (
                  <p className="text-sm text-green-800">No decisions recorded yet</p>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50">
              <p className="text-sm font-bold text-blue-900 mb-2">Meeting Analytics</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-800 mb-1">Attendees</p>
                  <p className="font-bold text-blue-900">{selectedMeeting.attendeeNames.length}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 mb-1">Duration</p>
                  <p className="font-bold text-blue-900">{selectedMeeting.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 mb-1">Status</p>
                  <p className="font-bold text-blue-900">{selectedMeeting.status}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-800 mb-1">Cost</p>
                  <p className="font-bold text-blue-900">AED {selectedMeeting.cost}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access to Other Meetings */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-bold mb-4">
          {selectedDate ? `Meetings on ${selectedDate}` : 'All Meetings'}
          {selectedDate && filteredMeetings.length > 0 && ` (${filteredMeetings.length} found)`}
        </h3>
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No meetings match your filters</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeetings.slice(0, 6).map(meeting => (
              <button
                key={meeting.id}
                onClick={() => handleSelectMeeting(meeting)}
                className={`p-4 border rounded-lg transition-colors text-left ${
                  selectedMeeting.id === meeting.id 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <p className="font-bold truncate">{meeting.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{meeting.date} • {meeting.time}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    meeting.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                    meeting.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    meeting.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {meeting.status}
                  </span>
                  <span className="text-xs text-gray-600">{meeting.type}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}