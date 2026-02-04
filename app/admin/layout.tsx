// 'use client'

// import { ReactNode, useState, useEffect } from 'react'
// import { usePathname, useRouter } from 'next/navigation'
// import Link from 'next/link'
// import {  
//   LayoutDashboard, 
//   Users, 
//   FileText, 
//   Briefcase, 
//   UserCircle, 
//   Calendar, 
//   Wallet, 
//   Settings as SettingsIcon,
//   Globe,
//   LogOut,
//   Bell,
//   Search,
//   Menu,
//   ChevronDown,
//   TrendingUp,
//   MessageSquare,
//   UserCheck,
//   Ruler,
//   Map,
//   DollarSign,
//   Eye,
//   CheckCircle,
//   Clock,
//   Archive,
//   BarChart3,
//   Zap,
//   Wrench,
//   Navigation,
//   AlertTriangle,
//   Zap as Zap2,
//   Star,
//   CreditCard,
//   AlertTriangle as AlertTriangleIcon,
//   BarChart3 as BarChartIcon,
//   Shield,
//   Lock,
//   Activity,
//   Brain,
//   Lightbulb,
//   Package,
//   X,
//   ExternalLink,
//   Sparkles
// } from 'lucide-react'

// type Notification = {
//   id: string
//   type: 'reminder' | 'alert' | 'info' | 'success'
//   title: string
//   message: string
//   time: string
//   read: boolean
//   link?: string
// }

// export default function AdminLayout({ children }: { children: ReactNode }) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const [isSigningOut, setIsSigningOut] = useState(false)
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [showNotifications, setShowNotifications] = useState(false)
//   const [notifications, setNotifications] = useState<Notification[]>([
//     {
//       id: 'n1',
//       type: 'reminder',
//       title: 'Equipment Maintenance Due',
//       message: 'High-Pressure Washer maintenance is due on 2025-01-15',
//       time: '5 min ago',
//       read: false,
//       link: '/admin/equipment-permits'
//     },
//     {
//       id: 'n2',
//       type: 'alert',
//       title: 'Permit Expiring Soon',
//       message: 'Safety Compliance Certificate expires in 3 days',
//       time: '1 hour ago',
//       read: false,
//       link: '/admin/equipment-permits'
//     },
//     {
//       id: 'n3',
//       type: 'info',
//       title: 'New Lead Added',
//       message: 'Hassan Al-Mazrouei added to hot leads',
//       time: '2 hours ago',
//       read: false,
//       link: '/admin/marketing'
//     },
//     {
//       id: 'n4',
//       type: 'success',
//       title: 'Campaign Update',
//       message: 'Holiday Special 2025 campaign reached 400 opens',
//       time: '3 hours ago',
//       read: true,
//       link: '/admin/marketing'
//     },
//     {
//       id: 'n5',
//       type: 'info',
//       title: 'Follow-up Scheduled',
//       message: 'Email scheduled for Ahmed Al-Mazrouei at 10:00 AM',
//       time: '4 hours ago',
//       read: true,
//       link: '/admin/marketing'
//     }
//   ])
//   const [crmOpen, setCrmOpen] = useState(pathname.startsWith('/admin/crm'))
//   const [surveysOpen, setSurveysOpen] = useState(pathname.startsWith('/admin/surveys'))
//   const [quotationsOpen, setQuotationsOpen] = useState(pathname.startsWith('/admin/quotations'))
//   const [hrOpen, setHrOpen] = useState(pathname.startsWith('/admin/hr'))
//   const [financeOpen, setFinanceOpen] = useState(pathname.startsWith('/admin/finance'))
//   const [meetingsOpen, setMeetingsOpen] = useState(pathname.startsWith('/admin/meetings'))
//   const [adminMgmtOpen, setAdminMgmtOpen] = useState(pathname.startsWith('/admin/admin-management'))
//   const [aiOpen, setAiOpen] = useState(pathname.startsWith('/admin/ai-command-center'))
//   const [productsOpen, setProductsOpen] = useState(pathname.startsWith('/admin/products'))

//   const handleSignOut = async () => {
//     setIsSigningOut(true)
    
//     try {
//       // Clear localStorage
//       localStorage.removeItem('homeware_admin_token')
//       localStorage.removeItem('homeware_admin_email')
//       localStorage.removeItem('homeware_admin_remember')
      
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 500))
      
//       // Redirect to login
//       router.push('/login')
//     } catch (err) {
//       console.error('Sign out failed:', err)
//       setIsSigningOut(false)
//     }
//   }

//   const handleMarkAsRead = (id: string) => {
//     setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
//   }

//   const handleMarkAllAsRead = () => {
//     setNotifications(notifications.map(n => ({ ...n, read: true })))
//   }

//   const handleDeleteNotification = (id: string) => {
//     setNotifications(notifications.filter(n => n.id !== id))
//   }

//   const unreadCount = notifications.filter(n => !n.read).length

