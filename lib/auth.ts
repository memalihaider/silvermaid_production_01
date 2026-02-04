// // Authentication & Portal System
// // Centralized auth library for all portals

// // Portal Types
// export type PortalType = 'admin' | 'manager' | 'supervisor' | 'employee' | 'client' | 'guest'

// // Role Levels (hierarchical)
// export type RoleLevel = 'super' | 'admin' | 'manager' | 'supervisor' | 'user' | 'guest' | 'client'

// // Permission Categories
// export type PermissionCategory = 
//   | 'user_management'
//   | 'role_management'
//   | 'hr_management'
//   | 'finance_management'
//   | 'job_management'
//   | 'client_management'
//   | 'reporting'
//   | 'system_settings'
//   | 'approvals'
//   | 'self_service'
//   | 'view_only'

// // Portal Configuration
// export interface PortalConfig {
//   id: PortalType
//   name: string
//   description: string
//   icon: string
//   color: string
//   gradient: string
//   iconBg: string
//   textColor: string
//   href: string
//   dashboardPath: string
//   allowedRoles: RoleLevel[]
//   modules: PortalModule[]
// }

// // Portal Module
// export interface PortalModule {
//   id: string
//   name: string
//   description: string
//   icon: string
//   path: string
//   permissions: string[]
//   subModules?: PortalSubModule[]
// }

// // Sub Module
// export interface PortalSubModule {
//   id: string
//   name: string
//   path: string
//   permissions: string[]
// }

// // User Session
// export interface UserSession {
//   id: string
//   userId: string
//   userName: string
//   email: string
//   role: RoleLevel
//   roleId: string
//   roleName: string
//   portal: PortalType
//   permissions: string[]
//   department: string
//   profileImage?: string
//   loginTime: Date
//   expiresAt: Date
//   ipAddress?: string
// }

// // Auth Response
// export interface AuthResponse {
//   success: boolean
//   message: string
//   session?: UserSession
//   redirectTo?: string
//   error?: string
// }

// // ============================================================================
// // PORTAL CONFIGURATIONS
// // ============================================================================

