'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  CreditCard,
  Briefcase,
  Send,
  Bell,
  ChevronDown,
  LogOut,
  CheckSquare
} from 'lucide-react';
import { useState } from 'react';
import { clearSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  session?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const sidebarItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/employee/dashboard' },
  { id: 'Salary', name: 'My Salary', icon: User, href: '/employee/payslips' },
  { id: 'attendance', name: 'Attendance', icon: Clock, href: '/employee/attendance' },
  { id: 'leave', name: 'Leave', icon: Calendar, href: '/employee/leave' },
   { id: 'chat', name: 'Chat bot', icon: Calendar, href: '/employee/chat' },
  
  { id: 'jobs', name: 'My Jobs', icon: Briefcase, href: '/employee/jobs' },
  { id: 'tasks', name: 'My Tasks', icon: CheckSquare, href: '/employee/tasks' },
  { id: 'requests', name: 'Requests', icon: Send, href: '/employee/requests' },
  
];

export function EmployeeSidebar({ session, open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => onOpenChange?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur border-r border-violet-800 transform transition-transform duration-200 ease-in-out z-50 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-violet-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Employee Portal</h1>
                <p className="text-xs text-violet-300">Silver Maid</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onOpenChange?.(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-500'
                      : 'text-violet-100 hover:bg-violet-900/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-violet-800">
            <div className="relative">
              <button
                onClick={() => setShowLogout(!showLogout)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-violet-100 hover:bg-violet-900/50 hover:text-white transition-all"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">Profile</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLogout ? 'rotate-180' : ''}`} />
              </button>

              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
