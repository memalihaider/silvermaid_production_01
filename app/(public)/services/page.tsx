'use client'

import { useState, useMemo, useEffect } from 'react'
import { ContactPhone, ContactEmail } from '@/components/ContactDisplay'
import { useContactInfo } from '@/contexts/ContactContext'
import { motion } from 'framer-motion'
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Home, 
  Briefcase, 
  Maximize, 
  Sun, 
  Sofa, 
  Layers, 
  Bed, 
  Wind, 
  Grid3X3, 
  Warehouse, 
  CookingPot, 
  HardHat, 
  Building, 
  Truck, 
  Brush,
  Fan,
  Pipette,
  Utensils,
  Waves,
  Dumbbell,
  PanelTop,
  ThermometerSnowflake,
  Zap
} from 'lucide-react'
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

// Original dummy services (EXACTLY AS BEFORE) - UPDATED href
const DUMMY_SERVICE_CATEGORIES = [
  {
    id: "normal",
    label: "Normal Cleaning",
    icon: Sparkles,
    services: [
      { name: "Regular Residential", slug: "residential-cleaning", icon: Home, desc: "Standard home cleaning for maintaining a fresh living space." },
      { name: "Regular Office", slug: "office-cleaning", icon: Briefcase, desc: "Professional workspace cleaning for productive environments." },
      { name: "Window cleaning", slug: "window-cleaning", icon: Maximize, desc: "Streak-free exterior and interior window restoration." },
      { name: "Balcony Cleaning", slug: "balcony-deep-cleaning", icon: Sun, desc: "Removing dust and sand from your outdoor relaxation areas." },
      { name: "Sofa Cleaning", slug: "sofa-deep-cleaning", icon: Sofa, desc: "Professional fabric and leather upholstery sanitization." },
      { name: "Carpets Cleaning", slug: "carpets-deep-cleaning", icon: Layers, desc: "Deep extraction cleaning for all types of carpet fibers." },
      { name: "Mattress Cleaning", slug: "mattress-deep-cleaning", icon: Bed, desc: "Removing allergens and dust mites for a healthier sleep." }
    ]
  },
  {
    id: "deep",
    label: "Deep Cleaning",
    icon: Zap,
    services: [
      { name: "Grout Deep Clean", slug: "grout-deep-cleaning", icon: Grid3X3, desc: "Specialized floor tile and grout line restoration." },
      { name: "Garage Deep Clean", slug: "garage-deep-cleaning", icon: Warehouse, desc: "Heavy-duty cleaning for garage floors and storage areas." },
      { name: "Kitchen Deep Clean", slug: "kitchen-deep-cleaning", icon: CookingPot, desc: "Sanitizing all surfaces, appliances, and grease-prone areas." },
      { name: "Post Construction", slug: "post-construction-cleaning", icon: HardHat, desc: "Removing dust and debris after renovation or building." },
      { name: "Office Deep Clean", slug: "office-deep-cleaning", icon: Briefcase, desc: "Comprehensive sanitization for high-traffic office spaces." },
      { name: "Apartment Deep", slug: "apartment-deep-cleaning", icon: Building, desc: "Thorough top-to-bottom sanitize for modern apartments." },
      { name: "Move In/Out", slug: "move-in-out-cleaning", icon: Truck, desc: "Preparing your new home or cleaning up after you leave." },
      { name: "Villa Deep Clean", slug: "villa-deep-cleaning", icon: Home, desc: "Premium full-villa restoration and intensive hygiene." },
      { name: "Mattress Deep", slug: "mattress-deep-cleaning", icon: Bed, desc: "Total sanitization and allergen removal for mattresses." },
      { name: "Carpets Deep", slug: "carpets-deep-cleaning", icon: Layers, desc: "Industrial-grade carpet extraction and stain treatment." },
      { name: "Sofa Deep Clean", slug: "sofa-deep-cleaning", icon: Sofa, desc: "Deep fiber cleaning and steam sanitization for sofas." },
      { name: "Balcony Deep", slug: "balcony-deep-cleaning", icon: Sun, desc: "Aggressive removal of sand and pollutants from balconies." },
      { name: "Window deep clean", slug: "window-cleaning", icon: Maximize, desc: "High-clarity glass restoration for neglected windows." },
      { name: "Floor Deep Clean", slug: "floor-deep-cleaning", icon: Brush, desc: "Polishing and deep scrubbing for all hard floor types." }
    ]
  },
  {
    id: "technical",
    label: "Technical Services",
    icon: Wind,
    services: [
      { name: "AC Duct Cleaning", slug: "ac-duct-cleaning", icon: Wind, desc: "Improving indoor air quality by removing duct contaminants." },
      { name: "AC Coil Cleaning", slug: "ac-coil-cleaning", icon: ThermometerSnowflake, desc: "Deep cleaning coils for better energy efficiency and cooling." },
      { name: "Kitchen Hood Clean", slug: "kitchen-hood-cleaning", icon: Fan, desc: "Commercial-grade degreasing for restaurant and home hoods." },
      { name: "Grease Trap Clean", slug: "grease-trap-cleaning", icon: Pipette, desc: "Maintenance of grease interceptors for hygiene compliance." },
      { name: "Restaurant Clean", slug: "restaurant-cleaning", icon: Utensils, desc: "Sector-specific hygiene for hospitality food prep areas." },
      { name: "Water Tank Clean", slug: "water-tank-cleaning", icon: Waves, desc: "DM-approved sanitization of residential water storage." },
      { name: "Swimming Pool", slug: "swimming-pool-cleaning", icon: Waves, desc: "Aquatic maintenance and chemical balance for safe swimming." },
      { name: "Gym Deep Clean", slug: "gym-deep-cleaning", icon: Dumbbell, desc: "High-touch equipment sanitization for fitness facilities." },
      { name: "Facade Cleaning", slug: "facade-cleaning", icon: PanelTop, desc: "Safe high-rise and exterior building restoration." }
    ]
  }
]

