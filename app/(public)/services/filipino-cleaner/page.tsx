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
  Users,
  CalendarDays,
  Heart,
  Globe,
  Award,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

const ACTIVE_SERVICES = [
  { name: "Maid Service", slug: "maids-service" },
  { name: "Filipino Cleaner", slug: "filipino-cleaner" },
  { name: "Part-Time Cleaners", slug: "part-time-cleaners" },
  { name: "Deep Cleaning", slug: "deep-cleaning" },
  { name: "Home Cleaning", slug: "home-cleaning" },
  { name: "Furniture Cleaning", slug: "furniture-cleaning" },
]

const categories = [
  {
    title: "Filipino Household Cleaning",
    icon: Home,
    items: [
      { name: "Daily Home Cleaning", desc: "Comprehensive daily cleaning by experienced Filipino professionals — sweeping, mopping, dusting, and surface sanitising." },
      { name: "Weekly Cleaning Visits", desc: "Scheduled weekly sessions covering all main living areas, kitchens, bathrooms, and bedrooms to keep your home spotless." },
      { name: "Monthly Deep Sessions", desc: "Thorough monthly cleans targeting hard-to-reach spots, behind appliances, inside cupboards, and full bathroom/kitchen scrubs." },
      { name: "On-Demand Booking", desc: "Book a Filipino cleaner within hours for last-minute requirements, post-event clean-ups, or urgent household needs." },
    ],
  },
  {
    title: "Specialised Tasks & Household Support",
    icon: Heart,
    items: [
      { name: "Laundry & Ironing", desc: "Professional sorting, washing, drying, and careful ironing of all garments, linens, and household fabrics." },
      { name: "Kitchen & Dishwashing", desc: "Full kitchen reset including counters, sinks, appliances, stovetops, and dishwashing after every meal." },
      { name: "Childcare Assistance", desc: "Caring, family-oriented support with light childcare tasks — Filipino maids are renowned for their warmth and reliability." },
      { name: "Grocery & Light Errands", desc: "Assisted shopping and basic household errands to reduce the burden on busy families and working professionals." },
    ],
  },
  {
    title: "Professional Placement & Management",
    icon: Users,
    items: [
      { name: "Vetted Placement", desc: "Every Filipino cleaner undergoes thorough background checks, identity verification, and skills assessment before placement." },
      { name: "Live-In Arrangements", desc: "Trusted live-in Filipino maids for families who need round-the-clock support from a dedicated household professional." },
      { name: "Replacement Cover", desc: "Seamless replacement staff during holidays or absences so your household routine is never disrupted." },
      { name: "Training & Quality Assurance", desc: "All our Filipino cleaners are trained in Silver Maid's standards — professional, discreet, and detail-oriented." },
    ],
  },
]

const FAQs = [
  {
    question: "Why are Filipino cleaners so popular in the UAE?",
    answer: "Filipino domestic workers are widely respected across the UAE and GCC for their professionalism, adaptability, excellent English communication, and strong work ethic. Their cultural warmth and dedication to household duties make them a preferred choice for families of all nationalities.",
  },
  {
    question: "Are your Filipino cleaners legally documented in the UAE?",
    answer: "Absolutely. All our Filipino cleaners are legally residing in the UAE with valid visas and documentation. We only work with properly authorised staff and comply fully with UAE labour law requirements.",
  },
  {
    question: "Can I request a specific Filipino cleaner for repeat visits?",
    answer: "Yes. Once you have a preferred cleaner, we do our best to assign the same individual for every visit to maintain consistency, familiarity, and trust in your home.",
  },
  {
    question: "What areas in the UAE do your Filipino cleaners cover?",
    answer: "We provide Filipino cleaning services across Dubai, Abu Dhabi, Sharjah, Ajman, and other emirates. Contact us to confirm coverage in your specific area.",
  },
]

export default function FilipinoCleanerPage() {
  const { contact } = useContactInfo()

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1718729701764-c87ada8ae01c?auto=format&fit=crop&q=80&w=1600"
            alt="Filipino Cleaner Dubai"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/20 to-slate-950" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Filipino Cleaning Professionals
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              TRUSTED <br />
              <span className="text-primary italic">FILIPINO</span> CLEANERS
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Professional, Vetted Filipino Cleaning Staff — Reliable, English-Speaking & Experience-Proven
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link
                href="/book-service"
                className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-primary/30"
              >
                Book a Filipino Cleaner <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: ShieldCheck, label: "100% Vetted", sub: "Background checked" },
              { icon: Globe, label: "English Speaking", sub: "Clear communication" },
              { icon: Award, label: "Professionally Trained", sub: "Silver Maid standards" },
              { icon: Star, label: "5-Star Rated", sub: "Client satisfaction" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-black text-slate-900 text-sm uppercase tracking-wider">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
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
                    Why Choose a <span className="text-primary">Filipino Cleaner</span> in Dubai?
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    Filipino domestic workers have long been the backbone of household management across the UAE. Known for their exceptional professionalism, fluency in English, and genuine dedication, Filipino cleaners bring a level of care and reliability that is unmatched. At Silver Maid Cleaning Services LLC, we connect you with thoroughly vetted, experienced Filipino cleaners who treat your home as their own.
                  </p>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    Whether you need a regular cleaning schedule or a one-time deep session, our Filipino cleaning professionals are trained to deliver impeccable results — every single visit.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "Filipino domestic workers are celebrated across the Middle East for their warmth, reliability, and world-class housekeeping skills. We ensure every cleaner on our team meets the highest professional standards."
                    </p>
                  </div>
                </div>

                {/* Service Categories */}
                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    OUR FILIPINO CLEANER SERVICES INCLUDE:
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
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex shrink-0 items-center justify-center text-primary mt-1 group-hover:bg-primary group-hover:text-white transition-all">
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

                {/* Why Choose Us */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: ShieldCheck, label: "Police Cleared" },
                    { icon: Globe, label: "English Fluent" },
                    { icon: Star, label: "5-Star Rated" },
                    { icon: Clock, label: "Flexible Hours" },
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-3xl text-center space-y-3 border border-slate-100">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* FAQ Section */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {FAQs.map((faq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <h5 className="font-black text-slate-900 mb-3 flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          {faq.question}
                        </h5>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed pl-8">{faq.answer}</p>
                      </motion.div>
                    ))}
                  </div>
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
                        service.slug === 'filipino-cleaner'
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

      {/* CTA Banner */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              Ready to Book Your <br /> Filipino Cleaner?
            </h2>
            <p className="text-white/80 text-lg font-medium mb-10 max-w-xl mx-auto">
              Experience the Gold Standard of household cleaning. Professionally trained, fully vetted Filipino cleaning staff available across the UAE.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book-service"
                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
              >
                Book Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/40 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:border-white transition-all"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
