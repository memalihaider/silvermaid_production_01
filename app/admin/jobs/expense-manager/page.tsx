'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Download,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore'

interface JobExpense {
  id: string
  jobId: string
  jobTitle: string
  expenseType: string
  category: string
  amount: number
  date: string
  description: string
  approvedBy?: string
  receipt?: string
  notes: string
  createdAt?: any
}

interface Job {
  id: string
  title: string
  budget: number
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  revenue?: number
}

interface Category {
  id: string
  name: string
  color?: string
  description?: string
  itemCount?: number
}

export default function ExpenseManager() {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'analytics'>('view')
  const [expenses, setExpenses] = useState<JobExpense[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterJobId, setFilterJobId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingExpense, setEditingExpense] = useState<JobExpense | null>(null)

  const [formData, setFormData] = useState({
    jobId: '',
    expenseType: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    approvedBy: '',
    notes: ''
  })

  // Fetch real data from Firebase
  useEffect(() => {
    fetchJobs()
    fetchCategories()
    fetchExpenses()
  }, [])

  const fetchJobs = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'jobs'))
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[]
      setJobs(jobsData)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'))
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[]
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'job-expenses'), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobExpense[]
      setExpenses(expensesData)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  // Filter expenses based on all criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesJob = filterJobId === null || exp.jobId === filterJobId
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
      const matchesSearch = searchTerm === '' || 
        exp.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.expenseType?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Date range filtering
      let matchesDate = true
      if (filterDateRange !== 'all') {
        const today = new Date()
        const expenseDate = new Date(exp.date)
        const daysDiff = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (filterDateRange === 'daily') matchesDate = daysDiff === 0
        else if (filterDateRange === 'weekly') matchesDate = daysDiff <= 7
        else if (filterDateRange === 'monthly') matchesDate = daysDiff <= 30
      }
      
      return matchesJob && matchesCategory && matchesSearch && matchesDate
    })
  }, [expenses, filterJobId, filterCategory, searchTerm, filterDateRange])

  // Calculate statistics for filtered expenses
  const stats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const byCategory = categories
      .map(cat => ({
        name: cat.name,
        value: filteredExpenses.filter(exp => exp.category === cat.name).reduce((sum, exp) => sum + exp.amount, 0)
      }))
      .filter(item => item.value > 0)
    
    const expensesByDate: { [key: string]: number } = {}
    filteredExpenses.forEach(exp => {
      const dateKey = exp.date
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + exp.amount
    })
    
    const chartData = Object.entries(expensesByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, amount]) => ({ date, amount }))
    
    return { totalExpenses, byCategory, chartData }
  }, [filteredExpenses, categories])

  // Calculate job-wise budget vs actual
  const jobWiseSummary = useMemo(() => {
    return jobs.map(job => {
      const jobExpenses = expenses.filter(exp => exp.jobId === job.id)
      const totalExpense = jobExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const remaining = (job.budget || 0) - totalExpense
      const revenue = job.revenue || 0
      const profit = revenue - totalExpense
      const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0
      
      return {
        ...job,
        totalExpense,
        remaining,
        profit,
        profitMargin: parseFloat(profitMargin as string),
        expenseCount: jobExpenses.length
      }
    })
  }, [expenses, jobs])

  const handleAddExpense = async () => {
    if (!formData.jobId || !formData.expenseType || !formData.amount || !formData.category) {
      alert('Please fill in all required fields')
      return
    }

    const selectedJob = jobs.find(j => j.id === formData.jobId)

    const expenseData = {
      jobId: formData.jobId,
      jobTitle: selectedJob?.title || '',
      expenseType: formData.expenseType,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      approvedBy: formData.approvedBy || 'Admin',
      notes: formData.notes,
      createdAt: Timestamp.now()
    }

    try {
      if (editingExpense) {
        // Update existing expense
        const expenseRef = doc(db, 'job-expenses', editingExpense.id)
        await updateDoc(expenseRef, expenseData)
        setExpenses(expenses.map(exp =>
          exp.id === editingExpense.id
            ? { ...expenseData, id: editingExpense.id } as JobExpense
            : exp
        ))
        setEditingExpense(null)
        alert('Expense updated successfully!')
      } else {
        // Add new expense
        const docRef = await addDoc(collection(db, 'job-expenses'), expenseData)
        setExpenses([{ ...expenseData, id: docRef.id } as JobExpense, ...expenses])
        alert('Expense added successfully!')
      }

      setFormData({
        jobId: '',
        expenseType: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        approvedBy: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Error saving expense. Please try again.')
    }
  }

  const handleEditExpense = (expense: JobExpense) => {
    setEditingExpense(expense)
    setFormData({
      jobId: expense.jobId,
      expenseType: expense.expenseType,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
      approvedBy: expense.approvedBy || '',
      notes: expense.notes
    })
    setActiveTab('add')
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense record?')) {
      try {
        await deleteDoc(doc(db, 'job-expenses', id))
        setExpenses(expenses.filter(exp => exp.id !== id))
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Error deleting expense. Please try again.')
      }
    }
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-white/80 font-bold text-sm uppercase tracking-wider">Job Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Job Expense Manager</h1>
          <p className="text-white/90 mt-3 text-lg font-medium max-w-2xl">
            Track all job-related expenses by category and date. Calculate profit, loss, and budget utilization
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]"></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-md">
        {[
          { id: 'add' as const, label: '➕ Add Expense' },
          { id: 'view' as const, label: '📋 View Expenses' },
          { id: 'analytics' as const, label: '📊 Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== ADD EXPENSE TAB ==================== */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <Plus className="h-6 w-6 text-emerald-600" />
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job *</label>
              <select
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select a Job...</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} (Budget: AED {job.budget?.toLocaleString() || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Expense Type *</label>
              <input
                type="text"
                value={formData.expenseType}
                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                placeholder="e.g., Labor, Supplies, Equipment"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select a Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.description ? `- ${cat.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount (AED) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Approved By</label>
              <input
                type="text"
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                placeholder="Manager name"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the expense"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddExpense}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
            {editingExpense && (
              <button
                onClick={() => {
                  setEditingExpense(null)
                  setFormData({
                    jobId: '',
                    expenseType: '',
                    category: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    approvedBy: '',
                    notes: ''
                  })
                }}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== VIEW EXPENSES TAB ==================== */}
      {activeTab === 'view' && (
        <>
          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Filter by Job</label>
                <select
                  value={filterJobId || ''}
                  onChange={(e) => setFilterJobId(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Filter by Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Time Range</label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Expenses</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">AED {stats.totalExpenses.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 text-emerald-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Expense Count</p>
                  <p className="text-3xl font-black text-blue-600 mt-2">{filteredExpenses.length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Average Expense</p>
                  <p className="text-3xl font-black text-amber-600 mt-2">
                    AED {filteredExpenses.length > 0 ? (stats.totalExpenses / filteredExpenses.length).toFixed(0) : 0}
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-amber-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Job</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Approved By</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{expense.date}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 text-sm">{expense.jobTitle}</div>
                          <div className="text-xs text-gray-500">{expense.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{expense.expenseType}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-emerald-600">AED {expense.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{expense.approvedBy || '—'}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-semibold">
                        No expenses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================== ANALYTICS TAB ==================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Expenses by Category Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-xl font-black text-gray-900 mb-6">📊 Expenses by Category</h3>
            {stats.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={stats.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: AED ${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `AED ${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </div>

          {/* Expenses Over Time Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-xl font-black text-gray-900 mb-6">📈 Expenses Over Time</h3>
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `AED ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" name="Expense Amount" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </div>

          {/* Job-wise Budget vs Actual */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-xl font-black text-gray-900">💼 Job-wise Budget Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Job Title</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Budget</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Total Expenses</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Remaining</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Profit/Loss</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobWiseSummary.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{job.title}</div>
                        <div className="text-xs text-gray-500">{job.expenseCount} expenses</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">AED {job.budget?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 font-semibold text-amber-600">AED {job.totalExpense.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">AED {job.remaining.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-gray-700">AED {(job.revenue || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-sm ${job.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          AED {job.profit >= 0 ? '+' : ''}{job.profit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                          job.profitMargin >= 20 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                          job.profitMargin >= 10 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          job.profitMargin >= 0 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                          'bg-red-100 text-red-700 border-red-300'
                        }`}>
                          {job.profitMargin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-xl font-black text-gray-900 mb-6">📊 Expense Distribution</h3>
            {stats.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `AED ${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#10b981" name="Amount (AED)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}