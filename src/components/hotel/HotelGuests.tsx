'use client'

import { useState, useMemo } from 'react'
import { MagnifyingGlassIcon, PlusIcon, EnvelopeIcon, PhoneIcon, XCircleIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  nationality?: string
  vip: boolean
  totalStays: number
  lastVisit?: string
  nextVisit?: string
  preferences?: string[]
  totalSpent: number
}

export function HotelGuests() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const guests = useMemo<Guest[]>(() => [
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 171 1234567',
      nationality: 'DE',
      vip: true,
      totalStays: 12,
      lastVisit: '2024-01-15',
      nextVisit: '2024-02-01',
      preferences: ['Meerblick', 'Spätes Check-out'],
      totalSpent: 5400
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      email: 'anna@example.com',
      phone: '+49 171 2345678',
      nationality: 'DE',
      vip: false,
      totalStays: 3,
      lastVisit: '2024-01-10',
      preferences: ['Frühstück'],
      totalSpent: 1200
    }
  ], [])

  const filteredGuests = useMemo(() => {
    return guests.filter(g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone?.includes(searchQuery)
    )
  }, [guests, searchQuery])

  const stats = useMemo(() => ({
    total: guests.length,
    vip: guests.filter(g => g.vip).length,
    totalStays: guests.reduce((sum, g) => sum + g.totalStays, 0),
    totalRevenue: guests.reduce((sum, g) => sum + g.totalSpent, 0)
  }), [guests])

  if (loading && guests.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gäste</h2>
          <p className="text-gray-600 mt-1">Gästedatenbank und CRM</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          aria-label="Neuen Gast erstellen"
        >
          <PlusIcon className="h-5 w-5" />
          Neuer Gast
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt Gäste</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
          <div className="text-sm text-gray-600">VIP Gäste</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStays}</div>
          <div className="text-sm text-gray-600">Gesamt Aufenthalte</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Gesamt Revenue</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Gäste suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          aria-label="Gäste durchsuchen"
        />
      </div>

      {/* Guests List */}
      {filteredGuests.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Gäste gefunden</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Fügen Sie Ihren ersten Gast hinzu.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedGuest(guest)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedGuest(guest)
                  }
                }}
                aria-label={`Gast ${guest.name} öffnen`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-gray-900">{guest.name}</div>
                      {guest.vip && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-lg">
                          VIP
                        </span>
                      )}
                      {guest.nationality && (
                        <span className="text-xs text-gray-500">{guest.nationality}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {guest.email && (
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                      <div>{guest.totalStays} Aufenthalte</div>
                      {guest.lastVisit && (
                        <div>Letzter Besuch: {guest.lastVisit}</div>
                      )}
                    </div>
                    {guest.preferences && guest.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {guest.preferences.map((pref, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-800 rounded-lg">
                            {pref}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(guest.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500">Gesamt</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guest Detail Modal */}
      {selectedGuest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setSelectedGuest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-detail-title"
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 id="guest-detail-title" className="text-xl font-bold text-gray-900">{selectedGuest.name}</h3>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {selectedGuest.email && (
                <div>
                  <label className="text-sm font-medium text-gray-700">E-Mail</label>
                  <div className="text-gray-900 mt-1">{selectedGuest.email}</div>
                </div>
              )}
              {selectedGuest.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefon</label>
                  <div className="text-gray-900 mt-1">{selectedGuest.phone}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Aufenthalte</label>
                  <div className="text-gray-900 mt-1">{selectedGuest.totalStays}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gesamt Revenue</label>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedGuest.totalSpent)}
                  </div>
                </div>
              </div>
              {selectedGuest.preferences && selectedGuest.preferences.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Präferenzen</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGuest.preferences.map((pref, idx) => (
                      <span key={idx} className="px-3 py-1 text-sm bg-blue-50 text-blue-800 rounded-lg">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
