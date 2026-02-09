// 'use client'

// import { useState, useCallback, useMemo, useEffect } from 'react'
// import {
//   Plus,
//   Search,
//   Calendar,
//   MapPin,
//   Users,
//   Trash2,
//   CheckCircle,
//   Clock,
//   X,
//   Briefcase,
//   DollarSign,
//   Camera,
//   Play,
//   Eye,
//   Bell,
//   BellOff,
//   ShoppingCart,
//   Edit,
//   Zap,
//   AlertTriangle,
//   Check,
//   TrendingUp,
//   UserPlus,
//   ExternalLink,
//   ChevronDown,
//   ListTodo,
//   FileText
// } from 'lucide-react'
// import Link from 'next/link'
// import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, where, getDoc } from 'firebase/firestore'
// import { db } from '@/lib/firebase'
// import { useRouter } from 'next/navigation'

// interface Job {
//   id: string
//   title: string
//   client: string
//   clientId: string
//   status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
//   priority: 'Low' | 'Medium' | 'High' | 'Critical'
//   scheduledDate: string | null
//   scheduledTime?: string
//   endTime?: string
//   location: string
//   teamRequired: number
//   budget: number
//   actualCost: number
//   description: string
//   riskLevel: 'Low' | 'Medium' | 'High'
//   slaDeadline?: string
//   estimatedDuration: string
//   requiredSkills: string[]
//   equipment: string[] // Changed from permits to equipment
//   permits: string[] // New field for permits
//   tags: string[]
//   specialInstructions?: string
//   recurring: boolean
//   createdAt: string
//   updatedAt: string
//   completedAt?: string
//   executionLogs: any[]
//   assignedTo: string[]
//   assignedEmployees: { id: string; name: string; email: string }[]
//   reminderEnabled?: boolean
//   reminderDate?: string
//   reminderSent?: boolean
//   services?: JobService[]
//   overtimeRequired?: boolean
//   overtimeHours?: number
//   overtimeReason?: string
//   overtimeApproved?: boolean
//   tasks?: JobTask[] // New field for tasks
// }

// interface JobService {
//   id: string
//   name: string
//   quantity: number
//   unitPrice: number
//   total: number
//   description?: string
// }

// // New interface for tasks
// interface JobTask {
//   id: string
//   title: string
//   description: string
//   duration: number // Duration in hours
//   completed: boolean
// }

// interface Equipment {
//   id: string
//   name: string
//   category: string
//   condition: string
//   cost: number
//   location: string
//   status: string
//   quantity: number
//   purchaseDate: string
//   lastServiced: string
//   maintenanceDate: string
//   createdAt: string
// }

// interface PermitLicense {
//   id: string
//   name: string
//   category: string
//   cost: number
//   expiryDate: string
//   issueDate: string
//   issuer: string
//   renewalDate: string
//   status: string
//   createdAt: string
//   pdfUrl?: string // New field for PDF file
// }

// interface ServiceItem {
//   id: string
//   name: string
//   description: string
//   price: number
//   cost: number
//   categoryId: string
//   categoryName: string
//   imageUrl: string
//   sku: string
//   status: string
//   type: string
//   unit: string
//   stock: number
//   minStock: number
//   createdAt: string
//   updatedAt: string
// }

// interface Employee {
//   id: string
//   name: string
//   email: string
//   department: string
//   position: string
//   status: string
// }

// interface NewJobForm {
//   title: string
//   client: string
//   clientId: string | null
//   priority: 'Low' | 'Medium' | 'High' | 'Critical'
//   scheduledDate: string
//   scheduledTime: string
//   endTime: string
//   location: string
//   teamRequired: number
//   budget: number
//   description: string
//   riskLevel: 'Low' | 'Medium' | 'High'
//   slaDeadline: string
//   estimatedDuration: string
//   requiredSkills: string
//   tags: string
//   specialInstructions: string
//   recurring: boolean
//   selectedEmployees: string[]
//   services?: JobService[]
//   tasks?: JobTask[] // New field for tasks
//   selectedEquipment: string[] // New field for selected equipment
//   selectedPermits: string[] // New field for selected permits
//   selectedServices: string[] // New field for selected services
// }

// export default function JobsPage() {
//   const router = useRouter()
//   const [jobs, setJobs] = useState<Job[]>([])
//   const [employees, setEmployees] = useState<Employee[]>([])
//   const [clients, setClients] = useState<any[]>([])
//   const [equipment, setEquipment] = useState<Equipment[]>([]) // State for equipment
//   const [permits, setPermits] = useState<PermitLicense[]>([]) // State for permits
//   const [services, setServices] = useState<ServiceItem[]>([]) // State for services
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilter, setStatusFilter] = useState<string>('all')
//   const [priorityFilter, setPriorityFilter] = useState<string>('all')
//   const [showNewJobModal, setShowNewJobModal] = useState(false)
//   const [showExecutionModal, setShowExecutionModal] = useState(false)
//   const [selectedJobForExecution, setSelectedJobForExecution] = useState<Job | null>(null)
//   const [executionChecklist, setExecutionChecklist] = useState<string[]>([])
//   const [executionNotes, setExecutionNotes] = useState('')
//   const [editingJobId, setEditingJobId] = useState<string | null>(null)
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [showTasksSection, setShowTasksSection] = useState(false) // For tasks visibility

//   const [newJobForm, setNewJobForm] = useState<NewJobForm>({
//     title: '',
//     client: '',
//     clientId: null,
//     priority: 'Medium',
//     scheduledDate: '',
//     scheduledTime: '',
//     endTime: '',
//     location: '',
//     teamRequired: 1,
//     budget: 0,
//     description: '',
//     riskLevel: 'Low',
//     slaDeadline: '',
//     estimatedDuration: '',
//     requiredSkills: '',
//     tags: '',
//     specialInstructions: '',
//     recurring: false,
//     selectedEmployees: [],
//     services: [],
//     tasks: [],
//     selectedEquipment: [],
//     selectedPermits: [],
//     selectedServices: []
//   })

//   // Fetch jobs, employees, clients, equipment, permits and services from Firebase
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch jobs
//         const jobsQuery = query(collection(db, 'jobs'))
//         const jobsSnapshot = await getDocs(jobsQuery)
        
