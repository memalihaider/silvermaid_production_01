'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Plus, Trash2, Save, Eye, Percent, DollarSign, 
  User, Building2, MapPin, Mail, Phone, ShoppingCart, 
  Settings, FileText, ChevronDown, Check, X
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore'

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  sku: string;
}

interface Props {
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel: () => void;
}

export default function QuotationBuilder({ initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<any>({
    quoteNumber: `#QT-${Date.now().toString().slice(-4)}-${new Date().getFullYear()}`,
    clientId: '',
    client: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'AED',
    taxRate: 5,
    discount: 0,
    discountType: 'percentage',
    template: 'professional',
    status: 'Draft',
    services: [],
    products: [],
    notes: '',
    terms: '',
    paymentMethods: ['bank-transfer'],
    ...initialData
  })

  const [loading, setLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Fetch real data from Firebase
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoadingData(true)
      
      // Fetch clients from 'clients' collection
      const clientsSnapshot = await getDocs(collection(db, 'clients'))
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[]
      setClients(clientsData)

      // Fetch leads from 'leads' collection
      const leadsSnapshot = await getDocs(collection(db, 'leads'))
      const leadsData = leadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[]
      setLeads(leadsData)

      // Fetch services from 'services' collection where type is 'SERVICE'
      const servicesQuery = query(
        collection(db, 'services'),
        where('type', '==', 'SERVICE')
      )
      const servicesSnapshot = await getDocs(servicesQuery)
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[]
      setServices(servicesData)

    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error loading data from Firebase')
    } finally {
      setLoadingData(false)
    }
  }

  // Combine clients and leads for dropdown
  const allContacts = [
    ...clients.map(client => ({
      id: `client_${client.id}`,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      location: client.location,
      type: 'Client'
    })),
    ...leads.map(lead => ({
      id: `lead_${lead.id}`,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      location: lead.address || '',
      type: 'Lead'
    }))
  ]

  // Fix the calculation error
  const calculations = useMemo(() => {
    const servicesTotal = (formData.services || []).reduce((sum: number, s: any) => {
      const total = s.total || 0;
      return sum + (typeof total === 'number' ? total : 0);
    }, 0);
    
    const productsTotal = (formData.products || []).reduce((sum: number, p: any) => {
      const total = p.total || 0;
      return sum + (typeof total === 'number' ? total : 0);
    }, 0);
    
    const subtotal = servicesTotal + productsTotal;
    
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = (subtotal * (formData.discount || 0)) / 100;
    } else {
      discountAmount = formData.discount || 0;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (afterDiscount * (formData.taxRate || 0)) / 100;
    const total = afterDiscount + taxAmount;

    return { 
      subtotal: subtotal || 0, 
      discountAmount: discountAmount || 0, 
      taxAmount: taxAmount || 0, 
      total: total || 0 
    };
  }, [formData])

  const saveToFirebase = async (quotationData: any) => {
    setLoading(true)
    setSaveSuccess(false)
    
    try {
      // Recalculate totals before saving
      const servicesTotal = (quotationData.services || []).reduce((sum: number, s: any) => sum + (s.total || 0), 0)
      const productsTotal = (quotationData.products || []).reduce((sum: number, p: any) => sum + (p.total || 0), 0)
      const subtotal = servicesTotal + productsTotal
      
      let discountAmount = 0
      if (quotationData.discountType === 'percentage') {
        discountAmount = (subtotal * (quotationData.discount || 0)) / 100
      } else {
        discountAmount = quotationData.discount || 0
      }

      const afterDiscount = subtotal - discountAmount
      const taxAmount = (afterDiscount * (quotationData.taxRate || 0)) / 100
      const total = afterDiscount + taxAmount

      // Prepare data for Firebase
      const firebaseData = {
        // Basic info
        quoteNumber: quotationData.quoteNumber,
        clientId: quotationData.clientId,
        client: quotationData.client,
        company: quotationData.company,
        email: quotationData.email,
        phone: quotationData.phone,
        location: quotationData.location,
        
        // Dates
        date: quotationData.date,
        validUntil: quotationData.validUntil,
        dueDate: quotationData.dueDate,
        
        // Financial
        currency: quotationData.currency,
        taxRate: quotationData.taxRate,
        discount: quotationData.discount,
        discountType: quotationData.discountType,
        
        // Calculations
        subtotal: subtotal,
        discountAmount: discountAmount,
        taxAmount: taxAmount,
        total: total,
        
        // Other
        template: quotationData.template,
        status: quotationData.status,
        notes: quotationData.notes,
        terms: quotationData.terms,
        paymentMethods: quotationData.paymentMethods,
        
        // Services and Products
        services: (quotationData.services || []).map((service: any) => ({
          id: service.id,
          name: service.name || '',
          description: service.description || '',
          quantity: service.quantity || 0,
          unitPrice: service.unitPrice || 0,
          total: service.total || 0
        })),
        
        products: (quotationData.products || []).map((product: any) => ({
          id: product.id,
          name: product.name || '',
          sku: product.sku || '',
          quantity: product.quantity || 0,
          unitPrice: product.unitPrice || 0,
          total: product.total || 0
        })),
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'user'
      }

      const docRef = await addDoc(collection(db, "quotations"), firebaseData)
      
      console.log("Quotation saved with ID: ", docRef.id)
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      
      if (onSave) {
        onSave({ ...firebaseData, firebaseId: docRef.id })
      }
      
      alert(`✅ Quotation saved successfully}`)
      
      return docRef.id
      
    } catch (error) {
      console.error("Error saving quotation to Firebase: ", error)
      alert("❌ Error saving quotation. Please try again.")
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.client || formData.client === '') {
      alert('⚠️ Please select a client before saving.')
      return
    }

    if (formData.services.length === 0 && formData.products.length === 0) {
      alert('⚠️ Please add at least one service or product before saving.')
      return
    }

    await saveToFirebase(formData)
  }

  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      description: ''
    }
    setFormData({ ...formData, services: [...formData.services, newService] })
  }

  const handleUpdateService = (id: string, field: string, value: any) => {
    const updated = formData.services.map((s: any) => {
      if (s.id === id) {
        const up = { ...s, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          up.total = (up.quantity || 0) * (up.unitPrice || 0)
        }
        return up
      }
      return s
    })
    setFormData({ ...formData, services: updated })
  }

  const handleRemoveService = (id: string) => {
    setFormData({ ...formData, services: formData.services.filter((s: any) => s.id !== id) })
  }

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      sku: ''
    }
    setFormData({ ...formData, products: [...formData.products, newProduct] })
  }

  const handleUpdateProduct = (id: string, field: string, value: any) => {
    const updated = formData.products.map((p: any) => {
      if (p.id === id) {
        const up = { ...p, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          up.total = (up.quantity || 0) * (up.unitPrice || 0)
        }
        return up
      }
      return p
    })
    setFormData({ ...formData, products: updated })
  }

  const handleRemoveProduct = (id: string) => {
    setFormData({ ...formData, products: formData.products.filter((p: any) => p.id !== id) })
  }

  const selectContact = (contactId: string) => {
    const contact = allContacts.find(c => c.id === contactId)
    if (contact) {
      setFormData({
        ...formData,
        clientId: contact.id,
        client: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        location: contact.location
      })
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT: FORM */}
      <div className="flex-1 space-y-6">
        {/* Header Section */}
        <div className="bg-white border border-gray-300 rounded p-4 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
             <h3 className="text-sm font-bold uppercase tracking-tight text-black flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Quotation Information
             </h3>
             <div className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                  {formData.quoteNumber}
               </span>
               {saveSuccess && (
                 <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    ✓ Saved to Firebase
                 </span>
               )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
                {loadingData ? 'Loading Contacts...' : 'Select Client/Lead'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  onChange={(e) => selectContact(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black bg-white font-medium"
                  disabled={loadingData}
                  value={formData.clientId || ''}
                >
                  <option value="">Select Client or Lead...</option>
                  {allContacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company} ({contact.type})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {clients.length} clients & {leads.length} leads loaded from Firebase
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Issue Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Valid Until</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-3 rounded border border-gray-100 italic">
            <div className="space-y-1">
               <label className="text-[9px] uppercase font-bold text-gray-400">Company</label>
               <input
                type="text"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-xs font-bold text-black focus:ring-0 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] uppercase font-bold text-gray-400">Email Address</label>
               <input
                type="email"
                placeholder="client@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-xs font-bold text-black focus:ring-0 placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] uppercase font-bold text-gray-400">Location / Area</label>
               <input
                type="text"
                placeholder="Dubai Marina, UAE"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-xs font-bold text-black focus:ring-0 placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white border border-gray-300 rounded p-4 space-y-4 shadow-none">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
            <h3 className="text-sm font-bold uppercase tracking-tight text-black flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Service Line Items
            </h3>
            <button 
              onClick={handleAddService}
              className="px-3 py-1 bg-black text-white text-[10px] uppercase font-bold rounded hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" />
              Add Service
            </button>
          </div>

          <div className="space-y-2">
            {formData.services.map((service: any) => (
              <div key={service.id} className="grid grid-cols-12 gap-2 items-start bg-white border border-gray-200 p-2 rounded relative group">
                <div className="col-span-4 space-y-1">
                   <select 
                    onChange={(e) => {
                      const selectedService = services.find(s => s.name === e.target.value)
                      if (selectedService) {
                        handleUpdateService(service.id, 'unitPrice', selectedService.price)
                      }
                      handleUpdateService(service.id, 'name', e.target.value)
                    }}
                    className="w-full text-xs font-bold border-none p-1 focus:ring-0 bg-gray-50 rounded"
                    value={service.name}
                    disabled={loadingData}
                   >
                    <option value="">Choose Service...</option>
                    {services.map(svc => (
                      <option key={svc.id} value={svc.name}>
                        {svc.name} - AED {svc.price}
                      </option>
                    ))}
                   </select>
                   <input 
                    type="text"
                    placeholder="Brief description..."
                    className="w-full text-[10px] border-none p-1 focus:ring-0 text-gray-500 italic"
                    value={service.description}
                    onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                   />
                </div>
                <div className="col-span-2">
                   <input 
                    type="number" 
                    placeholder="Qty" 
                    className="w-full text-xs font-bold text-center border-none p-2 bg-gray-50 rounded focus:ring-0"
                    value={service.quantity}
                    onChange={(e) => handleUpdateService(service.id, 'quantity', Number(e.target.value) || 0)}
                    min="1"
                   />
                </div>
                <div className="col-span-3">
                   <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">AED</span>
                      <input 
                        type="number" 
                        placeholder="Price" 
                        className="w-full text-xs font-bold text-right border-none p-2 pl-9 bg-gray-50 rounded focus:ring-0"
                        value={service.unitPrice}
                        onChange={(e) => handleUpdateService(service.id, 'unitPrice', Number(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                   </div>
                </div>
                <div className="col-span-2">
                   <div className="p-2 text-right text-xs font-black text-black">
                      {((service.total || 0).toLocaleString())}
                   </div>
                </div>
                <div className="col-span-1 flex justify-center pt-1.5">
                   <button 
                    onClick={() => handleRemoveService(service.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
            
            {formData.services.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded text-gray-400 text-xs italic">
                {loadingData ? 'Loading services...' : 'No services added. Click "Add Service" to start building your quote.'}
              </div>
            )}
            
            {!loadingData && services.length === 0 && (
              <div className="text-center py-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-600 text-xs">
                No services found in Firebase. Please add services first.
              </div>
            )}
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="bg-white border border-gray-300 rounded p-4 space-y-4 shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Notes to Client</label>
              <textarea 
                rows={3}
                placeholder="Personal message or important details..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-black resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Terms & Conditions</label>
              <textarea 
                rows={3}
                placeholder="Payment terms, validity, scope boundaries..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-black resize-none"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: SUMMARY & ACTIONS */}
      <div className="w-full lg:w-[320px] space-y-4">
        {/* TOTALS BOX */}
        <div className="bg-black text-white rounded p-1 shadow-none">
          <div className="bg-white border border-black rounded p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
               <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pricing Summary</span>
               <span className="text-[10px] font-medium text-black bg-gray-100 px-2 py-0.5 rounded uppercase">AED</span>
            </div>

            <div className="space-y-2.5">
               <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>Subtotal</span>
                  <span>{calculations.subtotal.toLocaleString()}</span>
               </div>
               
               <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-black text-gray-400">Discount</label>
                    <div className="flex gap-1">
                      <input 
                        type="number"
                        className="w-full text-[13px] text-black font-black border border-gray-200 rounded px-2 py-1 focus:border-black focus:ring-0"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) || 0 })}
                        min="0"
                      />
                      <button 
                        onClick={() => setFormData({ ...formData, discountType: formData.discountType === 'percentage' ? 'fixed' : 'percentage' })}
                        className="px-2 border border-gray-200 rounded text-[10px] font-bold bg-gray-50"
                      >
                         {formData.discountType === 'percentage' ? '%' : 'FIX'}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] uppercase font-black text-gray-400">Tax (%)</label>
                    <input 
                        type="number"
                        className="w-full text-[13px] text-black font-black border border-gray-200 rounded px-2 py-1 focus:border-black focus:ring-0"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) || 0 })}
                        min="0"
                        max="100"
                      />
                  </div>
               </div>

               <div className="pt-2 space-y-1">
                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-[11px] font-bold text-green-600">
                      <span>Discount Apply</span>
                      <span>-{calculations.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-bold text-gray-400">
                    <span>Tax Amount (VAT)</span>
                    <span>+{calculations.taxAmount.toLocaleString()}</span>
                  </div>
               </div>

               <div className="pt-4 border-t-2 border-black">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] uppercase font-black text-black leading-none mb-1">Total Payable</p>
                        <p className="text-2xl font-black text-black leading-none tracking-tighter">
                          {calculations.total.toLocaleString()}
                        </p>
                     </div>
                     <p className="text-[10px] font-bold text-gray-400">AED</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="space-y-2">
           <button 
            onClick={handleSave}
            disabled={loading || loadingData}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded text-sm font-bold uppercase tracking-widest transition-all shadow-lg text-center ${
              loading || loadingData
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
            }`}
           >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving to Firebase...
                </>
              ) : loadingData ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Loading Data...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Quotation
                </>
              )}
           </button>
           
           <div className="grid grid-cols-2 gap-2">
              <button 
                disabled={loadingData}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2 rounded text-[11px] font-bold uppercase tracking-tight hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Eye className="w-3.5 h-3.5" />
                 Preview
              </button>
              <button 
                onClick={onCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2 rounded text-[11px] font-bold uppercase tracking-tight hover:bg-red-50 disabled:opacity-50"
              >
                 <X className="w-3.5 h-3.5" />
                 Cancel
              </button>
           </div>
           
           {saveSuccess && (
             <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
               <p className="text-[10px] font-bold text-green-700">
                 ✓ Quotation saved to Firebase collection "quotations"!
               </p>
               <p className="text-[9px] text-green-600 mt-1">
                 All data including calculations saved successfully
               </p>
             </div>
           )}
           
           {loadingData && (
             <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-center">
               <p className="text-[10px] font-bold text-blue-700">
                 ⏳ Loading data from Firebase...
               </p>
               <p className="text-[9px] text-blue-600 mt-1">
                 Clients: {clients.length} | Leads: {leads.length} | Services: {services.length}
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}