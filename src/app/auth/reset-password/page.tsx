'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

/**
 * DEPRECATED: Control-Plane Auth wird in Beta nicht mehr verwendet.
 * 
 * Password Reset nutzt noch Control-Plane.
 * TODO: Implementiere Password Reset im Node-Backend
 * 
 * @deprecated Für Beta: Password Reset über Node-Backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'http://localhost:4051'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/password/reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Password reset failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-[var(--ak-semantic-danger)] mb-4">❌ Invalid reset link</div>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-[var(--ak-accent-inbox)] hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-[var(--ak-semantic-success)] mb-4 text-4xl">✅</div>
          <h2 className="text-2xl font-bold ak-text-primary mb-2">Password Reset Successful</h2>
          <p className="ak-text-secondary">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ak-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--ak-accent-inbox)] to-[var(--ak-accent-documents)] rounded-2xl shadow-lg mb-4">
            <LockClosedIcon className="w-10 h-10" style={{ color: 'var(--ak-text-primary-dark)' }} />
          </div>
          <h1 className="text-3xl font-bold ak-text-primary mb-2">Reset Password</h1>
          <p className="ak-text-secondary">Enter your new password</p>
        </div>

        <div className="ak-bg-glass rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium ak-text-primary mb-2">
                New Password
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
                  placeholder="Minimum 8 characters"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium ak-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ak-text-muted" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 ak-border-default rounded-xl ak-focus-ring transition-all"
                  placeholder="Confirm your password"
                />
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
                  Reset Password
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 ak-spinner rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
