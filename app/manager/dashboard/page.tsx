'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ManagerSidebar } from '../_components/sidebar';
import {
  TrendingUp,
  Users,
  Briefcase,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Trash2,
  MapPin,
  Phone,
  Mail,
  X,
  FileText,
  Zap,
  UserCheck,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Building2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Define SessionData type to match ManagerSidebar expectations
type SessionData = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  roleId: string;
  roleName: string;
  portal: 'manager' | 'guest' | 'employee' | 'supervisor';
  permissions: string[];
  department: string;
  loginTime: string;
  expiresAt: string;
  user: {
    uid: string;
    email: string | null;
    name: string | null;
  };
  allowedPages: string[];
};

// Temporary function to replace getStoredSession
const getSessionData = (): SessionData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) return null;
    
    const storedSession = JSON.parse(sessionStr);
    if (!storedSession) return null;
    
    // Transform stored session to SessionData format
    return {
      id: storedSession.id || `sess_${Date.now()}`,
      userId: storedSession.userId || storedSession.user?.uid || 'unknown',
      userName: storedSession.userName || storedSession.user?.name || 'Manager',
      email: storedSession.email || storedSession.user?.email || '',
      role: storedSession.role || 'manager',
      roleId: storedSession.roleId || 'role_manager',
      roleName: storedSession.roleName || storedSession.role || 'Manager',
      portal: 'manager',
      permissions: storedSession.permissions || ['view_dashboard', 'view_team', 'view_jobs', 'view_clients'],
      department: storedSession.department || 'Management',
      loginTime: storedSession.loginTime || new Date().toISOString(),
      expiresAt: storedSession.expiresAt || new Date(Date.now() + 3600000).toISOString(),
      user: storedSession.user || {
        uid: storedSession.userId || 'unknown',
        email: storedSession.email || null,
        name: storedSession.userName || null
      },
      allowedPages: storedSession.allowedPages || [
        '/manager/dashboard',
        '/manager/team',
        '/manager/jobs',
        '/manager/clients',
        '/manager/approvals',
        '/manager/reports'
      ]
    };
  } catch {
    return null;
  }
};

// Mock data for manager dashboard
const teamPerformanceData = [
  { month: 'Jan', completed: 8, in_progress: 5, planning: 2 },
  { month: 'Feb', completed: 12, in_progress: 7, planning: 3 },
  { month: 'Mar', completed: 10, in_progress: 8, planning: 2 },
  { month: 'Apr', completed: 14, in_progress: 6, planning: 4 },
  { month: 'May', completed: 11, in_progress: 9, planning: 3 },
  { month: 'Jun', completed: 15, in_progress: 8, planning: 2 }
];

const teamStatusData = [
  { name: 'Active', value: 10, color: '#10b981' },
  { name: 'On Leave', value: 2, color: '#f59e0b' },
  { name: 'Off-duty', value: 1, color: '#6b7280' }
];

const kpis = [
  { title: 'Team Members', value: '12', change: '+2', trend: 'up' as const, icon: Users, color: 'blue' },
  { title: 'Active Jobs', value: '8', change: '+3', trend: 'up' as const, icon: Briefcase, color: 'green' },
  { title: 'Budget Utilization', value: '68%', change: '+5%', trend: 'up' as const, icon: Wallet, color: 'purple' },
  { title: 'Completion Rate', value: '87%', change: '+12%', trend: 'up' as const, icon: TrendingUp, color: 'orange' }
];

const activeJobs = [
  { id: 'JOB-2024-001', client: 'Al Futtaim Group', title: 'Office Renovation', status: 'In Progress', progress: 65, budget: 150000, spent: 97500, dueDate: '2024-02-15', team: 4 },
  { id: 'JOB-2024-002', client: 'Emirates NBD', title: 'Branch Maintenance', status: 'In Progress', progress: 40, budget: 80000, spent: 32000, dueDate: '2024-02-20', team: 3 },
  { id: 'JOB-2024-003', client: 'ADNOC', title: 'Facility Upgrade', status: 'Planning', progress: 15, budget: 250000, spent: 37500, dueDate: '2024-03-01', team: 5 },
  { id: 'JOB-2024-004', client: 'Emaar Properties', title: 'HVAC Installation', status: 'In Progress', progress: 80, budget: 120000, spent: 96000, dueDate: '2024-02-10', team: 2 },
];

