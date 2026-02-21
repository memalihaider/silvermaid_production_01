'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
  Search,
  BarChart3,
  Plus,
  LogIn,
  LogOut,
  Briefcase,
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  Clock4,
  Home,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Menu,
  X,
  Mail,
  User
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSession, type SessionData } from '@/lib/auth'
import { EmployeeSidebar } from '../_components/sidebar'

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
}

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shift: string;
  clockIn: string;
  clockOut: string | null;
  status: 'Present' | 'Late' | 'Absent' | 'On Job' | 'Half Day' | 'Full Leave' | 'Sick Leave';
  workingHours: number;
  jobId?: string;
  jobTitle?: string;
  overtimeHours?: number;
  notes?: string;
  attendanceType: 'Manual' | 'Auto';
  createdAt: string;
  updatedAt: string;
}

export default function AttendancePage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('history') // Changed to history as default
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loggedInEmployee, setLoggedInEmployee] = useState<FirebaseEmployee | null>(null)

  const [markForm, setMarkForm] = useState({
    employeeId: '',
    clockIn: '',
    clockOut: '',
    jobId: '',
    jobTitle: '',
    overtimeHours: '',
    notes: '',
    status: 'Present'
  })

  // History tab ke liye new states
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )
  const [monthlyReport, setMonthlyReport] = useState<any>(null)

  // Session check and fetch logged-in employee
  useEffect(() => {
    const storedSession = getSession()
    if (!storedSession) {
      router.push('/login/employee')
      return
    }
    setSession(storedSession)
    
    // Fetch logged-in employee
    fetchLoggedInEmployee(storedSession)
  }, [router])

  // Fetch logged-in employee from Firebase
  const fetchLoggedInEmployee = async (sessionData: SessionData) => {
    try {
      console.log('🔍 Fetching logged-in employee for attendance...')
      
      let employeeData: FirebaseEmployee | null = null
      
      // Try by employeeId first
      if (sessionData.employeeId) {
        const employeeDoc = await getDocs(query(
          collection(db, 'employees'), 
          where('__name__', '==', sessionData.employeeId)
        ))
        
        if (!employeeDoc.empty) {
          const data = employeeDoc.docs[0].data()
          employeeData = {
            id: employeeDoc.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || ''
          }
          console.log('✅ Found employee by ID:', employeeData.name)
        }
      }
      
      // If not found by ID, try by email
      if (!employeeData && sessionData.user.email) {
        const employeesRef = collection(db, 'employees')
        const q = query(employeesRef, where('email', '==', sessionData.user.email))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          employeeData = {
            id: snapshot.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || ''
          }
          console.log('✅ Found employee by email:', employeeData.name)
        }
      }
      
      setLoggedInEmployee(employeeData)
      
      // If employee found, set as default in mark form
      if (employeeData) {
        setMarkForm(prev => ({
          ...prev,
          employeeId: employeeData.id
        }))
      }
      
    } catch (error) {
      console.error('Error fetching logged-in employee:', error)
    }
  }

  // Fetch attendance
  useEffect(() => {
    if (loggedInEmployee) {
      fetchAttendance()
    }
  }, [loggedInEmployee])

  // Ensure attendance for today
  useEffect(() => {
    if (loggedInEmployee) {
      ensureAttendanceForLoggedInEmployee()
    }
  }, [currentDate, loggedInEmployee])

  // Generate monthly report
  useEffect(() => {
    if (loggedInEmployee && selectedMonth && activeTab === 'history') {
      generateMonthlyReport()
    }
  }, [selectedMonth, attendance, activeTab, loggedInEmployee])

  const fetchAttendance = async () => {
    try {
      if (!loggedInEmployee) return
      
      const attendanceRef = collection(db, 'attendance')
      const q = query(attendanceRef, where('employeeId', '==', loggedInEmployee.id))
      const snapshot = await getDocs(q)
      
      const attendanceList: Attendance[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Clean data to remove undefined fields
        const cleanData: any = {}
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            cleanData[key] = data[key]
          }
        })
        
        attendanceList.push({
          id: doc.id,
          employeeId: cleanData.employeeId || '',
          employeeName: cleanData.employeeName || '',
          date: cleanData.date || currentDate,
          shift: cleanData.shift || 'Standard Shift',
          clockIn: cleanData.clockIn || '',
          clockOut: cleanData.clockOut || null,
          status: cleanData.status || 'Absent',
          workingHours: cleanData.workingHours || 0,
          jobId: cleanData.jobId || '',
          jobTitle: cleanData.jobTitle || '',
          overtimeHours: cleanData.overtimeHours || 0,
          notes: cleanData.notes || '',
          attendanceType: cleanData.attendanceType || 'Manual',
          createdAt: cleanData.createdAt || new Date().toISOString(),
          updatedAt: cleanData.updatedAt || new Date().toISOString()
        })
      })
      
      setAttendance(attendanceList)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      setAttendance([])
    }
  }

  // Ensure logged-in employee has attendance record for today
  const ensureAttendanceForLoggedInEmployee = async () => {
    if (!loggedInEmployee) return
    
    try {
      const todayAttendance = attendance.filter(a => a.date === currentDate)
      
      if (todayAttendance.length === 0) {
        // Check if record already exists in Firebase
        const attendanceRef = collection(db, 'attendance')
        const q = query(
          attendanceRef,
          where('employeeId', '==', loggedInEmployee.id),
          where('date', '==', currentDate)
        )
        
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          // Create new attendance record
          const newAttendance = {
            employeeId: loggedInEmployee.id,
            employeeName: loggedInEmployee.name,
            date: currentDate,
            shift: 'Standard Shift',
            clockIn: '',
            clockOut: null,
            status: 'Absent',
            workingHours: 0,
            jobId: '',
            jobTitle: '',
            overtimeHours: 0,
            notes: 'Automatically created',
            attendanceType: 'Auto',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          await addDoc(collection(db, 'attendance'), cleanFirebaseData(newAttendance))
          
          // Refresh attendance list
          await fetchAttendance()
        }
      }
    } catch (error) {
      console.error('Error ensuring attendance:', error)
    }
  }

  // Monthly report generate karein for logged-in employee
  const generateMonthlyReport = () => {
    if (!loggedInEmployee || !selectedMonth) return
    
    const [year, month] = selectedMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of month
    
    // Month ke saare days generate karein
    const daysInMonth = endDate.getDate()
    const monthDays = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dateStr = date.toISOString().split('T')[0]
      monthDays.push(dateStr)
    }
    
    // Employee ki attendance filter karein
    const employeeAttendance = attendance.filter(a => 
      a.employeeId === loggedInEmployee.id && 
      a.date.startsWith(selectedMonth)
    )
    
    // Day-by-day data prepare karein
    const dayData = monthDays.map(date => {
      const record = employeeAttendance.find(a => a.date === date)
      const day = new Date(date).getDay()
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
      
      return {
        date,
        day: dayName,
        status: record?.status || 'Absent',
        clockIn: record?.clockIn || '-',
        clockOut: record?.clockOut || '-',
        workingHours: record?.workingHours || 0,
        notes: record?.notes || '',
        isWeekend: day === 0 || day === 6
      }
    })
    
    // Summary calculate karein
    const summary = {
      present: dayData.filter(d => d.status === 'Present').length,
      absent: dayData.filter(d => d.status === 'Absent').length,
      halfDay: dayData.filter(d => d.status === 'Half Day').length,
      fullLeave: dayData.filter(d => d.status === 'Full Leave').length,
      sickLeave: dayData.filter(d => d.status === 'Sick Leave').length,
      onJob: dayData.filter(d => d.status === 'On Job').length,
      late: dayData.filter(d => d.status === 'Late').length,
      totalWorkingHours: dayData.reduce((sum, d) => sum + d.workingHours, 0),
      weekends: dayData.filter(d => d.isWeekend).length
    }
    
    // Attendance rate calculate karein
    const workingDays = daysInMonth - summary.weekends
    const attendedDays = summary.present + summary.halfDay + summary.onJob + summary.late
    const attendanceRate = workingDays > 0 ? ((attendedDays / workingDays) * 100).toFixed(1) : '0'
    
    setMonthlyReport({
      employee: loggedInEmployee,
      month: selectedMonth,
      days: dayData,
      summary: {
        ...summary,
        workingDays,
        attendanceRate,
        totalDays: daysInMonth
      }
    })
  }

  // Clean data for Firebase - remove undefined and null values
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

  // Get today's attendance for logged-in employee
  const todayAttendance = useMemo(() => {
    if (!loggedInEmployee) return []
    return attendance.filter(a => a.date === currentDate && a.employeeId === loggedInEmployee.id)
  }, [attendance, currentDate, loggedInEmployee])

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    return todayAttendance.filter(a => {
      const matchesSearch = a.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [todayAttendance, searchTerm, filterStatus])

  // Calculate statistics for logged-in employee
  const stats = useMemo(() => {
    if (!loggedInEmployee) return {
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
      fullLeave: 0,
      sickLeave: 0,
      onJob: 0,
      totalOvertimeHours: 0
    }
    
    return {
      present: todayAttendance.filter(a => a.status === 'Present').length,
      late: todayAttendance.filter(a => a.status === 'Late').length,
      absent: todayAttendance.filter(a => a.status === 'Absent').length,
      halfDay: todayAttendance.filter(a => a.status === 'Half Day').length,
      fullLeave: todayAttendance.filter(a => a.status === 'Full Leave').length,
      sickLeave: todayAttendance.filter(a => a.status === 'Sick Leave').length,
      onJob: todayAttendance.filter(a => a.status === 'On Job').length,
      totalOvertimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0)
    }
  }, [todayAttendance, attendance, loggedInEmployee])

  // Handle mark attendance
  const handleMarkAttendance = async () => {
    if (!loggedInEmployee) {
      alert('Employee not found')
      return
    }

    if (!markForm.status) {
      alert('Please select a status')
      return
    }

    try {
      const clockInTime = markForm.status === 'Present' || markForm.status === 'Late' || markForm.status === 'On Job' 
        ? (markForm.clockIn || '09:00') 
        : ''
      
      const clockOutTime = markForm.status === 'Present' || markForm.status === 'Late' || markForm.status === 'On Job'
        ? (markForm.clockOut || '17:00')
        : ''
      
      let workingHours = 0
      if ((markForm.status === 'Present' || markForm.status === 'Late' || markForm.status === 'On Job') && clockInTime && clockOutTime) {
        const clockIn = new Date(`2024-01-01 ${clockInTime}`)
        const clockOut = new Date(`2024-01-01 ${clockOutTime}`)
        workingHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      } else if (markForm.status === 'Half Day') {
        workingHours = 4
      }

      // Prepare attendance data
      const attendanceData = cleanFirebaseData({
        employeeId: loggedInEmployee.id,
        employeeName: loggedInEmployee.name,
        date: currentDate,
        shift: 'Standard Shift',
        clockIn: clockInTime,
        clockOut: clockOutTime,
        status: markForm.status,
        workingHours: Math.round(workingHours * 100) / 100,
        jobId: markForm.jobId || '',
        jobTitle: markForm.jobTitle || '',
        overtimeHours: markForm.overtimeHours ? parseFloat(markForm.overtimeHours) : 0,
        notes: markForm.notes || '',
        attendanceType: 'Manual',
        updatedAt: new Date().toISOString()
      })

      // Check if attendance already exists for today
      const attendanceRef = collection(db, 'attendance')
      const q = query(
        attendanceRef,
        where('employeeId', '==', loggedInEmployee.id),
        where('date', '==', currentDate)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        // Update existing record
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, attendanceData)
        alert('Attendance updated successfully!')
      } else {
        // Create new record
        const newAttendance = {
          ...attendanceData,
          createdAt: new Date().toISOString()
        }
        await addDoc(collection(db, 'attendance'), newAttendance)
        alert('Attendance marked successfully!')
      }

      // Reset form
      setMarkForm({
        employeeId: loggedInEmployee.id,
        clockIn: '',
        clockOut: '',
        jobId: '',
        jobTitle: '',
        overtimeHours: '',
        notes: '',
        status: 'Present'
      })
      
      // Refresh attendance list
      await fetchAttendance()
      
    } catch (error: any) {
      console.error('Error saving attendance:', error)
      alert(`Error saving attendance: ${error.message}`)
    }
  }

  // Handle quick status change
  const handleQuickStatusChange = async (recordId: string, newStatus: Attendance['status']) => {
    try {
      const record = attendance.find(a => a.id === recordId)
      if (!record) {
        alert('Record not found')
        return
      }

      // Determine clock times based on status
      let clockIn = record.clockIn
      let clockOut = record.clockOut
      let workingHours = record.workingHours

      if (newStatus === 'Present' || newStatus === 'Late' || newStatus === 'On Job') {
        if (!clockIn) clockIn = '09:00'
        if (!clockOut) clockOut = '17:00'
        if (clockIn && clockOut) {
          const clockInTime = new Date(`2024-01-01 ${clockIn}`)
          const clockOutTime = new Date(`2024-01-01 ${clockOut}`)
          workingHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
        }
      } else if (newStatus === 'Half Day') {
        clockIn = clockIn || '09:00'
        clockOut = '13:00'
        workingHours = 4
      } else {
        clockIn = ''
        clockOut = null
        workingHours = 0
      }

      const updateData = cleanFirebaseData({
        status: newStatus,
        clockIn: clockIn,
        clockOut: clockOut,
        workingHours: Math.round(workingHours * 100) / 100,
        attendanceType: 'Manual',
        updatedAt: new Date().toISOString()
      })

      const attendanceDoc = doc(db, 'attendance', recordId)
      await updateDoc(attendanceDoc, updateData)

      // Update local state
      const updatedRecord = {
        ...record,
        ...updateData
      }
      
      const updated = attendance.map(a => 
        a.id === recordId ? updatedRecord : a
      )
      
      setAttendance(updated)
      alert(`Status changed to ${newStatus}`)
      
    } catch (error: any) {
      console.error('Error updating status:', error)
      alert(`Error updating status: ${error.message}`)
    }
  }

  // Handle clock in/out
  const handleClockInOut = async (record: Attendance) => {
    try {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      
      let updateData: any = {
        updatedAt: new Date().toISOString(),
        attendanceType: 'Manual'
      }
      
      if (!record.clockIn) {
        // Clock In
        updateData.clockIn = time
        updateData.status = 'Present'
      } else if (!record.clockOut) {
        // Clock Out
        updateData.clockOut = time
        
        const clockInTime = new Date(`2024-01-01 ${record.clockIn}`)
        const clockOutTime = new Date(`2024-01-01 ${time}`)
        const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
        updateData.workingHours = Math.round(hours * 100) / 100
      } else {
        // Reset for new entry
        updateData.clockIn = ''
        updateData.clockOut = null
        updateData.workingHours = 0
      }

      const attendanceDoc = doc(db, 'attendance', record.id)
      await updateDoc(attendanceDoc, cleanFirebaseData(updateData))
      
      // Update local state
      const updatedRecord = {
        ...record,
        ...updateData
      }
      
      const updated = attendance.map(a => 
        a.id === record.id ? updatedRecord : a
      )
      
      setAttendance(updated)
      
      if (!record.clockIn) {
        alert('Clock In recorded!')
      } else if (!record.clockOut) {
        alert('Clock Out recorded!')
      } else {
        alert('Clock times reset!')
      }
      
    } catch (error: any) {
      console.error('Error updating clock in/out:', error)
      alert(`Error recording time: ${error.message}`)
    }
  }

  // Handle delete attendance
  const handleDelete = async (id: string) => {
    if (confirm('Delete this attendance record?')) {
      try {
        await deleteDoc(doc(db, 'attendance', id))
        
        // Update local state
        setAttendance(prev => prev.filter(a => a.id !== id))
        alert('Attendance record deleted!')
        
      } catch (error: any) {
        console.error('Error deleting attendance:', error)
        alert(`Error deleting record: ${error.message}`)
      }
    }
  }

  // Download report as CSV
  const downloadReport = () => {
    if (!monthlyReport) return
    
    const { employee, month, days, summary } = monthlyReport
    const [year, monthNum] = month.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthName = monthNames[parseInt(monthNum) - 1]
    
    let csv = `Employee Attendance Report\n`
    csv += `Employee: ${employee.name}\n`
    csv += `Department: ${employee.department}\n`
    csv += `Month: ${monthName} ${year}\n\n`
    
    csv += `Date,Day,Status,Clock In,Clock Out,Working Hours,Notes\n`
    days.forEach((day: { date: any; day: any; status: any; clockIn: any; clockOut: any; workingHours: any; notes: any }) => {
      csv += `${day.date},${day.day},${day.status},${day.clockIn},${day.clockOut},${day.workingHours},"${day.notes}"\n`
    })
    
    csv += `\nSummary\n`
    csv += `Total Working Days:,${summary.workingDays}\n`
    csv += `Present:,${summary.present}\n`
    csv += `Absent:,${summary.absent}\n`
    csv += `Half Day:,${summary.halfDay}\n`
    csv += `Full Leave:,${summary.fullLeave}\n`
    csv += `Sick Leave:,${summary.sickLeave}\n`
    csv += `On Job:,${summary.onJob}\n`
    csv += `Late:,${summary.late}\n`
    csv += `Total Working Hours:,${summary.totalWorkingHours.toFixed(1)}\n`
    csv += `Attendance Rate:,${summary.attendanceRate}%\n`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${employee.name.replace(/\s+/g, '_')}_${month}_attendance_report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month
    
    if (direction === 'prev') {
      if (month === 1) {
        newMonth = 12
        newYear = year - 1
      } else {
        newMonth = month - 1
      }
    } else {
      if (month === 12) {
        newMonth = 1
        newYear = year + 1
      } else {
        newMonth = month + 1
      }
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`)
  }

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E'
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get status color from Code 1
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-900/20 text-green-400 border-green-800'
      case 'Late': return 'bg-amber-900/20 text-amber-400 border-amber-800'
      case 'Absent': return 'bg-red-900/20 text-red-400 border-red-800'
      case 'Half Day': return 'bg-blue-900/20 text-blue-400 border-blue-800'
      case 'Full Leave': return 'bg-purple-900/20 text-purple-400 border-purple-800'
      case 'Sick Leave': return 'bg-pink-900/20 text-pink-400 border-pink-800'
      case 'On Job': return 'bg-indigo-900/20 text-indigo-400 border-indigo-800'
      default: return 'bg-slate-700 text-slate-300'
    }
  }

  // Get status icon from Code 1 style
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'Late': return <AlertCircle className="w-4 h-4 text-amber-400" />
      case 'Absent': return <UserX className="w-4 h-4 text-red-400" />
      case 'Half Day': return <Clock4 className="w-4 h-4 text-blue-400" />
      default: return null
    }
  }

  // Get status color for calendar view
  const getCalendarStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-500 text-white'
      case 'Late': return 'bg-yellow-500 text-white'
      case 'Absent': return 'bg-red-500 text-white'
      case 'Half Day': return 'bg-blue-500 text-white'
      case 'Full Leave': return 'bg-purple-500 text-white'
      case 'Sick Leave': return 'bg-pink-500 text-white'
      case 'On Job': return 'bg-indigo-500 text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!loggedInEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <UserX className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Employee Not Found</h2>
            <p className="text-slate-400 mb-6">No employee profile linked to your account.</p>
            <button
              onClick={() => router.push('/login/employee')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Attendance</h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  {loggedInEmployee.name} • {loggedInEmployee.department} • {loggedInEmployee.position}
                </p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 border border-violet-700 rounded-lg">
                <Mail className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300">{loggedInEmployee.email}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Welcome, {loggedInEmployee.name}!</h2>
            <p className="text-slate-300">Track your daily attendance and view your attendance history.</p>
          </div>

          {/* Stats - Only for logged-in employee */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Present</p>
              <p className="text-2xl font-bold text-green-400 mt-2">{stats.present}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Half Day</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">{stats.halfDay}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">On Job</p>
              <p className="text-2xl font-bold text-indigo-400 mt-2">{stats.onJob}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Leave</p>
              <p className="text-2xl font-bold text-purple-400 mt-2">{stats.fullLeave + stats.sickLeave}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Late</p>
              <p className="text-2xl font-bold text-amber-400 mt-2">{stats.late}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Absent</p>
              <p className="text-2xl font-bold text-red-400 mt-2">{stats.absent}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Overtime</p>
              <p className="text-2xl font-bold text-teal-400 mt-2">{stats.totalOvertimeHours}h</p>
            </div>
          </div>

          {/* Tabs - Only History Tab */}
          <div className="border-b border-slate-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'history'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                History
              </button>
            </div>
          </div>

          {/* History Tab - Monthly Report */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">My Monthly Attendance Report</h3>
                    <p className="text-sm text-slate-400">
                      View your detailed attendance history
                    </p>
                  </div>
                </div>

                {/* Month Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Select Month</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {monthlyReport ? (
                  <>
                    {/* Download Button */}
                    <div className="flex justify-end mb-6">
                      <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download My Report
                      </button>
                    </div>

                    {/* Employee Info */}
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg text-white">{monthlyReport.employee.name}</h4>
                          <p className="text-sm text-slate-300">
                            {monthlyReport.employee.department} • {monthlyReport.employee.position}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-400">
                            {new Date(`${monthlyReport.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-400">
                            Employee ID: {monthlyReport.employee.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-white mb-4">Monthly Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        <div className="bg-green-900/20 border border-green-800 rounded-xl p-3">
                          <p className="text-xs text-green-400 font-medium uppercase">Present</p>
                          <p className="text-xl font-bold text-green-400">{monthlyReport.summary.present}</p>
                        </div>
                        <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                          <p className="text-xs text-red-400 font-medium uppercase">Absent</p>
                          <p className="text-xl font-bold text-red-400">{monthlyReport.summary.absent}</p>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-3">
                          <p className="text-xs text-blue-400 font-medium uppercase">Half Day</p>
                          <p className="text-xl font-bold text-blue-400">{monthlyReport.summary.halfDay}</p>
                        </div>
                        <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-3">
                          <p className="text-xs text-purple-400 font-medium uppercase">Leave</p>
                          <p className="text-xl font-bold text-purple-400">{monthlyReport.summary.fullLeave + monthlyReport.summary.sickLeave}</p>
                        </div>
                        <div className="bg-indigo-900/20 border border-indigo-800 rounded-xl p-3">
                          <p className="text-xs text-indigo-400 font-medium uppercase">On Job</p>
                          <p className="text-xl font-bold text-indigo-400">{monthlyReport.summary.onJob}</p>
                        </div>
                        <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-3">
                          <p className="text-xs text-amber-400 font-medium uppercase">Late</p>
                          <p className="text-xl font-bold text-amber-400">{monthlyReport.summary.late}</p>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                          <p className="text-xs text-slate-400 font-medium uppercase">Total Hours</p>
                          <p className="text-xl font-bold text-slate-300">{monthlyReport.summary.totalWorkingHours.toFixed(1)}h</p>
                        </div>
                        <div className="bg-teal-900/20 border border-teal-800 rounded-xl p-3">
                          <p className="text-xs text-teal-400 font-medium uppercase">Rate</p>
                          <p className="text-xl font-bold text-teal-400">{monthlyReport.summary.attendanceRate}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Calendar View */}
                    <div>
                      <h4 className="font-semibold text-white mb-4">Daily Attendance Calendar</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center py-2 text-xs font-medium text-slate-400">
                            {day}
                          </div>
                        ))}
                        
                        {monthlyReport.days.map((day: any, index: number) => {
                          const dateObj = new Date(day.date)
                          const dayNum = dateObj.getDate()
                          const isToday = day.date === currentDate
                          
                          return (
                            <div
                              key={day.date}
                              className={`min-h-24 border rounded-lg p-2 ${day.isWeekend ? 'bg-slate-900/50' : 'bg-slate-800'} ${isToday ? 'ring-2 ring-violet-500' : 'border-slate-700'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-medium ${day.isWeekend ? 'text-slate-500' : 'text-slate-300'}`}>
                                  {dayNum}
                                </span>
                                {isToday && (
                                  <span className="text-xs bg-violet-900/20 text-violet-400 px-1 py-0.5 rounded border border-violet-800">Today</span>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                <div className={`text-xs px-1.5 py-0.5 rounded ${getCalendarStatusColor(day.status)}`}>
                                  {day.status}
                                </div>
                                
                                {day.status !== 'Absent' && day.status !== 'Full Leave' && day.status !== 'Sick Leave' && (
                                  <>
                                    <div className="text-xs text-slate-400">
                                      <span className="font-medium">{day.clockIn}</span>
                                      <span className="mx-1">-</span>
                                      <span className="font-medium">{day.clockOut}</span>
                                    </div>
                                    {day.workingHours > 0 && (
                                      <div className="text-xs text-blue-400 font-medium">
                                        {day.workingHours}h
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {day.notes && (
                                  <div className="text-xs text-slate-500 truncate" title={day.notes}>
                                    📝 {day.notes.substring(0, 20)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div className="mt-6 pt-4 border-t border-slate-700">
                        <h5 className="font-medium text-slate-300 mb-2 text-sm">Status Legend</h5>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                            <span>Present</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                            <span>Absent</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                            <span>Half Day</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-purple-500"></div>
                            <span>Leave</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-indigo-500"></div>
                            <span>On Job</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-amber-500"></div>
                            <span>Late</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <div className="h-3 w-3 rounded-sm bg-pink-500"></div>
                            <span>Sick Leave</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                    <p className="font-medium text-lg text-white">No Attendance Data Found</p>
                    <p className="text-sm text-slate-400 mt-2">
                      No attendance records found for {loggedInEmployee.name} 
                      in {new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Try selecting a different month</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}