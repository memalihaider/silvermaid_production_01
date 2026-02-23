"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { MessageCircle, Phone, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Quote() {
  const [profileData, setProfileData] = useState({
    email: 'info@silvermaid.ae',
    phone: '80046639675',
    whatsapp: '+971 50 717 7059' // Default WhatsApp number
  })

  // Fetch profile data from Firebase
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const docRef = doc(db, 'profile-setting', 'admin-settings')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.profile) {
            setProfileData({
              email: data.profile.email || 'info@silvermaid.ae',
              phone: data.profile.phone || '80046639675',
              whatsapp: data.profile.whatsapp || '+971 50 717 7059' // Fetch WhatsApp from Firebase
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [])

  return (
    <div className="flex flex-col overflow-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-linear-to-r from-primary via-pink-600 to-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest">Quick Quote Request</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              GET YOUR FREE QUOTE
            </h1>

            <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">
              Connect with our team instantly to get a personalized quote for your cleaning needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* WhatsApp */}
            <motion.a
              href={`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group p-10 bg-gradient-to-br from-slate-50 to-white rounded-[3rem] border-2 border-slate-100 hover:border-primary hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-[#25D366] text-white flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.006c-1.795 0-3.588.474-5.148 1.37l-.369.221-3.823.954.972-3.855.235-.374A8.871 8.871 0 015.051 2.054 8.916 8.916 0 0113.997 10.5c0 2.408-.937 4.671-2.639 6.373s-3.965 2.639-6.373 2.639"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">WhatsApp</h3>
              <p className="text-slate-600 font-medium mb-6">Instant messaging for quick responses</p>
              <div className="inline-flex items-center gap-2 text-[#25D366] font-black uppercase text-sm tracking-widest">
                {profileData.whatsapp} <ArrowRight className="h-4 w-4" />
              </div>
            </motion.a>

            {/* Phone */}
            <motion.a
              href={`tel:${profileData.phone}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-10 bg-gradient-to-br from-slate-50 to-white rounded-[3rem] border-2 border-slate-100 hover:border-primary hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg group-hover:bg-primary">
                <Phone className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Phone</h3>
              <p className="text-slate-600 font-medium mb-6">Speak with a specialist directly</p>
              <div className="inline-flex items-center gap-2 text-slate-900 font-black uppercase text-sm tracking-widest group-hover:text-primary transition-colors">
                {profileData.phone} <ArrowRight className="h-4 w-4" />
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href={`mailto:${profileData.email}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-10 bg-gradient-to-br from-slate-50 to-white rounded-[3rem] border-2 border-slate-100 hover:border-primary hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <Mail className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Email</h3>
              <p className="text-slate-600 font-medium mb-6">Detailed inquiry with attachments</p>
              <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-sm tracking-widest">
                {profileData.email} <ArrowRight className="h-4 w-4" />
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Why Get a Quote?</h2>
            <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">Understand exactly what you'll pay before we start</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                title: "Custom Pricing",
                desc: "Tailored to your specific cleaning needs and property size"
              },
              {
                title: "No Hidden Charges",
                desc: "Transparent pricing with all fees clearly outlined upfront"
              },
              {
                title: "Quick Turnaround",
                desc: "Get your quote in under 24 hours via your preferred channel"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <div className="h-8 w-8 rounded-full bg-primary" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Ready to Get Started?</h2>
            <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
              Choose your preferred method above to connect with our team instantly
            </p>
            <motion.a
              href={`https://wa.me/${profileData.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-12 py-6 bg-[#25D366] text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
              whileHover={{ y: -2 }}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.006c-1.795 0-3.588.474-5.148 1.37l-.369.221-3.823.954.972-3.855.235-.374A8.871 8.871 0 015.051 2.054 8.916 8.916 0 0113.997 10.5c0 2.408-.937 4.671-2.639 6.373s-3.965 2.639-6.373 2.639"/>
              </svg>
              Get Quote via WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}