// export const PORTAL_CONFIGS: PortalConfig[] = [
//   {
//     id: 'admin',
//     name: 'Admin Portal',
//     description: 'Full system administration and organization management',
//     icon: 'Building2',
//     color: 'blue',
//     gradient: 'from-blue-500 to-blue-600',
//     iconBg: 'bg-blue-100 dark:bg-blue-900',
//     textColor: 'text-blue-600 dark:text-blue-400',
//     href: '/login/admin',
//     dashboardPath: '/admin/dashboard',
//     allowedRoles: ['super', 'admin'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Overview and analytics',
//         icon: 'LayoutDashboard',
//         path: '/admin/dashboard',
//         permissions: ['view_dashboard'],
//         subModules: [
//           { id: 'analytics', name: 'Analytics', path: '/admin/analytics', permissions: ['view_analytics'] },
//           { id: 'reports', name: 'Reports', path: '/admin/reports', permissions: ['view_reports'] }
//         ]
//       },
//       {
//         id: 'admin-management',
//         name: 'Admin Management',
//         description: 'Users, roles, and permissions',
//         icon: 'Shield',
//         path: '/admin/admin-management',
//         permissions: ['manage_users', 'manage_roles'],
//         subModules: [
//           { id: 'users', name: 'User Accounts', path: '/admin/admin-management/user-accounts', permissions: ['manage_users'] },
//           { id: 'roles', name: 'Role Manager', path: '/admin/admin-management/role-manager', permissions: ['manage_roles'] },
//           { id: 'permissions', name: 'Permission Matrix', path: '/admin/admin-management/permission-matrix', permissions: ['manage_permissions'] },
//           { id: 'audit', name: 'Audit Logs', path: '/admin/admin-management/audit-logs', permissions: ['view_audit'] }
//         ]
//       },
//       {
//         id: 'hr',
//         name: 'HR Management',
//         description: 'Employee and payroll management',
//         icon: 'Users',
//         path: '/admin/hr',
//         permissions: ['manage_hr'],
//         subModules: [
//           { id: 'employees', name: 'Employees', path: '/admin/hr/employee-master', permissions: ['manage_employees'] },
//           { id: 'attendance', name: 'Attendance', path: '/admin/hr/attendance-tracker', permissions: ['manage_attendance'] },
//           { id: 'leave', name: 'Leave Management', path: '/admin/hr/leave-management', permissions: ['manage_leave'] },
//           { id: 'payroll', name: 'Payroll', path: '/admin/hr/payroll-manager', permissions: ['manage_payroll'] },
//           { id: 'visas', name: 'Visa Tracker', path: '/admin/hr/visa-tracker', permissions: ['manage_visas'] }
//         ]
//       },
//       {
//         id: 'finance',
//         name: 'Finance',
//         description: 'Invoices, payments, and expenses',
//         icon: 'DollarSign',
//         path: '/admin/finance',
//         permissions: ['manage_finance'],
//         subModules: [
//           { id: 'invoices', name: 'Invoices', path: '/admin/finance/invoices', permissions: ['manage_invoices'] },
//           { id: 'payments', name: 'Payments', path: '/admin/finance/payments', permissions: ['manage_payments'] },
//           { id: 'expenses', name: 'Expenses', path: '/admin/finance/expenses', permissions: ['manage_expenses'] }
//         ]
//       },
//       {
//         id: 'jobs',
//         name: 'Jobs',
//         description: 'Job management and scheduling',
//         icon: 'Briefcase',
//         path: '/admin/jobs',
//         permissions: ['manage_jobs'],
//         subModules: [
//           { id: 'all-jobs', name: 'All Jobs', path: '/admin/jobs/all-jobs', permissions: ['manage_jobs'] },
//           { id: 'scheduling', name: 'Scheduling', path: '/admin/jobs/scheduling', permissions: ['manage_scheduling'] },
//           { id: 'team-assign', name: 'Team Assignment', path: '/admin/jobs/team-assignment', permissions: ['manage_team_assignment'] }
//         ]
//       },
//       {
//         id: 'clients',
//         name: 'Clients',
//         description: 'Client relationship management',
//         icon: 'Users2',
//         path: '/admin/crm',
//         permissions: ['manage_clients']
//       },
//       {
//         id: 'products',
//         name: 'Products',
//         description: 'Product and inventory management',
//         icon: 'Package',
//         path: '/admin/products',
//         permissions: ['manage_products']
//       },
//       {
//         id: 'quotations',
//         name: 'Quotations',
//         description: 'Quote generation and management',
//         icon: 'FileText',
//         path: '/admin/quotations',
//         permissions: ['manage_quotations']
//       },
//       {
//         id: 'meetings',
//         name: 'Meetings',
//         description: 'Meeting scheduling and notes',
//         icon: 'Calendar',
//         path: '/admin/meetings',
//         permissions: ['manage_meetings']
//       },
//       {
//         id: 'surveys',
//         name: 'Surveys',
//         description: 'Survey creation and responses',
//         icon: 'ClipboardList',
//         path: '/admin/surveys',
//         permissions: ['manage_surveys']
//       },
//       {
//         id: 'settings',
//         name: 'Settings',
//         description: 'System configuration',
//         icon: 'Settings',
//         path: '/admin/settings',
//         permissions: ['manage_system']
//       }
//     ]
//   },
//   {
//     id: 'manager',
//     name: 'Manager Portal',
//     description: 'Team management and project oversight',
//     icon: 'UserCog',
//     color: 'indigo',
//     gradient: 'from-indigo-500 to-indigo-600',
//     iconBg: 'bg-indigo-100 dark:bg-indigo-900',
//     textColor: 'text-indigo-600 dark:text-indigo-400',
//     href: '/login/manager',
//     dashboardPath: '/manager/dashboard',
//     allowedRoles: ['manager'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Team overview and KPIs',
//         icon: 'LayoutDashboard',
//         path: '/manager/dashboard',
//         permissions: ['view_dashboard']
//       },
//       {
//         id: 'team',
//         name: 'My Team',
//         description: 'Team member management',
//         icon: 'Users',
//         path: '/manager/team',
//         permissions: ['manage_team'],
//         subModules: [
//           { id: 'members', name: 'Team Members', path: '/manager/team/members', permissions: ['view_team'] },
//           { id: 'attendance', name: 'Attendance', path: '/manager/team/attendance', permissions: ['view_attendance'] },
//           { id: 'leave', name: 'Leave Requests', path: '/manager/team/leave', permissions: ['approve_leave'] },
//           { id: 'performance', name: 'Performance', path: '/manager/team/performance', permissions: ['manage_performance'] }
//         ]
//       },
//       {
//         id: 'jobs',
//         name: 'Jobs',
//         description: 'Job assignment and tracking',
//         icon: 'Briefcase',
//         path: '/manager/jobs',
//         permissions: ['manage_jobs'],
//         subModules: [
//           { id: 'active', name: 'Active Jobs', path: '/manager/jobs/active', permissions: ['view_jobs'] },
//           { id: 'scheduling', name: 'Scheduling', path: '/manager/jobs/scheduling', permissions: ['manage_scheduling'] },
//           { id: 'assign', name: 'Team Assignment', path: '/manager/jobs/assign', permissions: ['assign_team'] }
//         ]
//       },
//       {
//         id: 'clients',
//         name: 'Clients',
//         description: 'Client communication',
//         icon: 'Users2',
//         path: '/manager/clients',
//         permissions: ['view_clients']
//       },
//       {
//         id: 'reports',
//         name: 'Reports',
//         description: 'Team and project reports',
//         icon: 'BarChart3',
//         path: '/manager/reports',
//         permissions: ['view_reports'],
//         subModules: [
//           { id: 'team-reports', name: 'Team Reports', path: '/manager/reports/team', permissions: ['view_team_reports'] },
//           { id: 'job-reports', name: 'Job Reports', path: '/manager/reports/jobs', permissions: ['view_job_reports'] },
//           { id: 'performance', name: 'Performance', path: '/manager/reports/performance', permissions: ['view_performance'] }
//         ]
//       },
//       {
//         id: 'approvals',
//         name: 'Approvals',
//         description: 'Pending approvals',
//         icon: 'CheckSquare',
//         path: '/manager/approvals',
//         permissions: ['approve_requests']
//       },
//       {
//         id: 'meetings',
//         name: 'Meetings',
//         description: 'Team meetings',
//         icon: 'Calendar',
//         path: '/manager/meetings',
//         permissions: ['manage_meetings']
//       }
//     ]
//   },
//   {
//     id: 'supervisor',
//     name: 'Supervisor Portal',
//     description: 'Team oversight and daily operations',
//     icon: 'ClipboardCheck',
//     color: 'emerald',
//     gradient: 'from-emerald-500 to-emerald-600',
//     iconBg: 'bg-emerald-100 dark:bg-emerald-900',
//     textColor: 'text-emerald-600 dark:text-emerald-400',
//     href: '/login/supervisor',
//     dashboardPath: '/supervisor/dashboard',
//     allowedRoles: ['supervisor'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Daily overview',
//         icon: 'LayoutDashboard',
//         path: '/supervisor/dashboard',
//         permissions: ['view_dashboard']
//       },
//       {
//         id: 'team',
//         name: 'Team',
//         description: 'Team activities',
//         icon: 'Users',
//         path: '/supervisor/team',
//         permissions: ['view_team'],
//         subModules: [
//           { id: 'members', name: 'Team Members', path: '/supervisor/team/members', permissions: ['view_team'] },
//           { id: 'attendance', name: 'Attendance', path: '/supervisor/team/attendance', permissions: ['view_attendance'] },
//           { id: 'tasks', name: 'Tasks', path: '/supervisor/team/tasks', permissions: ['manage_tasks'] }
//         ]
//       },
//       {
//         id: 'jobs',
//         name: 'Jobs',
//         description: 'Job execution',
//         icon: 'Briefcase',
//         path: '/supervisor/jobs',
//         permissions: ['view_jobs'],
//         subModules: [
//           { id: 'today', name: "Today's Jobs", path: '/supervisor/jobs/today', permissions: ['view_jobs'] },
//           { id: 'in-progress', name: 'In Progress', path: '/supervisor/jobs/in-progress', permissions: ['view_jobs'] },
//           { id: 'checklists', name: 'Checklists', path: '/supervisor/jobs/checklists', permissions: ['manage_checklists'] }
//         ]
//       },
//       {
//         id: 'approvals',
//         name: 'Approvals',
//         description: 'Team requests',
//         icon: 'CheckSquare',
//         path: '/supervisor/approvals',
//         permissions: ['approve_requests'],
//         subModules: [
//           { id: 'leave', name: 'Leave Requests', path: '/supervisor/approvals/leave', permissions: ['approve_leave'] },
//           { id: 'overtime', name: 'Overtime', path: '/supervisor/approvals/overtime', permissions: ['approve_overtime'] }
//         ]
//       },
//       {
//         id: 'reports',
//         name: 'Reports',
//         description: 'Daily reports',
//         icon: 'FileText',
//         path: '/supervisor/reports',
//         permissions: ['view_reports']
//       }
//     ]
//   },
//   {
//     id: 'employee',
//     name: 'Employee Portal',
//     description: 'Self-service and personal management',
//     icon: 'User',
//     color: 'violet',
//     gradient: 'from-violet-500 to-violet-600',
//     iconBg: 'bg-violet-100 dark:bg-violet-900',
//     textColor: 'text-violet-600 dark:text-violet-400',
//     href: '/login/employee',
//     dashboardPath: '/employee/dashboard',
//     allowedRoles: ['user'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Personal overview',
//         icon: 'LayoutDashboard',
//         path: '/employee/dashboard',
//         permissions: ['view_dashboard']
//       },
//       {
//         id: 'profile',
//         name: 'My Profile',
//         description: 'Personal information',
//         icon: 'User',
//         path: '/employee/profile',
//         permissions: ['manage_profile'],
//         subModules: [
//           { id: 'info', name: 'Personal Info', path: '/employee/profile/info', permissions: ['view_profile'] },
//           { id: 'documents', name: 'Documents', path: '/employee/profile/documents', permissions: ['view_documents'] },
//           { id: 'bank', name: 'Bank Details', path: '/employee/profile/bank', permissions: ['view_bank'] }
//         ]
//       },
//       {
//         id: 'attendance',
//         name: 'Attendance',
//         description: 'Check-in/out and history',
//         icon: 'Clock',
//         path: '/employee/attendance',
//         permissions: ['view_attendance'],
//         subModules: [
//           { id: 'check', name: 'Check In/Out', path: '/employee/attendance/check', permissions: ['check_attendance'] },
//           { id: 'history', name: 'History', path: '/employee/attendance/history', permissions: ['view_attendance'] }
//         ]
//       },
//       {
//         id: 'leave',
//         name: 'Leave',
//         description: 'Leave requests and balance',
//         icon: 'Calendar',
//         path: '/employee/leave',
//         permissions: ['request_leave'],
//         subModules: [
//           { id: 'request', name: 'Request Leave', path: '/employee/leave/request', permissions: ['request_leave'] },
//           { id: 'history', name: 'Leave History', path: '/employee/leave/history', permissions: ['view_leave'] },
//           { id: 'balance', name: 'Balance', path: '/employee/leave/balance', permissions: ['view_leave'] }
//         ]
//       },
//       {
//         id: 'payslips',
//         name: 'Payslips',
//         description: 'Salary and payslips',
//         icon: 'DollarSign',
//         path: '/employee/payslips',
//         permissions: ['view_payslips']
//       },
//       {
//         id: 'jobs',
//         name: 'My Jobs',
//         description: 'Assigned jobs',
//         icon: 'Briefcase',
//         path: '/employee/jobs',
//         permissions: ['view_jobs'],
//         subModules: [
//           { id: 'assigned', name: 'Assigned Jobs', path: '/employee/jobs/assigned', permissions: ['view_jobs'] },
//           { id: 'completed', name: 'Completed', path: '/employee/jobs/completed', permissions: ['view_jobs'] }
//         ]
//       },
//       {
//         id: 'requests',
//         name: 'Requests',
//         description: 'Submit requests',
//         icon: 'Send',
//         path: '/employee/requests',
//         permissions: ['submit_requests'],
//         subModules: [
//           { id: 'new', name: 'New Request', path: '/employee/requests/new', permissions: ['submit_requests'] },
//           { id: 'history', name: 'My Requests', path: '/employee/requests/history', permissions: ['view_requests'] }
//         ]
//       },
//       {
//         id: 'announcements',
//         name: 'Announcements',
//         description: 'Company news',
//         icon: 'Bell',
//         path: '/employee/announcements',
//         permissions: ['view_announcements']
//       }
//     ]
//   },
//   {
//     id: 'client',
//     name: 'Client Portal',
//     description: 'Service requests and account management',
//     icon: 'Building',
//     color: 'green',
//     gradient: 'from-green-500 to-green-600',
//     iconBg: 'bg-green-100 dark:bg-green-900',
//     textColor: 'text-green-600 dark:text-green-400',
//     href: '/login/client',
//     dashboardPath: '/client/dashboard',
//     allowedRoles: ['client'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Account overview',
//         icon: 'LayoutDashboard',
//         path: '/client/dashboard',
//         permissions: ['view_dashboard']
//       },
//       {
//         id: 'services',
//         name: 'Services',
//         description: 'Request and track services',
//         icon: 'Clipboard',
//         path: '/client/services',
//         permissions: ['request_service'],
//         subModules: [
//           { id: 'request', name: 'Request Service', path: '/client/services/request', permissions: ['request_service'] },
//           { id: 'active', name: 'Active Services', path: '/client/services/active', permissions: ['view_services'] },
//           { id: 'history', name: 'Service History', path: '/client/services/history', permissions: ['view_services'] }
//         ]
//       },
//       {
//         id: 'jobs',
//         name: 'Jobs',
//         description: 'Track job progress',
//         icon: 'Briefcase',
//         path: '/client/jobs',
//         permissions: ['view_jobs'],
//         subModules: [
//           { id: 'active', name: 'Active Jobs', path: '/client/jobs/active', permissions: ['view_jobs'] },
//           { id: 'scheduled', name: 'Scheduled', path: '/client/jobs/scheduled', permissions: ['view_jobs'] },
//           { id: 'completed', name: 'Completed', path: '/client/jobs/completed', permissions: ['view_jobs'] }
//         ]
//       },
//       {
//         id: 'invoices',
//         name: 'Invoices',
//         description: 'View and pay invoices',
//         icon: 'FileText',
//         path: '/client/invoices',
//         permissions: ['view_invoices'],
//         subModules: [
//           { id: 'pending', name: 'Pending', path: '/client/invoices/pending', permissions: ['view_invoices'] },
//           { id: 'paid', name: 'Paid', path: '/client/invoices/paid', permissions: ['view_invoices'] },
//           { id: 'all', name: 'All Invoices', path: '/client/invoices/all', permissions: ['view_invoices'] }
//         ]
//       },
//       {
//         id: 'quotations',
//         name: 'Quotations',
//         description: 'View and accept quotes',
//         icon: 'FileCheck',
//         path: '/client/quotations',
//         permissions: ['view_quotations']
//       },
//       {
//         id: 'feedback',
//         name: 'Feedback',
//         description: 'Rate and review services',
//         icon: 'Star',
//         path: '/client/feedback',
//         permissions: ['submit_feedback']
//       },
//       {
//         id: 'support',
//         name: 'Support',
//         description: 'Get help',
//         icon: 'HelpCircle',
//         path: '/client/support',
//         permissions: ['view_support'],
//         subModules: [
//           { id: 'tickets', name: 'Support Tickets', path: '/client/support/tickets', permissions: ['submit_tickets'] },
//           { id: 'faq', name: 'FAQ', path: '/client/support/faq', permissions: ['view_faq'] },
//           { id: 'contact', name: 'Contact Us', path: '/client/support/contact', permissions: ['view_contact'] }
//         ]
//       },
//       {
//         id: 'account',
//         name: 'Account',
//         description: 'Account settings',
//         icon: 'Settings',
//         path: '/client/account',
//         permissions: ['manage_account']
//       }
//     ]
//   },
//   {
//     id: 'guest',
//     name: 'Guest Portal',
//     description: 'Limited read-only access',
//     icon: 'Eye',
//     color: 'gray',
//     gradient: 'from-gray-500 to-gray-600',
//     iconBg: 'bg-gray-100 dark:bg-gray-700',
//     textColor: 'text-gray-600 dark:text-gray-400',
//     href: '/login/guest',
//     dashboardPath: '/guest/dashboard',
//     allowedRoles: ['guest'],
//     modules: [
//       {
//         id: 'dashboard',
//         name: 'Dashboard',
//         description: 'Overview',
//         icon: 'LayoutDashboard',
//         path: '/guest/dashboard',
//         permissions: ['view_dashboard']
//       },
//       {
//         id: 'announcements',
//         name: 'Announcements',
//         description: 'Public announcements',
//         icon: 'Bell',
//         path: '/guest/announcements',
//         permissions: ['view_announcements']
//       },
//       {
//         id: 'catalog',
//         name: 'Service Catalog',
//         description: 'Browse services',
//         icon: 'List',
//         path: '/guest/catalog',
//         permissions: ['view_catalog']
//       }
//     ]
//   }
// ]

