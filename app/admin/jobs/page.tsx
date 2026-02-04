'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Trash2,
  CheckCircle,
  Clock,
  X,
  Briefcase,
  DollarSign,
  Camera,
  Play,
  Eye,
  Bell,
  BellOff,
  ShoppingCart,
  Edit,
  Zap,
  AlertTriangle,
  Check,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase' // Your Firebase config
import { MOCK_ATTENDANCE, Attendance } from '@/lib/hr-data'

interface Job {
  id: string // Firestore document ID
  title: string
  client: string
  clientId: string
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  scheduledDate: string | null
  scheduledTime?: string
  endTime?: string
  location: string
  teamRequired: number
  budget: number
  actualCost: number
  description: string
  riskLevel: 'Low' | 'Medium' | 'High'
  slaDeadline?: string
  estimatedDuration: string
  requiredSkills: string[]
  permits: string[]
  tags: string[]
  specialInstructions?: string
  recurring: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
  executionLogs: any[]
  assignedTo: string[]
  reminderEnabled?: boolean
  reminderDate?: string
  reminderSent?: boolean
  services?: JobService[]
  overtimeRequired?: boolean
  overtimeHours?: number
  overtimeReason?: string
  overtimeApproved?: boolean
}

interface JobService {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
  description?: string
}

interface NewJobForm {
  title: string
  client: string
  clientId: string | null
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  scheduledDate: string
  scheduledTime: string
  endTime: string
  location: string
  teamRequired: number
  budget: number
  description: string
  riskLevel: 'Low' | 'Medium' | 'High'
  slaDeadline: string
  estimatedDuration: string
  requiredSkills: string
  permits: string
  tags: string
  specialInstructions: string
  recurring: boolean
  services?: JobService[]
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [selectedJobForExecution, setSelectedJobForExecution] = useState<Job | null>(null)
  const [executionChecklist, setExecutionChecklist] = useState<string[]>([])
  const [executionNotes, setExecutionNotes] = useState('')
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [showNewJobForm, setShowNewJobForm] = useState(false)
  const [attendance] = useState<Attendance[]>(MOCK_ATTENDANCE)
  const [clients, setClients] = useState<any[]>([])

  const [newJobForm, setNewJobForm] = useState<NewJobForm>({
    title: '',
    client: '',
    clientId: null,
    priority: 'Medium',
    scheduledDate: '',
    scheduledTime: '',
    endTime: '',
    location: '',
    teamRequired: 1,
    budget: 0,
    description: '',
    riskLevel: 'Low',
    slaDeadline: '',
    estimatedDuration: '',
    requiredSkills: '',
    permits: '',
    tags: '',
    specialInstructions: '',
    recurring: false,
    services: []
  })

  // Fetch jobs from Firebase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const jobsQuery = query(collection(db, 'jobs'))
        const jobsSnapshot = await getDocs(jobsQuery)
        
