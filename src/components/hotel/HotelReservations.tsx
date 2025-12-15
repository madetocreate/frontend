'use client'

import { useState, useMemo, useCallback } from 'react'
import { PlusIcon, MagnifyingGlassIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Reservation {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  room: string
  guests: number
  source: 'direct' | 'booking.com' | 'airbnb' | 'expedia' | 'hrs'
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
  total: number
  phone?: string
  email?: string
}

export function HotelReservations() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'checked-in'>('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const reservations = useMemo<Reservation[]>(() => [
    {
      id: '1',
      guestName: 'Max Mustermann',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
      room: '101',
      guests: 2,
      source: 'booking.com',
      status: 'confirmed',
      total: 450,
      phone: '+49 171 1234567',
      email: 'max@example.com'
    },
    {
      id: '2',
      guestName: 'Anna Schmidt',
      checkIn: '2024-01-20',
      checkOut: '2024-01-22',
      room: '205',
      guests: 1,
      source: 'direct',
      status: 'checked-in',
      total: 180,
      phone: '+49 171 2345678',
      email: 'anna@example.com'
    },
    {
      id: '3',
      guestName: 'Peter Weber',
      checkIn: '2024-01-21',
      checkOut: '2024-01-28',
      room: '301',
      guests: 4,
      source: 'airbnb',
      status: 'confirmed',
      total: 980,
      phone: '+49 171 3456789',
      email: 'peter@example.com'
    }
  ], [])

  const getSourceBadge = useCallback((source: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'direct': { label: 'Direkt', color: 'bg-blue-100 text-blue-800' },
      'booking.com': { label: 'Booking.com', color: 'bg-green-100 text-green-800' },
      'airbnb': { label: 'Airbnb', color: 'bg-pink-100 text-pink-800' },
      'expedia': { label: 'Expedia', color: 'bg-purple-100 text-purple-800' },
      'hrs': { label: 'HRS', color: 'bg-orange-100 text-orange-800' }
    }
    return badges[source] || { label: source, color: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)]' }
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    const badges: Record<string, { label: string; color: string; icon: typeof CheckCircleIcon }> = {
      'confirmed': { label: 'Bestätigt', color: 'bg-yellow-100 text-yellow-800', icon: CheckCircleIcon },
      'checked-in': { label: 'Eingecheckt', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      'checked-out': { label: 'Ausgecheckt', color: 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)]', icon: XCircleIcon },
      'cancelled': { label: 'Storniert', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    }
    return badges[status] || badges['confirmed']
  }, [])

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesSearch = r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           r.room.includes(searchQuery) ||
                           r.email?.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        return matchesSearch && (r.checkIn === today || r.checkOut === today)
      }
      if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0]
        return matchesSearch && r.checkIn >= today && r.status === 'confirmed'
      }
      if (filter === 'checked-in') {
        return matchesSearch && r.status === 'checked-in'
      }
      return matchesSearch
    })
  }, [reservations, searchQuery, filter])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      total: reservations.length,
      checkedIn: reservations.filter(r => r.status === 'checked-in').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      arrivalsToday: reservations.filter(r => r.checkIn === today).length
    }
  }, [reservations])

  const handleCheckIn = useCallback(async (reservation: Reservation) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Backend call
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      console.log('Check-in:', reservation.id)
      // Optimistic update would go here
    } catch (err) {
      setError('Check-in fehlgeschlagen. Bitte versuchen Sie es erneut.')
      console.error('Check-in error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCheckOut = useCallback(async (reservation: Reservation) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Backend call
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      console.log('Check-out:', reservation.id)
      // Optimistic update would go here
    } catch (err) {
      setError('Check-out fehlgeschlagen. Bitte versuchen Sie es erneut.')
      console.error('Check-out error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Loading State
  if (loading && reservations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--ak-color-bg-surface-muted)] rounded-lg" />
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
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Reservierungen</h2>
          <p className="text-[var(--ak-color-text-secondary)] mt-1">Verwalten Sie alle Buchungen</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 apple-glass-enhanced border border-[var(--ak-color-border-subtle)] rounded-lg hover:shadow-[var(--ak-shadow-md)] transition-colors"
          aria-label="Neue Reservierung erstellen"
        >
          <PlusIcon className="h-5 w-5" />
          Neue Reservierung
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="apple-glass-enhanced rounded-xl p-4 hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
          <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{stats.total}</div>
          <div className="text-sm text-[var(--ak-color-text-secondary)]">Gesamt</div>
        </div>
        <div className="apple-glass-enhanced rounded-xl p-4 hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
          <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          <div className="text-sm text-[var(--ak-color-text-secondary)]">Eingecheckt</div>
        </div>
        <div className="apple-glass-enhanced rounded-xl p-4 hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.confirmed}</div>
          <div className="text-sm text-[var(--ak-color-text-secondary)]">Bestätigt</div>
        </div>
        <div className="apple-glass-enhanced rounded-xl p-4 hover:shadow-[var(--ak-shadow-md)] transition-all duration-200">
          <div className="text-2xl font-bold text-blue-600">{stats.arrivalsToday}</div>
          <div className="text-sm text-[var(--ak-color-text-secondary)]">Ankünfte heute</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Reservierung suchen (Name, Zimmer, E-Mail)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--ak-color-border-subtle)] rounded-lg focus:ring-2 focus:ring-[var(--ak-color-accent)] focus:border-[var(--ak-color-accent)]"
            aria-label="Reservierungen durchsuchen"
          />
        </div>
        <div className="flex gap-2" role="group" aria-label="Filter">
          {(['all', 'today', 'upcoming', 'checked-in'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'apple-glass-enhanced border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] hover:shadow-[var(--ak-shadow-md)]'
              }`}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'Alle' : f === 'today' ? 'Heute' : f === 'upcoming' ? 'Anstehend' : 'Eingecheckt'}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="apple-glass-enhanced rounded-2xl p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">Keine Reservierungen gefunden</h3>
          <p className="text-[var(--ak-color-text-secondary)]">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Erstellen Sie Ihre erste Reservierung.'}
          </p>
        </div>
      ) : (
        <div className="apple-glass-enhanced rounded-2xl overflow-hidden">
          <div className="divide-y divide-[var(--ak-color-border-subtle)]">
            {filteredReservations.map((reservation) => {
              const sourceBadge = getSourceBadge(reservation.source)
              const statusBadge = getStatusBadge(reservation.status)
              const StatusIcon = statusBadge.icon
              
              return (
                <div
                  key={reservation.id}
                  className="p-4 hover:bg-[var(--ak-color-bg-hover)] transition-colors cursor-pointer"
                  onClick={() => setSelectedReservation(reservation)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedReservation(reservation)
                    }
                  }}
                  aria-label={`Reservierung ${reservation.guestName} öffnen`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-[var(--ak-color-text-primary)]">{reservation.guestName}</div>
                        <span className={`px-2 py-0.5 text-xs rounded ${sourceBadge.color}`}>
                          {sourceBadge.label}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--ak-color-text-secondary)]">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{reservation.checkIn} → {reservation.checkOut}</span>
                        </div>
                        <div>Zimmer {reservation.room}</div>
                        <div>{reservation.guests} {reservation.guests === 1 ? 'Gast' : 'Gäste'}</div>
                        <div className="font-semibold text-[var(--ak-color-text-primary)]">
                          {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(reservation.total)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCheckIn(reservation)
                          }}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Check-in für ${reservation.guestName}`}
                        >
                          {loading ? '...' : 'Check-in'}
                        </button>
                      )}
                      {reservation.status === 'checked-in' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCheckOut(reservation)
                          }}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Check-out für ${reservation.guestName}`}
                        >
                          {loading ? '...' : 'Check-out'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
          onClick={() => setSelectedReservation(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-detail-title"
        >
          <div 
            className="apple-glass-enhanced rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--ak-color-border-subtle)]">
              <div className="flex items-center justify-between">
                <h3 id="reservation-detail-title" className="text-xl font-bold text-[var(--ak-color-text-primary)]">Reservierungs-Details</h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 hover:bg-[var(--ak-color-bg-hover)] rounded-lg"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Gast</label>
                <div className="text-lg font-semibold text-[var(--ak-color-text-primary)]">{selectedReservation.guestName}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Check-in</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.checkIn}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Check-out</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.checkOut}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Zimmer</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.room}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Gäste</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.guests}</div>
                </div>
              </div>
              {selectedReservation.phone && (
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Telefon</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.phone}</div>
                </div>
              )}
              {selectedReservation.email && (
                <div>
                  <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">E-Mail</label>
                  <div className="text-[var(--ak-color-text-primary)]">{selectedReservation.email}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Gesamtpreis</label>
                <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedReservation.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
