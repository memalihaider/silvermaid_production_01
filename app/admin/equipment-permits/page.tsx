'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Wrench,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Bell,
  History,
  ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Equipment = {
  id: string
  name: string
  category: string
  status: 'Available' | 'In Use' | 'Maintenance'
  location: string
  purchaseDate: string
  cost: number
  maintenanceDate: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  quantity: number
  lastServiced: string
  createdAt: Timestamp
}

type Permit = {
  id: string
  name: string
  category: string
  status: 'Active' | 'Expiring Soon' | 'Expired'
  issueDate: string
  expiryDate: string
  issuer: string
  renewalDate: string
  cost: number
  createdAt: Timestamp
}

type Reminder = {
  id: string
  type: 'equipment' | 'permit' | 'material'
  itemId: string
  itemName: string
  reminderType: 'maintenance' | 'expiry' | 'renewal' | 'restock'
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  message: string
  createdAt: string
}

type TrackingLog = {
  id: string
  type: 'equipment' | 'permit' | 'material'
  itemId: string
  itemName: string
  action: string
  user: string
  timestamp: string
  details: string
  createdAt: Timestamp
  date: string // Added date field for filtering
}

type Material = {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  cost: number
  supplier: string
  dateAdded: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  location: string
  reorderLevel: number
  invoices: Array<{id: string, type: string, file: string, date: string, amount: string}>
  createdAt: Timestamp
}