        const jobsData = jobsSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title || '',
            client: data.client || '',
            clientId: data.clientId || '',
            status: data.status || 'Pending',
            priority: data.priority || 'Medium',
            scheduledDate: data.scheduledDate || null,
            scheduledTime: data.scheduledTime || '',
            endTime: data.endTime || '',
            location: data.location || '',
            teamRequired: data.teamRequired || 1,
            budget: data.budget || 0,
            actualCost: data.actualCost || 0,
            description: data.description || '',
            riskLevel: data.riskLevel || 'Low',
            slaDeadline: data.slaDeadline || '',
            estimatedDuration: data.estimatedDuration || '',
            requiredSkills: data.requiredSkills || [],
            permits: data.permits || [],
            tags: data.tags || [],
            specialInstructions: data.specialInstructions || '',
            recurring: data.recurring || false,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            completedAt: data.completedAt || '',
            executionLogs: data.executionLogs || [],
            assignedTo: data.assignedTo || [],
            reminderEnabled: data.reminderEnabled || false,
            reminderDate: data.reminderDate || '',
            reminderSent: data.reminderSent || false,
            services: data.services || [],
            overtimeRequired: data.overtimeRequired || false,
            overtimeHours: data.overtimeHours || 0,
            overtimeReason: data.overtimeReason || '',
            overtimeApproved: data.overtimeApproved || false
          } as Job
        })
        
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        alert('Error loading jobs from database')
      } finally {
        setLoading(false)
      }
    }

    const fetchClients = async () => {
      try {
        const clientsQuery = query(collection(db, 'clients'))
        const clientsSnapshot = await getDocs(clientsQuery)
        
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setClients(clientsData)
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    fetchJobs()
    fetchClients()
  }, [])

  // Calculate statistics
  const stats = useMemo(() => ({
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'Pending').length,
    scheduled: jobs.filter(j => j.status === 'Scheduled').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    totalBudget: jobs.reduce((sum, j) => sum + j.budget, 0),
    totalActualCost: jobs.reduce((sum, j) => sum + j.actualCost, 0),
    critical: jobs.filter(j => j.priority === 'Critical').length
  }), [jobs])

  // Get team attendance for a job
  const getTeamAttendance = (jobTitle: string) => {
    return attendance.filter(a => a.jobTitle === jobTitle && a.status === 'On Job')
  }

  // Get employee status on a job
  const getEmployeeStatus = (name: string) => {
    const record = attendance.find(a => a.employeeName === name)
    return record ? { status: record.status, clockIn: record.clockIn, clockOut: record.clockOut } : null
  }

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [jobs, searchTerm, statusFilter, priorityFilter])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Cancelled': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const handleAddJob = () => {
    setEditingJobId(null)
    setNewJobForm({
      title: '',
      client: '',
      clientId: null,
      priority: 'Medium',
      scheduledDate: '',
      scheduledTime: '',
      endTime: '',
      location: '',
      teamRequired: 1,
      budget: 0,
      description: '',
      riskLevel: 'Low',
      slaDeadline: '',
      estimatedDuration: '',
      requiredSkills: '',
      permits: '',
      tags: '',
      specialInstructions: '',
      recurring: false,
      services: []
    })
    setShowNewJobModal(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJobId(job.id)
    setNewJobForm({
      title: job.title,
      client: job.client,
      clientId: job.clientId,
      priority: job.priority,
      scheduledDate: job.scheduledDate || '',
      scheduledTime: job.scheduledTime || '',
      endTime: job.endTime || '',
      location: job.location,
      teamRequired: job.teamRequired,
      budget: job.budget,
      description: job.description,
      riskLevel: job.riskLevel,
      slaDeadline: job.slaDeadline || '',
      estimatedDuration: job.estimatedDuration,
      requiredSkills: job.requiredSkills.join(', '),
      permits: job.permits.join(', '),
      tags: job.tags.join(', '),
      specialInstructions: job.specialInstructions || '',
      recurring: job.recurring,
      services: job.services || []
    })
    setShowNewJobModal(true)
  }

  const handleSaveJob = useCallback(async () => {
    if (!newJobForm.title || !newJobForm.client || !newJobForm.location) {
      alert('Please fill in all required fields: Title, Client, and Location')
      return
    }

    try {
      const jobData = {
        title: newJobForm.title,
        client: newJobForm.client,
        clientId: newJobForm.clientId || '',
        priority: newJobForm.priority,
        scheduledDate: newJobForm.scheduledDate || null,
        scheduledTime: newJobForm.scheduledTime,
        endTime: newJobForm.endTime,
        location: newJobForm.location,
        teamRequired: newJobForm.teamRequired,
        budget: newJobForm.budget,
        description: newJobForm.description,
        riskLevel: newJobForm.riskLevel,
        slaDeadline: newJobForm.slaDeadline,
        estimatedDuration: newJobForm.estimatedDuration,
        requiredSkills: newJobForm.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        permits: newJobForm.permits.split(',').map(s => s.trim()).filter(s => s),
        tags: newJobForm.tags.split(',').map(s => s.trim()).filter(s => s),
        specialInstructions: newJobForm.specialInstructions,
        recurring: newJobForm.recurring,
        services: newJobForm.services || [],
        updatedAt: new Date().toISOString(),
        assignedTo: [],
        executionLogs: [],
        actualCost: 0,
        reminderEnabled: false
      }

      if (editingJobId) {
        // Update existing job in Firebase
        const jobRef = doc(db, 'jobs', editingJobId)
        await updateDoc(jobRef, jobData)
        
        // Update local state
        setJobs(jobs.map(j =>
          j.id === editingJobId
            ? { ...j, ...jobData, id: editingJobId }
            : j
        ))
        alert('Job updated successfully!')
      } else {
        // Create new job in Firebase
        const newJobData = {
          ...jobData,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          completedAt: '',
          reminderSent: false,
          overtimeRequired: false,
          overtimeHours: 0,
          overtimeReason: '',
          overtimeApproved: false
        }

        const docRef = await addDoc(collection(db, 'jobs'), newJobData)
        
        // Add to local state with Firestore ID
        const newJob: Job = {
          id: docRef.id,
          ...newJobData
        } as Job
        
        setJobs([...jobs, newJob])
        alert('Job created successfully!')
      }
      
      setShowNewJobModal(false)
      setEditingJobId(null)
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Error saving job. Please try again.')
    }
  }, [newJobForm, jobs, editingJobId])

  const handleToggleReminder = useCallback(async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) return

      const newReminderEnabled = !job.reminderEnabled
      let reminderDate = job.reminderDate
      
      if (newReminderEnabled && job.scheduledDate) {
        const reminder = new Date(job.scheduledDate + 'T00:00:00')
        reminder.setDate(reminder.getDate() - 1)
        reminderDate = reminder.toISOString().split('T')[0]
      }

      // Update in Firebase
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        reminderEnabled: newReminderEnabled,
        reminderDate: reminderDate
      })

      // Update local state
      setJobs(jobs.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            reminderEnabled: newReminderEnabled,
            reminderDate: reminderDate
          }
        }
        return j
      }))
    } catch (error) {
      console.error('Error updating reminder:', error)
      alert('Error updating reminder')
    }
  }, [jobs])

  const handleUpdateJobStatus = useCallback(async (jobId: string, newStatus: Job['status']) => {
    try {
      // Update in Firebase
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setJobs(jobs.map(j =>
        j.id === jobId
          ? { ...j, status: newStatus, updatedAt: new Date().toISOString() }
          : j
      ))
      alert(`Job status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Error updating job status')
    }
  }, [jobs])

  const handleDeleteJob = useCallback(async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      // Delete from Firebase
      const jobRef = doc(db, 'jobs', jobId)
      await deleteDoc(jobRef)

      // Update local state
      setJobs(jobs.filter(j => j.id !== jobId))
      alert('Job deleted successfully')
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job')
    }
  }, [jobs])

  const handleStartExecution = (job: Job) => {
    setSelectedJobForExecution(job)
    setExecutionChecklist([])
    setExecutionNotes('')
    setShowExecutionModal(true)
  }

  const handleLogExecution = async () => {
    if (!selectedJobForExecution) return
    
    try {
      // Update job status in Firebase
      const jobRef = doc(db, 'jobs', selectedJobForExecution.id)
      await updateDoc(jobRef, {
        status: 'In Progress',
        updatedAt: new Date().toISOString()
      })

      // Add execution log
      const executionLog = {
        timestamp: new Date().toISOString(),
        checklist: executionChecklist,
        notes: executionNotes,
        type: 'execution_started'
      }

      await updateDoc(jobRef, {
        executionLogs: [...selectedJobForExecution.executionLogs, executionLog]
      })

      // Update local state
      handleUpdateJobStatus(selectedJobForExecution.id, 'In Progress')
      setShowExecutionModal(false)
    } catch (error) {
      console.error('Error logging execution:', error)
      alert('Error logging execution')
    }
  }

  const handleSaveNewJob = useCallback(async (jobData: any) => {
    try {
      // Validate required fields
      if (!jobData.title || !jobData.client || !jobData.location) {
        alert('Please fill in all required fields: Title, Client, and Location')
        return
      }

      // Prepare job data for Firebase
      const newJobData = {
        title: jobData.title,
        client: jobData.client,
        clientId: jobData.clientId || '',
        description: jobData.description || '',
        status: 'Pending',
        priority: jobData.priority || 'Medium',
        location: jobData.location,
        scheduledDate: jobData.scheduledDate || null,
        scheduledTime: jobData.scheduledTime || '09:00',
        endTime: jobData.endTime || '17:00',
        estimatedDuration: jobData.estimatedDuration || '8 hours',
        slaDeadline: jobData.slaDeadline || '',
        riskLevel: jobData.riskLevel || 'Low',
        teamRequired: jobData.teamRequired || 1,
        budget: jobData.budget || 0,
        actualCost: 0,
        requiredSkills: jobData.requiredSkills || [],
        permits: jobData.permits || [],
        tags: jobData.tags || [],
        specialInstructions: jobData.specialInstructions || '',
        services: jobData.services || [],
        recurring: jobData.recurring || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionLogs: [],
        assignedTo: [],
        reminderEnabled: false,
        reminderSent: false,
        overtimeRequired: false,
        overtimeHours: 0,
        overtimeReason: '',
        overtimeApproved: false
      }

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'jobs'), newJobData)
      
      // Add to local state with Firestore ID
      const newJob: Job = {
        id: docRef.id,
        ...newJobData
      } as Job
      
      setJobs([...jobs, newJob])
      setShowNewJobForm(false)
      alert(`Job "${newJob.title}" created successfully`)
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Error creating job. Please try again.')
    }
  }, [jobs])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
        <p className="text-gray-600">Manage, track, and execute cleaning jobs in real-time</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Budget Utilization</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {stats.totalBudget > 0 ? ((stats.totalActualCost / stats.totalBudget) * 100).toFixed(0) : '0'}%
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, client, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <button
              onClick={handleAddJob}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Job
            </button>

            <Link href="/admin/jobs/expense-manager">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                <DollarSign className="w-4 h-4" />
                Expense Manager
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/admin/jobs/${job.id}`}>
                    <div className="cursor-pointer group mb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{job.client}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <span className={`text-xs font-bold px-3 py-1 border rounded-full ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1 border rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          {job.overtimeRequired && (
                            <span className={`text-xs font-bold px-3 py-1 border rounded-full flex items-center gap-1 ${job.overtimeApproved ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                              <Zap className="h-3 w-3" /> OT: {job.overtimeHours}h {job.overtimeApproved ? '✓' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{job.scheduledDate ? new Date(job.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Not scheduled'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0" />
                          <span>{job.teamRequired} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 shrink-0" />
                          <span>AED {job.budget.toLocaleString()}</span>
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
                      )}

                      {/* Team Attendance Status */}
                      {(job.status === 'In Progress' || job.status === 'Scheduled') && job.assignedTo.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Team Status
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.assignedTo.map((member, idx) => {
                              const empStatus = getEmployeeStatus(member)
                              return (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                    empStatus?.status === 'On Job'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : empStatus?.status === 'Present'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {member} {empStatus?.status === 'On Job' ? '✓' : ''}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    {job.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'Scheduled')}
                          className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </>
                    )}

                    {(job.status === 'Scheduled' || job.status === 'In Progress') && (
                      <>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleReminder(job.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                            job.reminderEnabled
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {job.reminderEnabled ? (
                            <>
                              <Bell className="h-3 w-3" />
                              Reminder Set
                            </>
                          ) : (
                            <>
                              <BellOff className="h-3 w-3" />
                              Set Reminder
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {job.reminderEnabled && job.reminderDate && (
                      <div className="text-xs px-2 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Reminder: {new Date(job.reminderDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}

                    {job.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => handleStartExecution(job)}
                          className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Execute
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
                          className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                        >
                          Start
                        </button>
                      </>
                    )}

                    {job.status === 'In Progress' && (
                      <>
                        <button
                          onClick={() => handleStartExecution(job)}
                          className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <Camera className="h-3 w-3" />
                          On Site
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
                          className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </button>
                      </>
                    )}

                    <Link href={`/admin/jobs/${job.id}`}>
                      <button className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No jobs found</p>
            <p className="text-sm text-gray-600">Try adjusting your filters or create a new job</p>
          </div>
        )}
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => { setShowNewJobModal(false); setEditingJobId(null) }}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{editingJobId ? 'Edit Job' : 'Create New Job'}</h2>
                <p className="text-blue-100 text-sm mt-1">Complete all job details</p>
              </div>
              <button onClick={() => { setShowNewJobModal(false); setEditingJobId(null) }} className="text-blue-100 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={newJobForm.title}
                      onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Office Deep Cleaning"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Client *</label>
                    <select
                      value={newJobForm.clientId || ''}
                      onChange={(e) => {
                        const selected = clients.find(c => c.id === e.target.value)
                        setNewJobForm({
                          ...newJobForm,
                          clientId: selected?.id || null,
                          client: selected?.name || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    {newJobForm.clientId === null && newJobForm.client && (
                      <p className="text-sm text-gray-500 mt-1">Client will be saved as: {newJobForm.client}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
                  <textarea
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Detailed job description..."
                  />
                </div>
              </div>

              {/* Location & Priority */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Location & Priority
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter job location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Priority *</label>
                    <select
                      value={newJobForm.priority}
                      onChange={(e) => setNewJobForm({...newJobForm, priority: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Risk Level *</label>
                    <select
                      value={newJobForm.riskLevel}
                      onChange={(e) => setNewJobForm({...newJobForm, riskLevel: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Scheduling
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    value={newJobForm.scheduledDate}
                    onChange={(e) => setNewJobForm({...newJobForm, scheduledDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={newJobForm.scheduledTime}
                      onChange={(e) => setNewJobForm({...newJobForm, scheduledTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">End Time</label>
                    <input
                      type="time"
                      value={newJobForm.endTime}
                      onChange={(e) => setNewJobForm({...newJobForm, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Duration</label>
                    <input
                      type="text"
                      value={newJobForm.estimatedDuration}
                      onChange={(e) => setNewJobForm({...newJobForm, estimatedDuration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., 8 hours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">SLA Deadline</label>
                    <input
                      type="date"
                      value={newJobForm.slaDeadline}
                      onChange={(e) => setNewJobForm({...newJobForm, slaDeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Resources & Budget */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Resources & Budget
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Team Size Required *</label>
                    <input
                      type="number"
                      value={newJobForm.teamRequired}
                      onChange={(e) => setNewJobForm({...newJobForm, teamRequired: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Budget (AED) *</label>
                    <input
                      type="number"
                      value={newJobForm.budget}
                      onChange={(e) => setNewJobForm({...newJobForm, budget: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Required Skills</label>
                  <textarea
                    value={newJobForm.requiredSkills}
                    onChange={(e) => setNewJobForm({...newJobForm, requiredSkills: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Enter skills separated by comma. e.g., General Cleaning, Floor Care"
                  />
                </div>
              </div>

              {/* Permits & Compliance */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Permits & Compliance
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Required Permits</label>
                  <textarea
                    value={newJobForm.permits}
                    onChange={(e) => setNewJobForm({...newJobForm, permits: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Enter permits separated by comma. e.g., Building Access, Safety Certificate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Job Tags</label>
                  <textarea
                    value={newJobForm.tags}
                    onChange={(e) => setNewJobForm({...newJobForm, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    placeholder="Enter tags separated by comma. e.g., Office, Commercial, Urgent"
                  />
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Job Services
                </h3>
                <p className="text-sm text-gray-600">Add services to this job that can be charged to the client</p>
                
                <button
                  onClick={() => {
                    const newService: JobService = {
                      id: Math.random().toString(36).substr(2, 9),
                      name: '',
                      quantity: 1,
                      unitPrice: 0,
                      total: 0
                    }
                    setNewJobForm({
                      ...newJobForm,
                      services: [...(newJobForm.services || []), newService]
                    })
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>

                <div className="space-y-3">
                  {(newJobForm.services || []).map((service, idx) => (
                    <div key={service.id} className="p-4 border border-gray-300 rounded-lg space-y-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-900 mb-1">Service Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Window Cleaning"
                            value={service.name}
                            onChange={(e) => {
                              const updated = [...(newJobForm.services || [])]
                              updated[idx].name = e.target.value
                              setNewJobForm({ ...newJobForm, services: updated })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Quantity</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={service.quantity}
                            onChange={(e) => {
                              const updated = [...(newJobForm.services || [])]
                              updated[idx].quantity = parseInt(e.target.value) || 0
                              updated[idx].total = updated[idx].quantity * updated[idx].unitPrice
                              setNewJobForm({ ...newJobForm, services: updated })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Unit Price (AED)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={service.unitPrice}
                            onChange={(e) => {
                              const updated = [...(newJobForm.services || [])]
                              updated[idx].unitPrice = parseInt(e.target.value) || 0
                              updated[idx].total = updated[idx].quantity * updated[idx].unitPrice
                              setNewJobForm({ ...newJobForm, services: updated })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Total (AED)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={service.total}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-1">Description (Optional)</label>
                        <textarea
                          placeholder="Service description..."
                          value={service.description || ''}
                          onChange={(e) => {
                            const updated = [...(newJobForm.services || [])]
                            updated[idx].description = e.target.value
                            setNewJobForm({ ...newJobForm, services: updated })
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = (newJobForm.services || []).filter((_, i) => i !== idx)
                          setNewJobForm({ ...newJobForm, services: updated })
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Service
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Special Instructions
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Special Instructions</label>
                  <textarea
                    value={newJobForm.specialInstructions}
                    onChange={(e) => setNewJobForm({...newJobForm, specialInstructions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Any special instructions or notes for this job..."
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    checked={newJobForm.recurring}
                    onChange={(e) => setNewJobForm({...newJobForm, recurring: e.target.checked})}
                    className="w-4 h-4 rounded"
                    id="recurring"
                  />
                  <label htmlFor="recurring" className="text-sm font-medium text-gray-900 cursor-pointer">
                    This is a recurring job
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed Bottom */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowNewJobModal(false); setEditingJobId(null) }}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {editingJobId ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      {showExecutionModal && selectedJobForExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Execute: {selectedJobForExecution.title}</h2>
              <button onClick={() => setShowExecutionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Client: </span><span className="font-semibold">{selectedJobForExecution.client}</span></div>
                  <div><span className="text-gray-600">Location: </span><span className="font-semibold">{selectedJobForExecution.location}</span></div>
                  <div><span className="text-gray-600">Team Size: </span><span className="font-semibold">{selectedJobForExecution.teamRequired}</span></div>
                  <div><span className="text-gray-600">Budget: </span><span className="font-semibold">AED {selectedJobForExecution.budget.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Pre-Execution Checklist</h3>
                {['Team arrived on site', 'Equipment setup', 'Safety review', 'Client briefing', 'Work area secured', 'Permits verified'].map(item => (
                  <label key={item} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={executionChecklist.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExecutionChecklist([...executionChecklist, item])
                        } else {
                          setExecutionChecklist(executionChecklist.filter(i => i !== item))
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Documentation</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Before', 'During', 'After'].map(label => (
                    <div key={label} className="aspect-square bg-gray-100 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Notes</h3>
                <textarea
                  value={executionNotes}
                  onChange={(e) => setExecutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  placeholder="Add notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button onClick={() => setShowExecutionModal(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleLogExecution} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Log Execution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}