// // ============================================================================
// // DEMO CREDENTIALS
// // ============================================================================

// export const DEMO_CREDENTIALS: Record<PortalType, { email: string; password: string; name: string; role: string }> = {
//   admin: {
//     email: 'admin@homeware.ae',
//     password: 'Demo@123',
//     name: 'Ahmed Al-Mazrouei',
//     role: 'Super Admin'
//   },
//   manager: {
//     email: 'manager@homeware.ae',
//     password: 'Demo@123',
//     name: 'Mohammed Hassan',
//     role: 'Manager'
//   },
//   supervisor: {
//     email: 'supervisor@homeware.ae',
//     password: 'Demo@123',
//     name: 'Ali Al-Mansoori',
//     role: 'Supervisor'
//   },
//   employee: {
//     email: 'employee@homeware.ae',
//     password: 'Demo@123',
//     name: 'Karim Al-Raisi',
//     role: 'Employee'
//   },
//   client: {
//     email: 'client@homeware.ae',
//     password: 'Demo@123',
//     name: 'Mohammed Al-Baqer',
//     role: 'Client'
//   },
//   guest: {
//     email: 'guest@homeware.ae',
//     password: 'Demo@123',
//     name: 'Guest User',
//     role: 'Guest'
//   }
// }

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// /**
//  * Get portal configuration by ID
//  */
// export function getPortalConfig(portalId: PortalType): PortalConfig | undefined {
//   return PORTAL_CONFIGS.find(p => p.id === portalId)
// }

