'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getApiBaseUrl } from '@/lib/env'

export default function DevTokenPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      setError('This page is only available in development mode')
      setLoading(false)
      return
    }

    const fetchDevToken = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl()
        const response = await fetch(`${API_BASE_URL}/auth/dev/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: 'aklow-main',
            userId: 'dev-user',
            role: 'tenant_admin'
          })
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.message || data.error || 'Failed to get dev token')
        }

        const data = await response.json()
        setToken(data.token)

        // Automatically set token and user data
        const user = {
          id: data.userId || 'dev-user',
          email: 'dev@aklow.local',
          name: 'Dev User',
          tenantId: data.tenantId || 'aklow-main',
          role: data.role || 'tenant_admin',
          provider: 'email' as const
        }

        login(data.token, user)
        
        // Redirect to home after 1 second
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    fetchDevToken()
  }, [login, router])

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 ak-text-primary">Not Available</h1>
          <p className="ak-text-secondary">This page is only available in development mode.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ak-color-accent)] mx-auto mb-4"></div>
          <p className="ak-text-secondary">Generating dev token...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full ak-alert-danger rounded-lg p-6">
          <h1 className="text-xl font-bold ak-text-danger mb-2">Error</h1>
          <p className="ak-text-danger mb-4">{error}</p>
          <div className="space-y-2 text-sm ak-text-danger">
            <p>💡 Make sure:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The backend server is running on {getApiBaseUrl()}</li>
              <li>You're in development mode (NODE_ENV=development)</li>
              <li>You're accessing from localhost</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 ak-badge-danger rounded hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full ak-alert-success rounded-lg p-6">
        <h1 className="text-xl font-bold ak-text-success mb-2">✅ Dev Token Set!</h1>
        <p className="ak-text-success mb-4">
          You've been automatically logged in with a dev token.
        </p>
        {token && (
          <div className="mb-4">
            <p className="text-sm font-medium ak-text-primary mb-1">Token:</p>
            <code className="text-xs ak-surface-panel p-2 rounded block break-all ak-text-secondary">
              {token.substring(0, 50)}...
            </code>
          </div>
        )}
        <p className="text-sm ak-text-secondary">
          Redirecting to home page...
        </p>
      </div>
    </div>
  )
}

