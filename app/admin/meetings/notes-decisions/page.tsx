'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  FileText, Plus, Archive, Zap, Check, AlertCircle, Trash2, Search, 
  Link as LinkIcon, Clock, Users, BarChart3, Briefcase, Eye, Edit2, History,
  Save, X, Calendar, Target, Activity, CheckCircle, Filter
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Note {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  organizer: string;
  notes: string;
  linkedJob?: string;
  linkedClient?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

interface Decision {
  id: string;
  noteId: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  description: string;
  owner: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Implemented';
  priority: 'Low' | 'Medium' | 'High';
  linkedItems: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  dueDate?: string;
  completedDate?: string;
}

interface ActionItem {
  id: string;
  noteId: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  description: string;
  owner: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'Low' | 'Medium' | 'High';
  linkedJob?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  completedDate?: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  status: string;
}

export default function NotesDecisions() {
  const [selectedMeeting, setSelectedMeeting] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [activeTab, setActiveTab] = useState<'notes' | 'decisions' | 'actions' | 'history'>('notes')
  
  // Editing states
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null)
  const [editingActionId, setEditingActionId] = useState<string | null>(null)
  
  // Form text states
  const [editedNoteText, setEditedNoteText] = useState('')
  const [editedDecision, setEditedDecision] = useState({
    title: '',
    description: '',
    owner: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected' | 'Implemented',
    dueDate: '',
    linkedItems: ''
  })
  const [editedAction, setEditedAction] = useState({
    title: '',
    description: '',
    owner: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    dueDate: '',
    linkedJob: ''
  })
  
  // Show form states
  const [showDecisionForm, setShowDecisionForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showActionForm, setShowActionForm] = useState(false)
  
  // New item states
  const [newDecision, setNewDecision] = useState({
    title: '',
    description: '',
    owner: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    linkedItems: '',
    dueDate: ''
  })
  
  const [newNote, setNewNote] = useState({
    meetingId: '',
    notes: '',
    linkedJob: '',
    linkedClient: ''
  })
  
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    owner: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    dueDate: '',
    linkedJob: '',
    meetingId: ''
  })

  // Real Data States
  const [notes, setNotes] = useState<Note[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])

  // Current user simulation (temporary)
  const currentUser = {
    uid: 'temp-user-id',
    displayName: 'Admin',
    email: 'admin@example.com'
  }

  // Fetch all data
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchMeetings(),
        fetchNotes(),
        fetchDecisions(),
        fetchActionItems()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchMeetings = async () => {
    try {
      const meetingsRef = collection(db, 'meetingCalendar')
      const q = query(meetingsRef, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      
      const meetingsList: Meeting[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        meetingsList.push({
          id: doc.id,
          title: data.title || '',
          date: data.date || '',
          time: data.time || '',
          organizer: data.organizer || '',
          status: data.status || 'Scheduled'
        })
      })
      
      setMeetings(meetingsList)
    } catch (error) {
      console.error('Error fetching meetings:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const notesRef = collection(db, 'notes')
      const q = query(notesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const notesList: Note[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        notesList.push({
          id: doc.id,
          meetingId: data.meetingId || '',
          meetingTitle: data.meetingTitle || '',
          meetingDate: data.meetingDate || '',
          meetingTime: data.meetingTime || '',
          organizer: data.organizer || '',
          notes: data.notes || '',
          linkedJob: data.linkedJob || '',
          linkedClient: data.linkedClient || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || ''
        })
      })
      
      setNotes(notesList)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const fetchDecisions = async () => {
    try {
      const decisionsRef = collection(db, 'decisions')
      const q = query(decisionsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const decisionsList: Decision[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        decisionsList.push({
          id: doc.id,
          noteId: data.noteId || '',
          meetingId: data.meetingId || '',
          meetingTitle: data.meetingTitle || '',
          title: data.title || '',
          description: data.description || '',
          owner: data.owner || '',
          status: data.status || 'Pending',
          priority: data.priority || 'Medium',
          linkedItems: data.linkedItems || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          dueDate: data.dueDate || '',
          completedDate: data.completedDate || ''
        })
      })
      
      setDecisions(decisionsList)
    } catch (error) {
      console.error('Error fetching decisions:', error)
    }
  }

  const fetchActionItems = async () => {
    try {
      const actionsRef = collection(db, 'actionItems')
      const q = query(actionsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const actionsList: ActionItem[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        actionsList.push({
          id: doc.id,
          noteId: data.noteId || '',
          meetingId: data.meetingId || '',
          meetingTitle: data.meetingTitle || '',
          title: data.title || '',
          description: data.description || '',
          owner: data.owner || '',
          status: data.status || 'pending',
          priority: data.priority || 'Medium',
          linkedJob: data.linkedJob || '',
          dueDate: data.dueDate || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          completedDate: data.completedDate || ''
        })
      })
      
      setActionItems(actionsList)
    } catch (error) {
      console.error('Error fetching action items:', error)
    }
  }

  // ========== NOTE OPERATIONS ==========
  const handleAddNote = async () => {
    if (!newNote.meetingId || !newNote.notes.trim()) {
      alert('Please select a meeting and add notes')
      return
    }

    const selectedMeeting = meetings.find(m => m.id === newNote.meetingId)
    if (!selectedMeeting) return

    try {
      const noteData = {
        meetingId: newNote.meetingId,
        meetingTitle: selectedMeeting.title,
        meetingDate: selectedMeeting.date,
        meetingTime: selectedMeeting.time,
        organizer: selectedMeeting.organizer,
        notes: newNote.notes,
        linkedJob: newNote.linkedJob,
        linkedClient: newNote.linkedClient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName
      }

      await addDoc(collection(db, 'notes'), noteData)
      fetchNotes()
      
      setNewNote({
        meetingId: '',
        notes: '',
        linkedJob: '',
        linkedClient: ''
      })
      setShowNoteForm(false)
      
      alert('Note added successfully!')
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Error adding note')
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editedNoteText.trim()) {
      alert('Please enter note text')
      return
    }

    try {
      const noteRef = doc(db, 'notes', noteId)
      await updateDoc(noteRef, {
        notes: editedNoteText,
        updatedAt: new Date().toISOString()
      })
      
      fetchNotes()
      setEditingNoteId(null)
      setEditedNoteText('')
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Error updating note')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      await deleteDoc(doc(db, 'notes', noteId))
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error deleting note')
    }
  }

  // ========== DECISION OPERATIONS ==========
  const handleAddDecision = async () => {
    if (!newDecision.title.trim() || !newDecision.description.trim()) {
      alert('Please enter decision title and description')
      return
    }

    try {
      const decisionData = {
        title: newDecision.title,
        description: newDecision.description,
        owner: newDecision.owner || currentUser.displayName,
        status: 'Pending' as const,
        priority: newDecision.priority,
        linkedItems: newDecision.linkedItems 
          ? newDecision.linkedItems.split(',').map(item => item.trim()).filter(item => item)
          : [],
        dueDate: newDecision.dueDate || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName,
        noteId: '',
        meetingId: '',
        meetingTitle: 'Standalone Decision'
      }

      await addDoc(collection(db, 'decisions'), decisionData)
      fetchDecisions()
      
      setNewDecision({
        title: '',
        description: '',
        owner: '',
        priority: 'Medium',
        linkedItems: '',
        dueDate: ''
      })
      setShowDecisionForm(false)
      
      alert('Decision recorded successfully!')
    } catch (error) {
      console.error('Error adding decision:', error)
      alert('Error recording decision')
    }
  }

  const handleUpdateDecision = async (decisionId: string) => {
    if (!editedDecision.title.trim() || !editedDecision.description.trim()) {
      alert('Please enter decision title and description')
      return
    }

    try {
      const decisionRef = doc(db, 'decisions', decisionId)
      await updateDoc(decisionRef, {
        title: editedDecision.title,
        description: editedDecision.description,
        owner: editedDecision.owner,
        priority: editedDecision.priority,
        status: editedDecision.status,
        dueDate: editedDecision.dueDate,
        linkedItems: editedDecision.linkedItems 
          ? editedDecision.linkedItems.split(',').map(item => item.trim()).filter(item => item)
          : [],
        updatedAt: new Date().toISOString()
      })
      
      fetchDecisions()
      setEditingDecisionId(null)
      setEditedDecision({
        title: '',
        description: '',
        owner: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        linkedItems: ''
      })
    } catch (error) {
      console.error('Error updating decision:', error)
      alert('Error updating decision')
    }
  }

  const handleDeleteDecision = async (decisionId: string) => {
    if (!confirm('Are you sure you want to delete this decision?')) return
    
    try {
      await deleteDoc(doc(db, 'decisions', decisionId))
      fetchDecisions()
    } catch (error) {
      console.error('Error deleting decision:', error)
      alert('Error deleting decision')
    }
  }

  // ========== ACTION ITEM OPERATIONS ==========
  const handleAddAction = async () => {
    if (!newAction.title.trim() || !newAction.description.trim()) {
      alert('Please enter action title and description')
      return
    }

    try {
      const selectedMeeting = meetings.find(m => m.id === newAction.meetingId)
      
      const actionData = {
        title: newAction.title,
        description: newAction.description,
        owner: newAction.owner || currentUser.displayName,
        status: 'pending' as const,
        priority: newAction.priority,
        dueDate: newAction.dueDate || '',
        linkedJob: newAction.linkedJob || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName,
        noteId: '',
        meetingId: newAction.meetingId || '',
        meetingTitle: selectedMeeting ? selectedMeeting.title : 'Standalone Action'
      }

      await addDoc(collection(db, 'actionItems'), actionData)
      fetchActionItems()
      
      setNewAction({
        title: '',
        description: '',
        owner: '',
        priority: 'Medium',
        dueDate: '',
        linkedJob: '',
        meetingId: ''
      })
      setShowActionForm(false)
      
      alert('Action item added successfully!')
    } catch (error) {
      console.error('Error adding action:', error)
      alert('Error adding action')
    }
  }

  const handleUpdateAction = async (actionId: string) => {
    if (!editedAction.title.trim() || !editedAction.description.trim()) {
      alert('Please enter action title and description')
      return
    }

    try {
      const actionRef = doc(db, 'actionItems', actionId)
      await updateDoc(actionRef, {
        title: editedAction.title,
        description: editedAction.description,
        owner: editedAction.owner,
        priority: editedAction.priority,
        status: editedAction.status,
        dueDate: editedAction.dueDate,
        linkedJob: editedAction.linkedJob,
        updatedAt: new Date().toISOString(),
        ...(editedAction.status === 'completed' ? { completedDate: new Date().toISOString() } : {})
      })
      
      fetchActionItems()
      setEditingActionId(null)
      setEditedAction({
        title: '',
        description: '',
        owner: '',
        priority: 'Medium',
        status: 'pending',
        dueDate: '',
        linkedJob: ''
      })
    } catch (error) {
      console.error('Error updating action:', error)
      alert('Error updating action')
    }
  }

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return
    
    try {
      await deleteDoc(doc(db, 'actionItems', actionId))
      fetchActionItems()
    } catch (error) {
      console.error('Error deleting action item:', error)
      alert('Error deleting action item')
    }
  }

  const handleUpdateActionStatus = async (actionId: string, newStatus: ActionItem['status']) => {
    try {
      const actionRef = doc(db, 'actionItems', actionId)
      await updateDoc(actionRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'completed' ? { completedDate: new Date().toISOString() } : {})
      })
      
      fetchActionItems()
    } catch (error) {
      console.error('Error updating action item:', error)
      alert('Error updating action item')
    }
  }

  // ========== EDIT FUNCTIONS ==========
  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id)
    setEditedNoteText(note.notes)
  }

  const startEditDecision = (decision: Decision) => {
    setEditingDecisionId(decision.id)
    setEditedDecision({
      title: decision.title,
      description: decision.description,
      owner: decision.owner,
      priority: decision.priority,
      status: decision.status,
      dueDate: decision.dueDate || '',
      linkedItems: decision.linkedItems.join(', ')
    })
  }

  const startEditAction = (action: ActionItem) => {
    setEditingActionId(action.id)
    setEditedAction({
      title: action.title,
      description: action.description,
      owner: action.owner,
      priority: action.priority,
      status: action.status,
      dueDate: action.dueDate || '',
      linkedJob: action.linkedJob || ''
    })
  }

  // ========== FILTERED DATA WITH DATE FILTER ==========
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const meetingMatch = selectedMeeting === 'all' || note.meetingId === selectedMeeting
      const dateMatch = !selectedDate || note.meetingDate === selectedDate
      const searchMatch = note.meetingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.linkedJob && note.linkedJob.toLowerCase().includes(searchTerm.toLowerCase()))
      return meetingMatch && dateMatch && searchMatch
    })
  }, [notes, selectedMeeting, selectedDate, searchTerm])

  const filteredDecisions = useMemo(() => {
    return decisions.filter(decision => {
      const dateMatch = !selectedDate || decision.createdAt.split('T')[0] === selectedDate
      const searchMatch = decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decision.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decision.owner.toLowerCase().includes(searchTerm.toLowerCase())
      return dateMatch && searchMatch
    })
  }, [decisions, selectedDate, searchTerm])

  const filteredActionItems = useMemo(() => {
    return actionItems.filter(item => {
      const dateMatch = !selectedDate || item.createdAt.split('T')[0] === selectedDate
      const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.linkedJob && item.linkedJob.toLowerCase().includes(searchTerm.toLowerCase()))
      return dateMatch && searchMatch
    })
  }, [actionItems, selectedDate, searchTerm])

  // ========== STATS WITH DATE FILTER ==========
  const stats = useMemo(() => {
    const notesForDate = selectedDate ? notes.filter(n => n.meetingDate === selectedDate) : notes
    const decisionsForDate = selectedDate ? decisions.filter(d => d.createdAt.split('T')[0] === selectedDate) : decisions
    const actionsForDate = selectedDate ? actionItems.filter(a => a.createdAt.split('T')[0] === selectedDate) : actionItems
    
    return {
      totalDecisions: decisionsForDate.length,
      approvedDecisions: decisionsForDate.filter(d => d.status === 'Approved').length,
      implementedDecisions: decisionsForDate.filter(d => d.status === 'Implemented').length,
      pendingDecisions: decisionsForDate.filter(d => d.status === 'Pending').length,
      
      totalActions: actionsForDate.length,
      completedActions: actionsForDate.filter(a => a.status === 'completed').length,
      inProgressActions: actionsForDate.filter(a => a.status === 'in-progress').length,
      pendingActions: actionsForDate.filter(a => a.status === 'pending').length,
      
      totalNotes: notesForDate.length,
      recentNotes: notesForDate.filter(n => {
        const noteDate = new Date(n.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return noteDate > weekAgo
      }).length
    }
  }, [decisions, actionItems, notes, selectedDate])

  // ========== HELPER FUNCTIONS ==========
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'completed': return 'bg-green-100 text-green-700'
      case 'Implemented': return 'bg-purple-100 text-purple-700'
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'Pending':
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'Rejected':
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50'
      case 'Medium': return 'text-orange-600 bg-orange-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Notes & Decisions</h1>
          <p className="text-muted-foreground mt-1">Complete decision history, action items, and AI extraction audit trail</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowNoteForm(!showNoteForm)} 
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="font-bold">{showNoteForm ? 'Cancel' : 'Add Note'}</span>
          </button>
          <button 
            onClick={() => setShowDecisionForm(!showDecisionForm)} 
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="h-5 w-5" />
            <span className="font-bold">{showDecisionForm ? 'Cancel' : 'Record Decision'}</span>
          </button>
          <button 
            onClick={() => setShowActionForm(!showActionForm)} 
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Target className="h-5 w-5" />
            <span className="font-bold">{showActionForm ? 'Cancel' : 'Add Action'}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Filter by Date</h3>
          {selectedDate && (
            <button 
              onClick={clearDateFilter}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear Date Filter
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-2 block">Select Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </div>
            </div>
            {selectedDate && (
              <p className="text-xs text-green-600 mt-1">
                Showing items for: {selectedDate}
              </p>
            )}
          </div>
          
          <div className="flex items-end">
            <div className="w-full">
              <label className="text-xs font-bold text-muted-foreground mb-2 block">Quick Stats</label>
              <div className="flex gap-2">
                <span className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs">
                  {filteredNotes.length} Notes
                </span>
                <span className="flex-1 text-center px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs">
                  {filteredDecisions.length} Decisions
                </span>
                <span className="flex-1 text-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs">
                  {filteredActionItems.length} Actions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-lg">Add New Meeting Note</h3>
          
          <select
            value={newNote.meetingId}
            onChange={(e) => setNewNote({...newNote, meetingId: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Meeting *</option>
            {meetings.map(meeting => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.date} - {meeting.title}
              </option>
            ))}
          </select>
          
          <textarea 
            placeholder="Meeting Notes *" 
            value={newNote.notes}
            onChange={(e) => setNewNote({...newNote, notes: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Linked Job (optional)" 
              value={newNote.linkedJob}
              onChange={(e) => setNewNote({...newNote, linkedJob: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="text" 
              placeholder="Linked Client (optional)" 
              value={newNote.linkedClient}
              onChange={(e) => setNewNote({...newNote, linkedClient: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNoteForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={handleAddNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold">
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Decision Form Modal */}
      {showDecisionForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-lg">Record New Decision</h3>
          
          <input 
            type="text" 
            placeholder="Decision Title *" 
            value={newDecision.title}
            onChange={(e) => setNewDecision({...newDecision, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          
          <textarea 
            placeholder="Decision Description *" 
            value={newDecision.description}
            onChange={(e) => setNewDecision({...newDecision, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Owner *" 
              value={newDecision.owner}
              onChange={(e) => setNewDecision({...newDecision, owner: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            
            <select
              value={newDecision.priority}
              onChange={(e) => setNewDecision({...newDecision, priority: e.target.value as any})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Linked Items (comma-separated)" 
              value={newDecision.linkedItems}
              onChange={(e) => setNewDecision({...newDecision, linkedItems: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <input 
              type="date" 
              placeholder="Due Date" 
              value={newDecision.dueDate}
              onChange={(e) => setNewDecision({...newDecision, dueDate: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowDecisionForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={handleAddDecision} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold">
              Record Decision
            </button>
          </div>
        </div>
      )}

      {/* Action Form Modal */}
      {showActionForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-lg">Add New Action Item</h3>
          
          <input 
            type="text" 
            placeholder="Action Title *" 
            value={newAction.title}
            onChange={(e) => setNewAction({...newAction, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          
          <textarea 
            placeholder="Action Description *" 
            value={newAction.description}
            onChange={(e) => setNewAction({...newAction, description: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Owner *" 
              value={newAction.owner}
              onChange={(e) => setNewAction({...newAction, owner: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            
            <select
              value={newAction.priority}
              onChange={(e) => setNewAction({...newAction, priority: e.target.value as any})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="date" 
              placeholder="Due Date *" 
              value={newAction.dueDate}
              onChange={(e) => setNewAction({...newAction, dueDate: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            
            <input 
              type="text" 
              placeholder="Linked Job (optional)" 
              value={newAction.linkedJob}
              onChange={(e) => setNewAction({...newAction, linkedJob: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={newAction.meetingId}
            onChange={(e) => setNewAction({...newAction, meetingId: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Meeting (optional)</option>
            {meetings.map(meeting => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.date} - {meeting.title}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowActionForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={handleAddAction} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold">
              Add Action
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-3xl font-black text-blue-700">{stats.totalNotes}</p>
          <p className="text-xs text-blue-600 mt-1">{stats.recentNotes} this week</p>
        </div>
        
        <div className="bg-linear-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Decisions</p>
          <p className="text-3xl font-black text-green-700">{stats.totalDecisions}</p>
          <p className="text-xs text-green-600 mt-1">{stats.approvedDecisions} approved</p>
        </div>
        
        <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Implemented</p>
          <p className="text-3xl font-black text-purple-700">{stats.implementedDecisions}</p>
          <p className="text-xs text-purple-600 mt-1">Decisions</p>
        </div>
        
        <div className="bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Action Items</p>
          <p className="text-3xl font-black text-orange-700">{stats.totalActions}</p>
          <p className="text-xs text-orange-600 mt-1">Total tasks</p>
        </div>
        
        <div className="bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-3xl font-black text-yellow-700">{stats.inProgressActions}</p>
          <p className="text-xs text-yellow-600 mt-1">Action items</p>
        </div>
        
        <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-black text-red-700">{stats.pendingActions}</p>
          <p className="text-xs text-red-600 mt-1">Awaiting action</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['notes', 'decisions', 'actions', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors capitalize flex items-center gap-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'notes' && <FileText className="h-4 w-4" />}
            {tab === 'decisions' && <Check className="h-4 w-4" />}
            {tab === 'actions' && <Target className="h-4 w-4" />}
            {tab === 'history' && <History className="h-4 w-4" />}
            {tab}
            {tab === 'notes' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{filteredNotes.length}</span>}
            {tab === 'decisions' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{filteredDecisions.length}</span>}
            {tab === 'actions' && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{filteredActionItems.length}</span>}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, decisions, action items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedMeeting}
            onChange={(e) => setSelectedMeeting(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Meetings</option>
            {meetings.map(meeting => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notes found</p>
              {selectedDate && (
                <p className="text-sm mt-1">No notes for date: {selectedDate}</p>
              )}
              <button 
                onClick={() => setShowNoteForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          ) : (
            <>
              {selectedDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <p className="font-bold text-blue-900">
                      Showing notes for: {selectedDate}
                    </p>
                  </div>
                </div>
              )}
              
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{note.meetingTitle}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {note.meetingDate} at {note.meetingTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {note.organizer}
                        </span>
                        <span className="text-xs text-gray-500">
                          By: {note.createdByName}
                        </span>
                      </div>
                      
                      {(note.linkedJob || note.linkedClient) && (
                        <div className="flex items-center gap-2 mt-2">
                          {note.linkedJob && (
                            <a href={`/admin/jobs/detail?id=${note.linkedJob}`} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded hover:bg-pink-200 transition-colors flex items-center gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {note.linkedJob}
                            </a>
                          )}
                          {note.linkedClient && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              {note.linkedClient}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditNote(note)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                        title="Edit Note"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes Content - Edit Mode */}
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedNoteText}
                        onChange={(e) => setEditedNoteText(e.target.value)}
                        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateNote(note.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save Note
                        </button>
                        <button 
                          onClick={() => {
                            setEditingNoteId(null)
                            setEditedNoteText('')
                          }}
                          className="px-3 py-2 border rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-line">{note.notes}</p>
                    </div>
                  )}

                  {/* Related Decisions & Actions */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <p className="text-2xl font-black text-blue-700">
                        {decisions.filter(d => d.noteId === note.id).length}
                      </p>
                      <p className="text-xs text-blue-600">Related Decisions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-700">
                        {actionItems.filter(a => a.noteId === note.id).length}
                      </p>
                      <p className="text-xs text-green-600">Action Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-700">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">Created Date</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* DECISIONS TAB */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          {filteredDecisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No decisions found</p>
              {selectedDate && (
                <p className="text-sm mt-1">No decisions for date: {selectedDate}</p>
              )}
              <button 
                onClick={() => setShowDecisionForm(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Record Decision
              </button>
            </div>
          ) : (
            <>
              {selectedDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <p className="font-bold text-green-900">
                      Showing decisions for: {selectedDate}
                    </p>
                  </div>
                </div>
              )}
              
              {filteredDecisions.map((decision) => (
                <div key={decision.id} className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{decision.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {decision.meetingTitle}
                        </span>
                      </div>
                      
                      {/* Edit Mode */}
                      {editingDecisionId === decision.id ? (
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            value={editedDecision.title}
                            onChange={(e) => setEditedDecision({...editedDecision, title: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Decision Title"
                          />
                          <textarea 
                            value={editedDecision.description}
                            onChange={(e) => setEditedDecision({...editedDecision, description: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm h-24"
                            placeholder="Decision Description"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              value={editedDecision.owner}
                              onChange={(e) => setEditedDecision({...editedDecision, owner: e.target.value})}
                              className="px-2 py-1 border rounded text-sm"
                              placeholder="Owner"
                            />
                            <input 
                              type="date" 
                              value={editedDecision.dueDate}
                              onChange={(e) => setEditedDecision({...editedDecision, dueDate: e.target.value})}
                              className="px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editedDecision.priority}
                              onChange={(e) => setEditedDecision({...editedDecision, priority: e.target.value as any})}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                            <select
                              value={editedDecision.status}
                              onChange={(e) => setEditedDecision({...editedDecision, status: e.target.value as any})}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Implemented">Implemented</option>
                            </select>
                          </div>
                          <input 
                            type="text" 
                            value={editedDecision.linkedItems}
                            onChange={(e) => setEditedDecision({...editedDecision, linkedItems: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Linked Items (comma separated)"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateDecision(decision.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => {
                                setEditingDecisionId(null)
                                setEditedDecision({
                                  title: '',
                                  description: '',
                                  owner: '',
                                  priority: 'Medium',
                                  status: 'Pending',
                                  dueDate: '',
                                  linkedItems: ''
                                })
                              }}
                              className="px-3 py-1 border rounded text-xs font-bold hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-2">{decision.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Owner: <strong>{decision.owner}</strong></span>
                            <span>Created: {new Date(decision.createdAt).toLocaleDateString()}</span>
                            {decision.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {decision.dueDate}
                              </span>
                            )}
                            {decision.completedDate && (
                              <span className="text-green-600">
                                Completed: {new Date(decision.completedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {editingDecisionId !== decision.id && (
                      <div className="flex flex-col gap-2">
                        <select
                          value={decision.status}
                          onChange={(e) => handleUpdateDecision(decision.id, e.target.value as Decision['status'])}
                          className={`text-xs px-2 py-1 rounded font-semibold border ${getStatusColor(decision.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Implemented">Implemented</option>
                        </select>
                        
                        <span className={`text-xs px-2 py-1 rounded font-semibold text-center ${getPriorityColor(decision.priority)}`}>
                          {decision.priority} Priority
                        </span>
                      </div>
                    )}
                  </div>

                  {editingDecisionId !== decision.id && decision.linkedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {decision.linkedItems.map((item, idx) => (
                        <span key={idx} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {editingDecisionId !== decision.id && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Created by: {decision.createdByName}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditDecision(decision)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteDecision(decision.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ACTIONS TAB */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          {filteredActionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No action items found</p>
              {selectedDate && (
                <p className="text-sm mt-1">No actions for date: {selectedDate}</p>
              )}
              <button 
                onClick={() => setShowActionForm(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Action
              </button>
            </div>
          ) : (
            <>
              {selectedDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <p className="font-bold text-purple-900">
                      Showing actions for: {selectedDate}
                    </p>
                  </div>
                </div>
              )}
              
              {filteredActionItems.map((item) => (
                <div key={item.id} className="bg-card border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {item.meetingTitle}
                        </span>
                      </div>
                      
                      {/* Edit Mode */}
                      {editingActionId === item.id ? (
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            value={editedAction.title}
                            onChange={(e) => setEditedAction({...editedAction, title: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Action Title"
                          />
                          <textarea 
                            value={editedAction.description}
                            onChange={(e) => setEditedAction({...editedAction, description: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm h-24"
                            placeholder="Action Description"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              value={editedAction.owner}
                              onChange={(e) => setEditedAction({...editedAction, owner: e.target.value})}
                              className="px-2 py-1 border rounded text-sm"
                              placeholder="Owner"
                            />
                            <input 
                              type="date" 
                              value={editedAction.dueDate}
                              onChange={(e) => setEditedAction({...editedAction, dueDate: e.target.value})}
                              className="px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editedAction.priority}
                              onChange={(e) => setEditedAction({...editedAction, priority: e.target.value as any})}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                            <select
                              value={editedAction.status}
                              onChange={(e) => setEditedAction({...editedAction, status: e.target.value as any})}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <input 
                            type="text" 
                            value={editedAction.linkedJob}
                            onChange={(e) => setEditedAction({...editedAction, linkedJob: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Linked Job"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateAction(item.id)}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => {
                                setEditingActionId(null)
                                setEditedAction({
                                  title: '',
                                  description: '',
                                  owner: '',
                                  priority: 'Medium',
                                  status: 'pending',
                                  dueDate: '',
                                  linkedJob: ''
                                })
                              }}
                              className="px-3 py-1 border rounded text-xs font-bold hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="text-sm">{item.meetingTitle}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <strong>{item.owner}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {item.dueDate}
                            </span>
                            {item.completedDate && (
                              <span className="text-green-600">
                                Completed: {new Date(item.completedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {editingActionId !== item.id && (
                      <div className="flex flex-col gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateActionStatus(item.id, e.target.value as ActionItem['status'])}
                          className={`text-xs px-2 py-1 rounded font-semibold border ${getStatusColor(item.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <span className={`text-xs px-2 py-1 rounded font-semibold text-center ${getPriorityColor(item.priority)}`}>
                          {item.priority} Priority
                        </span>
                      </div>
                    )}
                  </div>

                  {editingActionId !== item.id && item.linkedJob && (
                    <div className="p-2 bg-pink-50 border border-pink-200 rounded">
                      <a href={`/admin/jobs/detail?id=${item.linkedJob}`} className="text-xs text-pink-700 font-bold hover:text-pink-900 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Linked to Job: {item.linkedJob}
                      </a>
                    </div>
                  )}

                  {editingActionId !== item.id && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Created by: {item.createdByName}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => startEditAction(item)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAction(item.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {notes.length === 0 && decisions.length === 0 && actionItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No history available</p>
              <p className="text-sm mt-1">History will appear when you add notes, decisions or actions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Date Filter Info */}
              {selectedDate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <p className="font-bold text-yellow-900">
                      Showing history for: {selectedDate}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Notes History */}
              {notes.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Meeting Notes History</h3>
                  <div className="space-y-3">
                    {notes
                      .filter(note => !selectedDate || note.createdAt.split('T')[0] === selectedDate)
                      .slice(0, 10)
                      .map((note, idx) => (
                      <div key={note.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="text-right text-xs text-muted-foreground min-w-32 pt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                            <p className="font-bold text-sm">Note Added: {note.meetingTitle}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {note.createdByName} | {note.notes.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions History */}
              {decisions.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Decisions History</h3>
                  <div className="space-y-3">
                    {decisions
                      .filter(decision => !selectedDate || decision.createdAt.split('T')[0] === selectedDate)
                      .slice(0, 10)
                      .map((decision, idx) => (
                      <div key={decision.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="text-right text-xs text-muted-foreground min-w-32 pt-1">
                          {new Date(decision.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-600 mt-2"></div>
                            <p className="font-bold text-sm">Decision: {decision.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(decision.status)}`}>
                              {decision.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {decision.createdByName} | Owner: {decision.owner}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions History */}
              {actionItems.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Actions History</h3>
                  <div className="space-y-3">
                    {actionItems
                      .filter(action => !selectedDate || action.createdAt.split('T')[0] === selectedDate)
                      .slice(0, 10)
                      .map((action, idx) => (
                      <div key={action.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="text-right text-xs text-muted-foreground min-w-32 pt-1">
                          {new Date(action.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-600 mt-2"></div>
                            <p className="font-bold text-sm">Action: {action.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(action.status)}`}>
                              {action.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {action.createdByName} | Owner: {action.owner}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Extraction Info */}
      
    </div>
  )
}