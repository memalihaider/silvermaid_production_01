'use client'

import { useState, useMemo, useEffect } from 'react'
import { CheckCircle, AlertCircle, Clock, Users, Briefcase, TrendingUp, Filter, Search, Archive, Zap, Plus, Link as LinkIcon, Eye, Edit2, Trash2, ArrowRight, X, Calendar, FileText, ClipboardList, Target } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase' // Aapka Firebase config file

export default function FollowUpTracker() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterOwner, setFilterOwner] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'active' | 'timeline' | 'accountability'>('active')
  const [showForm, setShowForm] = useState(false)
  
  // Real data states
  const [meetings, setMeetings] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [decisions, setDecisions] = useState<any[]>([])
  const [actionItems, setActionItems] = useState<any[]>([])
  const [todayDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format

  const [newItem, setNewItem] = useState({
    item: '',
    owner: '',
    dueDate: '',
    status: 'pending' as const,
    linkedJob: '',
    priority: 'Medium',
    notes: ''
  })

  // Fetch today's data from Firebase
  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        // Get today's meetings
        const meetingsQuery = query(
          collection(db, 'meetingCalender'),
          where('date', '==', todayDate)
        )
        const meetingsSnapshot = await getDocs(meetingsQuery)
        const todayMeetings = meetingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setMeetings(todayMeetings)

        // Get today's notes
        const notesQuery = query(
          collection(db, 'notes'),
          where('meetingDate', '==', todayDate)
        )
        const notesSnapshot = await getDocs(notesQuery)
        const todayNotes = notesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setNotes(todayNotes)

        // Get today's decisions
        const decisionsQuery = query(
          collection(db, 'decisions'),
          where('createdAt', '>=', `${todayDate}T00:00:00.000Z`),
          where('createdAt', '<=', `${todayDate}T23:59:59.999Z`)
        )
        const decisionsSnapshot = await getDocs(decisionsQuery)
        const todayDecisions = decisionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setDecisions(todayDecisions)

        // Get today's action items
        const actionsQuery = query(
          collection(db, 'actionItems'),
          where('createdAt', '>=', `${todayDate}T00:00:00.000Z`),
          where('createdAt', '<=', `${todayDate}T23:59:59.999Z`)
        )
        const actionsSnapshot = await getDocs(actionsQuery)
        const todayActions = actionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setActionItems(todayActions)

      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchTodayData()
  }, [todayDate])

  // Combine all data for display
  const allFollowUps = useMemo(() => {
    const combined = [
      // Convert meetings to follow-up format
      ...meetings.map(meeting => ({
        id: `meeting_${meeting.id}`,
        type: 'meeting',
        title: meeting.title || 'Meeting',
        description: meeting.summary || meeting.agendaAI || 'Auto-generated meeting',
        owner: meeting.organizer || meeting.createdByName || 'Unknown',
        date: meeting.date || todayDate,
        time: meeting.time || '00:00',
        status: meeting.status || 'Scheduled',
        priority: meeting.priority || 'Medium',
        location: meeting.location || '',
        duration: meeting.duration || '',
        attendees: meeting.attendeeNames || [],
        cost: meeting.cost || 0,
        linkedClient: meeting.linkedClient || '',
        linkedJob: meeting.linkedJob || ''
      })),

      // Convert notes to follow-up format
      ...notes.map(note => ({
        id: `note_${note.id}`,
        type: 'note',
        title: note.meetingTitle || 'Meeting Notes',
        description: note.notes || 'No notes content',
        owner: note.createdByName || 'Unknown',
        date: note.meetingDate || todayDate,
        time: note.meetingTime || '00:00',
        status: 'Completed',
        priority: 'Medium',
        meetingId: note.meetingId || ''
      })),

      // Convert decisions to follow-up format
      ...decisions.map(decision => ({
        id: `decision_${decision.id}`,
        type: 'decision',
        title: decision.title || 'Decision',
        description: decision.description || 'No description',
        owner: decision.createdByName || 'Unknown',
        date: decision.dueDate || todayDate,
        status: decision.status || 'Pending',
        priority: decision.priority || 'Medium',
        linkedItems: decision.linkedItems || []
      })),

      // Convert action items to follow-up format
      ...actionItems.map(action => ({
        id: `action_${action.id}`,
        type: 'action',
        title: action.title || 'Action Item',
        description: action.description || 'No description',
        owner: action.createdByName || action.owner || 'Unknown',
        date: action.dueDate || todayDate,
        status: action.status || 'pending',
        priority: action.priority || 'Medium',
        linkedJob: action.linkedJob || '',
        progressPercent: action.status === 'completed' ? 100 : 
                        action.status === 'in-progress' ? 50 : 0
      }))
    ]

    return combined
  }, [meetings, notes, decisions, actionItems, todayDate])

  // Filtering logic
  const filteredItems = useMemo(() => {
    return allFollowUps.filter(item => {
      const statusMatch = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase()
      const ownerMatch = filterOwner === 'all' || item.owner === filterOwner
      const priorityMatch = filterPriority === 'all' || item.priority === filterPriority
      const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.linkedJob && item.linkedJob.toLowerCase().includes(searchTerm.toLowerCase()))
      return statusMatch && ownerMatch && priorityMatch && searchMatch
    })
  }, [allFollowUps, filterStatus, filterOwner, filterPriority, searchTerm])

  // Statistics
  const stats = useMemo(() => {
    const total = allFollowUps.length
    const completed = allFollowUps.filter(i => i.status.toLowerCase() === 'completed' || i.status.toLowerCase() === 'implemented').length
    const inProgress = allFollowUps.filter(i => i.status.toLowerCase() === 'in-progress').length
    const pending = allFollowUps.filter(i => i.status.toLowerCase() === 'pending').length
    
    return {
      total,
      completed,
      inProgress,
      pending,
      meetings: meetings.length,
      notes: notes.length,
      decisions: decisions.length,
      actions: actionItems.length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [allFollowUps, meetings, notes, decisions, actionItems])

  // Get unique owners for filter
  const owners = ['all', ...Array.from(new Set(allFollowUps.map(i => i.owner))).filter(Boolean)]
  const statuses = ['all', 'pending', 'in-progress', 'completed', 'scheduled', 'implemented']
  const priorities = ['all', 'High', 'Medium', 'Low']

  // Helper functions
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'completed':
      case 'implemented':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'scheduled':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-orange-100 text-orange-700'
      case 'Low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'decision': return <ClipboardList className="h-4 w-4" />
      case 'action': return <Target className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'note': return 'bg-green-50 text-green-600 border-green-200'
      case 'decision': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'action': return 'bg-orange-50 text-orange-600 border-orange-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Follow-Up Tracker</h1>
          <p className="text-muted-foreground mt-1">Today's Meetings, Notes, Decisions & Actions - {todayDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Items</p>
          <p className="text-2xl font-black text-blue-700">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Meetings</p>
          <p className="text-2xl font-black text-green-700">{stats.meetings}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-2xl font-black text-purple-700">{stats.notes}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Decisions</p>
          <p className="text-2xl font-black text-orange-700">{stats.decisions}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Actions</p>
          <p className="text-2xl font-black text-red-700">{stats.actions}</p>
        </div>
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-black text-green-800">{stats.completed}</p>
        </div>
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-black text-blue-800">{stats.inProgress}</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-black text-yellow-800">{stats.pending}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['active', 'timeline', 'accountability'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors capitalize flex items-center gap-2 ${
              selectedTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'active' && <CheckCircle className="h-4 w-4" />}
            {tab === 'timeline' && <Clock className="h-4 w-4" />}
            {tab === 'accountability' && <Users className="h-4 w-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items, descriptions, jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priority' : priority}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Owner</label>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {owners.map(owner => (
                <option key={owner} value={owner}>
                  {owner === 'all' ? 'All Owners' : owner}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Type</label>
            <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="note">Notes</option>
              <option value="decision">Decisions</option>
              <option value="action">Actions</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE TAB - All Items List */}
      {selectedTab === 'active' && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600">No items found for today</h3>
              <p className="text-gray-500 mt-2">No meetings, notes, decisions or actions scheduled for {todayDate}</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getTypeColor(item.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(item.type)}
                      <p className="font-bold text-lg">{item.title}</p>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getTypeColor(item.type)}`}>
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-sm">
                    <p className="text-xs text-gray-500 mb-1">Owner</p>
                    <p className="font-semibold">{item.owner}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                    <p className="font-semibold">
                      {item.date} {item.time && `at ${item.time}`}
                    </p>
                  </div>
                  {item.linkedJob && (
                    <div className="text-sm">
                      <p className="text-xs text-gray-500 mb-1">Linked Job</p>
                      <p className="font-semibold text-blue-600">{item.linkedJob}</p>
                    </div>
                  )}
                  {item.location && (
                    <div className="text-sm">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold">{item.location}</p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.attendees && item.attendees.length > 0 && (
                    <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <Users className="h-3 w-3" />
                      {item.attendees.length} attendees
                    </div>
                  )}
                  {item.duration && (
                    <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <Clock className="h-3 w-3" />
                      {item.duration}
                    </div>
                  )}
                  {item.cost && item.cost > 0 && (
                    <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      AED {item.cost}
                    </div>
                  )}
                </div>

                {/* Progress Bar for Actions */}
                {item.type === 'action' && item.progressPercent !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Progress</p>
                      <p className="text-xs font-bold">{item.progressPercent}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-green-600' :
                          item.status === 'in-progress' ? 'bg-blue-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${item.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TIMELINE TAB - Chronological View */}
      {selectedTab === 'timeline' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Timeline - {todayDate}
            </h3>
            
            {/* Sort by time */}
            {filteredItems
              .filter(item => item.time)
              .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
              .map((item, index) => (
                <div key={item.id} className="mb-4 pb-4 border-b last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-700 rounded-lg p-3 text-center min-w-20">
                      <p className="font-bold text-lg">{item.time || 'N/A'}</p>
                      <p className="text-xs">Time</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <p className="font-bold">{item.title}</p>
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs text-gray-500">Owner: {item.owner}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Summary by Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-bold mb-3">By Type Summary</h4>
              <div className="space-y-2">
                {['meeting', 'note', 'decision', 'action'].map(type => {
                  const count = filteredItems.filter(item => item.type === type).length
                  if (count === 0) return null
                  return (
                    <div key={type} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-bold mb-3">By Status Summary</h4>
              <div className="space-y-2">
                {['pending', 'in-progress', 'completed', 'scheduled'].map(status => {
                  const count = filteredItems.filter(item => 
                    item.status.toLowerCase() === status.toLowerCase()
                  ).length
                  if (count === 0) return null
                  return (
                    <div key={status} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(status).split(' ')[0]}`}></span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="font-bold">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNTABILITY TAB - By Owner */}
      {selectedTab === 'accountability' && (
        <div className="space-y-3">
          {owners.filter(owner => owner !== 'all').map(owner => {
            const ownerItems = filteredItems.filter(item => item.owner === owner)
            if (ownerItems.length === 0) return null
            
            const completed = ownerItems.filter(item => 
              item.status.toLowerCase() === 'completed' || 
              item.status.toLowerCase() === 'implemented'
            ).length
            const total = ownerItems.length
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
            
            return (
              <div key={owner} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{owner}</p>
                    <p className="text-sm text-gray-500">{ownerItems.length} items total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">{completionRate}%</p>
                    <p className="text-xs text-gray-500">{completed}/{total} completed</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="h-3 rounded-full bg-green-600 transition-all"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>

                <div className="space-y-2">
                  {ownerItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <p className="font-semibold">{item.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.type.toUpperCase()} • Due: {item.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">Today's Follow-Up Summary - {todayDate}</p>
            <p className="text-sm text-blue-800 mt-1">
              Showing {stats.total} total items: {stats.meetings} meetings, {stats.notes} notes, 
              {' '}{stats.decisions} decisions, and {stats.actions} action items. 
              Overall completion rate: {stats.completionRate}%
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Data fetched from Firebase collections: meetingCalender, notes, decisions, actionItems
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}