export default function EquipmentPermitsPage() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'permits' | 'materials' | 'tracking' | 'reminders'>('equipment')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [selectedItemForReminder, setSelectedItemForReminder] = useState<any>(null)
  
  // States for Firebase data
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [permits, setPermits] = useState<Permit[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([])
  const [todaysActivities, setTodaysActivities] = useState<TrackingLog[]>([])
  
  // Modals
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false)
  const [showAddPermitModal, setShowAddPermitModal] = useState(false)
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [showEditEquipmentModal, setShowEditEquipmentModal] = useState(false)
  const [showEditPermitModal, setShowEditPermitModal] = useState(false)
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)

  // Form States
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'Cleaning',
    status: 'Available' as 'Available' | 'In Use' | 'Maintenance',
    location: '',
    cost: '',
    quantity: '1',
    condition: 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor',
    maintenanceDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    lastServiced: new Date().toISOString().split('T')[0]
  })

  const [permitForm, setPermitForm] = useState({
    name: '',
    category: 'Building',
    status: 'Active' as 'Active' | 'Expiring Soon' | 'Expired',
    issuer: '',
    cost: '',
    issueDate: '',
    expiryDate: '',
    renewalDate: ''
  })

  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'Chemicals',
    quantity: '',
    unit: 'piece',
    cost: '',
    supplier: '',
    location: '',
    reorderLevel: ''
  })

  // Aaj ki date nikalne ke liye
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  // Firebase se data fetch karna
  useEffect(() => {
    fetchAllData()
  }, [])

  // Equipment aur Permits ke liye reminders count nikalne ke liye function
  const getExpiryRemindersCount = (type: 'equipment' | 'permit') => {
    return reminders.filter(r => 
      r.type === type && 
      r.reminderType === 'expiry' && 
      r.status !== 'completed'
    ).length
  }

  const fetchAllData = async () => {
    try {
      // Equipment fetch karna
      const equipmentSnapshot = await getDocs(collection(db, 'equipment'))
      const equipmentData = equipmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[]
      setEquipment(equipmentData)

      // Permits fetch karna
      const permitsSnapshot = await getDocs(collection(db, 'permits_licenses'))
      const permitsData = permitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Permit[]
      setPermits(permitsData)

      // Materials fetch karna
      const materialsSnapshot = await getDocs(collection(db, 'materials'))
      const materialsData = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Material[]
      setMaterials(materialsData)

      // Reminders fetch karna
      const remindersSnapshot = await getDocs(collection(db, 'reminders'))
      const remindersData = remindersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[]
      setReminders(remindersData)

      // Sab tracking logs fetch karna
      const trackingSnapshot = await getDocs(collection(db, 'tracking'))
      const allTrackingData = trackingSnapshot.docs.map(doc => {
        const data = doc.data()
        // Extract date from timestamp for filtering
        const timestamp = data.timestamp || ''
        let date = ''
        if (timestamp) {
          // Try to extract date from timestamp string
          const dateMatch = timestamp.match(/\d{4}-\d{2}-\d{2}/)
          date = dateMatch ? dateMatch[0] : ''
        }
        
        return {
          id: doc.id,
          ...data,
          date: date || getTodayDate() // Default to today if no date found
        }
      }) as TrackingLog[]
      
      setTrackingLogs(allTrackingData)
      
      // Aaj ki date ke activities filter karna
      const today = getTodayDate()
      const todaysFilteredActivities = allTrackingData.filter(log => {
        // Check if log has date field
        if (log.date) {
          return log.date === today
        }
        // If no date field, check timestamp
        if (log.timestamp && log.timestamp.includes(today)) {
          return true
        }
        return false
      })
      
      setTodaysActivities(todaysFilteredActivities)

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Log tracking action with proper date
  const addTrackingLog = async (
    type: 'equipment' | 'permit' | 'material', 
    itemId: string, 
    itemName: string, 
    action: string, 
    details: string
  ) => {
    try {
      const today = getTodayDate()
      const timestamp = new Date().toLocaleString()
      
      const newLog = {
        type,
        itemId,
        itemName,
        action,
        user: 'Admin User',
        timestamp: timestamp,
        details,
        date: today, // Add date field for filtering
        createdAt: Timestamp.now()
      }
      
      await addDoc(collection(db, 'tracking'), newLog)
      
      // Local state update
      const logWithId = {
        id: `t${Date.now()}`,
        ...newLog
      }
      
      setTrackingLogs(prev => [logWithId, ...prev])
      setTodaysActivities(prev => [logWithId, ...prev])
      
    } catch (error) {
      console.error('Error adding tracking log:', error)
    }
  }

  // Equipment Handlers
  const handleAddEquipment = async () => {
    if (equipmentForm.name && equipmentForm.location && equipmentForm.cost) {
      try {
        const newEquipment = {
          name: equipmentForm.name,
          category: equipmentForm.category,
          status: equipmentForm.status,
          location: equipmentForm.location,
          purchaseDate: equipmentForm.purchaseDate,
          cost: parseInt(equipmentForm.cost),
          maintenanceDate: equipmentForm.maintenanceDate,
          condition: equipmentForm.condition,
          quantity: parseInt(equipmentForm.quantity) || 1,
          lastServiced: equipmentForm.lastServiced,
          createdAt: Timestamp.now()
        }

        // Firebase me add karna
        const docRef = await addDoc(collection(db, 'equipment'), newEquipment)
        
        // Local state update
        setEquipment(prev => [...prev, {
          id: docRef.id,
          ...newEquipment
        }])

        // Tracking log add karna
        await addTrackingLog('equipment', docRef.id, equipmentForm.name, 'Added', 
          `New equipment added to inventory at ${equipmentForm.location}`)

        // Form reset karna
        setEquipmentForm({
          name: '',
          category: 'Cleaning',
          status: 'Available',
          location: '',
          cost: '',
          quantity: '1',
          condition: 'Good',
          maintenanceDate: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          lastServiced: new Date().toISOString().split('T')[0]
        })
        
        setShowAddEquipmentModal(false)
        
      } catch (error) {
        console.error('Error adding equipment:', error)
      }
    }
  }

  const handleEditEquipment = async () => {
    if (selectedEquipment && equipmentForm.name) {
      try {
        const equipmentRef = doc(db, 'equipment', selectedEquipment.id)
        const updatedData = {
          name: equipmentForm.name,
          category: equipmentForm.category,
          status: equipmentForm.status,
          location: equipmentForm.location,
          cost: parseInt(equipmentForm.cost) || 0,
          quantity: parseInt(equipmentForm.quantity) || 1,
          condition: equipmentForm.condition,
          maintenanceDate: equipmentForm.maintenanceDate
        }

        // Firebase update
        await updateDoc(equipmentRef, updatedData)

        // Local state update
        setEquipment(prev => prev.map(e =>
          e.id === selectedEquipment.id
            ? { ...e, ...updatedData }
            : e
        ))

        // Tracking log
        await addTrackingLog('equipment', selectedEquipment.id, equipmentForm.name, 
          'Updated', `Equipment details updated`)

        setShowEditEquipmentModal(false)
        setSelectedEquipment(null)
        
      } catch (error) {
        console.error('Error updating equipment:', error)
      }
    }
  }

  const handleDeleteEquipment = async (id: string) => {
    try {
      const equip = equipment.find(e => e.id === id)
      if (equip) {
        // Firebase se delete
        await deleteDoc(doc(db, 'equipment', id))
        
        // Local state update
        setEquipment(prev => prev.filter(e => e.id !== id))
        
        // Tracking log
        await addTrackingLog('equipment', id, equip.name, 'Deleted', 
          `Equipment removed from inventory`)
      }
    } catch (error) {
      console.error('Error deleting equipment:', error)
    }
  }

  // Reminder Handlers
  const handleAddReminder = async (
    reminderType: 'maintenance' | 'expiry' | 'renewal' | 'restock', 
    dueDate: string, 
    message: string
  ) => {
    if (selectedItemForReminder && dueDate) {
      try {
        const newReminder = {
          type: selectedItemForReminder.type,
          itemId: selectedItemForReminder.id,
          itemName: selectedItemForReminder.name,
          reminderType,
          dueDate,
          status: 'pending' as 'pending',
          message,
          createdAt: getTodayDate()
        }

        // Firebase me add
        const docRef = await addDoc(collection(db, 'reminders'), newReminder)
        
        // Local state update
        setReminders(prev => [...prev, {
          id: docRef.id,
          ...newReminder
        }])

        // Tracking log add karna
        await addTrackingLog('reminder', docRef.id, newReminder.itemName, 'Reminder Added', 
          `Reminder set for ${selectedItemForReminder.type}: ${newReminder.message}`)

        setShowReminderModal(false)
        setSelectedItemForReminder(null)
        
      } catch (error) {
        console.error('Error adding reminder:', error)
      }
    }
  }

  const handleCompleteReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id)
      if (reminder) {
        const reminderRef = doc(db, 'reminders', id)
        await updateDoc(reminderRef, { status: 'completed' })
        
        // Tracking log
        await addTrackingLog('reminder', id, reminder.itemName, 'Reminder Completed', 
          `Reminder marked as completed`)
        
        setReminders(prev => prev.map(r => 
          r.id === id ? { ...r, status: 'completed' } : r
        ))
      }
    } catch (error) {
      console.error('Error completing reminder:', error)
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id)
      if (reminder) {
        await deleteDoc(doc(db, 'reminders', id))
        
        // Tracking log
        await addTrackingLog('reminder', id, reminder.itemName, 'Reminder Deleted', 
          `Reminder removed`)
        
        setReminders(prev => prev.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  // Permit Handlers
  const handleAddPermit = async () => {
    if (permitForm.name && permitForm.issuer && permitForm.expiryDate) {
      try {
        const newPermit = {
          name: permitForm.name,
          category: permitForm.category,
          status: permitForm.status,
          issuer: permitForm.issuer,
          cost: parseInt(permitForm.cost) || 0,
          issueDate: permitForm.issueDate || getTodayDate(),
          expiryDate: permitForm.expiryDate,
          renewalDate: permitForm.renewalDate || permitForm.expiryDate,
          createdAt: Timestamp.now()
        }

        // Firebase me add
        const docRef = await addDoc(collection(db, 'permits_licenses'), newPermit)
        
        // Local state update
        setPermits(prev => [...prev, {
          id: docRef.id,
          ...newPermit
        }])

        // Tracking log
        await addTrackingLog('permit', docRef.id, permitForm.name, 'Added', 
          `New permit issued by ${permitForm.issuer}`)

        // Form reset
        setPermitForm({
          name: '',
          category: 'Building',
          status: 'Active',
          issuer: '',
          cost: '',
          issueDate: '',
          expiryDate: '',
          renewalDate: ''
        })
        
        setShowAddPermitModal(false)
        
      } catch (error) {
        console.error('Error adding permit:', error)
      }
    }
  }

  const handleEditPermit = async () => {
    if (selectedPermit && permitForm.name) {
      try {
        const permitRef = doc(db, 'permits_licenses', selectedPermit.id)
        const updatedData = {
          name: permitForm.name,
          category: permitForm.category,
          status: permitForm.status,
          issuer: permitForm.issuer,
          cost: parseInt(permitForm.cost) || 0,
          issueDate: permitForm.issueDate,
          expiryDate: permitForm.expiryDate,
          renewalDate: permitForm.renewalDate
        }

        // Firebase update
        await updateDoc(permitRef, updatedData)

        // Local state update
        setPermits(prev => prev.map(p =>
          p.id === selectedPermit.id
            ? { ...p, ...updatedData }
            : p
        ))

        // Tracking log
        await addTrackingLog('permit', selectedPermit.id, permitForm.name, 
          'Updated', `Permit details updated`)

        setShowEditPermitModal(false)
        setSelectedPermit(null)
        
      } catch (error) {
        console.error('Error updating permit:', error)
      }
    }
  }

  const handleDeletePermit = async (id: string) => {
    try {
      const permit = permits.find(p => p.id === id)
      if (permit) {
        // Firebase se delete
        await deleteDoc(doc(db, 'permits_licenses', id))
        
        // Local state update
        setPermits(prev => prev.filter(p => p.id !== id))
        
        // Tracking log
        await addTrackingLog('permit', id, permit.name, 'Deleted', 
          `Permit removed from system`)
      }
    } catch (error) {
      console.error('Error deleting permit:', error)
    }
  }

  // Material Handlers
  const handleAddMaterial = async () => {
    if (materialForm.name && materialForm.quantity && materialForm.cost && materialForm.supplier) {
      try {
        const quantity = parseInt(materialForm.quantity) || 0
        const reorderLevel = parseInt(materialForm.reorderLevel) || 0
        
        const newMaterial = {
          name: materialForm.name,
          category: materialForm.category,
          quantity: quantity,
          unit: materialForm.unit,
          cost: parseInt(materialForm.cost) || 0,
          supplier: materialForm.supplier,
          location: materialForm.location,
          reorderLevel: reorderLevel,
          dateAdded: getTodayDate(),
          status: (quantity === 0 ? 'Out of Stock' : 
                  quantity <= reorderLevel ? 'Low Stock' : 'In Stock') as 'In Stock' | 'Low Stock' | 'Out of Stock',
          invoices: [],
          createdAt: Timestamp.now()
        }

        // Firebase me add
        const docRef = await addDoc(collection(db, 'materials'), newMaterial)
        
        // Local state update
        setMaterials(prev => [...prev, {
          id: docRef.id,
          ...newMaterial
        }])

        // Tracking log
        await addTrackingLog('material', docRef.id, materialForm.name, 'Added', 
          `New material added from ${materialForm.supplier}`)

        // Form reset
        setMaterialForm({
          name: '',
          category: 'Chemicals',
          quantity: '',
          unit: 'piece',
          cost: '',
          supplier: '',
          location: '',
          reorderLevel: ''
        })
        
        setShowAddMaterialModal(false)
        
      } catch (error) {
        console.error('Error adding material:', error)
      }
    }
  }

  const handleEditMaterial = async () => {
    if (selectedMaterial && materialForm.name) {
      try {
        const materialRef = doc(db, 'materials', selectedMaterial.id)
        const quantity = parseInt(materialForm.quantity) || 0
        const reorderLevel = parseInt(materialForm.reorderLevel) || 0
        
        const updatedData = {
          name: materialForm.name,
          category: materialForm.category,
          quantity: quantity,
          unit: materialForm.unit,
          cost: parseInt(materialForm.cost) || 0,
          supplier: materialForm.supplier,
          location: materialForm.location,
          reorderLevel: reorderLevel,
          status: (quantity === 0 ? 'Out of Stock' : 
                  quantity <= reorderLevel ? 'Low Stock' : 'In Stock') as 'In Stock' | 'Low Stock' | 'Out of Stock'
        }

        // Firebase update
        await updateDoc(materialRef, updatedData)

        // Local state update
        setMaterials(prev => prev.map(m =>
          m.id === selectedMaterial.id
            ? { ...m, ...updatedData }
            : m
        ))

        // Tracking log
        await addTrackingLog('material', selectedMaterial.id, materialForm.name, 
          'Updated', `Material details updated`)

        setShowEditMaterialModal(false)
        setSelectedMaterial(null)
        
      } catch (error) {
        console.error('Error updating material:', error)
      }
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    try {
      const material = materials.find(m => m.id === id)
      if (material) {
        // Firebase se delete
        await deleteDoc(doc(db, 'materials', id))
        
        // Local state update
        setMaterials(prev => prev.filter(m => m.id !== id))
        
        // Tracking log
        await addTrackingLog('material', id, material.name, 'Deleted', 
          `Material removed from inventory`)
      }
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  // Edit modals open karne ke functions
  const openEditEquipmentModal = (equip: Equipment) => {
    setSelectedEquipment(equip)
    setEquipmentForm({
      name: equip.name,
      category: equip.category,
      status: equip.status,
      location: equip.location,
      cost: equip.cost.toString(),
      quantity: equip.quantity.toString(),
      condition: equip.condition,
      maintenanceDate: equip.maintenanceDate,
      purchaseDate: equip.purchaseDate,
      lastServiced: equip.lastServiced
    })
    setShowEditEquipmentModal(true)
  }

  const openEditPermitModal = (permit: Permit) => {
    setSelectedPermit(permit)
    setPermitForm({
      name: permit.name,
      category: permit.category,
      status: permit.status,
      issuer: permit.issuer,
      cost: permit.cost.toString(),
      issueDate: permit.issueDate,
      expiryDate: permit.expiryDate,
      renewalDate: permit.renewalDate
    })
    setShowEditPermitModal(true)
  }

  const openEditMaterialModal = (material: Material) => {
    setSelectedMaterial(material)
    setMaterialForm({
      name: material.name,
      category: material.category,
      quantity: material.quantity.toString(),
      unit: material.unit,
      cost: material.cost.toString(),
      supplier: material.supplier,
      location: material.location,
      reorderLevel: material.reorderLevel.toString()
    })
    setShowEditMaterialModal(true)
  }

  // Filter functions
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredPermits = permits.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.issuer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Available': return 'bg-green-100 text-green-800'
      case 'In Use': return 'bg-blue-100 text-blue-800'
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800'
      case 'Expired': return 'bg-red-100 text-red-800'
      case 'Maintenance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionIcon = (condition: string) => {
    switch(condition) {
      case 'Excellent': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Good': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'Fair': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'Poor': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  // Aaj ki date ke reminders filter karna
  const todaysReminders = reminders.filter(reminder => {
    return reminder.createdAt === getTodayDate()
  })

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment & Permits</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your equipment inventory and permits</p>
          </div>
        </div>
      </div>

      {/* Summary Cards - Updated with Reminder Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Equipment Card */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase">Total Equipment</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
          <div className="text-xs text-blue-600 mt-2">
            {getExpiryRemindersCount('equipment') > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getExpiryRemindersCount('equipment')} Expiry Reminders
              </span>
            )}
            {getExpiryRemindersCount('equipment') === 0 && (
              <span>{equipment.filter(e => e.status === 'Available').length} Available</span>
            )}
          </div>
        </div>

        {/* Permits Card */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-700 uppercase">Active Permits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{permits.filter(p => p.status === 'Active').length}</div>
          <div className="text-xs text-green-600 mt-2">
            {getExpiryRemindersCount('permit') > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getExpiryRemindersCount('permit')} Expiry Reminders
              </span>
            )}
            {getExpiryRemindersCount('permit') === 0 && (
              <span>Of {permits.length} Total</span>
            )}
          </div>
        </div>

        {/* In Use Equipment Card */}
        <div className="bg-linear-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs font-bold text-orange-700 uppercase">In Use</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{equipment.filter(e => e.status === 'In Use').length}</div>
          <div className="text-xs text-orange-600 mt-2">Equipment Items</div>
        </div>

        {/* Expiring Soon Card - Updated */}
        <div className="bg-linear-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-700 uppercase">Expiring Soon</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {permits.filter(p => p.status === 'Expiring Soon').length + 
             reminders.filter(r => r.reminderType === 'expiry' && r.status === 'pending').length}
          </div>
          <div className="text-xs text-red-600 mt-2">
            {permits.filter(p => p.status === 'Expiring Soon').length} Permits + {reminders.filter(r => r.reminderType === 'expiry' && r.status === 'pending').length} Reminders
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-700 uppercase">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            AED {(equipment.reduce((sum, e) => sum + e.cost, 0) + 
                 permits.reduce((sum, p) => sum + p.cost, 0) + 
                 materials.reduce((sum, m) => sum + (m.cost * m.quantity), 0)).toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 mt-2">All Assets</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-white border border-gray-300 rounded-2xl w-fit overflow-x-auto">
        {[
          { id: 'equipment', label: 'Equipment Inventory', icon: Wrench },
          { id: 'permits', label: 'Permits & Licenses', icon: ShieldCheck },
          { id: 'materials', label: 'Materials', icon: ShoppingCart, badge: materials.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock').length },
          { id: 'reminders', label: 'Reminders', icon: Bell, badge: reminders.filter(r => r.status !== 'completed').length },
          { id: 'tracking', label: 'Activity Tracking', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-red-500 text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All Status</option>
          {activeTab === 'equipment' ? (
            <>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </>
          ) : activeTab === 'permits' ? (
            <>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </>
          ) : activeTab === 'materials' ? (
            <>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </>
          ) : null}
        </select>

        <button
          onClick={() => {
            if (activeTab === 'equipment') setShowAddEquipmentModal(true)
            else if (activeTab === 'permits') setShowAddPermitModal(true)
            else if (activeTab === 'materials') setShowAddMaterialModal(true)
          }}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'equipment' ? 'Equipment' : activeTab === 'permits' ? 'Permit' : 'Material'}
        </button>
      </div>

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="bg-white border border-gray-300 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Equipment Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Condition</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Qty</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Value</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Next Service</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getConditionIcon(item.condition)}
                        <span className="text-sm text-gray-600">{item.condition}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AED {item.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.maintenanceDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItemForReminder({type: 'equipment', id: item.id, name: item.name})
                            setShowReminderModal(true)
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Set Reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditEquipmentModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permits Tab */}
      {activeTab === 'permits' && (
        <div className="bg-white border border-gray-300 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Permit Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Issue Date</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Expiry Date</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Renewal Date</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Issuer</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Cost</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredPermits.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.issueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.expiryDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.renewalDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.issuer}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AED {item.cost.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItemForReminder({type: 'permit', id: item.id, name: item.name})
                            setShowReminderModal(true)
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Set Reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditPermitModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePermit(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="bg-white border border-gray-300 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Material Name</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Quantity</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Unit Cost</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Total Cost</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Supplier</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Location</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {materials.filter(m => 
                  m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (filterStatus === 'all' || m.status === filterStatus)
                ).map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.quantity} {material.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        material.status === 'In Stock' ? 'bg-green-100 text-green-800 border border-green-300' :
                        material.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {material.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">AED {material.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AED {(material.quantity * material.cost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{material.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditMaterialModal(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Active Reminders</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-bold">
                {reminders.filter(r => r.status === 'overdue').length} Overdue
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold">
                {reminders.filter(r => r.status === 'pending').length} Pending
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {reminders.filter(r => r.status !== 'completed').map((reminder) => (
              <div key={reminder.id} className={`bg-white border-2 rounded-2xl p-6 ${
                reminder.status === 'overdue' ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        reminder.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        reminder.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.status}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        reminder.type === 'equipment' ? 'bg-blue-100 text-blue-800' : 
                        reminder.type === 'permit' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {reminder.type}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        reminder.reminderType === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                        reminder.reminderType === 'expiry' ? 'bg-red-100 text-red-800' :
                        reminder.reminderType === 'renewal' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {reminder.reminderType}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{reminder.itemName}</h4>
                    <p className="text-sm text-gray-600 mb-3">{reminder.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {reminder.dueDate}
                      </span>
                      <span>Created: {reminder.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reminders.filter(r => r.status !== 'completed').length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No active reminders</p>
                <p className="text-gray-500 text-sm mt-1">All reminders are completed or no reminders set</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking Tab - UPDATED WITH TODAY'S ACTIVITIES */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Today's Activity Tracking ({getTodayDate()})</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <span className="font-bold">{todaysActivities.length}</span> activities today
              </span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                  Equipment: {todaysActivities.filter(a => a.type === 'equipment').length}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">
                  Permits: {todaysActivities.filter(a => a.type === 'permit').length}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold">
                  Materials: {todaysActivities.filter(a => a.type === 'material').length}
                </span>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
                  Reminders: {todaysActivities.filter(a => a.type === 'reminder').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-3xl overflow-hidden">
            <div className="divide-y divide-gray-200">
              {todaysActivities.length > 0 ? todaysActivities.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      log.action.includes('Added') ? 'bg-green-100' :
                      log.action.includes('Updated') ? 'bg-blue-100' :
                      log.action.includes('Deleted') ? 'bg-red-100' :
                      log.action.includes('Completed') ? 'bg-emerald-100' :
                      'bg-gray-100'
                    }`}>
                      {log.type === 'equipment' ? (
                        <Wrench className="w-5 h-5 text-gray-700" />
                      ) : log.type === 'permit' ? (
                        <ShieldCheck className="w-5 h-5 text-gray-700" />
                      ) : log.type === 'material' ? (
                        <ShoppingCart className="w-5 h-5 text-gray-700" />
                      ) : (
                        <Bell className="w-5 h-5 text-gray-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-bold text-gray-900">{log.itemName}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          log.action.includes('Added') ? 'bg-green-100 text-green-800' :
                          log.action.includes('Updated') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('Deleted') ? 'bg-red-100 text-red-800' :
                          log.action.includes('Completed') ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          log.type === 'equipment' ? 'bg-blue-100 text-blue-800' : 
                          log.type === 'permit' ? 'bg-purple-100 text-purple-800' :
                          log.type === 'material' ? 'bg-green-100 text-green-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp}
                        </span>
                        <span>By {log.user}</span>
                        {log.date && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            Date: {log.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No activities recorded today</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Activities will appear here when you add, update, or delete equipment, permits, materials, or reminders
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aaj ki date ke summary statistics */}
          {todaysActivities.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="text-sm font-bold text-blue-700 mb-1">Equipment Activities</div>
                <div className="text-2xl font-bold text-gray-900">
                  {todaysActivities.filter(a => a.type === 'equipment').length}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {todaysActivities.filter(a => a.type === 'equipment' && a.action.includes('Added')).length} Added
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <div className="text-sm font-bold text-purple-700 mb-1">Permit Activities</div>
                <div className="text-2xl font-bold text-gray-900">
                  {todaysActivities.filter(a => a.type === 'permit').length}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {todaysActivities.filter(a => a.type === 'permit' && a.action.includes('Added')).length} Added
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="text-sm font-bold text-green-700 mb-1">Material Activities</div>
                <div className="text-2xl font-bold text-gray-900">
                  {todaysActivities.filter(a => a.type === 'material').length}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {todaysActivities.filter(a => a.type === 'material' && a.action.includes('Added')).length} Added
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="text-sm font-bold text-amber-700 mb-1">Reminder Activities</div>
                <div className="text-2xl font-bold text-gray-900">
                  {todaysActivities.filter(a => a.type === 'reminder').length}
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  {todaysActivities.filter(a => a.type === 'reminder' && a.action.includes('Added')).length} Added
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedItemForReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Set Reminder</h3>
              <button
                onClick={() => {
                  setShowReminderModal(false)
                  setSelectedItemForReminder(null)
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-bold text-blue-900">
                  {selectedItemForReminder.type === 'equipment' ? 'Equipment' : 
                   selectedItemForReminder.type === 'permit' ? 'Permit' : 'Material'}: {selectedItemForReminder.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reminder Type</label>
                <select
                  id="reminderType"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="expiry">Expiry</option>
                  <option value="renewal">Renewal</option>
                  <option value="restock">Restock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  id="reminderMessage"
                  rows={3}
                  placeholder="Add reminder notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue={`${selectedItemForReminder.type} reminder for ${selectedItemForReminder.name}`}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReminderModal(false)
                    setSelectedItemForReminder(null)
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reminderType = (document.getElementById('reminderType') as HTMLSelectElement).value as any
                    const dueDate = (document.getElementById('dueDate') as HTMLInputElement).value
                    const message = (document.getElementById('reminderMessage') as HTMLTextAreaElement).value
                    if (dueDate) {
                      handleAddReminder(reminderType, dueDate, message)
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Equipment</h3>
              <button
                onClick={() => setShowAddEquipmentModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Equipment Name *"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({...equipmentForm, category: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cleaning">Cleaning</option>
                    <option value="Safety">Safety</option>
                    <option value="Access">Access</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Location *"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Cost (AED) *"
                    value={equipmentForm.cost}
                    onChange={(e) => setEquipmentForm({...equipmentForm, cost: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value as any})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={equipmentForm.quantity}
                    onChange={(e) => setEquipmentForm({...equipmentForm, quantity: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm({...equipmentForm, condition: e.target.value as any})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  <input
                    type="date"
                    value={equipmentForm.maintenanceDate}
                    onChange={(e) => setEquipmentForm({...equipmentForm, maintenanceDate: e.target.value})}
                    placeholder="Next Maintenance"
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={equipmentForm.purchaseDate}
                    onChange={(e) => setEquipmentForm({...equipmentForm, purchaseDate: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={equipmentForm.lastServiced}
                    onChange={(e) => setEquipmentForm({...equipmentForm, lastServiced: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEquipment}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Add Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Equipment</h3>
              <button
                onClick={() => {
                  setShowEditEquipmentModal(false);
                  setSelectedEquipment(null);
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Equipment Name"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={equipmentForm.category}
                  onChange={(e) => setEquipmentForm({...equipmentForm, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Safety">Safety</option>
                  <option value="Access">Access</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={equipmentForm.cost}
                  onChange={(e) => setEquipmentForm({...equipmentForm, cost: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={equipmentForm.status}
                  onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value as any})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={equipmentForm.quantity}
                  onChange={(e) => setEquipmentForm({...equipmentForm, quantity: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={equipmentForm.condition}
                  onChange={(e) => setEquipmentForm({...equipmentForm, condition: e.target.value as any})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
                <input
                  type="date"
                  value={equipmentForm.maintenanceDate}
                  onChange={(e) => setEquipmentForm({...equipmentForm, maintenanceDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditEquipmentModal(false);
                    setSelectedEquipment(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditEquipment}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Permit Modal */}
      {showAddPermitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Permit</h3>
              <button
                onClick={() => setShowAddPermitModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Permit Name *"
                  value={permitForm.name}
                  onChange={(e) => setPermitForm({...permitForm, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={permitForm.category}
                  onChange={(e) => setPermitForm({...permitForm, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Building">Building</option>
                  <option value="Safety">Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Labor">Labor</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Issuer Name *"
                  value={permitForm.issuer}
                  onChange={(e) => setPermitForm({...permitForm, issuer: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Cost (AED)"
                  value={permitForm.cost}
                  onChange={(e) => setPermitForm({...permitForm, cost: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={permitForm.issueDate}
                  onChange={(e) => setPermitForm({...permitForm, issueDate: e.target.value})}
                  placeholder="Issue Date"
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={permitForm.expiryDate}
                  onChange={(e) => setPermitForm({...permitForm, expiryDate: e.target.value})}
                  placeholder="Expiry Date *"
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={permitForm.renewalDate}
                  onChange={(e) => setPermitForm({...permitForm, renewalDate: e.target.value})}
                  placeholder="Renewal Date"
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={permitForm.status}
                  onChange={(e) => setPermitForm({...permitForm, status: e.target.value as any})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddPermitModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPermit}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Add Permit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permit Modal */}
      {showEditPermitModal && selectedPermit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Permit</h3>
              <button
                onClick={() => {
                  setShowEditPermitModal(false);
                  setSelectedPermit(null);
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Permit Name"
                  value={permitForm.name}
                  onChange={(e) => setPermitForm({...permitForm, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={permitForm.category}
                  onChange={(e) => setPermitForm({...permitForm, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Building">Building</option>
                  <option value="Safety">Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Labor">Labor</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Issuer Name"
                  value={permitForm.issuer}
                  onChange={(e) => setPermitForm({...permitForm, issuer: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={permitForm.cost}
                  onChange={(e) => setPermitForm({...permitForm, cost: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={permitForm.issueDate}
                  onChange={(e) => setPermitForm({...permitForm, issueDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={permitForm.expiryDate}
                  onChange={(e) => setPermitForm({...permitForm, expiryDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={permitForm.renewalDate}
                  onChange={(e) => setPermitForm({...permitForm, renewalDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={permitForm.status}
                  onChange={(e) => setPermitForm({...permitForm, status: e.target.value as any})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditPermitModal(false);
                    setSelectedPermit(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditPermit}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Material</h3>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Material Name *"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Chemicals">Chemicals</option>
                  <option value="Textiles">Textiles</option>
                  <option value="PPE">PPE</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Quantity *"
                  value={materialForm.quantity}
                  onChange={(e) => setMaterialForm({...materialForm, quantity: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="piece">Piece</option>
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="meter">Meter</option>
                  <option value="box">Box</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Unit Cost (AED) *"
                  value={materialForm.cost}
                  onChange={(e) => setMaterialForm({...materialForm, cost: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Supplier *"
                  value={materialForm.supplier}
                  onChange={(e) => setMaterialForm({...materialForm, supplier: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={materialForm.location}
                  onChange={(e) => setMaterialForm({...materialForm, location: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Reorder Level"
                  value={materialForm.reorderLevel}
                  onChange={(e) => setMaterialForm({...materialForm, reorderLevel: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setShowAddMaterialModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMaterial}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Add Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditMaterialModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Material</h3>
              <button
                onClick={() => {
                  setShowEditMaterialModal(false);
                  setSelectedMaterial(null);
                }}
                className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Material Name"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({...materialForm, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={materialForm.category}
                  onChange={(e) => setMaterialForm({...materialForm, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Chemicals">Chemicals</option>
                  <option value="Textiles">Textiles</option>
                  <option value="PPE">PPE</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={materialForm.quantity}
                  onChange={(e) => setMaterialForm({...materialForm, quantity: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={materialForm.unit}
                  onChange={(e) => setMaterialForm({...materialForm, unit: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="piece">Piece</option>
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="meter">Meter</option>
                  <option value="box">Box</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Unit Cost (AED)"
                  value={materialForm.cost}
                  onChange={(e) => setMaterialForm({...materialForm, cost: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={materialForm.supplier}
                  onChange={(e) => setMaterialForm({...materialForm, supplier: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={materialForm.location}
                  onChange={(e) => setMaterialForm({...materialForm, location: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Reorder Level"
                  value={materialForm.reorderLevel}
                  onChange={(e) => setMaterialForm({...materialForm, reorderLevel: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditMaterialModal(false);
                    setSelectedMaterial(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditMaterial}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}