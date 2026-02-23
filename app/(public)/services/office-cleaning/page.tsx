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
  Sparkles, 
  Users, 
  Monitor, 
  Presentation, 
  Bath, 
  Soup,
  Play
} from 'lucide-react'


export default function OfficeCleaning() {
  const { contact } = useContactInfo()
  const servicesList = [
    { name: "Regular Residential cleaning", slug: "residential-cleaning" },
    { name: "Regular Office cleaning", slug: "office-cleaning" },
    { name: "Floor deep cleaning", slug: "floor-deep-cleaning" },
    { name: "Window cleaning", slug: "window-cleaning" },
    { name: "Balcony Deep Cleaning", slug: "balcony-deep-cleaning" },
    { name: "Sofa Deep Cleaning", slug: "sofa-deep-cleaning" },
    { name: "Carpets Deep Cleaning", slug: "carpets-deep-cleaning" },
    { name: "Mattress Deep Cleaning", slug: "mattress-deep-cleaning" }
  ]

  const categories = [
    {
      title: "Common Areas",
      icon: Users,
      items: [
        { name: "Reception and Lobby", desc: "Dusting of surfaces, cleaning reception desks, and maintaining a clean and welcoming entrance area." },
        { name: "Floors", desc: "Vacuuming carpets, sweeping, and mopping hard floors to remove dirt and maintain a pristine appearance." },
        { name: "Glass and Windows", desc: "Cleaning windows, glass doors, and partitions for a streak-free finish." }
      ]
    },
    {
      title: "Workspaces",
      icon: Monitor,
      items: [
        { name: "Desk Cleaning", desc: "Wiping down and sanitizing desks, chairs, and workstations to ensure a healthy workspace." },
        { name: "Electronics", desc: "Dusting and cleaning monitors, keyboards, and other electronic devices." },
        { name: "Cubicles", desc: "Dusting and cleaning cubicle walls and surfaces." }
      ]
    },
    {
      title: "Meeting Rooms",
      icon: Presentation,
      items: [
        { name: "Table and Chair Cleaning", desc: "Wiping down and sanitizing meeting room tables and chairs." },
        { name: "Whiteboards and AV Equipment", desc: "Cleaning and maintaining whiteboards, projectors, and other audiovisual equipment." },
        { name: "Floor Cleaning", desc: "Vacuuming and mopping meeting room floors to ensure a clean environment for presentations." }
      ]
    },
    {
      title: "Restrooms",
      icon: Bath,
      items: [
        { name: "Sanitizing Fixtures", desc: "Cleaning and sanitizing toilets, sinks, and countertops to maintain a hygienic restroom." },
        { name: "Mirror and Surface Cleaning", desc: "Cleaning mirrors and other surfaces." },
        { name: "Restocking Supplies", desc: "Ensuring restrooms are stocked with soap, paper towels, and toilet paper." },
        { name: "Floor Cleaning", desc: "Mopping and scrubbing restroom floors to remove dirt and bacteria." }
      ]
    },
    {
      title: "Kitchen and Break Rooms",
      icon: Soup,
      items: [
        { name: "Countertops and Surfaces", desc: "Scrubbing and sanitizing countertops, tables, and other surfaces." },
        { name: "Appliance Cleaning", desc: "Cleaning the exterior of kitchen appliances, including microwaves and coffee machines." },
        { name: "Sink and Faucet Cleaning", desc: "Descaling and sanitizing sinks and faucets." },
        { name: "Floor Cleaning", desc: "Vacuuming and mopping kitchen and break room floors to maintain cleanliness." }
      ]
    }
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600" 
            alt="Office Cleaning" 
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
              Normal Cleaning Services
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              REGULAR <br />
              <span className="text-primary italic">OFFICE</span> CLEANING
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Transform Your Office with UAE's Expert Office Deep Cleaning Services
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
                    A clean and organized office environment is essential for productivity and employee well-being. At Silver Maid Cleaning Services LLC, we offer reliable and comprehensive regular office cleaning services tailored to your specific needs. Our experienced team uses advanced cleaning techniques and eco-friendly products to ensure your office space stays spotless and professional.
                  </p>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-slate-700 font-bold italic">
                      "Regular office cleaning ensures a professional and productive environment while maintaining hygiene and safety. Here's a comprehensive checklist for daily, weekly, and monthly cleaning tasks."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    OUR OFFICE CLEANING SERVICES INCLUDE:
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
                <h4 className="text-2xl font-black mb-8 tracking-tight italic">Other Services</h4>
                <div className="space-y-4">
                  {servicesList.map((service, i) => (
                    <a 
                      key={i} 
                      href={`/services/${service.slug}`} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        service.slug === "office-cleaning" 
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
                  <p className="text-4xl font-black text-primary tracking-tighter mb-8 italic">Contact Us</p>
                  <a href="/book-service" className="w-full bg-white text-slate-900 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white transition-all inline-block">
                    Custom Quote
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

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The Advantage</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">WHY CHOOSE US?</h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto">Providing reliable, professional results for businesses across the UAE.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Expertise", 
                desc: "Our team is highly trained and experienced in office cleaning, ensuring top-quality results.", 
                icon: ShieldCheck 
              },
              { 
                title: "Eco-Friendly", 
                desc: "We use environmentally friendly products to ensure a safe and healthy work environment.", 
                icon: Zap 
              },
              { 
                title: "Attention to Detail", 
                desc: "We focus on every nook and cranny, ensuring your office is spotless and well-maintained.", 
                icon: Building2 
              },
              { 
                title: "Customized Plans", 
                desc: "We tailor our services to meet your specific needs and preferences, offering personalized cleaning plans.", 
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
              <h4 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">Ready For A <span className="text-primary italic">Professional Workspace?</span></h4>
              <p className="text-slate-400 text-lg mb-10 font-bold">Contact us today for a corporate cleaning experience you can trust.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href={`tel:${contact.phone}`} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all flex items-center gap-3">
                   800 4663 9675
                </a>
                <a href={`mailto:${contact.email}`} className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3">
                   Email Us
                </a>
              </div>
            </div>
            <Sparkles className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
   
