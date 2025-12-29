'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EntitlementGuard } from '@/components/guards/EntitlementGuard'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { isMarketingBetaEnabled } from '@/lib/featureFlags'

/**
 * BETA: Marketing Layout Guard
 * 
 * Marketing is currently in BETA and disabled by default.
 * This layout ensures:
 * 1. Beta flag must be enabled (NEXT_PUBLIC_MARKETING_BETA=true)
 * 2. User must have marketing entitlement OR be in DEV mode
 * 
 * If conditions are not met, redirect to /inbox
 */
function MarketingLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { features, isDeveloper } = useFeatureAccess()
  const betaEnabled = isMarketingBetaEnabled()

  useEffect(() => {
    // Check beta flag first
    if (!betaEnabled) {
      router.replace('/inbox')
      return
    }

    // Check entitlement or dev mode
    if (!features.marketing && !isDeveloper) {
      router.replace('/inbox')
      return
    }
  }, [betaEnabled, features.marketing, isDeveloper, router])

  // Don't render if conditions not met (will redirect)
  if (!betaEnabled || (!features.marketing && !isDeveloper)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--ak-color-text-secondary)]">Lade…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)] mx-auto mb-4"></div>
            <p className="text-[var(--ak-color-text-secondary)]">Lade…</p>
          </div>
        </div>
      }
    >
      <EntitlementGuard feature="marketing">
        <MarketingLayoutContent>{children}</MarketingLayoutContent>
      </EntitlementGuard>
    </Suspense>
  )
}

