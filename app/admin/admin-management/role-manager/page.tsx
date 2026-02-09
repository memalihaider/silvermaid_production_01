// 'use client'

// import { useState, useMemo, useCallback, useEffect } from 'react'
// import { 
//   Plus, 
//   Edit2, 
//   Trash2, 
//   Copy, 
//   X, 
//   Search, 
//   Shield, 
//   Users, 
//   Lock, 
//   Zap, 
//   ShieldCheck,
//   ShieldAlert,
//   Fingerprint,
//   ArrowUpRight,
//   Activity,
//   Building2,
//   Clock,
//   Mail,
//   Eye,
//   EyeOff
// } from 'lucide-react'
// import { createUserWithRole, getUserRole, updateUserRole, deleteUserRole, UserRole } from '@/lib/auth'
// import { db, auth } from '@/lib/firebase'
// import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
// import { deleteUser } from 'firebase/auth'

// // Available pages for selection
// // Available pages for selection - Updated with ALL sidebar pages
// const ALL_PAGES = [
//   'Dashboard',
//   'Lead Dashboard', 
//   'Communications',
//   'Clients',
//   'Surveys',
//   'process Inquiry',
//   'Quotations',
//   'Inventory & Services',
//   'Jobs',
//   'Equipment & Permits',
//   'Job Profitability',
//   'Bookings',
//   'Employee Directory',
//   'Attendance',
//   'Leave Management',
//   'Payroll',
//   'Performance Dashboard',
//   'Feedback & Complaints',
//   'Meeting Calendar',
//   'Meeting Detail',
//   'Notes & Decisions',
//   'Follow-Up Tracker',
//   'Finance',
//   'Marketing',
//   'Role Manager',
//   'Permission Matrix',
//   'User Accounts',
//   'Audit Logs',
//   'AI Command Center',
//   'AI Recommendations',
//   'CMS',
//   'Settings'
// ]

// export default function RoleManager() {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [showForm, setShowForm] = useState(false)
//   const [editingUserId, setEditingUserId] = useState<string | null>(null)
//   const [userRoles, setUserRoles] = useState<UserRole[]>([])
  
//   const [newUser, setNewUser] = useState({
//     name: '',
//     email: '',
//     password: '',
//     roleName: '',
//     allowedPages: [] as string[]
//   })

//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)

//   // Fetch all users from Firebase
//   useEffect(() => {
//     fetchUserRoles()
//   }, [])

//   const fetchUserRoles = async () => {
//     try {
//       const usersRoleRef = collection(db, 'users-role')
//       const snapshot = await getDocs(usersRoleRef)
//       const roles: UserRole[] = []
      
//       snapshot.forEach(doc => {
//         const data = doc.data()
//         roles.push({
//           id: doc.id,
//           email: data.email || '',
//           name: data.name || '',
//           allowedPages: data.allowedPages || [],
//           createdAt: data.createdAt || '',
//           updatedAt: data.updatedAt || '',
//           roleName: data.roleName || ''
//         })
//       })
      
//       setUserRoles(roles)
//     } catch (error) {
//       console.error('Error fetching user roles:', error)
//     }
//   }

//   const filteredRoles = useMemo(() => {
//     return userRoles.filter(role => 
//       role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       role.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   }, [searchTerm, userRoles])

//   const handleAddUser = async () => {
//     if (!newUser.name || !newUser.email || !newUser.password || !newUser.roleName) {
//       alert('Please fill all required fields')
//       return
//     }

//     if (newUser.allowedPages.length === 0) {
//       alert('Please select at least one page access')
//       return
//     }

//     setLoading(true)
    
//     try {
//       const result = await createUserWithRole(
//         newUser.email,
//         newUser.password,
//         newUser.name,
//         newUser.allowedPages,
//         newUser.roleName
//       )

