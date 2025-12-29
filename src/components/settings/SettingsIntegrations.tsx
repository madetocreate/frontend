'use client'

import { IntegrationHub } from '@/components/integrations/IntegrationHub'

export function SettingsIntegrations({ mode: _mode }: { mode?: 'simple' | 'expert' }) {
  // IntegrationHub is now the single source of truth for the integrations UI
  // It handles its own complexity, loading states, and "App Store" layout.
  return (
    <div className="h-full w-full">
      <IntegrationHub />
    </div>
  )
}