//         const jobsData = jobsSnapshot.docs.map(doc => {
//           const data = doc.data()
//           return {
//             id: doc.id,
//             title: data.title || '',
//             client: data.client || '',
//             clientId: data.clientId || '',
//             status: data.status || 'Pending',
//             priority: data.priority || 'Medium',
//             scheduledDate: data.scheduledDate || null,
//             scheduledTime: data.scheduledTime || '',
//             endTime: data.endTime || '',
//             location: data.location || '',
//             teamRequired: data.teamRequired || 1,
//             budget: data.budget || 0,
//             actualCost: data.actualCost || 0,
//             description: data.description || '',
//             riskLevel: data.riskLevel || 'Low',
//             slaDeadline: data.slaDeadline || '',
//             estimatedDuration: data.estimatedDuration || '',
//             requiredSkills: data.requiredSkills || [],
//             equipment: data.equipment || [], // Changed from permits to equipment
//             permits: data.permits || [], // New field for permits
//             tags: data.tags || [],
//             specialInstructions: data.specialInstructions || '',
//             recurring: data.recurring || false,
//             createdAt: data.createdAt || new Date().toISOString(),
//             updatedAt: data.updatedAt || new Date().toISOString(),
//             completedAt: data.completedAt || '',
//             executionLogs: data.executionLogs || [],
//             assignedTo: data.assignedTo || [],
//             assignedEmployees: data.assignedEmployees || [],
//             reminderEnabled: data.reminderEnabled || false,
//             reminderDate: data.reminderDate || '',
//             reminderSent: data.reminderSent || false,
//             services: data.services || [],
//             tasks: data.tasks || [], // Include tasks
//             overtimeRequired: data.overtimeRequired || false,
//             overtimeHours: data.overtimeHours || 0,
//             overtimeReason: data.overtimeReason || '',
//             overtimeApproved: data.overtimeApproved || false
//           } as Job
//         })
        
//         setJobs(jobsData)

//         // Fetch employees
//         const employeesQuery = query(collection(db, 'employees'), where('status', '==', 'Active'))
//         const employeesSnapshot = await getDocs(employeesQuery)
        
//         const employeesData = employeesSnapshot.docs.map(doc => {
//           const data = doc.data()
//           return {
//             id: doc.id,
//             name: data.name || '',
//             email: data.email || '',
//             department: data.department || '',
//             position: data.position || '',
//             status: data.status || 'Active'
//           } as Employee
//         })
        
//         setEmployees(employeesData)

//         // Fetch clients
//         const clientsQuery = query(collection(db, 'clients'))
//         const clientsSnapshot = await getDocs(clientsQuery)
        
//         const clientsData = clientsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }))
        
//         setClients(clientsData)

//         // Fetch equipment
//         const equipmentQuery = query(collection(db, 'equipment'))
//         const equipmentSnapshot = await getDocs(equipmentQuery)
        
//         const equipmentData = equipmentSnapshot.docs.map(doc => {
//           const data = doc.data()
//           return {
//             id: doc.id,
//             name: data.name || '',
//             category: data.category || '',
//             condition: data.condition || '',
//             cost: data.cost || 0,
//             location: data.location || '',
//             status: data.status || 'Available',
//             quantity: data.quantity || 1,
//             purchaseDate: data.purchaseDate || '',
//             lastServiced: data.lastServiced || '',
//             maintenanceDate: data.maintenanceDate || '',
//             createdAt: data.createdAt || new Date().toISOString()
//           } as Equipment
//         })
        
//         setEquipment(equipmentData)

//         // Fetch permits_licenses
//         const permitsQuery = query(collection(db, 'permits_licenses'))
//         const permitsSnapshot = await getDocs(permitsQuery)
        
//         const permitsData = permitsSnapshot.docs.map(doc => {
//           const data = doc.data()
//           return {
//             id: doc.id,
//             name: data.name || '',
//             category: data.category || '',
//             cost: data.cost || 0,
//             expiryDate: data.expiryDate || '',
//             issueDate: data.issueDate || '',
//             issuer: data.issuer || '',
//             renewalDate: data.renewalDate || '',
//             status: data.status || 'Active',
//             createdAt: data.createdAt || new Date().toISOString(),
//             pdfUrl: data.pdfUrl || ''
//           } as PermitLicense
//         })
        
//         setPermits(permitsData)

//         // Fetch services
//         const servicesQuery = query(collection(db, 'services'))
//         const servicesSnapshot = await getDocs(servicesQuery)
        
//         const servicesData = servicesSnapshot.docs.map(doc => {
//           const data = doc.data()
//           return {
//             id: doc.id,
//             name: data.name || '',
//             description: data.description || '',
//             price: data.price || 0,
//             cost: data.cost || 0,
//             categoryId: data.categoryId || '',
//             categoryName: data.categoryName || '',
//             imageUrl: data.imageUrl || '',
//             sku: data.sku || '',
//             status: data.status || 'ACTIVE',
//             type: data.type || 'SERVICE',
//             unit: data.unit || 'Unit',
//             stock: data.stock || 0,
//             minStock: data.minStock || 0,
//             createdAt: data.createdAt || '',
//             updatedAt: data.updatedAt || ''
//           } as ServiceItem
//         })
        
//         setServices(servicesData)

//       } catch (error) {
//         console.error('Error fetching data:', error)
//       }
//     }

//     fetchData()
//   }, [])

//   // ========== EDIT FUNCTION ==========
//   const handleEditJob = async (jobId: string) => {
//     try {
//       setLoading(true)
//       const jobDoc = doc(db, 'jobs', jobId)
//       const jobSnapshot = await getDoc(jobDoc)
      
//       if (jobSnapshot.exists()) {
//         const jobData = jobSnapshot.data()
        
//         // Convert equipment array to selectedEquipment array
//         const selectedEquipment = equipment
//           .filter(eq => jobData.equipment?.includes(eq.name))
//           .map(eq => eq.id)

//         // Convert permits array to selectedPermits array
//         const selectedPermits = permits
//           .filter(p => jobData.permits?.includes(p.name))
//           .map(p => p.id)

//         // Convert services array to selectedServices array
//         const selectedServices = services
//           .filter(svc => jobData.services?.some((s: any) => s.name === svc.name))
//           .map(svc => svc.id)

//         setNewJobForm({
//           title: jobData.title || '',
//           client: jobData.client || '',
//           clientId: jobData.clientId || null,
//           priority: jobData.priority || 'Medium',
//           scheduledDate: jobData.scheduledDate || '',
//           scheduledTime: jobData.scheduledTime || '',
//           endTime: jobData.endTime || '',
//           location: jobData.location || '',
//           teamRequired: jobData.teamRequired || 1,
//           budget: jobData.budget || 0,
//           description: jobData.description || '',
//           riskLevel: jobData.riskLevel || 'Low',
//           slaDeadline: jobData.slaDeadline || '',
//           estimatedDuration: jobData.estimatedDuration || '',
//           requiredSkills: jobData.requiredSkills?.join(', ') || '',
//           tags: jobData.tags?.join(', ') || '',
//           specialInstructions: jobData.specialInstructions || '',
//           recurring: jobData.recurring || false,
//           selectedEmployees: jobData.assignedEmployees?.map((emp: any) => emp.id) || [],
//           services: jobData.services || [],
//           tasks: jobData.tasks || [],
//           selectedEquipment: selectedEquipment,
//           selectedPermits: selectedPermits,
//           selectedServices: selectedServices
//         })
        
//         setEditingJobId(jobId)
//         setShowNewJobModal(true)
//       }
//     } catch (error) {
//       console.error('Error fetching job for edit:', error)
//       alert('Error loading job details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ========== VIEW FUNCTION ==========
//   const handleViewJob = (jobId: string) => {
//     router.push(`/admin/jobs/${jobId}`)
//   }

//   // ========== DELETE FUNCTION ==========
//   const handleDeleteJob = async (jobId: string) => {
//     try {
//       setLoading(true)
      
