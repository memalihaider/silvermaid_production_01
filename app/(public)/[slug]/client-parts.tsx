'use client'

import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'

export function AnimatedDiv({ children, className, initial, animate }: {
  children: React.ReactNode
  className?: string
  initial?: Record<string, number>
  animate?: Record<string, number>
}) {
  return (
    <motion.div initial={initial} animate={animate} className={className}>
      {children}
    </motion.div>
  )
}

export function AnimatedArticle({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.article initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={className}>
      {children}
    </motion.article>
  )
}

export function AnimatedAside({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={className}>
      {children}
    </motion.aside>
  )
}

export function ShareButton({ title }: { title: string }) {
  return (
    <button
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title, url: window.location.href })
        }
      }}
      className="p-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all"
    >
      <Share2 className="h-5 w-5" />
    </button>
  )
}
