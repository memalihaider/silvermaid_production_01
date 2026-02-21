'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, X, Search, MessageSquare, AlertCircle, CheckCircle, Clock, User, 
  Calendar, Star, Eye, Edit, Trash2, ArrowLeft, Save, UserCheck, TrendingUp,
  Menu, Send, Mail, Briefcase, Award
} from 'lucide-react';
import Link from 'next/link';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, Timestamp, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getSession, type SessionData, logout } from '@/lib/auth';
import { EmployeeSidebar } from '../_components/sidebar';

// Firebase Interfaces
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
  salary: number;
  salaryStructure: string;
  bankName: string;
  bankAccount: string;
  joinDate: string;
  createdAt: string;
  lastUpdated: string;
}

interface FirebaseFeedback {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  submittedBy: string;
  submissionDate: string;
  rating: number;
  category: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface FirebaseComplaint {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  filedBy: string;
  submissionDate: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  resolution: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeFeedbackAndComplaints() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loggedInEmployee, setLoggedInEmployee] = useState<FirebaseEmployee | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'complaints'>('feedback');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Real Data States
  const [feedbacks, setFeedbacks] = useState<FirebaseFeedback[]>([]);
  const [complaints, setComplaints] = useState<FirebaseComplaint[]>([]);

  // Form States
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    category: 'Performance',
    title: '',
    content: '',
    tags: '',
    status: 'Active'
  });

  const [complaintForm, setComplaintForm] = useState({
    category: 'Workplace Safety',
    priority: 'Medium',
    title: '',
    description: '',
    filedBy: 'Employee',
    status: 'Open',
    assignedTo: 'Unassigned',
    resolution: ''
  });

  // Authentication and Session
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
      console.log('🔍 Fetching logged-in employee...');
      
      let employeeData: FirebaseEmployee | null = null;
      
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
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || '',
            salary: data.salary || 0,
            salaryStructure: data.salaryStructure || '',
            bankName: data.bankName || '',
            bankAccount: data.bankAccount || '',
            joinDate: data.joinDate || '',
            createdAt: data.createdAt || '',
            lastUpdated: data.lastUpdated || ''
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
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || '',
            salary: data.salary || 0,
            salaryStructure: data.salaryStructure || '',
            bankName: data.bankName || '',
            bankAccount: data.bankAccount || '',
            joinDate: data.joinDate || '',
            createdAt: data.createdAt || '',
            lastUpdated: data.lastUpdated || ''
          };
          console.log('✅ Found employee by email:', employeeData.name);
        }
      }
      
      setLoggedInEmployee(employeeData);
      
      // If employee found, fetch their data
      if (employeeData) {
        fetchMyFeedbacks(employeeData.id);
        fetchMyComplaints(employeeData.id);
      }
      
    } catch (error) {
      console.error('Error fetching logged-in employee:', error);
    }
  };

  // ✅ FIXED: Fetch only logged-in employee's feedbacks - WITHOUT orderBy
  const fetchMyFeedbacks = async (employeeId: string) => {
    try {
      const feedbacksRef = collection(db, 'feedbacks');
      const q = query(
        feedbacksRef, 
        where('employeeId', '==', employeeId)
        // ❌ REMOVED orderBy to avoid index error
      );
      const snapshot = await getDocs(q);
      
      const feedbacksList: FirebaseFeedback[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feedbacksList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          employeeRole: data.employeeRole || '',
          submittedBy: data.submittedBy || 'Admin',
          submissionDate: data.submissionDate || '',
          rating: data.rating || 0,
          category: data.category || '',
          title: data.title || '',
          content: data.content || '',
          status: data.status || 'Active',
          tags: data.tags || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        });
      });
      
      // ✅ Client-side sorting by date (most recent first)
      feedbacksList.sort((a, b) => 
        new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      );
      
      setFeedbacks(feedbacksList);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  // ✅ FIXED: Fetch only logged-in employee's complaints - WITHOUT orderBy
  const fetchMyComplaints = async (employeeId: string) => {
    try {
      const complaintsRef = collection(db, 'complaints');
      const q = query(
        complaintsRef, 
        where('employeeId', '==', employeeId)
        // ❌ REMOVED orderBy to avoid index error
      );
      const snapshot = await getDocs(q);
      
      const complaintsList: FirebaseComplaint[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        complaintsList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          employeeRole: data.employeeRole || '',
          filedBy: data.filedBy || 'Employee',
          submissionDate: data.submissionDate || '',
          category: data.category || '',
          priority: data.priority || 'Medium',
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'Open',
          assignedTo: data.assignedTo || 'Unassigned',
          resolution: data.resolution || '',
          attachments: data.attachments || [],
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        });
      });
      
      // ✅ Client-side sorting by date (most recent first)
      complaintsList.sort((a, b) => 
        new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      );
      
      setComplaints(complaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  // Clean data for Firebase
  const cleanFirebaseData = (data: any) => {
    const cleanData: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'string' && data[key].trim() === '') {
          cleanData[key] = '';
        } else {
          cleanData[key] = data[key];
        }
      } else {
        cleanData[key] = '';
      }
    });
    return cleanData;
  };

  // Add Feedback to Firebase
  const handleAddFeedback = async () => {
    if (!loggedInEmployee) {
      alert('Employee not found');
      return;
    }

    if (!feedbackForm.title || !feedbackForm.content) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const feedbackData = {
        employeeId: loggedInEmployee.id,
        employeeName: loggedInEmployee.name,
        employeeRole: loggedInEmployee.position,
        submittedBy: loggedInEmployee.name,
        submissionDate: new Date().toISOString().split('T')[0],
        rating: feedbackForm.rating,
        category: feedbackForm.category,
        title: feedbackForm.title,
        content: feedbackForm.content,
        status: feedbackForm.status,
        tags: feedbackForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const cleanData = cleanFirebaseData(feedbackData);
      await addDoc(collection(db, 'feedbacks'), cleanData);

      // Reset form and refresh data
      setFeedbackForm({
        rating: 5,
        category: 'Performance',
        title: '',
        content: '',
        tags: '',
        status: 'Active'
      });
      setShowAddModal(false);
      fetchMyFeedbacks(loggedInEmployee.id);
      
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error adding feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  // Edit Feedback in Firebase
  const handleEditFeedback = async () => {
    if (!loggedInEmployee || !editingItem) return;
    if (!feedbackForm.title || !feedbackForm.content) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const updatedFeedback = {
        ...editingItem,
        rating: feedbackForm.rating,
        category: feedbackForm.category,
        title: feedbackForm.title,
        content: feedbackForm.content,
        status: feedbackForm.status,
        tags: feedbackForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      const cleanData = cleanFirebaseData(updatedFeedback);
      await updateDoc(doc(db, 'feedbacks', editingItem.id), cleanData);

      // Reset form and refresh data
      setFeedbackForm({
        rating: 5,
        category: 'Performance',
        title: '',
        content: '',
        tags: '',
        status: 'Active'
      });
      setShowEditModal(false);
      setEditingItem(null);
      fetchMyFeedbacks(loggedInEmployee.id);
      
      alert('Feedback updated successfully!');
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Error updating feedback. Please try again.');
    }
  };

  // Add Complaint to Firebase
  const handleAddComplaint = async () => {
    if (!loggedInEmployee) {
      alert('Employee not found');
      return;
    }

    if (!complaintForm.title || !complaintForm.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const complaintData = {
        employeeId: loggedInEmployee.id,
        employeeName: loggedInEmployee.name,
        employeeRole: loggedInEmployee.position,
        filedBy: complaintForm.filedBy,
        submissionDate: new Date().toISOString().split('T')[0],
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.title,
        description: complaintForm.description,
        status: complaintForm.status,
        assignedTo: complaintForm.assignedTo,
        resolution: complaintForm.resolution,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const cleanData = cleanFirebaseData(complaintData);
      await addDoc(collection(db, 'complaints'), cleanData);

      // Reset form and refresh data
      setComplaintForm({
        category: 'Workplace Safety',
        priority: 'Medium',
        title: '',
        description: '',
        filedBy: 'Employee',
        status: 'Open',
        assignedTo: 'Unassigned',
        resolution: ''
      });
      setShowAddModal(false);
      fetchMyComplaints(loggedInEmployee.id);
      
      alert('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error adding complaint:', error);
      alert('Error submitting complaint. Please try again.');
    }
  };

  // Edit Complaint in Firebase
  const handleEditComplaint = async () => {
    if (!loggedInEmployee || !editingItem) return;
    if (!complaintForm.title || !complaintForm.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const updatedComplaint = {
        ...editingItem,
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.title,
        description: complaintForm.description,
        filedBy: complaintForm.filedBy,
        status: complaintForm.status,
        assignedTo: complaintForm.assignedTo,
        resolution: complaintForm.resolution,
        updatedAt: new Date().toISOString()
      };

      const cleanData = cleanFirebaseData(updatedComplaint);
      await updateDoc(doc(db, 'complaints', editingItem.id), cleanData);

      // Reset form and refresh data
      setComplaintForm({
        category: 'Workplace Safety',
        priority: 'Medium',
        title: '',
        description: '',
        filedBy: 'Employee',
        status: 'Open',
        assignedTo: 'Unassigned',
        resolution: ''
      });
      setShowEditModal(false);
      setEditingItem(null);
      fetchMyComplaints(loggedInEmployee.id);
      
      alert('Complaint updated successfully!');
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Error updating complaint. Please try again.');
    }
  };

  // Delete Feedback from Firebase
  const handleDeleteFeedback = async (id: string) => {
    if (!loggedInEmployee) return;
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      fetchMyFeedbacks(loggedInEmployee.id);
      alert('Feedback deleted successfully!');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback. Please try again.');
    }
  };

  // Delete Complaint from Firebase
  const handleDeleteComplaint = async (id: string) => {
    if (!loggedInEmployee) return;
    if (!confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await deleteDoc(doc(db, 'complaints', id));
      fetchMyComplaints(loggedInEmployee.id);
      alert('Complaint deleted successfully!');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Error deleting complaint. Please try again.');
    }
  };

  // Open Edit Modal for Feedback
  const openEditFeedback = (feedback: FirebaseFeedback) => {
    setEditingItem(feedback);
    setFeedbackForm({
      rating: feedback.rating,
      category: feedback.category,
      title: feedback.title,
      content: feedback.content,
      tags: feedback.tags?.join(', ') || '',
      status: feedback.status
    });
    setShowEditModal(true);
  };

  // Open Edit Modal for Complaint
  const openEditComplaint = (complaint: FirebaseComplaint) => {
    setEditingItem(complaint);
    setComplaintForm({
      category: complaint.category,
      priority: complaint.priority,
      title: complaint.title,
      description: complaint.description,
      filedBy: complaint.filedBy,
      status: complaint.status,
      assignedTo: complaint.assignedTo,
      resolution: complaint.resolution || ''
    });
    setShowEditModal(true);
  };

  // Filter functions
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = searchTerm === '' || 
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = searchTerm === '' || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Status color functions (Code 1 style)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'Active': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'Resolved': return 'bg-green-900/20 text-green-400 border-green-800';
      case 'Pending': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'Pending Action': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'Open': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'In Progress': return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'Rejected': return 'bg-red-900/20 text-red-400 border-red-800';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3.5) return 'text-blue-400';
    if (rating >= 2.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'bg-red-900/20 text-red-400 border-red-800';
      case 'Medium': return 'bg-amber-900/20 text-amber-400 border-amber-800';
      case 'Low': return 'bg-green-900/20 text-green-400 border-green-800';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!session?.user?.name) return 'E';
    return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login/employee');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!loggedInEmployee) {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        <EmployeeSidebar session={session} open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Employee Not Found</h2>
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
        {/* Header - Code 1 Style */}
        <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
          <div className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-700 rounded-lg">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Feedback & Complaints</h1>
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

        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-xl border border-violet-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Welcome, {loggedInEmployee.name}!</h2>
            <p className="text-slate-300">Submit your feedback and manage complaints.</p>
          </div>

          {/* Tab Navigation - Modified Code 1 Style */}
          <div className="flex items-center gap-4 p-1 bg-slate-800 border border-slate-700 rounded-xl w-fit">
            {[
              { id: 'feedback', label: 'My Feedback', icon: Star },
              { id: 'complaints', label: 'My Complaints', icon: AlertCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filter - Code 1 Style */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search in ${activeTab === 'feedback' ? 'my feedbacks' : 'my complaints'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all" className="bg-slate-800">All Status</option>
              {activeTab === 'feedback' ? (
                <>
                  <option value="Active" className="bg-slate-800">Active</option>
                  <option value="Pending Action" className="bg-slate-800">Pending Action</option>
                </>
              ) : (
                <>
                  <option value="Open" className="bg-slate-800">Open</option>
                  <option value="In Progress" className="bg-slate-800">In Progress</option>
                  <option value="Resolved" className="bg-slate-800">Resolved</option>
                </>
              )}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New {activeTab === 'feedback' ? 'Feedback' : 'Complaint'}
            </button>
          </div>

          {/* Feedback Tab - Code 1 Style */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No feedback found</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    Submit Your First Feedback
                  </button>
                </div>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Star className="w-5 h-5 text-violet-400" />
                          <h3 className="text-lg font-semibold text-white">{feedback.title}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-violet-900/20 text-violet-300">
                            {feedback.category}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(feedback.status)}`}>
                            {feedback.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{feedback.content}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(feedback.rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                            <span className={`ml-2 text-sm font-bold ${getRatingColor(feedback.rating)}`}>
                              {feedback.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {feedback.submissionDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openEditFeedback(feedback)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 text-slate-400 hover:text-green-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Complaints Tab - Code 1 Style */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No complaints found</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    File Your First Complaint
                  </button>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority} Priority
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">{complaint.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {complaint.submissionDate}
                          </div>
                          <div className="text-sm text-slate-400">
                            Assigned to: <span className="text-slate-300">{complaint.assignedTo}</span>
                          </div>
                        </div>
                        {complaint.resolution && (
                          <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                            <p className="text-xs text-blue-400"><span className="font-semibold">Resolution:</span> {complaint.resolution}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openEditComplaint(complaint)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 text-slate-400 hover:text-green-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Feedback/Complaint Modal - Code 1 Style */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {activeTab === 'feedback' ? 'Submit Feedback' : 'File Complaint'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Employee Info - Read Only */}
              <div className="p-4 bg-violet-900/20 rounded-lg border border-violet-800">
                <p className="text-sm text-violet-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Submitting as: <span className="font-semibold text-white">{loggedInEmployee.name}</span>
                </p>
                <p className="text-xs text-violet-400 mt-1">{loggedInEmployee.department} • {loggedInEmployee.position}</p>
              </div>

              {activeTab === 'feedback' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rating *</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="Performance" className="bg-slate-800">Performance</option>
                        <option value="Quality of Work" className="bg-slate-800">Quality of Work</option>
                        <option value="Development" className="bg-slate-800">Development</option>
                        <option value="Behavior" className="bg-slate-800">Behavior</option>
                        <option value="Other" className="bg-slate-800">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                      placeholder="Feedback title"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Feedback *</label>
                    <textarea
                      value={feedbackForm.content}
                      onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
                      placeholder="Provide detailed feedback..."
                      className="w-full h-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={feedbackForm.tags}
                      onChange={(e) => setFeedbackForm({...feedbackForm, tags: e.target.value})}
                      placeholder="e.g., Leadership, Performance, Professional"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="Workplace Safety" className="bg-slate-800">Workplace Safety</option>
                        <option value="Work Schedule" className="bg-slate-800">Work Schedule</option>
                        <option value="Performance" className="bg-slate-800">Performance</option>
                        <option value="Management" className="bg-slate-800">Management</option>
                        <option value="Other" className="bg-slate-800">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Priority *</label>
                      <select
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="High" className="bg-slate-800">High</option>
                        <option value="Medium" className="bg-slate-800">Medium</option>
                        <option value="Low" className="bg-slate-800">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Filed By</label>
                      <input
                        type="text"
                        value={complaintForm.filedBy}
                        onChange={(e) => setComplaintForm({...complaintForm, filedBy: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={complaintForm.assignedTo}
                        onChange={(e) => setComplaintForm({...complaintForm, assignedTo: e.target.value})}
                        placeholder="e.g., HR Manager"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Complaint Title *</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                      placeholder="Brief complaint title"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      placeholder="Provide detailed complaint description..."
                      className="w-full h-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Resolution (Optional)</label>
                    <textarea
                      value={complaintForm.resolution}
                      onChange={(e) => setComplaintForm({...complaintForm, resolution: e.target.value})}
                      placeholder="Resolution details if any..."
                      className="w-full h-20 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={activeTab === 'feedback' ? handleAddFeedback : handleAddComplaint}
                  className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Edit {activeTab === 'feedback' ? 'Feedback' : 'Complaint'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'feedback' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rating *</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="Performance" className="bg-slate-800">Performance</option>
                        <option value="Quality of Work" className="bg-slate-800">Quality of Work</option>
                        <option value="Development" className="bg-slate-800">Development</option>
                        <option value="Behavior" className="bg-slate-800">Behavior</option>
                        <option value="Other" className="bg-slate-800">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Feedback *</label>
                    <textarea
                      value={feedbackForm.content}
                      onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
                      className="w-full h-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                    <input
                      type="text"
                      value={feedbackForm.tags}
                      onChange={(e) => setFeedbackForm({...feedbackForm, tags: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="Workplace Safety" className="bg-slate-800">Workplace Safety</option>
                        <option value="Work Schedule" className="bg-slate-800">Work Schedule</option>
                        <option value="Performance" className="bg-slate-800">Performance</option>
                        <option value="Management" className="bg-slate-800">Management</option>
                        <option value="Other" className="bg-slate-800">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Priority *</label>
                      <select
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                      >
                        <option value="High" className="bg-slate-800">High</option>
                        <option value="Medium" className="bg-slate-800">Medium</option>
                        <option value="Low" className="bg-slate-800">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Filed By</label>
                      <input
                        type="text"
                        value={complaintForm.filedBy}
                        onChange={(e) => setComplaintForm({...complaintForm, filedBy: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={complaintForm.assignedTo}
                        onChange={(e) => setComplaintForm({...complaintForm, assignedTo: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      className="w-full h-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Resolution</label>
                    <textarea
                      value={complaintForm.resolution}
                      onChange={(e) => setComplaintForm({...complaintForm, resolution: e.target.value})}
                      className="w-full h-20 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={activeTab === 'feedback' ? handleEditFeedback : handleEditComplaint}
                  className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}