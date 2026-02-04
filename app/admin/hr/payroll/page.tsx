
// 'use client'

// import { useState, useMemo, useEffect } from 'react'
// import {
//   DollarSign,
//   Calculator,
//   Check,
//   AlertCircle,
//   Download,
//   Send,
//   FileText,
//   Search,
//   X,
//   Wallet,
//   CreditCard,
//   Banknote,
//   Receipt,
//   CheckCircle2,
//   Clock,
//   ArrowDownRight,
//   Edit,
//   Save,
//   Zap,
//   User,
//   Mail
// } from 'lucide-react'
// import { 
//   collection, 
//   getDocs, 
//   doc, 
//   addDoc, 
//   updateDoc, 
//   deleteDoc, 
//   query,
//   where,
//   Timestamp
// } from 'firebase/firestore'
// import { db } from '@/lib/firebase'

// interface FirebaseEmployee {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   department: string;
//   position: string;
//   role: string;
//   status: string;
//   supervisor: string;
//   salary: number;
//   salaryStructure: string;
//   bankName: string;
//   bankAccount: string;
//   joinDate: string;
//   createdAt: string;
//   lastUpdated: string;
// }

// interface PayrollRecord {
//   id: string
//   employeeId: string
//   employee: string
//   department: string
//   position: string
//   email: string
//   bankAccount: string
//   bankName: string
//   paymentMethod: 'bank' | 'stripe' | 'paypal'
//   basicSalary: number
//   allowances: number
//   deductions: number
//   bonus: number
//   grossPay: number
//   netPay: number
//   tax: number
//   taxableIncome: number
//   status: 'Pending' | 'Processed' | 'Paid'
//   payrollMonth: string
//   paidDate?: string
//   paymentReference?: string
//   notes?: string
//   createdAt?: string
//   updatedAt?: string
// }

// export default function Payroll() {
//   const [activeTab, setActiveTab] = useState<'payroll' | 'payments' | 'settings'>('payroll')
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
//   const [searchTerm, setSearchTerm] = useState('')
//   const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null)
//   const [processingPayment, setProcessingPayment] = useState<string | null>(null)
//   const [payslipModal, setPayslipModal] = useState<PayrollRecord | null>(null)

//   const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
//   const [payrollData, setPayrollData] = useState<PayrollRecord[]>([])

//   const [recordForm, setRecordForm] = useState({
//     employeeId: '',
//     bonus: 0,
//     allowances: 0,
//     deductions: 0,
//     notes: ''
//   })

//   // Firebase se data fetch karein
//   useEffect(() => {
//     fetchEmployees()
//     fetchPayrollData()
//   }, [])

//   // Jab month change ho tab payroll data refresh karein
//   useEffect(() => {
//     if (selectedMonth) {
//       generateMonthlyPayroll()
//     }
//   }, [selectedMonth, employees])

//   const fetchEmployees = async () => {
//     try {
//       const employeesRef = collection(db, 'employees')
//       const snapshot = await getDocs(employeesRef)
      
//       const employeesList: FirebaseEmployee[] = []
//       snapshot.forEach((doc) => {
//         const data = doc.data()
//         if (data.status === 'Active') {
//           employeesList.push({
//             id: doc.id,
//             name: data.name || '',
//             email: data.email || '',
//             phone: data.phone || '',
//             department: data.department || '',
//             position: data.position || '',
//             role: data.role || '',
//             status: data.status || 'Active',
//             supervisor: data.supervisor || '',
//             salary: data.salary || 0,
//             salaryStructure: data.salaryStructure || 'Monthly',
//             bankName: data.bankName || '',
//             bankAccount: data.bankAccount || '',
//             joinDate: data.joinDate || '',
//             createdAt: data.createdAt || '',
//             lastUpdated: data.lastUpdated || ''
//           })
//         }
//       })
      
//       setEmployees(employeesList)
//     } catch (error) {
//       console.error('Error fetching employees:', error)
//     }
//   }

//   const fetchPayrollData = async () => {
//     try {
//       const payrollRef = collection(db, 'payroll')
//       const snapshot = await getDocs(payrollRef)
      
//       const payrollList: PayrollRecord[] = []
//       snapshot.forEach((doc) => {
//         const data = doc.data()
        
//         payrollList.push({
//           id: doc.id,
//           employeeId: data.employeeId || '',
//           employee: data.employee || '',
//           department: data.department || '',
//           position: data.position || '',
//           email: data.email || '',
//           bankAccount: data.bankAccount || '',
//           bankName: data.bankName || '',
//           paymentMethod: data.paymentMethod || 'bank',
//           basicSalary: data.basicSalary || 0,
//           allowances: data.allowances || 0,
//           deductions: data.deductions || 0,
//           bonus: data.bonus || 0,
//           grossPay: data.grossPay || 0,
//           netPay: data.netPay || 0,
//           tax: data.tax || 0,
//           taxableIncome: data.taxableIncome || 0,
//           status: data.status || 'Pending',
//           payrollMonth: data.payrollMonth || selectedMonth,
//           paidDate: data.paidDate || '',
//           paymentReference: data.paymentReference || '',
//           notes: data.notes || '',
//           createdAt: data.createdAt || '',
//           updatedAt: data.updatedAt || ''
//         })
//       })
      
//       setPayrollData(payrollList)
//     } catch (error) {
//       console.error('Error fetching payroll data:', error)
//     }
//   }

//   // Clean data for Firebase
//   const cleanFirebaseData = (data: any) => {
//     const cleanData: any = {}
//     Object.keys(data).forEach(key => {
//       if (data[key] !== undefined && data[key] !== null) {
//         if (typeof data[key] === 'string' && data[key].trim() === '') {
//           cleanData[key] = ''
//         } else {
//           cleanData[key] = data[key]
//         }
//       } else {
//         cleanData[key] = ''
//       }
//     })
//     return cleanData
//   }

//   // Calculate tax based on UAE tax laws (simplified)
//   const calculateTax = (taxableIncome: number): number => {
//     // UAE has 0% personal income tax, but we'll keep the function for other deductions
//     return 0
//   }

//   // Calculate social security/other deductions
//   const calculateSocialSecurity = (basicSalary: number): number => {
//     // UAE social security is 5% employer, 5% employee for nationals
//     // For simplicity, we'll use 5% employee contribution
//     return Math.round(basicSalary * 0.05)
//   }

//   // Recalculate payroll record
//   const recalculatePayroll = (record: PayrollRecord) => {
//     const socialSecurity = calculateSocialSecurity(record.basicSalary)
//     const totalDeductions = socialSecurity + record.deductions
//     const grossPay = record.basicSalary + record.allowances + record.bonus
//     const taxableIncome = Math.max(0, grossPay - totalDeductions)
//     const tax = calculateTax(taxableIncome)
//     const netPay = grossPay - totalDeductions - tax

