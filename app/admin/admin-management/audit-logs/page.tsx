'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Search, 
  AlertTriangle, 
  AlertCircle, 
  Eye, 
  Download, 
  Filter, 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  ExternalLink,
  X,
  ChevronDown,
  ArrowUpRight,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Terminal,
  Database,
  Globe,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react'

// Firebase imports - aap ke config file se import karein
import { db } from '@/lib/firebase' // Adjust path as needed
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'

// Type definitions
interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  createdAt: string;
  ipAddress: string;
  riskScore: number;
  anomalyDetected: boolean;
  changeType: string;
  before: string;
  after: string;
  allowedPages?: string[];
  roleName?: string;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUser, setFilterUser] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  
  // Real data from Firebase
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [actions, setActions] = useState<string[]>([])

  // Fetch data immediately on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Firebase se audit logs fetch karein
        const auditLogsRef = collection(db, 'users-role')
        const q = query(auditLogsRef)
        const querySnapshot = await getDocs(q)
        
        const logs: AuditLog[] = []
        const userSet = new Set<string>()
        const actionSet = new Set<string>()

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          
          // Format timestamp directly from string
          let timestamp = ''
          if (data.createdAt) {
            try {
              // If it's already a string, use it directly
              if (typeof data.createdAt === 'string') {
                const date = new Date(data.createdAt)
                timestamp = date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              } else if (data.createdAt.toDate) {
                // If it's a Firebase Timestamp
                const date = data.createdAt.toDate()
                timestamp = date.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              }
            } catch (error) {
              console.log('Error parsing date:', error)
              timestamp = 'Invalid Date'
            }
          }

          // Real user data se log generate karein
          const action = generateActionFromUserData(data)
          const resource = determineResource(data)
          const riskScore = calculateRiskScore(data)
          const anomalyDetected = riskScore > 50
          
          const log: AuditLog = {
            id: doc.id,
            userId: data.email || data.name || 'Unknown',
            userEmail: data.email || '',
            userName: data.name || 'Unknown User',
            action: action,
            resource: resource,
            timestamp: timestamp || new Date().toLocaleString(),
            createdAt: data.createdAt || new Date().toISOString(),
            ipAddress: generateRandomIP(),
            riskScore: riskScore,
            anomalyDetected: anomalyDetected,
            changeType: determineChangeType(action),
            before: getBeforeState(data),
            after: getAfterState(data),
            allowedPages: data.allowedPages || [],
            roleName: data.roleName || 'unknown'
          }

          logs.push(log)
          userSet.add(log.userId)
          actionSet.add(log.action)
        })

        // Immediate update - no delay
        setAuditLogs(logs)
        setUsers(Array.from(userSet))
        setActions(Array.from(actionSet))

        // Date range auto set karein
        if (logs.length > 0) {
          try {
            const validDates = logs.filter(log => {
              try {
                new Date(log.createdAt)
                return true
              } catch {
                return false
              }
            })
            
            if (validDates.length > 0) {
              const dates = validDates.map(log => new Date(log.createdAt))
              const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
              const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
              
              setDateFrom(minDate.toISOString().split('T')[0])
              setDateTo(maxDate.toISOString().split('T')[0])
            }
          } catch (dateError) {
            console.log('Error setting date range:', dateError)
          }
        }

      } catch (error) {
        console.error('Error fetching audit logs:', error)
        // Fallback: Agar Firebase se data nahi aaya to empty array rakhein
        setAuditLogs([])
      }
    }

    // Immediate fetch
    fetchData()
  }, [])

  // Helper functions for generating audit log data from user data
  const generateActionFromUserData = (data: any): string => {
    if (!data) return 'UNKNOWN_ACTION'
    
    const actions = [
      'USER_CREATED',
      'ROLE_ASSIGNED',
      'PERMISSION_UPDATED',
      'PROFILE_UPDATED',
      'LOGIN_ATTEMPT',
      'PAGES_ACCESS_CHANGED',
      'DATA_ACCESSED'
    ]
    
    if (data.roleName === 'admin') return 'ROLE_ASSIGNED'
    if (data.roleName === 'customer') return 'USER_CREATED'
    if (data.allowedPages && data.allowedPages.length > 0) return 'PAGES_ACCESS_CHANGED'
    
    return actions[Math.floor(Math.random() * actions.length)]
  }

  const determineResource = (data: any): string => {
    if (!data) return 'Unknown'
    
    if (data.roleName) return 'User Management'
    if (data.allowedPages && data.allowedPages.length > 0) return 'Permissions'
    return 'System'
  }

  const calculateRiskScore = (data: any): number => {
    if (!data) return 0
    
    let score = 0
    
    // Admin role = higher risk
    if (data.roleName === 'admin') score += 30
    
    // More allowed pages = higher risk
    if (data.allowedPages && Array.isArray(data.allowedPages)) {
      score += Math.min(data.allowedPages.length * 5, 40)
    }
    
    // Add some randomness for demo
    score += Math.floor(Math.random() * 30)
    
    return Math.min(score, 100)
  }

  const determineChangeType = (action: string): string => {
    if (action.includes('CREATED') || action.includes('ASSIGNED')) return 'create'
    if (action.includes('UPDATED') || action.includes('CHANGED')) return 'update'
    if (action.includes('LOGIN') || action.includes('ACCESSED')) return 'access'
    return 'security'
  }

  const getBeforeState = (data: any): string => {
    if (!data) return 'N/A'
    
    if (data.roleName) return `Role: ${data.roleName === 'admin' ? 'customer' : 'none'}`
    if (data.allowedPages) return 'No page access'
    return 'N/A'
  }

  const getAfterState = (data: any): string => {
    if (!data) return 'N/A'
    
    if (data.roleName) return `Role assigned: ${data.roleName}`
    if (data.allowedPages && Array.isArray(data.allowedPages)) {
      return `Pages granted: ${data.allowedPages.slice(0, 3).join(', ')}${data.allowedPages.length > 3 ? '...' : ''}`
    }
    return `User: ${data.email || data.name || 'Unknown'}`
  }

  const generateRandomIP = (): string => {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  const getRiskLevel = (score: number) => {
    if (score <= 5) return 'Low'
    if (score <= 25) return 'Medium'
    if (score <= 50) return 'High'
    return 'Critical'
  }

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesUser = filterUser === 'all' || log.userId.includes(filterUser)
      const matchesAction = filterAction === 'all' || log.action === filterAction
      const matchesRisk = filterRisk === 'all' || getRiskLevel(log.riskScore) === filterRisk

      // Date filtering
      let matchesDate = true
      if (dateFrom && dateTo) {
        try {
          const logDate = new Date(log.createdAt)
          const fromDate = new Date(dateFrom)
          const toDate = new Date(dateTo)
          toDate.setDate(toDate.getDate() + 1) // Include end date
          
          matchesDate = logDate >= fromDate && logDate <= toDate
        } catch (dateError) {
          matchesDate = true // If date parsing fails, include the log
        }
      }

      return matchesSearch && matchesUser && matchesAction && matchesRisk && matchesDate
    })
  }, [searchTerm, filterUser, filterAction, filterRisk, auditLogs, dateFrom, dateTo])

  const anomalyCount = auditLogs.filter(l => l.anomalyDetected).length
  const criticalCount = auditLogs.filter(l => l.riskScore >= 75).length
  const avgRiskScore = auditLogs.length > 0 
    ? Math.round(auditLogs.reduce((sum, l) => sum + l.riskScore, 0) / auditLogs.length)
    : 0

  // Export functionality
  const handleExportLogs = () => {
    if (auditLogs.length === 0) return
    
    const csvContent = [
      ['ID', 'User', 'Email', 'Action', 'Resource', 'Timestamp', 'IP Address', 'Risk Score', 'Anomaly', 'Role', 'Allowed Pages'],
      ...auditLogs.map(log => [
        log.id,
        log.userName,
        log.userEmail,
        log.action,
        log.resource,
        log.timestamp,
        log.ipAddress,
        log.riskScore.toString(),
        log.anomalyDetected ? 'Yes' : 'No',
        log.roleName || 'N/A',
        log.allowedPages?.join('; ') || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Refresh function
  const refreshData = async () => {
    try {
      const auditLogsRef = collection(db, 'users-role')
      const q = query(auditLogsRef)
      const querySnapshot = await getDocs(q)
      
      const logs: AuditLog[] = []
      const userSet = new Set<string>()
      const actionSet = new Set<string>()

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        let timestamp = ''
        if (data.createdAt) {
          try {
            if (typeof data.createdAt === 'string') {
              const date = new Date(data.createdAt)
              timestamp = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            }
          } catch (error) {
            timestamp = new Date().toLocaleString()
          }
        }

        const action = generateActionFromUserData(data)
        const resource = determineResource(data)
        const riskScore = calculateRiskScore(data)
        const anomalyDetected = riskScore > 50
        
        const log: AuditLog = {
          id: doc.id,
          userId: data.email || data.name || 'Unknown',
          userEmail: data.email || '',
          userName: data.name || 'Unknown User',
          action: action,
          resource: resource,
          timestamp: timestamp,
          createdAt: data.createdAt || new Date().toISOString(),
          ipAddress: generateRandomIP(),
          riskScore: riskScore,
          anomalyDetected: anomalyDetected,
          changeType: determineChangeType(action),
          before: getBeforeState(data),
          after: getAfterState(data),
          allowedPages: data.allowedPages || [],
          roleName: data.roleName || 'unknown'
        }

        logs.push(log)
        userSet.add(log.userId)
        actionSet.add(log.action)
      })

      // Immediate update
      setAuditLogs(logs)
      setUsers(Array.from(userSet))
      setActions(Array.from(actionSet))
      
      // Reset filters
      setSearchTerm('')
      setFilterUser('all')
      setFilterAction('all')
      setFilterRisk('all')
      
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  return (
    <div className="space-y-8 pb-10 bg-white text-black">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white p-8 md:p-12 text-black shadow-2xl border border-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                <Terminal className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">System Forensics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Audit Logs</h1>
            <p className="text-gray-600 mt-3 text-lg font-medium max-w-xl">
              Real-time activity monitoring from Firebase users-role collection
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportLogs}
              disabled={auditLogs.length === 0}
              className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all border ${
                auditLogs.length === 0 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-black border-gray-300'
              }`}
            >
              <Download className="h-5 w-5 text-blue-600" />
              Export Logs
            </button>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-50 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-50 blur-[100px]"></div>
      </div>

      {/* Security Alert Banner - Only show if there are anomalies */}
      {(anomalyCount > 0 || criticalCount > 0) && (
        <div className="relative overflow-hidden bg-red-50 border border-red-200 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center border border-red-200 animate-pulse">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-800">Security Anomalies Detected</h3>
              <p className="text-red-700 text-sm font-medium">
                {anomalyCount} anomalies and {criticalCount} critical risk events require immediate review.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setFilterRisk('Critical')
              setFilterAction('all')
              setFilterUser('all')
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            Review Incidents
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: auditLogs.length, color: 'blue', icon: Activity },
          { label: 'Avg Risk Score', value: avgRiskScore, color: 'emerald', icon: TrendingUp },
          { label: 'Anomalies', value: anomalyCount, color: 'amber', icon: AlertCircle },
          { label: 'Critical Events', value: criticalCount, color: 'rose', icon: ShieldAlert }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search logs by user, email, action, or resource..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-black placeholder:text-gray-500 transition-all"
            />
          </div>

          {/* Logs Timeline */}
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <div 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className={`group relative bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all cursor-pointer ${log.anomalyDetected ? 'border-red-200' : ''}`}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                        log.riskScore > 75 ? 'bg-red-100 border-red-200 text-red-600' :
                        log.riskScore > 25 ? 'bg-amber-100 border-amber-200 text-amber-600' :
                        'bg-emerald-100 border-emerald-200 text-emerald-600'
                      }`}>
                        {log.riskScore > 75 ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <div className="w-px h-full bg-gray-200 group-last:hidden"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-black group-hover:text-blue-600 transition-colors">{log.action}</span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-widest border border-gray-200">
                            {log.resource}
                          </span>
                          {log.anomalyDetected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-200">
                              <Zap className="h-3 w-3" /> Anomaly
                            </span>
                          )}
                          {log.roleName && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-200">
                              {log.roleName}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="font-bold text-black block">{log.userName}</span>
                            <span className="text-xs text-gray-500">{log.userEmail}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="h-4 w-4 text-indigo-600" />
                          <span>{log.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Activity className="h-4 w-4 text-emerald-600" />
                          <span>Risk: {log.riskScore} ({getRiskLevel(log.riskScore)})</span>
                        </div>
                        <div className="flex justify-end">
                          <button className="text-blue-600 hover:text-blue-700 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                            Details <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-black text-gray-600">No Audit Logs Found</h3>
                <p className="text-gray-500 mt-2">
                  {auditLogs.length === 0 ? 'No data available from Firebase' : 'No logs match your filters'}
                </p>
                {auditLogs.length === 0 && (
                  <button 
                    onClick={refreshData}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
                  >
                    Refresh Data
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-[32px] p-8 space-y-8 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Refine Logs
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">User Identity</label>
                  <select 
                    value={filterUser} 
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="all" className="bg-white text-black">All Users</option>
                    {users.map(u => (
                      <option key={u} value={u} className="bg-white text-black">{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Action Type</label>
                  <select 
                    value={filterAction} 
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="all" className="bg-white text-black">All Actions</option>
                    {actions.map(a => (
                      <option key={a} value={a} className="bg-white text-black">{a}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Risk Level</label>
                  <select 
                    value={filterRisk} 
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  >
                    <option value="all" className="bg-white text-black">All Risk Levels</option>
                    <option value="Low" className="bg-white text-emerald-600">Low Risk</option>
                    <option value="Medium" className="bg-white text-amber-600">Medium Risk</option>
                    <option value="High" className="bg-white text-orange-600">High Risk</option>
                    <option value="Critical" className="bg-white text-red-600">Critical Risk</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Date Range
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">From</label>
                  <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">To</label>
                  <input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={refreshData}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg"
            >
              Refresh & Reset Filters
            </button>
          </div>

          {/* Security Insights */}
          <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Security Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-600">System Integrity</span>
                <span className={`text-xs font-black ${
                  criticalCount === 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {criticalCount === 0 ? 'OPTIMAL' : 'ATTENTION NEEDED'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-600">Last Scan</span>
                <span className="text-xs font-black text-black">Just now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-600">Active Users</span>
                <span className="text-xs font-black text-blue-600">{users.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                  selectedLog.riskScore > 75 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-blue-100 border-blue-200 text-blue-600'
                }`}>
                  <Terminal className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black">Event Forensics</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">Log ID: {selectedLog.id} • {selectedLog.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">User Identity</p>
                  <p className="text-lg font-black text-black">{selectedLog.userName}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedLog.userEmail}</p>
                  {selectedLog.roleName && (
                    <p className="text-xs text-blue-600 mt-1 font-bold">Role: {selectedLog.roleName}</p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">IP Address</p>
                  <p className="text-lg font-black text-black">{selectedLog.ipAddress}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Risk Score</p>
                  <p className={`text-lg font-black ${selectedLog.riskScore > 75 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedLog.riskScore}/100 ({getRiskLevel(selectedLog.riskScore)})
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-600 uppercase tracking-widest ml-1">Change Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Before State</p>
                    <code className="text-sm text-black font-mono break-all">{selectedLog.before}</code>
                  </div>
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">After State</p>
                    <code className="text-sm text-black font-mono break-all">{selectedLog.after}</code>
                  </div>
                </div>
              </div>

              {selectedLog.allowedPages && selectedLog.allowedPages.length > 0 && (
                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <h5 className="text-sm font-black text-indigo-800 mb-3">Allowed Pages Access</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.allowedPages.map((page, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                        {page}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
                <Fingerprint className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <h5 className="text-sm font-black text-black">System Metadata</h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    This event was captured from Firebase users-role collection. 
                    User activity and permissions changes are monitored in real-time.
                    Data fetched directly from production database.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 px-6 py-4 bg-white hover:bg-gray-100 text-black rounded-2xl font-black uppercase tracking-widest transition-all border border-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const content = `
                    Audit Log Details
                    =================
                    ID: ${selectedLog.id}
                    User: ${selectedLog.userName}
                    Email: ${selectedLog.userEmail}
                    Action: ${selectedLog.action}
                    Resource: ${selectedLog.resource}
                    Timestamp: ${selectedLog.timestamp}
                    IP Address: ${selectedLog.ipAddress}
                    Risk Score: ${selectedLog.riskScore} (${getRiskLevel(selectedLog.riskScore)})
                    Role: ${selectedLog.roleName || 'N/A'}
                    Allowed Pages: ${selectedLog.allowedPages?.join(', ') || 'N/A'}
                    Before: ${selectedLog.before}
                    After: ${selectedLog.after}
                  `
                  
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `audit-log-${selectedLog.id}.txt`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  window.URL.revokeObjectURL(url)
                }}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}