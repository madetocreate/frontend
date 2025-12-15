/**
 * Universal Dashboard Configurator
 * Apple-designed dashboard configuration for all dashboards
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Squares2X2Icon, 
  XMarkIcon, 
  CheckIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { AppleCard, AppleButton, AppleBadge, AppleSection } from '../ui/AppleDesignSystem'

export type DashboardType = 'hotel' | 'practice' | 'realestate' | 'general'

export type WidgetSize = 'small' | 'medium' | 'large'

export interface Widget {
  id: string
  type: string
  title: string
  size: WidgetSize
  position: { x: number; y: number }
  enabled: boolean
  category?: string
}

export interface DashboardLayout {
  id: string
  name: string
  widgets: Widget[]
  dashboardType: DashboardType
}

interface UniversalDashboardConfiguratorProps {
  dashboardType: DashboardType
  availableWidgets: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }>; category?: string }>
  initialLayouts?: DashboardLayout[]
  onSave?: (layouts: DashboardLayout[]) => void
  onClose?: () => void
}

export function UniversalDashboardConfigurator({
  dashboardType,
  availableWidgets,
  initialLayouts = [],
  onSave,
  onClose
}: UniversalDashboardConfiguratorProps) {
  const [layouts, setLayouts] = useState<DashboardLayout[]>(initialLayouts.length > 0 ? initialLayouts : [
    {
      id: 'default',
      name: 'Standard',
      widgets: [],
      dashboardType
    }
  ])
  const [activeLayout, setActiveLayout] = useState<string>(layouts[0]?.id || 'default')
  const [showAddWidget, setShowAddWidget] = useState(false)
  // const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  const currentLayout = useMemo(() => 
    layouts.find(l => l.id === activeLayout) || layouts[0],
    [layouts, activeLayout]
  )

  const handleAddWidget = useCallback((widgetType: string) => {
    const widget = availableWidgets[widgetType]
    if (!widget) return

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: widget.title,
      size: 'medium',
      position: { x: 0, y: 0 },
      enabled: true,
      category: widget.category
    }

    setLayouts(prev => prev.map(layout => 
      layout.id === activeLayout
        ? { ...layout, widgets: [...layout.widgets, newWidget] }
        : layout
    ))
    setShowAddWidget(false)
  }, [activeLayout, availableWidgets])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === activeLayout
        ? { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
        : layout
    ))
  }, [activeLayout])

  const handleToggleWidget = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === activeLayout
        ? { 
            ...layout, 
            widgets: layout.widgets.map(w => 
              w.id === widgetId ? { ...w, enabled: !w.enabled } : w
            )
          }
        : layout
    ))
  }, [activeLayout])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(layouts)
    }
  }, [layouts, onSave])

  const handleReset = useCallback(() => {
    setLayouts(initialLayouts.length > 0 ? initialLayouts : [
      {
        id: 'default',
        name: 'Standard',
        widgets: [],
        dashboardType
      }
    ])
  }, [initialLayouts, dashboardType])

  const enabledWidgets = useMemo(() => 
    currentLayout?.widgets.filter(w => w.enabled) || [],
    [currentLayout]
  )

  const disabledWidgets = useMemo(() => 
    currentLayout?.widgets.filter(w => !w.enabled) || [],
    [currentLayout]
  )

  // Group widgets by category
  const widgetsByCategory = useMemo(() => {
    const grouped: Record<string, typeof availableWidgets> = {}
    Object.entries(availableWidgets).forEach(([key, widget]) => {
      const category = widget.category || 'Allgemein'
      if (!grouped[category]) {
        grouped[category] = {}
      }
      grouped[category][key] = widget
    })
    return grouped
  }, [availableWidgets])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-3xl apple-glass shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Squares2X2Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.configure')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t('dashboard.configureDescription')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Available Widgets */}
            <div className="space-y-4">
              <AppleSection
                title={t('dashboard.availableWidgets')}
                headerAction={
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddWidget(!showAddWidget)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </AppleButton>
                }
              >
                {showAddWidget && (
                  <div className="space-y-2 mb-4">
                    {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {category}
                        </h4>
                        {Object.entries(widgets).map(([key, widget]) => {
                          const Icon = widget.icon
                          const isAdded = currentLayout?.widgets.some(w => w.type === key)
                          
                          return (
                            <button
                              key={key}
                              onClick={() => !isAdded && handleAddWidget(key)}
                              disabled={isAdded}
                              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="p-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-lg">
                                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {widget.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {widget.description}
                                </div>
                              </div>
                              {isAdded && (
                                <CheckIcon className="h-5 w-5 text-green-600" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </AppleSection>
            </div>

            {/* Center: Dashboard Preview */}
            <div className="space-y-4">
              <AppleSection title={t('dashboard.dashboardPreview')}>
                <div className="space-y-3">
                  {enabledWidgets.length === 0 ? (
                    <div className="p-12 text-center rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('dashboard.addWidgets')}
                      </p>
                    </div>
                  ) : (
                    enabledWidgets.map((widget) => {
                      const widgetInfo = availableWidgets[widget.type]
                      const Icon = widgetInfo?.icon || Squares2X2Icon
                      
                      return (
                        <AppleCard
                          key={widget.id}
                          glass={false}
                          padding="md"
                          className="relative group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {widget.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {widgetInfo?.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <AppleBadge variant="blue" size="sm">
                                {widget.size}
                              </AppleBadge>
                              <button
                                onClick={() => handleRemoveWidget(widget.id)}
                                className="p-1.5 hover:bg-red-100/80 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </AppleCard>
                      )
                    })
                  )}
                </div>
              </AppleSection>

              {disabledWidgets.length > 0 && (
                <AppleSection title={t('dashboard.disabledWidgets')}>
                  <div className="space-y-2">
                    {disabledWidgets.map((widget) => {
                      const widgetInfo = availableWidgets[widget.type]
                      const Icon = widgetInfo?.icon || Squares2X2Icon
                      
                      return (
                        <button
                          key={widget.id}
                          onClick={() => handleToggleWidget(widget.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all opacity-60"
                        >
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-600 dark:text-gray-400 text-sm">
                              {widget.title}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveWidget(widget.id)
                            }}
                            className="p-1.5 hover:bg-red-100/80 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </button>
                      )
                    })}
                  </div>
                </AppleSection>
              )}
            </div>

            {/* Right: Layout Management */}
            <div className="space-y-4">
              <AppleSection title="Layouts">
                <div className="space-y-2">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setActiveLayout(layout.id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        activeLayout === layout.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80'
                      }`}
                    >
                      <div className="font-medium">{layout.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        activeLayout === layout.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {layout.widgets.length} {t('dashboard.widgets')}
                      </div>
                    </button>
                  ))}
                </div>
              </AppleSection>

              <AppleSection title="Aktionen">
                <div className="space-y-2">
                  <AppleButton
                    variant="primary"
                    fullWidth
                    onClick={handleSave}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Speichern
                  </AppleButton>
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    onClick={handleReset}
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Zurücksetzen
                  </AppleButton>
                </div>
              </AppleSection>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {enabledWidgets.length} {t('dashboard.widgetsActive')}
          </div>
          <div className="flex gap-3">
            <AppleButton variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </AppleButton>
            <AppleButton variant="primary" onClick={handleSave}>
              <CheckIcon className="h-4 w-4" />
              {t('dashboard.saveAndClose')}
            </AppleButton>
          </div>
        </div>
      </div>
    </div>
  )
}