//       if (result.success) {
//         alert('User created successfully!')
//         setNewUser({
//           name: '',
//           email: '',
//           password: '',
//           roleName: '',
//           allowedPages: []
//         })
//         setShowForm(false)
//         fetchUserRoles() // Refresh list
//       } else {
//         alert(`Error creating user: ${result.error}`)
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       alert('Failed to create user')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEditUser = (userId: string) => {
//     const user = userRoles.find(r => r.id === userId)
//     if (user) {
//       setNewUser({
//         name: user.name,
//         email: user.email,
//         password: '', // Don't show password
//         roleName: user.roleName,
//         allowedPages: user.allowedPages
//       })
//       setEditingUserId(userId)
//       setShowForm(true)
//     }
//   }

//   const handleUpdateUser = async () => {
//     if (!editingUserId || !newUser.name || !newUser.roleName) {
//       alert('Please fill all required fields')
//       return
//     }

//     if (newUser.allowedPages.length === 0) {
//       alert('Please select at least one page access')
//       return
//     }

//     setLoading(true)
    
//     try {
//       const result = await updateUserRole(editingUserId, {
//         name: newUser.name,
//         roleName: newUser.roleName,
//         allowedPages: newUser.allowedPages,
//         updatedAt: new Date().toISOString()
//       })

//       if (result.success) {
//         alert('User updated successfully!')
//         setNewUser({
//           name: '',
//           email: '',
//           password: '',
//           roleName: '',
//           allowedPages: []
//         })
//         setEditingUserId(null)
//         setShowForm(false)
//         fetchUserRoles() // Refresh list
//       } else {
//         alert(`Error updating user: ${result.error}`)
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       alert('Failed to update user')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDeleteUser = async (userId: string) => {
//     if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
//       try {
//         // Delete from authentication
//         if (auth.currentUser) {
//           try {
//             await deleteUser(auth.currentUser)
//           } catch (error) {
//             console.log('Note: Cannot delete current logged in user from auth')
//           }
//         }
        
//         // Delete from users-role collection
//         await deleteDoc(doc(db, 'users-role', userId))
        
//         alert('User deleted successfully!')
//         fetchUserRoles() // Refresh list
//       } catch (error) {
//         console.error('Error deleting user:', error)
//         alert('Failed to delete user')
//       }
//     }
//   }

//   const togglePageAccess = (page: string) => {
//     if (newUser.allowedPages.includes(page)) {
//       setNewUser({
//         ...newUser,
//         allowedPages: newUser.allowedPages.filter(p => p !== page)
//       })
//     } else {
//       setNewUser({
//         ...newUser,
//         allowedPages: [...newUser.allowedPages, page]
//       })
//     }
//   }

//   const selectAllPages = () => {
//     setNewUser({
//       ...newUser,
//       allowedPages: ALL_PAGES
//     })
//   }

//   const clearAllPages = () => {
//     setNewUser({
//       ...newUser,
//       allowedPages: []
//     })
//   }

//   return (
//     <div className="space-y-8 pb-10 bg-white text-black">
//       {/* Header */}
//       <div className="relative overflow-hidden rounded-[32px] bg-white p-8 md:p-12 text-black shadow-2xl border border-gray-200">
//         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div>
//             <div className="flex items-center gap-3 mb-4">
//               <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
//                 <ShieldCheck className="h-5 w-5 text-blue-600" />
//               </div>
//               <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">User Management</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Create User Roles</h1>
//             <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl">
//               Create users with specific page access permissions for the admin portal.
//             </p>
//           </div>
//           <button 
//             onClick={() => { 
//               setShowForm(true); 
//               setEditingUserId(null); 
//               setNewUser({ 
//                 name: '', 
//                 email: '', 
//                 password: '', 
//                 roleName: '', 
//                 allowedPages: [] 
//               }) 
//             }}
//             className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
//             <Plus className="h-5 w-5" />
//             Create New User
//           </button>
//         </div>
        
//         {/* Decorative background elements */}
//         <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-50 blur-[100px]"></div>
//         <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-50 blur-[100px]"></div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {[
//           { label: 'Total Users', value: userRoles.length, color: 'blue', icon: Users },
//           { label: 'Active Pages', value: ALL_PAGES.length, color: 'emerald', icon: Shield },
//           { label: 'Custom Roles', value: userRoles.filter(r => r.roleName !== 'Admin').length, color: 'amber', icon: Zap },
//           { label: 'Admin Users', value: userRoles.filter(r => r.roleName === 'Admin').length, color: 'purple', icon: Lock }
//         ].map((stat, idx) => (
//           <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
//             <div className="flex items-center justify-between mb-4">
//               <div className={`p-2 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
//                 <stat.icon className="h-5 w-5" />
//               </div>
//               <ArrowUpRight className="h-4 w-4 text-gray-400" />
//             </div>
//             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
//             <p className="text-2xl font-black text-black mt-1">{stat.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Search */}
//       <div className="relative group">
//         <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
//         <input 
//           type="text" 
//           placeholder="Search users by name, email or role..." 
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-black placeholder:text-gray-500 transition-all"
//         />
//       </div>

//       {/* Users Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {filteredRoles.map((user) => (
//           <div key={user.id} className="group relative bg-white border border-gray-200 rounded-[32px] p-8 hover:bg-gray-50 transition-all overflow-hidden shadow-sm">
//             <div className="relative z-10">
//               <div className="flex items-start justify-between mb-6">
//                 <div className="flex items-center gap-4">
//                   <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600">
//                     <Users className="h-7 w-7" />
//                   </div>
//                   <div>
//                     <h3 className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors">{user.name}</h3>
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 border border-blue-200">
//                         {user.roleName}
//                       </span>
//                       <Mail className="h-4 w-4 text-gray-400" />
//                       <span className="text-sm text-gray-600">{user.email}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button 
//                     onClick={() => handleEditUser(user.id)}
//                     className="p-2.5 bg-gray-100 hover:bg-blue-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-blue-600"
//                   >
//                     <Edit2 className="h-4 w-4" />
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteUser(user.id)}
//                     className="p-2.5 bg-gray-100 hover:bg-red-100 border border-gray-200 rounded-xl transition-all text-gray-500 hover:text-red-600"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>

//               {/* Allowed Pages */}
//               <div className="mb-6">
//                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Allowed Pages</p>
//                 <div className="flex flex-wrap gap-2">
//                   {user.allowedPages.map((page, index) => (
//                     <span 
//                       key={index}
//                       className="px-3 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200"
//                     >
//                       {page}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-center justify-between pt-6 border-t border-gray-200">
//                 <div className="flex items-center gap-6">
//                   <div className="flex flex-col">
//                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Pages</span>
//                     <span className="text-lg font-black text-black">
//                       {user.allowedPages.length} of {ALL_PAGES.length}
//                     </span>
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Created</span>
//                     <span className="text-lg font-black text-black flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-gray-500" />
//                       {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-600">
//                   <Activity className="h-3 w-3" />
//                   <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add/Edit User Modal */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-white border border-gray-200 rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between p-8 border-b border-gray-200">
//               <div>
//                 <h2 className="text-2xl font-black text-black">
//                   {editingUserId ? 'Edit User Access' : 'Create New User'}
//                 </h2>
//                 <p className="text-gray-600 text-sm font-medium mt-1">
//                   {editingUserId ? 'Update user details and page access' : 'Create new user with specific page permissions'}
//                 </p>
//               </div>
//               <button onClick={() => {
//                 setShowForm(false)
//                 setEditingUserId(null)
//                 setNewUser({ name: '', email: '', password: '', roleName: '', allowedPages: [] })
//               }} className="p-2 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-gray-500">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
            
//             <div className="p-8 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Name Field */}
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
//                     Full Name *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Enter full name"
//                     value={newUser.name}
//                     onChange={(e) => setNewUser({...newUser, name: e.target.value})}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
//                   />
//                 </div>

//                 {/* Email Field (disabled in edit mode) */}
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     placeholder="user@example.com"
//                     value={newUser.email}
//                     onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                     disabled={!!editingUserId}
//                     className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
//                       editingUserId ? 'opacity-60 cursor-not-allowed' : ''
//                     }`}
//                   />
//                 </div>

//                 {/* Password Field (only for new users) */}
//                 {!editingUserId && (
//                   <div className="space-y-2">
//                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
//                       Password *
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Enter password"
//                         value={newUser.password}
//                         onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//                         className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all pr-12"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                       >
//                         {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Role Name Field */}
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
//                     Role Name *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="e.g., Manager, Supervisor, Analyst"
//                     value={newUser.roleName}
//                     onChange={(e) => setNewUser({...newUser, roleName: e.target.value})}
//                     className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Page Access Selection */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
//                     Select Pages Access *
//                   </label>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={selectAllPages}
//                       className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 transition-all"
//                     >
//                       Select All
//                     </button>
//                     <button
//                       type="button"
//                       onClick={clearAllPages}
//                       className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 transition-all"
//                     >
//                       Clear All
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                   {ALL_PAGES.map((page) => (
//                     <div key={page} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id={`page-${page}`}
//                         checked={newUser.allowedPages.includes(page)}
//                         onChange={() => togglePageAccess(page)}
//                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <label
//                         htmlFor={`page-${page}`}
//                         className={`ml-2 text-sm font-medium cursor-pointer transition-colors ${
//                           newUser.allowedPages.includes(page) 
//                             ? 'text-blue-600 font-bold' 
//                             : 'text-gray-600'
//                         }`}
//                       >
//                         {page}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
                
//                 <p className="text-xs text-gray-500">
//                   Selected {newUser.allowedPages.length} of {ALL_PAGES.length} pages
//                 </p>
//               </div>
//             </div>

//             <div className="p-8 bg-gray-50 border-t border-gray-200 flex gap-4">
//               <button
//                 onClick={() => {
//                   setShowForm(false)
//                   setEditingUserId(null)
//                   setNewUser({ name: '', email: '', password: '', roleName: '', allowedPages: [] })
//                 }}
//                 className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={editingUserId ? handleUpdateUser : handleAddUser}
//                 disabled={loading}
//                 className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Processing...' : editingUserId ? 'Update User' : 'Create User'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Security Info */}
     
//         <div>
          
       
//       </div>
//     </div>
//   )
// }

// new code
'use client'

import { useState, useMemo, useCallback, useEffect, Key } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  X, 
  Search, 
  Shield, 
  Users, 
  Lock, 
  Zap, 
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  ArrowUpRight,
  Activity,
  Building2,
  Clock,
  Mail,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react'
import { createUserWithRole, getUserRole, updateUserRole, deleteUserRole, UserRole } from '@/lib/auth'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'

// Available pages for selection - Updated with ALL sidebar pages
const ALL_PAGES = [
  'Dashboard',
  'Lead Dashboard', 
  'Communications',
  'Clients',
  'Surveys',
  'process Inquiry',
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
  'Settings'
]

// Interface for Job data
interface Job {
  id: string;
  title: string;
  client: string;
  status: string;
  assignedTo?: string[];
  clientId?: string;
}

export default function RoleManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [jobs, setJobs] = useState<Job[]>([]) // Jobs state
  const [loadingJobs, setLoadingJobs] = useState(false) // Jobs loading state
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roleName: '',
    allowedPages: [] as string[],
    allowedJobs: [] as string[] // New field for job access
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch all users from Firebase
  useEffect(() => {
    fetchUserRoles()
    fetchJobs() // Fetch jobs when component mounts
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
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          roleName: data.roleName || '',
          allowedJobs: data.allowedJobs || [] // Include allowedJobs
        })
      })
      
      setUserRoles(roles)
    } catch (error) {
      console.error('Error fetching user roles:', error)
    }
  }

  // Fetch jobs from Firebase
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const jobsRef = collection(db, 'jobs')
      const snapshot = await getDocs(jobsRef)
      const jobsList: Job[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        jobsList.push({
          id: doc.id,
          title: data.title || 'Untitled Job',
          client: data.client || 'Unknown Client',
          status: data.status || 'Unknown',
          assignedTo: data.assignedTo || [],
          clientId: data.clientId || ''
        })
      })
      
      setJobs(jobsList)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      alert('Failed to load jobs list')
    } finally {
      setLoadingJobs(false)
    }
  }

  const filteredRoles = useMemo(() => {
    return userRoles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, userRoles])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.roleName) {
      alert('Please fill all required fields')
      return
    }

    if (newUser.allowedPages.length === 0) {
      alert('Please select at least one page access')
      return
    }

    setLoading(true)
    
    try {
      const result = await createUserWithRole(
        newUser.email,
        newUser.password,
        newUser.name,
        newUser.allowedPages,
        newUser.roleName,
        newUser.allowedJobs // Pass allowed jobs
      )

      if (result.success) {
        alert('User created successfully!')
        setNewUser({
          name: '',
          email: '',
          password: '',
          roleName: '',
          allowedPages: [],
          allowedJobs: []
        })
        setShowForm(false)
        fetchUserRoles() // Refresh list
      } else {
        alert(`Error creating user: ${result.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
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
        password: '', // Don't show password
        roleName: user.roleName,
        allowedPages: user.allowedPages,
        allowedJobs: user.allowedJobs || [] // Set allowed jobs
      })
      setEditingUserId(userId)
      setShowForm(true)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUserId || !newUser.name || !newUser.roleName) {
      alert('Please fill all required fields')
      return
    }

    if (newUser.allowedPages.length === 0) {
      alert('Please select at least one page access')
      return
    }

    setLoading(true)
    
    try {
      const result = await updateUserRole(editingUserId, {
        name: newUser.name,
        roleName: newUser.roleName,
        allowedPages: newUser.allowedPages,
        allowedJobs: newUser.allowedJobs, // Update allowed jobs
        updatedAt: new Date().toISOString()
      })

      if (result.success) {
        alert('User updated successfully!')
        setNewUser({
          name: '',
          email: '',
          password: '',
          roleName: '',
          allowedPages: [],
          allowedJobs: []
        })
        setEditingUserId(null)
        setShowForm(false)
        fetchUserRoles() // Refresh list
      } else {
        alert(`Error updating user: ${result.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Delete from authentication
        if (auth.currentUser) {
          try {
            await deleteUser(auth.currentUser)
          } catch (error) {
            console.log('Note: Cannot delete current logged in user from auth')
          }
        }
        
        // Delete from users-role collection
        await deleteDoc(doc(db, 'users-role', userId))
        
        alert('User deleted successfully!')
        fetchUserRoles() // Refresh list
      } catch (error) {
        console.error('Error deleting user:', error)
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

  // Toggle job access
  const toggleJobAccess = (jobId: string) => {
    if (newUser.allowedJobs.includes(jobId)) {
      setNewUser({
        ...newUser,
        allowedJobs: newUser.allowedJobs.filter(id => id !== jobId)
      })
    } else {
      setNewUser({
        ...newUser,
        allowedJobs: [...newUser.allowedJobs, jobId]
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

  // Select all jobs
  const selectAllJobs = () => {
    const allJobIds = jobs.map(job => job.id)
    setNewUser({
      ...newUser,
      allowedJobs: allJobIds
    })
  }

  // Clear all jobs
  const clearAllJobs = () => {
    setNewUser({
      ...newUser,
      allowedJobs: []
    })
  }

  // Get job title by ID
  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    return job ? job.title : 'Unknown Job'
  }

  // Get job client by ID
  const getJobClient = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    return job ? job.client : 'Unknown Client'
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
              Create users with specific page access permissions for the admin portal.
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
                roleName: '', 
                allowedPages: [],
                allowedJobs: []
              }) 
            }}
            className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5" />
            Create New User
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-50 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-50 blur-[100px]"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: userRoles.length, color: 'blue', icon: Users },
          { label: 'Active Pages', value: ALL_PAGES.length, color: 'emerald', icon: Shield },
          { label: 'Custom Roles', value: userRoles.filter(r => r.roleName !== 'Admin').length, color: 'amber', icon: Zap },
          { label: 'Admin Users', value: userRoles.filter(r => r.roleName === 'Admin').length, color: 'purple', icon: Lock }
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
          placeholder="Search users by name, email or role..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-black placeholder:text-gray-500 transition-all"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.map((user) => (
          <div key={user.id} className="group relative bg-white border border-gray-200 rounded-[32px] p-8 hover:bg-gray-50 transition-all overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-black group-hover:text-blue-600 transition-colors">{user.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 border border-blue-200">
                        {user.roleName}
                      </span>
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.email}</span>
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

              {/* Allowed Pages */}
              <div className="mb-6">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Allowed Pages</p>
                <div className="flex flex-wrap gap-2">
                  {user.allowedPages.map((page, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>

              {/* Allowed Jobs (if any) */}
              {user.allowedJobs && user.allowedJobs.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Allowed Jobs</p>
                  <div className="flex flex-wrap gap-2">
                    {user.allowedJobs.map((jobId: string, index: Key | null | undefined) => {
                      const jobTitle = jobs.find(j => j.id === jobId)?.title || jobId;
                      return (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-purple-100 text-purple-600 text-xs font-bold rounded-lg border border-purple-200 flex items-center gap-1"
                        >
                          <Briefcase className="h-3 w-3" />
                          {jobTitle.length > 20 ? jobTitle.substring(0, 20) + '...' : jobTitle}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Pages</span>
                    <span className="text-lg font-black text-black">
                      {user.allowedPages.length} of {ALL_PAGES.length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Created</span>
                    <span className="text-lg font-black text-black flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
        ))}
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
                  {editingUserId ? 'Update user details and page access' : 'Create new user with specific page permissions'}
                </p>
              </div>
              <button onClick={() => {
                setShowForm(false)
                setEditingUserId(null)
                setNewUser({ 
                  name: '', 
                  email: '', 
                  password: '', 
                  roleName: '', 
                  allowedPages: [],
                  allowedJobs: []
                })
              }} className="p-2 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Email Field (disabled in edit mode) */}
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

                {/* Password Field (only for new users) */}
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

                {/* Role Name Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Manager, Supervisor, Analyst"
                    value={newUser.roleName}
                    onChange={(e) => setNewUser({...newUser, roleName: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Page Access Selection */}
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
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              {/* Job Access Selection - NEW SECTION */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Select Job Access (Optional)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllJobs}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-600 text-xs font-bold rounded-lg border border-purple-200 transition-all"
                    >
                      Select All Jobs
                    </button>
                    <button
                      type="button"
                      onClick={clearAllJobs}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 transition-all"
                    >
                      Clear All Jobs
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>Select jobs that this user can access. If no jobs are selected, user can access all jobs.</p>
                  <p className="text-xs mt-1 text-gray-500">
                    <strong>Note:</strong> User will only see selected jobs when logging in with this role.
                  </p>
                </div>
                
                {loadingJobs ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading jobs...</span>
                  </div>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-4">
                      {jobs.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No jobs found in database</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {jobs.map((job) => (
                            <div key={job.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                              <input
                                type="checkbox"
                                id={`job-${job.id}`}
                                checked={newUser.allowedJobs.includes(job.id)}
                                onChange={() => toggleJobAccess(job.id)}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <label
                                htmlFor={`job-${job.id}`}
                                className={`ml-3 text-sm font-medium cursor-pointer flex-1 ${
                                  newUser.allowedJobs.includes(job.id) 
                                    ? 'text-purple-600 font-bold' 
                                    : 'text-gray-600'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span>{job.title}</span>
                                  <span className="text-xs text-gray-500">
                                    Client: {job.client} | Status: {job.status}
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Selected {newUser.allowedJobs.length} of {jobs.length} jobs
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingUserId(null)
                  setNewUser({ 
                    name: '', 
                    email: '', 
                    password: '', 
                    roleName: '', 
                    allowedPages: [],
                    allowedJobs: []
                  })
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

      {/* Security Info */}
     
        <div>
          
       
      </div>
    </div>
  )
}