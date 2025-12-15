'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  HomeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

type RoomStatus = 'clean' | 'occupied' | 'maintenance' | 'dirty' | 'out-of-order'

interface Room {
  id: string
  number: string
  type: string
  status: RoomStatus
  guest?: string
  checkOut?: string
  housekeeping?: {
    assigned: string
    estimatedTime: string
  }
}

export function HotelRooms() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const rooms = useMemo<Room[]>(() => [
    { id: '1', number: '101', type: 'Standard', status: 'occupied', guest: 'Max Mustermann', checkOut: '2024-01-25' },
    { id: '2', number: '102', type: 'Standard', status: 'clean' },
    { id: '3', number: '103', type: 'Superior', status: 'dirty' },
    { id: '4', number: '104', type: 'Standard', status: 'maintenance' },
    { id: '5', number: '105', type: 'Suite', status: 'occupied', guest: 'Anna Schmidt', checkOut: '2024-01-22' },
    { id: '6', number: '201', type: 'Standard', status: 'clean' },
    { id: '7', number: '202', type: 'Superior', status: 'clean' },
    { id: '8', number: '203', type: 'Standard', status: 'occupied', guest: 'Peter Weber', checkOut: '2024-01-28' },
    { id: '9', number: '204', type: 'Standard', status: 'dirty' },
    { id: '10', number: '205', type: 'Superior', status: 'clean' },
  ], [])

  const getStatusColor = useCallback((status: RoomStatus) => {
    const colors: Record<RoomStatus, string> = {
      'clean': 'bg-green-500 border-green-600',
      'occupied': 'bg-blue-500 border-blue-600',
      'maintenance': 'bg-yellow-500 border-yellow-600',
      'dirty': 'bg-orange-500 border-orange-600',
      'out-of-order': 'bg-red-500 border-red-600'
    }
    return colors[status] || 'bg-gray-500'
  }, [])

  const getStatusLabel = useCallback((status: RoomStatus) => {
    const labels: Record<RoomStatus, string> = {
      'clean': 'Sauber',
      'occupied': 'Besetzt',
      'maintenance': 'Wartung',
      'dirty': 'Zu reinigen',
      'out-of-order': 'Außer Betrieb'
    }
    return labels[status] || status
  }, [])

  const getStatusIcon = useCallback((status: RoomStatus) => {
    if (status === 'clean') return CheckCircleIcon
    if (status === 'occupied') return HomeIcon
    if (status === 'maintenance') return WrenchScrewdriverIcon
    return XCircleIcon
  }, [])

  const stats = useMemo(() => ({
    total: rooms.length,
    clean: rooms.filter(r => r.status === 'clean').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  }), [rooms])

  const handleStatusChange = useCallback(async (roomId: string, newStatus: RoomStatus) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Backend call
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Status change:', roomId, newStatus)
    } catch (err) {
      setError('Status-Änderung fehlgeschlagen. Bitte versuchen Sie es erneut.')
      console.error('Status change error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Loading State
  if (loading && rooms.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
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
          <h2 className="text-2xl font-bold text-gray-900">Zimmerverwaltung</h2>
          <p className="text-gray-600 mt-1">Status aller Zimmer auf einen Blick</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Ansicht">
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'map' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-pressed={view === 'map'}
          >
            Karte
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-pressed={view === 'list'}
          >
            Liste
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800" role="alert">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.clean}</div>
          <div className="text-sm text-gray-600">Sauber</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.occupied}</div>
          <div className="text-sm text-gray-600">Besetzt</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.dirty}</div>
          <div className="text-sm text-gray-600">Zu reinigen</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
          <div className="text-sm text-gray-600">Wartung</div>
        </div>
      </div>

      {/* Room Map/List */}
      {view === 'map' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zimmer-Status-Map</h3>
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Zimmer vorhanden</h3>
              <p className="text-gray-600">Fügen Sie Zimmer hinzu, um zu beginnen.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {rooms.map((room) => {
                  const statusColor = getStatusColor(room.status)
                  const StatusIcon = getStatusIcon(room.status)
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColor} text-white`}
                      aria-label={`Zimmer ${room.number}, ${getStatusLabel(room.status)}`}
                    >
                      <StatusIcon className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-bold">{room.number}</div>
                      <div className="text-xs opacity-90">{room.type}</div>
                      {room.status === 'occupied' && room.guest && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-blue-600" aria-label="Besetzt" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm" role="list">
                {(['clean', 'occupied', 'dirty', 'maintenance', 'out-of-order'] as RoomStatus[]).map((status) => (
                  <div key={status} className="flex items-center gap-2" role="listitem">
                    <div className={`w-4 h-4 rounded ${getStatusColor(status)}`} />
                    <span>{getStatusLabel(status)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Zimmer vorhanden</h3>
              <p className="text-gray-600">Fügen Sie Zimmer hinzu, um zu beginnen.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rooms.map((room) => {
                const statusColor = getStatusColor(room.status)
                const StatusIcon = getStatusIcon(room.status)
                
                return (
                  <div
                    key={room.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRoom(room)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedRoom(room)
                      }
                    }}
                    aria-label={`Zimmer ${room.number} öffnen`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${statusColor} flex items-center justify-center text-white`}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Zimmer {room.number}</div>
                          <div className="text-sm text-gray-600">{room.type}</div>
                          {room.guest && (
                            <div className="text-xs text-gray-500 mt-1">{room.guest}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          room.status === 'clean' ? 'bg-green-100 text-green-800' :
                          room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                          room.status === 'dirty' ? 'bg-orange-100 text-orange-800' :
                          room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getStatusLabel(room.status)}
                        </div>
                        {room.checkOut && (
                          <div className="text-xs text-gray-500 mt-1">Check-out: {room.checkOut}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
          onClick={() => setSelectedRoom(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-detail-title"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 id="room-detail-title" className="text-xl font-bold text-gray-900">Zimmer {selectedRoom.number}</h3>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Typ</label>
                <div className="text-gray-900">{selectedRoom.type}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedRoom.status === 'clean' ? 'bg-green-100 text-green-800' :
                  selectedRoom.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                  selectedRoom.status === 'dirty' ? 'bg-orange-100 text-orange-800' :
                  selectedRoom.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(selectedRoom.status)}
                </div>
              </div>
              {selectedRoom.guest && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Gast</label>
                  <div className="text-gray-900">{selectedRoom.guest}</div>
                </div>
              )}
              {selectedRoom.checkOut && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-out</label>
                  <div className="text-gray-900">{selectedRoom.checkOut}</div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200">
                <button 
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={() => handleStatusChange(selectedRoom.id, 'clean')}
                >
                  {loading ? 'Wird geändert...' : 'Status ändern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
