'use client'

import Link from 'next/link'
import { Lock, ArrowLeft, Sparkles } from 'lucide-react'

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center space-y-10 max-w-lg">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-28 w-28 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <Lock className="h-14 w-14 text-primary" />
            </div>
            <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <span className="inline-block px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-[0.35em] text-primary backdrop-blur-md">
          Coming Soon
        </span>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
            This Page Is<br />
            <span className="text-primary italic">Under Construction</span>
          </h1>
          <p className="text-slate-400 font-bold text-base leading-relaxed">
            We are working hard to bring you this service page. <br className="hidden sm:block" />
            Check back soon for the full experience!
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-600 font-black uppercase tracking-widest">Silver Maid</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/services"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4" />
            All Services
          </Link>
          <Link
            href="/book-service"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-600 transition-all shadow-2xl shadow-primary/30 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  )
}


