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
  Dumbbell, 
  Play, 
  Sparkles, 
  Droplets, 
  Shield, 
  Search,
  Users,
  HeartPulse,
  Activity,
  Music,
  Layout,
  History,
  TrendingDown,
  Scale,
  Bath,
  Trash2
} from 'lucide-react'

export default function GymDeepCleaning() {
  const { contact } = useContactInfo()
  const categories = [
    {
      title: "Workout Area Hygiene",
      icon: HeartPulse,
      items: [
        { name: "Equipment Sanitization", desc: "Thorough cleaning of treadmills, ellipticals, and weight machines to eliminate sweat and bacteria." },
        { name: "Rubber Floor Scrubbing", desc: "Deep cleaning of gym mats and heavy-duty flooring using specialized disinfectant solutions." },
        { name: "Mirror & Glass Clarity", desc: "Streak-free polishing of full-length gym mirrors to maintain a sharp, professional workout environment." },
        { name: "Surface Detailing", desc: "Meticulous dusting and wiping of benches, shelves, and accessory storage racks." }
      ]
    },
    {
      title: "Locker Room Sanitization",
      icon: Bath,
      items: [
        { name: "Fixture Sterilization", desc: "Medical-grade cleaning of lockers, benches, and changing areas to ensure member safety." },
        { name: "Restroom & Shower Deep Clean", desc: "Intensive scrubbing of toilets, sinks, and showers to remove grime, mold, and odors." },
        { name: "Deep Floor Mopping", desc: "Mechanical scrubbing of high-moisture locker room floors to eliminate bacteria and fungus." },
        { name: "Supply Restocking", desc: "Ensuring constant availability of soap, paper towels, and essential hygiene products." }
      ]
    },
    {
      title: "Group Fitness Studios",
      icon: Music,
      items: [
        { name: "Studio Floor Care", desc: "Expert vacuuming and mopping of hardwood or specialized studio flooring to remove sweat." },
        { name: "Prop & Accessory Hygiene", desc: "Sanitizing yoga mats, free weights, and exercise balls after high-volume group classes." },
        { name: "Mirror & Wall Cleaning", desc: "Cleaning of large studio mirrors to ensure a clean and inviting group training space." },
        { name: "Air Flow Sanitization", desc: "Dusting and cleaning of studio ventilation systems to ensure fresh air for high-intensity training." }
      ]
    },
    {
      title: "Reception & Common areas",
      icon: Layout,
      items: [
        { name: "Front Desk Detailing", desc: "Dusting and wiping down reception desks and seating zones to create a great first impression." },
        { name: "Entrance Maintenance", desc: "High-frequency vacuuming and mopping of entryways to prevent dirt from entering the facility." },
        { name: "Point of Contact Cleaning", desc: "Disinfecting glass doors, handles, and touch-screens for maximum member protection." },
        { name: "Lounge Area Sanitization", desc: "Cleaning of common spaces and water stations to prevent cross-contamination." }
      ]
    },
    {
      title: "Why Fitness Professionals Choose Us",
      icon: ShieldCheck,
      items: [
        { name: "Fitness-Specific Expertise", desc: "Our team understands the unique biological challenges of high-traffic workout facilities." },
        { name: "Eco-Friendly Pathogen Kill", desc: "Using hospital-grade but environmentally safe products that are tough on germs but safe for skin." },
        { name: "Advanced Cleaning Technology", desc: "Utilizing industrial scrubbers and antimicrobial mists for 360-degree coverage." },
        { name: "Customized Scheduling", desc: "Tailored cleaning plans that work around your gym's peak hours or 24/7 operations." }
      ]
    }
  ]

  const servicesList = [
    { name: "Ac Duct Cleaning", slug: "ac-duct-cleaning" },
    { name: "Ac Coil Cleaning", slug: "ac-coil-cleaning" },
    { name: "Kitchen Hood Cleaning", slug: "kitchen-hood-cleaning" },
    { name: "Grease Trap Cleaning", slug: "grease-trap-cleaning" },
    { name: "Restaurant Cleaning", slug: "restaurant-cleaning" },
    { name: "Water Tank Cleaning", slug: "water-tank-cleaning" },
    { name: "Swimming Pool Cleaning", slug: "swimming-pool-cleaning" },
    { name: "Gym Deep Cleaning", slug: "gym-deep-cleaning" },
    { name: "Facade Cleaning", slug: "facade-cleaning" },
    { name: "Villa Deep Cleaning", slug: "villa-deep-cleaning" },
    { name: "Move in/out Cleaning", slug: "move-in-out-cleaning" },
    { name: "Apartment Deep Cleaning", slug: "apartment-deep-cleaning" },
    { name: "Office Deep Cleaning", slug: "office-cleaning" },
    { name: "Post Construction Cleaning", slug: "post-construction-cleaning" },
    { name: "Kitchen Deep Cleaning", slug: "kitchen-deep-cleaning" }
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1600" 
            alt="Gym Deep Cleaning" 
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
              Fitness Facility Specialist
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              HYGIENIC GYM <br />
              <span className="text-primary italic text-5xl md:text-8xl">WORKOUT ENVIRONMENTS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Sanitized Gym Deep Cleaning in UAE – Protect Your Members & Reputation
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
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                    Member Safety First: The <span className="text-primary italic text-3xl md:text-5xl border-b-4 border-primary/20">Master Fitness Hygiene Checklist</span>
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed italic">
                    A clean and hygienic gym is crucial for the health and satisfaction of your members. In a high-moisture environment, pathogens can spread rapidly without professional intervention.
                  </p>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    At Silver Maid Cleaning Services LLC, we specialize in providing comprehensive gym cleaning services tailored to the unique needs of fitness facilities. Our experienced team uses advanced cleaning techniques and eco-friendly products to ensure your gym remains spotless, welcoming, and free from the hidden threats of bacteria and fungus.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary shadow-sm">
                    <p className="text-slate-700 font-bold italic text-sm">
                      "If you're looking to perform Gym Deep Cleaning, here's a practical checklist to keep your home clean and organized efficiently."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                    <Dumbbell className="h-8 w-8 text-primary" />
                    Our Comprehensive Cleaning Modules:
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

                <div className="pt-10 border-t border-slate-100 italic font-medium text-slate-500">
                  <p>
                    Ensure your facility represents the peak of fitness hygiene. Contact Silver Maid Cleaning Services LLC today to protect your members and elevate your brand's reputation for health and safety.
                  </p>
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
                <h4 className="text-2xl font-black mb-8 tracking-tight italic">Facility Services</h4>
                <div className="space-y-4">
                  {servicesList.map((service, i) => (
                    <a 
                      key={i} 
                      href={`/services/${service.slug}`} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        service.slug === "gym-deep-cleaning" 
                        ? 'bg-primary border-primary text-white font-black shadow-lg shadow-primary/20' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-widest">{service.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-primary/10 rounded-3xl border border-primary/20 text-center">
                  <p className="text-sm font-bold text-primary mb-4 uppercase tracking-[0.2em]">Immediate Quote</p>
                  <p className="text-2xl font-black text-white tracking-tighter mb-8 italic leading-tight uppercase tracking-widest">BOOST MEMBER<br />CONFIDENCE</p>
                  <a href={`tel:${contact.phone}`} className="block w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-primary/30">
                     800 4663 9675
                  </a>
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
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">Total Sanitization</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">WATCH OUR EQUIPMENT DETAILING</h3>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto aspect-video rounded-[3rem] overflow-hidden shadow-3xl bg-slate-800 border border-white/10 group"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center group-hover:scale-110 transition-transform duration-500 cursor-pointer">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/40 mx-auto">
                  <Play className="h-10 w-10 fill-current ml-1" />
                </div>
                <p className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">Watch Service Demo</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -mr-20" />
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The Solution</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">WHY PROFESSIONAL GYM CARE?</h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto italic">“In the fitness business, cleanliness is your most silent yet powerful marketing tool.”</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { 
                title: "Pathogen Protection", 
                desc: "Active defense against viruses and bacteria that thrive in high-moisture, high-traffic gym environments.", 
                icon: ShieldCheck 
              },
              { 
                title: "Member Retention", 
                desc: "Increase member satisfaction and reduce churn by providing a consistently spotless and odorless training space.", 
                icon: Users 
              },
              { 
                title: "Equipment Longevity", 
                desc: "Removing corrosive sweat and friction-increasing dirt extends the life of your expensive cardio and weight fleet.", 
                icon: Zap 
              },
              { 
                title: "Aesthetic Excellence", 
                desc: "Maintain a high-end look with streak-free mirrors and polished floors that reflect your brand's commitment to quality.", 
                icon: Sparkles 
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
            className="mt-20 p-12 bg-slate-950 rounded-[3.5rem] text-center relative overflow-hidden group border border-white/5"
          >
            <div className="relative z-10">
              <h4 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase whitespace-pre-line">
                ELEVATE YOUR ATHLETIC BRAND{"\n"}
                <span className="text-primary italic text-3xl md:text-5xl uppercase">WITH TOTAL HYGIENE</span>
              </h4>
              <p className="text-slate-400 text-lg mb-10 font-bold max-w-2xl mx-auto">
                Ready to transform your gym? Contact us today for a free facility hygiene audit.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href={`tel:${contact.phone}`} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all flex items-center gap-3 shadow-2xl shadow-primary/30">
                   800 4663 9675
                </a>
                <a href={`mailto:${contact.email}`} className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3">
                   Request Audit
                </a>
              </div>
            </div>
            <Dumbbell className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}

