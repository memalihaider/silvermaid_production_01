"use client"

import { ReactNode, useState, useEffect } from 'react'
import { 
  Phone, Mail, Facebook, Linkedin, Instagram, MessageCircle, ChevronDown,
  Home, Briefcase, Maximize, Sun, Sofa, Layers, Bed, 
  Wind, Grid3X3, Warehouse, CookingPot, HardHat, Building, Truck, Brush,
  Fan, Pipette, Utensils, Waves, Dumbbell, PanelTop, ThermometerSnowflake,
  Star, HelpCircle, ShieldCheck, Music2, Send, MapPin, ArrowRight
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState({
    phone: '80046639675',
    email: 'services@homeworkuae.com',
    company: 'homeware'
  })
  const [isLoading, setIsLoading] = useState(true)

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
              phone: data.profile.phone || '80046639675',
              email: data.profile.email || 'services@homeworkuae.com',
              company: data.profile.company || 'homeware'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
        // Keep default values if Firebase fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300">
      {/* Top Bar - Enhanced */}
      <div className="bg-gradient-to-r from-primary via-primary to-pink-700 text-white py-3 hidden md:block border-b border-white/10">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-8">
            <a 
              href={`tel:${profileData.phone}`} 
              className="flex items-center gap-2 hover:text-white/90 transition-all group"
            >
              <div className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span className="tracking-wider">{profileData.phone}</span>
            </a>
            <a 
              href={`mailto:${profileData.email}`} 
              className="flex items-center gap-2 hover:text-white/90 transition-all group"
            >
              <div className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <span className="tracking-wide">{profileData.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-[10px] uppercase tracking-widest mr-2">Follow Us</span>
            <a href="#" className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href="#" className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><MessageCircle className="h-3.5 w-3.5" /></a>
            <a href="#" className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"><Music2 className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Main Navbar - Enhanced */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-pink-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              H
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">HOMEWORK</span>
              <span className="text-[11px] font-black tracking-[0.25em] text-primary leading-none mt-1.5">UAE CLEANING</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center space-x-1 text-sm font-bold">
            <a href="/" className="px-4 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">Home</a>
            <a href="/about" className="px-4 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">About</a>
            <div className="relative group py-8">
              <a href="/services" className="px-4 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all flex items-center gap-1.5">
                Services <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
              </a>
              
              {/* Dropdown Menu - Mega Menu Style Enhanced */}
              <div className="absolute top-full -left-80 w-275 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 rounded-[2.5rem] p-12 opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 z-50">
                <div className="grid grid-cols-3 gap-10">
                  {/* Normal Cleaning Section */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3 pb-3 border-b-2 border-primary/20">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      Normal Cleaning
                    </h4>
                    <div className="grid gap-1">
                      {[
                        { name: "Regular Residential", href: "/services/residential-cleaning", icon: Home },
                        { name: "Regular Office", href: "/services/office-cleaning", icon: Briefcase },
                        { name: "Window cleaning", href: "/services/window-cleaning", icon: Maximize },
                        { name: "Balcony Cleaning", href: "/services/balcony-deep-cleaning", icon: Sun },
                        { name: "Sofa Cleaning", href: "/services/sofa-deep-cleaning", icon: Sofa },
                        { name: "Carpets Cleaning", href: "/services/carpets-deep-cleaning", icon: Layers },
                        { name: "Mattress Cleaning", href: "/services/mattress-deep-cleaning", icon: Bed }
                      ].map((item) => (
                        <a 
                          key={item.href} 
                          href={item.href}
                          className="group/item flex items-center gap-3 text-[13px] font-bold text-slate-600 hover:text-primary transition-all py-1 px-2 rounded-xl hover:bg-slate-50"
                        >
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Deep Cleaning Section */}
                  <div>
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="h-1 w-6 bg-primary rounded-full" />
                      Deep Cleaning
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { name: "Grout Deep Clean", href: "/services/grout-deep-cleaning", icon: Grid3X3 },
                        { name: "Garage Deep Clean", href: "/services/garage-deep-cleaning", icon: Warehouse },
                        { name: "Kitchen Deep Clean", href: "/services/kitchen-deep-cleaning", icon: CookingPot },
                        { name: "Post Construction", href: "/services/post-construction-cleaning", icon: HardHat },
                        { name: "Office Deep Clean", href: "/services/office-deep-cleaning", icon: Briefcase },
                        { name: "Apartment Deep", href: "/services/apartment-deep-cleaning", icon: Building },
                        { name: "Move In/Out", href: "/services/move-in-out-cleaning", icon: Truck },
                        { name: "Villa Deep Clean", href: "/services/villa-deep-cleaning", icon: Home },
                        { name: "Mattress Deep", href: "/services/mattress-deep-cleaning", icon: Bed },
                        { name: "Carpets Deep", href: "/services/carpets-deep-cleaning", icon: Layers },
                        { name: "Sofa Deep Clean", href: "/services/sofa-deep-cleaning", icon: Sofa },
                        { name: "Balcony Deep", href: "/services/balcony-deep-cleaning", icon: Sun },
                        { name: "Window cleaning", href: "/services/window-cleaning", icon: Maximize },
                        { name: "Floor Deep Clean", href: "/services/floor-deep-cleaning", icon: Brush }
                      ].map((item) => (
                        <a 
                          key={item.href} 
                          href={item.href}
                          className="group/item flex items-center gap-3 text-[13px] font-bold text-slate-600 hover:text-primary transition-all py-1 px-2 rounded-xl hover:bg-slate-50"
                        >
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Technical Cleaning Section */}
                  <div>
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <span className="h-1 w-6 bg-primary rounded-full" />
                      Technical Cleaning
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { name: "AC Duct Cleaning", href: "/services/ac-duct-cleaning", icon: Wind },
                        { name: "AC Coil Cleaning", href: "/services/ac-coil-cleaning", icon: ThermometerSnowflake },
                        { name: "Kitchen Hood Clean", href: "/services/kitchen-hood-cleaning", icon: Fan },
                        { name: "Grease Trap Clean", href: "/services/grease-trap-cleaning", icon: Pipette },
                        { name: "Restaurant Clean", href: "/services/restaurant-cleaning", icon: Utensils },
                        { name: "Water Tank Clean", href: "/services/water-tank-cleaning", icon: Waves },
                        { name: "Swimming Pool", href: "/services/swimming-pool-cleaning", icon: Waves },
                        { name: "Gym Deep Clean", href: "/services/gym-deep-cleaning", icon: Dumbbell },
                        { name: "Facade Cleaning", href: "/services/facade-cleaning", icon: PanelTop }
                      ].map((item) => (
                        <a 
                          key={item.href} 
                          href={item.href}
                          className="group/item flex items-center gap-3 text-[13px] font-bold text-slate-600 hover:text-primary transition-all py-1 px-2 rounded-xl hover:bg-slate-50"
                        >
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* More Link with Mega Dropdown */}
            <div className="relative group py-4">
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all group">
                More <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute top-full -left-20 w-100 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 rounded-[2rem] p-10 opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 z-50">
                <div className="grid gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-3 pb-3 border-b-2 border-primary/20">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    Resources
                  </h4>
                  
                  {[
                    { name: "Testimonials", href: "/testimonials", icon: Star, desc: "See what our premium clients say" },
                    { name: "FAQs", href: "/faqs", icon: HelpCircle, desc: "Common questions answered" },
                    { name: "Privacy Policy", href: "/privacy-policy", icon: ShieldCheck, desc: "How we protect your data" }
                  ].map((item) => (
                    <a 
                      key={item.href} 
                      href={item.href}
                      className="group/item flex items-center gap-4 text-sm font-bold text-slate-600 hover:text-primary transition-all p-3 rounded-2xl hover:bg-slate-50"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 group-hover/item:text-primary transition-colors">{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="/blog" className="px-4 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all font-bold text-sm">Blog</a>
            <a href="/contact" className="px-4 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-all font-bold text-sm">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="/book-service" 
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-pink-700 px-8 text-sm font-black text-white shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95 tracking-wider border-2 border-white/20"
            >
              BOOK NOW
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary underline decoration-primary/20 underline-offset-8">Contact Us</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-4 group cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="group-hover:text-white transition-colors uppercase leading-relaxed font-bold text-[11px] tracking-tight">Office: 201, 2nd Floor, Al Saaha Offices - B, Downtown Dubai - UAE</span>
                </li>
                <li className="flex items-start gap-4 group cursor-pointer">
                   <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-lg">
                    <Phone className="h-4 w-4" />
                  </div>
                  <a href={`tel:${profileData.phone}`} className="group-hover:text-white transition-colors">{profileData.phone}</a>
                </li>
                <li className="flex items-start gap-4 group cursor-pointer">
                   <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 shadow-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <a href={`mailto:${profileData.email}`} className="group-hover:text-white transition-colors">{profileData.email}</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary underline decoration-primary/20 underline-offset-8">Cleaning Services</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="/services/residential-cleaning" className="hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Normal Cleaning</a></li>
                <li><a href="/services/villa-deep-cleaning" className="hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Deep Cleaning</a></li>
                <li><a href="/services/ac-duct-cleaning" className="hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ArrowRight className="h-3 w-3" /> Technical Cleaning</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary underline decoration-primary/20 underline-offset-8">Quick Links</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="/" className="hover:text-white transition-colors flex items-center gap-2">Home</a></li>
                <li><a href="/about" className="hover:text-white transition-colors flex items-center gap-2">About us</a></li>
                <li><a href="/testimonials" className="hover:text-white transition-colors flex items-center gap-2">Testimonials</a></li>
                <li><a href="/faqs" className="hover:text-white transition-colors flex items-center gap-2">FAQs</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-2">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors flex items-center gap-2">Contact us</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary underline decoration-primary/20 underline-offset-8">Newsletter</h4>
              <p className="text-slate-400 text-sm italic font-medium">Subscribe our newsletter for latest updates</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="and updates to your email…" 
                  className="w-full bg-slate-800 border-none rounded-2xl py-5 px-6 text-xs font-bold focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-500 shadow-inner"
                />
                <button className="absolute right-2 top-2 h-11 w-11 bg-primary rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all shadow-lg hover:scale-110">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Copyright ©2024 Home Work Uae</p>
            <div className="flex items-center gap-6">
              <a href="#" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 shadow-lg group">
                <Facebook className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="#" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 shadow-lg group">
                <Instagram className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="#" className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all hover:scale-110 shadow-lg group">
                <Music2 className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </a>
              <a href="/contact" className="ml-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors border-l border-white/10 pl-10 h-12 flex items-center">Contact us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons - Enhanced Design */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
        {/* WhatsApp Button - Primary with Pulse */}
        <a 
          href="https://wa.me/971507177059" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto group relative"
        >
          {/* Pulsing background ring */}
          <div className="absolute inset-0 h-20 w-20 rounded-full bg-[#25D366] opacity-0 group-hover:opacity-20 animate-ping" />
          
          {/* Main button */}
          <div className="relative h-16 w-16 bg-[#25D366] text-white rounded-full shadow-[0_8px_32px_rgba(37,211,102,0.35)] flex items-center justify-center hover:scale-110 transition-transform duration-300 border-4 border-white hover:shadow-[0_12px_48px_rgba(37,211,102,0.5)]">
            {/* WhatsApp SVG Icon */}
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.006c-1.795 0-3.588.474-5.148 1.37l-.369.221-3.823.954.972-3.855.235-.374A8.871 8.871 0 015.051 2.054 8.916 8.916 0 0113.997 10.5c0 2.408-.937 4.671-2.639 6.373s-3.965 2.639-6.373 2.639"/>
            </svg>
            
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black animate-pulse">
              !</div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute -left-48 bottom-2 px-4 py-3 bg-[#25D366] text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/20 md:block hidden">
            💬 Chat on WhatsApp
          </div>
        </a>
        
        {/* Phone Button - Secondary */}
        <a 
          href={`tel:${profileData.phone}`} 
          className="pointer-events-auto group relative"
        >
          {/* Main button */}
          <div className="h-14 w-14 bg-slate-900 text-white rounded-full shadow-[0_6px_24px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-primary hover:scale-105 transition-all duration-300 border-3 border-white/10 hover:border-white hover:shadow-[0_10px_32px_rgba(219,39,119,0.4)]">
            <Phone className="h-6 w-6" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute -left-44 bottom-0 px-4 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-white/10 md:block hidden">
            📞 Call: {profileData.phone}
          </div>
        </a>

        {/* Email Button - Tertiary */}
        <a 
          href={`mailto:${profileData.email}`} 
          className="pointer-events-auto group relative"
        >
          {/* Main button */}
          <div className="h-12 w-12 bg-primary text-white rounded-full shadow-[0_4px_16px_rgba(219,39,119,0.25)] flex items-center justify-center hover:scale-105 transition-all duration-300 border-2 border-white/5 hover:border-white hover:shadow-[0_8px_24px_rgba(219,39,119,0.35)]">
            <Mail className="h-5 w-5" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute -left-40 -bottom-1 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/10 md:block hidden">
            ✉ Email Us
          </div>
        </a>
      </div>
    </div>
  )
}