// /**
//  * Get allowed portals for a role
//  */
// export function getPortalsForRole(role: RoleLevel): PortalConfig[] {
//   return PORTAL_CONFIGS.filter(p => p.allowedRoles.includes(role))
// }

// /**
//  * Check if a role can access a portal
//  */
// export function canAccessPortal(role: RoleLevel, portalId: PortalType): boolean {
//   const portal = getPortalConfig(portalId)
//   return portal ? portal.allowedRoles.includes(role) : false
// }

// /**
//  * Get modules for a portal
//  */
// export function getPortalModules(portalId: PortalType): PortalModule[] {
//   const portal = getPortalConfig(portalId)
//   return portal ? portal.modules : []
// }

// /**
//  * Check if user has permission
//  */
// export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
//   return userPermissions.includes(requiredPermission) || userPermissions.includes('*')
// }

// /**
//  * Check if user can access module
//  */
// export function canAccessModule(userPermissions: string[], module: PortalModule): boolean {
//   return module.permissions.some(p => hasPermission(userPermissions, p))
// }

// /**
//  * Get role level from role name
//  */
// export function getRoleLevelFromName(roleName: string): RoleLevel {
//   const mapping: Record<string, RoleLevel> = {
//     'Super Admin': 'super',
//     'Admin': 'admin',
//     'Manager': 'manager',
//     'Supervisor': 'supervisor',
//     'User': 'user',
//     'Employee': 'user',
//     'Client': 'client',
//     'Guest': 'guest'
//   }
//   return mapping[roleName] || 'guest'
// }