//     return {
//       ...record,
//       grossPay,
//       netPay,
//       taxableIncome,
//       tax,
//       deductions: totalDeductions
//     }
//   }

//   // Generate monthly payroll for all employees
//   const generateMonthlyPayroll = async () => {
//     if (employees.length === 0) return

//     const currentMonthData = payrollData.filter(p => p.payrollMonth === selectedMonth)
    
//     // Check if payroll already exists for this month
//     if (currentMonthData.length > 0) {
//       return // Payroll already generated for this month
//     }

//     const newPayrollRecords: PayrollRecord[] = []

//     for (const employee of employees) {
//       const basicSalary = employee.salary || 0
//       const socialSecurity = calculateSocialSecurity(basicSalary)
//       const allowances = 0 // Can be customized
//       const bonus = 0 // Can be customized
//       const deductions = socialSecurity + 0 // Additional deductions can be added
//       const grossPay = basicSalary + allowances + bonus
//       const taxableIncome = Math.max(0, grossPay - deductions)
//       const tax = calculateTax(taxableIncome)
//       const netPay = grossPay - deductions - tax

//       const payrollRecord: PayrollRecord = {
//         id: `${employee.id}_${selectedMonth}`,
//         employeeId: employee.id,
//         employee: employee.name,
//         department: employee.department,
//         position: employee.position,
//         email: employee.email,
//         bankAccount: employee.bankAccount,
//         bankName: employee.bankName,
//         paymentMethod: 'bank',
//         basicSalary,
//         allowances,
//         deductions,
//         bonus,
//         grossPay,
//         netPay,
//         tax,
//         taxableIncome,
//         status: 'Pending',
//         payrollMonth: selectedMonth,
//         notes: 'Auto-generated monthly payroll'
//       }

//       newPayrollRecords.push(payrollRecord)
//     }

//     // Save to Firebase
//     try {
//       for (const record of newPayrollRecords) {
//         const cleanRecord = cleanFirebaseData({
//           ...record,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         })
        
//         await addDoc(collection(db, 'payroll'), cleanRecord)
//       }

//       // Update local state
//       setPayrollData(prev => [...prev, ...newPayrollRecords])
      
//     } catch (error) {
//       console.error('Error generating payroll:', error)
//       alert('Error generating payroll. Please try again.')
//     }
//   }

//   // Filter payroll
//   const filteredPayroll = useMemo(() => {
//     return payrollData.filter(p => {
//       const matchesSearch = searchTerm === '' || 
//         p.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.department.toLowerCase().includes(searchTerm.toLowerCase())
//       const matchesMonth = p.payrollMonth === selectedMonth
//       return matchesSearch && matchesMonth
//     })
//   }, [payrollData, searchTerm, selectedMonth])

//   // Calculate statistics
//   const stats = useMemo(() => {
//     const currentMonthData = filteredPayroll.filter(p => p.payrollMonth === selectedMonth)
    
//     return {
//       totalGross: currentMonthData.reduce((sum, p) => sum + p.grossPay, 0),
//       totalNet: currentMonthData.reduce((sum, p) => sum + p.netPay, 0),
//       totalDeductions: currentMonthData.reduce((sum, p) => sum + p.deductions + p.tax, 0),
//       pending: currentMonthData.filter(p => p.status === 'Pending').length,
//       processed: currentMonthData.filter(p => p.status === 'Processed').length,
//       paid: currentMonthData.filter(p => p.status === 'Paid').length,
//       totalEmployees: currentMonthData.length
//     }
//   }, [filteredPayroll, selectedMonth])

//   // Handle process payroll for the month
//   const handleProcessPayroll = async () => {
//     try {
//       const recordsToUpdate = filteredPayroll.filter(record => record.status === 'Pending')
      
//       for (const record of recordsToUpdate) {
//         const updatedRecord = {
//           ...record,
//           status: 'Processed' as const,
//           updatedAt: new Date().toISOString()
//         }

//         const cleanData = cleanFirebaseData(updatedRecord)
        
//         // Find the document ID from Firebase
//         const payrollRef = collection(db, 'payroll')
//         const q = query(
//           payrollRef,
//           where('employeeId', '==', record.employeeId),
//           where('payrollMonth', '==', selectedMonth)
//         )
        
//         const querySnapshot = await getDocs(q)
        
//         if (!querySnapshot.empty) {
//           const docRef = querySnapshot.docs[0].ref
//           await updateDoc(docRef, cleanData)
//         }
//       }

//       // Update local state
//       setPayrollData(prev => 
//         prev.map(record => 
//           record.status === 'Pending' && record.payrollMonth === selectedMonth
//             ? { ...record, status: 'Processed' }
//             : record
//         )
//       )
      
//       alert('Payroll processed successfully!')
      
//     } catch (error) {
//       console.error('Error processing payroll:', error)
//       alert('Error processing payroll. Please try again.')
//     }
//   }

//   // Handle pay individual employee
//   const handlePayEmployee = async (recordId: string) => {
//     setProcessingPayment(recordId)
    
//     try {
//       const record = payrollData.find(r => r.id === recordId)
//       if (!record) return

//       // Generate payment reference
//       const paymentRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

//       const updatedRecord = {
//         ...record,
//         status: 'Paid' as const,
//         paidDate: new Date().toISOString().split('T')[0],
//         paymentReference: paymentRef,
//         updatedAt: new Date().toISOString()
//       }

//       const cleanData = cleanFirebaseData(updatedRecord)
      
//       // Find the document ID from Firebase
//       const payrollRef = collection(db, 'payroll')
//       const q = query(
//         payrollRef,
//         where('employeeId', '==', record.employeeId),
//         where('payrollMonth', '==', selectedMonth)
//       )
      
//       const querySnapshot = await getDocs(q)
      
//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0].ref
//         await updateDoc(docRef, cleanData)
//       }

//       // Update local state
//       setPayrollData(prev => 
//         prev.map(r => 
//           r.id === recordId ? updatedRecord : r
//         )
//       )
      
//       setProcessingPayment(null)
//       alert(`Payment successful!\nReference: ${paymentRef}\nAmount: AED ${record.netPay}`)
      
//     } catch (error) {
//       console.error('Error processing payment:', error)
//       alert('Error processing payment. Please try again.')
//       setProcessingPayment(null)
//     }
//   }

//   // Handle edit record
//   const handleEditRecord = (record: PayrollRecord) => {
//     setEditingRecord(record)
//     setRecordForm({
//       employeeId: record.employeeId,
//       bonus: record.bonus,
//       allowances: record.allowances,
//       deductions: record.deductions - calculateSocialSecurity(record.basicSalary),
//       notes: record.notes || ''
//     })
//   }

//   // Handle update record
//   const handleUpdateRecord = async () => {
//     if (!editingRecord) return

//     try {
//       const updated = recalculatePayroll({
//         ...editingRecord,
//         bonus: recordForm.bonus,
//         allowances: recordForm.allowances,
//         deductions: recordForm.deductions,
//         notes: recordForm.notes,
//         updatedAt: new Date().toISOString()
//       })

