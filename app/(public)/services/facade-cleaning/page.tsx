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
  Building2, 
  Play, 
  Sparkles, 
  Droplets, 
  Shield, 
  Search,
  Wind,
  ShieldAlert,
  Flame,
  Fan,
  Activity,
  History,
  TrendingDown,
  Scale,
  Construction,
  Layers,
  Eraser,
  Glasses
} from 'lucide-react'


export default function FacadeCleaning() {
  const { contact } = useContactInfo()
  const categories = [
    {
      title: "Surface Cleaning Systems",
      icon: Layers,
      items: [
        { name: "High-Pressure Washing", desc: "Using advanced water jets to remove deep-seated dirt, mold, and stains from brick, stone, and metal." },
        { name: "Delicate Soft Washing", desc: "Applying pH-balanced solutions for sensitive exteriors to remove algae and grime without abrasion." },
        { name: "Stone & Brick Care", desc: "Specialized treatment for porous surfaces to ensure thorough cleaning without structural damage." },
        { name: "Metal Facade Detailing", desc: "Precision cleaning for aluminum and steel panels to restore original shine and prevent oxidation." }
      ]
    },
    {
      title: "Expert Stain Removal",
      icon: Eraser,
      items: [
        { name: "Graffiti Eradication", desc: "Efficient removal of unwanted markings and paint using non-damaging chemical solvents." },
        { name: "Rust & Mineral Treatment", desc: "Eliminating unsightly rust streaks and white mineral deposits from your building's exterior." },
        { name: "Carbon & Pollution", desc: "Removing black carbon buildup caused by UAE's city traffic and environmental factors." },
        { name: "Bio-Growth Cladding", desc: "Scientific removal of fungal and mildew growth that jeopardizes facade integrity." }
      ]
    },
    {
      title: "Glass & Window Cleaning",
      icon: Glasses,
      items: [
        { name: "Streak-Free Windows", desc: "Precision cleaning of exterior glass, frames, and sills to enhance visibility and aesthetics." },
        { name: "Full Glass Facades", desc: "Deep cleaning for modern glass-walled buildings to ensure a clear, reflective, and spotless finish." },
        { name: "Reach-and-Wash Tech", desc: "Utilizing de-ionized water systems and telescopic poles for safe, smear-free results." },
        { name: "Frame & Seal Care", desc: "Cleaning and checking of window gaskets and frames to prevent dirt accumulation and leaks." }
      ]
    },
    {
      title: "Maintenance & Protection",
      icon: Shield,
      items: [
        { name: "Regular Care Plans", desc: "Customized maintenance schedules to keep your facade looking pristine throughout the year." },
        { name: "longevity Enhancement", desc: "Removing corrosive particles that cause premature aging of your building's materials." },
        { name: "Structural Inspection", desc: "Providing a visual overview of facade health during the cleaning process to catch issues early." },
        { name: "Dubai Weather Proofing", desc: "Removing sand and dust accumulation typical of the UAE desert environment." }
      ]
    },
    {
      title: "Why Choose Facade Experts",
      icon: ShieldCheck,
      items: [
        { name: "Rope Access Mastery", desc: "Our team is highly trained in safe, modern facade access techniques for high-rise assets." },
        { name: "Surgical Attention", desc: "We focus on every nook and cranny, ensuring your facade is uniformly spotless." },
        { name: "Tailored Strategy", desc: "Unique cleaning plans that respect the specific material composition of your building." },
        { name: "Insured & Reliable", desc: "Vetted professionals committed to providing exceptional service with local integrity." }
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
            src="https://images.unsplash.com/photo-1541888941295-1e3c83743aa1?auto=format&fit=crop&q=80&w=1600" 
            alt="Facade Cleaning" 
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
              Exterior Restoration Specialists
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              IMPRESSIVE <br />
              <span className="text-primary italic text-5xl md:text-8xl">BUILDING EXTERIORS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Sparkling Facade Cleaning in UAE – First Impressions That Last
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
                    Pristine Skylines: The <span className="text-primary italic text-3xl md:text-5xl border-b-4 border-primary/20">Master Facade Cleaning Checklist</span>
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed italic">
                    First impressions matter, and a clean facade can make a significant difference. 
                  </p>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    At Silver Maid Cleaning Services LLC, we specialize in professional facade cleaning services to ensure your building’s exterior looks pristine and inviting. Our experienced team uses advanced cleaning techniques and eco-friendly products to remove dirt, grime, and stains, enhancing the appearance and longevity of your building asset in the demanding UAE climate.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary shadow-sm">
                    <p className="text-slate-700 font-bold italic text-sm">
                      "If you're looking to perform Facade Cleaning, here's a practical checklist to keep your home clean and organized efficiently."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                    <Building2 className="h-8 w-8 text-primary" />
                    Our Comprehensive Restoration Services:
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
                    Don’t let dirt and pollution dull your architectural vision. Contact Silver Maid Cleaning Services LLC today for a specialized facade cleaning audit and maintenance plan.
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
                <h4 className="text-2xl font-black mb-8 tracking-tight italic">Exterior Services</h4>
                <div className="space-y-4">
                  {servicesList.map((service, i) => (
                    <a 
                      key={i} 
                      href={`/services/${service.slug}`} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        service.slug === "facade-cleaning" 
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
                  <p className="text-sm font-bold text-primary mb-4 uppercase tracking-[0.2em]">Immediate Service</p>
                  <p className="text-2xl font-black text-white tracking-tighter mb-8 italic leading-tight uppercase tracking-widest">RESTORE YOUR<br />SKYLINE</p>
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
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">Vertical Mastery</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">WATCH OUR HIGH-RISE PROCESS</h3>
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
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The Advantage</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">WHY SILVER MAID FACADE CARE?</h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto italic">“A clean building is a healthy building. We restore beauty to every surface we touch.”</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { 
                title: "Rope Access Expertise", 
                desc: "Our team is highly trained and experienced in vertical facade cleaning, ensuring safe and top-quality results.", 
                icon: Construction 
              },
              { 
                title: "Surface Restoration", 
                desc: "We use advanced high-pressure and soft washing techniques to remove stubborn UAE dust and pollution.", 
                icon: Droplets 
              },
              { 
                title: "Attention to Detail", 
                desc: "We focus on every nook and cranny, ensuring your facade is spotless from the roofline to the lobby.", 
                icon: Search 
              },
              { 
                title: "Customized Strategy", 
                desc: "We tailor our services to meet your specific building material and height requirements with precision.", 
                icon: ShieldCheck 
              },
              { 
                title: "Insured & Reliable", 
                desc: "Our team is vetted, insured, and committed to providing exceptional service with vertical integrity.", 
                icon: Scale 
              },
              { 
                title: "Asset Longevity", 
                desc: "Regular cleaning prevents the corrosive effects of salt and sand, protecting your building's long-term value.", 
                icon: Shield 
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
                RESTORE YOUR BUILDING'S GLORY{"\n"}
                <span className="text-primary italic text-3xl md:text-5xl uppercase">WITH VERTICAL PRECISION</span>
              </h4>
              <p className="text-slate-400 text-lg mb-10 font-bold max-w-2xl mx-auto">
                Ready for a skyline transformation? Contact us today for a free facade assessment.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href={`tel:${contact.phone}`} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all flex items-center gap-3 shadow-2xl shadow-primary/40">
                   800 4663 9675
                </a>
                <a href={`mailto:${contact.email}`} className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3">
                   Request Audit
                </a>
              </div>
            </div>
            <Building2 className="absolute -bottom-10 -left-10 h-64 w-64 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}

