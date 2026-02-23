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
  Layers, 
  Play, 
  Sparkles, 
  Droplets, 
  Shield, 
  Search,
  Home,
  Bed,
  Bath,
  CookingPot,
  PlusCircle,
  Wind
} from 'lucide-react'


export default function VillaDeepCleaning() {
  const { contact } = useContactInfo()
  const categories = [
    {
      title: "Bedroom & Living Room",
      icon: Bed,
      items: [
        { name: "Walls and Skirting", desc: "Meticulous cleaning of walls, corners, and skirting boards to remove dust, grime, and cobwebs." },
        { name: "Ceilings and Fixtures", desc: "Dusting and cleaning of ceilings, light fixtures, ceiling fans, and air conditioning vents." },
        { name: "Furniture and Upholstery", desc: "Vacuuming and spot-cleaning of furniture and upholstery to remove stains and deep-seated dirt." },
        { name: "Windows and Mirrors", desc: "Thorough cleaning of windows, frames, sills, and mirrors for a crystal-clear, streak-free finish." },
        { name: "Flooring", desc: "Deep cleaning of carpets, rugs, wooden floors, and tiles to restore their original showroom luster." }
      ]
    },
    {
      title: "Bathrooms",
      icon: Bath,
      items: [
        { name: "Cabinets and Countertops", desc: "Deep cleaning and sanitizing of all bathroom cabinets, countertops, sinks, and mirrors." },
        { name: "Shower Areas and Tubs", desc: "Removal of soap scum, mildew, and hard water stains from tiles, grout, and glass shower doors." },
        { name: "Toilets", desc: "Comprehensive medical-grade cleaning and disinfection of toilets, including under rims and behind fixtures." },
        { name: "Floors", desc: "Mopping and intensive scrubbing of bathroom floors to eliminate all dirt and harmful bacteria." }
      ]
    },
    {
      title: "Kitchens",
      icon: CookingPot,
      items: [
        { name: "Cabinets and Drawers", desc: "Detailed cleaning and professional organizing of all kitchen cabinets and storage drawers." },
        { name: "Countertops and Backsplashes", desc: "Sanitizing and intensive scrubbing of countertops and backsplashes to remove grease and stains." },
        { name: "Appliances", desc: "Detailed cleaning of the exterior and interior of ovens, microwaves, refrigerators, and dishwashers." },
        { name: "Sinks and Faucets", desc: "Professional descaling and polishing of sinks, faucets, and drain strainers for a hygienic finish." },
        { name: "Floors", desc: "Thorough cleaning of kitchen floors to ensure a perfectly sanitary environment for cooking." }
      ]
    },
    {
      title: "Balconies and Outdoor Areas",
      icon: Layers,
      items: [
        { name: "Floors and Handrails", desc: "Sweeping, mopping, and intensive scrubbing of balcony floors and handrails to remove desert dust." },
        { name: "Outdoor Furniture", desc: "Dusting and cleaning of outdoor furniture and fixtures to remove dirt and weather debris." },
        { name: "Drainage Strainers", desc: "Cleaning and unclogging of all drainage strainers to prevent water buildup and ensure clear drainage." }
      ]
    },
    {
      title: "General Areas",
      icon: PlusCircle,
      items: [
        { name: "Dusting and Vacuuming", desc: "Comprehensive dusting of all surfaces, including shelves, picture frames, and high-end electronics." },
        { name: "Sanitizing Touchpoints", desc: "Disinfecting high-touch areas such as door handles, light switches, and remote controls." },
        { name: "Air Freshening", desc: "Using professional air fresheners and deodorizers to leave your home smelling exceptionally fresh." }
      ]
    }
  ]

  const servicesList = [
    { name: "Villa Deep Cleaning", slug: "villa-deep-cleaning" },
    { name: "Move in/out Cleaning", slug: "move-in-out-cleaning" },
    { name: "Apartment Deep Cleaning", slug: "apartment-deep-cleaning" },
    { name: "Office Deep Cleaning", slug: "office-cleaning" },
    { name: "Post Construction Cleaning", slug: "post-construction-cleaning" },
    { name: "Kitchen Deep Cleaning", slug: "kitchen-deep-cleaning" },
    { name: "Garage Deep Cleaning", slug: "garage-deep-cleaning" },
    { name: "Grout Deep Cleaning", slug: "grout-deep-cleaning" },
    { name: "Floor deep cleaning", slug: "floor-deep-cleaning" },
    { name: "Window cleaning", slug: "window-cleaning" },
    { name: "Balcony Deep Cleaning", slug: "balcony-deep-cleaning" },
    { name: "Sofa Deep Cleaning", slug: "sofa-deep-cleaning" },
    { name: "Mattress Deep Cleaning", slug: "mattress-deep-cleaning" },
    { name: "Carpets Deep Cleaning", slug: "carpets-deep-cleaning" },
    { name: "Ac Duct Cleaning", slug: "ac-duct-cleaning" }
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600" 
            alt="Villa Deep Cleaning" 
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
              Grand Scale Excellence
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              VILLA <br />
              <span className="text-primary italic">DEEP CLEANING</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Transform Your Villa with UAE's Expert Deep Cleaning Services
            </p>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">
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
                    Is your villa in need of a thorough and meticulous clean? Look no further! At Silver Maid Cleaning Services LLC, we specialize in transforming your villa into a spotless sanctuary. Our professional team uses advanced equipment and eco-friendly cleaning solutions to ensure every corner of your villa shines with brilliance.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "If you're looking to perform Villa Deep Cleaning, here's a practical checklist to keep your home clean and organized efficiently."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                    <Home className="h-8 w-8 text-primary" />
                    Our Comprehensive Villa Services:
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
                        <div className="grid md:grid-cols-1 gap-6">
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
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl sticky top-24 max-h-[80vh] overflow-y-auto"
              >
                <h4 className="text-2xl font-black mb-8 tracking-tight italic">Other Services</h4>
                <div className="space-y-4">
                  {servicesList.map((service, i) => (
                    <a 
                      key={i} 
                      href={`/services/${service.slug}`} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        service.slug === "villa-deep-cleaning" 
                        ? 'bg-primary border-primary text-white font-black' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest">{service.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Pricing</p>
                  <p className="text-4xl font-black text-primary tracking-tighter mb-8 italic">Get Quote</p>
                  <button className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all">
                    Custom Estimates
                  </button>
                </div>
              </motion.div>
            </div>
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/40 mx-auto">
                  Play
                </div>
                <p className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">Video Preview Coming Soon</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -mr-20" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/5 blur-[120px] rounded-full -ml-20" />
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The Advantage</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">WHY CHOOSE US?</h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto">Ensuring the highest standards of luxury and hygiene for your premium estate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { 
                title: "Expertise", 
                desc: "Our team is highly trained and experienced in villa deep cleaning, ensuring top-notch results for large properties.", 
                icon: ShieldCheck 
              },
              { 
                title: "Attention to Detail", 
                desc: "We leave no spot untouched, ensuring every nook and cranny is thoroughly cleaned and sanitized.", 
                icon: Sparkles 
              },
              { 
                title: "Customized Plans", 
                desc: "We tailor our services to meet your specific needs and preferences, offering personalized luxury cleaning plans.", 
                icon: Clock 
              },
              { 
                title: "Reliable and Trustworthy", 
                desc: "Our team is vetted, insured, and committed to providing exceptional service with integrity and professionalism.", 
                icon: CheckCircle2 
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-6 shadow-inner shadow-slate-200">
                  <value.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase">{value.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-12 bg-slate-950 rounded-[3.5rem] text-center relative overflow-hidden group"
          >
            <div className="relative z-10">
              <h4 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">Your Villa, <span className="text-primary italic">Exquisitely Cleaned</span></h4>
              <p className="text-slate-400 text-lg mb-10 font-bold">Contact us today for a professional villa deep cleaning experience.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href={`tel:${contact.phone}`} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all flex items-center gap-3">
                   800 4663 9675
                </a>
                <a href={`mailto:${contact.email}`} className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3">
                   Email Us
                </a>
              </div>
            </div>
            <Home className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
