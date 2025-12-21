import { useState, useEffect, useMemo } from 'react'
import { DashboardProConfig } from './types'
import { INDUSTRY_TEMPLATES } from './templates'
import { HotelDashboard, type HotelView } from '../../components/hotel/HotelDashboard'
import { GastronomieDashboard, type GastronomieView } from '../../components/gastronomie/GastronomieDashboard'
import { PracticeDashboard, type PracticeView } from '../../components/practice/PracticeDashboard'
import { RealEstateDashboard, type RealEstateView } from '../../components/realestate/RealEstateDashboard'
import { UniversalDashboardConfigurator, type DashboardLayout, type Widget, type WidgetSize } from '../../components/dashboard/UniversalDashboardConfigurator'
import { Cog6ToothIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

import { ConfigurableOverview } from './components/ConfigurableOverview'
import { AVAILABLE_WIDGETS } from './widgets'
import { enableGastro } from '../../lib/featureFlags'

interface DashboardProShellProps {
  config: DashboardProConfig
  onConfigChange: (newConfig: DashboardProConfig) => void
}

export function DashboardProShell({ config, onConfigChange }: DashboardProShellProps) {
  // Initialize with first enabled view, or fallback to overview
  const getInitialView = () => {
    const firstEnabled = config.enabledViews[0]
    return firstEnabled || 'overview'
  }
  
  const [currentView, setCurrentView] = useState<string>(getInitialView())
  const [showConfigurator, setShowConfigurator] = useState(false)

  // Ensure current view is valid/enabled - use useMemo to derive valid view
  const validView = useMemo(() => {
    if (config.enabledViews.includes(currentView)) {
      return currentView
    }
    return config.enabledViews[0] || 'overview'
  }, [config.enabledViews, currentView])

  // Update currentView only when validView changes and differs
  useEffect(() => {
    if (validView !== currentView) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => setCurrentView(validView), 0)
      return () => clearTimeout(timer)
    }
  }, [validView, currentView])

  const template = INDUSTRY_TEMPLATES[config.industry]

  // Render the correct industry dashboard
  const renderDashboard = () => {
    if (currentView === 'overview') {
        return <ConfigurableOverview config={config} />
    }

    switch (config.industry) {
      case 'hotel':
        return <HotelDashboard view={currentView as HotelView} enabledViews={config.enabledViews} />
      case 'gastronomie':
        return enableGastro ? (
          <GastronomieDashboard view={currentView as GastronomieView} enabledViews={config.enabledViews} />
        ) : (
          <HotelDashboard view={'overview'} enabledViews={['overview']} />
        )
      case 'practice':
        return <PracticeDashboard view={currentView as PracticeView} enabledViews={config.enabledViews} />
      case 'realestate':
        return <RealEstateDashboard view={currentView as RealEstateView} enabledViews={config.enabledViews} />
      default:
        return <div>Unknown Industry</div>
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--ak-color-bg-app)]">
      <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
           {template.availableViews
             .filter(v => config.enabledViews.includes(v.id))
             .map(v => (
               <button
                 key={v.id}
                 onClick={() => setCurrentView(v.id)}
                 className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                   currentView === v.id
                     ? 'bg-[var(--ak-color-primary)] text-white'
                     : 'text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-subtle)]'
                 }`}
               >
                 {v.label}
               </button>
             ))
           }
        </div>
        <div className="flex items-center gap-2 ml-4">
           {/* Placeholder for Date Filter */}
           <button className="p-2 text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-subtle)] rounded-lg">
             <CalendarDaysIcon className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setShowConfigurator(true)}
             className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-subtle)] hover:bg-[var(--ak-color-bg-hover)] rounded-lg transition-colors"
           >
             <Cog6ToothIcon className="w-4 h-4" />
             Konfigurieren
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {renderDashboard()}
      </div>

      {showConfigurator && (
        <UniversalDashboardConfigurator
          dashboardType={config.industry}
          availableWidgets={AVAILABLE_WIDGETS as Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }>; category?: string }>}
          onClose={() => setShowConfigurator(false)}
          config={config} 
          onSave={(layouts) => {
             // Extract widget layout from UniversalDashboardConfigurator output
             // Assuming first layout is active
             if (layouts && layouts[0]) {
                 onConfigChange({ 
                     ...config, 
                     layout: { widgets: layouts[0].widgets },
                     updatedAt: Date.now() 
                 })
             }
          }}
          onSaveConfig={(newConfig: Partial<DashboardProConfig>) => {
              onConfigChange({ ...config, ...newConfig, updatedAt: Date.now() })
              setShowConfigurator(false)
          }}
          // Pass current layout to configurator
          initialLayouts={
            config.layout?.widgets
              ? ([
                  {
                    id: 'default',
                    name: 'Standard',
                    widgets: (config.layout.widgets as Array<{
                      id: string
                      type: string
                      title: string
                      size: unknown
                      position: { x: number; y: number }
                      enabled: boolean
                      category?: string
                    }>).map((w): Widget => {
                      const size = w.size
                      const widgetSize: WidgetSize =
                        size === 'small' || size === 'medium' || size === 'large' ? size : 'medium'
                      return {
                        id: w.id,
                        type: w.type,
                        title: w.title,
                        size: widgetSize,
                        position: w.position,
                        enabled: w.enabled,
                        category: w.category,
                      }
                    }),
                    dashboardType: config.industry,
                  } satisfies DashboardLayout,
                ] as DashboardLayout[])
              : undefined
          }
        />
      )}
    </div>
  )
}