//   const getNotificationIcon = (type: string) => {
//     switch(type) {
//       case 'reminder': return <Clock className="w-5 h-5" />
//       case 'alert': return <AlertTriangle className="w-5 h-5" />
//       case 'success': return <CheckCircle className="w-5 h-5" />
//       default: return <Bell className="w-5 h-5" />
//     }
//   }

//   const getNotificationColor = (type: string) => {
//     switch(type) {
//       case 'reminder': return 'bg-amber-100 text-amber-700'
//       case 'alert': return 'bg-red-100 text-red-700'
//       case 'success': return 'bg-green-100 text-green-700'
//       default: return 'bg-blue-100 text-blue-700'
//     }
//   }
  
//   const menuItems = [
//     { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
//     { 
//       icon: Users, 
//       label: 'CRM', 
//       href: '/admin/crm',
//       submenu: [
//         { label: 'Lead Dashboard', href: '/admin/crm', icon: Users },
//         { label: 'Communications', href: '/admin/crm/communications', icon: MessageSquare },
//         { label: 'Clients', href: '/admin/crm/clients', icon: UserCheck },
//       ]
//     },
//     { icon: Ruler, label: 'Surveys', href: '/admin/surveys' },
//     {
//       icon: FileText,
//       label: 'Quotations',
//       href: '/admin/quotations/complete',
//     },
//     {
//       icon: Wrench,
//       label: 'Inventory & Services',
//       href: '/admin/products',
//     },
//     { icon: Briefcase, label: 'Jobs', href: '/admin/jobs' },
//     { icon: Wrench, label: 'Equipment & Permits', href: '/admin/equipment-permits' },
//     { icon: TrendingUp, label: 'Job Profitability', href: '/admin/job-profitability' },
//     { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
//     {
//       icon: UserCircle,
//       label: 'HR Management',
//       href: '/admin/hr',
//       submenu: [
//         { label: 'Employee Directory', href: '/admin/hr/employee-directory', icon: Users },
//         { label: 'Attendance', href: '/admin/hr/attendance', icon: Clock },
//         { label: 'Leave Management', href: '/admin/hr/leave-management', icon: Calendar },
//         { label: 'Payroll', href: '/admin/hr/payroll', icon: DollarSign },
//         { label: 'Performance Dashboard', href: '/admin/hr/performance-dashboard', icon: BarChart3 },
//         { label: 'Feedback & Complaints', href: '/admin/employee-feedback', icon: MessageSquare },
//       ]
//     },
//     {
//       icon: Calendar,
//       label: 'Meetings',
//       href: '/admin/meetings',
//       submenu: [
//         { label: 'Meeting Calendar', href: '/admin/meetings/calendar', icon: Calendar },
//         { label: 'Meeting Detail', href: '/admin/meetings/detail', icon: FileText },
//         { label: 'Notes & Decisions', href: '/admin/meetings/notes-decisions', icon: FileText },
//         { label: 'Follow-Up Tracker', href: '/admin/meetings/follow-up-tracker', icon: CheckCircle },
//       ]
//     },
//     {
//       icon: Wallet,
//       label: 'Finance',
//       href: '/admin/finance',
//       submenu: [
//         { label: 'Dashboard', href: '/admin/finance', icon: DollarSign },
//       ]
//     },
//     { icon: TrendingUp, label: 'Marketing', href: '/admin/marketing' },
//     {
//       icon: Shield,
//       label: 'Admin Management',
//       href: '/admin/admin-management',
//       submenu: [
//         { label: 'Role Manager', href: '/admin/admin-management/role-manager', icon: UserCheck },
//         { label: 'Permission Matrix', href: '/admin/admin-management/permission-matrix', icon: Lock },
//         { label: 'User Accounts', href: '/admin/admin-management/user-accounts', icon: Users },
//         { label: 'Audit Logs', href: '/admin/admin-management/audit-logs', icon: Activity },
//       ]
//     },
//     {
//       icon: Brain,
//       label: 'AI Command Center',
//       href: '/admin/ai-command-center',
//       submenu: [
//         { label: 'AI Recommendations', href: '/admin/ai-command-center/recommendations', icon: Lightbulb },
//       ]
//     },
//     { icon: Globe, label: 'CMS', href: '/admin/cms' },
//     { icon: SettingsIcon, label: 'Settings', href: '/admin/settings' },
//   ]

//   return (
//     <div className="min-h-screen bg-background text-foreground flex">
//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 lg:hidden z-30"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar - Desktop Only */}
//       <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} border-r bg-card hidden lg:flex flex-col sticky top-0 h-screen shadow-sm overflow-hidden transition-all duration-300`}>
//         <div className={`p-4 border-b flex items-center ${!sidebarOpen && 'justify-center'} ${sidebarOpen && 'justify-between'}`}>
//           {sidebarOpen && (
//             <>
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
//                   H
//                 </div>
//                 <div>
//                   <span className="font-black text-lg tracking-tighter block leading-none">HOMEWARE</span>
//                   <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">Hygiene ERP</span>
//                 </div>
//               </div>
//             </>
//           )}
//           {!sidebarOpen && (
//             <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
//               H
//             </div>
//           )}
//         </div>
        
