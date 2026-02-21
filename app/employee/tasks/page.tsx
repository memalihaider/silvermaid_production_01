'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  CheckSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Calendar,
  Zap,
  ChevronRight,
  User,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { getSession, type SessionData } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Task {
  id: string;
  title: string;
  jobId: string;
  jobTitle: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
  description: string;
  assignedDate: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToEmail?: string;
  notes?: string;
  progress?: number;
  completed?: boolean;
  duration?: number;
  taskId?: string;
  assignmentId?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function EmployeeTasksPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loggedInEmployee, setLoggedInEmployee] = useState<Employee | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [toast, setToast] = useState<Toast | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Session check and fetch logged-in employee
  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/employee');
      return;
    }
    setSession(storedSession);
    
    // Fetch logged-in employee
    fetchLoggedInEmployee(storedSession);
  }, [router]);

  // Fetch logged-in employee from Firebase
  const fetchLoggedInEmployee = async (sessionData: SessionData) => {
    try {
      console.log('🔍 Fetching logged-in employee for tasks...');
      
      let employeeData: Employee | null = null;
      
      // Try by employeeId first
      if (sessionData.employeeId) {
        const employeeDoc = await getDocs(query(
          collection(db, 'employees'), 
          where('__name__', '==', sessionData.employeeId)
        ));
        
        if (!employeeDoc.empty) {
          const data = employeeDoc.docs[0].data();
          employeeData = {
            id: employeeDoc.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            department: data.department || '',
            position: data.position || ''
          };
          console.log('✅ Found employee by ID:', employeeData.name);
        }
      }
      
      // If not found by ID, try by email
      if (!employeeData && sessionData.user.email) {
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('email', '==', sessionData.user.email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          employeeData = {
            id: snapshot.docs[0].id,
            name: data.name || '',
            email: data.email || '',
            department: data.department || '',
            position: data.position || ''
          };
          console.log('✅ Found employee by email:', employeeData.name);
        }
      }
      
      setLoggedInEmployee(employeeData);
      
      // If employee found, load tasks for them
      if (employeeData) {
        loadTasksForEmployee(employeeData.name, employeeData.email);
      } else {
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Error fetching logged-in employee:', error);
      setLoading(false);
    }
  };

  // Load tasks only for logged-in employee
  const loadTasksForEmployee = (employeeName: string, employeeEmail: string) => {
    console.log('Loading tasks assigned to:', employeeName);
    
    // Task assignments data (from Firebase structure)
    const taskAssignmentsData = [
      {
        assignedAt: "2026-02-09T12:31:30.408Z",
        assignedTo: "aimahhh",
        assignedToEmail: "aimahhh@example.com",
        id: "assignment-0",
        reassignedAt: "2026-02-09T04:31:49.000Z",
        status: "pending",
        taskId: "da7b13jx1",
        taskName: "second task"
      },
      {
        assignedAt: "2026-02-09T12:31:30.408Z",
        assignedTo: "john doe",
        assignedToEmail: "john@example.com",
        id: "assignment-1",
        reassignedAt: "2026-02-09T04:31:50.000Z",
        status: "in-progress",
        taskId: "task-2",
        taskName: "Install electrical system"
      },
      {
        assignedAt: "2026-02-09T12:31:30.408Z",
        assignedTo: "aimahhh",
        assignedToEmail: "aimahhh@example.com",
        id: "assignment-2",
        reassignedAt: "2026-02-09T04:31:51.000Z",
        status: "completed",
        taskId: "task-3",
        taskName: "Paint walls"
      }
    ];

    // All available tasks
    const allTasksData = [
      {
        id: "da7b13jx1",
        title: "second task",
        description: "no",
        duration: 12,
        progress: 100,
        completed: true,
        notes: "",
        teamRequired: 13
      },
      {
        id: "task-2",
        title: "Install electrical system",
        description: "Install complete electrical wiring and fixtures",
        duration: 16,
        progress: 50,
        completed: false,
        notes: "Need to coordinate with plumbing team"
      },
      {
        id: "task-3",
        title: "Paint walls",
        description: "Paint all interior walls with premium paint",
        duration: 20,
        progress: 100,
        completed: true,
        notes: "Completed on time"
      }
    ];

    // Job data
    const jobsData = [
      {
        id: "job-1",
        title: "Second jobs",
        priority: "Medium",
        scheduledDate: "2026-02-10",
        slaDeadline: "2026-02-25"
      },
      {
        id: "job-2",
        title: "Office Renovation",
        priority: "High",
        scheduledDate: "2026-02-15",
        slaDeadline: "2026-02-28"
      }
    ];

    // ✅ Filter assignments for logged-in employee only
    const filteredAssignments = taskAssignmentsData.filter(
      assignment => 
        assignment.assignedTo.toLowerCase() === employeeName.toLowerCase() ||
        assignment.assignedToEmail?.toLowerCase() === employeeEmail.toLowerCase()
    );

    console.log(`✅ Found ${filteredAssignments.length} tasks for ${employeeName}`);

    // Process filtered task assignments
    const processedTasks: Task[] = [];

    filteredAssignments.forEach(assignment => {
      // Find the corresponding task
      const taskData = allTasksData.find(t => t.id === assignment.taskId);
      const jobData = jobsData.find(j => j.id === (assignment.taskId.includes('da7b13jx1') ? 'job-1' : 'job-2'));
      
      if (taskData && jobData) {
        // Determine status
        let status: 'Pending' | 'In Progress' | 'Completed' = 'Pending';
        if (assignment.status === 'completed' || taskData.completed) {
          status = 'Completed';
        } else if (assignment.status === 'in-progress' || (taskData.progress && taskData.progress > 0)) {
          status = 'In Progress';
        }

        // Determine priority
        let priority: 'Low' | 'Medium' | 'High' = 'Medium';
        if (jobData.priority === 'High') {
          priority = 'High';
        } else if (jobData.priority === 'Low') {
          priority = 'Low';
        }

        const task: Task = {
          id: `${assignment.id}-${taskData.id}`,
          taskId: taskData.id,
          assignmentId: assignment.id,
          title: assignment.taskName || taskData.title,
          jobId: jobData.id,
          jobTitle: jobData.title,
          status,
          priority,
          dueDate: jobData.scheduledDate || jobData.slaDeadline,
          estimatedHours: taskData.duration || taskData.teamRequired || 8,
          completedHours: taskData.progress || (taskData.completed ? taskData.duration || 0 : 0),
          description: taskData.description || 'No description',
          assignedDate: assignment.assignedAt,
          assignedTo: assignment.assignedTo,
          assignedToName: assignment.assignedTo,
          assignedToEmail: assignment.assignedToEmail,
          notes: taskData.notes || '',
          progress: taskData.progress || 0,
          completed: taskData.completed || false,
          duration: taskData.duration || 0
        };

        processedTasks.push(task);
      }
    });

    console.log('✅ Tasks loaded for employee:', processedTasks.length);
    setTasks(processedTasks);
    setLoading(false);
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCompleteTask = useCallback((taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'Completed', completedHours: task.estimatedHours }
        : task
    ));
    showToast('Task marked as completed!', 'success');
  }, [tasks, showToast]);

  const handleUpdateProgress = useCallback((taskId: string, hours: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completedHours: Math.min(hours, task.estimatedHours) }
        : task
    ));
    showToast('Task progress updated!', 'success');
  }, [tasks, showToast]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
                           task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    hoursWorked: tasks.reduce((sum, t) => sum + t.completedHours, 0),
    totalHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  }), [tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'Pending': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'In Progress': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'Pending': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-900/20 text-red-300';
      case 'Medium': return 'bg-amber-900/20 text-amber-300';
      case 'Low': return 'bg-green-900/20 text-green-300';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  // Get user initials
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading your tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!loggedInEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
    );
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
                <h1 className="text-2xl font-bold text-white">My Tasks</h1>
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

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg ${
            toast.type === 'success' ? 'bg-green-900 text-green-200' :
            toast.type === 'error' ? 'bg-red-900 text-red-200' :
            'bg-blue-900 text-blue-200'
          } z-50 animate-fade-in max-w-md`}>
            {toast.message}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Welcome, {loggedInEmployee.name}!</h2>
            <p className="text-slate-300">You have {stats.pending} pending tasks and {stats.inProgress} tasks in progress.</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">My Tasks</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">Hours</p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">{stats.hoursWorked}/{stats.totalHours}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by task or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
              >
                <option>All Priority</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          {/* Tasks List - Only logged-in employee's tasks */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all"
                >
                  <div
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-white font-semibold">{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-1 bg-violet-900/30 rounded-lg border border-violet-800">
                            <User className="w-3 h-3 text-violet-400" />
                            <span className="text-xs text-violet-400">You</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {task.jobTitle}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {task.completedHours}/{task.estimatedHours} hours
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Assigned: {new Date(task.assignedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-500 ml-2 transition-transform ${expandedTask === task.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTask === task.id && (
                    <div className="border-t border-slate-700 p-4 bg-slate-700/30 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Task Description</h4>
                          <p className="text-slate-300 text-sm">{task.description}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <h4 className="font-semibold text-white mb-2">Job Details</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-300">
                              <span className="text-slate-400">Job:</span> {task.jobTitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-3">Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Hours Completed</span>
                            <span className="text-white font-semibold">{task.completedHours}/{task.estimatedHours} hrs</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-violet-500 h-2 rounded-full"
                              style={{ width: `${(task.completedHours / task.estimatedHours) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <input
                              type="number"
                              min="0"
                              max={task.estimatedHours}
                              value={task.completedHours}
                              onChange={(e) => handleUpdateProgress(task.id, parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                            />
                            <span className="text-slate-400 text-sm">/ {task.estimatedHours} hours</span>
                          </div>
                        </div>
                      </div>

                      {task.notes && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Notes</h4>
                          <p className="text-slate-300 text-sm">{task.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
              <CheckSquare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg">No tasks found</p>
              <p className="text-sm text-slate-500 mt-2">You don't have any assigned tasks yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}