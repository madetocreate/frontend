'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Squares2X2Icon, 
  XMarkIcon, 
  CheckIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

type WidgetType = 
  | 'overview-stats'
  | 'reservations-list'
  | 'menu-items'
  | 'active-orders'
  | 'inventory-alerts'
  | 'staff-schedule'
  | 'bar-stock'
  | 'revenue-chart'
  | 'top-items'

interface Widget {
  id: string
  type: WidgetType
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  enabled: boolean
}

interface DashboardLayout {
  id: string
  name: string
  widgets: Widget[]
}

const AVAILABLE_WIDGETS: Record<WidgetType, { title: string; description: string; icon: typeof Squares2X2Icon }> = {
  'overview-stats': { 
    title: 'Übersicht-Statistiken', 
    description: 'Umsatz, Bestellungen, Tische',
    icon: Squares2X2Icon
  },
  'reservations-list': { 
    title: 'Reservierungen', 
    description: 'Liste aller Tischreservierungen',
    icon: Squares2X2Icon
  },
  'menu-items': { 
    title: 'Speisekarte', 
    description: 'Menü-Items und Kategorien',
    icon: Squares2X2Icon
  },
  'active-orders': { 
    title: 'Aktive Bestellungen', 
    description: 'Laufende Bestellungen',
    icon: Squares2X2Icon
  },
  'inventory-alerts': { 
    title: 'Inventar-Warnungen', 
    description: 'Niedrige Lagerbestände',
    icon: Squares2X2Icon
  },
  'staff-schedule': { 
    title: 'Personal-Schichten', 
    description: 'Aktuelle Schichten',
    icon: Squares2X2Icon
  },
  'bar-stock': { 
    title: 'Bar-Bestand', 
    description: 'Getränkebestände',
    icon: Squares2X2Icon
  },
  'revenue-chart': { 
    title: 'Umsatz-Chart', 
    description: 'Revenue-Trends',
    icon: Squares2X2Icon
  },
  'top-items': { 
    title: 'Bestseller', 
    description: 'Top verkaufte Items',
    icon: Squares2X2Icon
  },
}

export function DashboardConfigurator() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([
    {
      id: 'default',
      name: 'Standard',
      widgets: [
        { id: '1', type: 'overview-stats', title: 'Übersicht', size: 'large', position: { x: 0, y: 0 }, enabled: true },
        { id: '2', type: 'reservations-list', title: 'Reservierungen', size: 'medium', position: { x: 0, y: 1 }, enabled: true },
        { id: '3', type: 'active-orders', title: 'Bestellungen', size: 'medium', position: { x: 1, y: 1 }, enabled: true },
      ]
    }
  ])
  const [activeLayout] = useState<string>('default')
  const [showAddWidget, setShowAddWidget] = useState(false)

  const currentLayout = useMemo(() => 
    layouts.find(l => l.id === activeLayout) || layouts[0],
    [layouts, activeLayout]
  )

  const handleAddWidget = useCallback((type: WidgetType) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === activeLayout) {
        const newWidget: Widget = {
          id: Date.now().toString(),
          type,
          title: AVAILABLE_WIDGETS[type].title,
          size: 'medium',
          position: { x: 0, y: layout.widgets.length },
          enabled: true
        }
        return { ...layout, widgets: [...layout.widgets, newWidget] }
      }
      return layout
    }))
    setShowAddWidget(false)
  }, [activeLayout])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === activeLayout) {
        return { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
      }
      return layout
    }))
  }, [activeLayout])

  const handleToggleWidget = useCallback((widgetId: string) => {
    setLayouts(prev => prev.map(layout => {
      if (layout.id === activeLayout) {
        return {
          ...layout,
          widgets: layout.widgets.map(w => 
            w.id === widgetId ? { ...w, enabled: !w.enabled } : w
          )
        }
      }
      return layout
    }))
  }, [activeLayout])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Konfigurator</h2>
          <p className="text-gray-600 mt-1">Passen Sie Ihr Gastronomie Dashboard an</p>
        </div>
        <button
          onClick={() => setShowAddWidget(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-xl hover:shadow-xl transition-all font-medium flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Widget hinzufügen
        </button>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLayout.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`p-6 rounded-2xl border-2 transition-all ${
              widget.enabled
                ? 'bg-white/60 backdrop-blur-2xl border-orange-200/50 shadow-lg'
                : 'bg-gray-100/60 border-gray-200/50 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Squares2X2Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                  <p className="text-xs text-gray-600">{AVAILABLE_WIDGETS[widget.type].description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleWidget(widget.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    widget.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Widget hinzufügen</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(AVAILABLE_WIDGETS).map(([type, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    onClick={() => handleAddWidget(type as WidgetType)}
                    className="p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50 hover:border-orange-300/50 hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{config.title}</div>
                        <div className="text-xs text-gray-600">{config.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
