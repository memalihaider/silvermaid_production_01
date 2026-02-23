"use client"

import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  Headset,
  Share2,
  Navigation,
  Music2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'

interface FirebaseService {
  id: string
  name: string
  categoryName: string
}

interface FormData {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

export default function Contact() {
  const [activeTab, setActiveTab] = useState('form')
  const [profileData, setProfileData] = useState({
    email: 'info@silvermaid.ae',
    phone: '80046639675',
    whatsapp: '+971 50 717 7059'
  })
  const [services, setServices] = useState<FirebaseService[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch profile data from Firebase
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const docRef = doc(db, 'profile-setting', 'admin-settings')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.profile) {
            setProfileData({
              email: data.profile.email || 'info@silvermaid.ae',
              phone: data.profile.phone || '80046639675',
              whatsapp: data.profile.whatsapp || '+971 50 717 7059'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [])

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
            categoryName: data.categoryName || 'General'
          })
        })
        
        setServices(servicesData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchServices()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveInquiryToFirebase = async (inquiryData: any) => {
    try {
      const inquiryWithMeta = {
        ...inquiryData,
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "process-inquiry"), inquiryWithMeta)

      return {
        success: true,
        inquiryId: docRef.id,
      }
    } catch (error: any) {
      console.error("Firebase Error:", error)
      return {
        success: false,
        error: error.message || "Failed to save inquiry",
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare inquiry data for Firebase
      const inquiryData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message,
        source: 'contact-page'
      }

      // Save to Firebase
      const result = await saveInquiryToFirebase(inquiryData)

      if (result.success) {
        alert('Inquiry submitted successfully! We will contact you soon.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        throw new Error(result.error || 'Failed to submit inquiry')
      }
    } catch (error) {
      console.error('Inquiry error:', error)
      alert('Error submitting inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group services by category
  const groupServicesByCategory = () => {
    const grouped: { [key: string]: FirebaseService[] } = {}
    
    services.forEach((service) => {
      const category = service.categoryName || 'General'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(service)
    })
    
    return grouped
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=1600" 
            alt="Contact Us" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/20 to-slate-950" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Connect With Us
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              HAVE <br />
              <span className="text-primary italic">QUESTIONS?</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight italic">
              Have questions about our cleaning services in UAE? Don't forget to check out our FAQs before you contact us.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -ml-48 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 md:p-12 bg-slate-900 rounded-[3rem] text-white shadow-3xl"
              >
                <div className="inline-flex items-center gap-3 text-primary mb-8">
                  <Headset className="h-6 w-6" />
                  <span className="text-sm font-black uppercase tracking-widest">Support Center</span>
                </div>
                <h3 className="text-3xl font-black mb-10 tracking-tight flex flex-col">
                  <span>LIVE IN CLEANER AND</span>
                  <span className="text-primary italic">HAPPIER SPACES</span>
                </h3>
                <p className="text-slate-400 font-bold mb-10 italic">Talk or Write to us to Discuss your Cleaning Needs</p>
                
                <div className="space-y-10">
                  <a href={`tel:${profileData.phone}`} className="flex gap-6 group cursor-pointer border-b border-white/5 pb-8">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                      <Phone className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toll Free Line</div>
                      <div className="text-xl font-black group-hover:text-primary transition-colors tracking-tighter">{profileData.phone}</div>
                      <div className="text-slate-400 font-medium text-sm italic">Available 24/7 Support</div>
                    </div>
                  </a>

                  <a href={`mailto:${profileData.email}`} className="flex gap-6 group cursor-pointer border-b border-white/5 pb-8">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                      <Mail className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Inquiry</div>
                      <div className="text-xl font-black group-hover:text-primary transition-colors truncate max-w-[200px] md:max-w-none">{profileData.email}</div>
                      <div className="text-slate-400 font-medium text-sm italic">Response within 2 hours</div>
                    </div>
                  </a>

                  <div className="flex gap-6 group cursor-pointer">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Our Location</div>
                      <div className="text-xl font-black tracking-tight leading-snug">Al Quoz – Dubai</div>
                      <div className="text-slate-400 font-medium text-sm italic underline decoration-primary/30">United Arab Emirates</div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col gap-6">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Follow Our Work</div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: Facebook, name: 'Facebook-f', link: '#' },
                      { icon: Instagram, name: 'Instagram', link: '#' },
                      { icon: Linkedin, name: 'Linkedin', link: '#' },
                      { icon: Music2, name: 'Tiktok', link: '#' }
                    ].map((social, i) => (
                      <a key={i} href={social.link} title={social.name} className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg">
                        <social.icon className="h-6 w-6" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-[3rem] text-white overflow-hidden relative group shadow-2xl shadow-green-500/20"
              >
                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-4 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6" />
                    WhatsApp Chat
                  </h4>
                  <p className="text-green-50/80 mb-6 font-bold italic">Instantly book your cleaning service via WhatsApp.</p>
                  <a href={`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                    {profileData.whatsapp} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <MessageSquare className="absolute -bottom-10 -right-10 h-48 w-48 text-white/10 group-hover:scale-110 transition-transform duration-500" />
              </motion.div>
            </div>

            <div className="lg:col-span-12 xl:col-span-7">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 md:p-16 bg-white rounded-[3.5rem] border border-slate-100 shadow-3xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                  <div className="h-20 w-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center animate-pulse">
                     <Send className="h-8 w-8 text-primary/20" />
                  </div>
                </div>

                <div className="max-w-2xl relative z-10">
                  <span className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4 block underline decoration-primary/20 underline-offset-8">Booking Online</span>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 tracking-tighter uppercase whitespace-pre-line">
                    TELL US ABOUT YOUR{"\n"}
                    <span className="text-primary italic lowercase">cleaning needs</span>
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your Name"
                          required
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          required
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+971 5X XXX XXXX"
                          required
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-bold text-slate-900 shadow-inner"
                        />
                      </div>
                      <div className="space-y-3 relative group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Required *</label>
                        <select 
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          required
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-black text-slate-900 appearance-none shadow-inner cursor-pointer"
                        >
                          <option value="">Select a Service</option>
                          {Object.entries(groupServicesByCategory()).map(([category, categoryServices]) => (
                            <optgroup key={category} label={category}>
                              {categoryServices.map(service => (
                                <option key={service.id} value={service.id}>
                                  {service.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ArrowRight className="absolute right-6 bottom-6 h-5 w-5 rotate-90 text-primary pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Tell us about the space, size, and any special requirements..."
                        className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-4xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-bold text-slate-900 resize-none shadow-inner"
                      ></textarea>
                    </div>

                    <motion.button 
                      type="submit"
                      disabled={isSubmitting}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-slate-900 text-white rounded-4xl py-6 font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          Processing... <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </>
                      ) : (
                        <>
                          Process Inquiry <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative h-[600px] w-full bg-slate-200">
        <div className="absolute inset-0 z-0">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14441.977286395568!2d55.22879505!3d25.13840735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6a57065963a7%3A0x8670868f02930491!2sAl%20Quoz%20-%20Dubai!5e0!3m2!1sen!2sae!4v1716300000000!5m2!1sen!2sae" 
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        
        <div className="container mx-auto px-4 h-full relative pointer-events-none">
          <div className="absolute bottom-12 left-4 md:left-12 pointer-events-auto">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="bg-white p-8 rounded-3xl shadow-3xl border border-slate-100 max-w-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                   <Navigation className="h-6 w-6" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase text-sm tracking-widest">Office HQ</h4>
                   <p className="text-xs text-slate-400 font-bold italic">Dubai Industrial Zone</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed italic border-l-2 border-primary pl-4">
                Al Quoz – Dubai – United Arab Emirates
              </p>
              <a 
                href="https://maps.google.com/?q=Al+Quoz+Dubai" 
                target="_blank" 
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                rel="noreferrer"
              >
                Get Location <ArrowRight className="h-3 w-3" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}