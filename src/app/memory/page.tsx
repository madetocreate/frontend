'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Legacy Memory Page - Redirect zu V2 Settings
 * Diese Seite wurde durch /settings?tab=memory ersetzt
 */
function MemoryPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryParam = searchParams.get('query')
  
  useEffect(() => {
    // Redirect zu V2 Settings Memory
    const params = new URLSearchParams()
    params.set('tab', 'memory')
    if (queryParam) {
      params.set('q', queryParam)
    }
    router.replace(`/settings?${params.toString()}`)
  }, [queryParam, router])
  
  // Während Redirect: nichts anzeigen
  return null
}

export default function MemoryPage() {
  return (
    <Suspense fallback={null}>
      <MemoryPageContent />
    </Suspense>
  )
}
