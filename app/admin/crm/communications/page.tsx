'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  MessageSquare,
  Mail,
  Phone,
  Trash2,
  X,
  Search,
  Copy,
  MessageCircle,
  ArrowUpRight,
  Activity,
  Zap,
  Smile,
  Meh,
  Frown,
  User,
  Building,
  Calendar as CalendarIcon,
  Eye,
  Plus,
  Send,
  Clock,
  Paperclip,
  Edit,
  CheckCircle,
  AlertCircle,
  Archive,
  FileText,
  Loader2,
  Bell,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'

// Firebase imports
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  DocumentData
} from 'firebase/firestore'

// Type Definitions
interface Lead {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  value?: number;
  status?: string;
  industry?: string;
  source?: string;
  website?: string;
  employees?: string;
  address?: string;
  notes?: string;
}

// ✅ NEW: Client Interface
interface Client {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: string;
  tier?: string;
  totalSpent?: number;
  projects?: number;
  lastService?: string;
  joinDate?: string;
  notes?: string;
  contracts?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface Communication {
  id: string;
  leadId: string;
  leadName?: string;
  leadCompany?: string;
  type: string;
  date?: string;
  message: string;
  sentiment: string;
  status?: string;
  priority?: string;
  scheduledDate?: string | null;
  attachmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface NewCommData {
  leadId: string;
  type: string;
  message: string;
  sentiment: string;
  scheduledDate: string;
  priority: string;
  attachments: File[];
}

interface Template {
  [key: string]: {
    email: string;
    whatsapp: string;
  };
}

// ✅ NEW: Combined Lead/Client type for dropdown
interface CombinedContact {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  type: 'lead' | 'client';
  source?: string;
}

export default function CommunicationLog() {
  // State for Firebase data
  const [leads, setLeads] = useState<Lead[]>([])
  const [clients, setClients] = useState<Client[]>([]) // ✅ NEW: Clients state
  const [communications, setCommunications] = useState<Communication[]>([])

  // UI State
  const [showTemplate, setShowTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterSentiment, setFilterSentiment] = useState('All')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewComm, setShowNewComm] = useState(false)
  const [showLeadHistory, setShowLeadHistory] = useState(false)
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<Lead | null>(null)
  const [editingComm, setEditingComm] = useState<Communication | null>(null)
  const [newCommData, setNewCommData] = useState<NewCommData>({
    leadId: '',
    type: 'email',
    message: '',
    sentiment: 'neutral',
    scheduledDate: '',
    priority: 'normal',
    attachments: []
  })

  // State for sending emails/WhatsApp
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null)
  const [status, setStatus] = useState<Record<string, {
    email?: 'sending' | 'sent' | 'error';
    whatsapp?: 'sending' | 'sent' | 'error';
  }>>({})

  // ✅ NEW: Calendar Filter State
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [dateFilter, setDateFilter] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<string>('')
  const [filterMode, setFilterMode] = useState<'day' | 'month' | 'year' | 'all'>('all')

