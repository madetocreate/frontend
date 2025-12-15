'use client'

import { useMemo } from 'react'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export function PracticeOverview() {
  // TODO: Load from backend
  const stats = useMemo(() => ({
    patientsToday: 12,
    appointmentsToday: 8,
    pendingDocuments: 3,
    missedCalls: 0,
    revenueToday: 2450,
    revenueChange: 12.5,
    avgWaitTime: 8,
    waitTimeChange: -15.2,
    patientSatisfaction: 4.8,
    satisfactionChange: 5.3,
    upcomingAppointments: [
      { id: '1', patient: 'Max Mustermann', time: '09:00', reason: 'Kontrolle', status: 'confirmed', type: 'Routine' },
      { id: '2', patient: 'Anna Schmidt', time: '10:30', reason: 'Neupatient', status: 'pending', type: 'Neu' },
      { id: '3', patient: 'Peter Weber', time: '14:00', reason: 'Nachsorge', status: 'confirmed', type: 'Nachsorge' },
      { id: '4', patient: 'Maria Fischer', time: '15:30', reason: 'Impfung', status: 'confirmed', type: 'Impfung' },
    ],
    recentPatients: [
      { id: '1', name: 'Max Mustermann', lastVisit: '2024-01-15', nextAppointment: '2024-02-01', status: 'active' },
      { id: '2', name: 'Anna Schmidt', lastVisit: '2024-01-14', nextAppointment: null, status: 'active' },
      { id: '3', name: 'Peter Weber', lastVisit: '2024-01-13', nextAppointment: '2024-01-25', status: 'active' },
    ],
    alerts: [
      { id: '1', type: 'warning', message: '3 Dokumente benötigen Unterschrift', count: 3 },
      { id: '2', type: 'info', message: '2 Termine heute noch nicht bestätigt', count: 2 },
    ]
  }), [])

  return (
    <div className="p-6 space-y-6">
      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                alert.type === 'warning'
                  ? 'bg-amber-50/80 border-amber-200/50 text-amber-900'
                  : 'bg-blue-50/80 border-blue-200/50 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === 'warning' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="font-medium">{alert.message}</span>
                {alert.count > 0 && (
                  <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${
                    alert.type === 'warning'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    {alert.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patients Today */}
        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.patientsToday}</div>
            <div className="text-sm font-medium text-gray-600">Patienten heute</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowTrendingUpIcon className="h-3 w-3" />
              <span>+2 vs. gestern</span>
            </div>
          </div>
        </div>

        {/* Appointments Today */}
        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                <CalendarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.appointmentsToday}</div>
            <div className="text-sm font-medium text-gray-600">Termine heute</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
              <ClockIcon className="h-3 w-3" />
              <span>Alle bestätigt</span>
            </div>
          </div>
        </div>

        {/* Pending Documents */}
        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              {stats.pendingDocuments > 0 && (
                <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                  {stats.pendingDocuments}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{stats.pendingDocuments}</div>
            <div className="text-sm font-medium text-gray-600">Offene Dokumente</div>
            {stats.pendingDocuments > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
                <ExclamationTriangleIcon className="h-3 w-3" />
                <span>Benötigen Aufmerksamkeit</span>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Today */}
        <div className="group relative apple-glass-enhanced rounded-3xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              {stats.revenueChange > 0 ? (
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.revenueToday)}
            </div>
            <div className="text-sm font-medium text-gray-600">Umsatz heute</div>
            <div className={`mt-3 flex items-center gap-1 text-xs ${stats.revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.revenueChange > 0 ? (
                <ArrowTrendingUpIcon className="h-3 w-3" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3" />
              )}
              <span>{Math.abs(stats.revenueChange)}% vs. gestern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Wait Time */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{stats.avgWaitTime} Min</div>
              <div className="text-xs text-gray-600">Durchschnittliche Wartezeit</div>
            </div>
            <div className={`text-xs font-semibold ${stats.waitTimeChange < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.waitTimeChange > 0 ? '+' : ''}{stats.waitTimeChange}%
            </div>
          </div>
        </div>

        {/* Patient Satisfaction */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-pink-100 rounded-xl">
              <HeartIcon className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{stats.patientSatisfaction}/5.0</div>
              <div className="text-xs text-gray-600">Patientenzufriedenheit</div>
            </div>
            <div className="text-xs font-semibold text-emerald-600">
              +{stats.satisfactionChange}%
            </div>
          </div>
        </div>

        {/* Missed Calls */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <PhoneIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{stats.missedCalls}</div>
              <div className="text-xs text-gray-600">Verpasste Anrufe</div>
            </div>
            {stats.missedCalls === 0 && (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Heutige Termine</h2>
          <span className="text-sm text-gray-600">{stats.upcomingAppointments.length} Termine</span>
        </div>
        {stats.upcomingAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Keine Termine heute</p>
            <p className="text-sm text-gray-400 mt-1">Genießen Sie einen ruhigen Tag</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="group relative p-5 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg">
                      <div className="text-xs font-medium opacity-90">UHR</div>
                      <div className="text-lg font-bold">{apt.time}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{apt.patient}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {apt.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          {apt.reason}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          {apt.type}
                        </span>
                      </div>
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

      {/* Recent Patients */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Letzte Patienten</h2>
          <span className="text-sm text-gray-600">{stats.recentPatients.length} Patienten</span>
        </div>
        {stats.recentPatients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Keine Patienten vorhanden</p>
            <p className="text-sm text-gray-400 mt-1">Fügen Sie Ihren ersten Patienten hinzu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="group p-5 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{patient.name}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>Letzter Besuch: {new Date(patient.lastVisit).toLocaleDateString('de-DE')}</span>
                        {patient.nextAppointment && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            Nächster: {new Date(patient.nextAppointment).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