//       // Delete from Firebase
//       const jobRef = doc(db, 'jobs', jobId)
//       await deleteDoc(jobRef)
      
//       // Update local state
//       setJobs(jobs.filter(j => j.id !== jobId))
//       setShowDeleteConfirm(null)
//       alert('Job deleted successfully!')
//     } catch (error) {
//       console.error('Error deleting job:', error)
//       alert('Error deleting job. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ========== SAVE/UPDATE FUNCTION ==========
//   const handleSaveJob = useCallback(async () => {
//     if (!newJobForm.title || !newJobForm.client || !newJobForm.location) {
//       alert('Please fill in all required fields: Title, Client, and Location')
//       return
//     }

//     try {
//       setLoading(true)
      
//       // Get selected employees details
//       const selectedEmployeesDetails = employees
//         .filter(emp => newJobForm.selectedEmployees.includes(emp.id))
//         .map(emp => ({
//           id: emp.id,
//           name: emp.name,
//           email: emp.email
//         }))

//       // Get selected equipment names from equipment collection
//       const selectedEquipmentNames = equipment
//         .filter(eq => newJobForm.selectedEquipment.includes(eq.id))
//         .map(eq => eq.name)

//       // Get selected permit names from permits collection
//       const selectedPermitNames = permits
//         .filter(p => newJobForm.selectedPermits.includes(p.id))
//         .map(p => p.name)

//       const jobData = {
//         title: newJobForm.title,
//         client: newJobForm.client,
//         clientId: newJobForm.clientId || '',
//         priority: newJobForm.priority,
//         scheduledDate: newJobForm.scheduledDate || null,
//         scheduledTime: newJobForm.scheduledTime,
//         endTime: newJobForm.endTime,
//         location: newJobForm.location,
//         teamRequired: newJobForm.teamRequired,
//         budget: newJobForm.budget,
//         description: newJobForm.description,
//         riskLevel: newJobForm.riskLevel,
//         slaDeadline: newJobForm.slaDeadline,
//         estimatedDuration: newJobForm.estimatedDuration,
//         requiredSkills: newJobForm.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
//         equipment: selectedEquipmentNames, // Equipment names
//         permits: selectedPermitNames, // Permit names
//         tags: newJobForm.tags.split(',').map(s => s.trim()).filter(s => s),
//         specialInstructions: newJobForm.specialInstructions,
//         recurring: newJobForm.recurring,
//         services: newJobForm.services || [],
//         tasks: newJobForm.tasks || [], // Include tasks
//         updatedAt: new Date().toISOString(),
//         assignedTo: selectedEmployeesDetails.map(emp => emp.name),
//         assignedEmployees: selectedEmployeesDetails,
//         actualCost: 0,
//         reminderEnabled: false
//       }

//       if (editingJobId) {
//         // Update existing job in Firebase
//         const jobRef = doc(db, 'jobs', editingJobId)
//         await updateDoc(jobRef, jobData)
        
//         // Update local state
//         setJobs(jobs.map(j =>
//           j.id === editingJobId
//             ? { ...j, ...jobData, id: editingJobId }
//             : j
//         ))
//         alert('Job updated successfully!')
//       } else {
//         // Create new job in Firebase
//         const newJobData = {
//           ...jobData,
//           status: 'Pending',
//           createdAt: new Date().toISOString(),
//           completedAt: '',
//           executionLogs: [],
//           reminderSent: false,
//           overtimeRequired: false,
//           overtimeHours: 0,
//           overtimeReason: '',
//           overtimeApproved: false
//         }

//         const docRef = await addDoc(collection(db, 'jobs'), newJobData)
        
//         // Add to local state with Firestore ID
//         const newJob: Job = {
//           id: docRef.id,
//           ...newJobData
//         } as Job
        
//         setJobs([...jobs, newJob])
//         alert('Job created successfully!')
//       }
      
//       setShowNewJobModal(false)
//       setEditingJobId(null)
//     } catch (error) {
//       console.error('Error saving job:', error)
//       alert('Error saving job. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }, [newJobForm, jobs, editingJobId, employees, equipment, permits])

//   // Calculate statistics
//   const stats = useMemo(() => ({
//     total: jobs.length,
//     pending: jobs.filter(j => j.status === 'Pending').length,
//     scheduled: jobs.filter(j => j.status === 'Scheduled').length,
//     inProgress: jobs.filter(j => j.status === 'In Progress').length,
//     completed: jobs.filter(j => j.status === 'Completed').length,
//     totalBudget: jobs.reduce((sum, j) => sum + j.budget, 0),
//     totalActualCost: jobs.reduce((sum, j) => sum + j.actualCost, 0),
//     critical: jobs.filter(j => j.priority === 'Critical').length
//   }), [jobs])

//   // Filter jobs
//   const filteredJobs = useMemo(() => {
//     return jobs.filter(job => {
//       const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            job.location.toLowerCase().includes(searchTerm.toLowerCase())

//       const matchesStatus = statusFilter === 'all' || job.status === statusFilter
//       const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter

//       return matchesSearch && matchesStatus && matchesPriority
//     })
//   }, [jobs, searchTerm, statusFilter, priorityFilter])

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'Critical': return 'bg-red-100 text-red-800 border-red-300'
//       case 'High': return 'bg-orange-100 text-orange-800 border-orange-300'
//       case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
//       default: return 'bg-blue-100 text-blue-800 border-blue-300'
//     }
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Completed': return 'bg-green-100 text-green-800 border-green-300'
//       case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300'
//       case 'Scheduled': return 'bg-purple-100 text-purple-800 border-purple-300'
//       case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
//       case 'Cancelled': return 'bg-gray-100 text-gray-800 border-gray-300'
//       default: return 'bg-gray-100 text-gray-800 border-gray-300'
//     }
//   }

//   const handleAddJob = () => {
//     setEditingJobId(null)
//     setShowTasksSection(false)
//     setNewJobForm({
//       title: '',
//       client: '',
//       clientId: null,
//       priority: 'Medium',
//       scheduledDate: '',
//       scheduledTime: '',
//       endTime: '',
//       location: '',
//       teamRequired: 1,
//       budget: 0,
//       description: '',
//       riskLevel: 'Low',
//       slaDeadline: '',
//       estimatedDuration: '',
//       requiredSkills: '',
//       tags: '',
//       specialInstructions: '',
//       recurring: false,
//       selectedEmployees: [],
//       services: [],
//       tasks: [],
//       selectedEquipment: [],
//       selectedPermits: [],
//       selectedServices: []
//     })
//     setShowNewJobModal(true)
//   }

//   // Toggle equipment selection
//   const toggleEquipmentSelection = (equipmentId: string) => {
//     setNewJobForm(prev => {
//       if (prev.selectedEquipment.includes(equipmentId)) {
//         return {
//           ...prev,
//           selectedEquipment: prev.selectedEquipment.filter(id => id !== equipmentId)
//         }
//       } else {
//         return {
//           ...prev,
//           selectedEquipment: [...prev.selectedEquipment, equipmentId]
//         }
//       }
//     })
//   }

