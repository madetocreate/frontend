'use client'

import { useRouter } from 'next/navigation'
import { useEntitlements } from '@/hooks/useEntitlements'
import type { ModuleId } from '@/lib/entitlements/modules'
import { MODULE_LABELS } from '@/lib/entitlements/modules'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'

interface EntitlementGuardProps {
  feature: ModuleId
  children: React.ReactNode
  redirectTo?: string
}

export function EntitlementGuard({ feature, children, redirectTo = '/' }: EntitlementGuardProps) {
  const { isEntitled, isLoading } = useEntitlements()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--ak-color-text-secondary)]">Lade…</p>
        </div>
      </div>
    )
  }

  if (!isEntitled(feature)) {
    // Show locked UI instead of redirecting
    const moduleName = MODULE_LABELS[feature] || feature
    
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <div className="p-6 border border-[var(--ak-color-border-subtle)] rounded-xl bg-[var(--ak-color-bg-surface-muted)]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[var(--ak-color-bg-surface)] flex items-center justify-center border border-[var(--ak-color-border-subtle)]">
                  <LockClosedIcon className="h-6 w-6 text-[var(--ak-color-text-muted)]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-1">
                  {moduleName} nicht verfügbar
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)] mb-6">
                  Dieses Feature ist in Ihrem aktuellen Plan nicht enthalten. Bitte aktivieren Sie es im Marketplace oder upgraden Sie Ihren Plan.
                </p>
                <div className="flex gap-3">
                  <AkButton
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/settings?view=billing')}
                  >
                    Zum Marketplace
                  </AkButton>
                  <AkButton
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(redirectTo)}
                  >
                    Zurück
                  </AkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