//         <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
//           {sidebarOpen && <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Main Menu</p>}
//           {menuItems.map((item) => {
//             const isActive = pathname === item.href
//             const hasSubmenu = 'submenu' in item
//             const isSubmenuActive = hasSubmenu && pathname.startsWith(item.href)
//             const isCrmItem = item.label === 'CRM'
//             const isSurveysItem = item.label === 'Surveys'
//             const isQuotationsItem = item.label === 'Quotations'
//             const isHrItem = item.label === 'HR Management'
//             const isFinanceItem = item.label === 'Finance'
//             const isMeetingsItem = item.label === 'Meetings'
//             const isAdminMgmtItem = item.label === 'Admin Management'
//             const isAiItem = item.label === 'AI Command Center'
            
//             return (
//               <div key={item.label}>
//                 {hasSubmenu ? (
//                   <>
//                     <button
//                       onClick={() => {
//                         if (isCrmItem) setCrmOpen(!crmOpen)
//                         if (isSurveysItem) setSurveysOpen(!surveysOpen)
//                         if (isQuotationsItem) setQuotationsOpen(!quotationsOpen)
//                         if (isHrItem) setHrOpen(!hrOpen)
//                         if (isFinanceItem) setFinanceOpen(!financeOpen)
//                         if (isMeetingsItem) setMeetingsOpen(!meetingsOpen)
//                         if (isAdminMgmtItem) setAdminMgmtOpen(!adminMgmtOpen)
//                         if (isAiItem) setAiOpen(!aiOpen)
//                         if (item.label === 'Product Management') setProductsOpen(!productsOpen)
//                       }}
//                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
//                         isSubmenuActive 
//                           ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
//                           : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                       } ${!sidebarOpen && 'justify-center'}`}
//                       title={!sidebarOpen ? item.label : undefined}
//                     >
//                       <item.icon className={`h-5 w-5 transition-colors shrink-0 ${
//                         isSubmenuActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
//                       }`} />
//                       {sidebarOpen && (
//                         <>
//                           <span className="flex-1 text-left">{item.label}</span>
//                           <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${
//                             (isCrmItem && crmOpen) || (isSurveysItem && surveysOpen) || (isQuotationsItem && quotationsOpen) || (isHrItem && hrOpen) || (isFinanceItem && financeOpen) || (isMeetingsItem && meetingsOpen) || (isAdminMgmtItem && adminMgmtOpen) || (isAiItem && aiOpen) || (item.label === 'Product Management' && productsOpen) ? 'rotate-180' : ''
//                           }`} />
//                         </>
//                       )}
//                     </button>
//                     {sidebarOpen && (((isCrmItem && crmOpen) || (isSurveysItem && surveysOpen) || (isQuotationsItem && quotationsOpen) || (isHrItem && hrOpen) || (isFinanceItem && financeOpen) || (isMeetingsItem && meetingsOpen) || (isAdminMgmtItem && adminMgmtOpen) || (isAiItem && aiOpen) || (item.label === 'Product Management' && productsOpen)) && (
//                       <div className="ml-2 mt-1 space-y-1 border-l-2 border-muted pl-2">
//                         {('submenu' in item && item.submenu) && item.submenu.map((subitem: any) => {
//                           const isSubActive = pathname === subitem.href
//                           return (
//                             <Link
//                               key={subitem.label}
//                               href={subitem.href}
//                               className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group ${
//                                 isSubActive 
//                                   ? 'bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300' 
//                                   : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                               }`}
//                             >
//                               <subitem.icon className={`h-4 w-4 ${
//                                 isSubActive ? 'text-pink-600' : 'text-muted-foreground group-hover:text-pink-600'
//                               }`} />
//                               <span className="flex-1">{subitem.label}</span>
//                               {subitem.badge && (
//                                 <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">
//                                   {subitem.badge}
//                                 </span>
//                               )}
//                             </Link>
//                           )
//                         })}
//                       </div>
//                     ))}
//                   </>
//                 ) : (
//                   <Link
//                     href={item.href}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
//                       isActive 
//                         ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
//                         : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                     } ${!sidebarOpen && 'justify-center'}`}
//                     title={!sidebarOpen ? item.label : undefined}
//                   >
//                     <item.icon className={`h-5 w-5 transition-colors shrink-0 ${
//                       isActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
//                     }`} />
//                     {sidebarOpen && (
//                       <>
//                         <span className="flex-1 text-left">{item.label}</span>
//                         {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
//                       </>
//                     )}
//                   </Link>
//                 )}
//               </div>
//             )
//           })}
//         </nav>

//         <div className="p-4 border-t space-y-4">
//           {sidebarOpen && (
//             <div className="bg-muted/50 rounded-2xl p-4">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 shrink-0">
//                   AD
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-bold truncate">Admin User</p>
//                   <p className="text-xs text-muted-foreground truncate">admin@homeware.ae</p>
//                 </div>
//               </div>
//               <button 
//                 onClick={handleSignOut}
//                 disabled={isSigningOut}
//                 className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-100 dark:border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <LogOut className="h-3.5 w-3.5" />
//                 {isSigningOut ? 'Signing Out...' : 'Sign Out'}
//               </button>
//             </div>
//           )}
//         </div>
//       </aside>

