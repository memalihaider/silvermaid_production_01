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
  Filter,
  Check,
  Ban,
  User,
  FileText,
  ArrowRight
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
  { id: 'Annual', name: 'Annual Leave', color: 'bg-blue-100 text-blue-700', limit: 30 },
  { id: 'Sick', name: 'Sick Leave', color: 'bg-red-100 text-red-700', limit: 10 },
  { id: 'Special', name: 'Special Leave', color: 'bg-purple-100 text-purple-700', limit: 5 },
  { id: 'Maternity', name: 'Maternity Leave', color: 'bg-pink-100 text-pink-700', limit: 60 },
  { id: 'Paternity', name: 'Paternity Leave', color: 'bg-green-100 text-green-700', limit: 5 },
  { id: 'Unpaid', name: 'Unpaid Leave', color: 'bg-gray-100 text-gray-700', limit: 0 }
]

// Consistent date formatting to avoid hydration mismatches
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}

const formatLongDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function LeaveManagementPage() {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterLeaveType, setFilterLeaveType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'process'>('add')

  const [newLeaveForm, setNewLeaveForm] = useState({
    employeeId: '',
    leaveType: 'Annual' as const,
    startDate: '',
    endDate: '',
    reason: '',
    approverComments: ''
  })

  const [processForm, setProcessForm] = useState({
    applicationId: '',
    action: 'Approved' as 'Approved' | 'Rejected',
    comments: ''
  })

  // Firebase se employees aur leave applications fetch karein
  useEffect(() => {
    fetchEmployees()
    fetchLeaveApplications()
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
            status: data.status || 'Active',
            supervisor: data.supervisor || ''
          })
        }
      })
      
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchLeaveApplications = async () => {
    try {
      const leavesRef = collection(db, 'leave-management')
      const snapshot = await getDocs(leavesRef)
      
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
          appliedBy: data.appliedBy || 'Admin',
          approverComments: data.approverComments || '',
          approverName: data.approverName || '',
          approvalDate: data.approvalDate || '',
          documents: data.documents || []
        })
      })
      
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

  // Calculate leave balance for employee
  const getLeaveBalance = (employeeId: string, leaveType: string) => {
    const leaveTypeData = LEAVE_TYPES.find(lt => lt.id === leaveType)
    if (!leaveTypeData) return 0

    const totalLimit = leaveTypeData.limit
    const usedDays = leaveApplications
      .filter(
        app =>
          app.employeeId === employeeId &&
          app.leaveType === leaveType &&
          app.status === 'Approved'
      )
      .reduce((sum, app) => sum + app.daysRequested, 0)

    return Math.max(0, totalLimit - usedDays)
  }

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  // Filter applications
  const filteredApplications = useMemo(() => {
    return leaveApplications.filter(app => {
      const matchesSearch =
        app.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus
      const matchesType = filterLeaveType === 'all' || app.leaveType === filterLeaveType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaveApplications, searchTerm, filterStatus, filterLeaveType])

  // Calculate statistics
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

  // Pending applications for dropdown
  const pendingApplications = useMemo(() => {
    return leaveApplications.filter(app => app.status === 'Pending')
  }, [leaveApplications])

  // Handle add leave application - Firebase mein save karein with PENDING status
  const handleAddLeaveApplication = async () => {
    if (!newLeaveForm.employeeId || !newLeaveForm.startDate || !newLeaveForm.endDate) {
      alert('Please fill in required fields')
      return
    }

    const employee = employees.find(e => e.id === newLeaveForm.employeeId)
    if (!employee) return

    const daysRequested = calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)

    try {
      const newApplicationData = cleanFirebaseData({
        employeeId: newLeaveForm.employeeId,
        employeeName: employee.name,
        employeeDepartment: employee.department,
        leaveType: newLeaveForm.leaveType,
        startDate: newLeaveForm.startDate,
        endDate: newLeaveForm.endDate,
        daysRequested: daysRequested,
        reason: newLeaveForm.reason,
        status: 'Pending', // Status PENDING rahega
        appliedDate: new Date().toISOString().split('T')[0],
        appliedBy: 'Admin',
        approverComments: '',
        approverName: '',
        approvalDate: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Firebase mein save karein
      const docRef = await addDoc(collection(db, 'leave-management'), newApplicationData)
      
      // Local state update karein
      const newApplication: LeaveApplication = {
        ...newApplicationData,
        id: docRef.id
      }
      
      setLeaveApplications([...leaveApplications, newApplication])
      
      // Reset form
      setNewLeaveForm({
        employeeId: '',
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
        approverComments: ''
      })
      
      setShowAddModal(false)
      alert('Leave application added successfully with PENDING status!')
      
    } catch (error) {
      console.error('Error adding leave application:', error)
      alert('Error adding leave application. Please try again.')
    }
  }

  // Handle process leave (approve/reject) - Firebase mein update karein
  const handleProcessLeave = async () => {
    if (!processForm.applicationId) return

    try {
      const applicationToUpdate = leaveApplications.find(app => app.id === processForm.applicationId)
      if (!applicationToUpdate) return

      const updateData = cleanFirebaseData({
        status: processForm.action,
        approverComments: processForm.comments || applicationToUpdate.approverComments,
        approvalDate: new Date().toISOString().split('T')[0],
        approverName: 'Admin',
        updatedAt: new Date().toISOString()
      })

      // Firebase mein update karein
      const leaveDoc = doc(db, 'leave-management', processForm.applicationId)
      await updateDoc(leaveDoc, updateData)

      // Local state update karein
      setLeaveApplications(
        leaveApplications.map(app =>
          app.id === processForm.applicationId
            ? {
                ...app,
                status: processForm.action,
                approverComments: processForm.comments || app.approverComments,
                approvalDate: new Date().toISOString().split('T')[0],
                approverName: 'Admin'
              }
            : app
        )
      )

      setProcessForm({ applicationId: '', action: 'Approved', comments: '' })
      setShowAddModal(false)
      alert(`Leave application ${processForm.action}!`)
      
    } catch (error) {
      console.error('Error processing leave:', error)
      alert('Error processing leave. Please try again.')
    }
  }

  // Handle delete - Firebase se delete karein
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this leave application?')) return

    try {
      // Firebase se delete karein
      await deleteDoc(doc(db, 'leave-management', id))
      
      // Local state update karein
      setLeaveApplications(leaveApplications.filter(app => app.id !== id))
      alert('Leave application deleted!')
      
    } catch (error) {
      console.error('Error deleting leave application:', error)
      alert('Error deleting leave application. Please try again.')
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    return LEAVE_TYPES.find(lt => lt.id === leaveType)?.color || 'bg-gray-100 text-gray-700'
  }

  const getLeaveTypeName = (leaveType: string) => {
    return LEAVE_TYPES.find(lt => lt.id === leaveType)?.name || leaveType
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black">Leave Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage employee leave applications and track leave balances
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Total</p>
          <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Approved</p>
          <p className="text-2xl font-black text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Rejected</p>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.rejected}</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-[11px] text-muted-foreground font-bold uppercase">Days Approved</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalDaysApproved}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => {
            setModalMode('add')
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Leave Application
        </button>

        <button
          onClick={() => {
            setModalMode('process')
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg"
          disabled={pendingApplications.length === 0}
        >
          <CheckCircle className="h-4 w-4" />
          Process Applications ({pendingApplications.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-2xl p-4 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-60 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterLeaveType}
            onChange={(e) => setFilterLeaveType(e.target.value)}
            className="px-4 py-2.5 bg-muted/50 border rounded-lg text-sm"
          >
            <option value="all">All Leave Types</option>
            {LEAVE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Applications List */}
      <div className="space-y-3">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.id} className="bg-card border rounded-2xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black">{app.employeeName}</h4>
                      <p className="text-xs text-muted-foreground">{app.employeeDepartment} • ID: {app.employeeId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className={`inline-block px-2 py-1 rounded text-xs font-bold ${getLeaveTypeColor(app.leaveType)}`}>
                        {getLeaveTypeName(app.leaveType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-bold">{formatDate(app.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-bold">{formatDate(app.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className="font-bold">{app.daysRequested} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><span className="font-bold">Reason:</span> {app.reason}</p>
                  </div>

                  {app.approverComments && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700"><span className="font-bold">Approver Notes:</span> {app.approverComments}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedApplication(app)
                      setShowDetailsModal(true)
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border rounded-2xl p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No leave applications found</p>
            {employees.length > 0 ? (
              <button 
                onClick={() => {
                  setModalMode('add')
                  setShowAddModal(true)
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Leave Application
              </button>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No employees available. Please add employees first.</p>
            )}
          </div>
        )}
      </div>

      {/* Add/Process Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b">
              <h2 className="text-2xl font-black">
                {modalMode === 'add' ? 'Add Leave Application' : 'Process Leave Applications'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Add Mode */}
              {modalMode === 'add' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold mb-2 block">Employee *</label>
                      <select
                        value={newLeaveForm.employeeId}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, employeeId: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department} ({emp.position})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block">Leave Type *</label>
                      <select
                        value={newLeaveForm.leaveType}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, leaveType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      >
                        {LEAVE_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block">Start Date *</label>
                      <input
                        type="date"
                        value={newLeaveForm.startDate}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block">End Date *</label>
                      <input
                        type="date"
                        value={newLeaveForm.endDate}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      />
                    </div>

                    {newLeaveForm.startDate && newLeaveForm.endDate && (
                      <div className="md:col-span-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-700">
                          📅 Days Requested: <span className="font-bold">{calculateDays(newLeaveForm.startDate, newLeaveForm.endDate)}</span> days
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="text-sm font-bold mb-2 block">Reason *</label>
                      <textarea
                        value={newLeaveForm.reason}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-20 resize-none"
                        placeholder="Reason for leave"
                      />
                    </div>

                    <div className="md:col-span-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        📝 <span className="font-bold">Note:</span> New leave applications will be created with <span className="font-bold">PENDING</span> status. 
                        You can approve or reject them later from the "Process Applications" section.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-bold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddLeaveApplication}
                      disabled={!newLeaveForm.employeeId || !newLeaveForm.startDate || !newLeaveForm.endDate}
                      className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                        (!newLeaveForm.employeeId || !newLeaveForm.startDate || !newLeaveForm.endDate)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-green-700'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Add Leave (Pending)
                    </button>
                  </div>
                </>
              )}

              {/* Process Mode */}
              {modalMode === 'process' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold mb-2 block">Select Pending Application *</label>
                      <select
                        value={processForm.applicationId}
                        onChange={(e) => setProcessForm({ ...processForm, applicationId: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm"
                      >
                        <option value="">Choose an application to process</option>
                        {pendingApplications.map(app => (
                          <option key={app.id} value={app.id}>
                            {app.employeeName} - {getLeaveTypeName(app.leaveType)} ({app.daysRequested}d) - {formatDate(app.startDate)} to {formatDate(app.endDate)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {pendingApplications.length === 0 && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700">
                          No pending leave applications to process. Add new leave applications first.
                        </p>
                      </div>
                    )}

                    {processForm.applicationId && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {(() => {
                          const app = leaveApplications.find(a => a.id === processForm.applicationId)
                          if (!app) return null
                          return (
                            <div className="space-y-2 text-sm">
                              <p><span className="font-bold">Employee:</span> {app.employeeName}</p>
                              <p><span className="font-bold">Department:</span> {app.employeeDepartment}</p>
                              <p><span className="font-bold">Leave Type:</span> {getLeaveTypeName(app.leaveType)}</p>
                              <p><span className="font-bold">Dates:</span> {formatDate(app.startDate)} - {formatDate(app.endDate)}</p>
                              <p><span className="font-bold">Days:</span> {app.daysRequested} days</p>
                              <p><span className="font-bold">Reason:</span> {app.reason}</p>
                              <p><span className="font-bold">Applied On:</span> {formatDate(app.appliedDate)}</p>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {processForm.applicationId && (
                      <>
                        <div>
                          <label className="text-sm font-bold mb-2 block">Action *</label>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setProcessForm({ ...processForm, action: 'Approved' })}
                              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                processForm.action === 'Approved'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-muted/50 border hover:bg-muted'
                              }`}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setProcessForm({ ...processForm, action: 'Rejected' })}
                              className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                processForm.action === 'Rejected'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-muted/50 border hover:bg-muted'
                              }`}
                            >
                              <Ban className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-bold mb-2 block">
                            {processForm.action === 'Rejected' ? 'Rejection Reason' : 'Approver Comments'} (Optional)
                          </label>
                          <textarea
                            value={processForm.comments}
                            onChange={(e) => setProcessForm({ ...processForm, comments: e.target.value })}
                            className="w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm h-20 resize-none"
                            placeholder={processForm.action === 'Rejected' ? 'Explain why this application is rejected...' : 'Add any comments...'}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-bold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProcessLeave}
                      disabled={!processForm.applicationId}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                        processForm.applicationId
                          ? processForm.action === 'Approved'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {processForm.action}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b">
              <h2 className="text-2xl font-black">Leave Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee & Status */}
              <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Employee Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-bold">{selectedApplication.employeeName}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-bold">{selectedApplication.employeeDepartment}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="font-bold">{selectedApplication.employeeId}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Application ID</p>
                    <p className="font-bold">{selectedApplication.id}</p>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Leave Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Leave Type</p>
                    <p className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${getLeaveTypeColor(selectedApplication.leaveType)}`}>
                      {getLeaveTypeName(selectedApplication.leaveType)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Days Requested</p>
                    <p className="font-bold text-lg">{selectedApplication.daysRequested} days</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-bold">{formatLongDate(selectedApplication.startDate)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-bold">{formatLongDate(selectedApplication.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Reason
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p>{selectedApplication.reason}</p>
                </div>
              </div>

              {/* Status & Approval */}
              <div>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Status & Approval
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                      selectedApplication.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      selectedApplication.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Applied Date</p>
                    <p className="font-bold">{formatDate(selectedApplication.appliedDate)}</p>
                  </div>
                  {selectedApplication.approvalDate && (
                    <>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Approval Date</p>
                        <p className="font-bold">{formatDate(selectedApplication.approvalDate)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Approver</p>
                        <p className="font-bold">{selectedApplication.approverName || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Approver Comments */}
              {selectedApplication.approverComments && (
                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Approver Comments
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-900">{selectedApplication.approverComments}</p>
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