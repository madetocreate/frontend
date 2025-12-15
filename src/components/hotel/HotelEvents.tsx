'use client'

import { useState, useMemo, useCallback } from 'react'
import { PlusIcon, CalendarIcon, UserGroupIcon, ClockIcon, XCircleIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Event {
  id: string
  title: string
  type: 'wedding' | 'conference' | 'birthday' | 'corporate' | 'other'
  date: string
  time: string
  guests: number
  location: string
  contact: string
  status: 'confirmed' | 'pending' | 'cancelled'
  total: number
}

export function HotelEvents() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const mockEvents = useMemo<Event[]>(() => [
    {
      id: '1',
      title: 'Hochzeit Müller',
      type: 'wedding',
      date: '2024-02-14',
      time: '16:00',
      guests: 80,
      location: 'Festsaal',
      contact: 'Max Müller',
      status: 'confirmed',
      total: 5000
    },
    {
      id: '2',
      title: 'Firmen-Event TechCorp',
      type: 'corporate',
      date: '2024-02-20',
      time: '18:00',
      guests: 50,
      location: 'Konferenzraum A',
      contact: 'Anna Schmidt',
      status: 'pending',
      total: 2500
    }
  ], [])

  const getTypeLabel = useCallback((type: string) => {
    const labels: Record<string, string> = {
      'wedding': 'Hochzeit',
      'conference': 'Konferenz',
      'birthday': 'Geburtstag',
      'corporate': 'Firmen-Event',
      'other': 'Sonstiges'
    }
    return labels[type] || type
  }, [])

  const stats = useMemo(() => ({
    total: mockEvents.length,
    confirmed: mockEvents.filter(e => e.status === 'confirmed').length,
    pending: mockEvents.filter(e => e.status === 'pending').length,
  }), [mockEvents])


  if (loading && mockEvents.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Events & Feiern</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Events, Hochzeiten und Feiern</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          aria-label="Neues Event erstellen"
        >
          <PlusIcon className="h-5 w-5" />
          Neues Event
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt Events</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Bestätigt</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Ausstehend</div>
        </div>
      </div>

      {/* Events List */}
      {mockEvents.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Events vorhanden</h3>
          <p className="text-gray-600">Erstellen Sie Ihr erstes Event.</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedEvent(event)
                  }
                }}
                aria-label={`Event ${event.title} öffnen`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-gray-900">{event.title}</div>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-lg">
                        {getTypeLabel(event.type)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-lg ${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status === 'confirmed' ? 'Bestätigt' : event.status === 'pending' ? 'Ausstehend' : 'Storniert'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" aria-hidden="true" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                        <span>{event.guests} Gäste</span>
                      </div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(event.total)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setSelectedEvent(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-detail-title"
        >
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto transform transition-all duration-300 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 id="event-detail-title" className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Typ</label>
                <div className="text-gray-900 mt-1">{getTypeLabel(selectedEvent.type)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Datum</label>
                  <div className="text-gray-900 mt-1">{selectedEvent.date}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Uhrzeit</label>
                  <div className="text-gray-900 mt-1">{selectedEvent.time}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Gäste</label>
                <div className="text-gray-900 mt-1">{selectedEvent.guests}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ort</label>
                <div className="text-gray-900 mt-1">{selectedEvent.location}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Kontakt</label>
                <div className="text-gray-900 mt-1">{selectedEvent.contact}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Gesamtpreis</label>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedEvent.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