//   // Toggle permit selection
//   const togglePermitSelection = (permitId: string) => {
//     setNewJobForm(prev => {
//       if (prev.selectedPermits.includes(permitId)) {
//         return {
//           ...prev,
//           selectedPermits: prev.selectedPermits.filter(id => id !== permitId)
//         }
//       } else {
//         return {
//           ...prev,
//           selectedPermits: [...prev.selectedPermits, permitId]
//         }
//       }
//     })
//   }

//   // Toggle service selection
//   const toggleServiceSelection = (serviceId: string) => {
//     setNewJobForm(prev => {
//       if (prev.selectedServices.includes(serviceId)) {
//         // Remove service from both selectedServices and services array
//         const updatedServices = prev.services?.filter(svc => 
//           !services.find(s => s.id === serviceId)?.name.includes(svc.name)
//         ) || []
        
//         return {
//           ...prev,
//           selectedServices: prev.selectedServices.filter(id => id !== serviceId),
//           services: updatedServices
//         }
//       } else {
//         // Add service to both arrays
//         const service = services.find(s => s.id === serviceId)
//         if (service) {
//           const newService: JobService = {
//             id: serviceId,
//             name: service.name,
//             quantity: 1,
//             unitPrice: service.price,
//             total: service.price,
//             description: service.description
//           }
          
//           return {
//             ...prev,
//             selectedServices: [...prev.selectedServices, serviceId],
//             services: [...(prev.services || []), newService]
//           }
//         }
//         return prev
//       }
//     })
//   }

//   // Add new task
//   const handleAddTask = () => {
//     const newTask: JobTask = {
//       id: Math.random().toString(36).substr(2, 9),
//       title: '',
//       description: '',
//       duration: 1, // Default 1 hour
//       completed: false
//     }
    
//     setNewJobForm(prev => ({
//       ...prev,
//       tasks: [...(prev.tasks || []), newTask]
//     }))
//   }

//   // Update task
//   const updateTask = (index: number, field: keyof JobTask, value: any) => {
//     const updatedTasks = [...(newJobForm.tasks || [])]
//     updatedTasks[index] = {
//       ...updatedTasks[index],
//       [field]: value
//     }
    
//     setNewJobForm(prev => ({
//       ...prev,
//       tasks: updatedTasks
//     }))
//   }

//   // Remove task
//   const removeTask = (index: number) => {
//     const updatedTasks = (newJobForm.tasks || []).filter((_, i) => i !== index)
//     setNewJobForm(prev => ({
//       ...prev,
//       tasks: updatedTasks
//     }))
//   }

//   const handleToggleReminder = useCallback(async (jobId: string) => {
//     try {
//       const job = jobs.find(j => j.id === jobId)
//       if (!job) return

//       const newReminderEnabled = !job.reminderEnabled
//       let reminderDate = job.reminderDate
      
//       if (newReminderEnabled && job.scheduledDate) {
//         const reminder = new Date(job.scheduledDate + 'T00:00:00')
//         reminder.setDate(reminder.getDate() - 1)
//         reminderDate = reminder.toISOString().split('T')[0]
//       }

//       // Update in Firebase
//       const jobRef = doc(db, 'jobs', jobId)
//       await updateDoc(jobRef, {
//         reminderEnabled: newReminderEnabled,
//         reminderDate: reminderDate
//       })

//       // Update local state
//       setJobs(jobs.map(j => {
//         if (j.id === jobId) {
//           return {
//             ...j,
//             reminderEnabled: newReminderEnabled,
//             reminderDate: reminderDate
//           }
//         }
//         return j
//       }))
//     } catch (error) {
//       console.error('Error updating reminder:', error)
//       alert('Error updating reminder')
//     }
//   }, [jobs])

//   const handleUpdateJobStatus = useCallback(async (jobId: string, newStatus: Job['status']) => {
//     try {
//       // Update in Firebase
//       const jobRef = doc(db, 'jobs', jobId)
//       await updateDoc(jobRef, {
//         status: newStatus,
//         updatedAt: new Date().toISOString()
//       })

//       // Update local state
//       setJobs(jobs.map(j =>
//         j.id === jobId
//           ? { ...j, status: newStatus, updatedAt: new Date().toISOString() }
//           : j
//       ))
//       alert(`Job status updated to ${newStatus}`)
//     } catch (error) {
//       console.error('Error updating job status:', error)
//       alert('Error updating job status')
//     }
//   }, [jobs])

//   const handleStartExecution = (job: Job) => {
//     setSelectedJobForExecution(job)
//     setExecutionChecklist([])
//     setExecutionNotes('')
//     setShowExecutionModal(true)
//   }

//   const handleLogExecution = async () => {
//     if (!selectedJobForExecution) return
    
//     try {
//       // Update job status in Firebase
//       const jobRef = doc(db, 'jobs', selectedJobForExecution.id)
//       await updateDoc(jobRef, {
//         status: 'In Progress',
//         updatedAt: new Date().toISOString()
//       })

//       // Add execution log
//       const executionLog = {
//         timestamp: new Date().toISOString(),
//         checklist: executionChecklist,
//         notes: executionNotes,
//         type: 'execution_started'
//       }

//       await updateDoc(jobRef, {
//         executionLogs: [...selectedJobForExecution.executionLogs, executionLog]
//       })

//       // Update local state
//       handleUpdateJobStatus(selectedJobForExecution.id, 'In Progress')
//       setShowExecutionModal(false)
//     } catch (error) {
//       console.error('Error logging execution:', error)
//       alert('Error logging execution')
//     }
//   }

//   const toggleEmployeeSelection = (employeeId: string) => {
//     setNewJobForm(prev => {
//       if (prev.selectedEmployees.includes(employeeId)) {
//         return {
//           ...prev,
//           selectedEmployees: prev.selectedEmployees.filter(id => id !== employeeId)
//         }
//       } else {
//         // Check if we can add more employees based on teamRequired
//         if (prev.selectedEmployees.length >= prev.teamRequired) {
//           alert(`Maximum ${prev.teamRequired} employees can be assigned to this job. Please increase team size or remove existing selections.`)
//           return prev
//         }
//         return {
//           ...prev,
//           selectedEmployees: [...prev.selectedEmployees, employeeId]
//         }
//       }
//     })
//   }

//   // Get selected employee names for display
//   const getSelectedEmployeeNames = () => {
//     return newJobForm.selectedEmployees.map(empId => {
//       const emp = employees.find(e => e.id === empId)
//       return emp ? emp.name : ''
//     }).filter(name => name)
//   }

//   // Get selected equipment for display
//   const getSelectedEquipmentNames = () => {
//     return newJobForm.selectedEquipment.map(eqId => {
//       const eq = equipment.find(e => e.id === eqId)
//       return eq ? `${eq.name} (${eq.category})` : ''
//     }).filter(name => name)
//   }

//   // Get selected permits for display
//   const getSelectedPermitNames = () => {
//     return newJobForm.selectedPermits.map(pId => {
//       const p = permits.find(p => p.id === pId)
//       return p ? `${p.name} (${p.category})` : ''
//     }).filter(name => name)
//   }

