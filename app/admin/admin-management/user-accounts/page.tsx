'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Lock, 
  Unlock, 
  Clock, 
  Mail, 
  Phone, 
  Shield, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  MoreHorizontal,
  ChevronRight,
  Building2,
  Fingerprint
} from 'lucide-react'

export default function UserAccounts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [showTempAccessForm, setShowTempAccessForm] = useState<number | null>(null)
  const [tempAccessDays, setTempAccessDays] = useState(7)
  const [showPassword, setShowPassword] = useState(false)
  
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'user', department: 'general', password: '' })
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmed Al-Maktoum', email: 'ahmed@silvermaid.ae', phone: '+971501234567', role: 'Super Admin', department: 'Management', status: 'Active', createdDate: '2025-01-01', lastLogin: '2025-02-18 14:30', tempAccessGrants: [] },
    { id: 2, name: 'Fatima Al-Mansouri', email: 'fatima@silvermaid.ae', phone: '+971502345678', role: 'Admin', department: 'Operations', status: 'Active', createdDate: '2025-01-05', lastLogin: '2025-02-18 10:15', tempAccessGrants: [] },
    { id: 3, name: 'Mohammed Al-Nuaimi', email: 'mohammed@silvermaid.ae', phone: '+971503456789', role: 'Manager', department: 'HR', status: 'Active', createdDate: '2025-01-10', lastLogin: '2025-02-17 16:45', tempAccessGrants: [{ permission: 'Finance:Approve', until: '2025-02-25' }] },
    { id: 4, name: 'Layla Al-Zaabi', email: 'layla@silvermaid.ae', phone: '+971504567890', role: 'Manager', department: 'Finance', status: 'Active', createdDate: '2025-01-15', lastLogin: '2025-02-18 11:20', tempAccessGrants: [] },
    { id: 5, name: 'Khalid Al-Marri', email: 'khalid@silvermaid.ae', phone: '+971505678901', role: 'Supervisor', department: 'Operations', status: 'Active', createdDate: '2025-01-20', lastLogin: '2025-02-17 09:30', tempAccessGrants: [] },
    { id: 6, name: 'Noor Al-Hassani', email: 'noor@silvermaid.ae', phone: '+971506789012', role: 'User', department: 'Sales', status: 'Active', createdDate: '2025-01-25', lastLogin: '2025-02-18 13:50', tempAccessGrants: [] },
    { id: 7, name: 'Omar Al-Ketbi', email: 'omar@silvermaid.ae', phone: '+971507890123', role: 'User', department: 'Operations', status: 'Inactive', createdDate: '2025-02-01', lastLogin: '2025-02-10 15:20', tempAccessGrants: [] },
  ])

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (searchTerm === '' || user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === 'all' || user.role === filterRole) &&
      (filterStatus === 'all' || user.status === filterStatus)
    )
  }, [searchTerm, filterRole, filterStatus, users])

  const handleAddUser = useCallback(() => {
    if (newUser.name && newUser.email && newUser.password) {
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser ? { ...u, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role, department: newUser.department } : u))
        setEditingUser(null)
      } else {
        const user = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          status: 'Active',
          createdDate: new Date().toISOString().split('T')[0],
          lastLogin: 'Never',
          tempAccessGrants: []
        }
        setUsers([...users, user])
      }
      setNewUser({ name: '', email: '', phone: '', role: 'user', department: 'general', password: '' })
      setShowForm(false)
    }
  }, [newUser, editingUser, users])

  const handleEditUser = useCallback((id: number) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setNewUser({ name: user.name, email: user.email, phone: user.phone, role: user.role, department: user.department, password: '' })
      setEditingUser(id)
      setShowForm(true)
    }
  }, [users])

  const handleToggleStatus = useCallback((id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
  }, [users])

  const handleGrantTempAccess = useCallback((id: number) => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + tempAccessDays)
    
    setUsers(users.map(u => u.id === id ? {
      ...u,
      tempAccessGrants: [...u.tempAccessGrants, { permission: 'Finance:Export', until: expiryDate.toISOString().split('T')[0] }]
    } : u))
    setShowTempAccessForm(null)
  }, [tempAccessDays, users])

  const handleDeleteUser = useCallback((id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }, [users])

  const departments = ['Management', 'Operations', 'HR', 'Finance', 'Sales', 'IT', 'General']
  const roles = ['Super Admin', 'Admin', 'Manager', 'Supervisor', 'User', 'Guest']

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white p-8 md:p-12 text-black shadow-2xl border border-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Identity & Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">User Accounts</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl">
              Manage system users, roles, and temporary access grants with precision.
            </p>
          </div>
          <button 
            onClick={() => { setShowForm(true); setEditingUser(null); setNewUser({ name: '', email: '', phone: '', role: 'user', department: 'general', password: '' }) }}
            className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]">
            <UserPlus className="h-5 w-5" />
            Add New User
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-100 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-100 blur-[100px]"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'blue' },
          { label: 'Active Now', value: users.filter(u => u.status === 'Active').length, color: 'emerald' },
          { label: 'Temp Access', value: users.filter(u => u.tempAccessGrants.length > 0).length, color: 'amber' },
          { label: 'Admins', value: users.filter(u => u.role === 'Admin' || u.role === 'Super Admin').length, color: 'purple' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 border border-${stat.color}-200`}>
                <Fingerprint className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email, or department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-black placeholder:text-gray-400 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-700 font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="all">All Roles</option>
            {roles.map(r => <option key={r} value={r} className="bg-white text-black">{r}</option>)}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl text-gray-700 font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="Active" className="bg-white text-black">Active</option>
            <option value="Inactive" className="bg-white text-black">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role & Dept</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Activity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 font-black text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-black font-black group-hover:text-blue-600 transition-colors">{user.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{user.role}</span>
                      <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {user.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                      <Clock className="h-3 w-3" />
                      {user.lastLogin}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="p-2.5 bg-gray-100 hover:bg-blue-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-2.5 bg-gray-100 border border-gray-200 rounded-xl transition-all ${
                          user.status === 'Active' ? 'hover:bg-red-100 text-gray-500 hover:text-red-600' : 'hover:bg-emerald-100 text-gray-500 hover:text-emerald-600'
                        }`}
                      >
                        {user.status === 'Active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => setShowTempAccessForm(user.id)}
                        className="p-2.5 bg-gray-100 hover:bg-amber-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-amber-600 relative"
                      >
                        <Clock className="h-4 w-4" />
                        {user.tempAccessGrants.length > 0 && <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2.5 bg-gray-100 hover:bg-red-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-black">{editingUser ? 'Edit User Profile' : 'Create New Account'}</h2>
                <p className="text-gray-600 text-sm font-medium mt-1">Configure identity and access permissions.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Al-Maktoum"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ahmed@silvermaid.ae"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +971 50 123 4567"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">System Role</label>
                  <select 
                    value={newUser.role} 
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    {roles.map(r => <option key={r} value={r.toLowerCase()} className="bg-white text-black">{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                  <select 
                    value={newUser.department} 
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    {departments.map(d => <option key={d} value={d.toLowerCase()} className="bg-white text-black">{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Security Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={editingUser ? "Leave blank to keep current" : "••••••••"} 
                      value={newUser.password} 
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all pr-12" 
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                {editingUser ? 'Update Profile' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp Access Form Modal */}
      {showTempAccessForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">Temporary Access</h2>
              <p className="text-gray-600 font-medium">Grant elevated permissions for a limited duration.</p>
            </div>
            <div className="px-8 pb-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="90" 
                  value={tempAccessDays} 
                  onChange={(e) => setTempAccessDays(parseInt(e.target.value))} 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" 
                />
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowTempAccessForm(null)}
                className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGrantTempAccess(showTempAccessForm)}
                className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-700 border border-amber-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
          <Shield className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black">Security Protocol Active</h3>
          <p className="text-gray-600 mt-2 leading-relaxed">
            All user account modifications are cryptographically signed and logged in the system audit trail. 
            Temporary access grants automatically expire at midnight on the final day. 
            Multi-factor authentication is enforced for all Admin and Super Admin roles.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
              <Fingerprint className="h-4 w-4" /> Biometric Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