// /**
//  * Get default portal for role
//  */
// export function getDefaultPortalForRole(role: RoleLevel): PortalType {
//   switch (role) {
//     case 'super':
//     case 'admin':
//       return 'admin'
//     case 'manager':
//       return 'manager'
//     case 'supervisor':
//       return 'supervisor'
//     case 'user':
//       return 'employee'
//     case 'client':
//       return 'client'
//     case 'guest':
//     default:
//       return 'guest'
//   }
// }

// /**
//  * Validate credentials (demo implementation)
//  */
// export async function validateCredentials(
//   portal: PortalType,
//   email: string,
//   password: string
// ): Promise<AuthResponse> {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 500))

//   console.log(`[Auth] Validating ${portal} portal with email: ${email}`);
  
//   const demoCreds = DEMO_CREDENTIALS[portal]
  
//   // Check if portal credentials exist
//   if (!demoCreds) {
//     console.error(`[Auth] Portal '${portal}' credentials not found in DEMO_CREDENTIALS`);
//     console.log('[Auth] Available portals:', Object.keys(DEMO_CREDENTIALS));
//     return {
//       success: false,
//       message: 'Invalid portal',
//       error: `Portal '${portal}' is not configured`
//     }
//   }
  
//   console.log(`[Auth] Demo creds for ${portal}:`, { email: demoCreds.email, password: demoCreds.password });
  
