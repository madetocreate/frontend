'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated && !AUTH_BYPASS) {
      // Don't redirect if we're already on an auth page
      if (!pathname.startsWith('/auth')) {
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, loading, router, pathname])

  // Show nothing while loading (unless bypass is active)
  if (loading && !AUTH_BYPASS) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--ak-color-bg-app)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]" />
      </div>
    )
  }

  // If not authenticated and not bypassing, don't show children
  if (!isAuthenticated && !AUTH_BYPASS && !pathname.startsWith('/auth')) {
    return null
  }

  return <>{children}</>
}
