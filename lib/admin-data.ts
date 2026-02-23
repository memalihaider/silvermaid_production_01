// Admin Management Data & Types

export interface Role {
  id: string
  name: string
  description: string
  level: 'super' | 'admin' | 'manager' | 'supervisor' | 'user' | 'guest'
  permissions: string[]
  usersCount: number
  status: 'Active' | 'Inactive'
  createdDate: string
  updatedDate: string
  color: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  roleId: string
  status: 'Active' | 'Inactive' | 'Suspended'
  lastLogin: string
  joinDate: string
  department: string
  profileImage?: string
  permissions: string[]
}

export interface Permission {
  id: string
  name: string
  category: string
  description: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  module: string
  details: string
  timestamp: string
  ipAddress: string
  status: 'Success' | 'Failed' | 'Warning'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface SystemActivity {
  id: string
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'access' | 'download' | 'upload'
  user: string
  action: string
  module: string
  timestamp: string
  ipAddress: string
  status: 'Success' | 'Failed'
  details: string
}

// Mock Roles
export const MOCK_ROLES: Role[] = [
  {
    id: 'ROLE001',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    level: 'super',
    permissions: ['manage_users', 'manage_roles', 'manage_permissions', 'view_audit', 'delete_content', 'edit_settings', 'manage_system'],
    usersCount: 1,
    status: 'Active',
    createdDate: '2025-01-01',
    updatedDate: '2025-01-28',
    color: 'rose'
  },
  {
    id: 'ROLE002',
    name: 'Admin',
    description: 'Administrative access with limited super-admin features',
    level: 'admin',
    permissions: ['manage_users', 'manage_roles', 'view_audit', 'edit_settings', 'manage_departments'],
    usersCount: 3,
    status: 'Active',
    createdDate: '2025-01-05',
    updatedDate: '2025-01-28',
    color: 'orange'
  },
  {
    id: 'ROLE003',
    name: 'Manager',
    description: 'Team and project management capabilities',
    level: 'manager',
    permissions: ['manage_team', 'view_reports', 'create_projects', 'manage_tasks', 'view_audit'],
    usersCount: 8,
    status: 'Active',
    createdDate: '2025-01-10',
    updatedDate: '2025-01-28',
    color: 'blue'
  },
  {
    id: 'ROLE004',
    name: 'Supervisor',
    description: 'Oversee team activities and reports',
    level: 'supervisor',
    permissions: ['view_team_reports', 'manage_tasks', 'approve_requests', 'view_activity'],
    usersCount: 12,
    status: 'Active',
    createdDate: '2025-01-15',
    updatedDate: '2025-01-28',
    color: 'emerald'
  },
  {
    id: 'ROLE005',
    name: 'User',
    description: 'Standard user with basic access',
    level: 'user',
    permissions: ['view_own_data', 'submit_requests', 'view_announcements', 'manage_profile'],
    usersCount: 45,
    status: 'Active',
    createdDate: '2025-01-20',
    updatedDate: '2025-01-28',
    color: 'slate'
  },
  {
    id: 'ROLE006',
    name: 'Guest',
    description: 'Read-only access to specific modules',
    level: 'guest',
    permissions: ['view_public_data', 'view_announcements'],
    usersCount: 5,
    status: 'Active',
    createdDate: '2025-01-25',
    updatedDate: '2025-01-28',
    color: 'gray'
  }
]

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'USR001',
    name: 'Ahmed Al-Mazrouei',
    email: 'ahmed.mazrouei@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Super Admin',
    roleId: 'ROLE001',
    status: 'Active',
    lastLogin: '2026-01-28',
    joinDate: '2025-01-01',
    department: 'Administration',
    permissions: ['manage_users', 'manage_roles', 'manage_permissions', 'view_audit', 'delete_content']
  },
  {
    id: 'USR002',
    name: 'Fatima Al-Ketbi',
    email: 'fatima.ketbi@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Admin',
    roleId: 'ROLE002',
    status: 'Active',
    lastLogin: '2026-01-28',
    joinDate: '2025-01-05',
    department: 'Administration',
    permissions: ['manage_users', 'manage_roles', 'view_audit']
  },
  {
    id: 'USR003',
    name: 'Mohammed Hassan',
    email: 'mohammed.hassan@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Manager',
    roleId: 'ROLE003',
    status: 'Active',
    lastLogin: '2026-01-27',
    joinDate: '2025-01-10',
    department: 'Operations',
    permissions: ['manage_team', 'view_reports', 'create_projects']
  },
  {
    id: 'USR004',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Manager',
    roleId: 'ROLE003',
    status: 'Active',
    lastLogin: '2026-01-28',
    joinDate: '2025-01-12',
    department: 'Finance',
    permissions: ['manage_team', 'view_reports']
  },
  {
    id: 'USR005',
    name: 'Ali Al-Mansoori',
    email: 'ali.mansoori@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Supervisor',
    roleId: 'ROLE004',
    status: 'Active',
    lastLogin: '2026-01-26',
    joinDate: '2025-01-15',
    department: 'Operations',
    permissions: ['view_team_reports', 'manage_tasks', 'approve_requests']
  },
  {
    id: 'USR006',
    name: 'Nora Al-Kaabi',
    email: 'nora.kaabi@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'Supervisor',
    roleId: 'ROLE004',
    status: 'Active',
    lastLogin: '2026-01-28',
    joinDate: '2025-01-18',
    department: 'HR',
    permissions: ['view_team_reports', 'manage_tasks']
  },
  {
    id: 'USR007',
    name: 'Karim Al-Raisi',
    email: 'karim.raisi@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'User',
    roleId: 'ROLE005',
    status: 'Active',
    lastLogin: '2026-01-25',
    joinDate: '2025-02-01',
    department: 'Sales',
    permissions: ['view_own_data', 'submit_requests']
  },
  {
    id: 'USR008',
    name: 'Leila Al-Mazrouei',
    email: 'leila.mazrouei@silvermaid.ae',
    phone: '+971-4-XXX-XXXX',
    role: 'User',
    roleId: 'ROLE005',
    status: 'Inactive',
    lastLogin: '2025-12-15',
    joinDate: '2025-02-05',
    department: 'Marketing',
    permissions: ['view_own_data', 'submit_requests']
  }
]