//       const cleanData = cleanFirebaseData(updated)
      
//       // Find the document ID from Firebase
//       const payrollRef = collection(db, 'payroll')
//       const q = query(
//         payrollRef,
//         where('employeeId', '==', editingRecord.employeeId),
//         where('payrollMonth', '==', selectedMonth)
//       )
      
//       const querySnapshot = await getDocs(q)
      
//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0].ref
//         await updateDoc(docRef, cleanData)
//       }

//       // Update local state
//       setPayrollData(prev => 
//         prev.map(r => 
//           r.id === editingRecord.id ? updated : r
//         )
//       )
      
//       setEditingRecord(null)
//       alert('Payroll record updated successfully!')
      
//     } catch (error) {
//       console.error('Error updating record:', error)
//       alert('Error updating record. Please try again.')
//     }
//   }

//   // Generate WPS SIF file
//   const generateWPSSIFFile = () => {
//     const wpsContent = generateWPSContent()
//     const blob = new Blob([wpsContent], { type: 'text/plain' })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `wps_sif_${selectedMonth}.txt`
//     a.click()
//     window.URL.revokeObjectURL(url)
//     alert('WPS SIF file generated successfully!')
//   }

//   // Generate WPS content
//   const generateWPSContent = (): string => {
//     const lines: string[] = []
//     lines.push('WPS PAYROLL FILE')
//     lines.push(`MONTH: ${selectedMonth}`)
//     lines.push(`GENERATED: ${new Date().toISOString()}`)
//     lines.push('')
//     lines.push('EMPLOYEE RECORDS:')
//     lines.push('---')

//     filteredPayroll.forEach(record => {
//       lines.push(`NAME: ${record.employee}`)
//       lines.push(`EMPLOYEE ID: ${record.employeeId}`)
//       lines.push(`DEPARTMENT: ${record.department}`)
//       lines.push(`POSITION: ${record.position}`)
//       lines.push(`BASIC SALARY: ${record.basicSalary}`)
//       lines.push(`GROSS PAY: ${record.grossPay}`)
//       lines.push(`DEDUCTIONS: ${record.deductions}`)
//       lines.push(`TAX: ${record.tax}`)
//       lines.push(`NET PAY: ${record.netPay}`)
//       lines.push(`BANK ACCOUNT: ${record.bankAccount}`)
//       lines.push(`BANK NAME: ${record.bankName}`)
//       lines.push(`STATUS: ${record.status}`)
//       if (record.paymentReference) {
//         lines.push(`PAYMENT REF: ${record.paymentReference}`)
//       }
//       if (record.paidDate) {
//         lines.push(`PAID DATE: ${record.paidDate}`)
//       }
//       lines.push('---')
//     })

//     lines.push('')
//     lines.push('SUMMARY:')
//     lines.push(`Total Employees: ${stats.totalEmployees}`)
//     lines.push(`Total Gross: ${stats.totalGross}`)
//     lines.push(`Total Deductions: ${stats.totalDeductions}`)
//     lines.push(`Total Net: ${stats.totalNet}`)
//     lines.push(`Processed: ${stats.processed}`)
//     lines.push(`Pending: ${stats.pending}`)
//     lines.push(`Paid: ${stats.paid}`)

//     return lines.join('\n')
//   }

//   // Get status color
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return 'bg-green-100 text-green-800'
//       case 'Processed':
//         return 'bg-blue-100 text-blue-800'
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800'
//       default:
//         return 'bg-gray-100 text-gray-800'
//     }
//   }

//   // Get payment method icon
//   const getPaymentMethodIcon = (method: string) => {
//     switch (method) {
//       case 'stripe':
//         return '🔷'
//       case 'paypal':
//         return '🅿️'
//       default:
//         return '🏦'
//     }
//   }

//   // Generate payroll for the month if not exists
//   const handleGeneratePayroll = async () => {
//     const currentMonthData = payrollData.filter(p => p.payrollMonth === selectedMonth)
    
//     if (currentMonthData.length > 0) {
//       if (confirm(`Payroll for ${selectedMonth} already exists. Regenerate?`)) {
//         // Delete existing payroll for the month
//         try {
//           for (const record of currentMonthData) {
//             const payrollRef = collection(db, 'payroll')
//             const q = query(
//               payrollRef,
//               where('employeeId', '==', record.employeeId),
//               where('payrollMonth', '==', selectedMonth)
//             )
            
//             const querySnapshot = await getDocs(q)
            
//             if (!querySnapshot.empty) {
//               const docRef = querySnapshot.docs[0].ref
//               await deleteDoc(docRef)
//             }
//           }

//           // Remove from local state
//           setPayrollData(prev => prev.filter(p => p.payrollMonth !== selectedMonth))
          
//           // Generate new payroll
//           await generateMonthlyPayroll()
          
//         } catch (error) {
//           console.error('Error regenerating payroll:', error)
//           alert('Error regenerating payroll. Please try again.')
//         }
//       }
//     } else {
//       await generateMonthlyPayroll()
//     }
//   }

//   return (
//     <div className="space-y-6 pb-10">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
//         <p className="text-gray-600 mt-1">Process payments and manage employee compensation</p>
//       </div>

//       {/* Tab Navigation */}
//       <div className="border-b border-gray-200 flex gap-4">
//         <button
//           onClick={() => setActiveTab('payroll')}
//           className={`px-4 py-3 font-medium text-sm border-b-2 ${
//             activeTab === 'payroll'
//               ? 'border-blue-500 text-blue-600'
//               : 'border-transparent text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           Payroll
//         </button>
//         <button
//           onClick={() => setActiveTab('payments')}
//           className={`px-4 py-3 font-medium text-sm border-b-2 ${
//             activeTab === 'payments'
//               ? 'border-blue-500 text-blue-600'
//               : 'border-transparent text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           Payment History
//         </button>
//         <button
//           onClick={() => setActiveTab('settings')}
//           className={`px-4 py-3 font-medium text-sm border-b-2 ${
//             activeTab === 'settings'
//               ? 'border-blue-500 text-blue-600'
//               : 'border-transparent text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           Settings
//         </button>
//       </div>

