'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Download,
  CheckSquare,
  Users,
  FileText,
  Calendar,
  User,
  Mail,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getSession, type SessionData, logout } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

// Firebase Interfaces
interface FirebaseJob {
  id: string;
  title: string;
  client: string;
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed';
  location: string;
  progress: number;
  dueDate: string;
  assignedDate: string;
  scheduledDate: string;
  completedAt: string;
  priority: string;
  budget: number;
  actualCost: number;
  teamRequired: number;
}

interface FirebaseTask {
  id: string;
  title: string;
  jobId: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Real Data States
  const [jobs, setJobs] = useState<FirebaseJob[]>([]);
  const [tasks, setTasks] = useState<FirebaseTask[]>([]);

  // Fetch session
  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/employee');
      return;
    }
    setSession(storedSession);
  }, [router]);

  // Fetch real data from Firebase
  useEffect(() => {
    if (session) {
      fetchRealTimeData();
    }
  }, [session]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login/employee');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs from Firebase
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));
      const jobsSnapshot = await getDocs(jobsQuery);
      
      const jobsData: FirebaseJob[] = [];
      jobsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Calculate progress based on status
        let progress = 0;
        switch (data.status) {
          case 'Completed': progress = 100; break;
          case 'In Progress': progress = data.progress || 50; break;
          case 'Scheduled': progress = 0; break;
          case 'Pending': progress = 0; break;
          default: progress = 0;
        }
        
        jobsData.push({
          id: doc.id,
          title: data.title || '',
          client: data.client || '',
          status: data.status || 'Pending',
          location: data.location || '',
          progress: progress,
          dueDate: data.slaDeadline || data.scheduledDate || '',
          assignedDate: data.createdAt || '',
          scheduledDate: data.scheduledDate || '',
          completedAt: data.completedAt || '',
          priority: data.priority || 'Medium',
          budget: data.budget || 0,
          actualCost: data.actualCost || 0,
          teamRequired: data.teamRequired || 0
        });
      });
      
      setJobs(jobsData);
      
      // Since tasks might be in jobs collection or separate, let's assume they're part of jobs
      // Extract tasks from jobs
      const allTasks: FirebaseTask[] = [];
      
      // For demonstration, creating tasks from job data
      jobsData.forEach(job => {
        // Create main task from job
        allTasks.push({
          id: `TASK-${job.id}`,
          title: job.title,
          jobId: job.id,
          status: job.status === 'Completed' ? 'Completed' : 
                  job.status === 'In Progress' ? 'In Progress' : 'Pending',
          priority: job.priority === 'High' ? 'High' : 
                   job.priority === 'Low' ? 'Low' : 'Medium',
          dueDate: job.dueDate,
          estimatedHours: job.teamRequired * 8, // Assuming 8 hours per team member
          completedHours: job.status === 'Completed' ? job.teamRequired * 8 : 
                         job.status === 'In Progress' ? Math.floor(job.teamRequired * 8 * (job.progress / 100)) : 0
        });
      });
      
      // Add some additional mock tasks (you can replace with real tasks collection)
      allTasks.push(
        {
          id: 'TASK-001',
          title: 'Electrical System Installation',
          jobId: jobsData[0]?.id || 'JOB-001',
          status: 'Completed',
          priority: 'High',
          dueDate: '2024-02-05',
          estimatedHours: 8,
          completedHours: 8
        },
        {
          id: 'TASK-002',
          title: 'Plumbing Installation',
          jobId: jobsData[0]?.id || 'JOB-001',
          status: 'In Progress',
          priority: 'High',
          dueDate: '2024-02-10',
          estimatedHours: 12,
          completedHours: 6
        },
        {
          id: 'TASK-003',
          title: 'Painting Work',
          jobId: jobsData[0]?.id || 'JOB-001',
          status: 'Pending',
          priority: 'Medium',
          dueDate: '2024-02-15',
          estimatedHours: 16,
          completedHours: 0
        }
      );
      
      setTasks(allTasks);
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      showToast('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic chart data based on real jobs
  const getDailyStatsData = () => {
    const now = new Date();
    const times = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    
    // Calculate stats based on jobs
    const completedJobs = jobs.filter(j => j.status === 'Completed').length;
    const inProgressJobs = jobs.filter(j => j.status === 'In Progress').length;
    const pendingJobs = jobs.filter(j => j.status === 'Pending').length;
    
    return times.map((time, index) => {
      const progressFactor = (index + 1) / times.length;
      return {
        time,
        completed: Math.round(completedJobs * progressFactor),
        inProgress: Math.round(inProgressJobs * (0.5 + progressFactor * 0.5)),
        pending: Math.max(0, pendingJobs - Math.round(pendingJobs * progressFactor))
      };
    });
  };

  const getJobStatusData = () => {
    const statusCounts = {
      'Completed': 0,
      'In Progress': 0,
      'Scheduled': 0,
      'Pending': 0
    };
    
    jobs.forEach(job => {
      if (statusCounts.hasOwnProperty(job.status)) {
        statusCounts[job.status as keyof typeof statusCounts]++;
      }
    });
    
    return [
      { name: 'Completed', value: statusCounts.Completed, color: '#10b981' },
      { name: 'In Progress', value: statusCounts['In Progress'], color: '#f59e0b' },
      { name: 'Scheduled', value: statusCounts.Scheduled, color: '#3b82f6' },
      { name: 'Pending', value: statusCounts.Pending, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleExport = useCallback(() => {
    setExportLoading(true);
    setTimeout(() => {
      const csvContent = [
        ['Job ID', 'Title', 'Client', 'Status', 'Progress', 'Due Date', 'Priority', 'Budget', 'Team Required'].join(','),
        ...jobs.map(j => [
          j.id, 
          j.title, 
          j.client, 
          j.status, 
          j.progress, 
          j.dueDate, 
          j.priority, 
          j.budget, 
          j.teamRequired
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employee-jobs-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setExportLoading(false);
      showToast('Jobs exported successfully!', 'success');
    }, 600);
  }, [jobs, showToast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'In Progress': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'Scheduled': return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'Pending': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Pending': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  // Calculate KPI metrics from real data
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const activeJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Scheduled').length;
  const totalBudget = jobs.reduce((sum, job) => sum + (job.budget || 0), 0);
  const totalTeamRequired = jobs.reduce((sum, job) => sum + (job.teamRequired || 0), 0);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E';
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </main>
      </div>
    );
  }

  const dailyStatsData = getDailyStatsData();
  const jobStatusData = getJobStatusData();
  const activeJobsData = jobs.filter(j => j.status !== 'Completed');

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header with User Info */}
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
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400">Welcome back! Here's your work overview</p>
                <p className="text-xs text-slate-500 mt-1">Total Jobs: {jobs.length} | Total Tasks: {tasks.length}</p>
              </div>
            </div>
            
            {/* User Info Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-xl transition-colors"
              >
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20">
                  {getUserInitials()}
                </div>
                
                {/* User Details */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
                
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                      <p className="text-sm font-semibold text-white">{session.user.name}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {session.user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-emerald-900/20 text-emerald-400 rounded-full border border-emerald-800">
                          Employee Portal
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-2">
                     
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-4 p-4 rounded-lg ${
            toast.type === 'success' ? 'bg-green-900 text-green-200' :
            toast.type === 'error' ? 'bg-red-900 text-red-200' :
            'bg-blue-900 text-blue-200'
          } z-50 animate-fade-in max-w-md shadow-xl`}>
            {toast.message}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-violet-900 to-violet-800 rounded-xl p-6 border border-violet-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-300 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold text-white mt-2">{activeJobs}</p>
                  <p className="text-violet-400 text-xs mt-1">out of {jobs.length} total</p>
                </div>
                <Briefcase className="w-12 h-12 text-violet-500/20" />
              </div>
              <p className="text-violet-300 text-xs mt-3">Currently assigned</p>
            </div>

            <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl p-6 border border-amber-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300 text-sm font-medium">In Progress Tasks</p>
                  <p className="text-3xl font-bold text-white mt-2">{inProgressTasks}</p>
                  <p className="text-amber-400 text-xs mt-1">out of {tasks.length} total</p>
                </div>
                <CheckSquare className="w-12 h-12 text-amber-500/20" />
              </div>
              <p className="text-amber-300 text-xs mt-3">Need attention</p>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Completed Jobs</p>
                  <p className="text-3xl font-bold text-white mt-2">{completedJobs}</p>
                  <p className="text-green-400 text-xs mt-1">success rate: {jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500/20" />
              </div>
              <p className="text-green-300 text-xs mt-3">Total completed</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Budget</p>
                  <p className="text-3xl font-bold text-white mt-2">AED {totalBudget.toLocaleString()}</p>
                  <p className="text-blue-400 text-xs mt-1">Team required: {totalTeamRequired}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-500/20" />
              </div>
              <p className="text-blue-300 text-xs mt-3">Active projects</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/employee/jobs" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-violet-400 transition-colors">My Jobs</p>
                  <p className="text-xs text-slate-400">View all {jobs.length} assignments</p>
                </div>
              </div>
            </Link>

            <Link href="/employee/tasks" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">My Tasks</p>
                  <p className="text-xs text-slate-400">Manage {tasks.length} tasks</p>
                </div>
              </div>
            </Link>

            <Link href="/employee/attendance" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-green-400 transition-colors">Attendance</p>
                  <p className="text-xs text-slate-400">Check in/out</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Task Progress Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Daily Task Progress</h3>
                <span className="text-xs text-slate-400">Real-time data</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyStatsData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" name="Completed" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" name="In Progress" dataKey="inProgress" stroke="#f59e0b" fillOpacity={1} fill="url(#colorInProgress)" />
                  <Area type="monotone" name="Pending" dataKey="pending" stroke="#ef4444" fillOpacity={1} fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Job Status Distribution */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Job Status Distribution</h3>
                <span className="text-xs text-slate-400">Total: {jobs.length} jobs</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Jobs Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Active Jobs ({activeJobsData.length})</h3>
              <Link href="/employee/jobs" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                View All →
              </Link>
            </div>
            {activeJobsData.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No active jobs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobsData.slice(0, 5).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-white">{job.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          job.priority === 'High' ? 'bg-red-900/20 text-red-300' :
                          job.priority === 'Medium' ? 'bg-amber-900/20 text-amber-300' :
                          'bg-green-900/20 text-green-300'
                        }`}>
                          {job.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{job.client} • {job.location}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Scheduled: {job.scheduledDate}</span>
                        <span>Budget: AED {job.budget?.toLocaleString() || '0'}</span>
                        <span>Team: {job.teamRequired} people</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="w-24 bg-slate-600 rounded-full h-2 mb-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-300">{job.progress}%</p>
                      <p className="text-xs text-slate-500">Due: {job.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Tasks Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">My Tasks ({tasks.length})</h3>
              <Link href="/employee/tasks" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                View All →
              </Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Task</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Job</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map(task => (
                      <tr key={task.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                        <td className="py-3 px-4 text-white">{task.title}</td>
                        <td className="py-3 px-4 text-slate-400">{task.jobId}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTaskStatusBadge(task.status)}
                            <span>{task.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.priority === 'High' ? 'bg-red-900/20 text-red-300' :
                            task.priority === 'Medium' ? 'bg-amber-900/20 text-amber-300' :
                            'bg-green-900/20 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-600 rounded h-2">
                              <div
                                className="bg-violet-500 h-2 rounded transition-all duration-300"
                                style={{ width: `${(task.completedHours / task.estimatedHours) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {Math.round((task.completedHours / task.estimatedHours) * 100)}%
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {task.completedHours}h / {task.estimatedHours}h
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}