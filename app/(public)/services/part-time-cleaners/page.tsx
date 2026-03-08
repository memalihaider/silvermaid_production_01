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
  Briefcase,
  MessageCircle,
  Timer,
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
    title: "Flexible Part-Time Cleaning",
    icon: Clock,
    items: [
      { name: "4-Hour Clean (Half-Day)", desc: "A focused 4-hour session covering your main living areas, kitchen, bathrooms, and bedrooms — perfect for apartments and smaller homes." },
      { name: "6-Hour Clean", desc: "Extended 6-hour deep-clean session ideal for medium-sized homes needing more thorough attention across all rooms." },
      { name: "8-Hour Clean (Full-Day)", desc: "A comprehensive full-day cleaning covering every corner of your home including storage areas, appliances, and outdoor spaces." },
      { name: "Custom Hour Packages", desc: "Tell us how many hours you need and we'll build a custom schedule around your requirements and budget." },
    ],
  },
  {
    title: "Regular Scheduled Sessions",
    icon: CalendarDays,
    items: [
      { name: "Twice Weekly", desc: "Two part-time visits per week for busy households that need regular maintenance without committing to a daily presence." },
      { name: "Once Weekly", desc: "A reliable weekly clean to keep your home in top condition — the most popular choice for working families." },
      { name: "Bi-Weekly Visits", desc: "Fortnightly part-time cleaning sessions for those who prefer less frequent help while still maintaining a clean home." },
      { name: "Monthly Maintenance", desc: "Monthly sessions for light-touch maintenance, ideal for single-occupancy homes, empty properties, or holiday residences." },
    ],
  },
  {
    title: "Specialist Part-Time Tasks",
    icon: Heart,
    items: [
      { name: "Kitchen Deep-Clean Focus", desc: "Part-time session focused entirely on the kitchen — appliances inside and out, grout, tiles, cabinets, and surfaces." },
      { name: "Bathroom & Wet Area Focus", desc: "Concentrated part-time clean targeting all bathrooms, wet areas, and laundry rooms with professional-grade sanitising." },
      { name: "Laundry & Ironing Session", desc: "Dedicated part-time hours for laundry collection, washing, drying, folding, and ironing of your household garments." },
      { name: "Post-Event Tidy Up", desc: "Quick, efficient part-time cleaning after gatherings, parties, or events to restore your home to its original state." },
    ],
  },
]

const FAQs = [
  {
    question: "What is the minimum booking for a part-time cleaner?",
    answer: "Our standard minimum booking is 4 hours per session. This ensures the cleaner has sufficient time to make a meaningful difference in your home. However, we can discuss custom arrangements for specific requirements.",
  },
  {
    question: "Can I book the same part-time cleaner every time?",
    answer: "Yes. We strongly encourage consistency and will do our best to assign the same cleaner for each of your scheduled visits. Familiarity with your home means better results with every session.",
  },
  {
    question: "Do I need to provide cleaning supplies?",
    answer: "Our cleaners can bring their own professional-grade supplies and equipment, or use yours — just let us know your preference when booking. We always use safe, effective, and family-friendly cleaning products.",
  },
  {
    question: "Are part-time cleaners available on weekends?",
    answer: "Yes, we offer part-time cleaning services 7 days a week, including weekends and public holidays. Weekend availability may vary, so we recommend booking in advance to secure your preferred time slots.",
  },
  {
    question: "How do I pay for part-time cleaning sessions?",
    answer: "Payment is simple and flexible. We accept cash, bank transfer, and card payments. For regular recurring sessions, we offer monthly billing to make management even easier.",
  },
]

export default function PartTimeCleanersPage() {
  const { contact } = useContactInfo()

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1600"
            alt="Part-Time Cleaners Dubai"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/20 to-slate-950" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Flexible Part-Time Cleaning
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              PART-TIME <br />
              <span className="text-primary italic">CLEANERS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Flexible, Hourly & Scheduled Cleaning — Book as Many or as Few Hours as You Need
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link
                href="/book-service"
                className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-primary/30"
              >
                Book Part-Time Cleaner <ArrowRight className="h-4 w-4" />
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
              { icon: Timer, label: "4–8 Hour Sessions", sub: "Flexible scheduling" },
              { icon: ShieldCheck, label: "Vetted Cleaners", sub: "Background checked" },
              { icon: Star, label: "5-Star Rated", sub: "Client satisfaction" },
              { icon: Zap, label: "Fast Booking", sub: "Same-day availability" },
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
                    What is a <span className="text-primary">Part-Time Cleaner</span>?
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    A part-time cleaner is a professional cleaning specialist who works in your home for a set number of hours — typically between 4 to 8 hours — rather than as a full-time live-in or daily employee. This service is the perfect solution for working professionals, couples, young families, and anyone who wants a professionally maintained home without the commitment of a full-time domestic worker.
                  </p>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    At Silver Maid Cleaning Services LLC, our part-time cleaners are fully vetted, professionally trained, and experienced in delivering high-quality residential cleaning across the UAE. You choose the hours, the frequency, and the tasks — we deliver the results.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "Part-time cleaning is not a compromise — it is the smart choice. Our part-time professionals deliver the same quality as a full-time maid, on your schedule, at your pace."
                    </p>
                  </div>
                </div>

                {/* Service Categories */}
                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    OUR PART-TIME CLEANING OPTIONS:
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

                {/* Pricing Overview */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
                  <h3 className="text-2xl font-black tracking-tight mb-8 text-primary">
                    How Part-Time Pricing Works
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { hours: "4 Hours", label: "Half-Day", desc: "Best for apartments and smaller homes" },
                      { hours: "6 Hours", label: "Standard", desc: "Most popular — covers most 2–3 bedroom homes" },
                      { hours: "8 Hours", label: "Full-Day", desc: "Comprehensive coverage for villas and larger properties" },
                    ].map((tier, i) => (
                      <div key={i} className={`p-6 rounded-2xl border ${i === 1 ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
                        <p className="text-3xl font-black text-primary mb-1">{tier.hours}</p>
                        <p className="font-black text-white text-sm uppercase tracking-widest mb-3">{tier.label}</p>
                        <p className="text-slate-400 text-xs font-medium">{tier.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm mt-6">
                    * Pricing varies based on property size, location, and selected tasks. Contact us for a custom quote.
                  </p>
                </div>

                {/* Why Choose Us */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: ShieldCheck, label: "Vetted Staff" },
                    { icon: Zap, label: "Fast Booking" },
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
                        service.slug === 'part-time-cleaners'
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
              Book Your Part-Time <br /> Cleaner Today
            </h2>
            <p className="text-white/80 text-lg font-medium mb-10 max-w-xl mx-auto">
              Flexible hours, professional results. Choose your schedule and let our vetted cleaning professionals take care of the rest.
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