//       {/* Payroll Tab */}
//       {activeTab === 'payroll' && (
//         <div className="space-y-6">
//           {/* Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600 text-sm">Total Gross</p>
//                   <p className="text-2xl font-bold text-gray-900">AED {stats.totalGross.toLocaleString()}</p>
//                 </div>
//                 <Banknote className="h-8 w-8 text-blue-500 opacity-20" />
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600 text-sm">Total Net</p>
//                   <p className="text-2xl font-bold text-gray-900">AED {stats.totalNet.toLocaleString()}</p>
//                 </div>
//                 <Wallet className="h-8 w-8 text-green-500 opacity-20" />
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600 text-sm">Total Employees</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
//                 </div>
//                 <User className="h-8 w-8 text-purple-500 opacity-20" />
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-gray-600 text-sm">Paid</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
//                 </div>
//                 <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
//               </div>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
//               <div className="flex gap-2">
//                 <input
//                   type="month"
//                   value={selectedMonth}
//                   onChange={(e) => setSelectedMonth(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   onClick={handleGeneratePayroll}
//                   className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
//                 >
//                   <Calculator className="h-4 w-4" />
//                   Generate
//                 </button>
//               </div>
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//               <input
//                 type="text"
//                 placeholder="Search employee or department..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex gap-2 items-end">
//               <button
//                 onClick={handleProcessPayroll}
//                 disabled={stats.pending === 0}
//                 className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 ${
//                   stats.pending === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
//                 }`}
//               >
//                 <Check className="h-4 w-4" />
//                 Process All ({stats.pending})
//               </button>
//               <button
//                 onClick={() => {
//                   const csvContent = [
//                     ['Employee', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Bonus', 'Gross Pay', 'Tax', 'Net Pay', 'Status', 'Bank Account'],
//                     ...filteredPayroll.map(record => [
//                       record.employee,
//                       record.department,
//                       record.basicSalary,
//                       record.allowances,
//                       record.deductions,
//                       record.bonus,
//                       record.grossPay,
//                       record.tax,
//                       record.netPay,
//                       record.status,
//                       record.bankAccount
//                     ])
//                   ].map(row => row.join(',')).join('\n')
                  
//                   const blob = new Blob([csvContent], { type: 'text/csv' })
//                   const url = window.URL.createObjectURL(blob)
//                   const a = document.createElement('a')
//                   a.href = url
//                   a.download = `payroll-${selectedMonth}.csv`
//                   a.click()
//                   window.URL.revokeObjectURL(url)
//                 }}
//                 className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
//               >
//                 <Download className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {/* Payroll Table */}
//           <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Basic</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bonus</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Gross</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Net Pay</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bank</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredPayroll.length > 0 ? (
//                   filteredPayroll.map((record) => (
//                     <tr key={record.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-medium text-gray-900">{record.employee}</p>
//                           <p className="text-xs text-gray-500">{record.position}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900">{record.department}</td>
//                       <td className="px-6 py-4 text-sm text-gray-900">AED {record.basicSalary.toLocaleString()}</td>
//                       <td className="px-6 py-4 text-sm text-gray-900">AED {record.bonus.toLocaleString()}</td>
//                       <td className="px-6 py-4 text-sm font-medium text-gray-900">AED {record.grossPay.toLocaleString()}</td>
//                       <td className="px-6 py-4 text-sm font-bold text-green-600">AED {record.netPay.toLocaleString()}</td>
//                       <td className="px-6 py-4 text-sm">
//                         <div>
//                           <p className="text-gray-900">{record.bankName}</p>
//                           <p className="text-xs text-gray-500">{record.bankAccount}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
//                           {record.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm space-x-2">
//                         <button
//                           onClick={() => handleEditRecord(record)}
//                           className="text-blue-600 hover:text-blue-800 font-medium"
//                           title="Edit"
//                         >
//                           <Edit className="h-4 w-4 inline" />
//                         </button>
//                         {record.status !== 'Paid' && (
//                           <button
//                             onClick={() => handlePayEmployee(record.id)}
//                             disabled={processingPayment === record.id || record.status === 'Pending'}
//                             className={`text-green-600 hover:text-green-800 font-medium ${
//                               processingPayment === record.id || record.status === 'Pending' ? 'opacity-50 cursor-not-allowed' : ''
//                             }`}
//                             title="Pay Employee"
//                           >
//                             {processingPayment === record.id ? (
//                               <Clock className="h-4 w-4 inline animate-spin" />
//                             ) : (
//                               <Send className="h-4 w-4 inline" />
//                             )}
//                           </button>
//                         )}
//                         <button
//                           onClick={() => setPayslipModal(record)}
//                           className="text-amber-600 hover:text-amber-800 font-medium"
//                           title="View Payslip"
//                         >
//                           <Receipt className="h-4 w-4 inline" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
//                       No payroll data for {selectedMonth}. Click "Generate" to create payroll.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Payments Tab */}
//       {activeTab === 'payments' && (
//         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Month</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reference</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {payrollData
//                 .filter(r => r.status === 'Paid')
//                 .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))
//                 .map((record) => (
//                   <tr key={record.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 font-medium text-gray-900">{record.employee}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{record.department}</td>
//                     <td className="px-6 py-4 font-bold text-green-600">AED {record.netPay.toLocaleString()}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{record.payrollMonth}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{record.paidDate}</td>
//                     <td className="px-6 py-4 text-sm font-mono text-gray-600">{record.paymentReference}</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//           {payrollData.filter(r => r.status === 'Paid').length === 0 && (
//             <div className="px-6 py-8 text-center text-gray-500">
//               No payments made yet
//             </div>
//           )}
//         </div>
//       )}

//       {/* Settings Tab */}
//       {activeTab === 'settings' && (
//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-lg border border-gray-200">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>
//             <div className="space-y-4">
//               <div className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-medium text-gray-900">🏦 Bank Transfer</h3>
//                   <CheckCircle2 className="h-5 w-5 text-green-600" />
//                 </div>
//                 <p className="text-sm text-gray-600">Direct transfer to employee bank accounts</p>
//               </div>
//               <div className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-medium text-gray-900">🔷 Stripe</h3>
//                   <span className="text-sm text-gray-500">Coming Soon</span>
//                 </div>
//                 <p className="text-sm text-gray-600">Secure payment processing with Stripe API. Fee: 2.9% + AED 1</p>
//               </div>
//               <div className="p-4 border border-gray-200 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="font-medium text-gray-900">🅿️ PayPal</h3>
//                   <span className="text-sm text-gray-500">Coming Soon</span>
//                 </div>
//                 <p className="text-sm text-gray-600">PayPal business transfers. Fee: 3.5% + AED 2</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg border border-gray-200">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">WPS File Generation</h2>
//             <p className="text-gray-600 mb-4">Generate WPS SIF files for government compliance and payroll reporting</p>
//             <button
//               onClick={generateWPSSIFFile}
//               disabled={filteredPayroll.length === 0}
//               className={`px-6 py-3 bg-green-600 text-white font-medium rounded-lg flex items-center gap-2 ${
//                 filteredPayroll.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
//               }`}
//             >
//               <Zap className="h-5 w-5" />
//               Generate WPS SIF File
//             </button>
//           </div>

