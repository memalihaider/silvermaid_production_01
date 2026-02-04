'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  Shield, 
  Users, 
  Mail, 
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  ArrowUpRight,
  Activity,
  Lock,
  AlertCircle,
  Info,
  ChevronDown,
  FileText
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

interface UserRole {
  id: string
  email: string
  name: string
  allowedPages: string[]
  roleName: string
  createdAt: string
  updatedAt: string
}

export default function PermissionMatrix() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Fetch all users from Firebase
  useEffect(() => {
    fetchUserRoles()
  }, [])

  const fetchUserRoles = async () => {
    try {
      const usersRoleRef = collection(db, 'users-role')
      const snapshot = await getDocs(usersRoleRef)
      const roles: UserRole[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        roles.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          allowedPages: data.allowedPages || [],
          roleName: data.roleName || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      
      // Sort by creation date (newest first)
      roles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setUserRoles(roles)
      // Set first user as selected by default if available
      if (roles.length > 0 && !selectedUser) {
        setSelectedUser(roles[0].id)
      }
    } catch (error) {
      console.error('Error fetching user roles:', error)
    }
  }

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return userRoles.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, userRoles])

  // Get selected user data
  const selectedUserData = useMemo(() => {
    return userRoles.find(user => user.id === selectedUser)
  }, [selectedUser, userRoles])

  // Get total pages count
  const TOTAL_PAGES = 35 // Total number of pages in your system

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate days since creation
  const getDaysSinceCreation = (dateString: string) => {
    if (!dateString) return 'N/A'
    const createdDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  // Get risk level based on permissions
  const getRiskLevel = (allowedPages: string[]) => {
    const highRiskPages = ['Admin Management', 'Role Manager', 'Permission Matrix', 'User Accounts', 'Audit Logs', 'Finance']
    const mediumRiskPages = ['HR Management', 'Payroll', 'Settings', 'AI Command Center']
    
    const hasHighRisk = allowedPages.some(page => highRiskPages.includes(page))
    const hasMediumRisk = allowedPages.some(page => mediumRiskPages.includes(page))
    
    if (hasHighRisk) return { 
      level: 'high', 
      color: 'orange', 
      label: 'High Risk', 
      icon: AlertCircle 
    }
    if (hasMediumRisk) return { 
      level: 'medium', 
      color: 'amber', 
      label: 'Medium Risk', 
      icon: Info 
    }
    return { 
      level: 'low', 
      color: 'emerald', 
      label: 'Low Risk', 
      icon: ShieldCheck 
    }
  }

  // Get color class based on risk level
  const getColorClass = (color: string) => {
    switch(color) {
      case 'orange': return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'amber': return 'bg-amber-100 text-amber-600 border-amber-200'
      case 'emerald': return 'bg-emerald-100 text-emerald-600 border-emerald-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  // Group pages by category for display
  const groupPagesByCategory = (pages: string[]) => {
    const categories: Record<string, string[]> = {
      'Main Pages': [],
      'CRM': [],
      'HR Management': [],
      'Meetings': [],
      'Admin Management': [],
      'Other Pages': []
    }

    pages.forEach(page => {
      if (['Dashboard', 'Surveys', 'Quotations', 'Inventory & Services', 'Jobs', 
           'Equipment & Permits', 'Job Profitability', 'Bookings', 'Finance', 
           'Marketing', 'AI Command Center', 'CMS', 'Settings'].includes(page)) {
        categories['Main Pages'].push(page)
      } else if (['Lead Dashboard', 'Communications', 'Clients'].includes(page)) {
        categories['CRM'].push(page)
      } else if (['Employee Directory', 'Attendance', 'Leave Management', 
                  'Payroll', 'Performance Dashboard', 'Feedback & Complaints'].includes(page)) {
        categories['HR Management'].push(page)
      } else if (['Meeting Calendar', 'Meeting Detail', 'Notes & Decisions', 'Follow-Up Tracker'].includes(page)) {
        categories['Meetings'].push(page)
      } else if (['Role Manager', 'Permission Matrix', 'User Accounts', 'Audit Logs'].includes(page)) {
        categories['Admin Management'].push(page)
      } else {
        categories['Other Pages'].push(page)
      }
    })

    // Remove empty categories
    Object.keys(categories).forEach(category => {
      if (categories[category].length === 0) {
        delete categories[category]
      }
    })

    return categories
  }

  return (
    <div className="space-y-8 pb-10 bg-white text-black">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white p-8 md:p-12 text-black shadow-2xl border border-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <Fingerprint className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase">User Permissions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Permission Matrix</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl">
              View and manage user access permissions across the system.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-gray-100 rounded-2xl border border-gray-200">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Users</p>
              <p className="text-xl font-black text-black">{userRoles.length}</p>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-50 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-blue-50 blur-[100px]"></div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search users by name, email or role..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-black placeholder:text-gray-500 transition-all"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Users List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-black text-black flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Users ({filteredUsers.length})
          </h3>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser === user.id
              const risk = getRiskLevel(user.allowedPages)
              
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' 
                      : 'bg-gray-100 hover:bg-gray-200 text-black border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : getColorClass(risk.color)
                    }`}>
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                        {user.name}
                      </p>
                      <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-white/30 text-white' 
                            : getColorClass(risk.color)
                        }`}>
                          {user.roleName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-white/30 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {user.allowedPages.length} pages
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <ChevronDown className="h-4 w-4 text-white/80" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column - User Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedUserData ? (
            <>
              {/* User Header */}
              <div className="bg-white border border-gray-200 rounded-[32px] p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center border border-indigo-200">
                      <Users className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-black">{selectedUserData.name}</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{selectedUserData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            Joined {getDaysSinceCreation(selectedUserData.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</span>
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-bold">
                      {selectedUserData.roleName}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { 
                      label: 'Total Pages', 
                      value: selectedUserData.allowedPages.length, 
                      total: TOTAL_PAGES, 
                      color: 'blue', 
                      icon: FileText 
                    },
                    { 
                      label: 'Access Level', 
                      value: getRiskLevel(selectedUserData.allowedPages).label, 
                      color: getRiskLevel(selectedUserData.allowedPages).color, 
                      icon: Shield 
                    },
                    { 
                      label: 'Created On', 
                      value: formatDate(selectedUserData.createdAt).split(',')[0], 
                      color: 'gray', 
                      icon: Calendar 
                    },
                    { 
                      label: 'Last Updated', 
                      value: formatDate(selectedUserData.updatedAt).split(',')[0], 
                      color: 'gray', 
                      icon: Clock 
                    }
                  ].map((stat, idx) => {
                    const IconComponent = stat.icon
                    const colorClass = getColorClass(stat.color).split(' ')[0] + '-600'
                    
                    return (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-2 rounded-lg ${getColorClass(stat.color)}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {stat.label}
                          </span>
                        </div>
                        {stat.total ? (
                          <div>
                            <p className="text-lg font-black text-black">{stat.value} / {stat.total}</p>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
                              <div 
                                className={`h-full ${colorClass}`}
                                style={{ width: `${(stat.value / stat.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg font-black text-black truncate">{stat.value}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Permissions Details */}
              <div className="bg-white border border-gray-200 rounded-[32px] p-8">
                <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-indigo-600" />
                  Page Permissions
                </h3>

                {/* Grouped Pages Display */}
                <div className="space-y-6">
                  {Object.entries(groupPagesByCategory(selectedUserData.allowedPages)).map(([category, pages]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                        <span className="text-indigo-600">{category}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pages.map((page, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                          >
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-emerald-700">{page}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Access Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Access Summary</h4>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-blue-700">
                          📊 {selectedUserData.name} has access to {selectedUserData.allowedPages.length} of {TOTAL_PAGES} pages
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          That's {((selectedUserData.allowedPages.length / TOTAL_PAGES) * 100).toFixed(1)}% of total system pages
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Risk Level</p>
                        <div className="mt-1">
                          {(() => {
                            const risk = getRiskLevel(selectedUserData.allowedPages)
                            const IconComponent = risk.icon
                            const colorClass = getColorClass(risk.color)
                            
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
                                <IconComponent className="h-3 w-3" />
                                {risk.label}
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-[32px] p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-black mb-2">No User Selected</h3>
              <p className="text-gray-600">
                Select a user from the list to view their permissions and access details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
          <Shield className="h-7 w-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black">Permission Governance</h3>
          <p className="text-gray-600 mt-2 leading-relaxed">
            This permission matrix shows real-time access rights for all system users. 
            Each user's page access is dynamically managed through the Role Manager. 
            All permission changes are logged and monitored for security compliance.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Real Data from Firebase
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              <Activity className="h-4 w-4" /> Live Permissions
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
              <Users className="h-4 w-4" /> {userRoles.length} Active Users
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}