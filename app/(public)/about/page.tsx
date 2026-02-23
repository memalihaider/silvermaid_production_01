"use client"

import { CheckCircle2, Users, Award, Leaf, Target, Eye, Heart, Sparkles, ShieldCheck, Zap, ArrowRight, History, Building2 } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section ref={ref} className="relative py-32 bg-slate-950 text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0 opacity-40 shrink-0"
          style={{ y: heroY }}
        >
          <img 
            src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1600" 
            alt="About Us Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-transparent to-slate-950" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              Establish Since 2004
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              THE STORY OF <br />
              <span className="text-primary italic">SILVER MAID</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
              A brainchild of the parent company E-Movers, dedicated to delivering meticulously clean environments pre and post-move.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Legacy & E-Movers Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 text-primary">
                <History className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-widest">Our Heritage</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Built on 20+ Years of <br />
                <span className="text-primary italic">Relocation Excellence</span>
              </h2>
              <div className="space-y-6 text-slate-600 text-lg font-medium leading-relaxed">
                <p>
                  Silver Maid is a brainchild of the parent company <span className="text-slate-900 font-bold">E-Movers</span>, who have been in the relocation and moving business for 20+ years. Over the years, E-Movers has seen the need for cleaning services across homes and offices pre and post-moving.
                </p>
                <p>
                  In addition, with COVID-19 in the mist, there has been an increasing need for sanitization and deep cleaning services. We jumped into action to provide the UAE with a hygiene partner they can trust.
                </p>
                <p>
                  Through the years, we have mastered the smartest and most innovative cleaning techniques that provide our customers the ultimate cleaning service. Just like our parent company, we aim to provide <span className="text-primary font-bold">no stress and guarantee no mess</span>.
                </p>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} src={`https://randomuser.me/api/portraits/thumb/men/${i+10}.jpg`} className="h-12 w-12 rounded-full border-4 border-white shadow-lg" alt="Team" />
                  ))}
                </div>
                <div className="text-sm font-black text-slate-400">
                  JOINED BY <span className="text-slate-900">250+ EXPERTS</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden shadow-3xl group"
            >
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000" 
                alt="Professional Cleaning Team" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-10 bottom-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/30">20+</div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-none">Years Service</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 underline decoration-primary decoration-2">Parent legacy</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Horizontal Cards */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="group p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="h-20 w-20 rounded-3xl bg-pink-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 shadow-lg">
                <Eye className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Our Vision</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  To be the first choice for customers, employees and suppliers in the region we operate.
                </p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="group p-12 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-8 items-start text-white"
            >
              <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-all duration-500 shrink-0 shadow-lg shadow-primary/30">
                <Target className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Our Mission</h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  To provide reliable, flexible and consistent solutions to our internal and external stakeholders in our hygiene business.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-0 right-0 text-[20rem] font-black text-slate-50 select-none pointer-events-none -mr-40 leading-none">
          VALUES
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em] mb-4">The DNA of Silver Maid</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">OUR CORE VALUES</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Honouring our words", desc: "We honor our commitments and keep our promises consistently.", icon: ShieldCheck },
              { title: "Trust", desc: "Building trust through transparency and reliable service.", icon: Zap },
              { title: "Reliability", desc: "Dependable and consistent performance in everything we do.", icon: Heart },
              { title: "Long term approach", desc: "Building lasting relationships with our stakeholders.", icon: Award }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
                  <value.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{value.title}</h4>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Closing Section */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                READY FOR THE <br />
                <span className="text-primary italic">SILVER MAID EXPERIENCE?</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Office</div>
                    <div className="text-lg font-bold">Al Quoz - Dubai - United Arab Emirates</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toll Free</div>
                    <div className="text-lg font-bold">800 4663 9675</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Support</div>
                    <div className="text-lg font-bold">info@silvermaid.ae</div>
                  </div>
                </div>
              </div>
              
              <motion.a 
                href="/contact"
                className="inline-flex items-center gap-4 bg-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-pink-600 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Reach Out To Us <ArrowRight className="h-5 w-5" />
              </motion.a>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full" />
              <div className="bg-slate-900 border border-white/10 p-12 rounded-[4rem] relative z-10">
                <h4 className="text-2xl font-black mb-8 tracking-tighter">CLEANING SERVICES</h4>
                <div className="space-y-6">
                  {[
                    "Normal Cleaning",
                    "Deep Cleaning",
                    "Technical Cleaning",
                    "Commercial Hygiene",
                    "Sanitization Services"
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-4 last:border-0 overflow-hidden">
                      <span className="text-slate-400 font-bold group-hover:text-white transition-colors">{service}</span>
                      <ArrowRight className="h-5 w-5 text-primary -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
