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

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

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
      const endpoint = mode === 'login' 
        ? `${API_BASE_URL}/v1/auth/login/email`
        : `${API_BASE_URL}/v1/auth/signup/email`
      
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
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/google/authorize`)
      const data = await response.json()
      window.location.href = data.auth_url
    } catch {
      setError('Failed to initiate Google login')
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/microsoft/authorize`)
      const data = await response.json()
      window.location.href = data.auth_url
    } catch {
      setError('Failed to initiate Microsoft login')
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/apple/authorize`)
      const data = await response.json()
      window.location.href = data.auth_url
    } catch {
      setError('Failed to initiate Apple login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Melden Sie sich an, um fortzufahren' 
              : 'Erstellen Sie ein Konto, um zu beginnen'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl p-8">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">oder</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ihr Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={mode === 'login' ? 'Ihr Passwort' : 'Mindestens 8 Zeichen'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {mode === 'login' ? (
                  <>Noch kein Konto? <span className="text-blue-600">Jetzt registrieren</span></>
                ) : (
                  <>Bereits ein Konto? <span className="text-blue-600">Jetzt anmelden</span></>
                )}
              </button>
            </div>
            {mode === 'login' && (
              <div className="text-center">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Passwort vergessen?
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Durch die Anmeldung stimmen Sie unseren{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Nutzungsbedingungen
            </Link>{' '}
            und der{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Datenschutzerklärung
            </Link>{' '}
            zu.
          </p>
        </div>
      </div>
    </div>
  )
}

