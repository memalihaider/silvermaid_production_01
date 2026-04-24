"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Upload,
  Wallet,
  X,
} from "lucide-react"
import { db, storage } from "@/lib/firebase"

type BookingStep = 0 | 1 | 2 | 3

type Category = {
  id: string
  name: string
  description: string
  image: string
  isActive: boolean
}

type Service = {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  categoryName: string
  imageUrl: string
  status: string
}

type Employee = {
  id: string
  name: string
  role: string
  status: string
}

type CartItem = {
  service: Service
  quantity: number
}

const VAT_RATE = 0.05
const HOURLY_RATE_AED = 35

const defaultCategoryImage =
  "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1200"
const defaultServiceImage =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1200"

const makeDays = (count: number) => {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    return {
      iso: d.toISOString().split("T")[0],
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      day: d.toLocaleDateString("en-US", { day: "2-digit" }),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    }
  })
}

const buildTimeSlots = () => {
  const slots: string[] = []
  const intervals = [0, 30]
  for (let hour = 8; hour <= 18; hour++) {
    for (const m of intervals) {
      if (hour === 18 && m > 0) continue
      const h = hour.toString().padStart(2, "0")
      const mm = m.toString().padStart(2, "0")
      const labelDate = new Date(2026, 0, 1, hour, m)
      const label = labelDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      slots.push(`${h}:${mm}|${label}`)
    }
  }
  return slots
}

const normalizePhone = (raw: string) => raw.replace(/\s+/g, "").trim()