const teamMembers = [
  { id: '1', name: 'Ahmed Hassan', role: 'Senior Technician', status: 'active', currentJob: 'JOB-2024-001' },
  { id: '2', name: 'Sara Al Maktoum', role: 'Project Coordinator', status: 'active', currentJob: 'JOB-2024-002' },
  { id: '3', name: 'Mohammed Ali', role: 'Technician', status: 'active', currentJob: 'JOB-2024-001' },
  { id: '4', name: 'Fatima Khalid', role: 'Quality Inspector', status: 'on-leave', currentJob: null },
  { id: '5', name: 'Omar Rashid', role: 'Field Engineer', status: 'active', currentJob: 'JOB-2024-004' },
];

const initialPendingApprovals = [
  { id: 'APR-001', type: 'Leave Request', requester: 'Ahmed Hassan', requestDate: '2024-01-28', icon: Calendar, color: 'bg-blue-100', textColor: 'text-blue-600', details: '3 days off requested', amount: null },
  { id: 'APR-002', type: 'Expense Claim', requester: 'Sara Al Maktoum', requestDate: '2024-01-29', icon: Wallet, color: 'bg-purple-100', textColor: 'text-purple-600', details: 'Travel expenses - Dubai to Abu Dhabi', amount: 'AED 450' },
  { id: 'APR-003', type: 'Overtime Request', requester: 'Mohammed Ali', requestDate: '2024-01-30', icon: Clock, color: 'bg-orange-100', textColor: 'text-orange-600', details: '4 hours overtime for JOB-2024-001', amount: '+4 hrs' },
];

