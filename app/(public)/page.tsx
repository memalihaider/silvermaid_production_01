"use client"

import { 
  CheckCircle2, ArrowRight, Star, Shield, Clock, Users, Award, Leaf, Sparkles, 
  ShieldCheck, Zap, ChevronLeft, ChevronRight, TreePine,
  Home, Building2, Wind, ShieldAlert, Utensils, Construction,
  Sofa, Layout, Waves, Dumbbell, Car, Calendar, BookOpen, ArrowUpRight
} from 'lucide-react'
import { motion, useTransform, useMotionValue, useSpring, useScroll } from 'framer-motion'
import { useRef, useEffect, useState, useMemo } from 'react'
import { INITIAL_BLOG_POSTS } from '@/lib/blog-data'
import { INITIAL_TESTIMONIALS } from '@/lib/testimonials-data'

// Reusable CTA Button Component
interface CTAButtonProps {
  text: string
  href: string
  variant?: "primary" | "secondary" | "dark" 
  icon?: React.ComponentType<{ className?: string }> | null
  className?: string
}

const CTAButton = ({ text, href, variant = "primary", icon: Icon = null, className = "" }: CTAButtonProps) => {
  const baseStyles = "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl duration-300"
  const variants = {
    primary: "bg-primary text-white hover:bg-pink-700 shadow-primary/40 hover:shadow-primary/60",
    secondary: "bg-white text-primary hover:bg-slate-50 shadow-slate-300/40",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/40",
  }
  
  return (
    <motion.a 
      href={href}
      className={`${baseStyles} ${variants[variant]} inline-flex items-center gap-3 ${className}`}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
      {Icon && <Icon className="h-5 w-5" />}
    </motion.a>
  )
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth mouse movement for parallax
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const [isClient, setIsClient] = useState(false)
  const [sliderIndex, setSliderIndex] = useState(0)
  const [blogSliderIndex, setBlogSliderIndex] = useState(0)
  const [testimonialSliderIndex, setTestimonialSliderIndex] = useState(0)
  const [airQuality, setAirQuality] = useState(72)
  const [airQualityStatus, setAirQualityStatus] = useState("Moderate")
  const [airQualityColor, setAirQualityColor] = useState("text-amber-500")
  const [loading, setLoading] = useState(true)
  const [textIndex, setTextIndex] = useState(0)

  const heroTexts = [
    "We Clean\nYou Relax",
    "Pure Air\nPure Health",
    "Certified\nExcellence",
    "Family\nSafe Always",
    "Sparkle &\nShine Daily",
    "Trust Our\nExpertise"
  ]

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

  // Blog posts data - using actual blog posts from database
  const blogs = INITIAL_BLOG_POSTS.slice(0, 6).map(post => ({
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    category: post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    date: new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    readTime: `${post.readTime} min read`,
    href: `/blog/${post.slug}`
  }))

  // Testimonials data from database
  const testimonials = INITIAL_TESTIMONIALS.slice(0, 8).map(testimonial => ({
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    image: testimonial.image,
    text: testimonial.text,
    rating: testimonial.rating
  }))

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50) return { status: "Good", color: "text-green-500" }
    if (aqi <= 100) return { status: "Moderate", color: "text-yellow-500" }
    if (aqi <= 150) return { status: "Unhealthy for Sensitive Groups", color: "text-orange-500" }
    if (aqi <= 200) return { status: "Unhealthy", color: "text-red-500" }
    if (aqi <= 300) return { status: "Very Unhealthy", color: "text-red-700" }
    return { status: "Hazardous", color: "text-red-900" }
  }

  useEffect(() => {
    setIsClient(true)
    let isMounted = true
    
    const fetchAirQualityData = async () => {
      if (!isMounted) return
      try {
        setLoading(true)
        const response = await fetch(
          'https://air-quality-api.open-meteo.com/v1/air_quality?latitude=25.2048&longitude=55.2708&current=us_aqi'
        )
        
        if (!isMounted) return
        
        const data = await response.json()
        
        if (!isMounted) return
        
        const aqi = Math.round(data.current?.us_aqi || 72)
        const { status, color } = getAirQualityStatus(aqi)
        
        setAirQuality(Math.min(aqi, 100))
        setAirQualityStatus(status)
        setAirQualityColor(color)
        setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error('Error fetching air quality:', error)
        setLoading(false)
      }
    }
    
    fetchAirQualityData()
    
    // Fetch real-time air quality every 10 minutes
    const airQualityInterval = setInterval(() => {
      if (isMounted) fetchAirQualityData()
    }, 10 * 60 * 1000)

    // Hero text rotation
    const textInterval = setInterval(() => {
      if (isMounted) {
        setTextIndex((prev) => (prev + 1) % heroTexts.length)
      }
    }, 4000)
    
    return () => {
      isMounted = false
      clearInterval(airQualityInterval)
      clearInterval(textInterval)
    }
  }, [])

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
    let isMounted = true
    const interval = setInterval(() => {
      if (isMounted) {
        setBlogSliderIndex((prev) => {
          const maxIndex = blogs.length - 3
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

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])
  
  // Parallax elements for hero
  const heroParallaxX = useTransform(springX, [0, 2000], [-30, 30])
  const heroParallaxY = useTransform(springY, [0, 1000], [-30, 30])
  const blobParallaxX = useTransform(springX, [0, 2000], [80, -80])
  const blobParallaxY = useTransform(springY, [0, 1000], [80, -80])

  return (
    <div ref={containerRef} className="flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.05),transparent_70%)]" />
        <motion.div 
          style={{ x: blobParallaxX, y: blobParallaxY }}
          className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          style={{ x: -blobParallaxX, y: -blobParallaxY }}
          className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-blue-100/20 rounded-full blur-[100px]" 
        />
      </div>

      {/* Hero Section - Reimagined Layout */}
      <section 
        className="relative pt-12 pb-24 px-4 md:px-8 min-h-[90vh] flex items-center overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Full Section Background - Multiple Animated Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-white via-slate-50/50 to-white" />
          
          {/* Animated Primary Layer */}
          <motion.div 
            className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-pink-100/5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Animated Secondary Layer */}
          <motion.div 
            className="absolute inset-0 bg-linear-to-bl from-transparent via-primary/3 to-transparent"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Shimmer Effect */}
          <motion.div 
            className="absolute -inset-full bg-linear-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Animated Particle System - Enhanced Visibility */}
        {isClient && (
          <div className="absolute inset-0 pointer-events-none z-10" suppressHydrationWarning>
            {[...Array(20)].map((_, i) => {
              const size = 3 + Math.random() * 8
              const delay = Math.random() * 5
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `${i % 2 === 0 ? 'rgb(236, 72, 153)' : 'rgb(236, 100, 180)'}`,
                    boxShadow: `0 0 ${size * 2}px rgba(236, 72, 153, 0.8)`,
                  }}
                  initial={{ 
                    x: Math.random() * 2000, 
                    y: Math.random() * 1200,
                    opacity: 0,
                    scale: 0.5
                  }}
                  animate={{ 
                    y: [null, -300],
                    opacity: [0, 1, 0.8, 0],
                    scale: [0.5, 1, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 6 + Math.random() * 6, 
                    repeat: Infinity, 
                    delay: delay,
                    ease: "easeInOut"
                  }}
                />
              )
            })}
          </div>
        )}

        <div className="container mx-auto relative z-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content: Text Mastery */}
            <div className="w-full lg:w-3/5 space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/50 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/5 mb-8">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Next-Gen Cleaning Solutions</span>
                </div>

                <div className="relative">
                  <motion.h1 
                    key={textIndex}
                    initial={{ opacity: 0, y: 40, skewY: 5 }}
                    animate={{ opacity: 1, y: 0, skewY: 0 }}
                    exit={{ opacity: 0, y: -40, skewY: -5 }}
                    className="text-6xl md:text-8xl font-black text-[#039ED9] leading-[0.9] tracking-tighter"
                  >
                    {heroTexts[textIndex].split('\n')[0]} <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 via-pink-500 to-rose-500">
                      {heroTexts[textIndex].split('\n')[1]}
                    </span>
                  </motion.h1>
                  
                  {/* Decorative line */}
                  <div className="absolute -left-8 top-0 bottom-0 w-1 bg-linear-to-b from-primary via-transparent to-transparent hidden md:block" />
                </div>

                <p className="mt-8 text-lg md:text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                  Experience the future of home wellness with our AI-optimized cleaning schedules and eco-friendly protocols.
                </p>

                <div className="flex flex-wrap gap-6 mt-12">
                  <CTAButton 
                    text="Get Started Now" 
                    href="/booking" 
                    variant="primary" 
                    icon={ArrowUpRight}
                    className="rounded-full! px-10! shadow-2xl shadow-primary/30"
                  />
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-lg shadow-black/5">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-lg">
                      20K+
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Content: The Interactive Stack */}
            <div className="w-full lg:w-2/5 relative">
              <div className="relative aspect-square max-w-125 mx-auto">
                
              {/* Main Floating Card */}
