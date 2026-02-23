'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit2
} from 'lucide-react';
import { getSession, type SessionData } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';

interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  employeeId: string;
  manager: string;
  location: string;
  address: string;
  bankAccount: string;
  iban: string;
  emergencyContact: string;
  emergencyPhone: string;
  salaryGrade: string;
}

const mockProfileData: EmployeeProfile = {
  id: 'EMP-001',
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@silvermaid.ae',
  phone: '+971-50-1234567',
  position: 'Senior Field Technician',
  department: 'Technical Services',
  joinDate: '2022-03-15',
  employeeId: 'EMP-001234',
  manager: 'Omar Al Rashid',
  location: 'Dubai',
  address: '123 Sheikh Zayed Road, Dubai, UAE',
  bankAccount: '123456789',
  iban: 'AE45 0001 0000 0001 2345 67890',
  emergencyContact: 'Fatima Hassan',
  emergencyPhone: '+971-50-9876543',
  salaryGrade: 'Grade B'
};

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<EmployeeProfile>(mockProfileData);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/employee');
      return;
    }
    setSession(storedSession);
  }, [router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
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
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-sm text-slate-400">View and manage your personal information</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto space-y-6">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-violet-900 to-violet-800 border border-violet-700 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-violet-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <p className="text-violet-200">{profile.position}</p>
                <p className="text-violet-200 text-sm">ID: {profile.employeeId}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <p className="text-white font-medium mt-2">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Email</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-5 h-5 text-violet-400" />
                    <p className="text-white">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Phone</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-5 h-5 text-violet-400" />
                    <p className="text-white">{profile.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Location</label>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-5 h-5 text-violet-400" />
                    <p className="text-white">{profile.location}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Address</label>
                  <p className="text-white mt-2">{profile.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Employment Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-400">Position</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase className="w-5 h-5 text-violet-400" />
                    <p className="text-white">{profile.position}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Department</label>
                  <p className="text-white mt-2">{profile.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Join Date</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <p className="text-white">{new Date(profile.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Salary Grade</label>
                  <p className="text-white mt-2">{profile.salaryGrade}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Manager</label>
                  <p className="text-white mt-2">{profile.manager}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Emergency Contact</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-400">Contact Name</label>
                  <p className="text-white mt-2">{profile.emergencyContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Phone Number</label>
                  <p className="text-white mt-2">{profile.emergencyPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Bank Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-400">Bank Account</label>
                  <p className="text-white mt-2 font-mono">{profile.bankAccount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">IBAN</label>
                  <p className="text-white mt-2 font-mono text-sm">{profile.iban}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Documents</h3>
            </div>
            <div className="p-6 space-y-3">
              <a href="#" className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group">
                <span className="text-white font-medium">Passport Copy</span>
                <span className="text-slate-400 group-hover:text-violet-400 transition-colors">Download →</span>
              </a>
              <a href="#" className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group">
                <span className="text-white font-medium">Employment Contract</span>
                <span className="text-slate-400 group-hover:text-violet-400 transition-colors">Download →</span>
              </a>
              <a href="#" className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group">
                <span className="text-white font-medium">Insurance Certificate</span>
                <span className="text-slate-400 group-hover:text-violet-400 transition-colors">Download →</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}