'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Zap, Clock, ArrowRight, Sparkles, Home, Bed, Bath, Soup, PlusCircle, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'

// Firebase service type
type FirebaseService = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  cost: number;
  minStock: number;
  stock: number;
  unit: string;
  sku: string;
  categoryId: string;
}

// Dummy services data
const DUMMY_SERVICES = [
  { name: "Regular Residential cleaning", slug: "residential-cleaning", category: "normal" },
  { name: "Regular Office cleaning", slug: "office-cleaning", category: "normal" },
  { name: "Floor deep cleaning", slug: "floor-deep-cleaning", category: "deep" },
  { name: "Window cleaning", slug: "window-cleaning", category: "normal" },
  { name: "Balcony Deep Cleaning", slug: "balcony-deep-cleaning", category: "deep" },
  { name: "Sofa Deep Cleaning", slug: "sofa-deep-cleaning", category: "deep" },
  { name: "Carpets Deep Cleaning", slug: "carpets-deep-cleaning", category: "deep" },
  { name: "Mattress Deep Cleaning", slug: "mattress-deep-cleaning", category: "deep" },
  { name: "Grout Deep Clean", slug: "grout-deep-cleaning", category: "deep" },
  { name: "Garage Deep Clean", slug: "garage-deep-cleaning", category: "deep" },
  { name: "Kitchen Deep Clean", slug: "kitchen-deep-cleaning", category: "deep" },
  { name: "Post Construction", slug: "post-construction-cleaning", category: "deep" },
  { name: "Apartment Deep", slug: "apartment-deep-cleaning", category: "deep" },
  { name: "Move In/Out", slug: "move-in-out-cleaning", category: "deep" },
  { name: "Villa Deep Clean", slug: "villa-deep-cleaning", category: "deep" },
  { name: "AC Duct Cleaning", slug: "ac-duct-cleaning", category: "technical" },
  { name: "AC Coil Cleaning", slug: "ac-coil-cleaning", category: "technical" },
  { name: "Kitchen Hood Clean", slug: "kitchen-hood-cleaning", category: "technical" },
  { name: "Grease Trap Clean", slug: "grease-trap-cleaning", category: "technical" },
  { name: "Restaurant Clean", slug: "restaurant-cleaning", category: "technical" },
  { name: "Water Tank Clean", slug: "water-tank-cleaning", category: "technical" },
  { name: "Swimming Pool", slug: "swimming-pool-cleaning", category: "technical" },
  { name: "Gym Deep Clean", slug: "gym-deep-cleaning", category: "technical" },
  { name: "Facade Cleaning", slug: "facade-cleaning", category: "technical" }
]