//   // Trim whitespace from inputs for comparison
//   const trimmedEmail = email.trim().toLowerCase()
//   const trimmedPassword = password.trim()
//   const expectedEmail = demoCreds.email.toLowerCase()
  
//   console.log(`[Auth] Comparison:`, {
//     inputEmail: trimmedEmail,
//     expectedEmail: expectedEmail,
//     inputPassword: trimmedPassword,
//     expectedPassword: demoCreds.password,
//     emailMatch: trimmedEmail === expectedEmail,
//     passwordMatch: trimmedPassword === demoCreds.password
//   });
  
//   if (trimmedEmail === expectedEmail && trimmedPassword === demoCreds.password) {
//     const portalConfig = getPortalConfig(portal)
//     const role = getRoleLevelFromName(demoCreds.role)
    
//     console.log(`[Auth] Login successful for ${portal}, role: ${role}`);
    
//     const session: UserSession = {
//       id: `sess_${Date.now()}`,
//       userId: `usr_${portal}`,
//       userName: demoCreds.name,
//       email: demoCreds.email,
//       role: role,
//       roleId: `role_${role}`,
//       roleName: demoCreds.role,
//       portal: portal,
//       permissions: getDefaultPermissionsForRole(role),
//       department: getDepartmentForRole(role),
//       loginTime: new Date(),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
//     }

