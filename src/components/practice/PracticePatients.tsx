'use client'

import { useState, useMemo } from 'react'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  XCircleIcon, 
  UserGroupIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  birthDate: string
  age: number
  phone: string
  email?: string
  insurance: string
  lastVisit?: string
  nextAppointment?: string
  status: 'active' | 'inactive' | 'new'
  notes?: string
}

export function PracticePatients() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'new' | 'inactive'>('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // TODO: Load from backend
  const patients = useMemo<Patient[]>(() => [
    {
      id: '1',
      name: 'Max Mustermann',
      birthDate: '1980-05-15',
      age: 43,
      phone: '+49 171 1234567',
      email: 'max@example.com',
      insurance: 'AOK',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-01',
      status: 'active',
      notes: 'Regelmäßige Kontrollen, sehr zuverlässig'
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      birthDate: '1990-08-22',
      age: 33,
      phone: '+49 171 2345678',
      email: 'anna@example.com',
      insurance: 'TK',
      lastVisit: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'Peter Weber',
      birthDate: '1975-03-10',
      age: 48,
      phone: '+49 171 3456789',
      insurance: 'Barmer',
      lastVisit: '2023-12-20',
      nextAppointment: '2024-01-25',
      status: 'active',
      notes: 'Benötigt regelmäßige Nachsorge'
    },
    {
      id: '4',
      name: 'Maria Fischer',
      birthDate: '1995-11-05',
      age: 28,
      phone: '+49 171 4567890',
      email: 'maria@example.com',
      insurance: 'DAK',
      lastVisit: '2024-01-10',
      status: 'new'
    }
  ], [])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.phone.includes(searchQuery) ||
                           p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.insurance.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (filter === 'active') return matchesSearch && p.status === 'active'
      if (filter === 'new') return matchesSearch && p.status === 'new'
      if (filter === 'inactive') return matchesSearch && p.status === 'inactive'
      return matchesSearch
    })
  }, [patients, searchQuery, filter])

  const stats = useMemo(() => ({
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    new: patients.filter(p => p.status === 'new').length,
    withAppointment: patients.filter(p => p.nextAppointment).length
  }), [patients])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patienten</h2>
          <p className="text-gray-600 mt-1">{patients.length} Patienten gesamt</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
          aria-label="Neuen Patient erstellen"
        >
          <PlusIcon className="h-5 w-5" />
          Neuer Patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Gesamt</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Aktiv</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          <div className="text-sm text-gray-600">Neu</div>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 shadow-sm p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.withAppointment}</div>
          <div className="text-sm text-gray-600">Mit Termin</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Patienten suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-xl"
            aria-label="Patienten durchsuchen"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'new', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/60 backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:bg-gray-50/80'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'active' ? 'Aktiv' : f === 'new' ? 'Neu' : 'Inaktiv'}
            </button>
          ))}
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-12 text-center">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Patienten gefunden</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Versuchen Sie eine andere Suche.' : 'Fügen Sie Ihren ersten Patienten hinzu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="group relative p-5 bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPatient(patient)
                }
              }}
              aria-label={`Patient ${patient.name} öffnen`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        patient.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        patient.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {patient.status === 'active' ? 'Aktiv' : patient.status === 'new' ? 'Neu' : 'Inaktiv'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1.5">
                        <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5">
                          <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      <div className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        {patient.insurance}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {patient.lastVisit && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Letzter Besuch: {new Date(patient.lastVisit).toLocaleDateString('de-DE')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{patient.age} Jahre</span>
                      </div>
                    </div>
                  </div>
                </div>
                {patient.nextAppointment && (
                  <div className="ml-4 text-right">
                    <div className="px-3 py-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
                      <div className="text-xs text-blue-600 font-medium mb-0.5">Nächster Termin</div>
                      <div className="text-sm font-bold text-blue-700">
                        {new Date(patient.nextAppointment).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                )}
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" 
          onClick={() => setSelectedPatient(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="patient-detail-title"
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-blue-50/50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 id="patient-detail-title" className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        selectedPatient.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        selectedPatient.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedPatient.status === 'active' ? 'Aktiv' : selectedPatient.status === 'new' ? 'Neu' : 'Inaktiv'}
                      </span>
                      <span className="text-sm text-gray-600">{selectedPatient.age} Jahre</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Modal schließen"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50/80 to-white rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Telefon</label>
                  </div>
                  <div className="text-gray-900 font-medium">{selectedPatient.phone}</div>
                </div>
                {selectedPatient.email && (
                  <div className="p-4 bg-gradient-to-br from-purple-50/80 to-white rounded-2xl border border-purple-100/50">
                    <div className="flex items-center gap-3 mb-2">
                      <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                      <label className="text-sm font-medium text-gray-700">E-Mail</label>
                    </div>
                    <div className="text-gray-900 font-medium">{selectedPatient.email}</div>
                  </div>
                )}
                <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl border border-emerald-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                    <label className="text-sm font-medium text-gray-700">Krankenkasse</label>
                  </div>
                  <div className="text-gray-900 font-medium">{selectedPatient.insurance}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50/80 to-white rounded-2xl border border-amber-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                    <label className="text-sm font-medium text-gray-700">Geburtsdatum</label>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {new Date(selectedPatient.birthDate).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>

              {/* Visit History */}
              <div className="space-y-4">
                {selectedPatient.lastVisit && (
                  <div className="p-4 bg-gradient-to-r from-gray-50/80 to-white rounded-2xl border border-gray-200/50">
                    <div className="flex items-center gap-3 mb-2">
                      <ClockIcon className="h-5 w-5 text-gray-600" />
                      <label className="text-sm font-medium text-gray-700">Letzter Besuch</label>
                    </div>
                    <div className="text-gray-900 font-medium">
                      {new Date(selectedPatient.lastVisit).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
                {selectedPatient.nextAppointment && (
                  <div className="p-4 bg-gradient-to-br from-blue-50/80 to-blue-100/50 rounded-2xl border border-blue-200/50">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Nächster Termin</label>
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {new Date(selectedPatient.nextAppointment).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedPatient.notes && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-amber-600" />
                    <label className="text-sm font-medium text-gray-700">Notizen</label>
                  </div>
                  <p className="text-gray-900">{selectedPatient.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/30">
                  Termin erstellen
                </button>
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Bearbeiten
                </button>
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Dokumente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
