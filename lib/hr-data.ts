// Unified HR and Jobs data store
// This file serves as the source of truth for all HR and Jobs data

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  role: 'Supervisor' | 'Cleaner' | 'HR Manager' | 'Operations Manager' | 'Manager'
  status: 'Active' | 'Inactive' | 'On Leave'
  joinDate: string
  location: string
  rating: number
  salary: {
    basic: number
    housing: number
    allowances: { name: string; amount: number }[]
    totalAllowances: number
    total: number
  }
  dateOfBirth: string
  nationalityCountry: string
  passportNumber: string
  emiratesIdNumber: string
  profileImage?: string
  bonuses: { date: string; amount: number; reason: string }[]
  documents: { name: string; url: string; uploadDate: string }[]
  emergencyContacts: { name: string; phone: string; relationship: string }[]
  visa?: { expiryDate: string; type: string }
}

export interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  shift: string
  clockIn: string | null
  clockOut: string | null
  status: 'Present' | 'Late' | 'Absent' | 'Half-day' | 'Leave' | 'On Job'
  workingHours: number
  jobId?: string
  jobTitle?: string
  overtimeHours?: number
  overtimeReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface JobAssignment {
  id: string
  jobId: string
  jobTitle: string
  employeeId: string
  employeeName: string
  role: string
  assignedAt: string
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled'
  clockInTime?: string
  clockOutTime?: string
  workingHours?: number
  attendance?: Attendance
}

export interface Job {
  id: string
  title: string
  client: string
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  scheduledDate: string
  scheduledTime: string
  location: string
  budget: number
  actualCost: number
  assignedEmployees: JobAssignment[]
  description: string
  requiredSkills: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  overtimeApproved?: boolean
  totalOvertimeHours?: number
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  color: string
}

// Mock data for development
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'John Smith',
    email: 'john@silvermaid.ae',
    phone: '+971-50-1234567',
    position: 'Senior Supervisor',
    department: 'Operations',
    role: 'Supervisor',
    status: 'Active',
    joinDate: '2024-01-15',
    location: 'Dubai Marina',
    rating: 4.8,
    salary: {
      basic: 5000,
      housing: 500,
      allowances: [{ name: 'Transport', amount: 200 }],
      totalAllowances: 700,
      total: 5700
    },
    dateOfBirth: '1985-05-20',
    nationalityCountry: 'India',
    passportNumber: 'P1234567',
    emiratesIdNumber: 'E123456789',
    bonuses: [],
    documents: [],
    emergencyContacts: [{ name: 'Jane Smith', phone: '+971-50-9876543', relationship: 'Spouse' }]
  },
  {
    id: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah@silvermaid.ae',
    phone: '+971-50-1234568',
    position: 'Senior Cleaner',
    department: 'Operations',
    role: 'Cleaner',
    status: 'Active',
    joinDate: '2024-03-20',
    location: 'Downtown Dubai',
    rating: 4.9,
    salary: {
      basic: 2300,
      housing: 200,
      allowances: [],
      totalAllowances: 200,
      total: 2500
    },
    dateOfBirth: '1990-08-15',
    nationalityCountry: 'Philippines',
    passportNumber: 'P9876543',
    emiratesIdNumber: 'E987654321',
    bonuses: [],
    documents: [],
    emergencyContacts: []
  },
  {
    id: 'EMP003',
    name: 'Ahmed Hassan',
    email: 'ahmed@silvermaid.ae',
    phone: '+971-50-1234569',
    position: 'Cleaner',
    department: 'Operations',
    role: 'Cleaner',
    status: 'Active',
    joinDate: '2024-06-10',
    location: 'Business Bay',
    rating: 4.5,
    salary: {
      basic: 2100,
      housing: 200,
      allowances: [],
      totalAllowances: 200,
      total: 2300
    },
    dateOfBirth: '1988-03-22',
    nationalityCountry: 'Egypt',
    passportNumber: 'P5555555',
    emiratesIdNumber: 'E555555555',
    bonuses: [],
    documents: [],
    emergencyContacts: []
  },
  {
    id: 'EMP004',
    name: 'Maria Rodriguez',
    email: 'maria@silvermaid.ae',
    phone: '+971-50-1234570',
    position: 'HR Manager',
    department: 'HR',
    role: 'HR Manager',
    status: 'Active',
    joinDate: '2023-11-05',
    location: 'JLT',
    rating: 4.7,
    salary: {
      basic: 4500,
      housing: 300,
      allowances: [],
      totalAllowances: 300,
      total: 4800
    },
    dateOfBirth: '1986-11-10',
    nationalityCountry: 'Spain',
    passportNumber: 'P7777777',
    emiratesIdNumber: 'E777777777',
    bonuses: [],
    documents: [],
    emergencyContacts: []
  }
]

