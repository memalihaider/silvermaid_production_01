"use client"

import { ContactPhone, ContactEmail } from '@/components/ContactDisplay'
import { useContactInfo } from '@/contexts/ContactContext'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Star,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
  Home,
  Building2,
  Wind,
  Layers,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'

const ACTIVE_SERVICES = [
  { name: "Maid Service", slug: "maids-service" },
  { name: "Deep Cleaning", slug: "deep-cleaning" },
  { name: "Home Cleaning", slug: "home-cleaning" },
  { name: "Furniture Cleaning", slug: "furniture-cleaning" },
  { name: "Glass / Window Cleaning", slug: "window-cleaning" },
]

const categories = [
  {
    title: "Regular Home Cleaning",
    icon: Home,
    items: [
      { name: "Living Room Cleaning", desc: "Dusting, vacuuming, and sanitising all surfaces, cushions, shelves, and entertainment units." },
      { name: "Bedroom Cleaning", desc: "Bed-making, dusting, vacuuming, and wiping all bedroom surfaces and furniture." },
      { name: "Kitchen Surface Cleaning", desc: "Wiping countertops, cleaning hob surfaces, and sanitising the sink and surrounding areas." },
      { name: "Bathroom Cleaning", desc: "Scrubbing, disinfecting, and polishing toilets, sinks, showers, and tiles." },
    ],
  },
  {
    title: "Floor & Surface Care",
    icon: Layers,
    items: [
      { name: "Vacuuming & Sweeping", desc: "Thorough vacuuming of all carpets, rugs, and hard floors to remove dust and allergens." },
      { name: "Mopping & Floor Sanitisation", desc: "Damp mopping of all hard surfaces using eco-friendly, pet-safe cleaning solutions." },
      { name: "Skirting Board Wiping", desc: "Dusting and wiping down all skirting boards, door frames, and ledges." },
      { name: "Mat & Rug Attention", desc: "Lifting, shaking, and vacuuming mats and area rugs for comprehensive floor hygiene." },
    ],
  },
  {
    title: "Ventilation & Air Quality",
    icon: Wind,
    items: [
      { name: "Fan & Vent Dusting", desc: "Carefully cleaning ceiling fans, air vents, and AC grilles to improve air circulation." },
      { name: "Window Sill Cleaning", desc: "Wiping window ledges, frames, and sills to prevent dust build-up and allergen spread." },
      { name: "Light Switch & Socket Wipe", desc: "Sanitising all light switches, sockets, and frequently touched surfaces throughout the home." },
      { name: "Curtain & Blind Dusting", desc: "Gentle dusting and straightening of curtains and blinds for a fresh, neat presentation." },
    ],
  },
  {
    title: "Optional Add-On Services",
    icon: Building2,
    items: [
      { name: "Inside Fridge Cleaning", desc: "Removing contents, wiping shelves, and deodorising the interior of refrigerators." },
      { name: "Inside Oven Cleaning", desc: "Degreasing and cleaning the inside of ovens, trays, and racks." },
      { name: "Laundry & Ironing", desc: "Add a laundry and ironing service for a completely hands-free home care experience." },
      { name: "Balcony Cleaning", desc: "Sweeping, washing, and rinsing balcony floors, glass, and furniture at the end of each visit." },
    ],
  },
]

export default function HomeCleaning() {
  const { contact } = useContactInfo()

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1600"
            alt="Home Cleaning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/20 to-slate-950" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Home Cleaning Services
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              SPOTLESS <br />
              <span className="text-primary italic">HOME</span> CLEANING
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Professional Residential Home Cleaning Services Across the UAE
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Content */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                    Welcome to <span className="text-primary">Silver Maid Cleaning Services LLC</span>
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    Your home deserves consistent, professional care. At Silver Maid Cleaning Services LLC, our trained home cleaning teams provide thorough, reliable cleaning customised to your schedule and preferences. From studio apartments to large family villas, we ensure every room is left spotless using eco-friendly, family-safe products.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "A professionally cleaned home reduces stress, improves air quality, and creates the perfect environment for your family to thrive. Our teams are trained to deliver that standard, every visit."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    OUR HOME CLEANING SERVICES INCLUDE:
                  </h3>
                  <div className="grid gap-8">
                    {categories.map((cat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50"
                      >
                        <div className="flex items-center gap-4 mb-8">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <cat.icon className="h-6 w-6" />
                          </div>
                          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{cat.title}</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          {cat.items.map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary mt-1 group-hover:bg-primary group-hover:text-white transition-all">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                              <div>
                                <h5 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-1">{item.name}</h5>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: ShieldCheck, label: "Eco-Friendly" },
                    { icon: Zap, label: "Fast Booking" },
                    { icon: Star, label: "5-Star Service" },
                    { icon: Clock, label: "Flexible Schedules" },
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-3xl text-center space-y-3 border border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl sticky top-24"
              >
                <h4 className="text-2xl font-black mb-8 tracking-tight italic">Our Services</h4>
                <div className="space-y-4">
                  {ACTIVE_SERVICES.map((service, i) => (
                    <Link
                      key={i}
                      href={`/services/${service.slug}`}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        service.slug === 'home-cleaning'
                          ? 'bg-primary border-primary text-white font-black'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest">{service.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
                <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Get a Quote</p>
                  <p className="text-4xl font-black text-primary tracking-tighter mb-8 italic">Contact Us</p>
                  <Link href="/book-service" className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all inline-block">
                    Book Now
                  </Link>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">Call Us</p>
                      <ContactPhone className="text-sm font-bold text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                    <Zap className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">Email Us</p>
                      <ContactEmail className="text-sm font-bold text-slate-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