//     return {
//       success: true,
//       message: 'Login successful',
//       session,
//       redirectTo: portalConfig?.dashboardPath || '/dashboard'
//     }
//   }

//   console.log(`[Auth] Login failed for ${portal}`);
//   return {
//     success: false,
//     message: 'Invalid credentials',
//     error: `Invalid email or password. Try: ${demoCreds.email} / ${demoCreds.password}`
//   }
// }

// /**
//  * Get default permissions for role
//  */
// export function getDefaultPermissionsForRole(role: RoleLevel): string[] {
//   const permissionsByRole: Record<RoleLevel, string[]> = {
//     super: ['*'], // All permissions
//     admin: [
//       'manage_users', 'manage_roles', 'view_audit', 'edit_settings',
//       'manage_hr', 'manage_finance', 'manage_jobs', 'manage_clients',
//       'manage_products', 'manage_quotations', 'manage_meetings', 'manage_surveys'
//     ],
//     manager: [
//       'manage_team', 'view_reports', 'create_projects', 'manage_tasks',
//       'view_audit', 'manage_jobs', 'view_clients', 'approve_requests',
//       'manage_meetings', 'view_performance'
//     ],
//     supervisor: [
//       'view_team', 'view_attendance', 'manage_tasks', 'approve_leave',
//       'approve_overtime', 'view_jobs', 'manage_checklists', 'view_reports'
//     ],
//     user: [
//       'view_dashboard', 'manage_profile', 'view_attendance', 'check_attendance',
//       'request_leave', 'view_leave', 'view_payslips', 'view_jobs',
//       'submit_requests', 'view_announcements'
//     ],
//     client: [
//       'view_dashboard', 'request_service', 'view_services', 'view_jobs',
//       'view_invoices', 'view_quotations', 'submit_feedback', 'submit_tickets',
//       'manage_account'
//     ],
//     guest: [
//       'view_dashboard', 'view_announcements', 'view_catalog'
//     ]
//   }