//   // Get selected services for display
//   const getSelectedServiceNames = () => {
//     return newJobForm.selectedServices.map(svcId => {
//       const svc = services.find(s => s.id === svcId)
//       return svc ? svc.name : ''
//     }).filter(name => name)
//   }

//   return (
//     <div className="space-y-6 pb-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Management</h1>
//         <p className="text-gray-600">Manage, track, and execute cleaning jobs in real-time</p>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
//               <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
//             </div>
//             <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Briefcase className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">In Progress</p>
//               <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
//             </div>
//             <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Clock className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Completed</p>
//               <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//             </div>
//             <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Budget Utilization</p>
//               <p className="text-2xl font-bold text-orange-600 mt-2">
//                 {stats.totalBudget > 0 ? ((stats.totalActualCost / stats.totalBudget) * 100).toFixed(0) : '0'}%
//               </p>
//             </div>
//             <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-orange-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Search & Filters */}
//       <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
//         <div className="flex flex-col lg:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by job title, client, or location..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//             />
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Status</option>
//               <option value="Pending">Pending</option>
//               <option value="Scheduled">Scheduled</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Completed">Completed</option>
//             </select>

//             <select
//               value={priorityFilter}
//               onChange={(e) => setPriorityFilter(e.target.value)}
//               className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="all">All Priority</option>
//               <option value="Low">Low</option>
//               <option value="Medium">Medium</option>
//               <option value="High">High</option>
//               <option value="Critical">Critical</option>
//             </select>

//             <button
//               onClick={handleAddJob}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               New Job
//             </button>

//             <Link href="/admin/jobs/expense-manager">
//               <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
//                 <DollarSign className="w-4 h-4" />
//                 Expense Manager
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Jobs List */}
//       <div className="space-y-3">
//         {filteredJobs.length > 0 ? (
//           filteredJobs.map((job) => (
//             <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex-1">
//                   {/* Clickable Job Title and Details - FIXED */}
//                   <Link href={`/admin/jobs/${job.id}`} className="block mb-3 group">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
//                           {job.title}
//                         </h3>
//                         <p className="text-sm text-gray-600 mt-1">{job.client}</p>
//                       </div>
//                       <div className="flex gap-2 flex-wrap justify-end">
//                         <span className={`text-xs font-bold px-3 py-1 border rounded-full ${getPriorityColor(job.priority)}`}>
//                           {job.priority}
//                         </span>
//                         <span className={`text-xs font-bold px-3 py-1 border rounded-full ${getStatusColor(job.status)}`}>
//                           {job.status}
//                         </span>
//                         {job.overtimeRequired && (
//                           <span className={`text-xs font-bold px-3 py-1 border rounded-full flex items-center gap-1 ${job.overtimeApproved ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
//                             <Zap className="h-3 w-3" /> OT: {job.overtimeHours}h {job.overtimeApproved ? '✓' : ''}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="h-4 w-4 shrink-0" />
//                         <span>{job.scheduledDate ? new Date(job.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Not scheduled'}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <MapPin className="h-4 w-4 shrink-0" />
//                         <span>{job.location}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4 shrink-0" />
//                         <span>{job.teamRequired} members</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <DollarSign className="h-4 w-4 shrink-0" />
//                         <span>AED {job.budget.toLocaleString()}</span>
//                       </div>
//                     </div>

//                     {job.description && (
//                       <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
//                     )}

//                     {/* Assigned Employees Section */}
//                     {job.assignedEmployees && job.assignedEmployees.length > 0 && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Users className="h-4 w-4 text-gray-500" />
//                           <p className="text-xs font-semibold text-gray-600">Assigned Team:</p>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {job.assignedEmployees.map((employee, idx) => (
//                             <span
//                               key={employee.id}
//                               className={`text-xs px-2 py-1 rounded-full border font-medium ${
//                                 job.status === 'In Progress'
//                                   ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//                                   : job.status === 'Scheduled'
//                                   ? 'bg-blue-50 text-blue-700 border-blue-200'
//                                   : 'bg-gray-50 text-gray-700 border-gray-200'
//                               }`}
//                             >
//                               {employee.name}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </Link>

//                   {/* Action Buttons - INCLUDING EDIT, VIEW, DELETE */}
//                   <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
//                     {/* EDIT BUTTON */}
//                     <button
//                       onClick={() => handleEditJob(job.id)}
//                       className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-1"
//                       disabled={loading}
//                     >
//                       <Edit className="h-3 w-3" />
//                       Edit
//                     </button>

//                     {/* VIEW BUTTON */}
//                     <button
//                       onClick={() => handleViewJob(job.id)}
//                       className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-1"
//                     >
//                       <Eye className="h-3 w-3" />
//                       View Details
//                     </button>

//                     {/* DELETE BUTTON */}
//                     <button
//                       onClick={() => setShowDeleteConfirm(job.id)}
//                       className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
//                       disabled={loading}
//                     >
//                       <Trash2 className="h-3 w-3" />
//                       Delete
//                     </button>

//                     {/* Existing Action Buttons */}
//                     {job.status === 'Pending' && (
//                       <>
//                         <button
//                           onClick={() => handleUpdateJobStatus(job.id, 'Scheduled')}
//                           className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
//                         >
//                           Schedule
//                         </button>
//                       </>
//                     )}

//                     {(job.status === 'Scheduled' || job.status === 'In Progress') && (
//                       <>
//                         <button
//                           onClick={() => handleToggleReminder(job.id)}
//                           className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
//                             job.reminderEnabled
//                               ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
//                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                           }`}
//                         >
//                           {job.reminderEnabled ? (
//                             <>
//                               <Bell className="h-3 w-3" />
//                               Reminder Set
//                             </>
//                           ) : (
//                             <>
//                               <BellOff className="h-3 w-3" />
//                               Set Reminder
//                             </>
//                           )}
//                         </button>
//                       </>
//                     )}

//                     {job.reminderEnabled && job.reminderDate && (
//                       <div className="text-xs px-2 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 flex items-center gap-1">
//                         <Clock className="h-3 w-3" />
//                         Reminder: {new Date(job.reminderDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                       </div>
//                     )}

//                     {job.status === 'Scheduled' && (
//                       <>
//                         <button
//                           onClick={() => handleStartExecution(job)}
//                           className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
//                         >
//                           <Play className="h-3 w-3" />
//                           Execute
//                         </button>
//                         <button
//                           onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}
//                           className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
//                         >
//                           Start
//                         </button>
//                       </>
//                     )}

//                     {job.status === 'In Progress' && (
//                       <>
//                         <button
//                           onClick={() => handleStartExecution(job)}
//                           className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium flex items-center gap-1"
//                         >
//                           <Camera className="h-3 w-3" />
//                           On Site
//                         </button>
//                         <button
//                           onClick={() => handleUpdateJobStatus(job.id, 'Completed')}
//                           className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-1"
//                         >
//                           <CheckCircle className="h-3 w-3" />
//                           Complete
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
//             <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//             <p className="text-lg font-medium text-gray-900">No jobs found</p>
//             <p className="text-sm text-gray-600">Try adjusting your filters or create a new job</p>
//           </div>
//         )}
//       </div>

