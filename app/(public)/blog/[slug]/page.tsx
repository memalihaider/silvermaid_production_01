'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/${slug}`)
  }, [slug, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500 text-sm">Redirecting…</p>
    </div>
  )
}
