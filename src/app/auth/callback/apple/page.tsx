'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * DEPRECATED: Control-Plane Auth wird in Beta nicht mehr verwendet.
 * 
 * Apple OAuth Callback nutzt noch Control-Plane.
 * In Beta sollte OAuth über Node-Backend laufen:
 * - Node-Backend hat bereits POST /auth/apple implementiert
 * - TODO: Redirect-Flow anpassen, um Node-Backend zu nutzen
 * 
 * @deprecated Für Beta: Nutze Node-Backend OAuth-Flow
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

export default function AppleCallbackPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Apple Sign In uses form_post, so we need to handle it differently
    // For now, we'll use a client-side approach with URL parameters
    
    const handleAppleResponse = async () => {
      // Check for id_token in URL hash or query params
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const idToken = params.get('id_token') || new URLSearchParams(window.location.search).get('id_token')
      
      if (!idToken) {
        setError('No Apple token received')
        setTimeout(() => router.push('/auth/login'), 3000)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/login/apple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.detail || 'Authentication failed')
        }

        const data = await response.json()
        
        // Store tokens and user data
        login(data.access_token, data.user, data.refresh_token)
        
        // Redirect to home
        router.push('/')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    handleAppleResponse()
  }, [router, login])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--ak-semantic-danger)] mb-4">❌ {error}</div>
          <p className="ak-text-secondary">Weiterleitung...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--ak-text-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="ak-text-secondary">Apple-Authentifizierung läuft...</p>
      </div>
    </div>
  )
}
