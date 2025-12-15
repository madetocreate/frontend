'use client'

import { useState, useMemo } from 'react'
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { NLPScheduler } from '../calendar/NLPScheduler'
import { useCalendar } from '../../hooks/useCalendar'

interface Viewing {
  id: string
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  customerName: string
  customerPhone: string
  customerEmail: string
  date: string
  time: string
  duration: number // minutes
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled'
  notes?: string
  createdAt: string
}

export function RealEstateCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedViewing, setSelectedViewing] = useState<Viewing | null>(null)
  const [showNLP, setShowNLP] = useState(false)
  const { refresh } = useCalendar({ autoLoad: false })

  // TODO: Load from backend
  const viewings = useMemo<Viewing[]>(() => [
    {
      id: '1',
      propertyId: 'prop-1',
      propertyTitle: 'Moderne 3-Zimmer-Wohnung',
      propertyAddress: 'Musterstraße 1, Musterstadt',
      customerName: 'Max Mustermann',
      customerPhone: '+49 171 1234567',
      customerEmail: 'max@example.com',
      date: '2024-01-25',
      time: '14:00',
      duration: 60,
      status: 'Confirmed',
      notes: 'Interessiert an Balkon und Parkplatz',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      propertyId: 'prop-2',
      propertyTitle: 'Einfamilienhaus mit Garten',
      propertyAddress: 'Beispielweg 5, Musterstadt',
      customerName: 'Anna Schmidt',
      customerPhone: '+49 171 2345678',
      customerEmail: 'anna@example.com',
      date: '2024-01-25',
      time: '16:00',
      duration: 90,
      status: 'Scheduled',
      createdAt: '2024-01-21'
    },
    {
      id: '3',
      propertyId: 'prop-1',
      propertyTitle: 'Moderne 3-Zimmer-Wohnung',
      propertyAddress: 'Musterstraße 1, Musterstadt',
      customerName: 'Peter Weber',
      customerPhone: '+49 171 3456789',
      customerEmail: 'peter@example.com',
      date: '2024-01-26',
      time: '10:00',
      duration: 60,
      status: 'Scheduled',
      createdAt: '2024-01-22'
    }
  ], [])

  const todayViewings = useMemo(() => {
    return viewings.filter(v => v.date === selectedDate)
  }, [viewings, selectedDate])

  const upcomingViewings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return viewings
      .filter(v => v.date >= today && v.status !== 'Cancelled' && v.status !== 'Completed')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.time.localeCompare(b.time)
      })
      .slice(0, 5)
  }, [viewings])

  const getStatusColor = (status: Viewing['status']) => {
    const colors: Record<Viewing['status'], string> = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: Viewing['status']) => {
    const labels: Record<Viewing['status'], string> = {
      'Scheduled': 'Geplant',
      'Confirmed': 'Bestätigt',
      'Completed': 'Abgeschlossen',
      'Cancelled': 'Abgesagt'
    }
    return labels[status] || status
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Besichtigungen</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Immobilien-Besichtigungen</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-5 w-5" />
          Neue Besichtigung
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{todayViewings.length}</div>
          <div className="text-sm text-gray-600">Heute</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">
            {viewings.filter(v => v.status === 'Scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Geplant</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {viewings.filter(v => v.status === 'Confirmed').length}
          </div>
          <div className="text-sm text-gray-600">Bestätigt</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-600">
            {viewings.filter(v => v.status === 'Completed').length}
          </div>
          <div className="text-sm text-gray-600">Abgeschlossen</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Besichtigungen am {new Date(selectedDate).toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {todayViewings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Keine Besichtigungen an diesem Tag</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayViewings.map((viewing) => (
                <div
                  key={viewing.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedViewing(viewing)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{viewing.time}</span>
                        <span className="text-sm text-gray-500">({viewing.duration} Min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        <span>{viewing.propertyTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{viewing.propertyAddress}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-lg ${getStatusColor(viewing.status)}`}>
                      {getStatusLabel(viewing.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <UserIcon className="h-4 w-4" />
                    <span>{viewing.customerName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Anstehende Besichtigungen</h3>
          {upcomingViewings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Keine anstehenden Besichtigungen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingViewings.map((viewing) => (
                <div
                  key={viewing.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setSelectedViewing(viewing)}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{viewing.propertyTitle}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{new Date(viewing.date).toLocaleDateString('de-DE')}</span>
                    <ClockIcon className="h-3 w-3 ml-2" />
                    <span>{viewing.time}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{viewing.customerName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Viewing Detail Modal */}
      {selectedViewing && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedViewing(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Besichtigungs-Details</h3>
              <button
                onClick={() => setSelectedViewing(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Immobilie</label>
                <div className="text-gray-900 font-medium">{selectedViewing.propertyTitle}</div>
                <div className="text-sm text-gray-600 mt-1">{selectedViewing.propertyAddress}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Datum</label>
                  <div className="text-gray-900">
                    {new Date(selectedViewing.date).toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Uhrzeit</label>
                  <div className="text-gray-900">{selectedViewing.time} ({selectedViewing.duration} Min)</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Kunde</label>
                <div className="text-gray-900 font-medium">{selectedViewing.customerName}</div>
                <div className="text-sm text-gray-600 mt-1">{selectedViewing.customerEmail}</div>
                <div className="text-sm text-gray-600">{selectedViewing.customerPhone}</div>
              </div>
              {selectedViewing.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notizen</label>
                  <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedViewing.notes}
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Bestätigen
                </button>
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Erinnerung senden
                </button>
                <button className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Absagen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NLP Scheduler */}
      {showNLP && (
        <NLPScheduler
          onClose={() => setShowNLP(false)}
          onSuccess={async () => {
            await refresh()
            setShowNLP(false)
          }}
        />
      )}
    </div>
  )
}
