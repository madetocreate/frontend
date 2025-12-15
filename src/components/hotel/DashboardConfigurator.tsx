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
  | 'rooms-map'
  | 'restaurant-tables'
  | 'events-calendar'
  | 'guests-list'
  | 'revenue-chart'
  | 'marketing-reviews'
  | 'reports-summary'

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
    description: 'Ankünfte, Belegung, Revenue',
    icon: Squares2X2Icon
  },
  'reservations-list': { 
    title: 'Reservierungen', 
    description: 'Liste aller Buchungen',
    icon: Squares2X2Icon
  },
  'rooms-map': { 
    title: 'Zimmer-Map', 
    description: 'Visuelle Zimmer-Übersicht',
    icon: Squares2X2Icon
  },
  'restaurant-tables': { 
    title: 'Restaurant-Tische', 
    description: 'Tisch-Plan und Status',
    icon: Squares2X2Icon
  },
  'events-calendar': { 
    title: 'Events-Kalender', 
    description: 'Kommende Events',
    icon: Squares2X2Icon
  },
  'guests-list': { 
    title: 'Gäste-Liste', 
    description: 'Aktuelle Gäste',
    icon: Squares2X2Icon
  },
  'revenue-chart': { 
    title: 'Revenue-Chart', 
    description: 'Revenue-Trends',
    icon: Squares2X2Icon
  },
  'marketing-reviews': { 
    title: 'Reviews', 
    description: 'Neueste Bewertungen',
    icon: Squares2X2Icon
  },
  'reports-summary': { 
    title: 'Berichte', 
    description: 'Zusammenfassung',
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
        { id: '3', type: 'rooms-map', title: 'Zimmer', size: 'medium', position: { x: 1, y: 1 }, enabled: true },
      ]
    }
  ])
  const [activeLayout, setActiveLayout] = useState<string>('default')
  const [showAddWidget, setShowAddWidget] = useState(false)

  const currentLayout = useMemo(() => 
    layouts.find(l => l.id === activeLayout) || layouts[0]
  , [layouts, activeLayout])

  const handleAddWidget = useCallback((widgetType: WidgetType) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: widgetType,
      title: AVAILABLE_WIDGETS[widgetType].title,
      size: 'medium',
      position: { x: 0, y: currentLayout.widgets.length },
      enabled: true
    }
    
    setLayouts(prev => prev.map(layout => 
      layout.id === activeLayout
        ? { ...layout, widgets: [...layout.widgets, newWidget] }
        : layout
    ))
    setShowAddWidget(false)
  }, [activeLayout, currentLayout])

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
    // TODO: Save to backend
    console.log('Saving layout:', currentLayout)
  }, [currentLayout])

  const enabledWidgets = useMemo(() => 
    currentLayout.widgets.filter(w => w.enabled),
    [currentLayout]
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard-Konfigurator</h2>
          <p className="text-gray-600 mt-1">Passen Sie Ihr Dashboard nach Ihren Bedürfnissen an</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Layout Selector */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Layout:</label>
          <select
            value={activeLayout}
            onChange={(e) => setActiveLayout(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {layouts.map(layout => (
              <option key={layout.id} value={layout.id}>{layout.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Widget Grid Preview */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dashboard-Vorschau</h3>
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            Widget hinzufügen
          </button>
        </div>

        {enabledWidgets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Widgets aktiv</h3>
            <p className="text-gray-600 mb-4">Fügen Sie Widgets hinzu, um Ihr Dashboard zu konfigurieren.</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Erstes Widget hinzufügen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledWidgets.map((widget) => {
              const widgetInfo = AVAILABLE_WIDGETS[widget.type]
              const Icon = widgetInfo.icon
              
              return (
                <div
                  key={widget.id}
                  className={`relative group p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 ${
                    widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' :
                    widget.size === 'medium' ? 'md:col-span-1 lg:col-span-2' :
                    'md:col-span-1'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-semibold text-gray-900">{widget.title}</div>
                        <div className="text-xs text-gray-500">{widgetInfo.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleWidget(widget.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Widget aktivieren/deaktivieren"
                      >
                        <CheckIcon className={`h-4 w-4 ${widget.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        aria-label="Widget entfernen"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-400">{widgetInfo.title}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Available Widgets List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verfügbare Widgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
            const Icon = info.icon
            const isAdded = currentLayout.widgets.some(w => w.type === type as WidgetType)
            
            return (
              <button
                key={type}
                onClick={() => !isAdded && handleAddWidget(type as WidgetType)}
                disabled={isAdded}
                className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                  isAdded
                    ? 'border-green-200 bg-green-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{info.title}</div>
                    <div className="text-xs text-gray-500">{info.description}</div>
                  </div>
                  {isAdded && (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setShowAddWidget(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Widget hinzufügen</h3>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Modal schließen"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(AVAILABLE_WIDGETS).map(([type, info]) => {
                  const Icon = info.icon
                  const isAdded = currentLayout.widgets.some(w => w.type === type as WidgetType)
                  
                  return (
                    <button
                      key={type}
                      onClick={() => !isAdded && handleAddWidget(type as WidgetType)}
                      disabled={isAdded}
                      className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                        isAdded
                          ? 'border-green-200 bg-green-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{info.title}</div>
                          <div className="text-xs text-gray-500">{info.description}</div>
                        </div>
                        {isAdded && (
                          <CheckIcon className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
