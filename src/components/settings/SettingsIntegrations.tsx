'use client'

import IntegrationsDashboard from '@/components/integrations/IntegrationsDashboard'

export function SettingsIntegrations({ mode }: { mode?: 'simple' | 'expert' }) {
  void mode
  return (
    <div className="p-6">
      <IntegrationsDashboard />
    </div>
  )
}
