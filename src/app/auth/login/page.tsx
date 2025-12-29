'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

import { getApiBaseUrl } from '@/lib/env'

// Node Backend is the source of truth for auth
const API_BASE_URL = getApiBaseUrl()

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Node Backend is the source of truth for auth
      const endpoint = mode === 'login' 
        ? `${API_BASE_URL}/auth/login`
        : `${API_BASE_URL}/auth/signup`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(mode === 'signup' && name ? { name } : {})
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || data.error || 'Anmeldung fehlgeschlagen')
      }

      const data = await response.json()
      
      // Node Backend returns: { token, user: { id, email, name, tenantId, role } }
      const user = {
        id: data.user?.id || data.userId || email.split('@')[0],
        email: data.user?.email || email,
        name: data.user?.name || name || email.split('@')[0],
        tenantId: data.user?.tenantId || data.tenantId,
        role: data.user?.role || data.role || 'tenant_user',
        provider: 'email' as const
      }
      
      // Store token and user data
      login(data.token || data.access_token, user, data.refresh_token)
      
      // Redirect to home
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    // OAuth kommt bald
    return
  }

  const handleMicrosoftLogin = async () => {
    // OAuth kommt bald
    return
  }

  const handleAppleLogin = async () => {
    // OAuth kommt bald
    return
  }

  return (
    <div className="min-h-screen ak-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10" style={{ color: 'var(--ak-text-primary-dark)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold ak-text-primary mb-2">
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="ak-text-secondary">
            {mode === 'login' 
              ? 'Melde dich an, um fortzufahren' 
              : 'Erstelle ein Konto, um loszulegen'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="ak-bg-glass rounded-3xl shadow-2xl p-8">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={true}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 ak-surface-1 border-2 ak-border-default rounded-xl hover:ak-border-strong hover:ak-shadow-1 transition-all duration-200 font-medium ak-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Mit Google {mode === 'login' ? 'anmelden' : 'registrieren'}
            </button>

            <button
              onClick={handleMicrosoftLogin}
              disabled={true}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 ak-surface-1 border-2 ak-border-default rounded-xl hover:ak-border-strong hover:ak-shadow-1 transition-all duration-200 font-medium ak-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                <path d="M0 0h11.377v11.372H0z" fill="#f25022"/>
                <path d="M12.623 0H24v11.372H12.623z" fill="#00a4ef"/>
                <path d="M0 12.628h11.377V24H0z" fill="#7fba00"/>
                <path d="M12.623 12.628H24V24H12.623z" fill="#ffb900"/>
              </svg>
              Mit Microsoft {mode === 'login' ? 'anmelden' : 'registrieren'}
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={true}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[var(--ak-color-graphite-base)] rounded-xl hover:brightness-90 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--ak-color-graphite-text)' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Mit Apple {mode === 'login' ? 'anmelden' : 'registrieren'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t ak-border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 ak-surface-1 ak-text-muted">oder</span>
            </div>
          </div>

          {/* OAuth Coming Soon Hint */}
          <div className="mb-4 text-xs text-center ak-text-muted">
            OAuth (Google/Microsoft/Apple) kommt bald – nutze vorerst E-Mail & Passwort.
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium ak-text-primary mb-2">
                  Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 ak-border-default rounded-xl ak-focus-ring transition-all"
                    placeholder="Dein Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium ak-text-primary mb-2">
                E-Mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ak-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 ak-border-default rounded-xl ak-focus-ring transition-all"
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium ak-text-primary mb-2">
                Passwort
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ak-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 ak-border-default rounded-xl ak-focus-ring transition-all"
                  placeholder={mode === 'login' ? 'Dein Passwort' : 'Mindestens 8 Zeichen'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 ak-text-muted hover:ak-text-secondary"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 ak-alert-danger rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] rounded-xl hover:brightness-110 transition-all duration-200 font-medium shadow-lg ak-shadow-color-accent-inbox-30 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--ak-text-primary-dark)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--ak-surface-1)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setError(null)
                }}
                className="text-sm ak-text-secondary hover:ak-text-primary font-medium"
              >
                {mode === 'login' ? (
                  <>Noch kein Konto? <span className="text-[var(--ak-accent-inbox)]">Jetzt registrieren</span></>
                ) : (
                  <>Bereits ein Konto? <span className="text-[var(--ak-accent-inbox)]">Jetzt anmelden</span></>
                )}
              </button>
            </div>
            {mode === 'login' && (
              <div className="text-center">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-[var(--ak-accent-inbox)] hover:brightness-110 font-medium"
                >
                  Passwort vergessen?
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm ak-text-muted">
          <p>
            Durch die Anmeldung stimmst du unseren{' '}
            <Link href="/terms" className="text-[var(--ak-accent-inbox)] hover:underline">
              Nutzungsbedingungen
            </Link>{' '}
            und der{' '}
            <Link href="/privacy" className="text-[var(--ak-accent-inbox)] hover:underline">
              Datenschutzerklärung
            </Link>{' '}
            zu.
          </p>
        </div>
      </div>
    </div>
  )
}