export default function ManagerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'Ahmed Hassan', action: 'completed task', target: '#J-8821', time: '2 mins ago', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 2, user: 'Sara Al Maktoum', action: 'submitted expense', target: 'AED 450', time: '15 mins ago', icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 3, user: 'System', action: 'approved overtime', target: '+4 hours', time: '1 hour ago', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 4, user: 'Mohammed Ali', action: 'flagged issue', target: '#J-8819', time: '3 hours ago', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ]);

  useEffect(() => {
    const sessionData = getSessionData();
    if (!sessionData || sessionData.portal !== 'manager') {
      router.push('/login/manager');
      return;
    }
    setSession(sessionData);
  }, [router]);

  const handleExportData = useCallback(() => {
    setExportLoading(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(
        "Month,Completed,In Progress,Planning\n" + teamPerformanceData.map(d => `${d.month},${d.completed},${d.in_progress},${d.planning}`).join("\n")
      );
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `manager-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      setExportLoading(false);
    }, 800);
  }, []);

  const handleDeleteActivity = useCallback((id: number) => {
    setRecentActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveApproval = useCallback((approvalId: string, approverName: string) => {
    setProcessingApproval(approvalId);
    setTimeout(() => {
      const approval = pendingApprovals.find(a => a.id === approvalId);
      if (approval) {
        setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
        
        // Add to recent activities
        setRecentActivities(prev => [
          {
            id: Math.max(...prev.map(a => a.id), 0) + 1,
            user: 'System',
            action: `approved ${approval.type.toLowerCase()}`,
            target: `${approval.requester}`,
            time: 'just now',
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-100'
          },
          ...prev
        ]);
        
        showToast(`${approval.type} from ${approval.requester} approved!`, 'success');
      }
      setProcessingApproval(null);
    }, 600);
  }, [pendingApprovals]);

  const handleRejectApproval = useCallback((approvalId: string, approverName: string) => {
    setProcessingApproval(approvalId);
    setTimeout(() => {
      const approval = pendingApprovals.find(a => a.id === approvalId);
      if (approval) {
        setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
        
        // Add to recent activities
        setRecentActivities(prev => [
          {
            id: Math.max(...prev.map(a => a.id), 0) + 1,
            user: 'System',
            action: `rejected ${approval.type.toLowerCase()}`,
            target: `${approval.requester}`,
            time: 'just now',
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100'
          },
          ...prev
        ]);
        
        showToast(`${approval.type} from ${approval.requester} rejected.`, 'error');
      }
      setProcessingApproval(null);
    }, 600);
  }, [pendingApprovals]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
     
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-6 lg:p-8">
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-bold flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-5 ${
              toast.type === 'success' ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-red-600 shadow-lg shadow-red-500/20'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {toast.message}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white">Dashboard Overview</h1>
              <p className="text-slate-400 mt-1">Welcome back, {session.email}. Here&apos;s your team&apos;s performance data.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportData}
                disabled={exportLoading}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export Data'}
              </button>
              <Link 
                href="/manager/team"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                Team View
              </Link>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/manager/jobs" className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Active Jobs</h3>
              <p className="text-2xl font-black text-white mt-2">8</p>
              <p className="text-xs text-slate-400 mt-1">View all jobs</p>
            </Link>

            <Link href="/manager/team" className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-green-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Team Members</h3>
              <p className="text-2xl font-black text-white mt-2">12</p>
              <p className="text-xs text-slate-400 mt-1">View team</p>
            </Link>

            <Link href="/manager/clients" className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-purple-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Active Clients</h3>
              <p className="text-2xl font-black text-white mt-2">5</p>
              <p className="text-xs text-slate-400 mt-1">View clients</p>
            </Link>

            <Link href="/manager/approvals" className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-orange-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Pending Approvals</h3>
              <p className="text-2xl font-black text-white mt-2">3</p>
              <p className="text-xs text-slate-400 mt-1">View approvals</p>
            </Link>

            <Link href="/manager/reports" className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-lg hover:border-pink-500/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Reports</h3>
              <p className="text-2xl font-black text-white mt-2">4</p>
              <p className="text-xs text-slate-400 mt-1">View reports</p>
            </Link>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-slate-600">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-slate-700 text-slate-300 group-hover:scale-110 transition-transform">
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    kpi.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {kpi.change}
                    {kpi.trend === 'up' ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-400">{kpi.title}</h3>
                <p className="text-3xl font-black text-white mt-2">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-white">Job Completion Trend</h3>
                  <p className="text-sm text-slate-400">Monthly job status</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-bold text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    Completed
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-bold text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    In Progress
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-bold text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-slate-500"></div>
                    Planning
                  </div>
                </div>
              </div>
              <div className="h-80 w-full min-h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={teamPerformanceData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                    <Area type="monotone" dataKey="in_progress" stroke="#eab308" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="planning" stroke="#64748b" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-sm">
              <h3 className="text-xl font-black text-white mb-2">Team Status</h3>
              <p className="text-sm text-slate-400 mb-8">Team members by status</p>
              <div className="h-64 w-full min-h-56 relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={teamStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {teamStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white">12</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Team</span>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {teamStatusData.map((status, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                      <span className="text-slate-300">{status.name}</span>
                    </div>
                    <span className="font-bold text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Jobs & Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Jobs */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Active Jobs</h3>
                <Link href="/manager/jobs" className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-slate-700">
                {activeJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-white">{job.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{job.client}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        job.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span className="text-white font-bold">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${job.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 pt-2">
                        <span>Budget: AED {(job.budget / 1000).toFixed(0)}K</span>
                        <span className="text-orange-400">Spent: AED {(job.spent / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Pending Approvals</h3>
                  <p className="text-xs text-slate-400 mt-1">{pendingApprovals.length} awaiting your action</p>
                </div>
                <Link href="/manager/approvals" className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {pendingApprovals.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400 text-sm">All approvals processed!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg ${approval.color}`}>
                          <approval.icon className={`w-5 h-5 ${approval.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-white text-sm">{approval.type}</p>
                              <p className="text-xs text-slate-400 mt-1">{approval.requester}</p>
                              <p className="text-xs text-slate-500 mt-1">{approval.details}</p>
                            </div>
                            {approval.amount && <span className="text-indigo-400 font-bold text-sm">{approval.amount}</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Requested {approval.requestDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                        <button
                          onClick={() => handleApproveApproval(approval.id, session?.email || 'Manager')}
                          disabled={processingApproval === approval.id}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          {processingApproval === approval.id ? (
                            <>
                              <span className="inline-block w-3 h-3 rounded-full border-2 border-transparent border-t-green-300 animate-spin"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectApproval(approval.id, session?.email || 'Manager')}
                          disabled={processingApproval === approval.id}
                          className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-slate-700 disabled:text-slate-500 text-red-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-red-600/30 hover:border-red-600/50"
                        >
                          {processingApproval === approval.id ? (
                            <>
                              <span className="inline-block w-3 h-3 rounded-full border-2 border-transparent border-t-red-300 animate-spin"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-black text-white">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-700">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-slate-700/30 transition-colors flex items-start justify-between group">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${activity.bg}`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-indigo-400 font-bold">{activity.target}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all text-slate-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}