// Category mapping for icons
const getIconForService = (serviceName: string) => {
  const iconMap: { [key: string]: any } = {
    'regular': Home,
    'residential': Home,
    'office': Briefcase,
    'window': Maximize,
    'balcony': Sun,
    'sofa': Sofa,
    'carpet': Layers,
    'mattress': Bed,
    'grout': Grid3X3,
    'garage': Warehouse,
    'kitchen': CookingPot,
    'construction': HardHat,
    'apartment': Building,
    'move': Truck,
    'villa': Home,
    'floor': Brush,
    'duct': Wind,
    'coil': ThermometerSnowflake,
    'hood': Fan,
    'grease': Pipette,
    'restaurant': Utensils,
    'water': Waves,
    'pool': Waves,
    'gym': Dumbbell,
    'facade': PanelTop,
    'ac': Wind
  }

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (serviceName.toLowerCase().includes(keyword)) {
      return icon
    }
  }
  
  return Home // Default icon
}


export default function ServicesPage() {
  const { contact } = useContactInfo()
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [firebaseServices, setFirebaseServices] = useState<FirebaseService[]>([])
  const [serviceCategories, setServiceCategories] = useState(DUMMY_SERVICE_CATEGORIES)

  // Fetch services from Firebase
  useEffect(() => {
    const fetchFirebaseServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'))
        const services: FirebaseService[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          const service: FirebaseService = {
            id: doc.id,
            name: data.name || 'Service',
            description: data.description || 'Professional cleaning service',
            price: data.price || 0,
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1600',
            categoryName: data.categoryName || 'Normal Cleaning',
            status: data.status || 'ACTIVE',
            type: data.type || 'SERVICE',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            cost: data.cost || 0,
            minStock: data.minStock || 0,
            stock: data.stock || 0,
            unit: data.unit || 'Unit',
            sku: data.sku || '',
            categoryId: data.categoryId || ''
          }
          services.push(service)
        })
        
        setFirebaseServices(services)

        // Convert Firebase services to match our format
        const firebaseFormattedServices = services.map(service => {
          // Determine category based on categoryName or name
          let categoryId = 'normal'
          if (service.categoryName?.toLowerCase().includes('deep') || 
              service.name?.toLowerCase().includes('deep')) {
            categoryId = 'deep'
          } else if (service.categoryName?.toLowerCase().includes('technical') ||
                    service.name?.toLowerCase().includes('ac') ||
                    service.name?.toLowerCase().includes('duct') ||
                    service.name?.toLowerCase().includes('coil') ||
                    service.name?.toLowerCase().includes('hood') ||
                    service.name?.toLowerCase().includes('grease') ||
                    service.name?.toLowerCase().includes('restaurant') ||
                    service.name?.toLowerCase().includes('water') ||
                    service.name?.toLowerCase().includes('pool') ||
                    service.name?.toLowerCase().includes('gym') ||
                    service.name?.toLowerCase().includes('facade')) {
            categoryId = 'technical'
          }

          const icon = getIconForService(service.name)
          
          // Generate slug from service name - SAME FORMAT AS DUMMY SERVICES
          const slug = service.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
          
          return {
            id: service.id,
            name: service.name,
            slug: slug,
            icon: icon,
            desc: service.description,
            price: `AED ${service.price}`,
            image: service.imageUrl,
            categoryId: categoryId,
            isFirebaseService: true // Flag to identify Firebase services
          }
        })

        // Create a copy of dummy categories
        const updatedCategories = DUMMY_SERVICE_CATEGORIES.map(category => ({
          ...category,
          services: [...category.services.map(service => ({
            ...service,
            slug: service.slug // Already just the slug
          }))]
        }))

        // Add Firebase services to appropriate categories
        firebaseFormattedServices.forEach(firebaseService => {
          const categoryIndex = updatedCategories.findIndex(cat => cat.id === firebaseService.categoryId)
          if (categoryIndex !== -1) {
            // Add Firebase service at the beginning of the category
            updatedCategories[categoryIndex].services.unshift(firebaseService)
          } else {
            // If category not found, add to normal category
            updatedCategories[0].services.unshift(firebaseService)
          }
        })

        // Update state with combined services
        setServiceCategories(updatedCategories)

      } catch (error) {
        console.error('Error fetching services:', error)
        // If Firebase fails, just show dummy services
        setServiceCategories(DUMMY_SERVICE_CATEGORIES)
      }
    }

    fetchFirebaseServices()
  }, [])

  const filteredCategories = useMemo(() => {
    let categories = [...serviceCategories]

    if (activeCategory !== "all") {
      categories = categories.filter(cat => cat.id === activeCategory)
    }

    if (searchQuery.trim()) {
      return categories.map(cat => ({
        ...cat,
        services: cat.services.filter(s => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.services.length > 0)
    }

    return categories.filter(cat => cat.services.length > 0)
  }, [activeCategory, searchQuery, serviceCategories])

  return (
    <div className="flex flex-col overflow-hidden bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1600" 
            alt="Silver Maid Services" 
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
              Our Expertise
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              PROFESSIONAL <br />
              <span className="text-primary italic text-5xl md:text-8xl lowercase underline decoration-white/10 decoration-8 underline-offset-10">hygiene solutions</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-tight italic">
              UAE's most comprehensive cleaning and technical service catalog.
            </p>
            
            {/* Firebase services indicator */}
            {firebaseServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-md rounded-full"
              >
               
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
              {["all", "normal", "deep", "technical"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${
                    activeCategory === cat 
                    ? 'bg-white text-primary shadow-lg shadow-slate-200' 
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {cat === "all" ? "All Services" : cat.toUpperCase() + " CLEANING"}
                </button>
              ))}
            </div>

            <div className="relative group w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-slate-900 text-sm shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {filteredCategories.length > 0 ? (
            <div className="space-y-32">
              {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                      <category.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{category.label}</h2>
                      <p className="text-slate-400 font-bold italic">High-performance hygiene for every sector.</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {category.services.length} services available
                        </span>
                        {category.services.some((s: any) => s.isFirebaseService) && (
                          <></>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {category.services.map((service: any, idx: number) => (
                      <motion.div
                        key={service.id || service.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col h-full active:scale-95"
                      >
                        {/* Firebase Service Badge */}
                        {service.isFirebaseService && (
                          <div className="absolute top-4 right-4 z-20">
                           
                          </div>
                        )}

                        <div className="relative z-10 space-y-6 flex-1">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:rotate-12">
                            {service.icon && <service.icon className="h-6 w-6" />}
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                              {service.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                              {service.desc}
                            </p>
                            
                            {/* Price for Firebase services */}
                            {service.price && service.isFirebaseService && (
                              <div className="pt-2">
                                <span className="text-sm font-black text-primary">
                                  {service.price}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-4 flex items-center justify-between">
                            <div className="flex gap-1.5">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-1 w-4 rounded-full bg-slate-100 group-hover:bg-primary/20 transition-all" />
                              ))}
                            </div>
                            <Link 
                              href={`/services/${service.slug}`}
                              className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all"
                            >
                              View Service
                            </Link>
                          </div>
                        </div>
                        <Link 
                          href={`/services/${service.slug}`}
                          className="absolute inset-0 z-0"
                          aria-label={`View ${service.name} details`}
                        />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
                        <ArrowRight className="absolute bottom-8 right-8 h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center space-y-8">
              <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                <Search className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">No results found</h3>
                <p className="text-slate-500 font-bold italic">Try searching for another service or category.</p>
              </div>
              <button 
                onClick={() => {setSearchQuery(""); setActiveCategory("all")}}
                className="text-primary font-black uppercase tracking-widest text-xs underline underline-offset-8"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase whitespace-pre-line">
              CAN'T FIND WHAT{"\n"}
              <span className="text-primary italic lowercase">you're looking for?</span>
            </h2>
            <p className="text-slate-400 text-xl font-bold italic max-w-2xl mx-auto">
              We offer bespoke hygiene audits and customized maintenance plans for unique requirements across the UAE.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/book-service" className="px-12 py-6 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/40 hover:bg-pink-600 transition-all active:scale-95">
                Request Custom Quote
              </Link>
              <Link href="/contact" className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md">
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/10 blur-[150px] rounded-full" />
        </div>
      </section>
    </div>
  )
}