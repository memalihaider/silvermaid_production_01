'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  X,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  Check,
  Ban,
  User,
  FileText,
  ArrowRight,
  Menu,
  X as XIcon,
  Mail,
  Briefcase,
  Home,
  Award,
  Phone,
  Building,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EmployeeSidebar } from '../_components/sidebar'
import { getSession, type SessionData, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

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
}

interface LeaveApplication {
  id: string
  employeeId: string
  employeeName: string
  employeeDepartment: string
  leaveType: 'Annual' | 'Sick' | 'Special' | 'Maternity' | 'Paternity' | 'Unpaid'
  startDate: string
  endDate: string
  daysRequested: number
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  appliedDate: string
  appliedBy: string
  approverComments?: string
  approverName?: string
  approvalDate?: string
  documents?: { name: string; url: string }[]
}

const LEAVE_TYPES = [
  { id: 'Annual', name: 'Annual Leave', color: 'bg-blue-900/20 text-blue-400 border-blue-800' },
  { id: 'Sick', name: 'Sick Leave', color: 'bg-red-900/20 text-red-400 border-red-800' },
  { id: 'Special', name: 'Special Leave', color: 'bg-purple-900/20 text-purple-400 border-purple-800' },
  { id: 'Maternity', name: 'Maternity Leave', color: 'bg-pink-900/20 text-pink-400 border-pink-800' },
  { id: 'Paternity', name: 'Paternity Leave', color: 'bg-green-900/20 text-green-400 border-green-800' },
  { id: 'Unpaid', name: 'Unpaid Leave', color: 'bg-gray-900/20 text-gray-400 border-gray-800' }
]