// Function to generate slug from service name (EXACTLY SAME AS SERVICES PAGE)
const generateSlug = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Default service content
const DEFAULT_SERVICE_CONTENT = {
  heroImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1600",
  title: "Professional Cleaning Service",
  description: "UAE's Trusted Cleaning – Experience Pristine Spaces with Experts",
  startingPrice: "AED 35/hr",
  categories: [
    {
      title: "Service Features",
      icon: Home,
      items: [
        { name: "Thorough Cleaning", desc: "Comprehensive cleaning of all areas and surfaces." },
        { name: "Professional Team", desc: "Trained and experienced cleaning professionals." },
        { name: "Quality Assurance", desc: "High-quality results guaranteed with attention to detail." },
        { name: "Customer Satisfaction", desc: "Focus on delivering exceptional service experience." }
      ]
    },
    {
      title: "What We Clean",
      icon: Bed,
      items: [
        { name: "All Surfaces", desc: "Dusting and wiping all furniture, shelves, and décor." },
        { name: "Floors", desc: "Vacuuming carpets and mopping hard floors." },
        { name: "Fixtures", desc: "Cleaning light fixtures, vents, and appliances." },
        { name: "Special Areas", desc: "Focus on high-traffic and detailed areas." }
      ]
    },
    {
      title: "Our Approach",
      icon: Bath,
      items: [
        { name: "Eco-Friendly Products", desc: "Using safe and environmentally friendly cleaning solutions." },
        { name: "Systematic Process", desc: "Organized and efficient cleaning methodology." },
        { name: "Attention to Detail", desc: "Focus on every corner and hidden area." },
        { name: "Customized Plans", desc: "Tailored services to meet specific needs." }
      ]
    }
  ],
  whyChooseUs: [
    { 
      title: "Expertise", 
      desc: "Our team is highly trained and experienced, ensuring top-quality results.", 
      icon: ShieldCheck 
    },
    { 
      title: "Eco-Friendly", 
      desc: "We use environmentally friendly products for a safe and healthy environment.", 
      icon: Zap 
    },
    { 
      title: "Attention to Detail", 
      desc: "We focus on every nook and cranny, ensuring spotless results.", 
      icon: Sparkles 
    },
    { 
      title: "Reliable Service", 
      desc: "Vetted, insured team committed to professionalism and integrity.", 
      icon: CheckCircle2 
    }
  ]
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [serviceData, setServiceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFirebaseService, setIsFirebaseService] = useState(false)
  const [relatedServices, setRelatedServices] = useState<any[]>([])

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true)
        console.log('Fetching service for slug:', slug)
        
        // Step 1: Fetch all services from Firebase
        const servicesRef = collection(db, 'services')
        const querySnapshot = await getDocs(servicesRef)
        const allFirebaseServices: FirebaseService[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          allFirebaseServices.push({
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            imageUrl: data.imageUrl || DEFAULT_SERVICE_CONTENT.heroImage,
            categoryName: data.categoryName || 'Normal Cleaning',
            status: data.status || 'ACTIVE',
            type: data.type || 'SERVICE',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            cost: data.cost || 0,
            minStock: data.minStock || 0,
            stock: data.stock || 0,
            unit: data.unit || '',
            sku: data.sku || '',
            categoryId: data.categoryId || ''
          } as FirebaseService)
        })
        
        console.log('Total Firebase services found:', allFirebaseServices.length)
        
        // Step 2: Debug - Print all Firebase service slugs
        console.log('Firebase service names and slugs:')
        allFirebaseServices.forEach(service => {
          const serviceSlug = generateSlug(service.name)
          console.log(`- Name: "${service.name}" -> Slug: "${serviceSlug}"`)
        })
        
        // Step 3: Try to find service in Firebase first
        let foundService: any = null
        let serviceIsFromFirebase = false
        
        for (const firebaseService of allFirebaseServices) {
          const firebaseSlug = generateSlug(firebaseService.name)
          console.log(`Comparing: "${firebaseSlug}" with "${slug}"`)
          
          if (firebaseSlug === slug) {
            console.log('✅ Found in Firebase:', firebaseService.name)
            foundService = {
              heroImage: firebaseService.imageUrl || DEFAULT_SERVICE_CONTENT.heroImage,
              title: firebaseService.name,
              description: firebaseService.description || DEFAULT_SERVICE_CONTENT.description,
              startingPrice: `AED ${firebaseService.price || 35}`,
              isFirebaseService: true,
              rawData: firebaseService,
              category: firebaseService.categoryName?.toLowerCase().includes('deep') ? 'deep' : 
                       firebaseService.categoryName?.toLowerCase().includes('technical') ? 'technical' : 'normal'
            }
            serviceIsFromFirebase = true
            break
          }
        }
        
        // Step 4: If not found in Firebase, check dummy services
        if (!foundService) {
          console.log('❌ Not found in Firebase, checking dummy services...')
          const dummyService = DUMMY_SERVICES.find(s => s.slug === slug)
          
          if (dummyService) {
            console.log('✅ Found in dummy services:', dummyService.name)
            foundService = {
              heroImage: DEFAULT_SERVICE_CONTENT.heroImage,
              title: dummyService.name,
              description: DEFAULT_SERVICE_CONTENT.description,
              startingPrice: DEFAULT_SERVICE_CONTENT.startingPrice,
              isFirebaseService: false,
              rawData: null,
              category: dummyService.category
            }
            serviceIsFromFirebase = false
          }
        }
        
        // Step 5: If still not found, show 404
        if (!foundService) {
          console.log('❌ Service not found anywhere')
          notFound()
        }
        
        // Step 6: Set service data
        setServiceData(foundService)
        setIsFirebaseService(serviceIsFromFirebase)
        
        // Step 7: Prepare related services
        const related: any[] = []
        
        // Add Firebase services first
        allFirebaseServices.forEach(service => {
          const serviceSlug = generateSlug(service.name)
          if (serviceSlug !== slug) {
            related.push({
              name: service.name,
              slug: serviceSlug,
              isFirebase: true,
              price: `AED ${service.price || 35}`
            })
          }
        })
        
        // Add dummy services
        DUMMY_SERVICES.forEach(service => {
          if (service.slug !== slug) {
            related.push({
              name: service.name,
              slug: service.slug,
              isFirebase: false,
              price: 'AED 35/hr'
            })
          }
        })
        
        // Shuffle and take 8
        const shuffled = [...related].sort(() => Math.random() - 0.5)
        setRelatedServices(shuffled.slice(0, 8))
        
        console.log('✅ Service loaded successfully:', foundService.title)

      } catch (error) {
        console.error('❌ Error fetching service data:', error)
        // Try dummy service as fallback
        const dummyService = DUMMY_SERVICES.find(s => s.slug === slug)
        if (dummyService) {
          setServiceData({
            heroImage: DEFAULT_SERVICE_CONTENT.heroImage,
            title: dummyService.name,
            description: DEFAULT_SERVICE_CONTENT.description,
            startingPrice: DEFAULT_SERVICE_CONTENT.startingPrice,
            isFirebaseService: false,
            category: dummyService.category
          })
          setIsFirebaseService(false)
        } else {
          notFound()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchServiceData()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Loading Service Details</h2>
            <p className="text-slate-500 font-medium">Please wait while we fetch the service information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!serviceData) {
    notFound()
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={serviceData.heroImage} 
            alt={serviceData.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_SERVICE_CONTENT.heroImage
            }}
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
              {serviceData.category?.toUpperCase() || 'PROFESSIONAL'} CLEANING
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
              <span className="block">
                {serviceData.title.split(' ').slice(0, 2).join(' ').toUpperCase()}
              </span>
              <span className="text-primary italic block">
                {serviceData.title.split(' ').slice(2).join(' ').toUpperCase() || 'CLEANING'}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              {serviceData.description}
            </p>
            
            {isFirebaseService && serviceData.rawData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl"
              >
                <span className="text-sm font-black text-white">Service Price:</span>
                <span className="text-2xl font-black text-primary">AED {serviceData.rawData.price}</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8 md:gap-16">
            <div className="lg:col-span-8 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8 md:space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                    Welcome to <span className="text-primary">Silver Maid Cleaning Services LLC</span>
                  </h2>
                  
                  {isFirebaseService && serviceData.rawData ? (
                    // Firebase Service Details
                    <div className="space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        {serviceData.rawData.description || serviceData.description}
                      </p>
                      
                      <div className="p-6 md:p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 md:mb-6">Service Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase">Category</p>
                            <p className="text-base md:text-lg font-black text-slate-900 mt-1">
                              {serviceData.rawData.categoryName || 'General'}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
                            <p className="text-base md:text-lg font-black text-green-600 mt-1">
                              {serviceData.rawData.status || 'ACTIVE'}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase">Type</p>
                            <p className="text-base md:text-lg font-black text-slate-900 mt-1">
                              {serviceData.rawData.type || 'SERVICE'}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase">SKU</p>
                            <p className="text-base md:text-lg font-black text-slate-900 mt-1">
                              {serviceData.rawData.sku || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Additional info */}
                        {serviceData.rawData.unit && (
                          <div className="mt-6 p-4 bg-white/50 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 font-medium">Unit:</span>
                              <span className="text-sm font-black text-slate-900">{serviceData.rawData.unit}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Dummy Service Details
                    <div className="space-y-6">
                      <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                        Keeping your space clean and tidy is essential for a comfortable and healthy environment. 
                        At Silver Maid Cleaning Services LLC, we offer reliable and comprehensive {serviceData.title.toLowerCase()} 
                        services tailored to your specific needs. Our experienced team uses advanced cleaning techniques 
                        and eco-friendly products to ensure your space stays spotless and inviting.
                      </p>
                      
                      <div className="p-6 md:p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                        <p className="text-slate-700 font-bold italic text-base md:text-lg">
                          "If you're looking for professional {serviceData.title.toLowerCase()} services, 
                          here's what you can expect from our comprehensive service checklist. 
                          We adjust our approach based on your specific requirements."
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Features */}
                <div className="space-y-8 md:space-y-12">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 md:gap-4">
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    {isFirebaseService ? 'SERVICE FEATURES' : 'OUR SERVICE INCLUDES:'}
                  </h3>

                  <div className="grid gap-6 md:gap-8">
                    {DEFAULT_SERVICE_CONTENT.categories.map((cat, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg md:shadow-xl shadow-slate-200/50"
                      >
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                          <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <cat.icon className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {cat.title}
                          </h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                          {cat.items.map((item, i) => (
                            <div key={i} className="flex gap-3 md:gap-4 group">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary mt-1 group-hover:bg-primary group-hover:text-white transition-all">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                              <div>
                                <h5 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-1">
                                  {item.name}
                                </h5>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-8 lg:p-10 text-white shadow-2xl md:shadow-3xl sticky top-24"
              >
                <h4 className="text-xl md:text-2xl font-black mb-6 md:mb-8 tracking-tight italic">
                  Other Services
                </h4>
                <div className="space-y-3 md:space-y-4">
                  {relatedServices.slice(0, 6).map((service, i) => (
                    <Link 
                      key={i} 
                      href={`/services/${service.slug}`}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all ${
                        service.slug === slug 
                        ? 'bg-primary border-primary text-white font-black' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs uppercase tracking-widest truncate">
                          {service.name}
                        </span>
                        {service.isFirebase && (
                          <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                            LIVE
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                    </Link>
                  ))}
                </div>

                <div className="mt-8 md:mt-12 p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <p className="text-sm font-bold text-slate-400 mb-3 md:mb-4 uppercase tracking-widest">
                    Starting From
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter mb-6 md:mb-8 italic">
                    {serviceData.startingPrice}
                  </p>
                  <button className="w-full bg-white text-slate-900 py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all">
                    Book Online
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections... */}
      {/* Video Section */}
      <section className="py-16 md:py-24 bg-slate-900 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">See Us In Action</h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-6">
              SERVICE DEMO VIDEO
            </h3>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl md:shadow-3xl bg-slate-800 border border-white/10 group"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-primary flex items-center justify-center text-white mb-4 md:mb-6 shadow-xl md:shadow-2xl shadow-primary/40 mx-auto">
                  <Play className="h-8 w-8 md:h-10 md:w-10 fill-current ml-1" />
                </div>
                <p className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">
                  Video Preview Coming Soon
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -mr-20" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/5 blur-[120px] rounded-full -ml-20" />
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The Advantage</h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">
              WHY CHOOSE US?
            </h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto text-base md:text-lg">
              Our commitment to excellence makes us the preferred choice for clients across the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {DEFAULT_SERVICE_CONTENT.whyChooseUs.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 lg:p-10 bg-white rounded-3xl md:rounded-4xl border border-slate-100 shadow-lg md:shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-4 md:mb-6 shadow-inner shadow-slate-200">
                  <value.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h4 className="text-lg md:text-xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight uppercase">
                  {value.title}
                </h4>
                <p className="text-slate-500 text-sm md:text-sm font-medium leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-20 p-8 md:p-12 bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] text-center relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h4 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 md:mb-8 tracking-tighter">
                Ready For <span className="text-primary italic">Professional Service?</span>
              </h4>
              <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 font-bold">
                Contact us today for a professional {serviceData.title.toLowerCase()} experience you can trust.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <a 
                  href="tel:80046639675" 
                  className="bg-primary text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all flex items-center gap-3"
                >
                  800 4663 9675
                </a>
                <a 
                  href="mailto:info@silvermaid.ae" 
                  className="bg-white/10 text-white border border-white/20 px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3"
                >
                  Email Us
                </a>
              </div>
            </div>
            <Sparkles className="absolute -bottom-8 -right-8 h-32 w-32 md:h-64 md:w-64 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}