export const MOCK_SHIFTS: Shift[] = [
  { id: 'SHIFT001', name: 'Early Shift', startTime: '06:00', endTime: '14:00', color: 'bg-amber-100 border-amber-300' },
  { id: 'SHIFT002', name: 'Standard Shift', startTime: '08:00', endTime: '17:00', color: 'bg-blue-100 border-blue-300' },
  { id: 'SHIFT003', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', color: 'bg-purple-100 border-purple-300' },
  { id: 'SHIFT004', name: 'Night Shift', startTime: '22:00', endTime: '06:00', color: 'bg-indigo-100 border-indigo-300' }
]

export const MOCK_ATTENDANCE: Attendance[] = [
  {
    id: 'ATT001',
    employeeId: 'EMP001',
    employeeName: 'John Smith',
    date: new Date().toISOString().split('T')[0],
    shift: 'Standard Shift',
    clockIn: '08:00',
    clockOut: '17:30',
    status: 'Present',
    workingHours: 9.5,
    jobId: 'JOB001',
    jobTitle: 'Villa Deep Cleaning - Dubai Marina',
    overtimeHours: 1.5,
    overtimeReason: 'Client requested additional work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ATT002',
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    date: new Date().toISOString().split('T')[0],
    shift: 'Standard Shift',
    clockIn: '08:15',
    clockOut: null,
    status: 'On Job',
    workingHours: 0,
    jobId: 'JOB001',
    jobTitle: 'Villa Deep Cleaning - Dubai Marina',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ATT003',
    employeeId: 'EMP003',
    employeeName: 'Ahmed Hassan',
    date: new Date().toISOString().split('T')[0],
    shift: 'Early Shift',
    clockIn: '06:00',
    clockOut: '14:00',
    status: 'Present',
    workingHours: 8,
    jobId: 'JOB002',
    jobTitle: 'Office Cleaning - Downtown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Helper functions for real-time data operations
export function getEmployeeById(id: string): Employee | undefined {
  return MOCK_EMPLOYEES.find(e => e.id === id)
}

export function getAttendanceByDate(date: string): Attendance[] {
  return MOCK_ATTENDANCE.filter(a => a.date === date)
}

export function getEmployeeAttendance(employeeId: string, date?: string): Attendance[] {
  return MOCK_ATTENDANCE.filter(a => a.employeeId === employeeId && (!date || a.date === date))
}

export function getJobAssignments(jobId: string): JobAssignment[] {
  // This will be populated from actual job assignments
  return []
}

export function calculateOvertimePayment(overtimeHours: number, hourlyRate: number): number {
  return overtimeHours * hourlyRate * 1.5 // 1.5x rate for overtime
}

export function getEmployeeStats(employeeId: string) {
  const emp = getEmployeeById(employeeId)
  const attendance = getEmployeeAttendance(employeeId)
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.find(a => a.date === today)

  return {
    employee: emp,
    totalDaysWorked: attendance.length,
    totalOvertimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
    todayStatus: todayAttendance?.status || 'Not Marked',
    todayClockIn: todayAttendance?.clockIn,
    currentJob: todayAttendance?.jobTitle
  }
}
