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
  Bath,
  CookingPot,
  Bed,
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
    title: "Kitchen Deep Clean",
    icon: CookingPot,
    items: [
      { name: "Oven & Hob Degreasing", desc: "Inside-out removal of grease, carbon build-up, and stubborn food residue from all cooking surfaces." },
      { name: "Cabinet & Shelf Cleaning", desc: "Wiping down all cabinet interiors and exteriors including handles and edges." },
      { name: "Appliance Deep Clean", desc: "Thorough cleaning of refrigerator, microwave, dishwasher, and extractor fan filters." },
      { name: "Sink & Drain Sanitisation", desc: "Descaling and disinfecting sinks, taps, and drain covers to eliminate bacteria." },
    ],
  },
  {
    title: "Bathroom Deep Clean",
    icon: Bath,
    items: [
      { name: "Tile & Grout Scrubbing", desc: "Professional scrubbing and treatment of grout lines to remove mould, mildew, and staining." },
      { name: "Toilet Sanitisation", desc: "Full disinfection of the toilet bowl, seat, cistern, and surrounding areas." },
      { name: "Shower & Bath Descaling", desc: "Removing limescale and soap scum from glass, taps, showerheads, and bath surfaces." },
      { name: "Vanity & Mirror Polish", desc: "Streak-free cleaning of mirrors and deep sanitising of bathroom vanity units." },
    ],
  },
  {
    title: "Bedroom & Living Areas",
    icon: Bed,
    items: [
      { name: "Skirting & Cornice Dusting", desc: "Removing accumulated dust from baseboards, cornices, and ceiling edges throughout the property." },
      { name: "Inside Wardrobe Cleaning", desc: "Wiping down interior wardrobe shelves, rails, and tracking to remove dust and odours." },
      { name: "Light Fixture & Fan Cleaning", desc: "Dedusting and sanitising ceiling fans, light fittings, and pendant fixtures." },
      { name: "Door & Frame Wipe-Down", desc: "Cleaning all door surfaces, handles, hinges, and frames to remove fingerprints and grime." },
    ],
  },
  {
    title: "Full-Property Deep Extras",
    icon: Home,
    items: [
      { name: "Window Track & Frame Cleaning", desc: "Cleaning window frames, sills, and tracks — often overlooked during regular cleans." },
      { name: "Wall Spot Cleaning", desc: "Targeted removal of marks, scuffs, and stains from painted walls throughout the property." },
      { name: "Balcony & Terrace Scrub", desc: "Power-washing and scrubbing of outdoor balcony tiles, railings, and glass panels." },
      { name: "Post-Deep-Clean Fragrance", desc: "Application of fresh, non-toxic air freshener throughout the property on completion." },
    ],
  },
]

export default function DeepCleaning() {
  const { contact } = useContactInfo()

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1600"
            alt="Deep Cleaning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/20 to-slate-950" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Deep Cleaning Services
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              TOTAL <br />
              <span className="text-primary italic">DEEP</span> CLEAN
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Professional Top-to-Bottom Deep Cleaning in UAE — Every Surface, Every Corner
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
                    A deep clean goes far beyond your regular weekly tidy. At Silver Maid Cleaning Services LLC, our deep cleaning teams tackle every hidden corner, surface, fixture, and fitting in your property using commercial-grade equipment and DM-approved products. Perfect for move-ins, post-renovation, or periodic resets of your home or office.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "True deep cleaning goes beyond the surface. It's about restoring a sanitised, allergen-free environment that protects your family's health and extends the life of your property's finishes."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    OUR DEEP CLEANING SERVICES INCLUDE:
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
                    { icon: ShieldCheck, label: "DM Approved" },
                    { icon: Zap, label: "Rapid Deploy" },
                    { icon: Star, label: "5-Star Rated" },
                    { icon: Clock, label: "Same-Day Available" },
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
                        service.slug === 'deep-cleaning'
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
