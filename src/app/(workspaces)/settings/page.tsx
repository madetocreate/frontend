'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SettingsDashboard } from '@/components/settings/SettingsDashboard'
import { type SettingsView } from '@/components/settings/SettingsSidebarWidget'

// Legacy tab to view mapping
const LEGACY_TAB_MAP: Record<string, SettingsView> = {
  profile: 'account',
  organization: 'general',
  teams: 'collaboration',
  ai: 'ai',
  security: 'security',
  memory: 'memory',
  integrations: 'integrations',
}

// Legacy addon deep link mapping (view=addons&addon=... -> view=...)
const LEGACY_ADDON_TO_VIEW: Record<string, SettingsView> = {
  website: 'integrations',
  reviews: 'integrations',
  telephony: 'integrations',
  telegram: 'integrations',
  security: 'security',
  marketing: 'integrations',
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get view from query params (prefer 'view', fallback to legacy 'tab')
  const viewParam = searchParams.get('view')
  const tabParam = searchParams.get('tab')
  const addonParam = searchParams.get('addon')
  
  // Legacy deep link compat: view=addons&addon=... -> view=... (resolve before setting initialView)
  let resolvedViewParam = viewParam
  if (viewParam === 'addons' && addonParam && LEGACY_ADDON_TO_VIEW[addonParam]) {
    resolvedViewParam = LEGACY_ADDON_TO_VIEW[addonParam]
  }
  
  const initialView: SettingsView = (resolvedViewParam as SettingsView) || 
    (tabParam ? LEGACY_TAB_MAP[tabParam] : 'general') || 
    'general'

  const [activeView, setActiveView] = useState<SettingsView>(initialView)

  // Handle URL params changes
  useEffect(() => {
    // Legacy deep link compat: view=addons&addon=... -> view=...
    if (viewParam === 'addons' && addonParam && LEGACY_ADDON_TO_VIEW[addonParam]) {
      const newView = LEGACY_ADDON_TO_VIEW[addonParam]
      router.replace(`/settings?view=${newView}`, { scroll: false })
      return
    }
    
    // Redirect legacy ?tab=... to ?view=... once
    if (tabParam && !viewParam && LEGACY_TAB_MAP[tabParam]) {
      const newView = LEGACY_TAB_MAP[tabParam]
      router.replace(`/settings?view=${newView}`, { scroll: false })
      return
    }
    
    // Sync activeView with URL param (use resolvedViewParam if legacy mapping was applied)
    const currentViewParam = (viewParam === 'addons' && addonParam && LEGACY_ADDON_TO_VIEW[addonParam]) 
      ? LEGACY_ADDON_TO_VIEW[addonParam] 
      : viewParam
    if (currentViewParam && currentViewParam !== activeView) {
      // Use requestAnimationFrame to defer state update and avoid setState warning
      const rafId = requestAnimationFrame(() => {
        setActiveView(currentViewParam as SettingsView)
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [tabParam, viewParam, addonParam, router, activeView, searchParams])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Settings Content - Sidebar is handled by Global AppShell */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <SettingsDashboard view={activeView} mode="simple" externalMode={true} />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  )
}