//       {/* Mobile Sidebar - Slide-out menu */}
//       {sidebarOpen && (
//         <div className="fixed top-20 left-0 w-64 h-screen bg-card border-r border-slate-200 z-40 overflow-y-auto lg:hidden">
//           <div className="p-4 space-y-1.5">
//             <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Main Menu</p>
//             {menuItems.map((item) => {
//               const isActive = pathname === item.href
//               const hasSubmenu = 'submenu' in item
//               const isSubmenuActive = hasSubmenu && pathname.startsWith(item.href)
//               const isCrmItem = item.label === 'CRM'
//               const isSurveysItem = item.label === 'Surveys'
//               const isQuotationsItem = item.label === 'Quotations'
//               const isHrItem = item.label === 'HR Management'
//               const isFinanceItem = item.label === 'Finance'
//               const isMeetingsItem = item.label === 'Meetings'
//               const isAdminMgmtItem = item.label === 'Admin Management'
//               const isAiItem = item.label === 'AI Command Center'
              
//               return (
//                 <div key={item.label}>
//                   {hasSubmenu ? (
//                     <>
//                       <button
//                         onClick={() => {
//                           if (isCrmItem) setCrmOpen(!crmOpen)
//                           if (isSurveysItem) setSurveysOpen(!surveysOpen)
//                           if (isQuotationsItem) setQuotationsOpen(!quotationsOpen)
//                           if (isHrItem) setHrOpen(!hrOpen)
//                           if (isFinanceItem) setFinanceOpen(!financeOpen)
//                           if (isMeetingsItem) setMeetingsOpen(!meetingsOpen)
//                           if (isAdminMgmtItem) setAdminMgmtOpen(!adminMgmtOpen)
//                           if (isAiItem) setAiOpen(!aiOpen)
//                           if (item.label === 'Product Management') setProductsOpen(!productsOpen)
//                         }}
//                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
//                           isSubmenuActive 
//                             ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
//                             : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                         }`}
//                       >
//                         <item.icon className={`h-5 w-5 transition-colors shrink-0 ${
//                           isSubmenuActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
//                         }`} />
//                         <span className="flex-1 text-left">{item.label}</span>
//                         <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${
//                           (isCrmItem && crmOpen) || (isSurveysItem && surveysOpen) || (isQuotationsItem && quotationsOpen) || (isHrItem && hrOpen) || (isFinanceItem && financeOpen) || (isMeetingsItem && meetingsOpen) || (isAdminMgmtItem && adminMgmtOpen) || (isAiItem && aiOpen) || (item.label === 'Product Management' && productsOpen) ? 'rotate-180' : ''
//                         }`} />
//                       </button>
//                       {((isCrmItem && crmOpen) || (isSurveysItem && surveysOpen) || (isQuotationsItem && quotationsOpen) || (isHrItem && hrOpen) || (isFinanceItem && financeOpen) || (isMeetingsItem && meetingsOpen) || (isAdminMgmtItem && adminMgmtOpen) || (isAiItem && aiOpen) || (item.label === 'Product Management' && productsOpen)) && (
//                         <div className="ml-2 mt-1 space-y-1 border-l-2 border-muted pl-2">
//                           {('submenu' in item && item.submenu) && item.submenu.map((subitem: any) => {
//                             const isSubActive = pathname === subitem.href
//                             return (
//                               <Link
//                                 key={subitem.label}
//                                 href={subitem.href}
//                                 onClick={() => setSidebarOpen(false)}
//                                 className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group ${
//                                   isSubActive 
//                                     ? 'bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300' 
//                                     : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                                 }`}
//                               >
//                                 <subitem.icon className={`h-4 w-4 ${
//                                   isSubActive ? 'text-pink-600' : 'text-muted-foreground group-hover:text-pink-600'
//                                 }`} />
//                                 <span className="flex-1">{subitem.label}</span>
//                               </Link>
//                             )
//                           })}
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <Link
//                       href={item.href}
//                       onClick={() => setSidebarOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
//                         isActive 
//                           ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
//                           : 'text-muted-foreground hover:bg-accent hover:text-foreground'
//                       }`}
//                     >
//                       <item.icon className={`h-5 w-5 transition-colors shrink-0 ${
//                         isActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
//                       }`} />
//                       <span className="flex-1 text-left">{item.label}</span>
//                     </Link>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="h-20 border-b bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
//           <div className="flex items-center gap-6 flex-1">
//             <button 
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="hidden lg:flex p-2 hover:bg-accent rounded-lg transition-colors"
//               title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
//             >
//               {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-accent rounded-lg">
//               <Menu className="h-6 w-6" />
//             </button>
//             <div className="relative max-w-md w-full hidden md:block">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <input 
//                 type="text" 
//                 placeholder="Search anything..." 
//                 className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//               />
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={() => setShowNotifications(!showNotifications)}
//               className="p-2.5 rounded-xl hover:bg-accent relative transition-colors group"
//             >
//               <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
//               {unreadCount > 0 && (
//                 <span className="absolute top-2 right-2 h-5 w-5 bg-red-600 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-black text-white">
//                   {unreadCount}
//                 </span>
//               )}
//             </button>
//           </div>