// Mock Permissions
export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'PERM001', name: 'Manage Users', category: 'User Management', description: 'Create, edit, delete user accounts' },
  { id: 'PERM002', name: 'Manage Roles', category: 'Role Management', description: 'Create and modify system roles' },
  { id: 'PERM003', name: 'Manage Permissions', category: 'Permission Management', description: 'Configure permissions for roles' },
  { id: 'PERM004', name: 'View Audit Logs', category: 'Audit', description: 'Access system audit logs' },
  { id: 'PERM005', name: 'Delete Content', category: 'Content Management', description: 'Delete system content' },
  { id: 'PERM006', name: 'Edit Settings', category: 'System Settings', description: 'Modify system settings' },
  { id: 'PERM007', name: 'Manage System', category: 'System Administration', description: 'Full system management' },
  { id: 'PERM008', name: 'Manage Departments', category: 'Department Management', description: 'Manage organizational departments' },
  { id: 'PERM009', name: 'Manage Team', category: 'Team Management', description: 'Manage team members' },
  { id: 'PERM010', name: 'View Reports', category: 'Reporting', description: 'View system reports' },
  { id: 'PERM011', name: 'Create Projects', category: 'Project Management', description: 'Create new projects' },
  { id: 'PERM012', name: 'Manage Tasks', category: 'Task Management', description: 'Create and manage tasks' },
  { id: 'PERM013', name: 'View Team Reports', category: 'Reporting', description: 'View team performance reports' },
  { id: 'PERM014', name: 'Approve Requests', category: 'Approval', description: 'Approve user requests' },
  { id: 'PERM015', name: 'View Own Data', category: 'Self-Service', description: 'View own account data' },
  { id: 'PERM016', name: 'Submit Requests', category: 'Self-Service', description: 'Submit system requests' },
  { id: 'PERM017', name: 'Manage Profile', category: 'Self-Service', description: 'Manage own profile' },
  { id: 'PERM018', name: 'View Announcements', category: 'Communications', description: 'View system announcements' }
]