  // ✅ NEW: Fetch leads AND clients from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leads
        const leadsCollection = collection(db, 'leads')
        const leadsSnapshot = await getDocs(leadsCollection)
        const leadsList = leadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Lead))
        setLeads(leadsList)
        
        // ✅ NEW: Fetch clients
        const clientsCollection = collection(db, 'clients')
        const clientsSnapshot = await getDocs(clientsCollection)
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Client))
        setClients(clientsList)
        
        // Auto-select Hamza from Largify Solutions if exists (from leads)
        const hamzaLead = leadsList.find(lead => 
          lead.name && lead.name.toLowerCase().includes('hamza') && 
          lead.company && lead.company.toLowerCase().includes('largify')
        )
        
        if (hamzaLead) {
          setNewCommData(prev => ({
            ...prev,
            leadId: hamzaLead.id
          }))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        alert('Error loading data from database')
      }
    }
    
    fetchData()
  }, [])

  // Real-time listener for communications
  useEffect(() => {
    const commsCollection = collection(db, 'communications')
    
    const unsubscribe = onSnapshot(commsCollection, (snapshot) => {
      const commsList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Decode URL encoded messages when loading from Firebase
        const decodedMessage = data.message ? decodeURIComponent(data.message) : data.message;
        
        return {
          id: doc.id,
          ...data,
          message: decodedMessage
        } as Communication;
      })
      setCommunications(commsList)
    }, (error) => {
      console.error('Error listening to communications:', error)
    })
    
    return () => unsubscribe()
  }, [])

  // ✅ NEW: Create combined contacts list for dropdown
  const combinedContacts = useMemo<CombinedContact[]>(() => {
    const leadsContacts: CombinedContact[] = leads.map(lead => ({
      id: lead.id,
      name: lead.name || 'Unknown Lead',
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      type: 'lead',
      source: 'Leads'
    }))
    
    const clientsContacts: CombinedContact[] = clients.map(client => ({
      id: `client_${client.id}`, // Prefix to differentiate from leads
      name: client.name || 'Unknown Client',
      company: client.company,
      email: client.email,
      phone: client.phone,
      type: 'client',
      source: 'Clients'
    }))
    
    return [...leadsContacts, ...clientsContacts].sort((a, b) => 
      a.name.localeCompare(b.name)
    )
  }, [leads, clients])

  // Templates remain same
  const templates: Template = {
    followUp: {
      email: "Hi {{name}},\n\nFollowing up on our previous conversation regarding the {{service}} proposal.\n\nWould you be available for a call this week to discuss next steps?\n\nBest regards,\nSilver Maid Sales Team",
      whatsapp: "Hi {{name}}! 👋 Following up on the proposal I shared earlier. Keen to discuss how we can help with your {{service}} needs. Available for a quick call? 📞"
    },
    proposal: {
      email: "Dear {{name}},\n\nPlease find attached the customized proposal for {{service}}.\n\nKey highlights:\n• Cost-effective solution\n• 24/7 support\n• Flexible scheduling\n\nLooking forward to your thoughts.\n\nBest regards,\nSilver Maid",
      whatsapp: "Hi {{name}}! 📋 Sent you the proposal for {{service}}. It covers everything we discussed. Let me know if you have any questions! 💼"
    }
  }

  // ✅ NEW: Get available months and years from communications
  const availableMonthsYears = useMemo(() => {
    const monthsSet = new Set<string>()
    const yearsSet = new Set<string>()
    
    communications.forEach(comm => {
      if (comm.date) {
        const [year, month] = comm.date.split('-')
        monthsSet.add(`${year}-${month}`)
        yearsSet.add(year)
      }
    })
    
    return {
      months: Array.from(monthsSet).sort().reverse(),
      years: Array.from(yearsSet).sort().reverse()
    }
  }, [communications])

  // ✅ FIXED: Update existing communication function
  const updateExistingCommunication = async (leadId: string, type: 'email' | 'whatsapp', message: string) => {
    try {
      // Decode the URL-encoded message before saving
      const decodedMessage = decodeURIComponent(message);
      
      // Find the MOST RECENT communication for this lead with similar message
      // We'll look for communications from the last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      const existingComm = communications.find(c => 
        c.leadId === leadId && 
        c.type === type &&
        c.createdAt && 
        new Date(c.createdAt) > yesterday
      );
      
      if (existingComm) {
        // Update existing communication status to 'sent'
        const commRef = doc(db, 'communications', existingComm.id);
        await updateDoc(commRef, {
          status: 'sent',
          message: decodedMessage, // ✅ Save decoded message
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Updated existing communication: ${existingComm.id}`);
        return existingComm.id;
      } else {
        // If no existing communication found, find the lead first
        const lead = leads.find(l => l.id === leadId);
        
        // Create new communication entry
        const communicationData = {
          leadId: leadId,
          leadName: lead?.name || 'Unknown',
          leadCompany: lead?.company || '',
          type: type,
          date: new Date().toISOString().split('T')[0],
          message: decodedMessage, // ✅ Save decoded message
          sentiment: 'neutral',
          status: 'sent', // Mark as sent immediately
          priority: 'normal',
          scheduledDate: null,
          attachmentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'communications'), communicationData);
        console.log(`✅ Created new communication: ${docRef.id} for lead: ${leadId}`);
        return docRef.id;
      }
      
    } catch (error) {
      console.error('Error updating communication status:', error);
      return null;
    }
  };

  // ✅ FIXED: SIMPLE EMAIL SENDING
  const handleSendEmail = async (lead: Lead, message: string) => {
    if (!lead.email) {
      alert('Email address not available for this client')
      return
    }

    try {
      setSendingEmail(lead.id)
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          email: 'sending',
          whatsapp: prev[lead.id]?.whatsapp
        } 
      }))

      // Create Gmail compose URL WITHOUT encoding the message (Gmail handles it)
      const createGmailComposeUrl = (to: string, subject: string, body: string) => {
        const params = new URLSearchParams({
          view: 'cm',
          fs: '1',
          to: to,
          su: subject, // ✅ Don't encode here
          body: body    // ✅ Don't encode here
        });
        
        return `https://mail.google.com/mail/?${params.toString()}`;
      };

      const subject = `Communication from Silver Maid - ${lead.name || 'Client'}`;
      const emailBody = `Dear ${lead.name || 'Client'},\n\n${message}\n\nBest regards,\nSilver Maid Team`;
      
      const gmailComposeUrl = createGmailComposeUrl(lead.email, subject, emailBody);
      
      // Open Gmail in new tab
      window.open(gmailComposeUrl, '_blank');
      
      // Update existing communication with DECODED message
      await updateExistingCommunication(lead.id, 'email', message);
      
      // Update status after successful opening
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          email: 'sent',
          whatsapp: prev[lead.id]?.whatsapp
        } 
      }))

      setTimeout(() => {
        alert(`✅ Email ready to send to ${lead.email}! Check your Gmail tab.`)
      }, 1000)

    } catch (error) {
      console.error('Error sending email:', error)
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          email: 'error',
          whatsapp: prev[lead.id]?.whatsapp
        } 
      }))
      alert('❌ Error preparing email')
    } finally {
      // Clear sending state after 2 seconds
      setTimeout(() => {
        setSendingEmail(null)
      }, 2000)
    }
  }

  // ✅ FIXED: SIMPLE WHATSAPP SENDING
  const handleSendWhatsApp = async (lead: Lead, message: string) => {
    if (!lead.phone) {
      alert('Phone number not available for this client')
      return
    }

    try {
      setSendingWhatsApp(lead.id)
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          whatsapp: 'sending',
          email: prev[lead.id]?.email
        } 
      }))

      // Format phone number for WhatsApp - SIMPLIFIED
      const formatPhoneForWhatsApp = (phone: string): string => {
        // Remove all non-numeric characters
        let cleaned = phone.replace(/\D/g, '');
        
        // Remove leading 0 if present
        if (cleaned.startsWith('0')) {
          cleaned = cleaned.substring(1);
        }
        
        // For UAE numbers, ensure they start with 971
        if (cleaned.startsWith('971')) {
          return cleaned;
        } else {
          // Assume it's a UAE number
          return '971' + cleaned;
        }
      };

      const formattedPhone = formatPhoneForWhatsApp(lead.phone);
      
      if (!formattedPhone || formattedPhone.length < 10) {
        alert('Invalid phone number format for WhatsApp')
        setSendingWhatsApp(null)
        setStatus(prev => ({ 
          ...prev, 
          [lead.id]: { 
            ...prev[lead.id], 
            whatsapp: 'error',
            email: prev[lead.id]?.email
          } 
        }))
        return
      }

      // ✅ FIXED: WhatsApp URL with proper encoding
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Update existing communication with DECODED message
      await updateExistingCommunication(lead.id, 'whatsapp', message);
      
      // Update status after successful opening
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          whatsapp: 'sent',
          email: prev[lead.id]?.email
        } 
      }))

      setTimeout(() => {
        alert(`✅ WhatsApp opened for ${lead.phone}!`)
      }, 1000)

    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      setStatus(prev => ({ 
        ...prev, 
        [lead.id]: { 
          ...prev[lead.id], 
          whatsapp: 'error',
          email: prev[lead.id]?.email
        } 
      }))
      alert('❌ Error preparing WhatsApp')
    } finally {
      // Clear sending state after 2 seconds
      setTimeout(() => {
        setSendingWhatsApp(null)
      }, 2000)
    }
  }

  // ✅ UPDATED: Filtered communications with calendar filter
  const filteredComms = useMemo(() => {
    return communications.filter(c => {
      const matchesSearch = 
        (c.leadName && c.leadName.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (c.message && c.message.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === 'All' || c.type === filterType
      const matchesSentiment = filterSentiment === 'All' || c.sentiment === filterSentiment
      
      // ✅ NEW: Calendar Filter Logic
      let matchesDate = true
      if (filterMode === 'day' && dateFilter && c.date) {
        matchesDate = c.date === dateFilter
      } else if (filterMode === 'month' && monthFilter && c.date) {
        matchesDate = c.date.startsWith(monthFilter)
      } else if (filterMode === 'year' && yearFilter && c.date) {
        matchesDate = c.date.startsWith(yearFilter)
      }
      
      return matchesSearch && matchesType && matchesSentiment && matchesDate
    })
  }, [communications, searchTerm, filterType, filterSentiment, dateFilter, monthFilter, yearFilter, filterMode])

  const stats = useMemo(() => ({
    total: communications.length,
    positive: communications.filter(c => c.sentiment === 'positive').length,
    neutral: communications.filter(c => c.sentiment === 'neutral').length,
    negative: communications.filter(c => c.sentiment === 'negative').length,
    email: communications.filter(c => c.type === 'email').length,
    whatsapp: communications.filter(c => c.type === 'whatsapp').length,
  }), [communications])

  // ✅ NEW: Clear all filters function
  const clearAllFilters = () => {
    setDateFilter('')
    setMonthFilter('')
    setYearFilter('')
    setFilterMode('all')
    setFilterType('All')
    setFilterSentiment('All')
    setSearchTerm('')
  }

  // ✅ NEW: Apply today's date filter
  const applyTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0]
    setDateFilter(today)
    setMonthFilter('')
    setYearFilter('')
    setFilterMode('day')
  }

  // ✅ NEW: Apply current month filter
  const applyCurrentMonthFilter = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    setDateFilter('')
    setMonthFilter(`${year}-${month}`)
    setYearFilter('')
    setFilterMode('month')
  }

  // Delete communication from Firebase
  const handleDeleteComm = useCallback(async (id: string) => {
    if (confirm('Delete this communication log?')) {
      try {
        await deleteDoc(doc(db, 'communications', id))
        alert('Communication deleted successfully!')
      } catch (error) {
        console.error('Error deleting communication:', error)
        alert('Error deleting communication')
      }
    }
  }, [])

  // Edit communication
  const handleEditComm = useCallback((comm: Communication) => {
    setEditingComm(comm)
    setNewCommData({
      leadId: comm.leadId,
      type: comm.type,
      message: comm.message,
      sentiment: comm.sentiment,
      scheduledDate: comm.scheduledDate || '',
      priority: comm.priority || 'normal',
      attachments: []
    })
    setShowNewComm(true)
  }, [])

  // Update communication in Firebase
  const handleUpdateComm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingComm || !newCommData.message) {
      alert('Please enter message')
      return
    }

    try {
      const commRef = doc(db, 'communications', editingComm.id)
      
      await updateDoc(commRef, {
        type: newCommData.type,
        message: newCommData.message,
        sentiment: newCommData.sentiment,
        priority: newCommData.priority,
        scheduledDate: newCommData.scheduledDate || null,
        updatedAt: new Date().toISOString()
      })
      
      // Reset form
      setEditingComm(null)
      setNewCommData({
        leadId: '',
        type: 'email',
        message: '',
        sentiment: 'neutral',
        scheduledDate: '',
        priority: 'normal',
        attachments: []
      })
      
      setShowNewComm(false)
      alert('Communication updated successfully!')
      
    } catch (error) {
      console.error('Error updating communication:', error)
      alert('Error updating communication')
    }
  }

  // Save new communication to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCommData.leadId || !newCommData.message) {
      alert('Please select a lead and enter message')
      return
    }

    try {
      // ✅ UPDATED: Find selected contact from combined list
      const selectedContact = combinedContacts.find(c => c.id === newCommData.leadId);
      let leadName = 'Unknown';
      let leadCompany = '';
      
      if (selectedContact) {
        leadName = selectedContact.name;
        leadCompany = selectedContact.company || '';
      }
      
      const communicationData = {
        leadId: newCommData.leadId,
        leadName: leadName,
        leadCompany: leadCompany,
        type: newCommData.type,
        date: new Date().toISOString().split('T')[0],
        message: newCommData.message,
        sentiment: newCommData.sentiment,
        status: 'logged',
        priority: newCommData.priority,
        scheduledDate: newCommData.scheduledDate || null,
        attachmentsCount: newCommData.attachments.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to Firebase
      await addDoc(collection(db, 'communications'), communicationData)
      
      // Reset form
      setNewCommData({
        leadId: '',
        type: 'email',
        message: '',
        sentiment: 'neutral',
        scheduledDate: '',
        priority: 'normal',
        attachments: []
      })
      
      setShowNewComm(false)
      alert('Communication logged successfully!')
      
    } catch (error) {
      console.error('Error saving communication:', error)
      alert('Error saving communication')
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setNewCommData(prev => ({
      ...prev,
      attachments: files
    }))
  }

  // ✅ FIXED: Get status icon for email/WhatsApp sending
  const getStatusIcon = (type: 'email' | 'whatsapp', leadId: string) => {
    const currentStatus = status[leadId]?.[type]
    
    if (currentStatus === 'sending') {
      return <Loader2 className="w-4 h-4 animate-spin" />
    } else if (currentStatus === 'sent') {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (currentStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
    return type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />
  }

  // Reset status for a lead
  const resetStatusForLead = (leadId: string, type: 'email' | 'whatsapp') => {
    setTimeout(() => {
      setStatus(prev => {
        const newStatus = { ...prev };
        if (newStatus[leadId]) {
          delete newStatus[leadId][type];
          if (Object.keys(newStatus[leadId]).length === 0) {
            delete newStatus[leadId];
          }
        }
        return newStatus;
      });
    }, 5000); // Reset after 5 seconds
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full p-8 space-y-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Communications</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Log</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track and manage all interactions with your leads
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingComm(null)
                  setShowNewComm(true)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Communication
              </button>
              <button
                onClick={() => setShowTemplate(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Zap className="h-4 w-4" />
                Templates
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Calendar Filter Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
            </div>
            <button
              onClick={() => setShowCalendarFilter(!showCalendarFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showCalendarFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Filter by Date
            </button>
          </div>

          {showCalendarFilter && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Day Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value)
                      setMonthFilter('')
                      setYearFilter('')
                      setFilterMode('day')
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  />
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value)
                      setDateFilter('')
                      setYearFilter('')
                      setFilterMode('month')
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  >
                    <option value="">Select Month</option>
                    {availableMonthsYears.months.map((monthYear) => {
                      const [year, month] = monthYear.split('-')
                      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })
                      return (
                        <option key={monthYear} value={monthYear}>
                          {monthName} {year}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => {
                      setYearFilter(e.target.value)
                      setDateFilter('')
                      setMonthFilter('')
                      setFilterMode('year')
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  >
                    <option value="">Select Year</option>
                    {availableMonthsYears.years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={applyTodayFilter}
                  className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg font-medium transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={applyCurrentMonthFilter}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors"
                >
                  Current Month
                </button>
                <button
                  onClick={() => {
                    setFilterMode('all')
                    setDateFilter('')
                    setMonthFilter('')
                    setYearFilter('')
                  }}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium transition-colors"
                >
                  All Time
                </button>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Active Filter Indicator */}
              {(dateFilter || monthFilter || yearFilter) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Active Filter:</span>{' '}
                    {dateFilter && `Showing communications for ${dateFilter}`}
                    {monthFilter && !dateFilter && (() => {
                      const [year, month] = monthFilter.split('-')
                      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })
                      return `Showing communications for ${monthName} ${year}`
                    })()}
                    {yearFilter && !monthFilter && !dateFilter && `Showing communications for year ${yearFilter}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions with Email/WhatsApp Sending */}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Total Interactions', value: stats.total, color: 'blue', icon: Activity },
            { label: 'Positive Sentiment', value: stats.positive, color: 'green', icon: Smile },
            { label: 'Neutral Sentiment', value: stats.neutral, color: 'gray', icon: Meh },
            { label: 'Negative Sentiment', value: stats.negative, color: 'red', icon: Frown },
            { label: 'Email Volume', value: stats.email, color: 'indigo', icon: Mail },
            { label: 'WhatsApp Volume', value: stats.whatsapp, color: 'green', icon: MessageCircle }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                               stat.color === 'green' ? 'bg-green-50 text-green-600' :
                               stat.color === 'red' ? 'bg-red-50 text-red-600' :
                               stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                               'bg-gray-50 text-gray-600'}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-35"
            >
              <option value="All">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Voice Call</option>
            </select>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-35"
            >
              <option value="All">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        {/* Communications List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filteredComms.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Communications Found</h3>
              <p className="text-gray-600 mb-6">
                {communications.length === 0 
                  ? "Start logging your first communication with a lead" 
                  : "No communications match your current filters"}
              </p>
              {communications.length === 0 ? (
                <button
                  onClick={() => {
                    setEditingComm(null)
                    setShowNewComm(true)
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Log First Communication
                </button>
              ) : (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredComms.length}</span> of <span className="font-semibold">{communications.length}</span> communications
                  {(dateFilter || monthFilter || yearFilter) && (
                    <span className="ml-2 text-blue-600">
                      • Filtered by {filterMode === 'day' ? 'date' : filterMode === 'month' ? 'month' : 'year'}
                    </span>
                  )}
                </p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sentiment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComms.map((comm) => {
                    const leadData = leads.find(l => l.id === comm.leadId)
                    const emailStatus = status[leadData?.id || '']?.email
                    const whatsappStatus = status[leadData?.id || '']?.whatsapp
                    
                    return (
                      <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {comm.leadName?.split(' ').map((n: string) => n[0]).join('') || 'NA'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{comm.leadName || 'Unknown Lead'}</p>
                              {comm.leadCompany && (
                                <p className="text-sm text-gray-500">{comm.leadCompany}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {comm.type === 'email' && <Mail className="h-4 w-4 text-indigo-600" />}
                            {comm.type === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-600" />}
                            {comm.type === 'call' && <Phone className="h-4 w-4 text-blue-600" />}
                            <span className="text-sm font-medium text-gray-900 capitalize">{comm.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 max-w-xs truncate">{comm.message.slice(0,5)}...</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            comm.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            comm.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comm.sentiment === 'positive' && <Smile className="h-3 w-3" />}
                            {comm.sentiment === 'negative' && <Frown className="h-3 w-3" />}
                            {comm.sentiment === 'neutral' && <Meh className="h-3 w-3" />}
                            {comm.sentiment}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            comm.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            comm.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            comm.priority === 'low' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comm.priority || 'normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <CalendarIcon className="h-4 w-4" />
                            {comm.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            comm.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comm.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Send Email Button */}
                            {leadData?.email && (
                              <button
                                onClick={() => {
                                  handleSendEmail(leadData, comm.message);
                                  resetStatusForLead(leadData.id, 'email');
                                }}
                                disabled={sendingEmail === leadData.id || emailStatus === 'sending'}
                                className={`p-2 rounded-lg transition-colors ${
                                  emailStatus === 'sent' 
                                    ? 'bg-green-100 text-green-600' 
                                    : emailStatus === 'sending'
                                    ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                                    : emailStatus === 'error'
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Send via Email"
                              >
                                {getStatusIcon('email', leadData.id)}
                              </button>
                            )}

                            {/* Send WhatsApp Button */}
                            {leadData?.phone && (
                              <button
                                onClick={() => {
                                  handleSendWhatsApp(leadData, comm.message);
                                  resetStatusForLead(leadData.id, 'whatsapp');
                                }}
                                disabled={sendingWhatsApp === leadData.id || whatsappStatus === 'sending'}
                                className={`p-2 rounded-lg transition-colors ${
                                  whatsappStatus === 'sent' 
                                    ? 'bg-green-100 text-green-600' 
                                    : whatsappStatus === 'sending'
                                    ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                    : whatsappStatus === 'error'
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                                title="Send via WhatsApp"
                              >
                                {getStatusIcon('whatsapp', leadData.id)}
                              </button>
                            )}

                            {leadData && (
                              <button
                                onClick={() => {
                                  setSelectedLeadForHistory(leadData)
                                  setShowLeadHistory(true)
                                }}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Lead Communication History"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedLead(leadData || null)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Lead Details"
                              disabled={!leadData}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditComm(comm)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Communication"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComm(comm.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Communication"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Template Modal */}
        {showTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Communication Templates</h2>
                    <p className="text-gray-600 text-sm mt-1">Ready-to-use templates for different scenarios</p>
                  </div>
                </div>
                <button onClick={() => setShowTemplate(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(templates).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      <div className="flex gap-2">
                        <button 
                          className="p-2 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setNewCommData(prev => ({
                              ...prev,
                              type: 'email',
                              message: value.email
                            }))
                            setShowTemplate(false)
                            setEditingComm(null)
                            setShowNewComm(true)
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 bg-white hover:bg-green-50 border border-gray-200 rounded-lg text-gray-600 hover:text-green-600 transition-colors"
                          onClick={() => {
                            setNewCommData(prev => ({
                              ...prev,
                              type: 'whatsapp',
                              message: value.whatsapp
                            }))
                            setShowTemplate(false)
                            setEditingComm(null)
                            setShowNewComm(true)
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 font-mono leading-relaxed line-clamp-4">
                        {value.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(value.email);
                        alert('Template copied!');
                      }}
                      className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="h-4 w-4" /> Copy Template
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 flex justify-end border-t border-gray-200">
                <button
                  onClick={() => setShowTemplate(false)}
                  className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New/Edit Communication Form Modal */}
        {showNewComm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingComm ? 'Edit Communication' : 'New Communication'}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {editingComm ? 'Update existing interaction' : 'Log a new interaction with a lead'}
                    </p>
                  </div>
                </div>
                <button onClick={() => {
                  setShowNewComm(false)
                  setEditingComm(null)
                  setNewCommData({
                    leadId: '',
                    type: 'email',
                    message: '',
                    sentiment: 'neutral',
                    scheduledDate: '',
                    priority: 'normal',
                    attachments: []
                  })
                }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={editingComm ? handleUpdateComm : handleSubmit} className="p-6 space-y-6">
                {!editingComm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Lead *</label>
                      <select
                        value={newCommData.leadId}
                        onChange={(e) => setNewCommData({...newCommData, leadId: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-medium"
                        required={!editingComm}
                        disabled={!!editingComm}
                      >
                        <option value="">Choose a lead/client...</option>
                        
                        {/* ✅ UPDATED: Leads Section */}
                        <optgroup label="Leads">
                          {leads.map((lead) => (
                            <option key={lead.id} value={lead.id}>
                              📋 {lead.name} - {lead.company} (Lead)
                            </option>
                          ))}
                        </optgroup>
                        
                        {/* ✅ NEW: Clients Section */}
                        <optgroup label="Clients">
                          {clients.map((client) => (
                            <option key={`client_${client.id}`} value={`client_${client.id}`}>
                              ✅ {client.name} - {client.company} (Client)
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Communication Type</label>
                      <select
                        value={newCommData.type}
                        onChange={(e) => setNewCommData({...newCommData, type: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-medium"
                      >
                        <option value="email">📧 Email</option>
                        <option value="whatsapp">💬 WhatsApp</option>
                        <option value="call">📞 Phone Call</option>
                        
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={newCommData.message}
                    onChange={(e) => setNewCommData({...newCommData, message: e.target.value})}
                    placeholder="Enter the communication details..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sentiment</label>
                    <select
                      value={newCommData.sentiment}
                      onChange={(e) => setNewCommData({...newCommData, sentiment: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-medium"
                    >
                      <option value="positive">😊 Positive</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="negative">😞 Negative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={newCommData.priority}
                      onChange={(e) => setNewCommData({...newCommData, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 font-medium"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Follow-up</label>
                    <input
                      type="date"
                      value={newCommData.scheduledDate}
                      onChange={(e) => setNewCommData({...newCommData, scheduledDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewComm(false)
                      setEditingComm(null)
                      setNewCommData({
                        leadId: '',
                        type: 'email',
                        message: '',
                        sentiment: 'neutral',
                        scheduledDate: '',
                        priority: 'normal',
                        attachments: []
                      })
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {editingComm ? 'Update Communication' : 'Log Communication'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lead Details Modal */}
        {selectedLead && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedLead.company}</p>
          </div>
        </div>
        <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <p className="text-gray-900 mt-1">{selectedLead.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
            <p className="text-gray-900 mt-1">{selectedLead.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Deal Value</label>
            <p className="text-gray-900 mt-1 font-semibold">AED {selectedLead.value ? selectedLead.value.toLocaleString() : '0'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</label>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
              selectedLead.status === 'Won' ? 'bg-green-100 text-green-800' :
              selectedLead.status === 'Negotiation' ? 'bg-yellow-100 text-yellow-800' :
              selectedLead.status === 'Proposal' ? 'bg-blue-100 text-blue-800' :
              selectedLead.status === 'Qualified' ? 'bg-purple-100 text-purple-800' :
              selectedLead.status === 'Contacted' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedLead.status || 'New'}
            </span>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Industry</label>
            <p className="text-gray-900 mt-1">{selectedLead.industry || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Source</label>
            <p className="text-gray-900 mt-1">{selectedLead.source || 'N/A'}</p>
          </div>
          {selectedLead.website && (
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Website</label>
              <p className="text-gray-900 mt-1">
                <a href={`https://${selectedLead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {selectedLead.website}
                </a>
              </p>
            </div>
          )}
          {selectedLead.employees && (
            <div>
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Employees</label>
              <p className="text-gray-900 mt-1">{selectedLead.employees}</p>
            </div>
          )}
        </div>

        {selectedLead.address && (
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Address</label>
            <p className="text-gray-900 mt-1">{selectedLead.address}</p>
          </div>
        )}

        {selectedLead.notes && (
          <div>
            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
            <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedLead.notes}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h3>
          <div className="space-y-3 pr-2">
            {communications.filter(c => c.leadId === selectedLead.id).slice(0, 3).map((comm) => (
              <div key={comm.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="shrink-0">
                  {comm.type === 'email' && <Mail className="h-4 w-4 text-indigo-600 mt-0.5" />}
                  {comm.type === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                  {comm.type === 'call' && <Phone className="h-4 w-4 text-blue-600 mt-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2">{comm.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{comm.date} • {comm.status}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  comm.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  comm.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {comm.sentiment === 'positive' && <Smile className="h-3 w-3" />}
                  {comm.sentiment === 'negative' && <Frown className="h-3 w-3" />}
                  {comm.sentiment === 'neutral' && <Meh className="h-3 w-3" />}
                  {comm.sentiment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 flex justify-end border-t border-gray-200 shrink-0">
        <button
          onClick={() => setSelectedLead(null)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

        {/* Lead Communication History Modal */}
        {showLeadHistory && selectedLeadForHistory && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Communication History</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedLeadForHistory.name} - {selectedLeadForHistory.company}</p>
          </div>
        </div>
        <button onClick={() => setShowLeadHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Communication Stats for this Lead */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(() => {
            const leadComms = communications.filter(c => c.leadId === selectedLeadForHistory.id)
            const stats = {
              total: leadComms.length,
              positive: leadComms.filter(c => c.sentiment === 'positive').length,
              email: leadComms.filter(c => c.type === 'email').length,
              whatsapp: leadComms.filter(c => c.type === 'whatsapp').length
            }
            return [
              { label: 'Total Interactions', value: stats.total, icon: Activity, color: 'blue' },
              { label: 'Positive Sentiment', value: stats.positive, icon: Smile, color: 'green' },
              { label: 'Email Count', value: stats.email, icon: Mail, color: 'indigo' },
              { label: 'WhatsApp Count', value: stats.whatsapp, icon: MessageCircle, color: 'green' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'green' ? 'bg-green-100 text-green-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))
          })()}
        </div>

        {/* Communication Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Communication Timeline
          </h3>

          {communications.filter(c => c.leadId === selectedLeadForHistory.id).length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No communications found for this lead</p>
              <button
                onClick={() => {
                  setNewCommData({...newCommData, leadId: selectedLeadForHistory.id})
                  setShowNewComm(true)
                  setShowLeadHistory(false)
                }}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add First Communication
              </button>
            </div>
          ) : (
            <div className="space-y-4 pr-2">
              {communications
                .filter(c => c.leadId === selectedLeadForHistory.id)
                .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
                .map((comm) => (
                <div key={comm.id} className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      comm.type === 'email' ? 'bg-indigo-100 text-indigo-600' :
                      comm.type === 'whatsapp' ? 'bg-green-100 text-green-600' :
                      comm.type === 'call' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {comm.type === 'email' && <Mail className="h-5 w-5" />}
                      {comm.type === 'whatsapp' && <MessageCircle className="h-5 w-5" />}
                      {comm.type === 'call' && <Phone className="h-5 w-5" />}
                      {comm.type === 'meeting' && <User className="h-5 w-5" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 capitalize">{comm.type}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          comm.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          comm.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comm.sentiment === 'positive' && <Smile className="h-3 w-3" />}
                          {comm.sentiment === 'negative' && <Frown className="h-3 w-3" />}
                          {comm.sentiment === 'neutral' && <Meh className="h-3 w-3" />}
                          {comm.sentiment}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          comm.status === 'completed' ? 'bg-green-100 text-green-800' :
                          comm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {comm.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{comm.date}</span>
                    </div>

                    <p className="text-gray-700 mb-2 line-clamp-2">{comm.message}</p>

                    {comm.priority && comm.priority !== 'normal' && (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className={`h-4 w-4 ${
                          comm.priority === 'urgent' ? 'text-red-500' :
                          comm.priority === 'high' ? 'text-orange-500' :
                          'text-blue-500'
                        }`} />
                        <span className={`text-xs font-semibold uppercase ${
                          comm.priority === 'urgent' ? 'text-red-700' :
                          comm.priority === 'high' ? 'text-orange-700' :
                          'text-blue-700'
                        }`}>
                          {comm.priority} Priority
                        </span>
                      </div>
                    )}

                    {comm.scheduledDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        Follow-up scheduled: {comm.scheduledDate}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    {/* Send Email/WhatsApp buttons in timeline */}
                    {selectedLeadForHistory.email && (
                      <button
                        onClick={() => {
                          handleSendEmail(selectedLeadForHistory, comm.message);
                          resetStatusForLead(selectedLeadForHistory.id, 'email');
                        }}
                        disabled={sendingEmail === selectedLeadForHistory.id || status[selectedLeadForHistory.id]?.email === 'sending'}
                        className={`p-2 rounded-lg transition-colors ${
                          status[selectedLeadForHistory.id]?.email === 'sent' 
                            ? 'bg-green-100 text-green-600' 
                            : sendingEmail === selectedLeadForHistory.id
                            ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                            : status[selectedLeadForHistory.id]?.email === 'error'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Send via Email"
                      >
                        {getStatusIcon('email', selectedLeadForHistory.id)}
                      </button>
                    )}

                    {selectedLeadForHistory.phone && (
                      <button
                        onClick={() => {
                          handleSendWhatsApp(selectedLeadForHistory, comm.message);
                          resetStatusForLead(selectedLeadForHistory.id, 'whatsapp');
                        }}
                        disabled={sendingWhatsApp === selectedLeadForHistory.id || status[selectedLeadForHistory.id]?.whatsapp === 'sending'}
                        className={`p-2 rounded-lg transition-colors ${
                          status[selectedLeadForHistory.id]?.whatsapp === 'sent' 
                            ? 'bg-green-100 text-green-600' 
                            : sendingWhatsApp === selectedLeadForHistory.id
                            ? 'bg-green-100 text-green-600 cursor-not-allowed'
                            : status[selectedLeadForHistory.id]?.whatsapp === 'error'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title="Send via WhatsApp"
                      >
                        {getStatusIcon('whatsapp', selectedLeadForHistory.id)}
                      </button>
                    )}

                    <button
                      onClick={() => handleEditComm(comm)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Communication"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComm(comm.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Communication"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-200 shrink-0">
        <button
          onClick={() => {
            setNewCommData({...newCommData, leadId: selectedLeadForHistory.id})
            setShowNewComm(true)
            setShowLeadHistory(false)
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Communication
        </button>
        <button
          onClick={() => setShowLeadHistory(false)}
          className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  )
}