'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Users, Search, Filter, Download, Plus, UserPlus, Award, Briefcase, MapPin, Phone, Mail, Shield, TrendingUp, AlertCircle, X, Edit2, Trash2, FileText, DollarSign, Heart, Globe, CheckCircle, Upload, File, Building, UserCog, ChevronRight, ChevronLeft } from 'lucide-react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Department aur Supervisor modals
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showSupervisorModal, setShowSupervisorModal] = useState(false)
  
  // Tables ke liye active tab
  const [activeTable, setActiveTable] = useState<'employees' | 'departments' | 'supervisors'>('employees')

  // Firebase se data
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])

  // Loading states
  const [loading, setLoading] = useState({
    employees: true,
    departments: true,
    supervisors: true
  })

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    assignedRoles: [] as string[],
    position: '',
    department: 'Operations',
    status: 'Active',
    joinDate: '',
    supervisor: '',
    rating: 4.5,
    burnoutRisk: 'Low',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    emiratesIdNumber: '',
    salary: 0,
    salaryStructure: 'Monthly',
    bankAccount: '',
    bankName: '',
    visaNumber: '',
    visaExpiryDate: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',
    team: [] as string[],
    documents: [] as any[]
  })

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    manager: '',
    budget: 0,
    location: '',
    active: true,
    employeeCount: 0,
    establishedDate: new Date().toISOString().split('T')[0]
  })

  const [supervisorForm, setSupervisorForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: 'Supervisor',
    maxEmployees: 10,
    active: true,
    assignedEmployees: [] as string[],
    experience: '2-5 years'
  })

  const [expandedSection, setExpandedSection] = useState<string>('personal')
  const [documentName, setDocumentName] = useState('')
  const [documentValidDate, setDocumentValidDate] = useState('')
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; fileName: string; uploadDate: string; validDate?: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableRoles = [
    'Admin',
    'Manager',
    'Supervisor',
    'Team Lead',
    'Specialist',
    'Cleaner',
    'HR Officer',
    'Finance Officer',
    'Accountant',
    'Marketing Executive',
    'Sales Representative',
    'Operator',
    'Maintenance Staff'
  ]

  // Firebase se employees fetch
  const fetchEmployees = async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }))
      const employeesCollection = collection(db, 'employees')
      const employeeSnapshot = await getDocs(employeesCollection)
      const employeesList = employeeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(prev => ({ ...prev, employees: false }))
    }
  }

  // Firebase se departments fetch
  const fetchDepartments = async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }))
      const departmentsCollection = collection(db, 'departments')
      const departmentSnapshot = await getDocs(departmentsCollection)
      const departmentsList = departmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDepartments(departmentsList)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(prev => ({ ...prev, departments: false }))
    }
  }

  // Firebase se supervisors fetch
  const fetchSupervisors = async () => {
    try {
      setLoading(prev => ({ ...prev, supervisors: true }))
      const supervisorsCollection = collection(db, 'supervisors')
      const supervisorSnapshot = await getDocs(supervisorsCollection)
      const supervisorsList = supervisorSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setSupervisors(supervisorsList)
    } catch (error) {
      console.error('Error fetching supervisors:', error)
    } finally {
      setLoading(prev => ({ ...prev, supervisors: false }))
    }
  }

  // Component mount hote hi data fetch
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
    fetchSupervisors()
  }, [])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus
      return matchesSearch && matchesDept && matchesStatus
    })
  }, [searchTerm, selectedDepartment, selectedStatus, employees])

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, departments])

  // Filter supervisors
  const filteredSupervisors = useMemo(() => {
    return supervisors.filter(sup => 
      sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, supervisors])

  // Supervisor metrics calculate
  const supervisorMetrics = useMemo(() => {
    const metrics: Record<string, { directReports: number; ratio: string }> = {}
    
    employees.forEach(emp => {
      if (emp.supervisor) {
        if (!metrics[emp.supervisor]) {
          metrics[emp.supervisor] = { directReports: 0, ratio: '' }
        }
        metrics[emp.supervisor].directReports++
      }
    })

    // Calculate ratio
    Object.keys(metrics).forEach(sup => {
      metrics[sup].ratio = `1:${metrics[sup].directReports}`
    })

    return metrics
  }, [employees])

  const statuses = ['all', 'Active', 'On Leave', 'Inactive']
  const allDepartments = ['all', ...Array.from(new Set(departments.map(dept => dept.name)))]

  // Add employee modal
  const handleAddEmployee = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      assignedRoles: [],
      position: '',
      department: departments.length > 0 ? departments[0].name : 'Operations',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      supervisor: supervisors.length > 0 ? supervisors[0].name : '',
      rating: 4.5,
      burnoutRisk: 'Low',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      emiratesIdNumber: '',
      salary: 0,
      salaryStructure: 'Monthly',
      bankAccount: '',
      bankName: '',
      visaNumber: '',
      visaExpiryDate: '',
      emergencyContact: '',
      emergencyPhone: '',
      emergencyRelation: '',
      team: [],
      documents: []
    })
    setDocuments([])
    setDocumentName('')
    setSelectedEmployee(null)
    setIsEditing(false)
    setExpandedSection('personal')
    setShowModal(true)
  }, [departments, supervisors])

  // Edit employee
  const handleEditEmployee = useCallback((emp: any) => {
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || '',
      assignedRoles: emp.assignedRoles || [],
      position: emp.position || '',
      department: emp.department || (departments.length > 0 ? departments[0].name : 'Operations'),
      status: emp.status || 'Active',
      joinDate: emp.joinDate || new Date().toISOString().split('T')[0],
      supervisor: emp.supervisor || (supervisors.length > 0 ? supervisors[0].name : ''),
      rating: emp.rating || 4.5,
      burnoutRisk: emp.burnoutRisk || 'Low',
      dateOfBirth: emp.dateOfBirth || '',
      nationality: emp.nationality || '',
      passportNumber: emp.passportNumber || '',
      emiratesIdNumber: emp.emiratesIdNumber || '',
      salary: emp.salary || 0,
      salaryStructure: emp.salaryStructure || 'Monthly',
      bankAccount: emp.bankAccount || '',
      bankName: emp.bankName || '',
      visaNumber: emp.visaNumber || '',
      visaExpiryDate: emp.visaExpiryDate || '',
      emergencyContact: emp.emergencyContact || '',
      emergencyPhone: emp.emergencyPhone || '',
      emergencyRelation: emp.emergencyRelation || '',
      team: emp.team || [],
      documents: emp.documents || []
    })
    setDocuments(emp.documents || [])
    setDocumentName('')
    setSelectedEmployee(emp)
    setIsEditing(true)
    setShowModal(true)
  }, [departments, supervisors])

  // Add department modal
  const handleAddDepartment = useCallback(() => {
    setDepartmentForm({
      name: '',
      description: '',
      manager: '',
      budget: 0,
      location: '',
      active: true,
      employeeCount: 0,
      establishedDate: new Date().toISOString().split('T')[0]
    })
    setShowDepartmentModal(true)
  }, [])

  // Edit department
  const handleEditDepartment = useCallback((dept: any) => {
    setDepartmentForm({
      name: dept.name || '',
      description: dept.description || '',
      manager: dept.manager || '',
      budget: dept.budget || 0,
      location: dept.location || '',
      active: dept.active !== undefined ? dept.active : true,
      employeeCount: dept.employeeCount || 0,
      establishedDate: dept.establishedDate || new Date().toISOString().split('T')[0]
    })
    setShowDepartmentModal(true)
  }, [])

  // Add supervisor modal
  const handleAddSupervisor = useCallback(() => {
    setSupervisorForm({
      name: '',
      email: '',
      phone: '',
      department: departments.length > 0 ? departments[0].name : '',
      position: 'Supervisor',
      maxEmployees: 10,
      active: true,
      assignedEmployees: [],
      experience: '2-5 years'
    })
    setShowSupervisorModal(true)
  }, [departments])

  // Edit supervisor
  const handleEditSupervisor = useCallback((sup: any) => {
    setSupervisorForm({
      name: sup.name || '',
      email: sup.email || '',
      phone: sup.phone || '',
      department: sup.department || '',
      position: sup.position || 'Supervisor',
      maxEmployees: sup.maxEmployees || 10,
      active: sup.active !== undefined ? sup.active : true,
      assignedEmployees: sup.assignedEmployees || [],
      experience: sup.experience || '2-5 years'
    })
    setShowSupervisorModal(true)
  }, [])

  // Firebase me employee save/update
  const handleSaveEmployee = async () => {
    if (!formData.name || !formData.role || !formData.email) {
      alert('Please fill all required fields (Name, Role, Email)')
      return
    }

    try {
      const employeeData = {
        ...formData,
        documents: documents,
        team: formData.team || [],
        rating: formData.rating || 4.5,
        burnoutRisk: formData.burnoutRisk || 'Low',
        lastUpdated: new Date().toISOString(),
        createdAt: isEditing ? selectedEmployee.createdAt : new Date().toISOString()
      }

      if (isEditing && selectedEmployee) {
        const employeeDoc = doc(db, 'employees', selectedEmployee.id)
        await updateDoc(employeeDoc, employeeData)
        alert('Employee updated successfully')
      } else {
        await addDoc(collection(db, 'employees'), employeeData)
        alert('Employee added successfully')
      }

      await fetchEmployees()
      setShowModal(false)
      setDocuments([])
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        assignedRoles: [],
        position: '',
        department: departments.length > 0 ? departments[0].name : 'Operations',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        supervisor: supervisors.length > 0 ? supervisors[0].name : '',
        rating: 4.5,
        burnoutRisk: 'Low',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        emiratesIdNumber: '',
        salary: 0,
        salaryStructure: 'Monthly',
        bankAccount: '',
        bankName: '',
        visaNumber: '',
        visaExpiryDate: '',
        emergencyContact: '',
        emergencyPhone: '',
        emergencyRelation: '',
        team: [],
        documents: []
      })
    } catch (error) {
      console.error('Error saving employee:', error)
      alert('Failed to save employee')
    }
  }

  // Add/Update department
  const handleSaveDepartment = async () => {
    if (!departmentForm.name) {
      alert('Please enter department name')
      return
    }

    try {
      // Calculate employee count for this department
      const employeeCount = employees.filter(emp => emp.department === departmentForm.name).length
      
      const departmentData = {
        ...departmentForm,
        employeeCount: employeeCount,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'departments'), departmentData)
      alert('Department saved successfully')
      await fetchDepartments()
      setShowDepartmentModal(false)
      setDepartmentForm({
        name: '',
        description: '',
        manager: '',
        budget: 0,
        location: '',
        active: true,
        employeeCount: 0,
        establishedDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error saving department:', error)
      alert('Failed to save department')
    }
  }

  // Add/Update supervisor
  const handleSaveSupervisor = async () => {
    if (!supervisorForm.name) {
      alert('Please enter supervisor name')
      return
    }

    try {
      // Calculate assigned employees for this supervisor
      const assignedEmployees = employees.filter(emp => emp.supervisor === supervisorForm.name).map(emp => emp.id)
      
      const supervisorData = {
        ...supervisorForm,
        assignedEmployees: assignedEmployees,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'supervisors'), supervisorData)
      alert('Supervisor saved successfully')
      await fetchSupervisors()
      setShowSupervisorModal(false)
      setSupervisorForm({
        name: '',
        email: '',
        phone: '',
        department: departments.length > 0 ? departments[0].name : '',
        position: 'Supervisor',
        maxEmployees: 10,
        active: true,
        assignedEmployees: [],
        experience: '2-5 years'
      })
    } catch (error) {
      console.error('Error saving supervisor:', error)
      alert('Failed to save supervisor')
    }
  }

  // Delete employee
  const handleDeleteEmployee = useCallback((emp: any) => {
    setSelectedEmployee(emp)
    setShowDeleteConfirm(true)
  }, [])

  // Delete department
  const handleDeleteDepartment = useCallback(async (dept: any) => {
    if (confirm(`Delete department "${dept.name}"? This will not delete employees.`)) {
      try {
        await deleteDoc(doc(db, 'departments', dept.id))
        alert('Department deleted successfully')
        await fetchDepartments()
      } catch (error) {
        console.error('Error deleting department:', error)
        alert('Failed to delete department')
      }
    }
  }, [])

  // Delete supervisor
  const handleDeleteSupervisor = useCallback(async (sup: any) => {
    if (confirm(`Delete supervisor "${sup.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'supervisors', sup.id))
        alert('Supervisor deleted successfully')
        await fetchSupervisors()
      } catch (error) {
        console.error('Error deleting supervisor:', error)
        alert('Failed to delete supervisor')
      }
    }
  }, [])

  // Firebase se employee delete
  const confirmDelete = async () => {
    if (selectedEmployee) {
      try {
        await deleteDoc(doc(db, 'employees', selectedEmployee.id))
        alert(`${selectedEmployee.name} removed successfully`)
        await fetchEmployees()
        setShowDeleteConfirm(false)
        setSelectedEmployee(null)
      } catch (error) {
        console.error('Error deleting employee:', error)
        alert('Failed to delete employee')
      }
    }
  }

  // Colors for burnout risk
  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-700'
      case 'High': return 'bg-orange-100 text-orange-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-green-100 text-green-700'
    }
  }

  // Colors for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'On Leave': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6 bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black">Organization Management</h1>
          <p className="text-gray-600 mt-1">Manage employees, departments, and supervisors</p>
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <span>✅ Connected to Firebase</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live Data</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddDepartment} 
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Building className="h-5 w-5" />
            <span className="font-bold">Add Department</span>
          </button>
          <button 
            onClick={handleAddSupervisor} 
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserCog className="h-5 w-5" />
            <span className="font-bold">Add Supervisor</span>
          </button>
          <button 
            onClick={handleAddEmployee} 
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span className="font-bold">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-300">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTable('employees')}
            className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTable === 'employees'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTable('departments')}
            className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTable === 'departments'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="h-4 w-4" />
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTable('supervisors')}
            className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTable === 'supervisors'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCog className="h-4 w-4" />
            Supervisors ({supervisors.length})
          </button>
        </div>
      </div>

      {/* Search & Filters - Common for all tabs */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
            <input
              type="text"
              placeholder={
                activeTable === 'employees' ? "Search employees..." :
                activeTable === 'departments' ? "Search departments..." :
                "Search supervisors..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {activeTable === 'employees' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
              >
                {allDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status === 'all' ? 'All Status' : status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Quick Stats</label>
              <div className="text-sm font-bold text-black">Showing: {filteredEmployees.length} of {employees.length} employees</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Total Employees</p>
          <p className="text-2xl font-black text-blue-700">{employees.length}</p>
          <p className="text-xs text-blue-600 mt-2">From Firebase Database</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Departments</p>
          <p className="text-2xl font-black text-purple-700">{departments.length}</p>
          <p className="text-xs text-purple-600 mt-2">Active departments</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Supervisors</p>
          <p className="text-2xl font-black text-indigo-700">{supervisors.length}</p>
          <p className="text-xs text-indigo-600 mt-2">Team leaders</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Burnout Risk</p>
          <p className="text-2xl font-black text-orange-700">
            {employees.filter(e => e.burnoutRisk === 'Critical').length} Critical
          </p>
          <p className="text-xs text-orange-600 mt-2">Requires immediate attention</p>
        </div>
      </div>

      {/* Employees Table */}
      {activeTable === 'employees' && (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Team Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Burnout</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading.employees ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading employees...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">{emp.name || 'No Name'}</p>
                            <p className="text-xs text-gray-600">{emp.email || 'No Email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-black">{emp.role || 'No Role'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{emp.department || 'No Dept'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-black">{emp.supervisor || 'None'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-black">{emp.team?.length || 0}</div>
                        {emp.team?.length > 0 && (
                          <p className="text-xs text-gray-600">{supervisorMetrics[emp.name]?.ratio}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-black">{emp.rating || 0}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getBurnoutColor(emp.burnoutRisk)}`}>
                          {emp.burnoutRisk || 'Low'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(emp.status)}`}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditEmployee(emp)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No employees found</p>
                        <p className="text-sm mt-1">Add your first employee or check your Firebase connection</p>
                        <button 
                          onClick={handleAddEmployee}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Employee
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Table */}
      {activeTable === 'departments' && (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Employees</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Budget (AED)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading.departments ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-gray-600">Loading departments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => {
                    const deptEmployees = employees.filter(emp => emp.department === dept.name).length
                    return (
                      <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                              {dept.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{dept.name || 'No Name'}</p>
                              <p className="text-xs text-gray-600">Established: {dept.establishedDate || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 max-w-xs truncate">{dept.description || 'No description'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-black">{dept.manager || 'Not assigned'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{dept.location || 'Main Office'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-black">{deptEmployees}</div>
                          <p className="text-xs text-gray-600">members</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-purple-700">AED {dept.budget?.toLocaleString() || '0'}</div>
                          <p className="text-xs text-gray-600">annual</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            dept.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {dept.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditDepartment(dept)}
                              className="p-1 hover:bg-purple-100 rounded text-purple-600"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No departments found</p>
                        <p className="text-sm mt-1">Create your first department to organize your team</p>
                        <button 
                          onClick={handleAddDepartment}
                          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add First Department
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supervisors Table */}
      {activeTable === 'supervisors' && (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Assigned Employees</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Max Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading.supervisors ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-600">Loading supervisors...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSupervisors.length > 0 ? (
                  filteredSupervisors.map((sup) => {
                    const assigned = employees.filter(emp => emp.supervisor === sup.name).length
                    const max = sup.maxEmployees || 10
                    const percentage = max > 0 ? Math.round((assigned / max) * 100) : 0
                    
                    return (
                      <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                              {sup.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-black">{sup.name || 'No Name'}</p>
                              <p className="text-xs text-gray-600">ID: {sup.id?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-black">{sup.email || 'No email'}</p>
                            <p className="text-xs text-gray-600">{sup.phone || 'No phone'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{sup.department || 'Not assigned'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-black">{sup.position || 'Supervisor'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-black">{assigned}</div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              percentage > 90 ? 'bg-red-100 text-red-700' :
                              percentage > 70 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {percentage}%
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">of capacity</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-black">{max}</div>
                          <p className="text-xs text-gray-600">max employees</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{sup.experience || '2-5 years'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            sup.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sup.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSupervisor(sup)}
                              className="p-1 hover:bg-indigo-100 rounded text-indigo-600"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupervisor(sup)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center">
                      <div className="text-gray-500">
                        <UserCog className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No supervisors found</p>
                        <p className="text-sm mt-1">Add supervisors to manage your teams effectively</p>
                        <button 
                          onClick={handleAddSupervisor}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Add First Supervisor
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organization Hierarchy Summary */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h3 className="font-bold text-black mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Organization Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-bold text-blue-700 mb-2">Employee Distribution</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {departments.slice(0, 5).map(dept => {
                const deptEmployees = employees.filter(emp => emp.department === dept.name).length
                const percentage = employees.length > 0 ? (deptEmployees / employees.length * 100).toFixed(1) : 0
                return (
                  <div key={dept.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">{deptEmployees}</span>
                      <span className="text-xs text-gray-600">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-bold text-purple-700 mb-2">Department Budgets</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {departments.slice(0, 5).map(dept => (
                <div key={dept.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{dept.name}</span>
                  <span className="text-sm font-bold text-purple-700">AED {dept.budget?.toLocaleString() || '0'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm font-bold text-indigo-700 mb-2">Supervisor Capacity</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {supervisors.slice(0, 5).map(sup => {
                const assigned = employees.filter(emp => emp.supervisor === sup.name).length
                const max = sup.maxEmployees || 10
                const percentage = max > 0 ? Math.round((assigned / max) * 100) : 0
                return (
                  <div key={sup.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate">{sup.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">{assigned}/{max}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        percentage > 90 ? 'bg-red-100 text-red-700' :
                        percentage > 70 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  Add New Department
                </h2>
                <p className="text-sm text-gray-600 mt-1">Create a new department in your organization</p>
              </div>
              <button onClick={() => setShowDepartmentModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-6 w-6 text-black" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Marketing, IT, Operations"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Description</label>
                <textarea
                  placeholder="Describe the department's purpose and responsibilities"
                  value={departmentForm.description}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Manager</label>
                  <input
                    type="text"
                    placeholder="Department Manager"
                    value={departmentForm.manager}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, manager: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Floor 3, Building A"
                    value={departmentForm.location}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, location: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Annual Budget (AED)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-bold">AED</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={departmentForm.budget}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, budget: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Established Date</label>
                  <input
                    type="date"
                    value={departmentForm.establishedDate}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, establishedDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="departmentActive"
                  checked={departmentForm.active}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="departmentActive" className="text-sm font-medium text-gray-700">
                  Active Department
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-300">
              <button
                onClick={() => setShowDepartmentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDepartment}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Building className="h-4 w-4" />
                Save Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Modal */}
      {showSupervisorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-300">
              <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-indigo-600" />
                  Add New Supervisor
                </h2>
                <p className="text-sm text-gray-600 mt-1">Add a new supervisor to manage team members</p>
              </div>
              <button onClick={() => setShowSupervisorModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-6 w-6 text-black" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Supervisor Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={supervisorForm.name}
                  onChange={(e) => setSupervisorForm({ ...supervisorForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Email</label>
                  <input
                    type="email"
                    placeholder="supervisor@company.com"
                    value={supervisorForm.email}
                    onChange={(e) => setSupervisorForm({ ...supervisorForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Phone</label>
                  <input
                    type="tel"
                    placeholder="+971 50 1234567"
                    value={supervisorForm.phone}
                    onChange={(e) => setSupervisorForm({ ...supervisorForm, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Department</label>
                <select
                  value={supervisorForm.department}
                  onChange={(e) => setSupervisorForm({ ...supervisorForm, department: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Position</label>
                  <select
                    value={supervisorForm.position}
                    onChange={(e) => setSupervisorForm({ ...supervisorForm, position: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="Supervisor">Supervisor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Experience</label>
                  <select
                    value={supervisorForm.experience}
                    onChange={(e) => setSupervisorForm({ ...supervisorForm, experience: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="0-2 years">0-2 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Maximum Employees</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="10"
                    value={supervisorForm.maxEmployees}
                    onChange={(e) => setSupervisorForm({ ...supervisorForm, maxEmployees: parseInt(e.target.value) || 10 })}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  />
                  <span className="text-gray-600 text-sm">team members</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="supervisorActive"
                  checked={supervisorForm.active}
                  onChange={(e) => setSupervisorForm({ ...supervisorForm, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="supervisorActive" className="text-sm font-medium text-gray-700">
                  Active Supervisor
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-300">
              <button
                onClick={() => setShowSupervisorModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupervisor}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Save Supervisor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal - Same as your original */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-300 sticky top-0 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-black">{isEditing ? 'Edit Employee Details' : 'Add New Employee'}</h2>
                <p className="text-sm text-gray-600 mt-1">Complete employee information and role assignment</p>
                <p className="text-xs text-green-600 mt-1">💾 Data will be saved to Firebase</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-6 w-6 text-black" />
              </button>
            </div>

            {/* Content with Tabs */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {/* Section Navigation */}
              <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                {[
                  { id: 'personal', label: 'Personal Info', icon: '👤' },
                  { id: 'professional', label: 'Professional', icon: '💼' },
                 
                  { id: 'financial', label: 'Financial', icon: '💰' },
                  { id: 'visa', label: 'Visa & Documents', icon: '📄' },
                  { id: 'emergency', label: 'Emergency', icon: '🆘' }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      expandedSection === section.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Personal Information */}
              {expandedSection === 'personal' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Full Name *</label>
                      <input
                        type="text"
                        placeholder="First and Last Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Email *</label>
                      <input
                        type="email"
                        placeholder="employee@silvermaid.ae"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Phone *</label>
                      <input
                        type="tel"
                        placeholder="+971 50 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Nationality</label>
                      <input
                        type="text"
                        placeholder="Country of Origin"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Passport Number</label>
                      <input
                        type="text"
                        placeholder="Passport ID"
                        value={formData.passportNumber}
                        onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Emirates ID Number</label>
                    <input
                      type="text"
                      placeholder="UAE ID Number"
                      value={formData.emiratesIdNumber}
                      onChange={(e) => setFormData({ ...formData, emiratesIdNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {expandedSection === 'professional' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Professional Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Primary Role *</label>
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Position/Level</label>
                      <input
                        type="text"
                        placeholder="e.g., Senior, Executive"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Employment Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Probation">Probation</option>
                        <option value="Contract">Contract</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Join Date</label>
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Supervisor</label>
                      <select
                        value={formData.supervisor}
                        onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="">Select Supervisor</option>
                        {supervisors.map(sup => (
                          <option key={sup.id} value={sup.name}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Performance Rating</label>
                      <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ Excellent (5.0)</option>
                        <option value="4.5">⭐⭐⭐⭐✨ Very Good (4.5)</option>
                        <option value="4">⭐⭐⭐⭐ Good (4.0)</option>
                        <option value="3.5">⭐⭐⭐✨ Satisfactory (3.5)</option>
                        <option value="3">⭐⭐⭐ Average (3.0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Burnout Risk Level</label>
                      <select
                        value={formData.burnoutRisk}
                        onChange={(e) => setFormData({ ...formData, burnoutRisk: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="Low">🟢 Low Risk</option>
                        <option value="Medium">🟡 Medium Risk</option>
                        <option value="High">🟠 High Risk</option>
                        <option value="Critical">🔴 Critical Risk</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Roles & Access */}
              {expandedSection === 'roles' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Roles & Access Management
                  </h3>

                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-3 block">Available Roles</label>
                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-300">
                      {availableRoles.map(role => (
                        <label key={role} className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.assignedRoles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedRoles: [...formData.assignedRoles, role]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedRoles: formData.assignedRoles.filter(r => r !== role)
                                })
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{role}</p>
                          </div>
                          {formData.assignedRoles.includes(role) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.assignedRoles.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Currently Assigned Roles</label>
                      <div className="flex flex-wrap gap-2">
                        {formData.assignedRoles.map(role => (
                          <div key={role} className="flex items-center gap-2 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full">
                            <span className="text-sm font-medium text-blue-700">{role}</span>
                            <button
                              onClick={() => setFormData({
                                ...formData,
                                assignedRoles: formData.assignedRoles.filter(r => r !== role)
                              })}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Financial Information */}
              {expandedSection === 'financial' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Financial & Salary Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Monthly Salary</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-bold">AED</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Salary Structure</label>
                      <select
                        value={formData.salaryStructure}
                        onChange={(e) => setFormData({ ...formData, salaryStructure: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Hourly">Hourly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Emirates NBD, FAB"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visa & Documents */}
              {expandedSection === 'visa' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Visa & Document Details
                  </h3>

                  {/* Visa Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-700">Visa Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Visa Number</label>
                        <input
                          type="text"
                          placeholder="Visa ID Number"
                          value={formData.visaNumber}
                          onChange={(e) => setFormData({ ...formData, visaNumber: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Visa Expiry Date</label>
                        <input
                          type="date"
                          value={formData.visaExpiryDate}
                          onChange={(e) => setFormData({ ...formData, visaExpiryDate: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                      </div>
                    </div>

                    {formData.visaExpiryDate && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 font-medium">
                          📅 Visa expires on {new Date(formData.visaExpiryDate).toLocaleDateString()}
                          {(() => {
                            const days = Math.ceil((new Date(formData.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            if (days < 30) return ` (⚠️ Expires in ${days} days)`
                            return ` (✓ Valid for ${days} days)`
                          })()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Documents Management */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-700">Employee Documents</h4>
                      <button
                        onClick={() => {
                          setDocumentName('')
                          setDocumentValidDate('')
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        title="Add new document"
                      >
                        <Plus className="h-3 w-3" />
                        Add Document
                      </button>
                    </div>

                    {/* Add Document Section */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <label className="text-sm font-bold text-gray-700">Add New Document</label>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Document Name (e.g., Passport, Insurance)"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                          />
                          <input
                            type="date"
                            placeholder="Valid Until (optional)"
                            value={documentValidDate}
                            onChange={(e) => setDocumentValidDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            Upload File
                          </button>
                          <button
                            onClick={() => {
                              if (!documentName.trim()) {
                                alert('Please enter a document name')
                                return
                              }
                              const newDoc = {
                                id: Date.now().toString(),
                                name: documentName,
                                fileName: documentName + ' - No file uploaded',
                                uploadDate: new Date().toISOString().split('T')[0],
                                validDate: documentValidDate || undefined
                              }
                              setDocuments([...documents, newDoc])
                              setDocumentName('')
                              setDocumentValidDate('')
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 border border-green-700 rounded-lg text-sm font-medium text-white hover:bg-green-700 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Add Document
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0]
                              if (!documentName.trim()) {
                                alert('Please enter a document name first')
                                return
                              }
                              const newDoc = {
                                id: Date.now().toString(),
                                name: documentName,
                                fileName: file.name,
                                uploadDate: new Date().toISOString().split('T')[0],
                                validDate: documentValidDate || undefined
                              }
                              setDocuments([...documents, newDoc])
                              setDocumentName('')
                              setDocumentValidDate('')
                              e.target.value = ''
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Documents List */}
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">Uploaded Documents ({documents.length})</label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {documents.map((doc, idx) => {
                            const isExpiringSoon = doc.validDate && new Date(doc.validDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            const isExpired = doc.validDate && new Date(doc.validDate) < new Date()
                            
                            return (
                              <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                isExpired ? 'bg-red-50 border-red-200' : 
                                isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 
                                'bg-blue-50 border-blue-200'
                              }`}>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <File className={`h-5 w-5 shrink-0 ${
                                    isExpired ? 'text-red-500' : 
                                    isExpiringSoon ? 'text-yellow-500' : 
                                    'text-blue-600'
                                  }`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-gray-700 truncate">{doc.name}</p>
                                      {isExpired && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Expired</span>}
                                      {isExpiringSoon && !isExpired && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Expiring Soon</span>}
                                    </div>
                                    <p className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                    {doc.validDate && (
                                      <p className="text-xs text-gray-500">Valid until: {new Date(doc.validDate).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setDocuments(documents.filter((d, i) => i !== idx))
                                  }}
                                  className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded transition-colors shrink-0"
                                  title="Remove document"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {documents.length === 0 && (
                      <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No documents uploaded yet. Add documents to track important files.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {expandedSection === 'emergency' && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-black flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue-600" />
                    Emergency Contact Information
                  </h3>

                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Emergency Contact Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Emergency Phone</label>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Relationship</label>
                      <select
                        value={formData.emergencyRelation}
                        onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-300 sticky bottom-0 bg-gradient-to-r from-gray-50 to-white">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isEditing ? '✏️ Update in Firebase' : '➕ Save to Firebase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-sm">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-black">Remove Employee?</h3>
              <p className="text-gray-600">Are you sure you want to remove <span className="font-bold text-black">{selectedEmployee.name}</span> from the team? This action cannot be undone.</p>
              <p className="text-xs text-red-600">⚠️ This will delete the employee from Firebase database</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-300">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-black"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete from Firebase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}