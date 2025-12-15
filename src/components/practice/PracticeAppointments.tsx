'use client'

import { useState, useMemo } from 'react'
import { 
  CalendarIcon, 
  PlusIcon,
  ClockIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { NLPScheduler } from '../calendar/NLPScheduler'
import { useCalendar } from '../../hooks/useCalendar'

interface Appointment {
  id: string
  patient: string
  patientId: string
  date: string
  time: string
  duration: number
  reason: string
  type: 'Routine' | 'Neu' | 'Nachsorge' | 'Impfung' | 'Notfall'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  notes?: string
  contact?: {
    phone: string
    email?: string
  }
}

export function PracticeAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [showNLP, setShowNLP] = useState(false)
  const { refresh } = useCalendar({ autoLoad: false })

  // TODO: Load from backend
  const appointments = useMemo<Appointment[]>(() => [
    { 
      id: '1', 
      patient: 'Max Mustermann', 
      patientId: '1',
      date: '2024-01-20', 
      time: '09:00', 
      duration: 30,
      reason: 'Kontrolle', 
      type: 'Routine',
      status: 'confirmed',
      contact: { phone: '+49 171 1234567', email: 'max@example.com' }
    },
    { 
      id: '2', 
      patient: 'Anna Schmidt', 
      patientId: '2',
      date: '2024-01-20', 
      time: '10:30', 
      duration: 45,
      reason: 'Neupatient', 
      type: 'Neu',
      status: 'pending',
      contact: { phone: '+49 171 2345678', email: 'anna@example.com' }
    },
    { 
      id: '3', 
      patient: 'Peter Weber', 
      patientId: '3',
      date: '2024-01-20', 
      time: '14:00', 
      duration: 30,
      reason: 'Nachsorge', 
      type: 'Nachsorge',
      status: 'confirmed',
      notes: 'Bitte Laborwerte mitbringen',
      contact: { phone: '+49 171 3456789' }
    },
    { 
      id: '4', 
      patient: 'Maria Fischer', 
      patientId: '4',
      date: '2024-01-20', 
      time: '15:30', 
      duration: 15,
      reason: 'Impfung', 
      type: 'Impfung',
      status: 'confirmed',
      contact: { phone: '+49 171 4567890', email: 'maria@example.com' }
    },
    { 
      id: '5', 
      patient: 'Thomas Müller', 
      patientId: '5',
      date: '2024-01-21', 
      time: '09:00', 
      duration: 30,
      reason: 'Kontrolle', 
      type: 'Routine',
      status: 'pending',
      contact: { phone: '+49 171 5678901' }
    },
  ], [])

  const todayAppointments = useMemo(() => {
    return appointments
      .filter(apt => apt.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, selectedDate])

  const stats = useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    today: todayAppointments.length
  }), [appointments, todayAppointments])

  const getStatusColor = (status: Appointment['status']) => {
    const colors: Record<Appointment['status'], string> = {
      'confirmed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'completed': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: Appointment['status']) => {
    const labels: Record<Appointment['status'], string> = {
      'confirmed': 'Bestätigt',
      'pending': 'Ausstehend',
      'cancelled': 'Abgesagt',
      'completed': 'Abgeschlossen'
    }
    return labels[status] || status
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Termine</h2>
          <p className="text-gray-600 mt-1">Terminverwaltung und Kalender</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl hover:bg-gray-50/80 transition-all duration-200"
          >
            {view === 'list' ? 'Kalender' : 'Liste'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30">
            <PlusIcon className="h-5 w-5" />
            Neuer Termin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-emerald-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Bestätigt</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Ausstehend</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Abgesagt</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          <div className="text-sm text-gray-600">Heute</div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Datum auswählen</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Termine am {new Date(selectedDate).toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">Keine Termine an diesem Tag</p>
              <p className="text-sm text-gray-400 mt-1">Erstellen Sie einen neuen Termin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="group relative p-5 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
                        <div className="text-xs font-medium opacity-90">UHR</div>
                        <div className="text-xl font-bold">{apt.time}</div>
                        <div className="text-xs opacity-75">{apt.duration} Min</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{apt.patient}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="h-4 w-4" />
                            {apt.reason}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            {apt.type}
                          </span>
                        </div>
                        {apt.notes && (
                          <div className="text-xs text-gray-500 italic mt-1">
                            📝 {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Termin-Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircleIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ClockIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Terminzeit</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedAppointment.time} ({selectedAppointment.duration} Min)
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(selectedAppointment.date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Patient</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900">{selectedAppointment.patient}</div>
                  {selectedAppointment.contact && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{selectedAppointment.contact.phone}</span>
                      </div>
                      {selectedAppointment.contact.email && (
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{selectedAppointment.contact.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Grund</label>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-medium text-gray-900">{selectedAppointment.reason}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedAppointment.type}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notizen</label>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/30">
                  Bestätigen
                </button>
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Erinnerung senden
                </button>
                <button className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
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
