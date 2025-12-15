'use client'

import { useState, useMemo, useCallback } from 'react'
import { PlusIcon, ClockIcon, XCircleIcon, ExclamationTriangleIcon, CakeIcon } from '@heroicons/react/24/outline'

interface Table {
  id: string
  number: string
  capacity: number
  status: 'available' | 'reserved' | 'occupied' | 'cleaning'
  reservation?: {
    guest: string
    time: string
    guests: number
  }
  order?: {
    items: number
    total: number
    started: string
  }
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'starter' | 'main' | 'dessert' | 'drink'
  allergens?: string[]
}

export function HotelRestaurant() {
  const [view, setView] = useState<'tables' | 'menu' | 'orders'>('tables')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const tables = useMemo<Table[]>(() => [
    { id: '1', number: '1', capacity: 2, status: 'occupied', order: { items: 3, total: 45.50, started: '19:30' } },
    { id: '2', number: '2', capacity: 4, status: 'reserved', reservation: { guest: 'Max Mustermann', time: '20:00', guests: 2 } },
    { id: '3', number: '3', capacity: 2, status: 'available' },
    { id: '4', number: '4', capacity: 6, status: 'occupied', order: { items: 5, total: 120.00, started: '19:15' } },
    { id: '5', number: '5', capacity: 4, status: 'available' },
    { id: '6', number: '6', capacity: 2, status: 'cleaning' },
    { id: '7', number: '7', capacity: 4, status: 'reserved', reservation: { guest: 'Anna Schmidt', time: '20:30', guests: 4 } },
    { id: '8', number: '8', capacity: 2, status: 'available' },
  ], [])

  const menuItems: MenuItem[] = [
    { id: '1', name: 'Paella', description: 'Traditionelle spanische Paella', price: 18.50, category: 'main' },
    { id: '2', name: 'Gambas al Ajillo', description: 'Knoblauch-Garnelen', price: 12.00, category: 'starter' },
    { id: '3', name: 'Sangria', description: 'Hausgemachte Sangria', price: 8.50, category: 'drink' },
    { id: '4', name: 'Tarta de Santiago', description: 'Mandelkuchen', price: 6.50, category: 'dessert' },
  ]

  const getTableColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-500 border-green-600',
      'reserved': 'bg-yellow-500 border-yellow-600',
      'occupied': 'bg-blue-500 border-blue-600',
      'cleaning': 'bg-orange-500 border-orange-600'
    }
    return colors[status] || 'bg-gray-500'
  }, [])

  const getTableLabel = useCallback((status: string) => {
    const labels: Record<string, string> = {
      'available': 'Frei',
      'reserved': 'Reserviert',
      'occupied': 'Besetzt',
      'cleaning': 'Reinigung'
    }
    return labels[status] || status
  }, [])

  const stats = useMemo(() => ({
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    revenue: tables.filter(t => t.order).reduce((sum, t) => sum + (t.order?.total || 0), 0)
  }), [tables])

  const activeOrders = useMemo(() => tables.filter(t => t.order), [tables])

  const handleTableAction = useCallback(async (tableId: string, action: string) => {
    setLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Table action:', tableId, action)
    } catch (err) {
      setError('Aktion fehlgeschlagen. Bitte versuchen Sie es erneut.')
      console.error('Table action error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading && tables.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurant & Bar</h2>
          <p className="text-gray-600 mt-1">Tischreservierungen, Bestellungen und Menü</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Ansicht">
          {(['tables', 'menu', 'orders'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                view === v
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={view === v}
            >
              {v === 'tables' ? 'Tische' : v === 'menu' ? 'Menü' : 'Bestellungen'}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 shadow-sm" role="alert">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
            aria-label="Fehler schließen"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-gray-600">Frei</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
          <div className="text-sm text-gray-600">Besetzt</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
          <div className="text-sm text-gray-600">Reserviert</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.revenue)}
          </div>
          <div className="text-sm text-gray-600">Umsatz heute</div>
        </div>
      </div>

      {/* Tables View */}
      {view === 'tables' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tisch-Plan</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <PlusIcon className="h-5 w-5" />
              Neuer Tisch
            </button>
          </div>
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <CakeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Tische vorhanden</h3>
              <p className="text-gray-600">Fügen Sie Tische hinzu, um zu beginnen.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {tables.map((table) => {
                  const tableColor = getTableColor(table.status)
                  
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${tableColor} text-white`}
                      aria-label={`Tisch ${table.number}, ${getTableLabel(table.status)}`}
                    >
                      <div className="text-xl font-bold">{table.number}</div>
                      <div className="text-xs opacity-90">{table.capacity} Pers.</div>
                      {table.reservation && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm" aria-label="Reserviert" />
                      )}
                      {table.order && (
                        <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 text-xs px-2 py-0.5 rounded font-bold shadow-sm">
                          {table.order.items}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm" role="list">
                {(['available', 'reserved', 'occupied', 'cleaning'] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2" role="listitem">
                    <div className={`w-4 h-4 rounded ${getTableColor(status)}`} />
                    <span>{getTableLabel(status)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Menu View */}
      {view === 'menu' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Menü</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <PlusIcon className="h-5 w-5" />
              Neues Gericht
            </button>
          </div>
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <CakeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Menü-Items</h3>
              <p className="text-gray-600">Fügen Sie Gerichte zum Menü hinzu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          Allergene: {item.allergens.join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900 ml-4">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders View */}
      {view === 'orders' && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktive Bestellungen</h3>
          {activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine aktiven Bestellungen</h3>
              <p className="text-gray-600">Aktuell sind keine Bestellungen aktiv.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((table) => (
                <div key={table.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Tisch {table.number}</div>
                      <div className="text-sm text-gray-600 mt-1">{table.order?.items} Artikel</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <ClockIcon className="h-3 w-3" />
                        Gestartet: {table.order?.started}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(table.order?.total || 0)}
                      </div>
                      <button className="text-sm text-blue-600 hover:underline mt-1 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table Detail Modal */}
      {selectedTable && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setSelectedTable(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="table-detail-title"
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 id="table-detail-title" className="text-xl font-bold text-gray-900">Tisch {selectedTable.number}</h3>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Kapazität</label>
                <div className="text-gray-900 mt-1">{selectedTable.capacity} Personen</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedTable.status === 'available' ? 'bg-green-100 text-green-800' :
                    selectedTable.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    selectedTable.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {getTableLabel(selectedTable.status)}
                  </span>
                </div>
              </div>
              {selectedTable.reservation && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Reservierung</label>
                  <div className="text-gray-900 mt-1">{selectedTable.reservation.guest}</div>
                  <div className="text-sm text-gray-600 mt-1">{selectedTable.reservation.time} • {selectedTable.reservation.guests} Gäste</div>
                </div>
              )}
              {selectedTable.order && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Bestellung</label>
                  <div className="text-gray-900 mt-1">{selectedTable.order.items} Artikel</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedTable.order.total)}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 flex gap-2">
                {selectedTable.status === 'available' && (
                  <button 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={() => handleTableAction(selectedTable.id, 'reserve')}
                  >
                    {loading ? '...' : 'Reservieren'}
                  </button>
                )}
                {selectedTable.status === 'reserved' && (
                  <button 
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={() => handleTableAction(selectedTable.id, 'checkin')}
                  >
                    {loading ? '...' : 'Check-in'}
                  </button>
                )}
                {selectedTable.status === 'occupied' && (
                  <button 
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={() => handleTableAction(selectedTable.id, 'order')}
                  >
                    {loading ? '...' : 'Bestellung'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
