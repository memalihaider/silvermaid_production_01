"use client"

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Briefcase, ShieldCheck, Zap, Droplets, Play, Star, ChevronDown, BadgeCheck, Clock, Building2 } from 'lucide-react'
import { ContactPhone, ContactEmail } from '@/components/ContactDisplay'
import { useContactInfo } from '@/contexts/ContactContext'


export default function OfficeDeepCleaning() {
  const { contact } = useContactInfo()
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex items-stretch">

        {/* Background image with layered gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920"
            alt="Office Deep Cleaning"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/80" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-150 h-150 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-75 h-75 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-0 flex items-center w-full">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 items-stretch w-full">

            {/* Left — text content */}
            <div className="space-y-5 py-12 lg:py-16 flex flex-col justify-center">

              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-primary">
                  Office Deep Cleaning
                </span>
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest border-l border-white/10 pl-3">
                  B2B Specialist
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9]">
                  WORKSPACE <span className="text-primary italic">TRANSFORMATION</span> AT SCALE.
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base xl:text-lg text-slate-300/90 font-medium leading-relaxed max-w-xl"
              >
                A deeper standard of corporate hygiene. Precision sanitization for high-traffic workspaces, boardrooms, server rooms, and communal areas — leaving your team healthier and more focused.
              </motion.p>

              {/* Trust bullets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                {[
                  { icon: BadgeCheck, label: 'Hospital-Grade Products' },
                  { icon: Clock, label: 'After-Hours Scheduling' },
                  { icon: ShieldCheck, label: 'Fully Insured & Bonded' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    {label}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <motion.a
                  href="/book-service"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 bg-primary px-6 py-3 rounded-xl font-black uppercase tracking-widest text-white text-sm shadow-2xl shadow-primary/30 hover:bg-pink-600 transition-colors"
                >
                  Book Office Deep Clean
                  <ArrowRight className="h-4 w-4" />
                </motion.a>
                <a
                  href="/quote"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm border border-white/15 text-white/80 hover:border-primary/50 hover:text-white transition-colors backdrop-blur-sm"
                >
                  Get a Quote
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex items-center gap-6 pt-3 border-t border-white/8"
              >
                {[
                  { value: '500+', label: 'Offices Cleaned' },
                  { value: '99%', label: 'Satisfaction' },
                  { value: '10+', label: 'Yrs Experience' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-xl xl:text-2xl font-black text-white tracking-tight">{value}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — floating image card */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex relative self-stretch"
            >
              {/* Main image */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/8 w-full">
                <img
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=900"
                  alt="Professional office cleaning"
                  className="w-full h-full object-cover absolute inset-0"
                />
                {/* Spacer to give the div height */}
                <div className="w-full min-h-full" style={{ minHeight: '100%' }} />
                {/* Inner gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Bottom inset card */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/8 backdrop-blur-xl border border-white/15 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight">Corporate-Grade Standards</p>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">ISO-aligned protocols for every workspace</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-primary fill-primary" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -top-4 -right-4 bg-primary rounded-xl px-4 py-2.5 shadow-2xl shadow-primary/40"
              >
                <p className="text-white font-black text-[10px] uppercase tracking-widest">Trusted By</p>
                <p className="text-white text-lg font-black">200+ Firms</p>
              </motion.div>

              {/* Floating chip — left side */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute top-1/3 -left-5 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 shadow-xl flex items-center gap-2.5"
              >
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-black text-[11px]">Sanitization</p>
                  <p className="text-green-400 text-[11px] font-bold">99.9% Germ-Free</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-white/30" />
          </motion.div>
        </motion.div>

      </section>

      {/* Details Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1 rounded-[3rem] overflow-hidden shadow-3xl group"
            >
              <img 
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000" 
                alt="Corporate office space" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-3 text-primary">
                <Briefcase className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-widest">B2B Hygiene</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Corporate <br />
                <span className="text-primary italic">Deep Sanitization</span>
              </h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed">
                Regular cleaning maintains visibility; deep cleaning maintains health. We focus on frequently touched surfaces, high-ventilation areas, and textile deep cleaning to ensure your team stays productive and safe.
              </p>
              
              <div className="grid gap-4">
                {[
                  "Server room and electronics dusting",
                  "Upholstered chair and carpet extraction",
                  "Restroom deep sanitization (hospital grade)",
                  "Pantry and breakroom degreasing",
                  "Air vent and grille cleaning",
                  "Touch-point antimicrobial coating"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-slate-700 font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <motion.a 
                href="/book-service"
                className="inline-flex items-center gap-4 bg-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/30 hover:bg-pink-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Book Office Deep Clean <ArrowRight className="h-5 w-5" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">See Us In Action</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">SERVICE DEMO VIDEO</h3>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto aspect-video rounded-[3rem] overflow-hidden shadow-3xl bg-slate-800 border border-white/10 group"
          >
            {/* Placeholder until video link is added */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/40 mx-auto">
                  <Play className="h-10 w-10 fill-current ml-1" />
                </div>
                <p className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">Video Preview Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -mr-20" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/5 blur-[120px] rounded-full -ml-20" />
      </section>

    </div>
  )
}
