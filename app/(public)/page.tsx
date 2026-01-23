"use client"

import { CheckCircle2, ArrowRight, Star, Shield, Clock, Users, Award, Leaf, Sparkles, ShieldCheck, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useTransform, useMotionValue, useSpring, useScroll } from 'framer-motion'
import { useRef, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const CustomCursor = dynamic(() => import('@/components/CustomCursor').then(mod => ({ default: mod.default })), { ssr: false })

export default function Home() {
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

  // Services data
  const services = [
    { title: "Residential Cleaning", href: "/services/residential-cleaning", description: "Regular hourly cleaning for homes", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800", tag: "Regular" },
    { title: "Villa Deep Cleaning", href: "/services/villa-deep-cleaning", description: "Complete interior and exterior sanitization", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "AC Duct Cleaning", href: "/services/ac-duct-cleaning", description: "Professional air duct sterilization", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800", tag: "Technical" },
    { title: "Office Deep Cleaning", href: "/services/office-deep-cleaning", description: "Corporate space sanitization", image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Kitchen Deep Cleaning", href: "/services/kitchen-deep-cleaning", description: "Heavy-duty degreasing and hood cleaning", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Apartment Deep Cleaning", href: "/services/apartment-deep-cleaning", description: "Move-in or move-out cleaning", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Post Construction Cleaning", href: "/services/post-construction-cleaning", description: "Remove dust and construction residue", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800", tag: "Specialist" },
    { title: "Sofa Deep Cleaning", href: "/services/sofa-deep-cleaning", description: "Professional upholstery cleaning", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", tag: "Specialist" },
    { title: "Window Cleaning", href: "/services/window-cleaning", description: "Interior and exterior window service", image: "https://images.unsplash.com/photo-1584775524340-3fb88cd59b13?auto=format&fit=crop&q=80&w=800", tag: "Regular" },
    { title: "Carpet Deep Cleaning", href: "/services/carpets-deep-cleaning", description: "Professional carpet and rug cleaning", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", tag: "Deep" },
    { title: "Water Tank Cleaning", href: "/services/water-tank-cleaning", description: "Safe water tank sanitization", image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800", tag: "Technical" },
    { title: "Gym Deep Cleaning", href: "/services/gym-deep-cleaning", description: "Equipment and facility sanitization", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", tag: "Deep" }
  ]

  useEffect(() => {
    setIsClient(true)
    const handleMouseMove = (e: MouseEvent) => {
      // Relative to window
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Only use scroll animations on client side
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])
  
  // Parallax elements for hero
  const heroParallaxX = useTransform(springX, [0, 2000], [-20, 20])
  const heroParallaxY = useTransform(springY, [0, 1000], [-20, 20])
  const blobParallaxX = useTransform(springX, [0, 2000], [50, -50])
  const blobParallaxY = useTransform(springY, [0, 1000], [50, -50])

  return (
    <div ref={containerRef} className="flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      {/* Interactive Cursor Spotlight - Enhanced */}
      <motion.div
        className="fixed inset-0 z-30 pointer-events-none"
        style={{
          background: useTransform(
            [springX, springY],
            ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(219, 39, 119, 0.08), transparent 80%)`
          ),
        }}
      />

      {/* Floating Interactive Geometric Shapes - Optimized */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ x: blobParallaxX, y: blobParallaxY }}
          className="absolute top-[15%] left-[5%] w-64 h-64 bg-primary/3 rounded-[40%] blur-3xl"
        />
        <motion.div 
          style={{ x: useTransform(springX, [0, 2000], [-30, 30]), y: useTransform(springY, [0, 1000], [30, -30]) }}
          className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-pink-100/10 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[95vh] flex items-center pt-20 pb-32 overflow-hidden bg-white">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: isClient ? backgroundY : "0%", x: heroParallaxX }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/40 to-transparent z-10"></div>
          <motion.img 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80" 
            alt="Premium Home Interior" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-20">
          <motion.div 
            className="max-w-3xl space-y-10"
            style={{ y: textY }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white text-primary text-sm font-black border border-pink-100 shadow-xl shadow-pink-100/50"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />
              <span className="uppercase tracking-widest">PREMIUM HYGIENE & TECHNICAL SOLUTIONS IN UAE</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              ELEVATING <br />
              <span className="text-primary relative">
                HYGIENE
                <motion.span 
                  className="absolute -bottom-2 left-0 h-2 bg-pink-100 -z-10"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </span>
              <br />
              STANDARDS
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Experience the UAE's most trusted hygiene and technical partner. We deliver meticulously detailed services tailored for modern living.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.a 
                href="/quote" 
                className="group relative inline-flex items-center justify-center px-10 py-5 bg-slate-900 text-white font-black rounded-2xl overflow-hidden active:scale-95 transition-transform"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 uppercase tracking-widest flex items-center gap-3">
                  Get a Free Quote <ArrowRight className="h-5 w-5" />
                </span>
              </motion.a>
              <motion.a 
                href="/services" 
                className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-100 shadow-sm hover:border-primary transition-all active:scale-95"
                whileHover={{ y: -5 }}
              >
                <span className="uppercase tracking-widest">Our Services</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating background elements - Optimized */}
        <motion.div 
          className="absolute right-[10%] top-[20%] w-64 h-64 bg-primary/5 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -25, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-slate-100/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Happy Clients Across UAE", value: "18,000+", icon: Users },
              { label: "Hygiene Sessions Completed", value: "45,000+", icon: Sparkles },
              { label: "Certified Expert Staff", value: "250+", icon: ShieldCheck },
              { label: "Emirates Covered", value: "7", icon: Award },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-6 justify-center md:justify-start group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100 group-hover:rotate-12">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Mission Values */}
      <section className="py-32 bg-slate-50/50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">Our Core</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tight">The Foundation of Trust</h3>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              We operate with a philosophy of uncompromising quality and transparency, setting new benchmarks for the cleaning industry in the UAE.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <motion.div 
              className="group p-12 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-primary/20 transition-all duration-500 flex flex-col"
              whileHover={{ y: -10 }}
            >
              <div className="h-20 w-20 rounded-3xl bg-pink-50 flex items-center justify-center text-primary mb-10 group-hover:scale-110 transition-transform shadow-inner">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-black mb-6 text-slate-900 leading-tight">Our Vision</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                To be the first choice to our employees, suppliers and customers in the region we operate.
              </p>
            </motion.div>
            
            <motion.div 
              className="group p-12 bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-900/20 border border-slate-800 hover:bg-slate-800 transition-all duration-500 flex flex-col text-white"
              whileHover={{ y: -10 }}
            >
              <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-black mb-6 leading-tight">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                To provide reliable, flexible and consistent solution to our internal and external stakeholders in our hygiene business.
              </p>
            </motion.div>

            <motion.div 
              className="group p-12 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-primary/20 transition-all duration-500 flex flex-col"
              whileHover={{ y: -10 }}
            >
              <div className="h-20 w-20 rounded-3xl bg-pink-50 flex items-center justify-center text-primary mb-10 group-hover:scale-110 transition-transform shadow-inner">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-black mb-6 text-slate-900 leading-tight">Core Values</h3>
              <ul className="space-y-4">
                {[
                  "Honoring Professional SLAs",
                  "Deep Reliability & Integrity",
                  "Customer-First Approach",
                  "Excellence and Quality"
                ].map((val, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <div className="h-2 w-2 rounded-full bg-primary" /> {val}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Slider */}
      <section className="py-32 bg-white overflow-hidden relative">
        {/* Background Text Decor with Parallax */}
        <motion.div 
          style={{ x: useTransform(springX, [0, 2000], [-50, 50]), y: useTransform(springY, [0, 1000], [-30, 30]) }}
          className="absolute top-40 -left-20 text-[15rem] font-black text-slate-50 select-none pointer-events-none tracking-tighter -rotate-90"
        >
          SERVICES
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-6">Our Expertise</h2>
              <h3 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
                Meticulous Care <br />
                <span className="text-primary italic">for every space</span>
              </h3>
              <p className="text-slate-500 text-lg leading-relaxed font-medium">
                From luxury villas to corporate headquarters, we deploy specialized teams equipped with industrial-grade technology and medical-grade disinfectants.
              </p>
            </div>
            
            {/* Slider Navigation */}
            <div className="flex items-center gap-4">
              <motion.button 
                onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                disabled={sliderIndex === 0}
                className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
              <motion.button 
                onClick={() => setSliderIndex(Math.min(services.length - 4, sliderIndex + 1))}
                disabled={sliderIndex >= services.length - 4}
                className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </div>
          </div>

          {/* Services Slider */}
          <div className="relative overflow-hidden">
            <motion.div 
              ref={sliderRef}
              className="flex gap-10"
              animate={{ x: -sliderIndex * 360 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {services.map((service, i) => (
                <motion.div
                  key={i} 
                  className="relative h-96 w-80 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100 animate-hanging flex-shrink-0"
                  style={{ animationDelay: `${(i % 4) * 0.15}s` }}
                  whileHover={{ y: -15, transition: { duration: 0.4, ease: "easeOut" } }}
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

                  <div className="absolute bottom-10 left-10 right-10 z-10">
                    <h3 className="text-3xl font-black text-white mb-4 leading-tight">{service.title}</h3>
                    <p className="text-slate-300 font-medium mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 text-sm">
                      {service.description}
                    </p>
                    <motion.div 
                      className="inline-flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm"
                      whileHover={{ gap: "1.5rem" }}
                    >
                      View Service <ArrowRight className="h-5 w-5 text-primary" />
                    </motion.div>
                  </div>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Slider Indicators */}
          <div className="flex items-center justify-center gap-2 mt-12">
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

      {/* Why Choose Us */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">The Advantage</h2>
                <h3 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                  WHY <br />
                  <span className="text-primary italic">HOMEWORK</span> <br />
                  UAECLEAN?
                </h3>
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
                      "Subscription Discounts (-20%)"
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

      {/* Testimonials Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">Client Voices</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic">Trusted by UAE's finest</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                name: "Fatima Al Suwaidi",
                role: "Villa Owner, Jumeirah",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "The attention to detail in their deep cleaning service is unmatched. My villa has never felt so fresh!"
              },
              {
                name: "David Wilson",
                role: "Resident, TechHub Dubai",
                image: "https://randomuser.me/api/portraits/men/75.jpg",
                text: "Excellent technical service! Their AC maintenance team was professional, punctual, and very thorough."
              },
              {
                name: "Mariam Rashid",
                role: "Resident, Marina",
                image: "https://randomuser.me/api/portraits/women/88.jpg",
                text: "The weekly normal cleaning keeps my apartment in perfect condition. Highly recommended hygiene partner!"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i} 
                className="bg-slate-50 p-12 rounded-[3rem] relative border border-slate-100/50 hover:bg-white hover:shadow-3xl hover:shadow-slate-200 transition-all duration-500 animate-hanging"
                style={{ animationDelay: `${i * 0.2}s` }}
                whileHover={{ y: -15 }}
              >
                <div className="flex text-pink-500 mb-8 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="text-xl text-slate-700 font-medium mb-10 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-6 mt-auto">
                  <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-wider">{testimonial.name}</h4>
                    <p className="text-primary font-black text-[10px] uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="bg-primary rounded-[4rem] p-16 md:p-24 relative overflow-hidden shadow-3xl shadow-primary/30 text-center"
            whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)] opacity-50" />
            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                EXPERIENCE THE <br />
                <span className="italic">GOLD STANDARD</span>
              </h2>
              <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto">
                Join 18,000+ satisfied clients across the UAE. Your journey to a healthier, cleaner environment begins with a single click.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <motion.a 
                  href="/quote" 
                  className="bg-white text-primary px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Instant Quote
                </motion.a>
                <motion.a 
                  href="/contact" 
                  className="bg-slate-900 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Expert
                </motion.a>
              </div>
            </div>
            
            {/* Decorative circles - Optimized */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-pink-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.7s' }} />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
    
