'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Search,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Star,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  UserCheck,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc,
  query,
  orderBy,
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

interface FirebaseFeedback {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  submittedBy: string;
  submissionDate: string;
  rating: number;
  category: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface FirebaseComplaint {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  filedBy: string;
  submissionDate: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  resolution: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeFeedbackAndComplaints() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'complaints'>('feedback')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Real Data States
  const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
  const [feedbacks, setFeedbacks] = useState<FirebaseFeedback[]>([])
  const [complaints, setComplaints] = useState<FirebaseComplaint[]>([])

  // Form States
  const [feedbackForm, setFeedbackForm] = useState({
    employeeId: '',
    rating: 5,
    category: 'Performance',
    title: '',
    content: '',
    tags: '',
    status: 'Active'
  })

  const [complaintForm, setComplaintForm] = useState({
    employeeId: '',
    category: 'Workplace Safety',
    priority: 'Medium',
    title: '',
    description: '',
    filedBy: 'Employee',
    status: 'Open',
    assignedTo: 'Unassigned',
    resolution: ''
  })

  // Fetch all data from Firebase
  useEffect(() => {
    fetchEmployees()
    fetchFeedbacks()
    fetchComplaints()
  }, [])

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
      })
      
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      const feedbacksRef = collection(db, 'feedbacks')
      const q = query(feedbacksRef, orderBy('submissionDate', 'desc'))
      const snapshot = await getDocs(q)
      
      const feedbacksList: FirebaseFeedback[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        feedbacksList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          employeeRole: data.employeeRole || '',
          submittedBy: data.submittedBy || 'Admin',
          submissionDate: data.submissionDate || '',
          rating: data.rating || 0,
          category: data.category || '',
          title: data.title || '',
          content: data.content || '',
          status: data.status || 'Active',
          tags: data.tags || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      
      setFeedbacks(feedbacksList)
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    }
  }

  const fetchComplaints = async () => {
    try {
      const complaintsRef = collection(db, 'complaints')
      const q = query(complaintsRef, orderBy('submissionDate', 'desc'))
      const snapshot = await getDocs(q)
      
      const complaintsList: FirebaseComplaint[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        complaintsList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          employeeRole: data.employeeRole || '',
          filedBy: data.filedBy || 'Employee',
          submissionDate: data.submissionDate || '',
          category: data.category || '',
          priority: data.priority || 'Medium',
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'Open',
          assignedTo: data.assignedTo || 'Unassigned',
          resolution: data.resolution || '',
          attachments: data.attachments || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      
      setComplaints(complaintsList)
    } catch (error) {
      console.error('Error fetching complaints:', error)
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

  // Add Feedback to Firebase
  const handleAddFeedback = async () => {
    if (!feedbackForm.employeeId || !feedbackForm.title || !feedbackForm.content) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const employee = employees.find(e => e.id === feedbackForm.employeeId)
      if (!employee) {
        alert('Employee not found')
        return
      }

      const feedbackData = {
        employeeId: feedbackForm.employeeId,
        employeeName: employee.name,
        employeeRole: employee.position,
        submittedBy: 'Admin',
        submissionDate: new Date().toISOString().split('T')[0],
        rating: feedbackForm.rating,
        category: feedbackForm.category,
        title: feedbackForm.title,
        content: feedbackForm.content,
        status: feedbackForm.status,
        tags: feedbackForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(feedbackData)
      await addDoc(collection(db, 'feedbacks'), cleanData)

      // Reset form and refresh data
      setFeedbackForm({
        employeeId: '',
        rating: 5,
        category: 'Performance',
        title: '',
        content: '',
        tags: '',
        status: 'Active'
      })
      setShowAddModal(false)
      fetchFeedbacks()
      
      alert('Feedback added successfully!')
    } catch (error) {
      console.error('Error adding feedback:', error)
      alert('Error adding feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Edit Feedback in Firebase
  const handleEditFeedback = async () => {
    if (!editingItem || !feedbackForm.title || !feedbackForm.content) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const updatedFeedback = {
        ...editingItem,
        rating: feedbackForm.rating,
        category: feedbackForm.category,
        title: feedbackForm.title,
        content: feedbackForm.content,
        status: feedbackForm.status,
        tags: feedbackForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(updatedFeedback)
      await updateDoc(doc(db, 'feedbacks', editingItem.id), cleanData)

      // Reset form and refresh data
      setFeedbackForm({
        employeeId: '',
        rating: 5,
        category: 'Performance',
        title: '',
        content: '',
        tags: '',
        status: 'Active'
      })
      setShowEditModal(false)
      setEditingItem(null)
      fetchFeedbacks()
      
      alert('Feedback updated successfully!')
    } catch (error) {
      console.error('Error updating feedback:', error)
      alert('Error updating feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add Complaint to Firebase
  const handleAddComplaint = async () => {
    if (!complaintForm.employeeId || !complaintForm.title || !complaintForm.description) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const employee = employees.find(e => e.id === complaintForm.employeeId)
      if (!employee) {
        alert('Employee not found')
        return
      }

      const complaintData = {
        employeeId: complaintForm.employeeId,
        employeeName: employee.name,
        employeeRole: employee.position,
        filedBy: complaintForm.filedBy,
        submissionDate: new Date().toISOString().split('T')[0],
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.title,
        description: complaintForm.description,
        status: complaintForm.status,
        assignedTo: complaintForm.assignedTo,
        resolution: complaintForm.resolution,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(complaintData)
      await addDoc(collection(db, 'complaints'), cleanData)

      // Reset form and refresh data
      setComplaintForm({
        employeeId: '',
        category: 'Workplace Safety',
        priority: 'Medium',
        title: '',
        description: '',
        filedBy: 'Employee',
        status: 'Open',
        assignedTo: 'Unassigned',
        resolution: ''
      })
      setShowAddModal(false)
      fetchComplaints()
      
      alert('Complaint added successfully!')
    } catch (error) {
      console.error('Error adding complaint:', error)
      alert('Error adding complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Edit Complaint in Firebase
  const handleEditComplaint = async () => {
    if (!editingItem || !complaintForm.title || !complaintForm.description) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const updatedComplaint = {
        ...editingItem,
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.title,
        description: complaintForm.description,
        filedBy: complaintForm.filedBy,
        status: complaintForm.status,
        assignedTo: complaintForm.assignedTo,
        resolution: complaintForm.resolution,
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(updatedComplaint)
      await updateDoc(doc(db, 'complaints', editingItem.id), cleanData)

      // Reset form and refresh data
      setComplaintForm({
        employeeId: '',
        category: 'Workplace Safety',
        priority: 'Medium',
        title: '',
        description: '',
        filedBy: 'Employee',
        status: 'Open',
        assignedTo: 'Unassigned',
        resolution: ''
      })
      setShowEditModal(false)
      setEditingItem(null)
      fetchComplaints()
      
      alert('Complaint updated successfully!')
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Error updating complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Delete Feedback from Firebase
  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return

    try {
      await deleteDoc(doc(db, 'feedbacks', id))
      fetchFeedbacks()
      alert('Feedback deleted successfully!')
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('Error deleting feedback. Please try again.')
    }
  }

  // Delete Complaint from Firebase
  const handleDeleteComplaint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return

    try {
      await deleteDoc(doc(db, 'complaints', id))
      fetchComplaints()
      alert('Complaint deleted successfully!')
    } catch (error) {
      console.error('Error deleting complaint:', error)
      alert('Error deleting complaint. Please try again.')
    }
  }

  // Open Edit Modal for Feedback
  const openEditFeedback = (feedback: FirebaseFeedback) => {
    setEditingItem(feedback)
    setFeedbackForm({
      employeeId: feedback.employeeId,
      rating: feedback.rating,
      category: feedback.category,
      title: feedback.title,
      content: feedback.content,
      tags: feedback.tags?.join(', ') || '',
      status: feedback.status
    })
    setShowEditModal(true)
  }

  // Open Edit Modal for Complaint
  const openEditComplaint = (complaint: FirebaseComplaint) => {
    setEditingItem(complaint)
    setComplaintForm({
      employeeId: complaint.employeeId,
      category: complaint.category,
      priority: complaint.priority,
      title: complaint.title,
      description: complaint.description,
      filedBy: complaint.filedBy,
      status: complaint.status,
      assignedTo: complaint.assignedTo,
      resolution: complaint.resolution || ''
    })
    setShowEditModal(true)
  }

  // Filter functions
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = searchTerm === '' || 
      f.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = searchTerm === '' || 
      c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending Action': return 'bg-yellow-100 text-yellow-800'
      case 'Open': return 'bg-red-100 text-red-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Summary Statistics
  const summaryStats = {
    totalFeedbacks: feedbacks.length,
    activeFeedbacks: feedbacks.filter(f => f.status === 'Active').length,
    totalComplaints: complaints.length,
    openComplaints: complaints.filter(c => c.status === 'Open').length,
    inProgressComplaints: complaints.filter(c => c.status === 'In Progress').length,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Feedback & Complaints</h1>
            <p className="text-sm text-gray-600 mt-1">Manage employee feedback and handle complaints</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase">Total Feedbacks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summaryStats.totalFeedbacks}</div>
          <div className="text-xs text-blue-600 mt-2">{summaryStats.activeFeedbacks} Active</div>
        </div>

        <div className="bg-linear-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-700 uppercase">Total Complaints</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summaryStats.totalComplaints}</div>
          <div className="text-xs text-red-600 mt-2">{summaryStats.openComplaints} Open</div>
        </div>

        <div className="bg-linear-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs font-bold text-yellow-700 uppercase">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summaryStats.inProgressComplaints}</div>
          <div className="text-xs text-yellow-600 mt-2">Complaints</div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-700 uppercase">Resolved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summaryStats.resolvedComplaints}</div>
          <div className="text-xs text-green-600 mt-2">Complaints</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-white border border-gray-300 rounded-2xl w-fit">
        {[
          { id: 'feedback', label: 'Employee Feedback', icon: Star },
          { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              setFilterStatus('all')
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Status</option>
          {activeTab === 'feedback' ? (
            <>
              <option value="Active">Active</option>
              <option value="Pending Action">Pending Action</option>
            </>
          ) : (
            <>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </>
          )}
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'feedback' ? 'Feedback' : 'Complaint'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && !loading && (
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No feedbacks found</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white border border-gray-300 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {feedback.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{feedback.employeeName}</h3>
                        <p className="text-xs text-gray-600">{feedback.employeeRole}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(feedback.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`font-bold text-sm ${getRatingColor(feedback.rating)}`}>
                      {feedback.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2">{feedback.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{feedback.content}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {feedback.category}
                    </span>
                  </div>
                  {feedback.tags && feedback.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {feedback.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {feedback.submissionDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(feedback)
                        setShowViewModal(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditFeedback(feedback)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && !loading && (
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No complaints found</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="bg-white border border-gray-300 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold">
                        {complaint.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{complaint.employeeName}</h3>
                        <p className="text-xs text-gray-600">{complaint.employeeRole}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority} Priority
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 mb-2">{complaint.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      {complaint.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      Filed by {complaint.filedBy}
                    </span>
                  </div>

                  {complaint.status !== 'Open' && complaint.resolution && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-1">Resolution:</p>
                      <p className="text-sm text-gray-600">{complaint.resolution}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {complaint.submissionDate}
                    </div>
                    <div>Assigned to: <span className="font-bold">{complaint.assignedTo}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(complaint)
                        setShowViewModal(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditComplaint(complaint)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComplaint(complaint.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Feedback/Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Add {activeTab === 'feedback' ? 'Employee Feedback' : 'Complaint'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Employee *</label>
                <select
                  value={activeTab === 'feedback' ? feedbackForm.employeeId : complaintForm.employeeId}
                  onChange={(e) => {
                    if (activeTab === 'feedback') {
                      setFeedbackForm({...feedbackForm, employeeId: e.target.value})
                    } else {
                      setComplaintForm({...complaintForm, employeeId: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position})
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === 'feedback' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating *</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Performance">Performance</option>
                        <option value="Quality of Work">Quality of Work</option>
                        <option value="Development">Development</option>
                        <option value="Behavior">Behavior</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={feedbackForm.status}
                      onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Action">Pending Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                      placeholder="Feedback title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Feedback *</label>
                    <textarea
                      value={feedbackForm.content}
                      onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
                      placeholder="Provide detailed feedback..."
                      className="w-full h-24 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={feedbackForm.tags}
                      onChange={(e) => setFeedbackForm({...feedbackForm, tags: e.target.value})}
                      placeholder="e.g., Leadership, Performance, Professional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Workplace Safety">Workplace Safety</option>
                        <option value="Work Schedule">Work Schedule</option>
                        <option value="Performance">Performance</option>
                        <option value="Management">Management</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Priority *</label>
                      <select
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Filed By *</label>
                      <select
                        value={complaintForm.filedBy}
                        onChange={(e) => setComplaintForm({...complaintForm, filedBy: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Employee">Employee</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                      <select
                        value={complaintForm.status}
                        onChange={(e) => setComplaintForm({...complaintForm, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Assigned To</label>
                    <input
                      type="text"
                      value={complaintForm.assignedTo}
                      onChange={(e) => setComplaintForm({...complaintForm, assignedTo: e.target.value})}
                      placeholder="e.g., HR Manager, Supervisor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Complaint Title *</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                      placeholder="Brief complaint title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      placeholder="Provide detailed complaint description..."
                      className="w-full h-24 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Resolution</label>
                    <textarea
                      value={complaintForm.resolution}
                      onChange={(e) => setComplaintForm({...complaintForm, resolution: e.target.value})}
                      placeholder="Resolution details (if any)"
                      className="w-full h-20 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={activeTab === 'feedback' ? handleAddFeedback : handleAddComplaint}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : activeTab === 'feedback' ? 'Add Feedback' : 'Add Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Feedback/Complaint Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Edit {activeTab === 'feedback' ? 'Feedback' : 'Complaint'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Employee:</span> {editingItem.employeeName} ({editingItem.employeeRole})
                </p>
              </div>

              {activeTab === 'feedback' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating *</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Performance">Performance</option>
                        <option value="Quality of Work">Quality of Work</option>
                        <option value="Development">Development</option>
                        <option value="Behavior">Behavior</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={feedbackForm.status}
                      onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Action">Pending Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                      placeholder="Feedback title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Feedback *</label>
                    <textarea
                      value={feedbackForm.content}
                      onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
                      placeholder="Provide detailed feedback..."
                      className="w-full h-24 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={feedbackForm.tags}
                      onChange={(e) => setFeedbackForm({...feedbackForm, tags: e.target.value})}
                      placeholder="e.g., Leadership, Performance, Professional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Workplace Safety">Workplace Safety</option>
                        <option value="Work Schedule">Work Schedule</option>
                        <option value="Performance">Performance</option>
                        <option value="Management">Management</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Priority *</label>
                      <select
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Filed By *</label>
                      <select
                        value={complaintForm.filedBy}
                        onChange={(e) => setComplaintForm({...complaintForm, filedBy: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Employee">Employee</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
                      <select
                        value={complaintForm.status}
                        onChange={(e) => setComplaintForm({...complaintForm, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Assigned To</label>
                    <input
                      type="text"
                      value={complaintForm.assignedTo}
                      onChange={(e) => setComplaintForm({...complaintForm, assignedTo: e.target.value})}
                      placeholder="e.g., HR Manager, Supervisor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Complaint Title *</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                      placeholder="Brief complaint title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      placeholder="Provide detailed complaint description..."
                      className="w-full h-24 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Resolution</label>
                    <textarea
                      value={complaintForm.resolution}
                      onChange={(e) => setComplaintForm({...complaintForm, resolution: e.target.value})}
                      placeholder="Resolution details (if any)"
                      className="w-full h-20 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={activeTab === 'feedback' ? handleEditFeedback : handleEditComplaint}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {activeTab === 'feedback' ? 'Feedback Details' : 'Complaint Details'}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedItem(null)
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'feedback' ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">{selectedItem.title}</h4>
                    <p className="text-sm text-gray-600">{selectedItem.content}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Employee</label>
                      <p className="text-sm text-gray-900">{selectedItem.employeeName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedItem.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-bold">{selectedItem.rating}/5</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                      <p className="text-sm text-gray-900">{selectedItem.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Submitted By</label>
                      <p className="text-sm text-gray-900">{selectedItem.submittedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                      <p className="text-sm text-gray-900">{selectedItem.submissionDate}</p>
                    </div>
                  </div>
                  
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">{selectedItem.title}</h4>
                    <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Employee</label>
                      <p className="text-sm text-gray-900">{selectedItem.employeeName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                      <p className="text-sm text-gray-900">{selectedItem.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Filed By</label>
                      <p className="text-sm text-gray-900">{selectedItem.filedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Assigned To</label>
                      <p className="text-sm text-gray-900">{selectedItem.assignedTo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                      <p className="text-sm text-gray-900">{selectedItem.submissionDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Created</label>
                      <p className="text-sm text-gray-900">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {selectedItem.resolution && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Resolution</label>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-900">{selectedItem.resolution}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedItem(null)
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}