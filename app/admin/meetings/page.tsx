'use client'

import { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ListChecks,
  Video,
  FileText,
  User,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  Download
} from 'lucide-react'
import { MOCK_MEETINGS, TEAM_MEMBERS, CLIENTS, Meeting, MeetingNote, Decision, FollowUp, Attendee } from '@/lib/meetings-data'

export default function UnifiedMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    type: 'Team Standup' as Meeting['type'],
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    organizer: TEAM_MEMBERS[0].name,
    attendees: [] as string[],
    meetingLink: '',
    linkedJob: '',
    linkedClient: '',
    agenda: '',
    costAllocated: 0
  })

  const [newNote, setNewNote] = useState('')
  const [newDecision, setNewDecision] = useState('')
  const [newFollowUp, setNewFollowUp] = useState({
    task: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  })

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || m.type === filterType
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [meetings, searchTerm, filterType, filterStatus])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const scheduled = meetings.filter(m => m.status === 'Scheduled').length
    const completed = meetings.filter(m => m.status === 'Completed').length
    const upcoming = meetings.filter(m => m.date >= today && m.status === 'Scheduled').length
    const totalAttendees = meetings.reduce((sum, m) => sum + m.attendees.length, 0)
    const totalDecisions = meetings.reduce((sum, m) => sum + m.decisions.length, 0)
    const openFollowUps = meetings.reduce((sum, m) => sum + m.followUps.filter(f => f.status !== 'Completed').length, 0)

    return { scheduled, completed, upcoming, totalAttendees, totalDecisions, openFollowUps }
  }, [meetings])

  const myMeetings = useMemo(() => {
    const userEmail = 'ahmed@silvermaid.ae'
    return meetings.filter(m => 
      m.organizer.toLowerCase().includes('ahmed') || 
      m.attendees.some(a => a.email === userEmail)
    )
  }, [meetings])

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.startTime) {
      alert('Please fill in required fields')
      return
    }

    const attendeeObjs = newMeeting.attendees.map(name => {
      const found = TEAM_MEMBERS.find(tm => tm.name === name)
      return {
        id: found?.id || `temp-${Date.now()}`,
        name: name,
        role: found?.role || 'Team Member',
        email: found?.email || `${name.toLowerCase().replace(/\s/g, '.')}@silvermaid.ae`,
        status: 'Pending' as const
      }
    })

    const meeting: Meeting = {
      id: `MTG${Date.now()}`,
      ...newMeeting,
      attendees: attendeeObjs,
      status: 'Scheduled',
      notes: [],
      decisions: [],
      followUps: [],
      duration: Math.ceil((new Date(`2000-01-01T${newMeeting.endTime}`).getTime() - new Date(`2000-01-01T${newMeeting.startTime}`).getTime()) / (1000 * 60)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setMeetings([...meetings, meeting])
    setNewMeeting({
      title: '',
      description: '',
      type: 'Team Standup',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      organizer: TEAM_MEMBERS[0].name,
      attendees: [],
      meetingLink: '',
      linkedJob: '',
      linkedClient: '',
      agenda: '',
      costAllocated: 0
    })
    setShowAddModal(false)
    alert('Meeting created successfully!')
  }

  const handleAddNote = (noteType: 'Note' | 'Action Item' | 'Decision' = 'Note') => {
    if (!selectedMeeting || !newNote.trim()) return

    const note: MeetingNote = {
      id: `N${Date.now()}`,
      content: newNote,
      author: 'Ahmed Al-Mazrouei',
      timestamp: new Date().toISOString(),
      type: noteType
    }

    setMeetings(meetings.map(m => 
      m.id === selectedMeeting.id 
        ? { ...m, notes: [...m.notes, note], updatedAt: new Date().toISOString() }
        : m
    ))
    setSelectedMeeting({ ...selectedMeeting, notes: [...selectedMeeting.notes, note] })
    setNewNote('')
    alert('Note added successfully!')
  }

  const handleAddDecision = () => {
    if (!selectedMeeting || !newDecision.trim()) return

    const decision: Decision = {
      id: `D${Date.now()}`,
      description: newDecision,
      owner: 'Ahmed Al-Mazrouei',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Open'
    }

    setMeetings(meetings.map(m => 
      m.id === selectedMeeting.id 
        ? { ...m, decisions: [...m.decisions, decision], updatedAt: new Date().toISOString() }
        : m
    ))
    setSelectedMeeting({ ...selectedMeeting, decisions: [...selectedMeeting.decisions, decision] })
    setNewDecision('')
    alert('Decision recorded successfully!')
  }

  const handleAddFollowUp = () => {
    if (!selectedMeeting || !newFollowUp.task || !newFollowUp.assignedTo || !newFollowUp.dueDate) return

    const followUp: FollowUp = {
      id: `FU${Date.now()}`,
      task: newFollowUp.task,
      assignedTo: newFollowUp.assignedTo,
      dueDate: newFollowUp.dueDate,
      priority: newFollowUp.priority,
      status: 'Open',
      meetingId: selectedMeeting.id
    }

    setMeetings(meetings.map(m => 
      m.id === selectedMeeting.id 
        ? { ...m, followUps: [...m.followUps, followUp], updatedAt: new Date().toISOString() }
        : m
    ))
    setSelectedMeeting({ ...selectedMeeting, followUps: [...selectedMeeting.followUps, followUp] })
    setNewFollowUp({ task: '', assignedTo: '', dueDate: '', priority: 'Medium' })
    alert('Follow-up created successfully!')
  }

  const handleDeleteMeeting = (id: string) => {
    if (confirm('Delete this meeting?')) {
      setMeetings(meetings.filter(m => m.id !== id))
      if (selectedMeeting?.id === id) {
        setShowDetailsModal(false)
        setSelectedMeeting(null)
      }
    }
  }

  const handleUpdateMeetingStatus = (status: Meeting['status']) => {
    if (!selectedMeeting) return
    const updated = { ...selectedMeeting, status, updatedAt: new Date().toISOString() }
    setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updated : m))
    setSelectedMeeting(updated)
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-yellow-100 text-yellow-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Meetings & Collaboration</h1>
        <p className="text-sm text-muted-foreground mt-1">Unified meeting management with notes, decisions, and follow-ups</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Upcoming</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.upcoming}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Scheduled</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.scheduled}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Completed</p>
          <p className="text-2xl font-black text-green-600 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Attendees</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.totalAttendees}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Decisions</p>
          <p className="text-2xl font-black text-pink-600 mt-1">{stats.totalDecisions}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Open Follow-ups</p>
          <p className="text-2xl font-black text-cyan-600 mt-1">{stats.openFollowUps}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b bg-card rounded-t-2xl px-4 overflow-x-auto">
        {['overview', 'calendar', 'my-meetings', 'notes-decisions', 'follow-ups'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'calendar' && '📅 Calendar'}
            {tab === 'my-meetings' && '👤 My Meetings'}
            {tab === 'notes-decisions' && '📝 Notes & Decisions'}
            {tab === 'follow-ups' && '✅ Follow-ups'}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg"
      >
        <Plus className="h-4 w-4" />
        Schedule Meeting
      </button>

      {/* Search & Filters */}
      <div className="bg-card border rounded-2xl p-4 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-60 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search meetings by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
          >
            <option value="all">All Meeting Types</option>
            <option value="Team Standup">Team Standup</option>
            <option value="Client Meeting">Client Meeting</option>
            <option value="Project Review">Project Review</option>
            <option value="Board Meeting">Board Meeting</option>
            <option value="One-on-One">One-on-One</option>
            <option value="Training">Training</option>
            <option value="Planning">Planning</option>
            <option value="Retrospective">Retrospective</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <div key={meeting.id} className="bg-card border rounded-2xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black">{meeting.title}</h3>
                        <p className="text-xs text-muted-foreground">{meeting.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.attendees.length} attendees</span>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>

                    <div className="flex gap-2 flex-wrap text-xs">
                      {meeting.notes.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">📝 {meeting.notes.length} notes</span>
                      )}
                      {meeting.decisions.length > 0 && (
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">⭐ {meeting.decisions.length} decisions</span>
                      )}
                      {meeting.followUps.length > 0 && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">✅ {meeting.followUps.length} follow-ups</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowDetailsModal(true)
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No meetings found</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-card border rounded-2xl p-6">
          <div className="space-y-4">
            {meetings.filter(m => m.date >= new Date().toISOString().split('T')[0]).sort((a, b) => a.date.localeCompare(b.date)).map(meeting => (
              <div key={meeting.id} className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">{formatLongDate(meeting.date)} at {meeting.startTime}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowDetailsModal(true)
                    }}
                    className="px-3 py-1 bg-muted rounded text-xs font-bold hover:bg-muted/80"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Meetings Tab */}
      {activeTab === 'my-meetings' && (
        <div className="space-y-4">
          {myMeetings.length > 0 ? (
            myMeetings.map(meeting => (
              <div key={meeting.id} className="bg-card border rounded-2xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(meeting.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {meeting.startTime}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowDetailsModal(true)
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-2xl p-8 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No meetings assigned to you</p>
            </div>
          )}
        </div>
      )}

      {/* Notes & Decisions Tab */}
      {activeTab === 'notes-decisions' && (
        <div className="space-y-4">
          {meetings.filter(m => m.notes.length > 0 || m.decisions.length > 0).map(meeting => (
            <div key={meeting.id} className="bg-card border rounded-2xl p-4">
              <h3 className="font-black mb-3">{meeting.title}</h3>
              
              {meeting.notes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-blue-600 mb-2">📝 Notes</p>
                  {meeting.notes.map(note => (
                    <div key={note.id} className="bg-blue-50 rounded p-2 mb-2 text-sm">
                      <p className="text-blue-900">{note.content}</p>
                      <p className="text-xs text-blue-700 mt-1">by {note.author}</p>
                    </div>
                  ))}
                </div>
              )}

              {meeting.decisions.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-pink-600 mb-2">⭐ Decisions</p>
                  {meeting.decisions.map(decision => (
                    <div key={decision.id} className="bg-pink-50 rounded p-2 mb-2 text-sm">
                      <p className="text-pink-900 font-bold">{decision.description}</p>
                      <p className="text-xs text-pink-700 mt-1">Owner: {decision.owner} | Due: {formatDate(decision.dueDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-4">
          {meetings.filter(m => m.followUps.length > 0).map(meeting => (
            <div key={meeting.id} className="bg-card border rounded-2xl p-4">
              <h3 className="font-black mb-3">{meeting.title}</h3>
              {meeting.followUps.map(fu => (
                <div key={fu.id} className={`rounded p-3 mb-2 ${fu.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold">{fu.task}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned to: <span className="font-bold">{fu.assignedTo}</span> | Due: {formatDate(fu.dueDate)}
                      </p>
                      <span className={`inline-block text-xs font-bold mt-2 px-2 py-1 rounded ${
                        fu.priority === 'High' ? 'bg-red-100 text-red-700' :
                        fu.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {fu.priority} Priority
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      fu.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      fu.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {fu.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b">
              <div>
                <h2 className="text-2xl font-black">{selectedMeeting.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedMeeting.type}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Meeting Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-bold flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatLongDate(selectedMeeting.date)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="font-bold flex items-center gap-2"><Clock className="h-4 w-4" /> {selectedMeeting.startTime} - {selectedMeeting.endTime}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedMeeting.location}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex gap-2 mt-2">
                    {['Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateMeetingStatus(status as Meeting['status'])}
                        className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
                          selectedMeeting.status === status
                            ? getStatusColor(status)
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <h3 className="font-black mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Attendees ({selectedMeeting.attendees.length})
                </h3>
                <div className="space-y-2">
                  {selectedMeeting.attendees.map(att => (
                    <div key={att.id} className="bg-muted/50 rounded p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{att.name}</p>
                        <p className="text-xs text-muted-foreground">{att.role}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        att.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                        att.status === 'Declined' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Link */}
              {selectedMeeting.meetingLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2">🔗 Meeting Link</p>
                  <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm break-all">
                    {selectedMeeting.meetingLink}
                  </a>
                </div>
              )}

              {/* Notes Tab Section */}
              <div>
                <h3 className="font-black mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Notes ({selectedMeeting.notes.length})
                </h3>
                <div className="space-y-3 mb-4">
                  {selectedMeeting.notes.map(note => (
                    <div key={note.id} className={`rounded-lg p-3 ${
                      note.type === 'Decision' ? 'bg-pink-50' :
                      note.type === 'Action Item' ? 'bg-yellow-50' :
                      'bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">by {note.author} | {formatDate(note.timestamp.split('T')[0])}</p>
                        </div>
                        <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded">{note.type}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                  <select
                    onChange={(e) => {
                      if (newNote.trim()) handleAddNote(e.target.value as any)
                    }}
                    className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  >
                    <option value="">+ Add</option>
                    <option value="Note">As Note</option>
                    <option value="Action Item">As Action</option>
                    <option value="Decision">As Decision</option>
                  </select>
                </div>
              </div>

              {/* Decisions */}
              <div>
                <h3 className="font-black mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-pink-600" />
                  Decisions ({selectedMeeting.decisions.length})
                </h3>
                <div className="space-y-2 mb-4">
                  {selectedMeeting.decisions.map(dec => (
                    <div key={dec.id} className="bg-pink-50 rounded-lg p-3">
                      <p className="font-bold text-sm">{dec.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Owner: {dec.owner} | Due: {formatDate(dec.dueDate)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Record a decision..."
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    className="flex-1 px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddDecision}
                    className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Follow-ups */}
              <div>
                <h3 className="font-black mb-3 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-green-600" />
                  Follow-ups ({selectedMeeting.followUps.length})
                </h3>
                <div className="space-y-2 mb-4">
                  {selectedMeeting.followUps.map(fu => (
                    <div key={fu.id} className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{fu.task}</p>
                          <p className="text-xs text-muted-foreground mt-1">To: {fu.assignedTo} | Due: {formatDate(fu.dueDate)}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          fu.priority === 'High' ? 'bg-red-100 text-red-700' :
                          fu.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {fu.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Task"
                    value={newFollowUp.task}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, task: e.target.value })}
                    className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                  <select
                    value={newFollowUp.assignedTo}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, assignedTo: e.target.value })}
                    className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  >
                    <option value="">Assign to...</option>
                    {TEAM_MEMBERS.map(tm => (
                      <option key={tm.id} value={tm.name}>{tm.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newFollowUp.dueDate}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
                    className="px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddFollowUp}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
                  >
                    Add Follow-up
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    if (confirm('Delete this meeting?')) {
                      handleDeleteMeeting(selectedMeeting.id)
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
                >
                  🗑️ Delete Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Meeting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b">
              <h2 className="text-2xl font-black">Schedule New Meeting</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Title *</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  placeholder="Meeting title"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-20 resize-none"
                  placeholder="Meeting description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Type *</label>
                  <select
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  >
                    <option value="Team Standup">Team Standup</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Project Review">Project Review</option>
                    <option value="Board Meeting">Board Meeting</option>
                    <option value="One-on-One">One-on-One</option>
                    <option value="Training">Training</option>
                    <option value="Planning">Planning</option>
                    <option value="Retrospective">Retrospective</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Organizer</label>
                  <select
                    value={newMeeting.organizer}
                    onChange={(e) => setNewMeeting({ ...newMeeting, organizer: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  >
                    {TEAM_MEMBERS.map(tm => (
                      <option key={tm.id} value={tm.name}>{tm.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Date *</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">Start Time *</label>
                  <input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 block">End Time *</label>
                  <input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold mb-2 block">Location *</label>
                  <input
                    type="text"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="e.g., Conference Room A"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Meeting Link (Optional)</label>
                  <input
                    type="url"
                    value={newMeeting.meetingLink}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                    placeholder="https://teams.microsoft.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Attendees</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {TEAM_MEMBERS.map(tm => (
                    <button
                      key={tm.id}
                      onClick={() => {
                        if (newMeeting.attendees.includes(tm.name)) {
                          setNewMeeting({ ...newMeeting, attendees: newMeeting.attendees.filter(a => a !== tm.name) })
                        } else {
                          setNewMeeting({ ...newMeeting, attendees: [...newMeeting.attendees, tm.name] })
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        newMeeting.attendees.includes(tm.name)
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {tm.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Agenda</label>
                <textarea
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-16 resize-none"
                  placeholder="Meeting agenda items..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeeting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
