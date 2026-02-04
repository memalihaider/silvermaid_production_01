'use client'

import { useState, Suspense, useEffect } from 'react'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Tag,
  DollarSign,
  ArrowRight,
  MessageSquare,
  Star,
  Zap,
  ClipboardCheck,
  Navigation,
  AlertTriangle,
  CheckSquare,
  MessageCircle,
  Calendar,
  Timer,
  ShieldCheck,
  Download,
  History,
  FileText,
  Plus,
  ChevronRight,
  Bell,
  TrendingUp,
  Activity,
  Cloud,
  Car,
  Wrench,
  Eye,
  Edit,
  Save,
  X,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  ThumbsUp,
  ThumbsDown,
  Send,
  Phone,
  Mail,
  Building,
  Wifi,
  WifiOff,
  PlayCircle,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

function JobDetailContent() {
  const params = useParams()
  const router = useRouter()
  const jobId = params?.id as string || '1'
  
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'pre-execution' | 'execution' | 'completion' | 'notes' | 'tasks' | 'team' | 'reports' | 'feedback' | 'compensation'>('overview')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [notesText, setNotesText] = useState('')
  const [checklistItems, setChecklistItems] = useState<any[]>([])
  const [equipmentStatus, setEquipmentStatus] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [executionTasks, setExecutionTasks] = useState<any[]>([])
  const [executionTime, setExecutionTime] = useState({
    elapsedHours: 0,
    elapsedMinutes: 0,
    estimatedCompletion: 0,
    lastUpdate: ''
  })
  const [executionNotes, setExecutionNotes] = useState('')
  const [executionPhotos, setExecutionPhotos] = useState<any[]>([])
  const [jobNotes, setJobNotes] = useState<any[]>([])
  const [newJobNote, setNewJobNote] = useState('')
  const [taskAssignments, setTaskAssignments] = useState<any[]>([])
  const [jobReminders, setJobReminders] = useState<any[]>([])
  const [employeeReports, setEmployeeReports] = useState<any[]>([])
  const [employeeFeedback, setEmployeeFeedback] = useState<any[]>([])
  const [showJobNoteModal, setShowJobNoteModal] = useState(false)
  const [showTaskAssignmentModal, setShowTaskAssignmentModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedTeamMember, setSelectedTeamMember] = useState('')
  const [reminderTime, setReminderTime] = useState('08:00')
  const [reminderText, setReminderText] = useState('')
  const [selectedTaskForReminder, setSelectedTaskForReminder] = useState<any>(null)

  // Fetch job data from Firebase
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)
        
        // Fetch main job data
        const jobDoc = await getDoc(doc(db, 'jobs', jobId))
        if (!jobDoc.exists()) {
          router.push('/admin/jobs')
          return
        }
        
        const jobData = jobDoc.data()
        setJob({
          id: jobDoc.id,
          ...jobData,
          daysUntilSLA: jobData.slaDeadline ? 
            Math.ceil((new Date(jobData.slaDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
        })

        // Set default data for development
        setChecklistItems([
          { id: '1', item: 'Job requirements reviewed', status: false },
          { id: '2', item: 'Client contact confirmed', status: false },
          { id: '3', item: 'Site access arrangements', status: false },
          { id: '4', item: 'Safety protocols reviewed', status: false },
          { id: '5', item: 'Equipment requirements checked', status: false },
          { id: '6', item: 'Team availability confirmed', status: false }
        ])

        setEquipmentStatus([
          { id: '1', item: 'Cleaning supplies', status: 'Ready', color: 'green' },
          { id: '2', item: 'Safety equipment', status: 'Ready', color: 'green' },
          { id: '3', item: 'Specialized tools', status: 'Pending', color: 'yellow' },
          { id: '4', item: 'Transportation', status: 'Ready', color: 'green' }
        ])

        setTeamMembers([
          { id: '1', name: 'Ahmed Hassan', role: 'Team Lead', status: 'Confirmed', initials: 'AH', hourlyRate: 150, estimatedHours: 8, totalCompensation: 1200 },
          { id: '2', name: 'Fatima Al-Mazrouei', role: 'Floor Specialist', status: 'Confirmed', initials: 'FA', hourlyRate: 120, estimatedHours: 8, totalCompensation: 960 },
          { id: '3', name: 'Mohammed Bin Ali', role: 'Window Specialist', status: 'Pending', initials: 'MBA', hourlyRate: 110, estimatedHours: 6, totalCompensation: 660 }
        ])

        setActivityLog([
          { id: '1', action: 'Created', timestamp: new Date().toISOString(), user: 'System', details: 'Job created from quotation', type: 'creation' },
          { id: '2', action: 'Scheduled', timestamp: new Date().toISOString(), user: 'Scheduling Team', details: 'Date and time confirmed', type: 'scheduling' },
          { id: '3', action: 'Team Assigned', timestamp: new Date().toISOString(), user: 'HR Manager', details: '3 team members assigned', type: 'assignment' }
        ])

        setExecutionTasks([
          { id: '1', task: 'Floor deep cleaning - Main area', status: 'pending', progress: 0, reminder: null },
          { id: '2', task: 'Window exterior cleaning', status: 'pending', progress: 0, reminder: null },
          { id: '3', task: 'Cubicle sanitization', status: 'pending', progress: 0, reminder: null },
          { id: '4', task: 'Restroom deep clean', status: 'pending', progress: 0, reminder: null }
        ])

        setJobNotes([
          { id: '1', text: 'Client prefers morning service', author: 'Sales Team', timestamp: new Date().toISOString(), type: 'general' },
          { id: '2', text: 'Building access from rear entrance only', author: 'Operations', timestamp: new Date().toISOString(), type: 'important' }
        ])

        setTaskAssignments([
          { id: '1', taskId: '1', taskName: 'Floor deep cleaning - Main area', assignedTo: 'Fatima Al-Mazrouei', status: 'pending' },
          { id: '2', taskId: '2', taskName: 'Window exterior cleaning', assignedTo: 'Mohammed Bin Ali', status: 'pending' },
          { id: '3', taskId: '3', taskName: 'Cubicle sanitization', assignedTo: 'Ahmed Hassan', status: 'pending' }
        ])

        setJobReminders([
          { id: '1', text: 'Team check-in reminder', remindAt: '08:00', enabled: true },
          { id: '2', text: 'Equipment arrival confirmation', remindAt: '07:30', enabled: true }
        ])

        setEmployeeReports([
          { id: '1', employee: 'Ahmed Hassan', jobId: jobId, date: new Date().toISOString(), hoursWorked: 8, tasksCompleted: 4, status: 'submitted', notes: 'All tasks completed successfully' },
          { id: '2', employee: 'Fatima Al-Mazrouei', jobId: jobId, date: new Date().toISOString(), hoursWorked: 7.5, tasksCompleted: 3, status: 'submitted', notes: 'Minor delay due to client requests' }
        ])

        setEmployeeFeedback([
          { id: '1', employee: 'Ahmed Hassan', jobId: jobId, date: new Date().toISOString(), rating: 5, feedback: 'Excellent coordination with team. High quality work delivered on time.', category: 'performance' },
          { id: '2', employee: 'Fatima Al-Mazrouei', jobId: jobId, date: new Date().toISOString(), rating: 4, feedback: 'Good work quality. Communication could be improved.', category: 'performance' }
        ])

      } catch (error) {
        console.error('Error fetching job data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobData()
    }
  }, [jobId, router])

  const handleChecklistChange = (index: number) => {
    setChecklistItems(prev => prev.map((item, i) => 
      i === index ? { ...item, status: !item.status } : item
    ))
    addActivityLog('Checklist Updated', `${checklistItems[index].item} marked as ${!checklistItems[index].status ? 'done' : 'pending'}`)
  }

  const handleEquipmentStatusChange = (index: number, newStatus: string) => {
    setEquipmentStatus(prev => {
      const newColor = newStatus === 'Ready' ? 'green' : newStatus === 'Pending' ? 'yellow' : 'red'
      return prev.map((item, i) => 
        i === index ? { ...item, status: newStatus, color: newColor } : item
      )
    })
    addActivityLog('Equipment Status Updated', `${equipmentStatus[index].item} status changed to ${newStatus}`)
  }

  const handleTeamStatusChange = (index: number, newStatus: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, status: newStatus } : member
    ))
    addActivityLog('Team Status Updated', `${teamMembers[index].name} marked as ${newStatus}`)
  }

  const addActivityLog = (action: string, details: string) => {
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setActivityLog(prev => [{ id: Date.now().toString(), action, timestamp, user: 'Current User', details }, ...prev])
  }

  const handleTaskStatusChange = (index: number, newStatus: string) => {
    setExecutionTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 60 : 0 } : task
    ))
    addActivityLog('Task Updated', `${executionTasks[index].task} status changed to ${newStatus}`)
  }

  const handleTaskProgressChange = (index: number, newProgress: number) => {
    setExecutionTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, progress: newProgress, status: newProgress === 100 ? 'completed' : 'in-progress' } : task
    ))
    addActivityLog('Task Progress Updated', `Task progress updated to ${newProgress}%`)
  }

  const handleSaveExecutionNotes = () => {
    if (executionNotes.trim()) {
      addActivityLog('Execution Notes', executionNotes)
      setExecutionNotes('')
    }
  }

  const handleUploadPhoto = (stage: string) => {
    const newPhoto = {
      id: executionPhotos.length + 1,
      stage: stage,
      uploadedAt: new Date().toLocaleString()
    }
    setExecutionPhotos(prev => [newPhoto, ...prev])
    addActivityLog('Photo Uploaded', `${stage} photo added to documentation`)
  }

  const getTaskProgress = () => {
    const completed = executionTasks.filter(t => t.status === 'completed').length
    const total = executionTasks.length
    return Math.round((completed / total) * 100)
  }

  const handleAddJobNote = () => {
    if (newJobNote.trim()) {
      const newNote = {
        id: jobNotes.length + 1,
        text: newJobNote,
        author: 'Current User',
        timestamp: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'general'
      }
      setJobNotes([...jobNotes, newNote])
      setNewJobNote('')
      addActivityLog('Job Note Added', newJobNote)
      setShowJobNoteModal(false)
    }
  }

  const handleAssignTask = () => {
    if (selectedTask && selectedTeamMember) {
      setTaskAssignments(taskAssignments.map(assignment => 
        assignment.taskId === selectedTask.id 
          ? { ...assignment, assignedTo: selectedTeamMember }
          : assignment
      ))
      addActivityLog('Task Assignment', `${selectedTask.taskName} assigned to ${selectedTeamMember}`)
      setShowTaskAssignmentModal(false)
      setSelectedTask(null)
      setSelectedTeamMember('')
    }
  }

  const handleAddReminder = () => {
    if (reminderText.trim()) {
      const newReminder = {
        id: jobReminders.length + 1,
        text: reminderText,
        remindAt: reminderTime,
        enabled: true
      }
      setJobReminders([...jobReminders, newReminder])
      addActivityLog('Reminder Created', `${reminderText} at ${reminderTime}`)
      setReminderText('')
      setReminderTime('08:00')
      setShowReminderModal(false)
    }
  }

  const handleToggleReminder = (index: number) => {
    setJobReminders(jobReminders.map((reminder, i) =>
      i === index
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    ))
    addActivityLog('Reminder Status', `${jobReminders[index].text} ${!jobReminders[index].enabled ? 'enabled' : 'disabled'}`)
  }

  const handleRemoveReminder = (index: number) => {
    const reminder = jobReminders[index]
    setJobReminders(jobReminders.filter((_, i) => i !== index))
    addActivityLog('Reminder Removed', reminder?.text || '')
  }

  const handleRemoveJobNote = (index: number) => {
    const note = jobNotes[index]
    setJobNotes(jobNotes.filter((_, i) => i !== index))
    addActivityLog('Job Note Removed', note?.text || '')
  }

  const handleAddTaskReminder = (index: number) => {
    if (reminderTime) {
      setExecutionTasks(prev => prev.map((task, i) =>
        i === index
          ? { ...task, reminder: { time: reminderTime, enabled: true } }
          : task
      ))
      addActivityLog('Task Reminder Set', `Reminder set for "${executionTasks[index].task}" at ${reminderTime}`)
      setShowReminderModal(false)
      setReminderTime('08:00')
      setSelectedTaskForReminder(null)
    }
  }

  const handleToggleTaskReminder = (index: number) => {
    setExecutionTasks(prev => prev.map((task, i) =>
      i === index && task.reminder
        ? { ...task, reminder: { ...task.reminder, enabled: !task.reminder.enabled } }
        : task
    ))
  }

  const handleRemoveTaskReminder = (index: number) => {
    setExecutionTasks(prev => prev.map((task, i) =>
      i === index
        ? { ...task, reminder: null }
        : task
    ))
    addActivityLog('Task Reminder Removed', `Reminder removed for "${executionTasks[index].task}"`)
  }

  const handleReassignTeamMember = (taskIndex: number, newMember: string) => {
    const oldAssignment = taskAssignments[taskIndex]
    setTaskAssignments(taskAssignments.map((assignment, idx) =>
      idx === taskIndex
        ? { ...assignment, assignedTo: newMember }
        : assignment
    ))
    addActivityLog('Team Member Reassigned', `${oldAssignment.taskName} reassigned to ${newMember}`)
  }

  const handleUpdateJobStatus = async (newStatus: string) => {
    try {
      // Update in Firebase
      const jobDoc = doc(db, 'jobs', jobId)
      await updateDoc(jobDoc, { 
        status: newStatus,
        updatedAt: Timestamp.fromDate(new Date())
      })
      
      // Update local state
      setJob(prev => ({ ...prev, status: newStatus }))
      addActivityLog('Status Updated', `Job status changed to ${newStatus}`)
      setShowStatusModal(false)
      alert(`Job status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating job status:', error)
      alert('Error updating job status')
    }
  }

  const handleDeleteJob = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        // Delete from Firebase
        await deleteDoc(doc(db, 'jobs', jobId))
        
        alert('Job deleted successfully')
        router.push('/admin/jobs')
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('Error deleting job')
      }
    }
  }

  const handleStartJob = async () => {
    try {
      // Update job status to "In Progress"
      const jobDoc = doc(db, 'jobs', jobId)
      await updateDoc(jobDoc, { 
        status: 'In Progress',
        startedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      })
      
      // Update local state
      setJob(prev => ({ 
        ...prev, 
        status: 'In Progress',
        startedAt: new Date().toISOString()
      }))
      
      addActivityLog('Job Started', 'Job execution started')
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error starting job:', error)
    }
  }

  const handleCompleteJob = async () => {
    try {
      // Update job status to "Completed"
      const jobDoc = doc(db, 'jobs', jobId)
      await updateDoc(jobDoc, { 
        status: 'Completed',
        completedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      })
      
      // Update local state
      setJob(prev => ({ 
        ...prev, 
        status: 'Completed',
        completedAt: new Date().toISOString()
      }))
      
      addActivityLog('Job Completed', 'Job successfully completed')
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error completing job:', error)
    }
  }

  const calculateProgressMetrics = () => {
    const checklistCompletion = checklistItems.length > 0 
      ? Math.round((checklistItems.filter(c => c.status).length / checklistItems.length) * 100)
      : 0
    
    const equipmentReadiness = equipmentStatus.length > 0
      ? Math.round((equipmentStatus.filter(e => e.status === 'Ready').length / equipmentStatus.length) * 100)
      : 0
    
    const teamReadiness = teamMembers.length > 0
      ? Math.round((teamMembers.filter(m => m.status === 'Confirmed').length / teamMembers.length) * 100)
      : 0
    
    const overallReadiness = Math.round((checklistCompletion + equipmentReadiness + teamReadiness) / 3)
    
    return {
      checklistCompletion,
      equipmentReadiness,
      teamReadiness,
      overallReadiness
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
        <Link
          href="/admin/jobs"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>
    )
  }

  const progressMetrics = calculateProgressMetrics()

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 space-y-8">
      {/* Enhanced Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/jobs" className="p-2 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                job.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                job.status === 'In Progress' ? 'bg-green-100 text-green-700' :
                job.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {job.status}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                job.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                job.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                job.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {job.priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job.client}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              {job.scheduledDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(job.scheduledDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl transition-all border border-gray-400"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Job</span>
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Status</span>
          </button>
          <button 
            onClick={handleDeleteJob}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all border border-red-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Enhanced Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { 
            label: 'Scheduled Date', 
            value: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'Not Scheduled', 
            sub: job.scheduledTime || '', 
            icon: Calendar, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Duration', 
            value: job.estimatedDuration || 'Not set', 
            sub: 'Estimated', 
            icon: Timer, 
            color: 'text-indigo-600' 
          },
          { 
            label: 'Budget', 
            value: `AED ${job.budget ? job.budget.toLocaleString() : '0'}`, 
            sub: 'Total Budget', 
            icon: DollarSign, 
            color: 'text-emerald-600' 
          },
          { 
            label: 'SLA Deadline', 
            value: job.slaDeadline ? new Date(job.slaDeadline).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) : 'Not set', 
            sub: job.daysUntilSLA > 0 ? `${job.daysUntilSLA} days left` : 'Expired', 
            icon: ShieldCheck, 
            color: job.daysUntilSLA <= 1 ? 'text-red-600' : 'text-amber-600' 
          },
          { 
            label: 'Risk Level', 
            value: (job.riskLevel || 'Low').toUpperCase(), 
            sub: 'Assessment', 
            icon: job.riskLevel === 'High' ? AlertTriangle : job.riskLevel === 'Medium' ? Clock : CheckCircle, 
            color: job.riskLevel === 'High' ? 'text-red-600' : job.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Enhanced Workflow Actions - Dynamic based on status */}
      {job.status === 'Scheduled' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Pre-Execution Workflow
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Progress: {progressMetrics.overallReadiness}%</span>
              <div className="w-24 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressMetrics.overallReadiness}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveTab('pre-execution')}
              className="group p-4 bg-blue-100 hover:bg-blue-200 border border-blue-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <ClipboardCheck className="w-6 h-6 text-blue-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-blue-900">Pre-Job Checklist</span>
              <div className="text-[10px] text-blue-700 mt-1">{progressMetrics.checklistCompletion}% Complete</div>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className="group p-4 bg-purple-100 hover:bg-purple-200 border border-purple-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <Users className="w-6 h-6 text-purple-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-purple-900">Team Assignment</span>
              <div className="text-[10px] text-purple-700 mt-1">{progressMetrics.teamReadiness}% Ready</div>
            </button>
            <div className="group p-4 bg-green-100 hover:bg-green-200 border border-green-400 rounded-xl text-center transition-all hover:scale-105">
              <ShieldCheck className="w-6 h-6 text-green-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-green-900">Permit Tracker</span>
              <div className="text-[10px] text-green-700 mt-1">{job.permits ? job.permits.length : 0} Approved</div>
            </div>
            <div className="group p-4 bg-orange-100 hover:bg-orange-200 border border-orange-400 rounded-xl text-center transition-all hover:scale-105">
              <Wrench className="w-6 h-6 text-orange-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-orange-900">Equipment</span>
              <div className="text-[10px] text-orange-700 mt-1">{progressMetrics.equipmentReadiness}% Ready</div>
            </div>
            <button
              onClick={() => handleStartJob()}
              className="group p-4 bg-indigo-100 hover:bg-indigo-200 border border-indigo-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <ArrowRight className="w-6 h-6 text-indigo-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-indigo-900">Start Job</span>
              <div className="text-[10px] text-indigo-700 mt-1">Begin Execution</div>
            </button>
          </div>
        </div>
      )}

      {job.status === 'In Progress' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Execution Workflow
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-800">LIVE TRACKING</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveTab('execution')}
              className="group p-4 bg-green-100 hover:bg-green-200 border border-green-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <Eye className="w-6 h-6 text-green-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-green-900">Live View</span>
              <div className="text-[10px] text-green-700 mt-1">Real-time Monitoring</div>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className="group p-4 bg-blue-100 hover:bg-blue-200 border border-blue-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <CheckSquare className="w-6 h-6 text-blue-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-blue-900">Task Progress</span>
              <div className="text-[10px] text-blue-700 mt-1">Track Completion</div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="group p-4 bg-orange-100 hover:bg-orange-200 border border-orange-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <AlertTriangle className="w-6 h-6 text-orange-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-orange-900">Damage Check</span>
              <div className="text-[10px] text-orange-700 mt-1">Quality Control</div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="group p-4 bg-red-100 hover:bg-red-200 border border-red-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <AlertCircle className="w-6 h-6 text-red-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-red-900">Incidents</span>
              <div className="text-[10px] text-red-700 mt-1">Report Issues</div>
            </button>
            <button
              onClick={() => handleCompleteJob()}
              className="group p-4 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <CheckCircle className="w-6 h-6 text-emerald-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-emerald-900">Complete Job</span>
              <div className="text-[10px] text-emerald-700 mt-1">Finish Execution</div>
            </button>
          </div>
        </div>
      )}

      {job.status === 'Completed' && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Post-Completion Workflow
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
              <CheckCircle className="w-3 h-3 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-800">JOB COMPLETED</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveTab('completion')}
              className="group p-4 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <CheckCircle className="w-6 h-6 text-emerald-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-emerald-900">Job Closure</span>
              <div className="text-[10px] text-emerald-700 mt-1">Final Documentation</div>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className="group p-4 bg-indigo-100 hover:bg-indigo-200 border border-indigo-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <Star className="w-6 h-6 text-indigo-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-indigo-900">Client Feedback</span>
              <div className="text-[10px] text-indigo-700 mt-1">Collect Reviews</div>
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className="group p-4 bg-purple-100 hover:bg-purple-200 border border-purple-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <MessageSquare className="w-6 h-6 text-purple-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-purple-900">Review Request</span>
              <div className="text-[10px] text-purple-700 mt-1">Request Approval</div>
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className="group p-4 bg-pink-100 hover:bg-pink-200 border border-pink-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <FileText className="w-6 h-6 text-pink-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-pink-900">Client Summary</span>
              <div className="text-[10px] text-pink-700 mt-1">Final Report</div>
            </button>
            <Link
              href={`/admin/finance/invoice-generator?jobId=${jobId}`}
              className="group p-4 bg-blue-100 hover:bg-blue-200 border border-blue-400 rounded-xl text-center transition-all hover:scale-105"
            >
              <DollarSign className="w-6 h-6 text-blue-700 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-blue-900">Generate Invoice</span>
              <div className="text-[10px] text-blue-700 mt-1">Billing Process</div>
            </Link>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="grid grid-cols-5 gap-2 p-1 bg-white border border-gray-300 rounded-2xl shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'pre-execution', label: 'Pre-Execution', icon: ClipboardCheck },
          { id: 'execution', label: 'Execution', icon: Navigation },
          { id: 'notes', label: 'Notes & Reminders', icon: MessageSquare },
          { id: 'tasks', label: 'Task Assignment', icon: CheckCircle },
          { id: 'team', label: 'Team Management', icon: Users },
          { id: 'compensation', label: 'Compensation', icon: DollarSign },
          { id: 'feedback', label: 'Employee Feedback', icon: Star },
          { id: 'reports', label: 'Employee Reports', icon: FileText },
          { id: 'completion', label: 'Completion', icon: CheckSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="line-clamp-2 text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* Description & Notes */}
              <div className="bg-white border border-gray-300 rounded-3xl p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Job Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{job.description || 'No description provided'}</p>
                </div>
                {job.notes && (
                  <div className="p-6 bg-indigo-50 border border-indigo-300 rounded-2xl">
                    <h4 className="text-sm font-bold text-indigo-900 mb-2">Operational Notes</h4>
                    <p className="text-sm text-gray-800">{job.notes}</p>
                  </div>
                )}
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(job.requiredSkills || []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-300">
                        {skill}
                      </span>
                    ))}
                    {(job.requiredSkills || []).length === 0 && (
                      <span className="text-sm text-gray-500 italic">No skills specified</span>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Permits & Access</h3>
                  <div className="space-y-3">
                    {(job.permits || []).map((permit: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-300">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{permit.name || permit}</div>
                            {permit.expiryDate && (
                              <div className="text-xs text-gray-600">Expires: {permit.expiryDate}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Approved
                        </span>
                      </div>
                    ))}
                    {(job.permits || []).length === 0 && (
                      <div className="text-sm text-gray-500 italic text-center py-4">No permits listed</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'pre-execution' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Pre-Execution Phase</h3>
                <span className="text-xs font-bold text-blue-900 px-3 py-1 bg-blue-100 rounded-full">Preparation Stage</span>
              </div>

              {/* Pre-Execution Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Pre-Job Checklist
                  </h4>
                  <div className="space-y-3">
                    {checklistItems.map((check, i) => (
                      <label key={check.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200">
                        <input
                          type="checkbox"
                          checked={check.status}
                          onChange={() => handleChecklistChange(i)}
                          className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">{check.item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Readiness
                  </h4>
                  <div className="space-y-4">
                    {teamMembers.map((member, i) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-200">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                          member.status === 'Confirmed' ? 'bg-green-600' : 'bg-yellow-600'
                        }`}>
                          {member.initials}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-600">{member.role}</div>
                        </div>
                        <select
                          value={member.status}
                          onChange={(e) => handleTeamStatusChange(i, e.target.value)}
                          className="text-xs font-bold px-2 py-1 rounded-full border cursor-pointer bg-white transition-all hover:border-purple-400"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Permits & Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Permits & Access
                  </h4>
                  <div className="space-y-3">
                    {(job.permits || []).map((permit: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{permit.name || permit}</div>
                            {permit.expiryDate && (
                              <div className="text-xs text-gray-600">Expires: {permit.expiryDate}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Approved
                        </span>
                      </div>
                    ))}
                    {(job.permits || []).length === 0 && (
                      <div className="text-sm text-gray-500 italic text-center py-4">No permits listed</div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Equipment Status
                  </h4>
                  <div className="space-y-3">
                    {equipmentStatus.map((equipment, i) => (
                      <div key={equipment.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-200">
                        <span className="text-sm text-gray-900">{equipment.item}</span>
                        <select
                          value={equipment.status}
                          onChange={(e) => handleEquipmentStatusChange(i, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer transition-all hover:border-orange-400 ${
                            equipment.color === 'green' ? 'bg-green-100 text-green-700 border-green-300' :
                            equipment.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="Ready">Ready</option>
                          <option value="Pending">Pending</option>
                          <option value="Not Ready">Not Ready</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">On-Site Execution</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-800">LIVE</span>
                  </div>
                  <span className="text-xs font-bold text-green-900 px-3 py-1 bg-green-100 rounded-full">In Progress</span>
                </div>
              </div>
              
              {/* Execution Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-900">Task Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mb-2">{getTaskProgress()}%</div>
                  <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${getTaskProgress()}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-green-700">
                    {executionTasks.filter(t => t.status === 'completed').length} of {executionTasks.length} tasks completed
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">Time Tracking</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mb-2">
                    {executionTime.elapsedHours}.{String(executionTime.elapsedMinutes).padStart(2, '0')}h
                  </div>
                  <div className="text-xs text-blue-700 mb-2">
                    Elapsed: {executionTime.elapsedHours}h {executionTime.elapsedMinutes}m
                  </div>
                  <div className="text-xs text-blue-600">
                    Estimated completion: {executionTime.estimatedCompletion}h
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-bold text-orange-900">Live Updates</span>
                  </div>
                  <div className="text-xs text-orange-700 mb-2">Last update: {executionTime.lastUpdate || 'No updates'}</div>
                  <div className="text-xs text-orange-600">Team: On site, working efficiently</div>
                </div>
              </div>

              {/* Current Tasks & Image Documentation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-300 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Current Tasks</h4>
                  <div className="space-y-3">
                    {executionTasks.map((task, i) => (
                      <div key={task.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(i, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-full border cursor-pointer transition-all ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <span className="flex-1 text-sm font-medium text-gray-900">{task.task}</span>
                          <button
                            onClick={() => {
                              setSelectedTaskForReminder(task);
                              setReminderTime('08:00');
                              setShowReminderModal(true);
                            }}
                            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                              task.reminder ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-amber-50'
                            }`}
                          >
                            🔔 {task.reminder ? 'Remind' : 'Set'}
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => handleTaskProgressChange(i, parseInt(e.target.value))}
                            className="flex-1 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-gray-600 w-8 text-right">{task.progress}%</span>
                        </div>
                        {task.reminder && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span className="text-xs text-amber-700 font-medium">Reminder at {task.reminder.time}</span>
                            <button
                              onClick={() => handleToggleTaskReminder(i)}
                              className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-bold"
                            >
                              {task.reminder.enabled ? '✓ On' : '✗ Off'}
                            </button>
                            <button
                              onClick={() => handleRemoveTaskReminder(i)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Image Documentation</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {['Before', 'In Progress', 'After'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => handleUploadPhoto(stage)}
                        className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="text-center">
                          <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">{stage}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => document.getElementById('photo-input')?.click()}
                      className="aspect-square bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all"
                    >
                      <div className="text-center">
                        <Plus className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-blue-600">Add Photo</p>
                      </div>
                    </button>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUploadPhoto('Custom')
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {executionPhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                        <span className="font-medium text-gray-700">{photo.stage}</span>
                        <span className="text-gray-500">{photo.uploadedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Notes */}
              <div className="bg-white border border-gray-300 rounded-2xl p-6 mt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Execution Notes</h4>
                <textarea
                  value={executionNotes}
                  onChange={(e) => setExecutionNotes(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add real-time notes about job execution..."
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSaveExecutionNotes}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:bg-gray-400"
                    disabled={!executionNotes.trim()}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Job Notes & Reminders</h3>
                  <button
                    onClick={() => setShowJobNoteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>

                {/* Notes */}
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Notes
                  </h4>
                  <div className="space-y-3">
                    {jobNotes.map((note, i) => (
                      <div key={note.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm text-gray-900">{note.text}</div>
                            <div className="text-xs text-gray-600 mt-2">{note.author} • {note.timestamp}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveJobNote(i)}
                            className="text-gray-400 hover:text-red-600 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reminders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-600" />
                      Reminders
                    </h4>
                    <button
                      onClick={() => setShowReminderModal(true)}
                      className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Add Reminder
                    </button>
                  </div>
                  <div className="space-y-3">
                    {jobReminders.map((reminder, i) => (
                      <div key={reminder.id} className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={reminder.enabled}
                            onChange={() => handleToggleReminder(i)}
                            className="rounded border-amber-300 text-amber-600"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reminder.text}</div>
                            <div className="text-xs text-gray-600 mt-1">Remind at {reminder.remindAt}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveReminder(i)}
                          className="text-gray-400 hover:text-red-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Task Assignment</h3>
                <button
                  onClick={() => { setSelectedTask(null); setShowTaskAssignmentModal(true) }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Reassign Task</span>
                </button>
              </div>

              <div className="space-y-4">
                {taskAssignments.map((assignment, idx) => (
                  <div key={assignment.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{assignment.taskName}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{assignment.assignedTo}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            assignment.status === 'completed' ? 'bg-emerald-200 text-emerald-800' :
                            assignment.status === 'in-progress' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {assignment.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTask(assignment);
                          setSelectedTeamMember(assignment.assignedTo);
                          setShowTaskAssignmentModal(true);
                        }}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold text-gray-700"
                      >
                        Change Assignment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Team Member Management</h3>
              <div className="space-y-5">
                {taskAssignments.map((assignment, idx) => (
                  <div key={assignment.id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{assignment.taskName}</h4>
                        <div className="text-sm text-gray-700 mb-3">Currently assigned to: <span className="font-bold">{assignment.assignedTo}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={assignment.assignedTo}
                        onChange={(e) => handleReassignTeamMember(idx, e.target.value)}
                        className="flex-1 px-4 py-2 border border-purple-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select a team member...</option>
                        {teamMembers.map((member) => (
                          <option key={member.id} value={member.name}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium">
                        Replace Duty
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compensation' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Team Compensation Analysis
              </h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <div className="text-sm font-medium text-green-700 mb-1">Total Job Cost</div>
                  <div className="text-3xl font-bold text-green-900">
                    AED {teamMembers.reduce((sum, m) => sum + m.totalCompensation, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 mt-2">{teamMembers.length} team members</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="text-sm font-medium text-blue-700 mb-1">Average Rate/Hour</div>
                  <div className="text-3xl font-bold text-blue-900">
                    AED {Math.round(teamMembers.reduce((sum, m) => sum + m.hourlyRate, 0) / teamMembers.length)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">Across all roles</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                  <div className="text-sm font-medium text-purple-700 mb-1">Total Estimated Hours</div>
                  <div className="text-3xl font-bold text-purple-900">
                    {teamMembers.reduce((sum, m) => sum + m.estimatedHours, 0)} hrs
                  </div>
                  <div className="text-xs text-purple-600 mt-2">Project duration</div>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Team Member</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Hourly Rate</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Est. Hours</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Total Cost</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-all border-b border-gray-200">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.role}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">AED {member.hourlyRate}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{member.estimatedHours}h</td>
                        <td className="px-4 py-4 text-sm font-bold text-green-600">AED {member.totalCompensation}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            member.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="bg-white border border-gray-300 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Employee Feedback & Reviews
              </h3>

              <div className="space-y-6">
                {employeeFeedback.map((feedback) => (
                  <div key={feedback.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{feedback.employee}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{feedback.rating}.0/5.0</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          feedback.category === 'performance' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                        </span>
                        <div className="text-xs text-gray-600 mt-2">{feedback.date}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Team & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Enhanced Team Section with Real-time Status */}
          <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Team Status
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-600">
                    {teamMembers.filter(m => m.status === 'Confirmed').length}/{teamMembers.length} Active
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                      member.status === 'Confirmed' ? 'bg-green-600' :
                      member.status === 'Pending' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {member.initials}
                    </div>
                    {member.status === 'Confirmed' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-gray-900">{member.name}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        member.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        member.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History Timeline */}
          <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              Activity Log
            </h3>
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-gray-300">
              {activityLog.map((event, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                  <div className="text-xs font-bold text-gray-900 mb-1">{event.action}</div>
                  <div className="text-[10px] text-gray-600 mb-1">{event.timestamp} • {event.user}</div>
                  <div className="text-[10px] text-gray-500 italic">{event.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Update Job Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { status: 'Scheduled', label: 'Scheduled', color: 'bg-indigo-100 text-indigo-700', icon: Calendar },
                { status: 'In Progress', label: 'Start Job', color: 'bg-green-100 text-green-700', icon: PlayCircle },
                { status: 'Completed', label: 'Complete Job', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
                { status: 'Cancelled', label: 'Cancel Job', color: 'bg-red-100 text-red-700', icon: X }
              ].map((option) => (
                <button
                  key={option.status}
                  onClick={() => handleUpdateJobStatus(option.status)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    job.status === option.status
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${option.color.split(' ')[0]}`}>
                    <option.icon className={`w-4 h-4 ${option.color.split(' ')[1]}`} />
                  </div>
                  <span className="font-bold text-gray-900">{option.label}</span>
                  {job.status === option.status && <CheckCircle className="w-4 h-4 text-indigo-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Job Note Modal */}
      {showJobNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Job Note</h3>
              <button
                onClick={() => setShowJobNoteModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={newJobNote}
                onChange={(e) => setNewJobNote(e.target.value)}
                placeholder="Enter your note..."
                className="w-full h-32 p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowJobNoteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddJobNote}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Task</h3>
              <button
                onClick={() => {
                  setShowTaskAssignmentModal(false);
                  setSelectedTask(null);
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Task</label>
                <select
                  value={selectedTask?.id || ''}
                  onChange={(e) => {
                    const task = executionTasks.find(t => t.id === e.target.value);
                    setSelectedTask(task);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a task...</option>
                  {executionTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.task}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Team Member</label>
                <select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a team member...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowTaskAssignmentModal(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTask}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedTaskForReminder ? 'Set Task Reminder' : 'Add Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setSelectedTaskForReminder(null);
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              {selectedTaskForReminder ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-sm font-medium text-blue-900">Task</div>
                    <div className="text-sm font-bold text-gray-900 mt-1">{selectedTaskForReminder.task}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowReminderModal(false);
                        setSelectedTaskForReminder(null);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const index = executionTasks.findIndex(t => t.id === selectedTaskForReminder.id);
                        handleAddTaskReminder(index);
                      }}
                      className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                    >
                      Set Reminder
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Message</label>
                    <textarea
                      value={reminderText}
                      onChange={(e) => setReminderText(e.target.value)}
                      placeholder="What should you be reminded about?"
                      className="w-full h-24 p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowReminderModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddReminder}
                      className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                    >
                      Create Reminder
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <JobDetailContent />
    </Suspense>
  )
}