<motion.div 
  className="absolute inset-0 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl z-20 group"
  style={{ x: heroParallaxX, y: heroParallaxY }}
  whileHover={{ scale: 1.02 }}
>
  {/* ✅ WORKING CDN LINK - Ye video chalega */}
  <video 
    className="w-full h-full object-cover opacity-60"
    autoPlay
    loop
    muted
    playsInline
  >
    {/* <source src="https://videos.pexels.com/video-files/4109343/4109343-uhd_2732_1440_25fps.mp4" type="video/mp4" /> */}
    
    {/* Fallback agar video na chale */}
    <img 
      src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" 
      className="w-full h-full object-cover opacity-60"
      alt="Professional Cleaning Service"
    />
  </video>
  
  <motion.div 
    className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent"
    animate={{ opacity: [0.4, 0.6, 0.4] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  />
  
  <div className="absolute bottom-8 left-8 right-8">
    <div className="flex items-center gap-2 mb-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-primary text-primary" />)}
      </div>
      <span className="text-[10px] font-black text-white uppercase tracking-widest">Premium Rated Agency</span>
    </div>
  </div>
</motion.div>

                {/* Floating Widget: Air Quality */}
                <motion.div 
                  className="absolute -top-12 -right-12 w-48 h-48 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl z-30 border border-white/50"
                  style={{ x: useTransform(springX, [0, 2000], [40, -40]), y: useTransform(springY, [0, 1000], [40, -40]) }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <Wind className="h-6 w-6 text-primary" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-900 leading-none">{airQuality}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Air Quality Index</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Widget: Pro Badge */}
                <motion.div 
                  className="absolute -bottom-8 -left-12 bg-white rounded-3xl p-5 shadow-2xl z-30 border-t border-slate-100"
                  style={{ x: useTransform(springX, [0, 2000], [-30, 30]), y: useTransform(springY, [0, 1000], [-30, 30]) }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">Verified Pros</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Background Checked</div>
                    </div>
                  </div>
                </motion.div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[120px] z-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner - Unified Design */}
      <section className="relative z-30 -mt-10 px-4">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-3xl text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { label: "Satisfied Clients", value: "20,000+", icon: Users },
              { label: "Service Rating", value: "4.9/5.0", icon: Star },
              { label: "Expert Cleaners", value: "250+", icon: Award },
              { label: "City Coverage", value: "100%", icon: Building2 },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-black tracking-tighter">{stat.value}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Service Icons Grid - Elegant Cards */}
      <section className="py-20 px-4 overflow-hidden bg-linear-to-b from-white via-slate-50/30 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(236,72,153,0.05),transparent_50%)]" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.3em] mb-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Quick Services
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Everything You Need</h2>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">Comprehensive cleaning solutions delivered with precision and care</p>
          </div>
          
          <style>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .service-slider {
              display: flex;
              gap: 1.5rem;
              animation: scroll-left 60s linear infinite;
              will-change: transform;
            }
            .service-slider:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="relative flex overflow-x-hidden">
            <div className="service-slider">
              {[...services, ...services].map((service, i) => (
                <a 
                  key={i}
                  href={service.href}
                  className="flex flex-col items-center justify-center shrink-0 w-45 p-8 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group cursor-pointer"
                >
                  <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-5 shadow-sm">
                    {service.icon}
                  </div>
                  <span className="text-xs font-black text-center text-slate-800 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors duration-300 whitespace-normal">
                    {service.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

     
      {/* Vision Mission Values - Redesigned */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,72,153,0.03),transparent_70%)]" />
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.3em] mb-6"
            >
              <Shield className="h-3.5 w-3.5" />
              Our Foundation
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              Built on <span className="text-primary">Trust</span> & Excellence
            </h3>
            <p className="text-slate-600 text-lg font-medium leading-relaxed">
              Setting new standards in the cleaning industry with unwavering commitment to quality and transparency
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative p-12 bg-linear-to-br from-white to-slate-50/50 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -10 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="relative text-3xl font-black mb-4 text-slate-900 leading-tight">Our Vision</h3>
              <p className="relative text-slate-600 leading-relaxed font-medium">
                To be the first choice for employees, suppliers, and customers in the regions we serve with excellence
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative p-12 bg-linear-to-br from-slate-900 to-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-900/30 border border-slate-700 hover:shadow-3xl transition-all duration-500 flex flex-col text-white overflow-hidden"
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-pink-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-2xl shadow-primary/40">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="relative text-3xl font-black mb-4 leading-tight">Our Mission</h3>
              <p className="relative text-slate-300 leading-relaxed font-medium">
                Delivering reliable, flexible, and consistent hygiene solutions to all stakeholders with dedication
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative p-12 bg-linear-to-br from-white to-primary/5 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 flex flex-col overflow-hidden"
              whileHover={{ y: -10 }}
            >
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="relative text-3xl font-black mb-6 text-slate-900 leading-tight">Core Values</h3>
              <ul className="relative space-y-4">
                {[
                  "Professional Excellence",
                  "Unwavering Integrity",
                  "Customer-First Always",
                  "Quality Without Compromise"
                ].map((val, i) => (
                  <li key={i} className="flex items-start gap-3 font-bold text-slate-700 group/item hover:text-primary transition-colors">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 group-hover/item:scale-150 transition-transform" />
                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Slider */}
      <section className="py-24 bg-linear-to-b from-slate-50/50 to-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.04),transparent_60%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.3em] mb-6"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Our Services
              </motion.div>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-5">
                Exceptional Care for <br />
                <span className="text-primary">Every Space</span>
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Specialized teams equipped with cutting-edge technology delivering pristine results
              </p>
            </div>
            {/* Slider Navigation */}
            <div className="flex items-center gap-2">
              <motion.button 
                onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                disabled={sliderIndex === 0}
                className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button 
                onClick={() => setSliderIndex(Math.min(services.length - 4, sliderIndex + 1))}
                disabled={sliderIndex >= services.length - 4}
                className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Services Slider */}
          <div className="relative overflow-hidden group/slider">
            <motion.div 
              ref={sliderRef}
              className="flex gap-6"
              animate={{ x: -sliderIndex * 320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onMouseEnter={() => {
                // Pause auto-scroll on hover by temporarily disabling the interval
                const elem = sliderRef.current
                if (elem) elem.style.pointerEvents = 'auto'
              }}
            >
              {services.map((service, i) => (
                <motion.div
                  key={i} 
                  className="relative h-80 w-72 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100 animate-hanging shrink-0"
                  style={{ animationDelay: `${(i % 4) * 0.15}s` }}
                  whileHover={{ y: -12, transition: { duration: 0.4, ease: "easeOut" } }}
                >
                  <a 
                    href={service.href}
                    className="group relative block h-full w-full cursor-pointer"
                  >
                  {/* Image Background */}
                  <motion.div
                    className="absolute inset-0 z-0"
                  >
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </motion.div>
                  
                  <div className="absolute top-8 left-8 z-10">
                    <span className="px-4 py-1.5 rounded-full bg-primary/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                      {service.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 z-10">
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">{service.title}</h3>
                    <p className="text-slate-300 font-medium mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 text-xs">
                      {service.description}
                    </p>
                    <motion.div 
                      className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs"
                      whileHover={{ gap: "0.75rem" }}
                    >
                      Book This Service <ArrowRight className="h-4 w-4 text-primary" />
                    </motion.div>
                  </div>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Slider Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(services.length / 4) }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setSliderIndex(i * 4)}
                className={`h-2 rounded-full transition-all ${i * 4 === sliderIndex ? 'w-8 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Redesigned */}
      <section className="py-24 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_60%)]" />
        <motion.div 
          className="absolute bottom-0 left-0 w-150 h-150 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-black text-xs uppercase tracking-[0.3em] backdrop-blur-sm border border-primary/30"
                >
                  <Award className="h-3.5 w-3.5" />
                  The Difference
                </motion.div>
                <h3 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                  Why Choose <br />
                  <span className="text-primary">HomeWork UAE</span> Clean?
                </h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">Elevating hygiene standards with certified excellence and innovation</p>
              </div>

              <div className="space-y-10">
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
                  <motion.div 
                    key={i} 
                    className="flex gap-8 group"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-2xl">
                      <item.icon className="h-10 w-10" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black mb-3">{item.title}</h4>
                      <p className="text-slate-400 font-medium leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div 
                className="absolute -inset-20 bg-primary/20 blur-[120px] rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <div className="relative bg-slate-800/50 backdrop-blur-2xl rounded-[4rem] p-16 border border-white/10 shadow-3xl">
                <h4 className="text-3xl font-black mb-12 tracking-tight">Direct Support</h4>
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/40">800</div>
                    <div>
                      <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Toll Free Support</div>
                      <div className="text-3xl font-black tracking-tighter">800 4663 9675</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="grid gap-6">
                    {[
                      "Instant WhatsApp Booking",
                      "Same-Day Urgent Deep Clean",
                      "Key-Drop Service Available",
                      "Flexible Payment Plans Available"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="text-slate-200 font-bold uppercase text-xs tracking-widest">{text}</span>
                      </div>
                    ))}
                  </div>
                  <motion.a 
                    href="https://wa.me/80046639675"
                    className="w-full h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-100 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    Chat via WhatsApp
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Slider Redesigned */}
      <section className="py-24 bg-linear-to-b from-white to-slate-50/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,72,153,0.03),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.3em] mb-6"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Expert Insights
              </motion.div>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-5">
                Knowledge & <br />
                <span className="text-primary">Expert Tips</span>
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Stay informed with professional cleaning insights and maintenance guides from our specialists
              </p>
            </div>
            {/* Slider Navigation */}
            <div className="flex items-center gap-2">
              <motion.button 
                onClick={() => setBlogSliderIndex(Math.max(0, blogSliderIndex - 1))}
                disabled={blogSliderIndex === 0}
                className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button 
                onClick={() => setBlogSliderIndex(Math.min(blogs.length - 3, blogSliderIndex + 1))}
                disabled={blogSliderIndex >= blogs.length - 3}
                className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Blog Slider */}
          <div className="relative overflow-hidden group/blogslider">
            <motion.div 
              className="flex gap-6"
              animate={{ x: -blogSliderIndex * 400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {blogs.map((blog, i) => (
                <motion.article
                  key={i} 
                  className="relative h-125 w-100 rounded-4xl overflow-hidden shadow-xl shadow-slate-200/80 shrink-0 bg-white group border border-slate-200/50"
                  whileHover={{ y: -15, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", transition: { duration: 0.4, ease: "easeOut" } }}
                >
                  <a 
                    href={blog.href}
                    className="block h-full w-full cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-4 py-1.5 rounded-full bg-primary/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 flex flex-col h-[calc(100%-14rem)]">
                      {/* Date and Read Time */}
                      <div className="flex items-center gap-4 mb-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{blog.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{blog.readTime}</span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6 line-clamp-3 grow">
                        {blog.excerpt}
                      </p>
                      
                      {/* Read More Link */}
                      <motion.div 
                        className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs group-hover:gap-3 transition-all"
                      >
                        <BookOpen className="h-4 w-4" />
                        Read Article
                        <ArrowUpRight className="h-4 w-4" />
                      </motion.div>
                    </div>
                  </a>
                </motion.article>
              ))}
            </motion.div>
          </div>

          {/* Slider Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(blogs.length / 3) }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setBlogSliderIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === blogSliderIndex ? 'w-8 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <motion.a
              href="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-pink-700 transition-all shadow-xl shadow-primary/40 hover:shadow-primary/60"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-5 w-5" />
              View All Articles
              <ArrowRight className="h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Infinite Continuous Carousel Slider */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.04),transparent_60%)]" />
        <motion.div 
          className="absolute top-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.3em] mb-6"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              Live Testimonials
            </motion.div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">What Our Clients Say</h3>
            <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">Real-time feedback from thousands across the UAE</p>
          </div>

          {/* Infinite Continuous Testimonials Carousel */}
          <div className="relative overflow-hidden group/testimonialslider">
            <motion.div 
              className="flex gap-6"
              animate={{ x: [0, -testimonials.length * 420] }}
              transition={{
                duration: testimonials.length * 5,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
            >
              {/* Render testimonials twice for seamless infinite loop */}
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="relative h-80 w-96 rounded-4xl overflow-hidden shadow-xl shadow-slate-200/80 shrink-0 bg-linear-to-br from-white to-slate-50/30 border border-slate-200/60 p-10 flex flex-col group hover:shadow-2xl hover:shadow-primary/20 transition-shadow duration-300"
                  whileHover={{ y: -15, transition: { duration: 0.3, ease: "easeOut" } }}
                >
                  {/* Star Rating */}
                  <div className="flex text-primary mb-6 gap-1">
                    {[...Array(testimonial.rating)].map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-lg text-slate-700 font-medium mb-8 leading-relaxed grow">
                    "{testimonial.text}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-5 pt-6 border-t border-slate-200/60 mt-auto">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-200/60 shadow-md group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{testimonial.name}</h4>
                      <p className="text-primary font-bold text-xs uppercase tracking-wide">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Gradient Overlay for Smooth Edge Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white to-transparent pointer-events-none z-10" />
          </div>

          {/* Manual Navigation */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <motion.button
              onClick={() => setTestimonialSliderIndex((prev) => prev === 0 ? testimonials.length - 1 : prev - 1)}
              className="p-3 rounded-full bg-slate-100 text-slate-700 hover:bg-primary hover:text-white transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <p className="text-slate-600 font-black text-sm uppercase tracking-wide">
              Continuous Real-Time Feed
            </p>

            <motion.button
              onClick={() => setTestimonialSliderIndex((prev) => prev === testimonials.length - 1 ? 0 : prev + 1)}
              className="p-3 rounded-full bg-primary text-white hover:bg-pink-700 transition-all shadow-lg shadow-primary/40"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-primary via-primary to-pink-700 rounded-[3rem] p-16 md:p-20 relative overflow-hidden shadow-2xl border border-primary/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)] opacity-60" />
            <motion.div 
              className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-5">
                  Experience the <br />
                  <span className="text-white/90">Gold Standard</span>
                </h2>
                <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
                  Join 20,000+ satisfied clients across the UAE. Transform your space into a pristine, healthy environment.
                </p>
              </motion.div>
              <div className="flex flex-wrap justify-center gap-6">
                <motion.a 
                  href="/book-service" 
                  className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:bg-pink-700 transition-all inline-flex items-center gap-3 hover:shadow-primary/60"
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Booking Now
                  <ArrowRight className="h-5 w-5" />
                </motion.a>
                <motion.a 
                  href="/quote" 
                  className="bg-white text-primary px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-50 transition-all inline-flex items-center gap-3"
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Check Availability
                  <ChevronRight className="h-5 w-5" />
                </motion.a>
              </div>
            </div>
            
            {/* Decorative circles - Optimized */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.7s' }} />
          </motion.div>
        </div>
      </section>

      {/* Strategic CTA Section - Before Footer Redesigned */}
      <section className="relative py-16 px-4 bg-linear-to-r from-slate-50 via-white to-slate-50 border-y border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.04),transparent_60%)]" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Ready to Transform Your Space?</h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed">Join thousands of satisfied customers enjoying pristine, healthy environments across the UAE</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <motion.a
                href="/book-service"
                className="px-10 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-wider text-sm hover:bg-pink-700 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 inline-flex items-center justify-center gap-3 whitespace-nowrap border-2 border-primary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="h-5 w-5" />
                Schedule Now
              </motion.a>
              <motion.a
                href="/quote"
                className="px-10 py-4 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-wider text-sm hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 whitespace-nowrap border-2 border-slate-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="h-5 w-5" />
                Get Free Quote
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
    
