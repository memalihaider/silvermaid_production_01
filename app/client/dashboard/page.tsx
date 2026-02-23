'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Briefcase,
  FileText,
  ClipboardList,
  MessageSquare,
  Headphones,
  Settings,
  LogOut,
  Bell,
  Menu,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Star,
  Building,
  Plus
} from 'lucide-react';
import { getSession, clearSession, type SessionData } from '@/lib/auth';

// Mock data for client dashboard
const clientInfo = {
  company: 'Al Futtaim Group',
  accountManager: 'Ahmed Al Rashid',
  contractStart: '2022-01-15',
  contractEnd: '2025-01-15',
  clientId: 'CLT-001234'
};

const accountSummary = {
  activeJobs: 3,
  completedJobs: 45,
  pendingQuotations: 2,
  outstandingInvoices: 1,
  totalSpent: 'AED 1,250,000'
};

const activeJobs = [
  { id: 'JOB-2024-001', title: 'Office Renovation Phase 2', status: 'in-progress', progress: 65, startDate: '2024-01-15', estimatedEnd: '2024-02-15', technicians: 4 },
  { id: 'JOB-2024-008', title: 'HVAC System Upgrade', status: 'in-progress', progress: 30, startDate: '2024-01-28', estimatedEnd: '2024-02-28', technicians: 2 },
  { id: 'JOB-2024-012', title: 'Electrical Inspection', status: 'scheduled', progress: 0, startDate: '2024-02-05', estimatedEnd: '2024-02-06', technicians: 2 },
];

const recentInvoices = [
  { id: 'INV-2024-001', description: 'Annual Maintenance Contract', amount: 'AED 45,000', status: 'paid', dueDate: '2024-01-31', paidDate: '2024-01-28' },
  { id: 'INV-2024-002', description: 'Office Renovation - Phase 1', amount: 'AED 125,000', status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-12' },
  { id: 'INV-2024-003', description: 'HVAC Upgrade - Deposit', amount: 'AED 35,000', status: 'pending', dueDate: '2024-02-15', paidDate: null },
];

const pendingQuotations = [
  { id: 'QT-2024-005', title: 'New Branch Setup - Media City', amount: 'AED 180,000', submitted: '2024-01-25', validUntil: '2024-02-25' },
  { id: 'QT-2024-006', title: 'Security System Installation', amount: 'AED 75,000', submitted: '2024-01-28', validUntil: '2024-02-28' },
];

const recentActivity = [
  { id: '1', type: 'job-update', message: 'JOB-2024-001 progress updated to 65%', time: '2 hours ago' },
  { id: '2', type: 'invoice', message: 'Invoice INV-2024-001 marked as paid', time: '1 day ago' },
  { id: '3', type: 'quotation', message: 'New quotation QT-2024-006 received', time: '2 days ago' },
  { id: '4', type: 'job-complete', message: 'JOB-2024-007 completed successfully', time: '3 days ago' },
];

const supportTickets = [
  { id: 'TKT-001', subject: 'Request for additional technician', status: 'open', priority: 'medium', created: '2024-01-29' },
];

const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/client/dashboard' },
  { id: 'services', name: 'Services', icon: Package, href: '/client/services' },
  { id: 'jobs', name: 'My Jobs', icon: Briefcase, href: '/client/jobs' },
  { id: 'invoices', name: 'Invoices', icon: FileText, href: '/client/invoices' },
  { id: 'quotations', name: 'Quotations', icon: ClipboardList, href: '/client/quotations' },
  { id: 'feedback', name: 'Feedback', icon: MessageSquare, href: '/client/feedback' },
  { id: 'support', name: 'Support', icon: Headphones, href: '/client/support' },
  { id: 'account', name: 'Account', icon: Settings, href: '/client/account' },
];

export default function ClientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/client');
      return;
    }
    setSession(storedSession);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Client Portal</h1>
                <p className="text-xs text-slate-400">Silver Maid</p>
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="p-4 border-b border-slate-700 bg-green-500/5">
            <p className="text-sm font-medium text-white">{clientInfo.company}</p>
            <p className="text-xs text-slate-400">{clientInfo.clientId}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'dashboard';
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                  {item.id === 'quotations' && pendingQuotations.length > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingQuotations.length}
                    </span>
                  )}
                  {item.id === 'support' && supportTickets.length > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {supportTickets.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-semibold">
                {session.user.name?.split(' ').map(n => n[0]).join('') || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Welcome, {session.user.name?.split(' ')[0] || 'Client'}</h1>
                <p className="text-sm text-slate-400">Account Manager: {clientInfo.accountManager}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Request Service
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">Active Jobs</span>
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{accountSummary.activeJobs}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">Completed</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{accountSummary.completedJobs}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">Quotations</span>
                <ClipboardList className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">{accountSummary.pendingQuotations}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-xs">Due Invoices</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{accountSummary.outstandingInvoices}</p>
            </div>
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 text-xs">Total Spent</span>
                <CreditCard className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xl font-bold text-white">{accountSummary.totalSpent}</p>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active Jobs</h2>
              <Link href="/client/jobs" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">{job.title}</p>
                      <p className="text-xs text-slate-400">{job.id}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {job.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="bg-slate-600/50 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${job.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Est. Completion: {job.estimatedEnd}
                    </span>
                    <span>{job.technicians} technicians assigned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Quotations */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Pending Quotations</h2>
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingQuotations.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {pendingQuotations.map((quote) => (
                  <div key={quote.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{quote.title}</p>
                        <p className="text-xs text-slate-400">{quote.id}</p>
                      </div>
                      <p className="text-sm font-semibold text-green-400">{quote.amount}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span>Submitted: {quote.submitted}</span>
                      <span>Valid until: {quote.validUntil}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors">
                        Accept
                      </button>
                      <button className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Recent Invoices</h2>
                <Link href="/client/invoices" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1">
                  View all <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      invoice.status === 'paid' ? 'bg-green-500/20' : 'bg-amber-500/20'
                    }`}>
                      <FileText className={`w-5 h-5 ${invoice.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{invoice.description}</p>
                      <p className="text-xs text-slate-400">{invoice.id} • Due: {invoice.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{invoice.amount}</p>
                      <span className={`text-xs ${invoice.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="p-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'job-update' ? 'bg-blue-400' :
                      activity.type === 'invoice' ? 'bg-green-400' :
                      activity.type === 'quotation' ? 'bg-amber-400' : 'bg-purple-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}