//           {/* Notification Panel */}
//           {showNotifications && (
//             <>
//               <div 
//                 className="fixed inset-0 z-40" 
//                 onClick={() => setShowNotifications(false)}
//               />
//               <div className="absolute right-8 top-20 w-96 bg-card border rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
//                 <div className="p-4 border-b flex items-center justify-between bg-muted/50">
//                   <div>
//                     <h3 className="font-black text-foreground">Notifications</h3>
//                     <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
//                   </div>
//                   <div className="flex gap-2">
//                     {unreadCount > 0 && (
//                       <button 
//                         onClick={handleMarkAllAsRead}
//                         className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1 bg-blue-50 rounded-lg"
//                       >
//                         Mark all read
//                       </button>
//                     )}
//                     <button 
//                       onClick={() => setShowNotifications(false)}
//                       className="p-1 hover:bg-accent rounded-lg"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="overflow-y-auto flex-1">
//                   {notifications.length === 0 ? (
//                     <div className="p-12 text-center">
//                       <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
//                       <p className="text-muted-foreground font-medium">No notifications</p>
//                       <p className="text-muted-foreground text-sm mt-1">You're all caught up!</p>
//                     </div>
//                   ) : (
//                     <div className="divide-y">
//                       {notifications.map((notification) => (
//                         <div 
//                           key={notification.id}
//                           className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
//                         >
//                           <div className="flex items-start gap-3">
//                             <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
//                               {getNotificationIcon(notification.type)}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <div className="flex items-start justify-between gap-2 mb-1">
//                                 <h4 className="font-bold text-sm text-foreground">{notification.title}</h4>
//                                 {!notification.read && (
//                                   <span className="h-2 w-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
//                                 )}
//                               </div>
//                               <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
//                               <div className="flex items-center justify-between">
//                                 <span className="text-xs text-muted-foreground">{notification.time}</span>
//                                 <div className="flex gap-2">
//                                   {notification.link && (
//                                     <Link
//                                       href={notification.link}
//                                       onClick={() => {
//                                         handleMarkAsRead(notification.id)
//                                         setShowNotifications(false)
//                                       }}
//                                       className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
//                                     >
//                                       View <ExternalLink className="w-3 h-3" />
//                                     </Link>
//                                   )}
//                                   {!notification.read && (
//                                     <button
//                                       onClick={() => handleMarkAsRead(notification.id)}
//                                       className="text-xs font-bold text-gray-600 hover:text-gray-700"
//                                     >
//                                       Mark read
//                                     </button>
//                                   )}
//                                   <button
//                                     onClick={() => handleDeleteNotification(notification.id)}
//                                     className="text-xs font-bold text-red-600 hover:text-red-700"
//                                   >
//                                     Delete
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-3 border-t bg-muted/50">
//                   <button 
//                     onClick={() => {
//                       setShowNotifications(false)
//                       router.push('/admin/equipment-permits')
//                     }}
//                     className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 py-2"
//                   >
//                     View All Notifications
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </header>

//         <main className="flex-1 p-8 overflow-y-auto bg-muted/20">
//           <div className="w-full">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// new codee
'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {  
  LayoutDashboard, 
  Users, 
  FileText, 
  Briefcase, 
  UserCircle, 
  Calendar, 
  Wallet, 
  Settings as SettingsIcon,
  Globe,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronDown,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Ruler,
  Map,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  Archive,
  BarChart3,
  Zap,
  Wrench,
  Navigation,
  AlertTriangle,
  Zap as Zap2,
  Star,
  CreditCard,
  AlertTriangle as AlertTriangleIcon,
  BarChart3 as BarChartIcon,
  Shield,
  Lock,
  Activity,
  Brain,
  Lightbulb,
  Package,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { getSession, logout } from '@/lib/auth'