//           <div className="bg-white p-6 rounded-lg border border-gray-200">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Payroll Rules</h2>
//             <div className="space-y-3">
//               <div className="p-3 bg-gray-50 rounded border border-gray-200">
//                 <p className="font-medium text-gray-900 text-sm">Basic Salary</p>
//                 <p className="text-xs text-gray-600">Based on employee salary field in Firebase</p>
//               </div>
//               <div className="p-3 bg-gray-50 rounded border border-gray-200">
//                 <p className="font-medium text-gray-900 text-sm">Social Security</p>
//                 <p className="text-xs text-gray-600">5% employee contribution from basic salary</p>
//               </div>
//               <div className="p-3 bg-gray-50 rounded border border-gray-200">
//                 <p className="font-medium text-gray-900 text-sm">Tax Calculation</p>
//                 <p className="text-xs text-gray-600">UAE has 0% personal income tax</p>
//               </div>
//               <div className="p-3 bg-gray-50 rounded border border-gray-200">
//                 <p className="font-medium text-gray-900 text-sm">Bank Details</p>
//                 <p className="text-xs text-gray-600">Automatically fetched from employee records</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Modal */}
//       {editingRecord && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Payroll Record</h2>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//                 <input
//                   type="text"
//                   value={editingRecord.employee}
//                   disabled
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
//                 <input
//                   type="number"
//                   value={editingRecord.basicSalary}
//                   disabled
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Basic salary cannot be edited. Update in employee profile.</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (AED)</label>
//                 <input
//                   type="number"
//                   value={recordForm.allowances}
//                   onChange={(e) => setRecordForm({ ...recordForm, allowances: Number(e.target.value) })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bonus (AED)</label>
//                 <input
//                   type="number"
//                   value={recordForm.bonus}
//                   onChange={(e) => setRecordForm({ ...recordForm, bonus: Number(e.target.value) })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Additional Deductions (AED)</label>
//                 <input
//                   type="number"
//                   value={recordForm.deductions}
//                   onChange={(e) => setRecordForm({ ...recordForm, deductions: Number(e.target.value) })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Additional deductions beyond social security (5%)</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//                 <textarea
//                   value={recordForm.notes}
//                   onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
//                   placeholder="Add any notes about this payroll record..."
//                 />
//               </div>
//               <div className="p-3 bg-blue-50 rounded border border-blue-200">
//                 <p className="text-sm text-blue-700">
//                   <span className="font-bold">Note:</span> Social Security (5%) is automatically calculated from basic salary.
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-2 mt-6">
//               <button
//                 onClick={handleUpdateRecord}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
//               >
//                 Save Changes
//               </button>
//               <button
//                 onClick={() => setEditingRecord(null)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Payslip Modal */}
//       {payslipModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-lg font-bold text-gray-900">Payslip - {selectedMonth}</h2>
//               <button onClick={() => setPayslipModal(null)} className="text-gray-400 hover:text-gray-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="space-y-3 text-sm border-b pb-4 mb-4">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Employee</span>
//                 <span className="font-medium text-gray-900">{payslipModal.employee}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Department</span>
//                 <span className="font-medium text-gray-900">{payslipModal.department}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Position</span>
//                 <span className="font-medium text-gray-900">{payslipModal.position}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Bank</span>
//                 <span className="font-medium text-gray-900">{payslipModal.bankName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Account</span>
//                 <span className="font-medium text-gray-900">{payslipModal.bankAccount}</span>
//               </div>
//             </div>

//             <div className="space-y-2 text-sm mb-4">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Basic Salary</span>
//                 <span className="text-gray-900">AED {payslipModal.basicSalary.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Allowances</span>
//                 <span className="text-gray-900">AED {payslipModal.allowances.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Bonus</span>
//                 <span className="text-gray-900">AED {payslipModal.bonus.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between font-medium border-t pt-2 mt-2">
//                 <span className="text-gray-900">Gross Pay</span>
//                 <span className="text-gray-900">AED {payslipModal.grossPay.toLocaleString()}</span>
//               </div>
//             </div>

//             <div className="space-y-2 text-sm mb-4 border-b pb-4">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Social Security (5%)</span>
//                 <span className="text-gray-900">AED {calculateSocialSecurity(payslipModal.basicSalary).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Additional Deductions</span>
//                 <span className="text-gray-900">AED {(payslipModal.deductions - calculateSocialSecurity(payslipModal.basicSalary)).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Total Deductions</span>
//                 <span className="text-gray-900">AED {payslipModal.deductions.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tax</span>
//                 <span className="text-gray-900">AED {payslipModal.tax.toLocaleString()}</span>
//               </div>
//             </div>

//             <div className="flex justify-between font-bold text-base">
//               <span>Net Pay</span>
//               <span className="text-green-600">AED {payslipModal.netPay.toLocaleString()}</span>
//             </div>

//             {payslipModal.notes && (
//               <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
//                 <p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {payslipModal.notes}</p>
//               </div>
//             )}

//             <button
//               onClick={() => setPayslipModal(null)}
//               className="w-full mt-6 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }









'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  DollarSign,
  Calculator,
  Check,
  AlertCircle,
  Download,
  Send,
  FileText,
  Search,
  X,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  Edit,
  Save,
  Zap,
  User,
  Mail,
  Calendar
} from 'lucide-react'
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