//       {/* New Job/Edit Modal */}
//       {showNewJobModal && (
//         <div className="fixed inset-0 z-50">
//           <div 
//             className="absolute inset-0 backdrop-blur-sm bg-black/10" 
//             onClick={() => { 
//               setShowNewJobModal(false); 
//               setEditingJobId(null); 
//             }}
//           ></div>
//           <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
//             {/* Header */}
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
//               <div>
//                 <h2 className="text-2xl font-bold">{editingJobId ? 'Edit Job' : 'Create New Job'}</h2>
//                 <p className="text-blue-100 text-sm mt-1">Complete all job details</p>
//               </div>
//               <button onClick={() => { setShowNewJobModal(false); setEditingJobId(null) }} className="text-blue-100 hover:text-white transition-colors">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             {/* Scrollable Content */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               {/* Basic Information */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <Briefcase className="h-5 w-5 text-blue-600" />
//                   Basic Information
//                 </h3>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2">
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title *</label>
//                     <input
//                       type="text"
//                       value={newJobForm.title}
//                       onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       placeholder="e.g., Office Deep Cleaning"
//                     />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Client *</label>
//                     <select
//                       value={newJobForm.clientId || ''}
//                       onChange={(e) => {
//                         const selected = clients.find(c => c.id === e.target.value)
//                         setNewJobForm({
//                           ...newJobForm,
//                           clientId: selected?.id || null,
//                           client: selected?.name || ''
//                         })
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     >
//                       <option value="">Select a client</option>
//                       {clients.map((client) => (
//                         <option key={client.id} value={client.id}>
//                           {client.name}
//                         </option>
//                       ))}
//                     </select>
//                     {newJobForm.clientId === null && newJobForm.client && (
//                       <p className="text-sm text-gray-500 mt-1">Client will be saved as: {newJobForm.client}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
//                   <textarea
//                     value={newJobForm.description}
//                     onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     rows={3}
//                     placeholder="Detailed job description..."
//                   />
//                 </div>
//               </div>

//               {/* Team Assignment Section - DROPDOWN STYLE */}
//               <div className="space-y-4 border-b pb-6">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                     <UserPlus className="h-5 w-5 text-blue-600" />
//                     Assign Team Members
//                   </h3>
//                   <span className="text-sm font-medium text-gray-600">
//                     Selected: {newJobForm.selectedEmployees.length} of {newJobForm.teamRequired}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Team Size Required *</label>
//                     <input
//                       type="number"
//                       value={newJobForm.teamRequired}
//                       onChange={(e) => {
//                         const newSize = parseInt(e.target.value) || 1
//                         setNewJobForm({
//                           ...newJobForm,
//                           teamRequired: newSize,
//                           selectedEmployees: newJobForm.selectedEmployees.slice(0, newSize)
//                         })
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       min="1"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Selected Members</label>
//                     <div className="p-2 bg-gray-50 rounded-lg border border-gray-300 min-h-[42px]">
//                       {getSelectedEmployeeNames().length > 0 ? (
//                         <div className="flex flex-wrap gap-1">
//                           {getSelectedEmployeeNames().map((name, idx) => (
//                             <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
//                               {name}
//                               <button
//                                 type="button"
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   const empId = newJobForm.selectedEmployees[idx]
//                                   toggleEmployeeSelection(empId)
//                                 }}
//                                 className="hover:text-blue-900"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-sm text-gray-500">No employees selected</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Employees Dropdown */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-900">Select Employees</label>
//                   <div className="relative">
//                     <select
//                       multiple
//                       value={newJobForm.selectedEmployees}
//                       onChange={(e) => {
//                         const selected = Array.from(e.target.selectedOptions).map(option => option.value)
//                         setNewJobForm(prev => ({
//                           ...prev,
//                           selectedEmployees: selected.slice(0, prev.teamRequired)
//                         }))
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
//                       size={5}
//                     >
//                       {employees.length > 0 ? (
//                         employees.map(employee => (
//                           <option key={employee.id} value={employee.id}>
//                             {employee.name} - {employee.position} ({employee.department})
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No active employees found</option>
//                       )}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple employees</p>
//                 </div>
//               </div>

//               {/* Location & Priority */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <MapPin className="h-5 w-5 text-blue-600" />
//                   Location & Priority
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Location *</label>
//                   <input
//                     type="text"
//                     value={newJobForm.location}
//                     onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     placeholder="Enter job location"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Priority *</label>
//                     <select
//                       value={newJobForm.priority}
//                       onChange={(e) => setNewJobForm({...newJobForm, priority: e.target.value as any})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     >
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                       <option value="Critical">Critical</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Risk Level *</label>
//                     <select
//                       value={newJobForm.riskLevel}
//                       onChange={(e) => setNewJobForm({...newJobForm, riskLevel: e.target.value as any})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     >
//                       <option value="Low">Low</option>
//                       <option value="Medium">Medium</option>
//                       <option value="High">High</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Scheduling */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <Calendar className="h-5 w-5 text-blue-600" />
//                   Scheduling
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Scheduled Date</label>
//                   <input
//                     type="date"
//                     value={newJobForm.scheduledDate}
//                     onChange={(e) => setNewJobForm({...newJobForm, scheduledDate: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Start Time</label>
//                     <input
//                       type="time"
//                       value={newJobForm.scheduledTime}
//                       onChange={(e) => setNewJobForm({...newJobForm, scheduledTime: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">End Time</label>
//                     <input
//                       type="time"
//                       value={newJobForm.endTime}
//                       onChange={(e) => setNewJobForm({...newJobForm, endTime: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Duration</label>
//                     <input
//                       type="text"
//                       value={newJobForm.estimatedDuration}
//                       onChange={(e) => setNewJobForm({...newJobForm, estimatedDuration: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       placeholder="e.g., 8 hours"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-900 mb-2">SLA Deadline</label>
//                     <input
//                       type="date"
//                       value={newJobForm.slaDeadline}
//                       onChange={(e) => setNewJobForm({...newJobForm, slaDeadline: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Resources & Budget */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <DollarSign className="h-5 w-5 text-blue-600" />
//                   Resources & Budget
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Budget (AED) *</label>
//                   <input
//                     type="number"
//                     value={newJobForm.budget}
//                     onChange={(e) => setNewJobForm({...newJobForm, budget: parseInt(e.target.value) || 0})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     min="0"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Required Skills</label>
//                   <textarea
//                     value={newJobForm.requiredSkills}
//                     onChange={(e) => setNewJobForm({...newJobForm, requiredSkills: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     rows={2}
//                     placeholder="Enter skills separated by comma. e.g., General Cleaning, Floor Care"
//                   />
//                 </div>
//               </div>

