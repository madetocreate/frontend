'use client'

import MarketplaceDashboard from '@/components/marketplace/MarketplaceDashboard'

export function SettingsMarketplace({ mode }: { mode?: 'simple' | 'expert' }) {
  void mode
  return (
    <div className="p-6">
      <MarketplaceDashboard />
    </div>
  )
}