interface PayrollRecord {
  id: string
  employeeId: string
  employee: string
  department: string
  position: string
  email: string
  bankAccount: string
  bankName: string
  paymentMethod: 'bank'
  basicSalary: number
  allowances: number
  deductions: number
  bonus: number
  grossPay: number
  netPay: number
  tax: number
  taxableIncome: number
  status: 'Pending' | 'Paid' | 'Not Payable'
  payrollMonth: string
  paidDate?: string
  paymentReference?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export default function Payroll() {
  const [activeTab, setActiveTab] = useState<'payroll' | 'payments'>('payroll')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [payslipModal, setPayslipModal] = useState<PayrollRecord | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [employees, setEmployees] = useState<FirebaseEmployee[]>([])
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([])

  const [recordForm, setRecordForm] = useState({
    employeeId: '',
    bonus: 0,
    allowances: 0,
    deductions: 0,
    notes: '',
    status: 'Pending' as 'Pending' | 'Paid' | 'Not Payable'
  })

  // Firebase se data fetch karein
  useEffect(() => {
    fetchEmployees()
    fetchPayrollData()
  }, [])

  // Jab month change ho tab payroll data refresh karein
  useEffect(() => {
    if (selectedMonth) {
      checkAndGeneratePayroll()
    }
  }, [selectedMonth, employees])

  const fetchEmployees = async () => {
    try {
      const employeesRef = collection(db, 'employees')
      const snapshot = await getDocs(employeesRef)
      
      const employeesList: FirebaseEmployee[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.status === 'Active') {
          employeesList.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            role: data.role || '',
            status: data.status || 'Active',
            supervisor: data.supervisor || '',
            salary: data.salary || 0,
            salaryStructure: data.salaryStructure || 'Monthly',
            bankName: data.bankName || '',
            bankAccount: data.bankAccount || '',
            joinDate: data.joinDate || '',
            createdAt: data.createdAt || '',
            lastUpdated: data.lastUpdated || ''
          })
        }
      })
      
      setEmployees(employeesList)
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchPayrollData = async () => {
    try {
      const payrollRef = collection(db, 'payroll')
      const snapshot = await getDocs(payrollRef)
      
      const payrollList: PayrollRecord[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        payrollList.push({
          id: doc.id,
          employeeId: data.employeeId || '',
          employee: data.employee || '',
          department: data.department || '',
          position: data.position || '',
          email: data.email || '',
          bankAccount: data.bankAccount || '',
          bankName: data.bankName || '',
          paymentMethod: data.paymentMethod || 'bank',
          basicSalary: data.basicSalary || 0,
          allowances: data.allowances || 0,
          deductions: data.deductions || 0,
          bonus: data.bonus || 0,
          grossPay: data.grossPay || 0,
          netPay: data.netPay || 0,
          tax: data.tax || 0,
          taxableIncome: data.taxableIncome || 0,
          status: data.status || 'Pending',
          payrollMonth: data.payrollMonth || selectedMonth,
          paidDate: data.paidDate || '',
          paymentReference: data.paymentReference || '',
          notes: data.notes || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        })
      })
      
      setPayrollData(payrollList)
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    }
  }

  // Clean data for Firebase
  const cleanFirebaseData = (data: any) => {
    const cleanData: any = {}
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (typeof data[key] === 'string' && data[key].trim() === '') {
          cleanData[key] = ''
        } else {
          cleanData[key] = data[key]
        }
      } else {
        cleanData[key] = ''
      }
    })
    return cleanData
  }

  // Calculate social security/other deductions
  const calculateSocialSecurity = (basicSalary: number): number => {
    return Math.round(basicSalary * 0.05)
  }

  // Recalculate payroll record
  const recalculatePayroll = (record: PayrollRecord) => {
    const socialSecurity = calculateSocialSecurity(record.basicSalary)
    const totalDeductions = socialSecurity + record.deductions
    const grossPay = record.basicSalary + record.allowances + record.bonus
    const taxableIncome = Math.max(0, grossPay - totalDeductions)
    const tax = 0 // UAE has 0% tax
    const netPay = grossPay - totalDeductions - tax

    return {
      ...record,
      grossPay,
      netPay,
      taxableIncome,
      tax,
      deductions: totalDeductions
    }
  }

  // Check and generate payroll for the selected month
  const checkAndGeneratePayroll = async () => {
    if (employees.length === 0) return

    const currentMonthData = payrollData.filter(p => p.payrollMonth === selectedMonth)
    
    // If payroll already exists for this month, don't generate
    if (currentMonthData.length > 0) {
      return
    }

    await generateMonthlyPayroll()
  }

  // Generate monthly payroll for all employees
  const generateMonthlyPayroll = async () => {
    if (employees.length === 0) return

    setIsGenerating(true)

    const newPayrollRecords: PayrollRecord[] = []

    for (const employee of employees) {
      const basicSalary = employee.salary || 0
      const socialSecurity = calculateSocialSecurity(basicSalary)
      const allowances = 0
      const bonus = 0
      const deductions = socialSecurity
      const grossPay = basicSalary + allowances + bonus
      const taxableIncome = Math.max(0, grossPay - deductions)
      const tax = 0
      const netPay = grossPay - deductions - tax

      const payrollRecord: PayrollRecord = {
        id: `${employee.id}_${selectedMonth}`,
        employeeId: employee.id,
        employee: employee.name,
        department: employee.department,
        position: employee.position,
        email: employee.email,
        bankAccount: employee.bankAccount,
        bankName: employee.bankName,
        paymentMethod: 'bank',
        basicSalary,
        allowances,
        deductions,
        bonus,
        grossPay,
        netPay,
        tax,
        taxableIncome,
        status: 'Pending', // Default status Pending
        payrollMonth: selectedMonth,
        notes: 'Auto-generated monthly payroll'
      }

      newPayrollRecords.push(payrollRecord)
    }

    // Save to Firebase
    try {
      for (const record of newPayrollRecords) {
        const cleanRecord = cleanFirebaseData({
          ...record,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        await addDoc(collection(db, 'payroll'), cleanRecord)
      }

      // Update local state
      setPayrollData(prev => [...prev, ...newPayrollRecords])
      
      alert(`Payroll generated successfully for ${selectedMonth}!`)
      
    } catch (error) {
      console.error('Error generating payroll:', error)
      alert('Error generating payroll. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Filter payroll for current month
  const filteredPayroll = useMemo(() => {
    return payrollData
      .filter(p => p.payrollMonth === selectedMonth)
      .filter(p => {
        const matchesSearch = searchTerm === '' || 
          p.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.department.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
      })
  }, [payrollData, searchTerm, selectedMonth])

  // Calculate statistics for current month
  const stats = useMemo(() => {
    const currentMonthData = payrollData.filter(p => p.payrollMonth === selectedMonth)
    
    return {
      totalGross: currentMonthData.reduce((sum, p) => sum + p.grossPay, 0),
      totalNet: currentMonthData.reduce((sum, p) => sum + p.netPay, 0),
      totalDeductions: currentMonthData.reduce((sum, p) => sum + p.deductions + p.tax, 0),
      pending: currentMonthData.filter(p => p.status === 'Pending').length,
      paid: currentMonthData.filter(p => p.status === 'Paid').length,
      notPayable: currentMonthData.filter(p => p.status === 'Not Payable').length,
      totalEmployees: currentMonthData.length
    }
  }, [payrollData, selectedMonth])

  // Handle pay individual employee
  const handlePayEmployee = async (recordId: string) => {
    if (!confirm('Mark this salary as paid?')) return
    
    setProcessingPayment(recordId)
    
    try {
      const record = payrollData.find(r => r.id === recordId)
      if (!record) return

      // Generate payment reference
      const paymentRef = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      const updatedRecord = {
        ...record,
        status: 'Paid' as const,
        paidDate: new Date().toISOString().split('T')[0],
        paymentReference: paymentRef,
        updatedAt: new Date().toISOString()
      }

      const cleanData = cleanFirebaseData(updatedRecord)
      
      // Find the document ID from Firebase
      const payrollRef = collection(db, 'payroll')
      const q = query(
        payrollRef,
        where('employeeId', '==', record.employeeId),
        where('payrollMonth', '==', selectedMonth)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, cleanData)
      }

      // Update local state
      setPayrollData(prev => 
        prev.map(r => 
          r.id === recordId ? updatedRecord : r
        )
      )
      
      setProcessingPayment(null)
      alert(`Salary marked as paid!\nReference: ${paymentRef}\nAmount: AED ${record.netPay}`)
      
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error processing payment. Please try again.')
      setProcessingPayment(null)
    }
  }

  // Handle mark as Not Payable
  const handleMarkNotPayable = async (recordId: string) => {
    if (!confirm('Mark this salary as Not Payable?')) return
    
    try {
      const record = payrollData.find(r => r.id === recordId)
      if (!record) return

      const updatedRecord = {
        ...record,
        status: 'Not Payable' as const,
        paidDate: '',
        paymentReference: '',
        updatedAt: new Date().toISOString(),
        notes: `${record.notes || ''}\nMarked as Not Payable on ${new Date().toISOString().split('T')[0]}`
      }

      const cleanData = cleanFirebaseData(updatedRecord)
      
      // Find the document ID from Firebase
      const payrollRef = collection(db, 'payroll')
      const q = query(
        payrollRef,
        where('employeeId', '==', record.employeeId),
        where('payrollMonth', '==', selectedMonth)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, cleanData)
      }

      // Update local state
      setPayrollData(prev => 
        prev.map(r => 
          r.id === recordId ? updatedRecord : r
        )
      )
      
      alert('Salary marked as Not Payable!')
      
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Error updating record. Please try again.')
    }
  }

  // Handle mark as Pending
  const handleMarkPending = async (recordId: string) => {
    try {
      const record = payrollData.find(r => r.id === recordId)
      if (!record) return

      const updatedRecord = {
        ...record,
        status: 'Pending' as const,
        paidDate: '',
        paymentReference: '',
        updatedAt: new Date().toISOString(),
        notes: `${record.notes || ''}\nReset to Pending on ${new Date().toISOString().split('T')[0]}`
      }

      const cleanData = cleanFirebaseData(updatedRecord)
      
      // Find the document ID from Firebase
      const payrollRef = collection(db, 'payroll')
      const q = query(
        payrollRef,
        where('employeeId', '==', record.employeeId),
        where('payrollMonth', '==', selectedMonth)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, cleanData)
      }

      // Update local state
      setPayrollData(prev => 
        prev.map(r => 
          r.id === recordId ? updatedRecord : r
        )
      )
      
      alert('Salary status reset to Pending!')
      
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Error updating record. Please try again.')
    }
  }

  // Handle edit record
  const handleEditRecord = (record: PayrollRecord) => {
    setEditingRecord(record)
    setRecordForm({
      employeeId: record.employeeId,
      bonus: record.bonus,
      allowances: record.allowances,
      deductions: record.deductions - calculateSocialSecurity(record.basicSalary),
      notes: record.notes || '',
      status: record.status
    })
  }

  // Handle update record
  const handleUpdateRecord = async () => {
    if (!editingRecord) return

    try {
      const updated = recalculatePayroll({
        ...editingRecord,
        bonus: recordForm.bonus,
        allowances: recordForm.allowances,
        deductions: recordForm.deductions,
        notes: recordForm.notes,
        status: recordForm.status,
        updatedAt: new Date().toISOString()
      })

      const cleanData = cleanFirebaseData(updated)
      
      // Find the document ID from Firebase
      const payrollRef = collection(db, 'payroll')
      const q = query(
        payrollRef,
        where('employeeId', '==', editingRecord.employeeId),
        where('payrollMonth', '==', selectedMonth)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, cleanData)
      }

      // Update local state
      setPayrollData(prev => 
        prev.map(r => 
          r.id === editingRecord.id ? updated : r
        )
      )
      
      setEditingRecord(null)
      alert('Payroll record updated successfully!')
      
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Error updating record. Please try again.')
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800'
      case 'Not Payable':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'Salary Paid'
      case 'Not Payable':
        return 'Not Payable'
      case 'Pending':
        return 'Pending Payment'
      default:
        return status
    }
  }

  // Generate payroll for the month
  const handleGeneratePayroll = async () => {
    const currentMonthData = payrollData.filter(p => p.payrollMonth === selectedMonth)
    
    if (currentMonthData.length > 0) {
      if (confirm(`Payroll for ${selectedMonth} already exists. Regenerate?`)) {
        // Delete existing payroll for the month
        try {
          for (const record of currentMonthData) {
            const payrollRef = collection(db, 'payroll')
            const q = query(
              payrollRef,
              where('employeeId', '==', record.employeeId),
              where('payrollMonth', '==', selectedMonth)
            )
            
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const docRef = querySnapshot.docs[0].ref
              await deleteDoc(docRef)
            }
          }

          // Remove from local state
          setPayrollData(prev => prev.filter(p => p.payrollMonth !== selectedMonth))
          
          // Generate new payroll
          await generateMonthlyPayroll()
          
        } catch (error) {
          console.error('Error regenerating payroll:', error)
          alert('Error regenerating payroll. Please try again.')
        }
      }
    } else {
      await generateMonthlyPayroll()
    }
  }

  // Format month for display
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // ============================================================
  // ✅ YAHAN CHANGE KIA HAI - AB ALL 12 MONTHS DROP DOWN MEIN AAYENGE
  // ============================================================
  
  // Get available months from payroll data + all 12 months of current year
  const availableMonths = useMemo(() => {
    // Current year aur month le lo
    const currentYear = new Date().getFullYear()
    
    // Sabhi 12 months ke liye options banaye
    const allMonthsOfCurrentYear = []
    for (let month = 1; month <= 12; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`
      allMonthsOfCurrentYear.push(`${currentYear}-${monthStr}`)
    }
    
    // Existing payroll months le lo
    const existingMonths = [...new Set(payrollData.map(p => p.payrollMonth))]
    
    // Dono ko combine karo, duplicates remove karo
    const allMonths = [...new Set([...allMonthsOfCurrentYear, ...existingMonths])]
    
    // Sort karo descending order mein (latest month pehle)
    return allMonths.sort((a, b) => b.localeCompare(a))
  }, [payrollData])

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1">Manage monthly salary payments and track payment status</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 flex gap-4">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'payroll'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payroll
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'payments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Gross</p>
                  <p className="text-2xl font-bold text-gray-900">AED {stats.totalGross.toLocaleString()}</p>
                </div>
                <Banknote className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Net</p>
                  <p className="text-2xl font-bold text-gray-900">AED {stats.totalNet.toLocaleString()}</p>
                </div>
                <Wallet className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Month</label>
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Month</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {formatMonth(month)}
                    </option>
                  ))}
                  {!availableMonths.includes(selectedMonth) && selectedMonth && (
                    <option value={selectedMonth}>
                      {formatMonth(selectedMonth)} (Not Generated)
                    </option>
                  )}
                </select>
                <button
                  onClick={handleGeneratePayroll}
                  disabled={isGenerating}
                  className={`px-4 py-2 bg-green-600 text-white font-medium rounded-lg flex items-center gap-2 whitespace-nowrap ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search employee or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={() => {
                  const csvContent = [
                    ['Employee', 'Department', 'Position', 'Basic Salary', 'Allowances', 'Deductions', 'Bonus', 'Gross Pay', 'Net Pay', 'Status', 'Bank Account', 'Payment Date', 'Reference'],
                    ...filteredPayroll.map(record => [
                      record.employee,
                      record.department,
                      record.position,
                      record.basicSalary,
                      record.allowances,
                      record.deductions,
                      record.bonus,
                      record.grossPay,
                      record.netPay,
                      record.status,
                      record.bankAccount,
                      record.paidDate || '',
                      record.paymentReference || ''
                    ])
                  ].map(row => row.join(',')).join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `payroll-${selectedMonth}.csv`
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                Payroll for {formatMonth(selectedMonth)} 
                <span className="text-sm text-gray-600 ml-2">({filteredPayroll.length} employees)</span>
              </h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayroll.length > 0 ? (
                  filteredPayroll.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.employee}</p>
                          <p className="text-xs text-gray-500">{record.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{record.position}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">AED {record.grossPay.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">AED {record.netPay.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="text-gray-900">{record.bankName}</p>
                          <p className="text-xs text-gray-500">{record.bankAccount}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                        {record.paidDate && (
                          <p className="text-xs text-gray-500 mt-1">Paid: {record.paidDate}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {record.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handlePayEmployee(record.id)}
                              disabled={processingPayment === record.id}
                              className={`text-green-600 hover:text-green-800 font-medium px-2 py-1 ${
                                processingPayment === record.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Mark as Paid"
                            >
                              {processingPayment === record.id ? (
                                <Clock className="h-4 w-4 inline animate-spin" />
                              ) : (
                                'Mark Paid'
                              )}
                            </button>
                            <button
                              onClick={() => handleMarkNotPayable(record.id)}
                              className="text-red-600 hover:text-red-800 font-medium px-2 py-1"
                              title="Mark as Not Payable"
                            >
                              Not Payable
                            </button>
                          </>
                        )}
                        {record.status === 'Not Payable' && (
                          <>
                            <button
                              onClick={() => handlePayEmployee(record.id)}
                              disabled={processingPayment === record.id}
                              className={`text-green-600 hover:text-green-800 font-medium px-2 py-1 ${
                                processingPayment === record.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Mark as Paid"
                            >
                              {processingPayment === record.id ? (
                                <Clock className="h-4 w-4 inline animate-spin" />
                              ) : (
                                'Mark Paid'
                              )}
                            </button>
                            <button
                              onClick={() => handleMarkPending(record.id)}
                              className="text-yellow-600 hover:text-yellow-800 font-medium px-2 py-1"
                              title="Reset to Pending"
                            >
                              Reset
                            </button>
                          </>
                        )}
                        {record.status === 'Paid' && (
                          <>
                            <button
                              onClick={() => handleMarkNotPayable(record.id)}
                              className="text-red-600 hover:text-red-800 font-medium px-2 py-1"
                              title="Mark as Not Payable"
                            >
                              Not Payable
                            </button>
                            <button
                              onClick={() => handleMarkPending(record.id)}
                              className="text-yellow-600 hover:text-yellow-800 font-medium px-2 py-1"
                              title="Reset to Pending"
                            >
                              Reset
                            </button>
                          </>
                        )}
                       
                      
                        <button
                          onClick={() => setPayslipModal(record)}
                          className="text-amber-600 hover:text-amber-800 font-medium px-2 py-1"
                          title="View Payslip"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {selectedMonth ? (
                        `No payroll data for ${formatMonth(selectedMonth)}. Click "Generate" to create payroll.`
                      ) : (
                        'Select a month to view payroll data.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Payment History</h3>
            <div className="space-y-4">
              {availableMonths.map(month => {
                const monthPayments = payrollData
                  .filter(r => r.payrollMonth === month && r.status === 'Paid')
                  .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))
                
                if (monthPayments.length === 0) return null
                
                const totalAmount = monthPayments.reduce((sum, r) => sum + r.netPay, 0)
                
                return (
                  <div key={month} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{formatMonth(month)}</h4>
                        <p className="text-sm text-gray-600">{monthPayments.length} payments</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">AED {totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Total Paid</p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {monthPayments.map((record) => (
                        <div key={record.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{record.employee}</p>
                              <p className="text-sm text-gray-600">{record.department} • {record.position}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Bank: {record.bankName} ({record.bankAccount})
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">AED {record.netPay.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">{record.paidDate}</p>
                              <p className="text-xs font-mono text-gray-500 mt-1">{record.paymentReference}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {payrollData.filter(r => r.status === 'Paid').length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No payment history available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Payroll Record</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <input
                  type="text"
                  value={editingRecord.employee}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="text"
                  value={formatMonth(editingRecord.payrollMonth)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                <input
                  type="number"
                  value={editingRecord.basicSalary}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Basic salary cannot be edited. Update in employee profile.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (AED)</label>
                <input
                  type="number"
                  value={recordForm.allowances}
                  onChange={(e) => setRecordForm({ ...recordForm, allowances: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus (AED)</label>
                <input
                  type="number"
                  value={recordForm.bonus}
                  onChange={(e) => setRecordForm({ ...recordForm, bonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Deductions (AED)</label>
                <input
                  type="number"
                  value={recordForm.deductions}
                  onChange={(e) => setRecordForm({ ...recordForm, deductions: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Additional deductions beyond social security (5%)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={recordForm.status}
                  onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Not Payable">Not Payable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Add any notes about this payroll record..."
                />
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Note:</span> Social Security (5%) is automatically calculated from basic salary.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateRecord}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Payslip - {formatMonth(selectedMonth)}</h2>
              <button onClick={() => setPayslipModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Employee</span>
                <span className="font-medium text-gray-900">{payslipModal.employee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department</span>
                <span className="font-medium text-gray-900">{payslipModal.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Position</span>
                <span className="font-medium text-gray-900">{payslipModal.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${getStatusColor(payslipModal.status)} px-2 py-1 rounded`}>
                  {getStatusText(payslipModal.status)}
                </span>
              </div>
              {payslipModal.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-medium text-gray-900">{payslipModal.paidDate}</span>
                </div>
              )}
              {payslipModal.paymentReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-medium text-gray-900">{payslipModal.paymentReference}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="text-gray-900">AED {payslipModal.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Allowances</span>
                <span className="text-gray-900">AED {payslipModal.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bonus</span>
                <span className="text-gray-900">AED {payslipModal.bonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span className="text-gray-900">Gross Pay</span>
                <span className="text-gray-900">AED {payslipModal.grossPay.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Social Security (5%)</span>
                <span className="text-gray-900">AED {calculateSocialSecurity(payslipModal.basicSalary).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Deductions</span>
                <span className="text-gray-900">AED {(payslipModal.deductions - calculateSocialSecurity(payslipModal.basicSalary)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Deductions</span>
                <span className="text-gray-900">AED {payslipModal.deductions.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base">
              <span>Net Pay</span>
              <span className="text-green-600">AED {payslipModal.netPay.toLocaleString()}</span>
            </div>

            {payslipModal.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {payslipModal.notes}</p>
              </div>
            )}

            <button
              onClick={() => setPayslipModal(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}