//   return permissionsByRole[role] || []
// }

// /**
//  * Get department for role
//  */
// function getDepartmentForRole(role: RoleLevel): string {
//   const departments: Record<RoleLevel, string> = {
//     super: 'Executive',
//     admin: 'Administration',
//     manager: 'Operations',
//     supervisor: 'Operations',
//     user: 'General',
//     client: 'External',
//     guest: 'External'
//   }
//   return departments[role]
// }

// /**
//  * Store session in localStorage
//  */
// export function storeSession(session: UserSession): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('userSession', JSON.stringify(session))
//     localStorage.setItem('portal', session.portal)
//   }
// }

// /**
//  * Get session from localStorage
//  */
// export function getStoredSession(): UserSession | null {
//   if (typeof window !== 'undefined') {
//     const session = localStorage.getItem('userSession')
//     if (session) {
//       try {
//         const parsed = JSON.parse(session)
//         // Check if session is expired
//         if (new Date(parsed.expiresAt) > new Date()) {
//           return parsed
//         }
//         // Session expired, clear it
//         clearSession()
//       } catch {
//         return null
//       }
//     }
//   }
//   return null
// }

// /**
//  * Clear session
//  */
// export function clearSession(): void {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('userSession')
//     localStorage.removeItem('portal')
//     localStorage.removeItem('rememberMe')
//     localStorage.removeItem('adminEmail')
//   }
// }

// /**
//  * Check if user is authenticated
//  */
// export function isAuthenticated(): boolean {
//   return getStoredSession() !== null
// }

// /**
//  * Get current portal
//  */
// export function getCurrentPortal(): PortalType | null {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('portal') as PortalType | null
//   }
//   return null
// }


// new code
// lib/auth.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserRole {
  id: string
  email: string
  name: string
  allowedPages: string[]
  createdAt: string
  updatedAt: string
  roleName: string
}

export interface SessionData {
  user: {
    uid: string
    email: string | null
    name: string | null
  }
  allowedPages: string[]
  roleName: string
}

export async function createUserWithRole(
  email: string, 
  password: string, 
  name: string, 
  allowedPages: string[],
  roleName: string
) {
  try {
    // Firebase authentication mein user create karna
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // User profile update
    await updateProfile(userCredential.user, {
      displayName: name
    })
    
    // Firestore mein user-role collection mein store karna
    const userRoleRef = doc(db, 'users-role', userCredential.user.uid)
    await setDoc(userRoleRef, {
      email,
      name,
      allowedPages,
      roleName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return { success: true, userId: userCredential.user.uid }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    const docSnap = await getDoc(userRoleRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as UserRole
    }
    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function updateUserRole(uid: string, data: Partial<UserRole>) {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    await updateDoc(userRoleRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteUserRole(uid: string) {
  try {
    const userRoleRef = doc(db, 'users-role', uid)
    await setDoc(userRoleRef, { deleted: true })
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user role:', error)
    return { success: false, error: error.message }
  }
}

export async function validateCredentials(portal: string, email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userRole = await getUserRole(userCredential.user.uid)
    
    if (!userRole) {
      return { 
        success: false, 
        message: 'User role not found. Please contact administrator.' 
      }
    }
    
    const session: SessionData = {
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userRole.name
      },
      allowedPages: userRole.allowedPages,
      roleName: userRole.roleName
    }
    
    return { success: true, session }
  } catch (error: any) {
    console.error('Login error:', error)
    
    let message = 'Login failed. Please check your credentials.'
    if (error.code === 'auth/user-not-found') {
      message = 'User not found.'
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.'
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email format.'
    }
    
    return { success: false, message, error: error.code }
  }
}

export function storeSession(session: SessionData) {
  localStorage.setItem('userSession', JSON.stringify(session))
}

export function getSession(): SessionData | null {
  const session = localStorage.getItem('userSession')
  return session ? JSON.parse(session) : null
}

export function clearSession() {
  localStorage.removeItem('userSession')
}

export async function logout() {
  try {
    await signOut(auth)
    clearSession()
    return { success: true }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { success: false, error: error.message }
  }
}