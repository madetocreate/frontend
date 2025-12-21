'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RealEstatePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to Dashboard Pro
    router.push('/')
    // Dispatch event to open dashboard module
    window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'dashboard' } }))
  }, [router])

  return <div className="p-8">Weiterleitung zum Dashboard Pro...</div>
}
