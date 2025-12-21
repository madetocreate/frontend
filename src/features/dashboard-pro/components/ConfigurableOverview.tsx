'use client'

import React from 'react'
import { DashboardProConfig } from '../types'
import { AVAILABLE_WIDGETS, DashboardWidgetDef } from '../widgets'
import { enableGastro } from '../../../lib/featureFlags'
import { SunIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface ConfigurableOverviewProps {
  config: DashboardProConfig
}

export function ConfigurableOverview({ config }: ConfigurableOverviewProps) {
  // Use layout from config or fallback to default widgets based on industry
  // Current config.layout might be undefined or specific structure.
  // We assume layout has a 'widgets' array if using UniversalDashboardConfigurator format
  
  interface WidgetLayoutItem {
    id: string
    type: string
    enabled: boolean
  }

  const layoutWidgets = (config.layout?.widgets as WidgetLayoutItem[] | undefined) || []
  
  // Fallback if no widgets configured: show some defaults based on industry
  const activeWidgets = layoutWidgets.length > 0 
    ? layoutWidgets 
    : getDefaultWidgetsForIndustry(config.industry)

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeWidgets.map((w: WidgetLayoutItem) => {
          const def = AVAILABLE_WIDGETS[w.type]
          if (!def) return null
          
          const sizeClass = def.size === 'large' ? 'col-span-1 md:col-span-2 lg:col-span-4' : 
                           def.size === 'medium' ? 'col-span-1 md:col-span-2' : 
                           'col-span-1'

          return (
            <div key={w.id} className={`${sizeClass}`}>
              <WidgetComponent definition={def} />
            </div>
          )
        })}
      </div>
      
      {activeWidgets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Keine Widgets konfiguriert.</p>
          <p className="text-sm">Nutzen Sie &quot;Konfigurieren&quot; oben rechts.</p>
        </div>
      )}
    </div>
  )
}

function WidgetComponent({ definition }: { definition: DashboardWidgetDef }) {
  const { type, data, title, icon: Icon } = definition

  if (!data) return null

  if (type === 'weather') {
    const weatherData = data as { temp: number; condition: string; location: string }
    return (
      <div className="apple-glass-enhanced rounded-2xl p-6 h-full">
        <div className="flex items-center justify-between mb-2">
          <SunIcon className="h-8 w-8 text-orange-500" />
          <span className="text-2xl">☀️</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">{weatherData.temp}°C</div>
        <div className="text-sm text-gray-600">{weatherData.condition}</div>
        <div className="text-xs text-gray-500 mt-1">{weatherData.location}</div>
      </div>
    )
  }

  if (type === 'metric') {
    const metricData = data as { value: string | number; trend?: string; subValue?: string }
    return (
      <div className="apple-glass-enhanced rounded-2xl p-6 h-full">
        <div className="flex items-center justify-between mb-2">
          {Icon && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
          {metricData.trend === 'up' && <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />}
        </div>
        <div className="text-3xl font-bold text-gray-900">{metricData.value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        {metricData.subValue && <div className="text-xs text-gray-500 mt-1">{metricData.subValue}</div>}
      </div>
    )
  }

  if (type === 'list') {
    const listData = (Array.isArray(data) ? data : []) as Array<{
      id: number
      title: string
      sub: string
      badge: string
      badgeColor?: string
    }>
    return (
      <div className="apple-glass-enhanced rounded-2xl p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="space-y-3">
          {listData.map((item: { id: number; title: string; sub: string; badge: string; badgeColor?: string }) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-600">{item.sub}</div>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-1 rounded ${
                  item.badgeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    const chartData = data as { current: number; total: number }
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="font-semibold">{chartData.current} / {chartData.total}</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${(chartData.current / chartData.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'actions') {
    const actionsData = (Array.isArray(data) ? data : []) as Array<{
      id: string
      label: string
      icon: React.ComponentType<{ className?: string }>
      shortcut: string
    }>
    return (
      <div className="apple-glass-enhanced rounded-2xl p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actionsData.map((action: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; shortcut: string }) => {
             const ActionIcon = action.icon
             return (
              <button 
                key={action.id}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors flex flex-col items-center"
                onClick={() => window.dispatchEvent(new CustomEvent('aklow-ai-action-wizard', { detail: { context: 'dashboard', action } }))}
              >
                <ActionIcon className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">{action.label}</div>
                <div className="text-xs text-gray-500 mt-1">{action.shortcut}</div>
              </button>
             )
          })}
        </div>
      </div>
    )
  }

  return <div>Unknown Widget</div>
}

function getDefaultWidgetsForIndustry(industry: string) {
  switch (industry) {
    case 'hotel':
      return [
        { id: '1', type: 'hotel-weather', enabled: true },
        { id: '2', type: 'hotel-arrivals', enabled: true },
        { id: '3', type: 'hotel-occupancy', enabled: true },
        { id: '4', type: 'hotel-revenue', enabled: true },
        { id: '5', type: 'hotel-actions', enabled: true },
        { id: '6', type: 'hotel-arrivals-list', enabled: true }
      ]
    case 'gastronomie':
        return enableGastro ? [
            { id: '1', type: 'gastro-reservations', enabled: true },
            { id: '2', type: 'gastro-orders', enabled: true },
        ] : []
    case 'practice':
        return [
            { id: '1', type: 'practice-patients', enabled: true },
            { id: '2', type: 'practice-waiting', enabled: true },
        ]
    case 'realestate':
        return [
            { id: '1', type: 'realestate-leads', enabled: true },
        ]
    default:
      return []
  }
}

