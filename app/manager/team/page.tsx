'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ManagerSidebar } from '../_components/sidebar';
import { getSession, clearSession, type SessionData } from '@/lib/auth';
import { Users, Mail, Phone, Briefcase, Clock, AlertCircle, UserPlus, MoreVertical, Badge, Menu, X } from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Ahmed Hassan', role: 'Senior Technician', email: 'ahmed.hassan@silvermaid.ae', phone: '+971501234567', department: 'Operations', status: 'active', joinDate: '2023-06-15', currentJob: 'JOB-2024-001', hoursWorked: 168 },
  { id: '2', name: 'Sara Al Maktoum', role: 'Project Coordinator', email: 'sara.almaktoum@silvermaid.ae', phone: '+971501234568', department: 'Projects', status: 'active', joinDate: '2023-08-20', currentJob: 'JOB-2024-002', hoursWorked: 156 },
  { id: '3', name: 'Mohammed Ali', role: 'Technician', email: 'mohammed.ali@silvermaid.ae', phone: '+971501234569', department: 'Operations', status: 'active', joinDate: '2023-09-01', currentJob: 'JOB-2024-001', hoursWorked: 172 },
  { id: '4', name: 'Fatima Khalid', role: 'Quality Inspector', email: 'fatima.khalid@silvermaid.ae', phone: '+971501234570', department: 'Quality', status: 'on-leave', joinDate: '2023-07-10', currentJob: null, hoursWorked: 140 },
  { id: '5', name: 'Omar Rashid', role: 'Field Engineer', email: 'omar.rashid@silvermaid.ae', phone: '+971501234571', department: 'Operations', status: 'active', joinDate: '2023-10-05', currentJob: 'JOB-2024-004', hoursWorked: 168 },
  { id: '6', name: 'Layla Mansour', role: 'Safety Officer', email: 'layla.mansour@silvermaid.ae', phone: '+971501234572', department: 'Safety', status: 'active', joinDate: '2023-11-01', currentJob: null, hoursWorked: 160 },
];

export default function TeamManagement() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<typeof teamMembers[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'on-leave'>('all');

  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/manager');
      return;
    }
    setSession(storedSession);
  }, [router]);

  const filteredMembers = teamMembers.filter(m => filterStatus === 'all' || m.status === filterStatus);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <ManagerSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Team Management</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and monitor your team members</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Members</p>
                  <p className="text-2xl font-bold text-white mt-1">{teamMembers.length}</p>
                </div>
                <Users className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Today</p>
                  <p className="text-2xl font-bold text-white mt-1">{teamMembers.filter(m => m.status === 'active').length}</p>
                </div>
                <Badge className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">On Leave</p>
                  <p className="text-2xl font-bold text-white mt-1">{teamMembers.filter(m => m.status === 'on-leave').length}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-400" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Hours/Week</p>
                  <p className="text-2xl font-bold text-white mt-1">162</p>
                </div>
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {['all', 'active', 'on-leave'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-slate-400">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        member.status === 'active' ? 'bg-green-400' : 'bg-orange-400'
                      }`}
                    ></span>
                    <span className="text-xs text-slate-400 capitalize">{member.status}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>{member.currentJob || 'No active job'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeamMember(member)}
                  className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTeamMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full border border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedTeamMember.name}</h2>
                <p className="text-sm text-slate-400">{selectedTeamMember.role}</p>
              </div>
              <button
                onClick={() => setSelectedTeamMember(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Email</p>
                <p className="text-white">{selectedTeamMember.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="text-white">{selectedTeamMember.phone}</p>
              </div>
              <div>
                <p className="text-slate-400">Department</p>
                <p className="text-white">{selectedTeamMember.department}</p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <p className="text-white capitalize">{selectedTeamMember.status}</p>
              </div>
              <div>
                <p className="text-slate-400">Join Date</p>
                <p className="text-white">{new Date(selectedTeamMember.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Hours Worked This Month</p>
                <p className="text-white">{selectedTeamMember.hoursWorked}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSelectedTeamMember(null)}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
              >
                Message
              </button>
              <button
                onClick={() => setSelectedTeamMember(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}