// Consistent date formatting
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatLongDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function EmployeeLeaveDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loggedInEmployee, setLoggedInEmployee] = useState<FirebaseEmployee | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLeaveType, setFilterLeaveType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [newLeaveForm, setNewLeaveForm] = useState({
    leaveType: 'Annual' as const,
    startDate: '',
    endDate: '',
    reason: '',
  })

  // Session check and fetch logged-in employee
  useEffect(() => {
    const storedSession = getSession()
    if (!storedSession) {
      router.push('/login/employee')
      return
    }
    setSession(storedSession)
    
    // Fetch logged-in employee
    fetchLoggedInEmployee(storedSession)
  }, [router])

  // Fetch logged-in employee from Firebase
  const fetchLoggedInEmployee = async (sessionData: SessionData) => {
    try {
      console.log('🔍 Fetching logged-in employee for leave...')
      
      let employeeData: FirebaseEmployee | null = null
      
      // Try by employeeId first
      if (sessionData.employeeId) {
        const employeeDoc = await getDocs(query(
          collection(db, 'employees'), 
          where('__name__', '==', sessionData.employeeId)
        ))
        
        if (!employeeDoc.empty) {
          const data = employeeDoc.docs[0].data()
          employeeData = {
            id: employeeDoc.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || ''
          }
          console.log('✅ Found employee by ID:', employeeData.name)
        }
      }
      
      // If not found by ID, try by email
      if (!employeeData && sessionData.user.email) {
        const employeesRef = collection(db, 'employees')
        const q = query(employeesRef, where('email', '==', sessionData.user.email))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          employeeData = {
            id: snapshot.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || ''
          }
          console.log('✅ Found employee by email:', employeeData.name)
        }
      }
      
      setLoggedInEmployee(employeeData)
      
      // If employee found, fetch their leave applications
      if (employeeData) {
        fetchMyLeaveApplications(employeeData.id)
      }
      
    } catch (error) {
      console.error('Error fetching logged-in employee:', error)
    }
  }

  // Fetch only logged-in employee's leave applications
  const fetchMyLeaveApplications = async (employeeId: string) => {
    try {
      const leavesRef = collection(db, 'leave-management')
      const q = query(leavesRef, where('employeeId', '==', employeeId))
      const snapshot = await getDocs(q)
      
      const leavesList: LeaveApplication[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        leavesList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          employeeDepartment: data.employeeDepartment || '',
          leaveType: data.leaveType || 'Annual',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          daysRequested: data.daysRequested || 0,
          reason: data.reason || '',
          status: data.status || 'Pending',
          appliedDate: data.appliedDate || new Date().toISOString().split('T')[0],
          appliedBy: data.appliedBy || 'Self',
          approverComments: data.approverComments || '',
          approverName: data.approverName || '',
          approvalDate: data.approvalDate || '',
          documents: data.documents || []
        })
      })
      
      // Sort by applied date (most recent first)
      leavesList.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      
      setLeaveApplications(leavesList)
    } catch (error) {
      console.error('Error fetching leave applications:', error)
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

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  // Filter applications - only show logged-in employee's applications
  const filteredApplications = useMemo(() => {
    return leaveApplications.filter(app => {
      const matchesSearch = 
        app.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus
      const matchesType = filterLeaveType === 'all' || app.leaveType === filterLeaveType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaveApplications, searchTerm, filterStatus, filterLeaveType])

  // Calculate statistics for logged-in employee
  const stats = useMemo(() => {
    return {
      total: leaveApplications.length,
      pending: leaveApplications.filter(app => app.status === 'Pending').length,
      approved: leaveApplications.filter(app => app.status === 'Approved').length,
      rejected: leaveApplications.filter(app => app.status === 'Rejected').length,
      totalDaysApproved: leaveApplications
        .filter(app => app.status === 'Approved')
        .reduce((sum, app) => sum + app.daysRequested, 0)
    }
  }, [leaveApplications])

  // Handle add leave application
  const handleAddLeaveApplication = async () => {
    if (!loggedInEmployee) {
      alert('Employee not found')
      return
    }

    if (!newLeaveForm.startDate || !newLeaveForm.endDate || !newLeaveForm.reason) {
      alert('Please fill in all required fields')
      return
    }

    const daysRequested = calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)

    try {
      const newApplicationData = cleanFirebaseData({
        employeeId: loggedInEmployee.id,
        employeeName: loggedInEmployee.name,
        employeeDepartment: loggedInEmployee.department,
        leaveType: newLeaveForm.leaveType,
        startDate: newLeaveForm.startDate,
        endDate: newLeaveForm.endDate,
        daysRequested: daysRequested,
        reason: newLeaveForm.reason,
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        appliedBy: loggedInEmployee.name,
        approverComments: '',
        approverName: '',
        approvalDate: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      const docRef = await addDoc(collection(db, 'leave-management'), newApplicationData)
      
      const newApplication: LeaveApplication = {
        ...newApplicationData,
        id: docRef.id
      }
      
      setLeaveApplications([newApplication, ...leaveApplications])
      
      // Reset form
      setNewLeaveForm({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: ''
      })
      
      setShowAddModal(false)
      alert('Leave application submitted successfully!')
      
    } catch (error) {
      console.error('Error adding leave application:', error)
      alert('Error submitting leave application. Please try again.')
    }
  }

  // Handle delete - only if application is pending
  const handleDelete = async (id: string) => {
    const application = leaveApplications.find(app => app.id === id)
    if (application?.status !== 'Pending') {
      alert('Only pending applications can be deleted')
      return
    }

    if (!confirm('Delete this leave application?')) return

    try {
      await deleteDoc(doc(db, 'leave-management', id))
      setLeaveApplications(leaveApplications.filter(app => app.id !== id))
      alert('Leave application deleted!')
    } catch (error) {
      console.error('Error deleting leave application:', error)
      alert('Error deleting leave application. Please try again.')
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    return LEAVE_TYPES.find(lt => lt.id === leaveType)?.color || 'bg-gray-900/20 text-gray-400 border-gray-800'
  }

  const getLeaveTypeName = (leaveType: string) => {
    return LEAVE_TYPES.find(lt => lt.id === leaveType)?.name || leaveType
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-900/20 text-green-400 border-green-800'
      case 'Pending': return 'bg-amber-900/20 text-amber-400 border-amber-800'
      case 'Rejected': return 'bg-red-900/20 text-red-400 border-red-800'
      default: return 'bg-slate-700 text-slate-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'Pending': return <Clock className="w-4 h-4 text-amber-400" />
      case 'Rejected': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return null
    }
  }

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E'
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/login/employee')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!loggedInEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Employee Not Found</h2>
            <p className="text-slate-400 mb-6">No employee profile linked to your account.</p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-700 rounded-lg">
                {sidebarOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Leave Management</h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  {loggedInEmployee.name} • {loggedInEmployee.department} • {loggedInEmployee.position}
                </p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 border border-violet-700 rounded-lg">
                <Mail className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">{loggedInEmployee.email}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Welcome, {loggedInEmployee.name}!</h2>
            <p className="text-slate-300">Manage your leave applications and track request status.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Days Approved</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.totalDaysApproved}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Apply for Leave
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by reason or leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all" className="bg-slate-900">All Status</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Approved" className="bg-slate-900">Approved</option>
                <option value="Rejected" className="bg-slate-900">Rejected</option>
              </select>
              <select
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
                className="px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all" className="bg-slate-900">All Leave Types</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type.id} value={type.id} className="bg-slate-900">{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Leave Applications List - Only logged-in employee's leaves */}
          <div className="space-y-3">
            {filteredApplications.length > 0 ? (
              filteredApplications.map(app => (
                <div key={app.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{app.leaveType} Leave</h4>
                          <p className="text-xs text-slate-400">Applied on {formatDate(app.appliedDate)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">Type</p>
                          <p className="text-white font-medium">{getLeaveTypeName(app.leaveType)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Start Date</p>
                          <p className="text-white font-medium">{formatDate(app.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">End Date</p>
                          <p className="text-white font-medium">{formatDate(app.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Days</p>
                          <p className="text-white font-medium">{app.daysRequested} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Status</p>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-300"><span className="font-semibold text-white">Reason:</span> {app.reason}</p>
                      </div>

                      {app.approverComments && (
                        <div className="mt-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                          <p className="text-xs text-blue-400"><span className="font-semibold">Approver Notes:</span> {app.approverComments}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(app)
                          setShowDetailsModal(true)
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-slate-300" />
                      </button>

                      {app.status === 'Pending' && (
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-2 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">No leave applications found</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  Apply for Leave
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 bg-slate-700/50 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info - Read Only */}
              <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-800">
                <p className="text-sm text-violet-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applying as: <span className="font-semibold text-white">{loggedInEmployee.name}</span>
                </p>
                <p className="text-xs text-violet-400 mt-1">{loggedInEmployee.department} • {loggedInEmployee.position}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Leave Type *</label>
                  <select
                    value={newLeaveForm.leaveType}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, leaveType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {LEAVE_TYPES.map(type => (
                      <option key={type.id} value={type.id} className="bg-slate-900">{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Start Date *</label>
                  <input
                    type="date"
                    value={newLeaveForm.startDate}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">End Date *</label>
                  <input
                    type="date"
                    value={newLeaveForm.endDate}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {newLeaveForm.startDate && newLeaveForm.endDate && (
                  <div className="md:col-span-2 p-3 bg-purple-900/20 rounded-lg border border-purple-800">
                    <p className="text-xs text-purple-400">
                      📅 Days Requested: <span className="font-semibold">{calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)}</span> days
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Reason *</label>
                  <textarea
                    value={newLeaveForm.reason}
                    onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Reason for leave"
                  />
                </div>

                <div className="md:col-span-2 p-3 bg-amber-900/20 rounded-lg border border-amber-800">
                  <p className="text-xs text-amber-400">
                    📝 <span className="font-semibold">Note:</span> Your application will be submitted with <span className="font-semibold">PENDING</span> status for admin approval.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLeaveApplication}
                  disabled={!newLeaveForm.startDate || !newLeaveForm.endDate || !newLeaveForm.reason}
                  className={`flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
                    (!newLeaveForm.startDate || !newLeaveForm.endDate || !newLeaveForm.reason)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-violet-700'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-slate-700/50 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Leave Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Application Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-400" />
                  Application Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">Leave Type</p>
                    <p className="font-semibold text-white">{getLeaveTypeName(selectedApplication.leaveType)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">Days Requested</p>
                    <p className="font-semibold text-white">{selectedApplication.daysRequested} days</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">Start Date</p>
                    <p className="font-semibold text-white">{formatLongDate(selectedApplication.startDate)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">End Date</p>
                    <p className="font-semibold text-white">{formatLongDate(selectedApplication.endDate)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">Applied On</p>
                    <p className="font-semibold text-white">{formatDate(selectedApplication.appliedDate)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400">Status</p>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-400" />
                  Reason
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-300">{selectedApplication.reason}</p>
                </div>
              </div>

              {/* Approver Comments */}
              {selectedApplication.approverComments && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-violet-400" />
                    Approver Comments
                  </h3>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                    <p className="text-blue-400">{selectedApplication.approverComments}</p>
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {selectedApplication.approvalDate && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-violet-400" />
                    Approval Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400">Approval Date</p>
                      <p className="font-semibold text-white">{formatDate(selectedApplication.approvalDate)}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400">Approver</p>
                      <p className="font-semibold text-white">{selectedApplication.approverName || 'Admin'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}