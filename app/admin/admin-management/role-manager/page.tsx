'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Shield, 
  Users, 
  Lock, 
  Zap, 
  ShieldCheck,
  ArrowUpRight,
  Activity,
  Mail,
  Eye,
  EyeOff,
  Briefcase,
  UserCog,
  MessageCircle,
  BarChart3 // ✅ Import Report icon
} from 'lucide-react'
import { createUserWithRole, updateUserRole, deleteUserRole, UserRole } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

// Available pages for selection - ONLY FOR ADMIN
const ALL_PAGES = [
  'Dashboard',
  'Lead Dashboard', 
  'Communications',
  'Clients',
  'Surveys',
  'Report',           // ✅ Changed from 'report' to 'Report' with proper capitalization
  'Process Inquiry',   // ✅ Fixed capitalization
  'Quotations',
  'Inventory & Services',
  'Jobs',
  'Equipment & Permits',
  'Job Profitability',
  'Bookings',
  'Employee Directory',
  'Attendance',
  'Leave Management',
  'Payroll',
  'Performance Dashboard',
  'Feedback & Complaints',
  'Meeting Calendar',
  'Meeting Detail',
  'Notes & Decisions',
  'Follow-Up Tracker',
  'Finance',
  'Marketing',
  'Role Manager',
  'Permission Matrix',
  'User Accounts',
  'Audit Logs',
  'AI Command Center',
  'AI Recommendations',
  'CMS',
  'Settings',
  'Employee Chat'
]

// Portal Types
const PORTALS = [
  { id: 'admin', name: 'Admin Portal', icon: Shield },
  { id: 'employee', name: 'Employee Portal', icon: Briefcase }
]

// Employee Interface
interface Employee {
  id: string
  name: string
  email: string
  department?: string
  position?: string
}

// Extended UserRole interface for local state
interface LocalUserRole extends UserRole {
  allowedPages: string[]
  portal: 'admin' | 'employee'
  employeeId?: string
  employeeName?: string
}

