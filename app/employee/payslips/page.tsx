'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, X, User, Mail, Phone, Calendar, Globe, CreditCard, 
  Shield, Briefcase, Award, PhoneCall, MapPin, File, 
  Building, DollarSign, Eye, EyeOff, Edit2, Save, LogOut,
  ChevronRight, Home, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { getSession, type SessionData, logout } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  department: string;
  status: string;
  supervisor: string;
  dateOfBirth: string;
  nationality: string;
  emiratesIdNumber: string;
  passportNumber: string;
  bankName: string;
  bankAccount: string;
  joinDate: string;
  salary: number;
  salaryStructure: string;
  rating: number;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  visaNumber: string;
  visaExpiryDate: string;
  documents: Array<any>;
  createdAt: string;
  lastUpdated: string;
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'employment' | 'financial' | 'documents'>('personal');

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E';
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-800';
      case 'On Leave': return 'bg-yellow-500/20 text-yellow-400 border-yellow-800';
      case 'Inactive': return 'bg-red-500/20 text-red-400 border-red-800';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  // Handle input change
  const handleInputChange = (field: keyof Employee, value: any) => {
    setEditedEmployee(prev => ({ ...prev, [field]: value }));
  };

  // Save changes
  const handleSave = async () => {
    if (!employee || !session) return;
    
    try {
      const employeeRef = doc(db, 'employees', employee.id);
      await updateDoc(employeeRef, {
        ...editedEmployee,
        lastUpdated: new Date().toISOString()
      });
      
      setEmployee(prev => prev ? { ...prev, ...editedEmployee, lastUpdated: new Date().toISOString() } : null);
      setEditMode(false);
      setEditedEmployee({});
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login/employee');
  };

  // Fetch session and employee data
  useEffect(() => {
    const storedSession = getSession();
    if (!storedSession) {
      router.push('/login/employee');
      return;
    }
    setSession(storedSession);
    
    // Fetch employee by ID from session
    if (storedSession.employeeId) {
      fetchEmployeeById(storedSession.employeeId);
    } else if (storedSession.user.email) {
      fetchEmployeeByEmail(storedSession.user.email);
    }
  }, [router]);

  const fetchEmployeeById = async (employeeId: string) => {
    try {
      console.log('🔍 Fetching employee with ID:', employeeId);
      
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, where('__name__', '==', employeeId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const employeeData = {
          id: doc.id,
          ...doc.data()
        } as Employee;
        
        console.log('✅ Employee found:', employeeData.name);
        setEmployee(employeeData);
        setEditedEmployee(employeeData);
      } else {
        console.log('❌ No employee found with ID:', employeeId);
        setEmployee(null);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setEmployee(null);
    }
  };

  const fetchEmployeeByEmail = async (email: string | null) => {
    if (!email) return;
    
    try {
      console.log('🔍 Fetching employee with email:', email);
      
      const employeesRef = collection(db, 'employees');
      const q = query(employeesRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const employeeData = {
          id: doc.id,
          ...doc.data()
        } as Employee;
        
        console.log('✅ Employee found by email:', employeeData.name);
        setEmployee(employeeData);
        setEditedEmployee(employeeData);
      } else {
        console.log('❌ No employee found with email:', email);
        setEmployee(null);
      }
    } catch (error) {
      console.error('Error fetching employee by email:', error);
      setEmployee(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-slate-400 mb-6">No employee profile linked to your account.</p>
            <button
              onClick={handleLogout}
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
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Home className="w-4 h-4 text-violet-400" />
                  {employee.department} • {employee.position}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedEmployee(employee);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                  <span className="text-4xl font-bold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-slate-900 ${
                  employee.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'
                }`} />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{employee.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail className="w-4 h-4 text-violet-400" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone className="w-4 h-4 text-violet-400" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Joined {formatDate(employee.joinDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-700">
            <div className="flex gap-4 overflow-x-auto">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'employment', label: 'Employment', icon: Briefcase },
                { id: 'financial', label: 'Financial', icon: DollarSign },
                { id: 'documents', label: 'Documents', icon: File }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-violet-500 text-violet-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-400" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Full Name"
                    value={employee.name}
                    icon={<User className="w-4 h-4" />}
                    editMode={editMode}
                    field="name"
                    editedValue={editedEmployee.name}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Email"
                    value={employee.email}
                    icon={<Mail className="w-4 h-4" />}
                    editMode={editMode}
                    field="email"
                    editedValue={editedEmployee.email}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Phone"
                    value={employee.phone}
                    icon={<Phone className="w-4 h-4" />}
                    editMode={editMode}
                    field="phone"
                    editedValue={editedEmployee.phone}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Date of Birth"
                    value={formatDate(employee.dateOfBirth)}
                    icon={<Calendar className="w-4 h-4" />}
                    editMode={editMode}
                    field="dateOfBirth"
                    editedValue={editedEmployee.dateOfBirth}
                    onChange={handleInputChange}
                    type="date"
                  />
                  
                  <ProfileField
                    label="Nationality"
                    value={employee.nationality}
                    icon={<Globe className="w-4 h-4" />}
                    editMode={editMode}
                    field="nationality"
                    editedValue={editedEmployee.nationality}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Emirates ID"
                    value={employee.emiratesIdNumber}
                    icon={<CreditCard className="w-4 h-4" />}
                    editMode={editMode}
                    field="emiratesIdNumber"
                    editedValue={editedEmployee.emiratesIdNumber}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Passport Number"
                    value={employee.passportNumber}
                    icon={<File className="w-4 h-4" />}
                    editMode={editMode}
                    field="passportNumber"
                    editedValue={editedEmployee.passportNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-violet-400" />
                  Employment Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Department"
                    value={employee.department}
                    icon={<Building className="w-4 h-4" />}
                    editMode={editMode}
                    field="department"
                    editedValue={editedEmployee.department}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Position"
                    value={employee.position}
                    icon={<Award className="w-4 h-4" />}
                    editMode={editMode}
                    field="position"
                    editedValue={editedEmployee.position}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Role"
                    value={employee.role}
                    icon={<User className="w-4 h-4" />}
                    editMode={editMode}
                    field="role"
                    editedValue={editedEmployee.role}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Supervisor"
                    value={employee.supervisor}
                    icon={<User className="w-4 h-4" />}
                    editMode={editMode}
                    field="supervisor"
                    editedValue={editedEmployee.supervisor}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Join Date"
                    value={formatDate(employee.joinDate)}
                    icon={<Calendar className="w-4 h-4" />}
                    editMode={editMode}
                    field="joinDate"
                    editedValue={editedEmployee.joinDate}
                    onChange={handleInputChange}
                    type="date"
                  />
                  
                  <ProfileField
                    label="Rating"
                    value={employee.rating?.toString() || 'N/A'}
                    icon={<Award className="w-4 h-4" />}
                    editMode={editMode}
                    field="rating"
                    editedValue={editedEmployee.rating}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-violet-400" />
                  Financial Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileField
                    label="Salary"
                    value={formatCurrency(employee.salary)}
                    icon={<DollarSign className="w-4 h-4" />}
                    editMode={editMode}
                    field="salary"
                    editedValue={editedEmployee.salary}
                    onChange={handleInputChange}
                    type="number"
                  />
                  
                  <ProfileField
                    label="Salary Structure"
                    value={employee.salaryStructure}
                    icon={<File className="w-4 h-4" />}
                    editMode={editMode}
                    field="salaryStructure"
                    editedValue={editedEmployee.salaryStructure}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Bank Name"
                    value={employee.bankName}
                    icon={<Building className="w-4 h-4" />}
                    editMode={editMode}
                    field="bankName"
                    editedValue={editedEmployee.bankName}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Bank Account"
                    value={employee.bankAccount}
                    icon={<CreditCard className="w-4 h-4" />}
                    editMode={editMode}
                    field="bankAccount"
                    editedValue={editedEmployee.bankAccount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-violet-400" />
                    Visa Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField
                      label="Visa Number"
                      value={employee.visaNumber}
                      icon={<File className="w-4 h-4" />}
                      editMode={editMode}
                      field="visaNumber"
                      editedValue={editedEmployee.visaNumber}
                      onChange={handleInputChange}
                    />
                    
                    <ProfileField
                      label="Visa Expiry"
                      value={formatDate(employee.visaExpiryDate)}
                      icon={<Calendar className="w-4 h-4" />}
                      editMode={editMode}
                      field="visaExpiryDate"
                      editedValue={editedEmployee.visaExpiryDate}
                      onChange={handleInputChange}
                      type="date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <File className="w-5 h-5 text-violet-400" />
                  Uploaded Documents
                </h3>
                
                {employee.documents && employee.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.documents.map((doc, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-violet-400" />
                            <div>
                              <p className="font-medium text-white">{doc.name}</p>
                              <p className="text-xs text-slate-400">{doc.fileName}</p>
                            </div>
                          </div>
                          <button className="text-violet-400 hover:text-violet-300">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-slate-500">
                          <span>Uploaded: {doc.uploadDate}</span>
                          <span>Valid: {doc.validDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No documents uploaded yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <PhoneCall className="w-5 h-5 text-violet-400" />
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Contact Person</p>
                <p className="text-white font-medium">{employee.emergencyContact || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Phone</p>
                <p className="text-white font-medium">{employee.emergencyPhone || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Relation</p>
                <p className="text-white font-medium">{employee.emergencyRelation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Component for Profile Fields
function ProfileField({ 
  label, 
  value, 
  icon, 
  editMode, 
  field, 
  editedValue, 
  onChange,
  type = 'text'
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  editMode: boolean;
  field: keyof Employee;
  editedValue: any;
  onChange: (field: keyof Employee, value: any) => void;
  type?: string;
}) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      {editMode ? (
        type === 'date' ? (
          <input
            type="date"
            value={editedValue?.[field] || ''}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full bg-transparent text-white font-medium border-b border-slate-600 focus:border-violet-500 outline-none py-1"
          />
        ) : type === 'number' ? (
          <input
            type="number"
            value={editedValue?.[field] || ''}
            onChange={(e) => onChange(field, parseFloat(e.target.value))}
            className="w-full bg-transparent text-white font-medium border-b border-slate-600 focus:border-violet-500 outline-none py-1"
          />
        ) : (
          <input
            type="text"
            value={editedValue?.[field] || ''}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full bg-transparent text-white font-medium border-b border-slate-600 focus:border-violet-500 outline-none py-1"
          />
        )
      ) : (
        <p className="text-white font-medium">{value}</p>
      )}
    </div>
  );
}