//               {/* Equipment Section - DROPDOWN STYLE */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <CheckCircle className="h-5 w-5 text-blue-600" />
//                   Required Equipment
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Selected Equipment</label>
//                   <div className="p-2 bg-gray-50 rounded-lg border border-gray-300 min-h-[42px]">
//                     {getSelectedEquipmentNames().length > 0 ? (
//                       <div className="flex flex-wrap gap-1">
//                         {getSelectedEquipmentNames().map((name, idx) => (
//                           <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
//                             {name}
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 const eqId = newJobForm.selectedEquipment[idx]
//                                 toggleEquipmentSelection(eqId)
//                               }}
//                               className="hover:text-green-900"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">No equipment selected</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-900">Select Equipment</label>
//                   <div className="relative">
//                     <select
//                       multiple
//                       value={newJobForm.selectedEquipment}
//                       onChange={(e) => {
//                         const selected = Array.from(e.target.selectedOptions).map(option => option.value)
//                         setNewJobForm(prev => ({
//                           ...prev,
//                           selectedEquipment: selected
//                         }))
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
//                       size={5}
//                     >
//                       {equipment.length > 0 ? (
//                         equipment.map(eq => (
//                           <option key={eq.id} value={eq.id}>
//                             {eq.name} - {eq.category} ({eq.status})
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No equipment found</option>
//                       )}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple equipment</p>
//                 </div>
//               </div>

//               {/* Permits Section - DROPDOWN STYLE */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <FileText className="h-5 w-5 text-blue-600" />
//                   Required Permits & Licenses
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Selected Permits/Licenses</label>
//                   <div className="p-2 bg-gray-50 rounded-lg border border-gray-300 min-h-[42px]">
//                     {getSelectedPermitNames().length > 0 ? (
//                       <div className="flex flex-wrap gap-1">
//                         {getSelectedPermitNames().map((name, idx) => (
//                           <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
//                             {name}
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 const pId = newJobForm.selectedPermits[idx]
//                                 togglePermitSelection(pId)
//                               }}
//                               className="hover:text-purple-900"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">No permits/licenses selected</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-900">Select Permits/Licenses</label>
//                   <div className="relative">
//                     <select
//                       multiple
//                       value={newJobForm.selectedPermits}
//                       onChange={(e) => {
//                         const selected = Array.from(e.target.selectedOptions).map(option => option.value)
//                         setNewJobForm(prev => ({
//                           ...prev,
//                           selectedPermits: selected
//                         }))
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
//                       size={5}
//                     >
//                       {permits.length > 0 ? (
//                         permits.map(p => (
//                           <option key={p.id} value={p.id}>
//                             {p.name} - {p.category} (Expires: {p.expiryDate})
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No permits/licenses found</option>
//                       )}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple permits/licenses</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Job Tags</label>
//                   <textarea
//                     value={newJobForm.tags}
//                     onChange={(e) => setNewJobForm({...newJobForm, tags: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     rows={2}
//                     placeholder="Enter tags separated by comma. e.g., Office, Commercial, Urgent"
//                   />
//                 </div>
//               </div>

//               {/* Services - DROPDOWN STYLE */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <ShoppingCart className="h-5 w-5 text-blue-600" />
//                   Job Services
//                 </h3>
//                 <p className="text-sm text-gray-600">Select services for this job</p>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Selected Services</label>
//                   <div className="p-2 bg-gray-50 rounded-lg border border-gray-300 min-h-[42px]">
//                     {getSelectedServiceNames().length > 0 ? (
//                       <div className="flex flex-wrap gap-1">
//                         {getSelectedServiceNames().map((name, idx) => (
//                           <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">
//                             {name}
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 const svcId = newJobForm.selectedServices[idx]
//                                 toggleServiceSelection(svcId)
//                               }}
//                               className="hover:text-orange-900"
//                             >
//                               <X className="h-3 w-3" />
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">No services selected</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-900">Select Services</label>
//                   <div className="relative">
//                     <select
//                       multiple
//                       value={newJobForm.selectedServices}
//                       onChange={(e) => {
//                         const selected = Array.from(e.target.selectedOptions).map(option => option.value)
//                         setNewJobForm(prev => ({
//                           ...prev,
//                           selectedServices: selected
//                         }))
//                       }}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
//                       size={5}
//                     >
//                       {services.length > 0 ? (
//                         services.map(svc => (
//                           <option key={svc.id} value={svc.id}>
//                             {svc.name} - AED {svc.price} ({svc.categoryName})
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No services found</option>
//                       )}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple services</p>
//                 </div>

//                 {/* Service Details Table */}
//                 {(newJobForm.services || []).length > 0 && (
//                   <div className="mt-4">
//                     <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
//                     <div className="overflow-x-auto">
//                       <table className="w-full border-collapse border border-gray-300 rounded-lg">
//                         <thead>
//                           <tr className="bg-gray-100">
//                             <th className="border border-gray-300 px-3 py-2 text-left text-sm">Service</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-sm">Qty</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-sm">Price</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-sm">Total</th>
//                             <th className="border border-gray-300 px-3 py-2 text-left text-sm">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {(newJobForm.services || []).map((service, idx) => (
//                             <tr key={service.id}>
//                               <td className="border border-gray-300 px-3 py-2 text-sm">{service.name}</td>
//                               <td className="border border-gray-300 px-3 py-2">
//                                 <input
//                                   type="number"
//                                   value={service.quantity}
//                                   onChange={(e) => {
//                                     const updated = [...(newJobForm.services || [])]
//                                     updated[idx].quantity = parseInt(e.target.value) || 0
//                                     updated[idx].total = updated[idx].quantity * updated[idx].unitPrice
//                                     setNewJobForm({ ...newJobForm, services: updated })
//                                   }}
//                                   className="w-20 px-2 py-1 border rounded"
//                                   min="1"
//                                 />
//                               </td>
//                               <td className="border border-gray-300 px-3 py-2">AED {service.unitPrice}</td>
//                               <td className="border border-gray-300 px-3 py-2">AED {service.total}</td>
//                               <td className="border border-gray-300 px-3 py-2">
//                                 <button
//                                   onClick={() => {
//                                     const svcId = services.find(s => s.name === service.name)?.id
//                                     if (svcId) toggleServiceSelection(svcId)
//                                   }}
//                                   className="text-red-600 hover:text-red-700 text-sm"
//                                 >
//                                   Remove
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Add Tasks Section */}
//               <div className="space-y-4 border-b pb-6">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                     <ListTodo className="h-5 w-5 text-blue-600" />
//                     Job Tasks
//                   </h3>
//                   <button
//                     onClick={() => setShowTasksSection(!showTasksSection)}
//                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                     {showTasksSection ? 'Hide Tasks' : 'Add Tasks'}
//                   </button>
//                 </div>

//                 {showTasksSection && (
//                   <div className="space-y-4">
//                     <button
//                       onClick={handleAddTask}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
//                     >
//                       <Plus className="w-4 h-4" />
//                       Add New Task
//                     </button>

