
'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore'

interface FirebaseService {
  id: string
  name: string
  description: string
  price: number
  categoryName: string
  status: string
  cost: number
}

interface FormData {
  serviceId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  bookingDate: string
  bookingTime: string
  notes: string
  propertyType: string
  frequency: string
  area: string
  serviceHours: number
}

const EXTRA_HOURLY_RATE_AED = 35

function BookingPageContent() {
  const searchParams = useSearchParams()
  const selectedServiceId = searchParams.get('service') || ''

  const [currentStep, setCurrentStep] = useState(1)
  const [services, setServices] = useState<FirebaseService[]>([])
  const [selectedService, setSelectedService] = useState<FirebaseService | null>(null)
  const [formData, setFormData] = useState<FormData>({
    serviceId: selectedServiceId,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    bookingDate: '',
    bookingTime: '',
    notes: '',
    propertyType: 'apartment',
    frequency: 'once',
    area: '',
    serviceHours: 1
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingNumber, setBookingNumber] = useState('')

  // Fetch active services from Firebase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, 'services')
        const q = query(servicesRef, where('status', '==', 'ACTIVE'))
        const querySnapshot = await getDocs(q)
        
        const servicesData: FirebaseService[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          servicesData.push({
            id: doc.id,
            name: data.name || 'Service',
            description: data.description || '',
            price: data.price || 0,
            categoryName: data.categoryName || 'Uncategorized',
            status: data.status || '',
            cost: data.cost || 0
          })
        })
        
        setServices(servicesData)
        
        // Set selected service if coming from URL
        if (selectedServiceId) {
          const service = servicesData.find(s => s.id === selectedServiceId)
          if (service) {
            setSelectedService(service)
            setFormData(prev => ({ ...prev, serviceId: selectedServiceId }))
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setIsLoadingServices(false)
      }
    }

    fetchServices()
  }, [selectedServiceId])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone: string) => {
    return phone.replace(/\D/g, '').length >= 10
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.serviceId) {
        newErrors.serviceId = 'Please select a service'
      }
    }

    if (currentStep === 2) {
      if (!formData.clientName.trim()) {
        newErrors.clientName = 'Name is required'
      }
      if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Email is required'
      } else if (!validateEmail(formData.clientEmail)) {
        newErrors.clientEmail = 'Please enter a valid email'
      }
      if (!formData.clientPhone.trim()) {
        newErrors.clientPhone = 'Phone is required'
      } else if (!validatePhone(formData.clientPhone)) {
        newErrors.clientPhone = 'Please enter a valid phone number'
      }
      if (!formData.clientAddress.trim()) {
        newErrors.clientAddress = 'Address is required'
      }
    }

    if (currentStep === 3) {
      if (!formData.bookingDate) {
        newErrors.bookingDate = 'Please select a date'
      }
      if (!formData.bookingTime) {
        newErrors.bookingTime = 'Please select a time'
      }
      if (!formData.serviceHours || formData.serviceHours < 1) {
        newErrors.serviceHours = 'Please select at least 1 hour'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'serviceHours' ? Math.max(1, Number(value) || 1) : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const additionalHoursAmount = formData.serviceHours * EXTRA_HOURLY_RATE_AED
  const estimatedTotalAmount = (selectedService?.price || 0) + additionalHoursAmount

  const saveBookingToFirebase = async (bookingData: any) => {
    try {
      // Generate booking ID
      const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`

      // Prepare data with metadata
      const bookingWithMeta = {
        ...bookingData,
        bookingId,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "bookings"), bookingWithMeta)

      return {
        success: true,
        bookingId: docRef.id,
        bookingRef: bookingId,
      }
    } catch (error: any) {
      console.error("Firebase Error:", error)
      return {
        success: false,
        error: error.message || "Failed to save booking",
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate final step
    const newErrors: Record<string, string> = {}
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required'
    }
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required'
    } else if (!validateEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email'
    }
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare booking data for Firebase
      const bookingData = {
        service: formData.serviceId,
        serviceId: formData.serviceId,
        serviceHours: formData.serviceHours,
        serviceDuration: formData.serviceHours,
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        propertyType: formData.propertyType,
        area: formData.area,
        frequency: formData.frequency,
        date: formData.bookingDate,
        time: formData.bookingTime,
        message: formData.notes,
        clientAddress: formData.clientAddress,
        baseAmount: selectedService?.price || 0,
        hourlyRate: EXTRA_HOURLY_RATE_AED,
        totalAmount: estimatedTotalAmount
      }

      // Save to Firebase
      const result = await saveBookingToFirebase(bookingData)

      if (result.success) {
        setBookingNumber(result.bookingRef || '')
        setShowSuccessModal(true)
        
        // Reset form
        setFormData({
          serviceId: '',
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          clientAddress: '',
          bookingDate: '',
          bookingTime: '',
          notes: '',
          propertyType: 'apartment',
          frequency: 'once',
          area: '',
          serviceHours: 1
        })
        setSelectedService(null)
        setCurrentStep(1)
      } else {
        throw new Error(result.error || 'Failed to save booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Error saving booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </button>
          <h1 className="text-4xl font-black text-foreground mb-2">Book Your Service</h1>
          <p className="text-muted-foreground">Follow the steps below to complete your booking</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-bold text-muted-foreground mt-4">
            <span>Select Service</span>
            <span>Your Details</span>
            <span>When?</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-black mb-6 text-foreground">Select Your Service</h2>

              {isLoadingServices ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                      <div className="animate-pulse">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                  <p className="text-amber-700 dark:text-amber-300 font-bold">No services available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, serviceId: service.id }))
                        setSelectedService(service)
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.serviceId === service.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="font-bold text-foreground">AED {service.price}</span>
                            <span className="text-muted-foreground">Category: {service.categoryName}</span>
                          </div>
                        </div>
                        {formData.serviceId === service.id && (
                          <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {errors.serviceId && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-bold">{errors.serviceId}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg space-y-4">
              <h2 className="text-2xl font-black mb-6 text-foreground">Your Details</h2>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Ahmed Al-Mansoori"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.clientName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.clientName && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="ahmed@example.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.clientEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.clientEmail && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.clientEmail}</p>
                )}
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  placeholder="+971-50-123-4567"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.clientPhone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.clientPhone && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.clientPhone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="office">Office</option>
                  </select>
                </div>

                <div>
                  <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="once">One-Time</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Service Address
                </label>
                <input
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  placeholder="Palm Jumeirah, Dubai"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.clientAddress ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.clientAddress && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.clientAddress}</p>
                )}
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  General Area / Location
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Dubai Marina, Downtown, etc."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg space-y-4">
              <h2 className="text-2xl font-black mb-6 text-foreground">When Do You Need It?</h2>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.bookingDate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.bookingDate && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.bookingDate}</p>
                )}
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time
                </label>
                <select
                  name="bookingTime"
                  value={formData.bookingTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.bookingTime ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="">Select a time...</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
                {errors.bookingTime && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.bookingTime}</p>
                )}
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  Service Hours
                </label>
                <select
                  name="serviceHours"
                  value={formData.serviceHours}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.serviceHours ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{h} {h === 1 ? 'Hour' : 'Hours'}</option>
                  ))}
                </select>
                {errors.serviceHours && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-bold mt-1">{errors.serviceHours}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">AED {EXTRA_HOURLY_RATE_AED} will be added per selected hour</p>
              </div>

              <div>
                <label className="flex text-sm font-bold text-foreground mb-2 items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Special Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any specific instructions or priorities for our team?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && selectedService && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg space-y-6">
              <h2 className="text-2xl font-black mb-6 text-foreground">Confirm Your Booking</h2>

              <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Service</p>
                  <p className="font-bold text-foreground text-right">{selectedService.name}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Client Name</p>
                  <p className="font-bold text-foreground text-right">{formData.clientName}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Email</p>
                  <p className="font-bold text-foreground text-right">{formData.clientEmail}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Phone</p>
                  <p className="font-bold text-foreground text-right">{formData.clientPhone}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Property Type</p>
                  <p className="font-bold text-foreground text-right">{formData.propertyType}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Frequency</p>
                  <p className="font-bold text-foreground text-right">{formData.frequency}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Address</p>
                  <p className="font-bold text-foreground text-right">{formData.clientAddress}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Area</p>
                  <p className="font-bold text-foreground text-right">{formData.area}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Date & Time</p>
                  <p className="font-bold text-foreground text-right">{formData.bookingDate} at {formData.bookingTime}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Service Hours</p>
                  <p className="font-bold text-foreground text-right">{formData.serviceHours} {formData.serviceHours === 1 ? 'Hour' : 'Hours'}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Hours Charge</p>
                  <p className="font-bold text-foreground text-right">AED {additionalHoursAmount}</p>
                </div>
                <div className="h-px bg-blue-200 dark:bg-blue-900"></div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-bold">Estimated Price</p>
                  <p className="font-black text-blue-600 text-lg">AED {estimatedTotalAmount}</p>
                </div>
              </div>

              {formData.notes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-bold">Special Notes</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{formData.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-foreground transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-500/30"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm mx-auto text-center shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-4">Your service booking has been successfully submitted</p>
            <p className="text-sm text-muted-foreground mb-6">
              Booking Number: <span className="font-black text-foreground">{bookingNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              We'll send you a confirmation email shortly. Our team will contact you to confirm the details.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>}>
      <BookingPageContent />
    </Suspense>
  )
}