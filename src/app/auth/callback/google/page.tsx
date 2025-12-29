'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * DEPRECATED: Control-Plane Auth wird in Beta nicht mehr verwendet.
 * 
 * Google OAuth Callback nutzt noch Control-Plane.
 * In Beta sollte OAuth über Node-Backend laufen:
 * - Node-Backend hat bereits POST /auth/google implementiert
 * - TODO: Redirect-Flow anpassen, um Node-Backend zu nutzen
 * 
 * @deprecated Für Beta: Nutze Node-Backend OAuth-Flow
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setTimeout(() => {
        setError('Google authentication failed')
        setTimeout(() => router.push('/auth/login'), 3000)
      }, 0)
      return
    }

    if (!code) {
      setTimeout(() => {
        setError('No authorization code received')
        setTimeout(() => router.push('/auth/login'), 3000)
      }, 0)
      return
    }

    // Exchange code for token
    const redirect_uri = `${window.location.origin}/auth/callback/google`
    
    fetch(`${API_BASE_URL}/v1/auth/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri })
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Authentication failed')
        }
        return res.json()
      })
      .then((data) => {
        // Store tokens and user data
        login(data.access_token, data.user, data.refresh_token)
        
        // Redirect to home
        router.push('/')
      })
      .catch((err) => {
        setError(err.message || 'Authentication failed')
        setTimeout(() => router.push('/auth/login'), 3000)
      })
  }, [searchParams, router, login])

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
        <div className="w-12 h-12 border-4 ak-spinner rounded-full animate-spin mx-auto mb-4" />
        <p className="ak-text-secondary">Google-Authentifizierung läuft...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 ak-spinner rounded-full animate-spin" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