export default function BookServicePage() {
  const [step, setStep] = useState<BookingStep>(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [propertyArea, setPropertyArea] = useState("")
  const [professionalsCount, setProfessionalsCount] = useState(1)
  const [serviceFrequency, setServiceFrequency] = useState<"once" | "weekly" | "biweekly">("once")
  const [serviceHours, setServiceHours] = useState(1)
  const [primaryServiceId, setPrimaryServiceId] = useState<string>("")
  const [showFrequencyModal, setShowFrequencyModal] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [systemNow, setSystemNow] = useState<Date>(() => new Date())
  const [showPhonePopup, setShowPhonePopup] = useState(false)
  const [phoneInput, setPhoneInput] = useState("+971")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [paymentOption, setPaymentOption] = useState<"manual" | "stripe">("manual")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const days = useMemo(() => makeDays(10), [])
  const timeSlots = useMemo(() => buildTimeSlots(), [])
  const dayScrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemNow(new Date())
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  const normalizeBookingTime = (rawTime: string) => {
    if (!rawTime) return ""

    const plainValue = rawTime.includes("|") ? rawTime.split("|")[0] : rawTime.trim()
    if (/^\d{2}:\d{2}$/.test(plainValue)) return plainValue

    const match = plainValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return ""

    let hour = Number(match[1])
    const minute = Number(match[2])
    const period = match[3].toUpperCase()

    if (period === "PM" && hour !== 12) hour += 12
    if (period === "AM" && hour === 12) hour = 0

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  const isPastTimeForSelectedDay = (dateIso: string, timeValue: string) => {
    if (!dateIso || !timeValue) return false

    const todayIso = systemNow.toISOString().split("T")[0]
    if (dateIso !== todayIso) return false

    const [hour, minute] = timeValue.split(":").map(Number)
    const slotDate = new Date(systemNow)
    slotDate.setHours(hour, minute, 0, 0)

    return slotDate.getTime() <= systemNow.getTime()
  }

  const isSlotUnavailable = (dateIso: string, timeValue: string) => {
    if (!dateIso || !timeValue) return false
    if (isPastTimeForSelectedDay(dateIso, timeValue)) return true
    return bookedSlots.has(`${dateIso}|${timeValue}`)
  }

  useEffect(() => {
    const categoryQuery = query(collection(db, "categories"))
    const serviceQuery = query(collection(db, "services"))
    const employeeQuery = query(collection(db, "employees"))
    const bookingQuery = query(collection(db, "bookings"))

    const unsubCategories = onSnapshot(categoryQuery, (snap) => {
      const rows: Category[] = snap.docs.map((doc) => {
        const data = doc.data() as Record<string, any>
        return {
          id: doc.id,
          name: data.name || "Category",
          description: data.description || "",
          image: data.image || defaultCategoryImage,
          isActive: data.isActive !== false,
        }
      })
      setCategories(rows.filter((c) => c.isActive))
    })

    const unsubServices = onSnapshot(serviceQuery, (snap) => {
      const rows: Service[] = snap.docs
        .map((doc) => {
          const data = doc.data() as Record<string, any>
          return {
            id: doc.id,
            name: data.name || "Service",
            description: data.description || "",
            price: Number(data.price || 0),
            categoryId: data.categoryId || "",
            categoryName: data.categoryName || "Uncategorized",
            imageUrl: data.imageUrl || defaultServiceImage,
            status: data.status || "ACTIVE",
          }
        })
        .filter((item) => item.status === "ACTIVE")
      setServices(rows)
    })

    const unsubEmployees = onSnapshot(employeeQuery, (snap) => {
      const rows: Employee[] = snap.docs
        .map((doc) => {
          const data = doc.data() as Record<string, any>
          return {
            id: doc.id,
            name: data.name || "Professional",
            role: data.role || "CLEANER",
            status: data.status || "Active",
          }
        })
        .filter((emp) => {
          const status = emp.status.toLowerCase()
          return status === "active"
        })
      setEmployees(rows)
    })

    const unsubBookings = onSnapshot(bookingQuery, (snap) => {
      const blocked = new Set<string>()

      for (const bookingDoc of snap.docs) {
        const data = bookingDoc.data() as Record<string, any>
        const status = String(data.status || "pending").toLowerCase()
        if (status === "cancelled" || status === "rejected") continue

        const rawDate = data.date || data.bookingDate || ""
        const rawTime = data.time || data.bookingTime || ""
        const normalizedTime = normalizeBookingTime(String(rawTime || ""))

        if (rawDate && normalizedTime) {
          blocked.add(`${rawDate}|${normalizedTime}`)
        }

        if (Array.isArray(data.schedule)) {
          for (const slot of data.schedule) {
            const slotDate = String(slot?.date || "")
            const slotTime = normalizeBookingTime(String(slot?.time || ""))
            if (slotDate && slotTime) {
              blocked.add(`${slotDate}|${slotTime}`)
            }
          }
        }
      }

      setBookedSlots(blocked)
    })

    return () => {
      unsubCategories()
      unsubServices()
      unsubEmployees()
      unsubBookings()
    }
  }, [])

  useEffect(() => {
    // Keep selected professionals count aligned when quantity changes.
    setSelectedStaffIds((prev) => prev.slice(0, professionalsCount))
  }, [professionalsCount])

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  useEffect(() => {
    if (!selectedDate || !selectedTime) return
    if (isSlotUnavailable(selectedDate, selectedTime)) {
      setSelectedTime("")
    }
  }, [selectedDate, selectedTime, bookedSlots, systemNow])

  const fallbackCategories = useMemo(() => {
    if (categories.length > 0) return categories

    const grouped = new Map<string, Category>()
    for (const service of services) {
      const key = service.categoryId || service.categoryName || "misc"
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: service.categoryId || key,
          name: service.categoryName || "General",
          description: "",
          image: defaultCategoryImage,
          isActive: true,
        })
      }
    }

    return Array.from(grouped.values())
  }, [categories, services])

  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return services
    return services.filter((s) => s.categoryId === selectedCategoryId || s.categoryName === selectedCategoryId)
  }, [services, selectedCategoryId])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const primaryCartItem = useMemo(() => {
    if (primaryServiceId && cart[primaryServiceId]) return cart[primaryServiceId]
    const first = cartItems[0]
    if (first) return first
    return undefined
  }, [cart, cartItems, primaryServiceId])
  const addonCartItems = useMemo(() => {
    if (!primaryCartItem) return cartItems
    return cartItems.filter((item) => item.service.id !== primaryCartItem.service.id)
  }, [cartItems, primaryCartItem])

  const hourlyRate = useMemo(() => {
    // Primary service defines per-hour amount; fall back to legacy HOURLY_RATE_AED if not selected yet
    return primaryCartItem?.service.price ?? HOURLY_RATE_AED
  }, [primaryCartItem])
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const addonsSubtotal = useMemo(
    () => addonCartItems.reduce((sum, item) => sum + item.service.price * item.quantity, 0),
    [addonCartItems],
  )
  const hoursSubtotal = useMemo(() => serviceHours * hourlyRate, [serviceHours, hourlyRate])
  const discountRate = useMemo(() => {
    if (serviceFrequency === "weekly") return 0.1
    if (serviceFrequency === "biweekly") return 0.05
    return 0
  }, [serviceFrequency])

  const preDiscountSubtotal = useMemo(() => addonsSubtotal + hoursSubtotal, [addonsSubtotal, hoursSubtotal])
  const discountAmount = useMemo(
    () => Number((preDiscountSubtotal * discountRate).toFixed(2)),
    [discountRate, preDiscountSubtotal],
  )
  const subtotal = useMemo(
    () => Number((preDiscountSubtotal - discountAmount).toFixed(2)),
    [discountAmount, preDiscountSubtotal],
  )
  const vatAmount = useMemo(() => Number((subtotal * VAT_RATE).toFixed(2)), [subtotal])
  const total = useMemo(() => Number((subtotal + vatAmount).toFixed(2)), [subtotal, vatAmount])

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return ""
    const d = days.find((x) => x.iso === selectedDate)
    if (!d) return selectedDate
    return `${d.weekday} ${d.day} ${d.month}`
  }, [days, selectedDate])

  const addToCart = (service: Service) => {
    setPrimaryServiceId((prev) => prev || service.id)
    setCart((prev) => {
      const existing = prev[service.id]
      const qty = existing ? existing.quantity + 1 : 1
      return {
        ...prev,
        [service.id]: { service, quantity: qty },
      }
    })
  }

  const decrementCart = (serviceId: string) => {
    setCart((prev) => {
      const existing = prev[serviceId]
      if (!existing) return prev
      if (existing.quantity <= 1) {
        const next = { ...prev }
        delete next[serviceId]
        return next
      }
      return {
        ...prev,
        [serviceId]: { ...existing, quantity: existing.quantity - 1 },
      }
    })
  }

  const clearItem = (serviceId: string) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[serviceId]
      return next
    })
    setPrimaryServiceId((prev) => (prev === serviceId ? "" : prev))
  }

  const toggleStaff = (staffId: string) => {
    setSelectedStaffIds((prev) => {
      if (prev.includes(staffId)) {
        return prev.filter((id) => id !== staffId)
      }
      if (prev.length >= professionalsCount) {
        setFormError(`You can select up to ${professionalsCount} professional(s).`)
        return prev
      }
      setFormError("")
      return [...prev, staffId]
    })
  }

  const validateBeforeCheckout = () => {
    if (!selectedDate || !selectedTime) {
      setFormError("Please select a date and time.")
      return false
    }
    if (!serviceFrequency) {
      setFormError("Please select booking frequency.")
      return false
    }
    if (!serviceHours || serviceHours < 1) {
      setFormError("Please select number of hours.")
      return false
    }
    if (cartItems.length === 0) {
      setFormError("Please add at least one service to continue.")
      return false
    }
    return true
  }

  const handleScheduleNext = () => {
    setFormError("")
    if (!validateBeforeCheckout()) return
    setShowPhonePopup(true)
  }

  const handlePhoneConfirm = () => {
    const normalized = normalizePhone(phoneInput)
    if (!normalized || normalized.length < 8) {
      setFormError("Please enter a valid phone number to continue.")
      return
    }
    setPhoneInput(normalized)
    setShowPhonePopup(false)
    setFormError("")
    setStep(3)
  }

  const uploadReceiptIfNeeded = async () => {
    if (paymentOption !== "manual") return ""
    if (!receiptFile) {
      throw new Error("Please upload payment receipt for manual payment.")
    }

    const path = `booking-receipts/${Date.now()}_${receiptFile.name.replace(/\s+/g, "_")}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, receiptFile)
    return getDownloadURL(storageRef)
  }

  const handleSubmitBooking = async () => {
    setFormError("")
    setSuccessMessage("")

    if (cartItems.length === 0) {
      setFormError("Your cart is empty.")
      return
    }

    if (!selectedDate || !selectedTime) {
      setFormError("Please complete schedule details.")
      return
    }

    if (!normalizePhone(phoneInput)) {
      setFormError("Phone number is required.")
      return
    }

    setIsSubmitting(true)
    try {
      const receiptUrl = await uploadReceiptIfNeeded()
      const bookingRef = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
      const firstItem = cartItems[0]
      const selectedStaff = employees.filter((emp) => selectedStaffIds.includes(emp.id))
      const selectedStaffNames = selectedStaff.map((emp) => emp.name)
      const cartPayload = cartItems.map((item) => ({
        serviceId: item.service.id,
        serviceName: item.service.name,
        categoryId: item.service.categoryId,
        categoryName: item.service.categoryName,
        quantity: item.quantity,
        unitPrice: item.service.price,
        lineTotal: item.service.price * item.quantity,
      }))

      const payload = {
        bookingId: bookingRef,
        status: "pending",
        name: customerName || "Guest",
        email: customerEmail || "",
        phone: phoneInput,
        clientName: customerName || "Guest",
        clientEmail: customerEmail || "",
        clientPhone: phoneInput,
        clientAddress: propertyArea,
        area: propertyArea,
        service: firstItem?.service.name || "Service Booking",
        serviceId: firstItem?.service.id || "",
        serviceName: firstItem?.service.name || "Service Booking",
        selectedServices: cartPayload,
        date: selectedDate,
        time: selectedTime,
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        schedule: [{ date: selectedDate, time: selectedTime }],
        duration: serviceHours,
        serviceHours,
        serviceDuration: String(serviceHours),
        hourlyRate,
        baseAmount: addonsSubtotal,
        hoursAmount: hoursSubtotal,
        numberOfMaids: professionalsCount,
        message: specialInstructions,
        propertyType: "apartment",
        frequency: serviceFrequency,
        staffId: selectedStaff[0]?.id || "",
        staffName: selectedStaffNames.join(", "),
        assignedStaff: selectedStaffNames.join(", "),
        assignedStaffIds: selectedStaff.map((emp) => emp.id),
        assignedStaffNames: selectedStaffNames,
        paymentMethod: paymentOption === "stripe" ? "card" : "after-work",
        paymentStatus: paymentOption === "manual" ? "pending" : "pending",
        paymentOption,
        manualReceiptUrl: receiptUrl || "",
        subtotal,
        discountRate,
        discountAmount,
        taxAmount: vatAmount,
        totalAmount: total,
        estimatedPrice: total,
        currency: "AED",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "bookings"), payload)

      // Fire and forget booking email notification
      fetch("/api/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: payload.clientName,
          clientEmail: payload.clientEmail,
          clientPhone: payload.clientPhone,
          serviceName: cartItems.map((i) => i.service.name).join(", "),
          bookingDate: payload.bookingDate,
          bookingTime: payload.bookingTime,
          message: payload.message,
          bookingId: payload.bookingId,
          area: payload.area,
          propertyType: payload.propertyType,
          frequency: payload.frequency,
          serviceHours: payload.serviceHours,
          numberOfMaids: payload.numberOfMaids,
          staffId: payload.staffId,
          staffName: payload.staffName,
          source: "new-book-service-flow",
        }),
      }).catch(() => {
        // no-op: booking should not fail if email fails
      })

      setSuccessMessage(`Booking submitted successfully. Reference: ${bookingRef}`)
      setCart({})
      setSelectedDate("")
      setSelectedTime("")
      setSpecialInstructions("")
      setPropertyArea("")
      setProfessionalsCount(1)
      setServiceFrequency("once")
      setServiceHours(1)
      setSelectedStaffIds([])
      setReceiptFile(null)
      setPaymentOption("manual")
      setStep(0)
    } catch (error: any) {
      setFormError(error?.message || "Failed to submit booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const summaryCard = (
    <aside className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24 h-fit">
      <h3 className="text-3xl font-semibold text-slate-900 mb-4">Booking Summary</h3>
      {cartItems.length === 0 ? (
        <p className="text-sm text-slate-500">No services added yet.</p>
      ) : (
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.service.id} className="border-b border-slate-100 pb-3">
              <p className="text-sm font-semibold text-slate-900">{item.service.name}</p>
              <p className="text-xs text-slate-500">{item.quantity} x AED {item.service.price.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => decrementCart(item.service.id)}
                  className="h-7 w-7 rounded-lg bg-pink-100 text-primary text-sm font-bold"
                >
                  -
                </button>
                <span className="text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => addToCart(item.service)}
                  className="h-7 w-7 rounded-lg bg-pink-100 text-primary text-sm font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => clearItem(item.service.id)}
                  className="ml-auto text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Add-ons</span>
              <span>AED {addonsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hours ({serviceHours} x AED {hourlyRate})</span>
              <span>AED {hoursSubtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Frequency discount ({Math.round(discountRate * 100)}%)</span>
                <span>- AED {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxable Amount</span>
              <span>AED {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total (inc VAT 5.0%)</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sky-600 text-2xl font-bold border-t border-slate-200 pt-2">
              <span>Total</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
          </div>

          {selectedDate && selectedTime && (
            <div className="pt-3 border-t border-slate-200 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Date & Time</p>
              <p>{selectedDateLabel}</p>
              <p>{selectedTime}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )

  const stepTitle =
    step === 0
      ? "Book Service"
      : step === 1
      ? "Select Category"
      : step === 2
        ? "Date & Time"
        : "Checkout"

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-semibold text-slate-900">{stepTitle}</h1>
          {step > 0 && (
            <p className="text-sm text-slate-600 mt-1">Step {step} of 3</p>
          )}
        </div>

        {formError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            <AlertCircle className="h-4 w-4" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-10">
              <p className="inline-flex items-center rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold">
                Silver Maid Cleaning
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mt-4 leading-tight">
                Ready to Schedule Your Cleaning?
              </h2>
              <p className="text-slate-600 mt-3">
                Continue to choose category, select real-time services, pick your date and time, then complete checkout.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormError("")
                  setStep(1)
                }}
                className="mt-6 h-11 px-8 rounded-xl bg-primary text-white font-semibold hover:bg-pink-700 shadow-md shadow-primary/20"
              >
                Book Now
              </button>
            </div>
            <div className="relative min-h-80">
              <img
                src={defaultCategoryImage}
                alt="Booking"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-sky-500/50 to-transparent" />
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {fallbackCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(category.id)
                    setFormError("")
                    setStep(2)
                  }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left hover:border-sky-400 transition-colors"
                >
                  <img src={category.image || defaultCategoryImage} alt={category.name} className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="text-2xl font-semibold text-slate-900">{category.name}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{category.description || "Live category from your admin panel."}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="h-11 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-sky-50/70 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-sky-700" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Frequency</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {serviceFrequency === "once" ? "One Time" : serviceFrequency === "weekly" ? "Weekly" : "Bi Weekly"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFrequencyModal(true)}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-4"
                >
                  CHANGE
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">When would you like your service?</h3>

                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => dayScrollerRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
                    className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    aria-label="Scroll dates left"
                  >
                    <ChevronLeft className="h-4 w-4 mx-auto" />
                  </button>

                  <div
                    ref={dayScrollerRef}
                    className="flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]"
                  >
                    <div className="flex gap-2 pr-2 [&::-webkit-scrollbar]:hidden">
                      {days.map((day) => {
                        const active = selectedDate === day.iso
                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => setSelectedDate(day.iso)}
                            className={`min-w-16 rounded-xl border px-2.5 py-2 text-center transition-colors ${
                              active ? "border-sky-400 bg-sky-100 text-sky-900" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <p className="text-[10px] font-semibold text-slate-500">{day.weekday}</p>
                            <p className="text-base font-bold leading-tight">{day.day}</p>
                            <p className="text-[10px] text-slate-400">{day.month}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => dayScrollerRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
                    className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    aria-label="Scroll dates right"
                  >
                    <ChevronRight className="h-4 w-4 mx-auto" />
                  </button>
                </div>

                <h4 className="text-lg font-semibold text-slate-900 mb-3">What time would you like us to start?</h4>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
                  {timeSlots.map((slot) => {
                    const [value, label] = slot.split("|")
                    const active = selectedTime === value
                    const unavailable = isSlotUnavailable(selectedDate, value)
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          if (unavailable) return
                          setSelectedTime(value)
                        }}
                        disabled={unavailable || !selectedDate}
                        className={`h-10 rounded-xl text-xs font-semibold transition-colors ${
                          unavailable || !selectedDate
                            ? "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                            : active
                              ? "bg-sky-200 text-sky-900 border border-sky-300"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <h4 className="text-lg font-semibold text-slate-900 mb-3">How many hours do you need the Housekeeper to stay?</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.from({ length: 10 }, (_, i) => i + 2).map((h) => {
                    const active = serviceHours === h
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setServiceHours(h)}
                        className={`h-10 w-10 rounded-xl text-xs font-bold border transition-colors ${
                          active ? "bg-sky-200 border-sky-300 text-sky-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>

                <h4 className="text-lg font-semibold text-slate-900 mb-3">How many Housekeepers do you need?</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = professionalsCount === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setProfessionalsCount(n)}
                        className={`h-10 w-10 rounded-xl text-xs font-bold border transition-colors ${
                          active ? "bg-sky-200 border-sky-300 text-sky-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleScheduleNext}
                  className="w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 inline-flex items-center justify-between px-4"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4" />
                </button>

                <p className="text-xs text-slate-500 mt-4">
                  Hourly rate is based on your selected main service: AED {hourlyRate} / hour. Add-ons are charged separately.
                </p>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Area / Address</label>
                  <input
                    value={propertyArea}
                    onChange={(e) => setPropertyArea(e.target.value)}
                    placeholder="Dubai Marina"
                    className="w-full h-11 rounded-xl border border-slate-300 px-3"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Specific cleaning instruction</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={4}
                    placeholder="Write here..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-2xl font-semibold text-slate-900">Related services</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Select services from the category you chose. You can add more services as add-ons.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {fallbackCategories.map((category) => {
                    const active = selectedCategoryId === category.id
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          active ? "bg-primary text-white" : "bg-white border border-slate-300 text-slate-700"
                        }`}
                      >
                        {category.name}
                      </button>
                    )
                  })}
                </div>

                {filteredServices.length === 0 ? (
                  <p className="text-slate-500">No active services in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredServices.map((service) => (
                      <article key={service.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                        <img
                          src={service.imageUrl || defaultServiceImage}
                          alt={service.name}
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <h3 className="text-xl font-semibold text-slate-900 mt-3">{service.name}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{service.description || "Professional service"}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xl font-bold text-slate-800">AED {service.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(service)}
                            className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-semibold inline-flex items-center gap-1 hover:bg-pink-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleScheduleNext}
                  className="h-11 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center gap-2 hover:bg-pink-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {summaryCard}
          </section>
        )}

        {showFrequencyModal && (
          <div
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Choose your frequency"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowFrequencyModal(false)
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">Choose Your Frequency</h4>
                <button
                  type="button"
                  onClick={() => setShowFrequencyModal(false)}
                  className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 mx-auto" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {[
                  { key: "once" as const, title: "One Time", desc: "One time service will not renew again.", badge: null },
                  { key: "weekly" as const, title: "Weekly", desc: "Service for the same day every week.", badge: "10%" },
                  { key: "biweekly" as const, title: "Every 2 Week", desc: "Service for every two weeks.", badge: "5%" },
                ].map((opt) => {
                  const active = serviceFrequency === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setServiceFrequency(opt.key)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                        active ? "border-sky-300 bg-sky-100/70" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${
                            active ? "border-sky-600 bg-sky-600" : "border-slate-300 bg-white"
                          }`}
                          aria-hidden="true"
                        >
                          <div className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-transparent"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">{opt.title}</p>
                            {opt.badge && (
                              <span className="text-xs font-bold text-rose-600">{opt.badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => setShowFrequencyModal(false)}
                  className="mt-4 w-full h-11 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 inline-flex items-center justify-between px-4"
                >
                  NEXT
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-3xl font-semibold text-slate-900 mb-4">Checkout</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full name</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-11 rounded-xl border border-slate-300 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 rounded-xl border border-slate-300 px-3"
                  />
                </div>
              </div>

              <div className="mb-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-700 font-semibold">Phone</p>
                <p className="text-lg text-slate-900 font-bold mt-1">{phoneInput}</p>
              </div>

              <h4 className="text-2xl font-semibold text-slate-900 mb-3">Payment Options</h4>
              <div className="space-y-3 mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentOption("manual")}
                  className={`w-full rounded-xl border p-4 text-left ${
                    paymentOption === "manual" ? "border-primary bg-pink-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900">Manual Payment + Upload Receipt</p>
                      <p className="text-xs text-slate-600">Upload payment proof and book service now.</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption("stripe")}
                  className={`w-full rounded-xl border p-4 text-left ${
                    paymentOption === "stripe" ? "border-primary bg-pink-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900">Pay with Stripe (Integrate Later)</p>
                      <p className="text-xs text-slate-600">Booking will be saved and payment can be connected in next phase.</p>
                    </div>
                  </div>
                </button>
              </div>

              {paymentOption === "manual" && (
                <div className="mb-5 rounded-xl border border-slate-200 p-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Receipt</label>
                  <label className="h-11 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload Receipt
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {receiptFile && <p className="text-xs text-emerald-700 mt-2">Selected: {receiptFile.name}</p>}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold inline-flex items-center gap-2 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitBooking}
                  className="h-11 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center gap-2 hover:bg-pink-700 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                  Book Service
                </button>
              </div>
            </div>

            {summaryCard}
          </section>
        )}
      </main>

      {showPhonePopup && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-semibold text-slate-900">Verify Phone Number</h4>
              <button type="button" onClick={() => setShowPhonePopup(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Please confirm your phone number to continue your Silver Maid Cleaning booking.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone number</label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-300 pl-9 pr-3"
                  placeholder="+971"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePhoneConfirm}
              className="mt-4 w-full h-11 rounded-xl bg-primary text-white font-semibold hover:bg-pink-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>2026 Silver Maid Cleaning. All rights reserved.</span>
          <span>Powered by Silver Maid Cleaning</span>
        </div>
      </footer>
    </div>
  )
}
