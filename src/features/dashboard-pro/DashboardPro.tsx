import { useState } from 'react'
import { loadConfig, saveConfig } from './storage'
import { DashboardProConfig, DashboardIndustry } from './types'
import { createDefaultConfig, INDUSTRY_TEMPLATES } from './templates'
import { enableGastro } from '../../lib/featureFlags'
import { DashboardProShell } from './DashboardProShell'
import { BuildingOfficeIcon, HomeModernIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/outline'

export function DashboardPro() {
  // Initialize state directly from localStorage to avoid useEffect setState
  const [config, setConfig] = useState<DashboardProConfig | null>(() => {
    if (typeof window !== 'undefined') {
      return loadConfig()
    }
    return null
  })

  const handleSetup = (industry: DashboardIndustry) => {
    const newConfig = createDefaultConfig(industry)
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  const handleConfigChange = (newConfig: DashboardProConfig) => {
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <h1 className="text-3xl font-bold mb-8 text-[var(--ak-color-text-primary)]">
          Wähle deine Branche
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {Object.values(INDUSTRY_TEMPLATES).filter(tpl => enableGastro || tpl.id !== 'gastronomie').map(tpl => {
            const Icon = getIconForIndustry(tpl.id)
            return (
              <button
                key={tpl.id}
                onClick={() => handleSetup(tpl.id as DashboardIndustry)}
                className="flex flex-col items-center p-8 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-2xl hover:border-[var(--ak-color-primary)] hover:shadow-lg transition-all group"
              >
                <div className="p-4 bg-[var(--ak-color-bg-subtle)] rounded-full mb-4 group-hover:bg-[var(--ak-color-primary-subtle)] transition-colors">
                  <Icon className="w-8 h-8 text-[var(--ak-color-text-primary)] group-hover:text-[var(--ak-color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--ak-color-text-primary)]">
                  {tpl.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--ak-color-text-secondary)] text-center">
                  Starten Sie mit dem Template für {tpl.name}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return <DashboardProShell config={config} onConfigChange={handleConfigChange} />
}

function getIconForIndustry(id: string) {
  switch (id) {
    case 'hotel': return BuildingOfficeIcon
    case 'gastronomie': return HomeModernIcon
    case 'practice': return UserGroupIcon
    case 'realestate': return HomeIcon
    default: return BuildingOfficeIcon
  }
}