type Notification = {
  id: string
  type: 'reminder' | 'alert' | 'info' | 'success'
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

// Define all possible pages with their labels and icons
const ALL_PAGES_CONFIG = {
  'Dashboard': { icon: LayoutDashboard, href: '/admin/dashboard' },
  'CRM': { icon: Users, href: '/admin/crm' },
  'Lead Dashboard': { icon: Users, href: '/admin/crm' },
  'Communications': { icon: MessageSquare, href: '/admin/crm/communications' },
  'Clients': { icon: UserCheck, href: '/admin/crm/clients' },
  'Surveys': { icon: Ruler, href: '/admin/surveys' },
  'Quotations': { icon: FileText, href: '/admin/quotations/complete' },
  'Inventory & Services': { icon: Wrench, href: '/admin/products' },
  'Jobs': { icon: Briefcase, href: '/admin/jobs' },
  'Equipment & Permits': { icon: Wrench, href: '/admin/equipment-permits' },
  'Job Profitability': { icon: TrendingUp, href: '/admin/job-profitability' },
  'Bookings': { icon: Calendar, href: '/admin/bookings' },
  'HR Management': { icon: UserCircle, href: '/admin/hr' },
  'Employee Directory': { icon: Users, href: '/admin/hr/employee-directory' },
  'Attendance': { icon: Clock, href: '/admin/hr/attendance' },
  'Leave Management': { icon: Calendar, href: '/admin/hr/leave-management' },
  'Payroll': { icon: DollarSign, href: '/admin/hr/payroll' },
  'Performance Dashboard': { icon: BarChart3, href: '/admin/hr/performance-dashboard' },
  'Feedback & Complaints': { icon: MessageSquare, href: '/admin/employee-feedback' },
  'Meetings': { icon: Calendar, href: '/admin/meetings' },
  'Meeting Calendar': { icon: Calendar, href: '/admin/meetings/calendar' },
  'Meeting Detail': { icon: FileText, href: '/admin/meetings/detail' },
  'Notes & Decisions': { icon: FileText, href: '/admin/meetings/notes-decisions' },
  'Follow-Up Tracker': { icon: CheckCircle, href: '/admin/meetings/follow-up-tracker' },
  'Finance': { icon: Wallet, href: '/admin/finance' },
  'Marketing': { icon: TrendingUp, href: '/admin/marketing' },
  'Admin Management': { icon: Shield, href: '/admin/admin-management' },
  'Role Manager': { icon: UserCheck, href: '/admin/admin-management/role-manager' },
  'Permission Matrix': { icon: Lock, href: '/admin/admin-management/permission-matrix' },
  'User Accounts': { icon: Users, href: '/admin/admin-management/user-accounts' },
  'Audit Logs': { icon: Activity, href: '/admin/admin-management/audit-logs' },
  'AI Command Center': { icon: Brain, href: '/admin/ai-command-center' },
  'AI Recommendations': { icon: Lightbulb, href: '/admin/ai-command-center/recommendations' },
  'CMS': { icon: Globe, href: '/admin/cms' },
  'Settings': { icon: SettingsIcon, href: '/admin/settings' }
}

// Define menu structure with parent-child relationships
const MENU_STRUCTURE = [
  { 
    type: 'single',
    label: 'Dashboard',
    key: 'Dashboard'
  },
  { 
    type: 'group',
    label: 'CRM',
    key: 'CRM',
    submenu: [
      { label: 'Lead Dashboard', key: 'Lead Dashboard' },
      { label: 'Communications', key: 'Communications' },
      { label: 'Clients', key: 'Clients' }
    ]
  },
  { 
    type: 'single',
    label: 'Surveys',
    key: 'Surveys'
  },
  { 
    type: 'single',
    label: 'Quotations',
    key: 'Quotations'
  },
  { 
    type: 'single',
    label: 'Inventory & Services',
    key: 'Inventory & Services'
  },
  { 
    type: 'single',
    label: 'Jobs',
    key: 'Jobs'
  },
  { 
    type: 'single',
    label: 'Equipment & Permits',
    key: 'Equipment & Permits'
  },
  { 
    type: 'single',
    label: 'Job Profitability',
    key: 'Job Profitability'
  },
  { 
    type: 'single',
    label: 'Bookings',
    key: 'Bookings'
  },
  { 
    type: 'group',
    label: 'HR Management',
    key: 'HR Management',
    submenu: [
      { label: 'Employee Directory', key: 'Employee Directory' },
      { label: 'Attendance', key: 'Attendance' },
      { label: 'Leave Management', key: 'Leave Management' },
      { label: 'Payroll', key: 'Payroll' },
      { label: 'Performance Dashboard', key: 'Performance Dashboard' },
      { label: 'Feedback & Complaints', key: 'Feedback & Complaints' }
    ]
  },
  { 
    type: 'group',
    label: 'Meetings',
    key: 'Meetings',
    submenu: [
      { label: 'Meeting Calendar', key: 'Meeting Calendar' },
      { label: 'Meeting Detail', key: 'Meeting Detail' },
      { label: 'Notes & Decisions', key: 'Notes & Decisions' },
      { label: 'Follow-Up Tracker', key: 'Follow-Up Tracker' }
    ]
  },
  { 
    type: 'single',
    label: 'Finance',
    key: 'Finance'
  },
  { 
    type: 'single',
    label: 'Marketing',
    key: 'Marketing'
  },
  { 
    type: 'group',
    label: 'Admin Management',
    key: 'Admin Management',
    submenu: [
      { label: 'Role Manager', key: 'Role Manager' },
      { label: 'Permission Matrix', key: 'Permission Matrix' },
     
      { label: 'Audit Logs', key: 'Audit Logs' }
    ]
  },
  { 
    type: 'single',
    label: 'AI Command Center',
    key: 'AI Command Center'
  },
  { 
    type: 'single',
    label: 'CMS',
    key: 'CMS'
  },
  { 
    type: 'single',
    label: 'Settings',
    key: 'Settings'
  }
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'reminder',
      title: 'Equipment Maintenance Due',
      message: 'High-Pressure Washer maintenance is due on 2025-01-15',
      time: '5 min ago',
      read: false,
      link: '/admin/equipment-permits'
    },
    {
      id: 'n2',
      type: 'alert',
      title: 'Permit Expiring Soon',
      message: 'Safety Compliance Certificate expires in 3 days',
      time: '1 hour ago',
      read: false,
      link: '/admin/equipment-permits'
    }
  ])
  
  // State for open submenus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  
  // User session state
  const [userSession, setUserSession] = useState<{
    name: string;
    email: string;
    allowedPages: string[];
    roleName: string;
  } | null>(null)

  // Initialize on mount
  useEffect(() => {
    const session = getSession()
    if (session) {
      setUserSession({
        name: session.user.name || 'User',
        email: session.user.email || '',
        allowedPages: session.allowedPages || [],
        roleName: session.roleName || 'User'
      })
      
      // Set initially open menus based on current path
      const currentMenu = MENU_STRUCTURE.find(menu => 
        menu.type === 'group' && 
        menu.submenu?.some(sub => 
          ALL_PAGES_CONFIG[sub.key as keyof typeof ALL_PAGES_CONFIG]?.href === pathname
        )
      )
      if (currentMenu) {
        setOpenMenus(prev => ({ ...prev, [currentMenu.key]: true }))
      }
    } else {
      // No session found, redirect to login
      router.push('/login')
    }
  }, [router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
      setIsSigningOut(false)
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'reminder': return <Clock className="w-5 h-5" />
      case 'alert': return <AlertTriangle className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'reminder': return 'bg-amber-100 text-amber-700'
      case 'alert': return 'bg-red-100 text-red-700'
      case 'success': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  // Filter menu items based on user's allowed pages
  const getFilteredMenuItems = () => {
    if (!userSession) return []
    
    return MENU_STRUCTURE.filter(menuItem => {
      if (menuItem.type === 'single') {
        // Check if user has access to this page
        return userSession.allowedPages.includes(menuItem.key)
      } else if (menuItem.type === 'group') {
        // Check if user has access to any submenu item
        const hasAccessToAnySubmenu = menuItem.submenu?.some(sub => 
          userSession.allowedPages.includes(sub.key)
        )
        return hasAccessToAnySubmenu
      }
      return false
    })
  }

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }))
  }

  // Get filtered menu items
  const filteredMenuItems = getFilteredMenuItems()

  // If no user session or no allowed pages, show minimal sidebar
  if (!userSession) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Only */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} border-r bg-card hidden lg:flex flex-col sticky top-0 h-screen shadow-sm overflow-hidden transition-all duration-300`}>
        <div className={`p-4 border-b flex items-center ${!sidebarOpen && 'justify-center'} ${sidebarOpen && 'justify-between'}`}>
          {sidebarOpen && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
                  H
                </div>
                <div>
                  <span className="font-black text-lg tracking-tighter block leading-none">HOMEWARE</span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">Hygiene ERP</span>
                </div>
              </div>
            </>
          )}
          {!sidebarOpen && (
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
              H
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarOpen && <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Main Menu</p>}
          
          {filteredMenuItems.map((menuItem) => {
            const pageConfig = ALL_PAGES_CONFIG[menuItem.key as keyof typeof ALL_PAGES_CONFIG]
            const isActive = pathname === pageConfig?.href
            const isGroup = menuItem.type === 'group'
            const isOpen = openMenus[menuItem.key] || false
            
            // For groups, check if any submenu item is active
            const isGroupActive = isGroup && menuItem.submenu?.some(sub => {
              const subConfig = ALL_PAGES_CONFIG[sub.key as keyof typeof ALL_PAGES_CONFIG]
              return pathname === subConfig?.href
            })
            
            const IconComponent = pageConfig?.icon

            return (
              <div key={menuItem.key}>
                {isGroup ? (
                  <>
                    <button
                      onClick={() => toggleMenu(menuItem.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                        isGroupActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      } ${!sidebarOpen && 'justify-center'}`}
                      title={!sidebarOpen ? menuItem.label : undefined}
                    >
                      {IconComponent && (
                        <IconComponent className={`h-5 w-5 transition-colors shrink-0 ${
                          isGroupActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
                        }`} />
                      )}
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{menuItem.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`} />
                        </>
                      )}
                    </button>
                    
                    {sidebarOpen && isOpen && menuItem.submenu && (
                      <div className="ml-2 mt-1 space-y-1 border-l-2 border-muted pl-2">
                        {menuItem.submenu
                          .filter(sub => userSession.allowedPages.includes(sub.key)) // Filter based on user access
                          .map((sub) => {
                            const subConfig = ALL_PAGES_CONFIG[sub.key as keyof typeof ALL_PAGES_CONFIG]
                            const isSubActive = pathname === subConfig?.href
                            const SubIcon = subConfig?.icon
                            
                            return (
                              <Link
                                key={sub.key}
                                href={subConfig?.href || '#'}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                                  isSubActive 
                                    ? 'bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300' 
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                              >
                                {SubIcon && (
                                  <SubIcon className={`h-4 w-4 ${
                                    isSubActive ? 'text-pink-600' : 'text-muted-foreground group-hover:text-pink-600'
                                  }`} />
                                )}
                                <span className="flex-1">{sub.label}</span>
                              </Link>
                            )
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={pageConfig?.href || '#'}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    } ${!sidebarOpen && 'justify-center'}`}
                    title={!sidebarOpen ? menuItem.label : undefined}
                  >
                    {IconComponent && (
                      <IconComponent className={`h-5 w-5 transition-colors shrink-0 ${
                        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
                      }`} />
                    )}
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{menuItem.label}</span>
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
                      </>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t space-y-4">
          {sidebarOpen && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 shrink-0">
                  {userSession.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{userSession.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userSession.email}</p>
                  <p className="text-xs text-blue-600 font-bold truncate mt-1">{userSession.roleName}</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-100 dark:border-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-3.5 w-3.5" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar - Slide-out menu */}
      {sidebarOpen && (
        <div className="fixed top-20 left-0 w-64 h-screen bg-card border-r border-slate-200 z-40 overflow-y-auto lg:hidden">
          <div className="p-4 space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Main Menu</p>
            {filteredMenuItems.map((menuItem) => {
              const pageConfig = ALL_PAGES_CONFIG[menuItem.key as keyof typeof ALL_PAGES_CONFIG]
              const isActive = pathname === pageConfig?.href
              const isGroup = menuItem.type === 'group'
              const isOpen = openMenus[menuItem.key] || false
              const isGroupActive = isGroup && menuItem.submenu?.some(sub => {
                const subConfig = ALL_PAGES_CONFIG[sub.key as keyof typeof ALL_PAGES_CONFIG]
                return pathname === subConfig?.href
              })
              
              const IconComponent = pageConfig?.icon

              return (
                <div key={menuItem.key}>
                  {isGroup ? (
                    <>
                      <button
                        onClick={() => toggleMenu(menuItem.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                          isGroupActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent className={`h-5 w-5 transition-colors shrink-0 ${
                            isGroupActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
                          }`} />
                        )}
                        <span className="flex-1 text-left">{menuItem.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {isOpen && menuItem.submenu && (
                        <div className="ml-2 mt-1 space-y-1 border-l-2 border-muted pl-2">
                          {menuItem.submenu
                            .filter(sub => userSession.allowedPages.includes(sub.key))
                            .map((sub) => {
                              const subConfig = ALL_PAGES_CONFIG[sub.key as keyof typeof ALL_PAGES_CONFIG]
                              const isSubActive = pathname === subConfig?.href
                              const SubIcon = subConfig?.icon
                              
                              return (
                                <Link
                                  key={sub.key}
                                  href={subConfig?.href || '#'}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                                    isSubActive 
                                      ? 'bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300' 
                                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                  }`}
                                >
                                  {SubIcon && (
                                    <SubIcon className={`h-4 w-4 ${
                                      isSubActive ? 'text-pink-600' : 'text-muted-foreground group-hover:text-pink-600'
                                    }`} />
                                  )}
                                  <span className="flex-1">{sub.label}</span>
                                </Link>
                              )
                            })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={pageConfig?.href || '#'}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {IconComponent && (
                        <IconComponent className={`h-5 w-5 transition-colors shrink-0 ${
                          isActive ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600'
                        }`} />
                      )}
                      <span className="flex-1 text-left">{menuItem.label}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-6 flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-accent rounded-lg transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-accent rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-muted-foreground">
              Logged in as: <span className="font-bold text-blue-600">{userSession.name}</span>
            </div>
            
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl hover:bg-accent relative transition-colors group"
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-5 w-5 bg-red-600 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification Panel */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-8 top-20 w-96 bg-card border rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between bg-muted/50">
                  <div>
                    <h3 className="font-black text-foreground">Notifications</h3>
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1 bg-blue-50 rounded-lg"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-accent rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">No notifications</p>
                      <p className="text-muted-foreground text-sm mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-sm text-foreground">{notification.title}</h4>
                                {!notification.read && (
                                  <span className="h-2 w-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{notification.time}</span>
                                <div className="flex gap-2">
                                  {notification.link && (
                                    <Link
                                      href={notification.link}
                                      onClick={() => {
                                        handleMarkAsRead(notification.id)
                                        setShowNotifications(false)
                                      }}
                                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      View <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  )}
                                  {!notification.read && (
                                    <button
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-xs font-bold text-gray-600 hover:text-gray-700"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-xs font-bold text-red-600 hover:text-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t bg-muted/50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false)
                      router.push('/admin/equipment-permits')
                    }}
                    className="w-full text-sm font-bold text-blue-600 hover:text-blue-700 py-2"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-muted/20">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}