"use client"

import { 
  CheckCircle2, ArrowRight, Star, Shield, Clock, Users, Award, Sparkles, 
  ShieldCheck, Zap, ChevronLeft, ChevronRight,
  Home, Building2, Wind, ShieldAlert, Utensils, Construction,
  Sofa, Layout, Waves, Dumbbell, Calendar, BookOpen, ArrowUpRight, HelpCircle
} from 'lucide-react'
import { motion, useScroll, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'

function blogPostSlug(title: string, docId: string) {
  return title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${docId}`
}

type HomeBlogCard = {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  date: string
  readTime: string
  href: string
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Light scroll-reveal animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const } })
  }
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } }
  }

  const [isClient, setIsClient] = useState(false)
  const [sliderIndex, setSliderIndex] = useState(0)
  const [blogSliderIndex, setBlogSliderIndex] = useState(0)
  const [blogs, setBlogs] = useState<HomeBlogCard[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [airQuality, setAirQuality] = useState(72)
  const [airQualityStatus, setAirQualityStatus] = useState("Moderate")
  const [airQualityColor, setAirQualityColor] = useState("text-amber-500")
  const [loading, setLoading] = useState(true)

  // Services data with Icons
  const services = [
    { title: "Residential Cleaning", href: "/services/residential-cleaning", icon: <Home className="h-7 w-7" />, description: "Regular hourly cleaning for homes", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800", tag: "Regular" },
    { title: "Villa Deep Cleaning", href: "/services/villa-deep-cleaning", icon: <Building2 className="h-7 w-7" />, description: "Complete interior and exterior sanitization", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "AC Duct Cleaning", href: "/services/ac-duct-cleaning", icon: <Wind className="h-7 w-7" />, description: "Professional air duct sterilization", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800", tag: "Technical" },
    { title: "Office Deep Cleaning", href: "/services/office-deep-cleaning", icon: <ShieldAlert className="h-7 w-7" />, description: "Corporate space sanitization", image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Kitchen Deep Cleaning", href: "/services/kitchen-deep-cleaning", icon: <Utensils className="h-7 w-7" />, description: "Heavy-duty degreasing and hood cleaning", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Apartment Deep Cleaning", href: "/services/apartment-deep-cleaning", icon: <Building2 className="h-7 w-7" />, description: "Move-in or move-out cleaning", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Post Construction Cleaning", href: "/services/post-construction-cleaning", icon: <Construction className="h-7 w-7" />, description: "Remove dust and construction residue", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800", tag: "Specialist" },
    { title: "Sofa Deep Cleaning", href: "/services/sofa-deep-cleaning", icon: <Sofa className="h-7 w-7" />, description: "Professional upholstery cleaning", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", tag: "Specialist" },
    { title: "Window Cleaning", href: "/services/window-cleaning", icon: <Layout className="h-7 w-7" />, description: "Interior and exterior window service", image: "https://images.unsplash.com/photo-1584775524340-3fb88cd59b13?auto=format&fit=crop&q=80&w=800", tag: "Regular" },
    { title: "Carpet Deep Cleaning", href: "/services/carpets-deep-cleaning", icon: <Sparkles className="h-7 w-7" />, description: "Professional carpet and rug cleaning", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Water Tank Cleaning", href: "/services/water-tank-cleaning", icon: <Waves className="h-7 w-7" />, description: "Safe water tank sanitization", image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800", tag: "Technical" },
    { title: "Gym Deep Cleaning", href: "/services/gym-deep-cleaning", icon: <Dumbbell className="h-7 w-7" />, description: "Equipment and facility sanitization", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", tag: "Deep" }
  ]

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50) return { status: "Good", color: "text-green-500" }
    if (aqi <= 100) return { status: "Moderate", color: "text-yellow-500" }
    if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", color: "text-orange-500" }
    if (aqi <= 200) return { status: "Unhealthy", color: "text-red-500" }
    if (aqi <= 300) return { status: "Very Unhealthy", color: "text-red-700" }
    return { status: "Hazardous", color: "text-red-900" }
  }

  useEffect(() => {
    const q = query(collection(db, 'blog-post'), orderBy('createdAt', 'desc'), limit(6))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: HomeBlogCard[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>
          const title = String(data.title ?? '')
          const slug = blogPostSlug(title, docSnap.id)
          const description = String(data.description ?? '')
          const excerptFromDesc =
            description.length > 0 ? `${description.slice(0, 100)}${description.length > 100 ? '...' : ''}` : ''
          const excerptRaw = typeof data.excerpt === 'string' ? data.excerpt.trim() : ''
          const excerpt = excerptRaw || excerptFromDesc || 'No description available'
          const image = String(data.imageURL ?? data.image ?? '') || '/api/placeholder/600/400'
          const fromCategory = typeof data.category === 'string' ? data.category.trim() : ''
          const fromTags =
            Array.isArray(data.tags) && typeof data.tags[0] === 'string' ? data.tags[0].trim() : ''
          const categoryRaw = fromCategory || fromTags || 'general'
          const category = categoryRaw.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
          const publishedAtIso =
            data.createdAt && typeof (data.createdAt as { toDate?: () => Date }).toDate === 'function'
              ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
              : new Date().toISOString()
          const readMinutes = Number(data.readTime ?? 5) || 5

          return {
            id: docSnap.id,
            title,
            excerpt,
            image,
            category,
            date: new Date(publishedAtIso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            readTime: `${readMinutes} min read`,
            href: `/${slug}`,
          }
        })

        setBlogs(next)
        setBlogSliderIndex(0)
        setBlogsLoading(false)
      },
      (error) => {
        console.error('Home blog slider: failed to subscribe to blog posts:', error)
        setBlogs([])
        setBlogsLoading(false)
      },
    )

    return () => unsub()
  }, [])

useEffect(() => {
  setIsClient(true)
  let isMounted = true
  let retryCount = 0
  const maxRetries = 2
  
  const fetchAirQualityData = async () => {
    if (!isMounted) return
    
    try {
      setLoading(true)
      
      // API call with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      let response: Response

      try {
        response = await fetch(
          'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=25.2048&longitude=55.2708&current=us_aqi',
          {
            signal: controller.signal,
            cache: 'no-store',
            next: { revalidate: 0 }
          }
        )
      } finally {
        clearTimeout(timeoutId)
      }
      
      if (!isMounted) return

      if (!response.ok) {
        throw new Error(`Air quality API failed with status ${response.status}`)
      }
      
     
      
      const data = await response.json()
      
      if (!isMounted) return
      
      // Check if data exists and has the expected structure
      if (data?.current?.us_aqi) {
        const aqi = Math.round(data.current.us_aqi)
        const { status, color } = getAirQualityStatus(aqi)
        
        setAirQuality(Math.min(aqi, 100))
        setAirQualityStatus(status)
        setAirQualityColor(color)
      } else {
        // Use fallback data if API response is invalid
        useFallbackData()
      }
      
    } catch (error) {
      const isAbortOrTimeout =
        error instanceof DOMException && error.name === 'AbortError'

      if (!isAbortOrTimeout) {
        console.error('Air quality fetch error:', error)
      }
      
      if (!isMounted) return

      if (isAbortOrTimeout) {
        useFallbackData()
        return
      }
      
      // Retry logic
      if (retryCount < maxRetries) {
        retryCount++
        setTimeout(() => {
          if (isMounted) fetchAirQualityData()
        }, 1000 * retryCount)
      } else {
        // Use fallback data after max retries
        useFallbackData()
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }
  
  // Fallback function - ye hamesha kaam karega chahe API fail ho
  const useFallbackData = () => {
    console.log('Using fallback air quality data')
    setAirQuality(72)
    setAirQualityStatus("Moderate")
    setAirQualityColor("text-amber-500")
  }
  
  // Call the function
  fetchAirQualityData()
  
  // Refresh every 10 minutes
  const airQualityInterval = setInterval(() => {
    if (isMounted) {
      retryCount = 0 // Reset retry count
      fetchAirQualityData()
    }
  }, 10 * 60 * 1000)
  
  return () => {
    isMounted = false
    clearInterval(airQualityInterval)
  }
}, []) // Empty dependency array - sirf ek baar run hoga

  // Auto-scroll services slider to the left (slow speed)
  useEffect(() => {
    let isMounted = true
    const interval = setInterval(() => {
      if (isMounted) {
        setSliderIndex((prev) => {
          const maxIndex = services.length - 4
          return prev >= maxIndex ? 0 : prev + 1
        })
      }
    }, 4000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [services.length])

  // Auto-scroll blog slider to the right (slow speed)
  useEffect(() => {
    if (blogs.length < 3) return

    let isMounted = true
    const maxIndex = Math.max(0, blogs.length - 3)
    const interval = setInterval(() => {
      if (isMounted) {
        setBlogSliderIndex((prev) => {
          return prev <= 0 ? maxIndex : prev - 1
        })
      }
    }, 4500)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [blogs.length])

  // Only use scroll animations on client side
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const blogSlidesMaxIndex = Math.max(0, blogs.length - 3)
  const canSlideBlogs = !blogsLoading && blogs.length > 3

  return (
    <div ref={containerRef} className="flex flex-col overflow-hidden selection:bg-primary selection:text-white">

      {/* Hero Section - Landing */}
      <section className="relative py-10 px-4 md:px-8 bg-white overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-stretch min-h-130 relative">

            {/* Left: Large Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative rounded-3xl overflow-hidden min-h-105 lg:min-h-130 shadow-2xl"
            >
              {/* Background image */}
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=85&w=1400"
                alt="Premium cleaning service home"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-linear-to-b from-slate-900/30 via-slate-900/20 to-slate-900/75" />

              {/* Premium badge */}
              <div className="absolute top-6 left-6 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25">
                  <Sparkles className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Same-day slots available</span>
                </div>
              </div>

              {/* Main headline */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight mb-4">
                  Fast, reliable cleaning in Dubai
                </h1>
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mb-6">
                  Book move-in/move-out, sofa, or mattress cleaning in minutes. Transparent pricing, flexible slots, and a team you can trust.
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">Same-day slots</Badge>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">Trained staff</Badge>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">Secure payments</Badge>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-1 mb-6">
                  {[
                    { value: "18K+", label: "Customers" },
                    { value: "4.9/5", label: "Rating" },
                    { value: "7K+", label: "Reviews" },
                    { value: "12+", label: "Years" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 min-w-17.5"
                    >
                      {i === 0 && <Users className="h-4 w-4 text-white/70 mb-1" />}
                      {i === 1 && <Star className="h-4 w-4 text-white/70 mb-1" />}
                      {i === 2 && <BookOpen className="h-4 w-4 text-white/70 mb-1" />}
                      {i === 3 && <Calendar className="h-4 w-4 text-white/70 mb-1" />}
                      <span className="text-base font-black text-white leading-tight">{stat.value}</span>
                      <span className="text-[9px] font-semibold text-white/60 uppercase tracking-wider">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="rounded-full font-bold">
                    <a href="/book-service" className="inline-flex items-center gap-2">
                      Book now <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="rounded-full font-bold">
                    <a href="/quote" className="inline-flex items-center gap-2">
                      Get a quick quote <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right: Stacked Cards */}
            <div className="flex flex-col gap-5">

              {/* Air Quality Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Air quality now</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dubai, UAE · Real-time</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-400 mt-1" />
                </div>

                {/* Gauge */}
                <div className="flex items-center gap-5 my-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="7" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke={airQualityStatus === "Good" ? "#22c55e" : airQualityStatus === "Moderate" ? "#f59e0b" : "#ef4444"}
                        strokeWidth="7"
                        strokeDasharray={`${(airQuality / 100) * 201} 201`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-slate-900">{airQuality}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-base font-black ${airQualityColor}`}>{airQualityStatus}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Updated just now</p>
                  </div>
                </div>
              </motion.div>

              {/* Cleaning Service Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                className="relative rounded-3xl overflow-hidden flex-1 min-h-50 shadow-lg group"
              >
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"
                  alt="Deep cleaning service"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

                {/* Service tag */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    Deep Clean
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <p className="text-lg font-black text-white leading-tight">Villa Deep Cleaning</p>
                  <p className="text-[11px] text-white/60 mt-1 mb-3">Full interior sanitization & sterilization</p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-primary text-primary" />)}
                    </div>
                    <span className="text-[10px] font-semibold text-white/70">4.9 · 2,400+ cleanings</span>
                  </div>
                </div>

                {/* Arrow button */}
                <div className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="relative z-30 -mt-8 px-4">
        <Card className="max-w-5xl mx-auto rounded-2xl shadow-xl border-slate-200/70">
          <CardContent className="p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-7">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Trusted across Dubai</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-2">
                  Consistent quality. Clear pricing. Fast booking.
                </h2>
              </div>
              <div className="text-slate-500 text-sm">
                Need help now? Use WhatsApp from the floating button.
              </div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Customers served", value: "500+", icon: Users },
                { label: "Average rating", value: "4.5/5.0", icon: Star },
                { label: "Trained cleaners", value: "10+", icon: Award },
                { label: "Dubai coverage", value: "100%", icon: Building2 },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <stat.icon className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proof</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-3">{stat.value}</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Services */}
      <section className="py-14 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-[11px] uppercase tracking-wider mb-3">
                <Sparkles className="h-3 w-3" />
                Popular right now
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Book in minutes. Get a cleaner home today.
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Value-focused cleaning for apartments, villas, and offices across Dubai.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full font-bold">
              <a href="/services" className="inline-flex items-center gap-2">
                Browse all services <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Move-in / Move-out Cleaning",
                desc: "A reset clean for handover day—kitchen, bathrooms, floors, and details.",
                href: "/services/move-in-out-cleaning",
                price: "From AED 249",
                icon: <Building2 className="h-5 w-5" />,
              },
              {
                title: "Sofa Deep Cleaning",
                desc: "Lift stains, odors, and dust—safe for kids and pets. Faster drying options.",
                href: "/services/sofa-deep-cleaning",
                price: "From AED 149",
                icon: <Sofa className="h-5 w-5" />,
              },
              {
                title: "Mattress Cleaning",
                desc: "Deep extraction for sweat, dust mites, and allergens—sleep cleaner tonight.",
                href: "/services/mattress-deep-cleaning",
                price: "From AED 129",
                icon: <ShieldCheck className="h-5 w-5" />,
              },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {item.price}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{item.desc}</p>
                  <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full font-bold">
                      <a href="/book-service" className="inline-flex items-center gap-2">
                        Book now <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full font-bold text-primary">
                      <a href={item.href} className="inline-flex items-center gap-2">
                        View details <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-slate-50/60 border-y border-slate-100">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-[11px] uppercase tracking-wider mb-3">
              <Zap className="h-3 w-3" />
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Simple booking, professional results
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              No back-and-forth. Choose a service, pick a time, and we handle the rest.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[
              { title: "Choose your service", desc: "Move-out, sofa, mattress, or a full deep clean.", icon: Sparkles },
              { title: "Pick a time slot", desc: "Select a time that fits your schedule—even urgent.", icon: Calendar },
              { title: "Confirm in minutes", desc: "Clear pricing and quick details. Pay securely.", icon: ShieldCheck },
              { title: "Enjoy the clean", desc: "We arrive on time and leave your space refreshed.", icon: CheckCircle2 },
            ].map((step, i) => (
              <Card key={step.title} className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-400">0{i + 1}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1.5">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Slider Section */}
      <section className="py-20 bg-slate-50/50 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-[11px] uppercase tracking-wider mb-4">
                <Sparkles className="h-3 w-3" />
                Our Services
              </span>
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                Exceptional Care for <span className="text-primary">Every Space</span>
              </h3>
              <p className="text-slate-500 text-base leading-relaxed">
                Specialized teams equipped with cutting-edge technology delivering pristine results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                disabled={sliderIndex === 0}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setSliderIndex(Math.min(services.length - 4, sliderIndex + 1))}
                disabled={sliderIndex >= services.length - 4}
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-pink-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Services Slider */}
          <div className="relative overflow-hidden">
            <motion.div 
              ref={sliderRef}
              className="flex gap-5"
              animate={{ x: -sliderIndex * 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {services.map((service, i) => (
                <div key={i} className="relative h-72 w-68 rounded-2xl overflow-hidden shadow-md shrink-0 group">
                  <a href={service.href} className="block h-full w-full">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/30 to-transparent" />
                    
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full bg-primary/90 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {service.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 z-10">
                      <h3 className="text-lg font-bold text-white mb-1">{service.title}</h3>
                      <p className="text-slate-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-3">
                        {service.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-semibold">
                        Book Service <ArrowRight className="h-3 w-3 text-primary" />
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Slider Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {Array.from({ length: Math.ceil(services.length / 4) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSliderIndex(i * 4)}
                className={`h-1.5 rounded-full transition-all ${i * 4 === sliderIndex ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary font-semibold text-[11px] uppercase tracking-wider border border-primary/20">
                  <Award className="h-3 w-3" />
                  The Difference
                </span>
                <h3 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
                  Why Choose <span className="text-primary">Silver Maid</span>?
                </h3>
                <p className="text-slate-400 text-base leading-relaxed">Elevating hygiene standards with certified excellence and innovation</p>
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                className="space-y-8"
              >
                {[
                  {
                    title: "Advanced Bio-Protocols",
                    desc: "We use laboratory-tested solutions that are 99.9% effective against pathogens while remaining family safe.",
                    icon: ShieldCheck
                  },
                  {
                    title: "Dubai Municipality Approved",
                    desc: "Full compliance with the highest government standards for commercial and residential hygiene.",
                    icon: Award
                  },
                  {
                    title: "Zero-Latency Booking",
                    desc: "Our real-time scheduling engine allows you to confirm your expert cleaner in under 60 seconds.",
                    icon: Zap
                  }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className="flex gap-5 group">
                    <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1.5">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              className="relative"
            >
              <div className="bg-slate-800/60 rounded-2xl p-10 border border-white/5">
                <h4 className="text-2xl font-black mb-8 tracking-tight">Direct Support</h4>
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center font-bold text-lg">+971</div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Toll Free Support</div>
                      <div className="text-2xl font-black tracking-tight">+971588844151</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="grid gap-4">
                    {[
                      "Instant WhatsApp Booking",
                      "Same-Day Urgent Deep Clean",
                      "Key-Drop Service Available",
                      "Flexible Payment Plans Available"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-slate-300 text-sm font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                  <a 
                    href="https://wa.me/971588844151"
                    className="block w-full h-12 bg-white text-slate-900 rounded-xl text-center leading-12 font-bold text-sm hover:bg-slate-100 transition-colors"
                  >
                    Chat via WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-[11px] uppercase tracking-wider mb-4">
                <BookOpen className="h-3 w-3" />
                Expert Insights
              </span>
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                Cleaning tips that save you time (and money)
              </h3>
              <p className="text-slate-500 text-base leading-relaxed">
                Quick guides for homes and offices in Dubai—stains, hygiene, and maintenance made simple.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setBlogSliderIndex(Math.max(0, blogSliderIndex - 1))}
                disabled={!canSlideBlogs || blogSliderIndex === 0}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setBlogSliderIndex(Math.min(blogSlidesMaxIndex, blogSliderIndex + 1))}
                disabled={!canSlideBlogs || blogSliderIndex >= blogSlidesMaxIndex}
                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-pink-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Blog Slider */}
          {blogsLoading ? (
            <div className="relative overflow-hidden">
              <div className="flex gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="relative w-90 rounded-2xl overflow-hidden shrink-0 border-slate-200">
                    <div className="h-48 bg-slate-200 animate-pulse" />
                    <CardContent className="p-6 space-y-3">
                      <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
                      <div className="h-5 w-full bg-slate-200 rounded animate-pulse" />
                      <div className="h-5 w-5/6 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                      <div className="h-4 w-11/12 bg-slate-100 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <p className="text-slate-600 font-medium mb-2">No blog posts yet</p>
              <p className="text-slate-500 text-sm mb-6">Check back soon—or open the blog to see what we publish next.</p>
              <Button asChild className="rounded-full font-bold">
                <a href="/blog" className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Go to blog
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden">
                <motion.div 
                  className="flex gap-5"
                  animate={{ x: -blogSliderIndex * 380 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {blogs.map((blog) => (
                    <Card key={blog.id} className="relative w-90 rounded-2xl overflow-hidden shrink-0 group hover:shadow-lg transition-shadow duration-300">
                      <a href={blog.href} className="block cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary text-white hover:bg-primary">{blog.category}</Badge>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{blog.date}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blog.readTime}</span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                            {blog.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-primary text-[11px] font-bold">
                            Read article <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </CardContent>
                      </a>
                    </Card>
                  ))}
                </motion.div>
              </div>

              {blogs.length > 3 && (
                <div className="flex items-center justify-center gap-1.5 mt-6">
                  {Array.from({ length: Math.ceil(blogs.length / 3) }).map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setBlogSliderIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === blogSliderIndex ? 'w-6 bg-primary' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="text-center mt-10">
            <Button asChild className="rounded-full font-bold">
              <a href="/blog" className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                View all articles
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary font-semibold text-[11px] uppercase tracking-wider mb-4">
              <HelpCircle className="h-3 w-3" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Quick answers before you book
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              Clear info on pricing, timing, supplies, and drying time.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                q: "Do you bring cleaning supplies and equipment?",
                a: "Yes. Our team arrives with the required tools and supplies. If you have preferences (eco-friendly, fragrance-free), tell us during booking.",
              },
              {
                q: "How long does move-in / move-out cleaning take?",
                a: "It depends on the size and condition of the space. Most apartments take a few hours. We’ll confirm an estimated duration when you book.",
              },
              {
                q: "How long does sofa or mattress take to dry?",
                a: "Drying time varies by fabric and ventilation. Typically a few hours. We’ll advise the best way to speed up drying after the service.",
              },
              {
                q: "Can I reschedule or cancel?",
                a: "Yes. If your plans change, message us as early as possible so we can adjust your slot or offer alternatives.",
              },
              {
                q: "Do you clean offices as well?",
                a: "Yes. We cover offices and commercial spaces, including deep cleaning, sanitization, and scheduled maintenance options.",
              },
              {
                q: "What areas do you cover in Dubai?",
                a: "We cover most areas across Dubai. If you’re unsure, request a quote and we’ll confirm availability for your location.",
              },
              {
                q: "How is pricing calculated?",
                a: "Pricing depends on service type, size, and condition. For exact pricing, use the quick quote and we’ll confirm before we start.",
              },
              {
                q: "Is your team trained and vetted?",
                a: "Yes. Our team is trained for residential and commercial cleaning standards, with a focus on safety and quality checks.",
              },
            ].map((item) => (
              <Card key={item.q} className="rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full font-bold">
              <a href="/book-service" className="inline-flex items-center gap-2">
                Book now <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full font-bold">
              <a href="/quote" className="inline-flex items-center gap-2">
                Get a quick quote <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-linear-to-br from-primary to-pink-700 rounded-2xl p-12 md:p-16 relative overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
            
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                  Experience the Gold Standard
                </h2>
                <p className="text-lg text-white/85 max-w-xl mx-auto leading-relaxed">
                  Join 500+ satisfied clients across the UAE. Transform your space into a pristine, healthy environment.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full font-bold bg-white text-primary hover:bg-slate-50">
                  <a href="/book-service" className="inline-flex items-center gap-2">
                    Start booking now <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full font-bold bg-white/15 text-white border border-white/25 hover:bg-white/25"
                >
                  <a href="/quote" className="inline-flex items-center gap-2">
                    Check availability <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
    