//                     <div className="space-y-3">
//                       {(newJobForm.tasks || []).map((task, idx) => (
//                         <div key={task.id} className="p-4 border border-gray-300 rounded-lg space-y-3 bg-gray-50">
//                           <div className="grid grid-cols-2 gap-4">
//                             <div className="col-span-2">
//                               <label className="block text-sm font-medium text-gray-900 mb-1">Task Title *</label>
//                               <input
//                                 type="text"
//                                 placeholder="e.g., Clean Windows"
//                                 value={task.title}
//                                 onChange={(e) => updateTask(idx, 'title', e.target.value)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                               />
//                             </div>
//                             <div className="col-span-2">
//                               <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
//                               <textarea
//                                 placeholder="Task description..."
//                                 value={task.description}
//                                 onChange={(e) => updateTask(idx, 'description', e.target.value)}
//                                 rows={2}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-900 mb-1">Duration (hours) *</label>
//                               <input
//                                 type="number"
//                                 placeholder="1"
//                                 value={task.duration}
//                                 onChange={(e) => updateTask(idx, 'duration', parseInt(e.target.value) || 1)}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                                 min="1"
//                               />
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <input
//                                 type="checkbox"
//                                 checked={task.completed}
//                                 onChange={(e) => updateTask(idx, 'completed', e.target.checked)}
//                                 className="w-4 h-4 rounded"
//                                 id={`task-completed-${idx}`}
//                               />
//                               <label htmlFor={`task-completed-${idx}`} className="text-sm font-medium text-gray-900 cursor-pointer">
//                                 Completed
//                               </label>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => removeTask(idx)}
//                             className="text-red-600 hover:text-red-700 text-sm font-medium"
//                           >
//                             Remove Task
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Special Instructions */}
//               <div className="space-y-4 border-b pb-6">
//                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-blue-600" />
//                   Special Instructions
//                 </h3>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-900 mb-2">Special Instructions</label>
//                   <textarea
//                     value={newJobForm.specialInstructions}
//                     onChange={(e) => setNewJobForm({...newJobForm, specialInstructions: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     rows={3}
//                     placeholder="Any special instructions or notes for this job..."
//                   />
//                 </div>

//                 <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                   <input
//                     type="checkbox"
//                     checked={newJobForm.recurring}
//                     onChange={(e) => setNewJobForm({...newJobForm, recurring: e.target.checked})}
//                     className="w-4 h-4 rounded"
//                     id="recurring"
//                   />
//                   <label htmlFor="recurring" className="text-sm font-medium text-gray-900 cursor-pointer">
//                     This is a recurring job
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons - Fixed Bottom */}
//             <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
//               <button
//                 onClick={() => { setShowNewJobModal(false); setEditingJobId(null) }}
//                 className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveJob}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center gap-2"
//                 disabled={loading}
//               >
//                 {loading ? 'Saving...' : editingJobId ? 'Update Job' : 'Create Job'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full">
//             <div className="p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
//                   <Trash2 className="h-5 w-5 text-red-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-900">Delete Job</h3>
//                   <p className="text-sm text-gray-600">This action cannot be undone</p>
//                 </div>
//               </div>
              
//               <p className="text-gray-700 mb-6">
//                 Are you sure you want to delete this job? All associated data will be permanently removed from Firebase.
//               </p>
              
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(null)}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteJob(showDeleteConfirm)}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
//                   disabled={loading}
//                 >
//                   {loading ? 'Deleting...' : 'Delete Job'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Execution Modal */}
//       {showExecutionModal && selectedJobForExecution && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-gray-900">Execute: {selectedJobForExecution.title}</h2>
//               <button onClick={() => setShowExecutionModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Job Details */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div><span className="text-gray-600">Client: </span><span className="font-semibold">{selectedJobForExecution.client}</span></div>
//                   <div><span className="text-gray-600">Location: </span><span className="font-semibold">{selectedJobForExecution.location}</span></div>
//                   <div><span className="text-gray-600">Team Size: </span><span className="font-semibold">{selectedJobForExecution.teamRequired}</span></div>
//                   <div><span className="text-gray-600">Budget: </span><span className="font-semibold">AED {selectedJobForExecution.budget.toLocaleString()}</span></div>
//                 </div>
//               </div>

//               {/* Assigned Team */}
//               {selectedJobForExecution.assignedEmployees && selectedJobForExecution.assignedEmployees.length > 0 && (
//                 <div className="space-y-3">
//                   <h3 className="font-semibold text-gray-900">Assigned Team</h3>
//                   <div className="grid grid-cols-2 gap-3">
//                     {selectedJobForExecution.assignedEmployees.map(employee => (
//                       <div key={employee.id} className="p-3 border rounded-lg bg-gray-50">
//                         <p className="font-medium text-gray-900">{employee.name}</p>
//                         <p className="text-xs text-gray-600">{employee.email}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Tasks Section */}
//               {selectedJobForExecution.tasks && selectedJobForExecution.tasks.length > 0 && (
//                 <div className="space-y-3">
//                   <h3 className="font-semibold text-gray-900">Job Tasks</h3>
//                   <div className="space-y-2">
//                     {selectedJobForExecution.tasks.map((task, idx) => (
//                       <div key={idx} className="p-3 border rounded-lg">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="font-medium text-gray-900">{task.title}</p>
//                             <p className="text-sm text-gray-600">{task.description}</p>
//                             <p className="text-xs text-gray-500 mt-1">Duration: {task.duration} hours</p>
//                           </div>
//                           <span className={`px-2 py-1 text-xs rounded-full ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                             {task.completed ? 'Completed' : 'Pending'}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Equipment Section */}
//               {selectedJobForExecution.equipment && selectedJobForExecution.equipment.length > 0 && (
//                 <div className="space-y-3">
//                   <h3 className="font-semibold text-gray-900">Required Equipment</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedJobForExecution.equipment.map((eq, idx) => (
//                       <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
//                         {eq}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Permits Section */}
//               {selectedJobForExecution.permits && selectedJobForExecution.permits.length > 0 && (
//                 <div className="space-y-3">
//                   <h3 className="font-semibold text-gray-900">Required Permits/Licenses</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {selectedJobForExecution.permits.map((p, idx) => (
//                       <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
//                         {p}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Checklist */}
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-gray-900">Pre-Execution Checklist</h3>
//                 {['Team arrived on site', 'Equipment setup', 'Safety review', 'Client briefing', 'Work area secured', 'Permits verified'].map(item => (
//                   <label key={item} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={executionChecklist.includes(item)}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setExecutionChecklist([...executionChecklist, item])
//                         } else {
//                           setExecutionChecklist(executionChecklist.filter(i => i !== item))
//                         }
//                       }}
//                       className="w-4 h-4 rounded"
//                     />
//                     <span className="text-sm">{item}</span>
//                   </label>
//                 ))}
//               </div>

//               {/* Photos */}
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-gray-900">Documentation</h3>
//                 <div className="grid grid-cols-3 gap-4">
//                   {['Before', 'During', 'After'].map(label => (
//                     <div key={label} className="aspect-square bg-gray-100 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
//                       <Camera className="h-8 w-8 text-gray-400 mb-2" />
//                       <p className="text-xs text-gray-600">{label}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Notes */}
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-gray-900">Notes</h3>
//                 <textarea
//                   value={executionNotes}
//                   onChange={(e) => setExecutionNotes(e.target.value)}
//                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   rows={4}
//                   placeholder="Add notes..."
//                 />
//               </div>

//               {/* Actions */}
//               <div className="flex justify-end gap-3 pt-6 border-t">
//                 <button onClick={() => setShowExecutionModal(false)} className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
//                   Cancel
//                 </button>
//                 <button onClick={handleLogExecution} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//                   Log Execution
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