// Mock Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD001',
    userId: 'USR001',
    userName: 'Ahmed Al-Mazrouei',
    action: 'User Created',
    module: 'User Management',
    details: 'Created new user: Fatima Al-Ketbi',
    timestamp: '2026-01-28T10:30:00',
    ipAddress: '192.168.1.101',
    status: 'Success',
    severity: 'Medium'
  },
  {
    id: 'AUD002',
    userId: 'USR002',
    userName: 'Fatima Al-Ketbi',
    action: 'Role Modified',
    module: 'Role Management',
    details: 'Updated Admin role permissions',
    timestamp: '2026-01-28T09:15:00',
    ipAddress: '192.168.1.102',
    status: 'Success',
    severity: 'High'
  },
  {
    id: 'AUD003',
    userId: 'USR003',
    userName: 'Mohammed Hassan',
    action: 'Login Attempt',
    module: 'Authentication',
    details: 'User logged in successfully',
    timestamp: '2026-01-28T08:45:00',
    ipAddress: '192.168.1.103',
    status: 'Success',
    severity: 'Low'
  },
  {
    id: 'AUD004',
    userId: 'USR004',
    userName: 'Sarah Johnson',
    action: 'Permission Denied',
    module: 'Finance',
    details: 'Attempted to access restricted report without permission',
    timestamp: '2026-01-28T07:20:00',
    ipAddress: '192.168.1.104',
    status: 'Failed',
    severity: 'High'
  },
  {
    id: 'AUD005',
    userId: 'USR005',
    userName: 'Ali Al-Mansoori',
    action: 'Data Export',
    module: 'Reports',
    details: 'Exported team performance data',
    timestamp: '2026-01-28T06:30:00',
    ipAddress: '192.168.1.105',
    status: 'Success',
    severity: 'Medium'
  },
  {
    id: 'AUD006',
    userId: 'USR001',
    userName: 'Ahmed Al-Mazrouei',
    action: 'System Configuration',
    module: 'System Settings',
    details: 'Updated system backup schedule',
    timestamp: '2026-01-27T22:00:00',
    ipAddress: '192.168.1.101',
    status: 'Success',
    severity: 'Critical'
  },
  {
    id: 'AUD007',
    userId: 'USR006',
    userName: 'Nora Al-Kaabi',
    action: 'Login Attempt',
    module: 'Authentication',
    details: 'User logged in successfully',
    timestamp: '2026-01-27T14:45:00',
    ipAddress: '192.168.1.106',
    status: 'Success',
    severity: 'Low'
  },
  {
    id: 'AUD008',
    userId: 'Unknown',
    userName: 'Unknown User',
    action: 'Suspicious Activity',
    module: 'Security',
    details: 'Multiple failed login attempts from IP 192.168.1.200',
    timestamp: '2026-01-27T13:20:00',
    ipAddress: '192.168.1.200',
    status: 'Warning',
    severity: 'Critical'
  }
]

// Helper Functions
export function calculateAdminStats() {
  return {
    totalUsers: MOCK_USERS.length,
    activeUsers: MOCK_USERS.filter(u => u.status === 'Active').length,
    inactiveUsers: MOCK_USERS.filter(u => u.status === 'Inactive').length,
    suspendedUsers: MOCK_USERS.filter(u => u.status === 'Suspended').length,
    totalRoles: MOCK_ROLES.length,
    totalPermissions: MOCK_PERMISSIONS.length,
    recentLogs: MOCK_AUDIT_LOGS.slice(0, 5),
    criticalAlerts: MOCK_AUDIT_LOGS.filter(log => log.severity === 'Critical').length,
    failedAttempts: MOCK_AUDIT_LOGS.filter(log => log.status === 'Failed').length
  }
}

export function getUsersByRole(roleId: string) {
  return MOCK_USERS.filter(user => user.roleId === roleId)
}

export function getPermissionsByRole(roleId: string) {
  const role = MOCK_ROLES.find(r => r.id === roleId)
  return role?.permissions || []
}

export function getAuditLogsByUser(userId: string) {
  return MOCK_AUDIT_LOGS.filter(log => log.userId === userId)
}

export function getAuditLogsByModule(module: string) {
  return MOCK_AUDIT_LOGS.filter(log => log.module === module)
}

export function getSecurityStats() {
  return {
    totalEvents: MOCK_AUDIT_LOGS.length,
    successfulLogins: MOCK_AUDIT_LOGS.filter(log => log.action === 'Login Attempt' && log.status === 'Success').length,
    failedAttempts: MOCK_AUDIT_LOGS.filter(log => log.status === 'Failed').length,
    warnings: MOCK_AUDIT_LOGS.filter(log => log.status === 'Warning').length,
    criticalEvents: MOCK_AUDIT_LOGS.filter(log => log.severity === 'Critical').length
  }
}
