"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BookingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/book-service")
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <p className="text-slate-600 text-sm">Redirecting to the updated booking experience...</p>
    </div>
  )
}