export default function RoleManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<LocalUserRole[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    portal: 'admin' as 'admin' | 'employee',
    employeeId: '',
    allowedPages: [] as string[]
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch all users from Firebase
  useEffect(() => {
    fetchUserRoles()
  }, [])

  // Fetch employees when portal changes to employee
  useEffect(() => {
    if (newUser.portal === 'employee') {
      fetchEmployees()
    }
  }, [newUser.portal])

  const fetchUserRoles = async () => {
    try {
      console.log('🔍 Fetching user roles...')
      const usersRoleRef = collection(db, 'users-role')
      const snapshot = await getDocs(usersRoleRef)
      const roles: LocalUserRole[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        roles.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          allowedPages: data.allowedPages || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          portal: data.portal || 'admin',
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          roleName: ''
        })
      })
      
      console.log(`✅ Found ${roles.length} users`)
      setUserRoles(roles)
    } catch (error) {
      console.error('❌ Error fetching user roles:', error)
    }
  }

  // Fetch employees from Firebase
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      console.log('🔍 Fetching employees...')
      const employeesRef = collection(db, 'employees')
      const snapshot = await getDocs(employeesRef)
      
      const employeesData: Employee[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'No Name',
        email: doc.data().email || '',
        department: doc.data().department || '',
        position: doc.data().position || ''
      }))
      
      // Sort by name
      employeesData.sort((a, b) => a.name.localeCompare(b.name))
      
      console.log(`✅ Found ${employeesData.length} employees`)
      setEmployees(employeesData)
    } catch (error) {
      console.error('❌ Error fetching employees:', error)
    } finally {
      setLoadingEmployees(false)
    }
  }

  const filteredRoles = useMemo(() => {
    return userRoles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, userRoles])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all required fields')
      return
    }

    if (newUser.portal === 'employee' && !newUser.employeeId) {
      alert('Please select an employee')
      return
    }

    // For admin portal, require page selection
    if (newUser.portal === 'admin' && newUser.allowedPages.length === 0) {
      alert('Please select at least one page access for admin')
      return
    }

    setLoading(true)
    
    try {
      const selectedEmployee = employees.find(e => e.id === newUser.employeeId)
      
      // For employee portal, always give them ONLY chat access
      const allowedPages = newUser.portal === 'employee' 
        ? ['Employee Chat']
        : newUser.allowedPages
      
      console.log('📝 Creating user with data:', {
        email: newUser.email,
        name: newUser.name,
        portal: newUser.portal,
        employeeId: newUser.employeeId,
        allowedPages
      })
      
      const result = await createUserWithRole(
        newUser.email,
        newUser.password,
        newUser.name,
        allowedPages,
        newUser.portal,
        newUser.portal === 'employee' ? newUser.employeeId : '',
        newUser.portal === 'employee' ? selectedEmployee?.name : ''
      )

      if (result.success) {
        alert('✅ User created successfully!')
        setNewUser({
          name: '',
          email: '',
          password: '',
          portal: 'admin',
          employeeId: '',
          allowedPages: []
        })
        setShowForm(false)
        fetchUserRoles()
      } else {
        alert(`❌ Error creating user: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (userId: string) => {
    const user = userRoles.find(r => r.id === userId)
    if (user) {
      setNewUser({
        name: user.name,
        email: user.email,
        password: '',
        portal: user.portal,
        employeeId: user.employeeId || '',
        allowedPages: user.allowedPages
      })
      setEditingUserId(userId)
      setShowForm(true)
      
      // If portal is employee, fetch employees
      if (user.portal === 'employee') {
        fetchEmployees()
      }
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUserId || !newUser.name) {
      alert('Please fill all required fields')
      return
    }

    if (newUser.portal === 'employee' && !newUser.employeeId) {
      alert('Please select an employee')
      return
    }

    // For admin portal, require page selection
    if (newUser.portal === 'admin' && newUser.allowedPages.length === 0) {
      alert('Please select at least one page access for admin')
      return
    }

    setLoading(true)
    
    try {
      const selectedEmployee = employees.find(e => e.id === newUser.employeeId)
      
      // For employee portal, always give them ONLY chat access
      const allowedPages = newUser.portal === 'employee' 
        ? ['Employee Chat']
        : newUser.allowedPages
      
      console.log('📝 Updating user:', { 
        id: editingUserId, 
        name: newUser.name, 
        portal: newUser.portal,
        employeeId: newUser.employeeId 
      })
      
      const updateData: any = {
        name: newUser.name,
        portal: newUser.portal,
        allowedPages: allowedPages
      }
      
      if (newUser.portal === 'employee') {
        updateData.employeeId = newUser.employeeId
        updateData.employeeName = selectedEmployee?.name || newUser.name
      } else {
        // Clear employee fields for admin users
        updateData.employeeId = ''
        updateData.employeeName = ''
      }
      
      const result = await updateUserRole(editingUserId, updateData)

      if (result.success) {
        alert('✅ User updated successfully!')
        setNewUser({
          name: '',
          email: '',
          password: '',
          portal: 'admin',
          employeeId: '',
          allowedPages: []
        })
        setEditingUserId(null)
        setShowForm(false)
        fetchUserRoles()
      } else {
        alert(`❌ Error updating user: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('🗑️ Deleting user:', userId)
        await deleteDoc(doc(db, 'users-role', userId))
        alert('✅ User deleted successfully!')
        fetchUserRoles()
      } catch (error) {
        console.error('❌ Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const togglePageAccess = (page: string) => {
    if (newUser.allowedPages.includes(page)) {
      setNewUser({
        ...newUser,
        allowedPages: newUser.allowedPages.filter(p => p !== page)
      })
    } else {
      setNewUser({
        ...newUser,
        allowedPages: [...newUser.allowedPages, page]
      })
    }
  }

  const selectAllPages = () => {
    setNewUser({
      ...newUser,
      allowedPages: ALL_PAGES
    })
  }

  const clearAllPages = () => {
    setNewUser({
      ...newUser,
      allowedPages: []
    })
  }

  return (
    <div className="space-y-8 pb-10 bg-white text-black">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white p-8 md:p-12 text-black shadow-2xl border border-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">User Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Create User Roles</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl">
              Create users with specific portal access. Admin users get page permissions, employees get chat access only.
            </p>
          </div>
          <button 
            onClick={() => { 
              setShowForm(true); 
              setEditingUserId(null); 
              setNewUser({ 
                name: '', 
                email: '', 
                password: '', 
                portal: 'admin',
                employeeId: '',
                allowedPages: [] 
              }) 
            }}
            className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5" />
            Create New User
          </button>
        </div>
        
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-50 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-50 blur-[100px]"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: userRoles.length, color: 'blue', icon: Users },
          { label: 'Admin Users', value: userRoles.filter(r => r.portal === 'admin').length, color: 'purple', icon: Lock },
          { label: 'Employee Users', value: userRoles.filter(r => r.portal === 'employee').length, color: 'emerald', icon: Briefcase },
          { label: 'Chat Users', value: userRoles.filter(r => r.portal === 'employee').length, color: 'amber', icon: MessageCircle }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search users by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-black placeholder:text-gray-500 transition-all"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-gray-50 rounded-3xl border border-gray-200">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Create New User" to add your first user</p>
          </div>
        ) : (
          filteredRoles.map((user) => {
            const PortalIcon = user.portal === 'admin' ? Shield : Briefcase
            return (
              <div key={user.id} className="group relative bg-white border border-gray-200 rounded-[32px] p-8 hover:bg-gray-50 transition-all overflow-hidden shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${
                        user.portal === 'admin' 
                          ? 'bg-purple-100 border-purple-200 text-purple-600' 
                          : 'bg-emerald-100 border-emerald-200 text-emerald-600'
                      }`}>
                        <PortalIcon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors">{user.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            user.portal === 'admin'
                              ? 'bg-purple-100 text-purple-600 border-purple-200'
                              : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                          } border`}>
                            {user.portal === 'admin' ? 'Admin Portal' : 'Employee Portal'}
                          </span>
                          {user.portal === 'employee' && user.employeeName && (
                            <span className="text-sm text-gray-600">
                              ({user.employeeName})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="p-2.5 bg-gray-100 hover:bg-blue-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2.5 bg-gray-100 hover:bg-red-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Allowed Pages - Show different for Admin vs Employee */}
                  <div className="mb-6">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      {user.portal === 'admin' ? 'Allowed Pages' : 'Access'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.portal === 'admin' ? (
                        // Show actual pages for admin
                        user.allowedPages.length > 0 ? (
                          user.allowedPages.slice(0, 5).map((page, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200"
                            >
                              {page}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200">
                            No pages assigned
                          </span>
                        )
                      ) : (
                        // Show chat access for employee with proper label
                        user.allowedPages.length > 0 ? (
                          user.allowedPages.slice(0, 5).map((page, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {page}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Employee Chat
                          </span>
                        )
                      )}
                      {user.allowedPages.length > 5 && (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200">
                          +{user.allowedPages.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {user.portal === 'admin' ? 'Pages Access' : 'Chat Access'}
                        </span>
                        <span className="text-lg font-black text-black">
                          {user.allowedPages.length} 
                          {user.portal === 'admin' && ` of ${ALL_PAGES.length}`}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</span>
                        <span className="text-sm font-black text-black flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-600">
                      <Activity className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-black">
                  {editingUserId ? 'Edit User Access' : 'Create New User'}
                </h2>
                <p className="text-gray-600 text-sm font-medium mt-1">
                  {editingUserId ? 'Update user details and permissions' : 'Create new user with specific portal access'}
                </p>
              </div>
              <button onClick={() => {
                setShowForm(false)
                setEditingUserId(null)
                setNewUser({ name: '', email: '', password: '', portal: 'admin', employeeId: '', allowedPages: [] })
              }} className="p-2 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Portal Selection */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Select Portal *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {PORTALS.map((portal) => {
                      const Icon = portal.icon
                      const isSelected = newUser.portal === portal.id
                      return (
                        <button
                          key={portal.id}
                          type="button"
                          onClick={() => setNewUser({...newUser, portal: portal.id as 'admin' | 'employee', employeeId: ''})}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? portal.id === 'admin'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            portal.id === 'admin' ? 'bg-purple-100' : 'bg-emerald-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              portal.id === 'admin' ? 'text-purple-600' : 'text-emerald-600'
                            }`} />
                          </div>
                          <span className="font-bold text-gray-900">{portal.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Employee Selection - ONLY SHOW when portal = employee */}
                {newUser.portal === 'employee' && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Select Employee *
                    </label>
                    <div className="relative">
                      <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={newUser.employeeId}
                        onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                        disabled={loadingEmployees}
                      >
                        <option value="">Select an employee...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.department || emp.position || emp.email}
                          </option>
                        ))}
                      </select>
                      {loadingEmployees && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {employees.length} employees available
                    </p>
                  </div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    disabled={!!editingUserId}
                    className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                      editingUserId ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Password Field */}
                {!editingUserId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Access Selection - ONLY SHOW when portal = admin */}
              {newUser.portal === 'admin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Select Pages Access *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPages}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 transition-all"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllPages}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 transition-all"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-xl">
                    {ALL_PAGES.map((page) => (
                      <div key={page} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`page-${page}`}
                          checked={newUser.allowedPages.includes(page)}
                          onChange={() => togglePageAccess(page)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`page-${page}`}
                          className={`ml-2 text-sm font-medium cursor-pointer transition-colors ${
                            newUser.allowedPages.includes(page) 
                              ? 'text-blue-600 font-bold' 
                              : 'text-gray-600'
                          }`}
                        >
                          {page}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Selected {newUser.allowedPages.length} of {ALL_PAGES.length} pages
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingUserId(null)
                  setNewUser({ name: '', email: '', password: '', portal: 'admin', employeeId: '', allowedPages: [] })
                }}
                className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingUserId ? handleUpdateUser : handleAddUser}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : editingUserId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}