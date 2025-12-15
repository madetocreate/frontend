'use client'

import { useState } from 'react'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ClockIcon,
  HeartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export function PracticeStatistics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  // TODO: Load from backend
  const statistics = {
    overview: {
      totalPatients: 1248,
      patientsChange: 8.5,
      totalAppointments: 342,
      appointmentsChange: 12.3,
      totalRevenue: 45680,
      revenueChange: 15.2,
      avgWaitTime: 8,
      waitTimeChange: -10.5
    },
    patientStats: {
      newPatients: 45,
      returningPatients: 297,
      noShows: 12,
      noShowRate: 3.5
    },
    appointmentStats: {
      confirmed: 320,
      pending: 18,
      cancelled: 4,
      completed: 298
    },
    revenueBreakdown: [
      { category: 'Konsultationen', amount: 28450, percentage: 62, change: 12.5 },
      { category: 'Behandlungen', amount: 12430, percentage: 27, change: 18.2 },
      { category: 'Impfungen', amount: 4800, percentage: 11, change: 8.3 },
    ],
    trends: [
      { date: '2024-01-01', patients: 120, appointments: 32, revenue: 12450 },
      { date: '2024-01-08', patients: 135, appointments: 38, revenue: 14230 },
      { date: '2024-01-15', patients: 148, appointments: 42, revenue: 15680 },
      { date: '2024-01-22', patients: 142, appointments: 40, revenue: 15240 },
    ],
    topReasons: [
      { reason: 'Kontrolle', count: 124, percentage: 36 },
      { reason: 'Nachsorge', count: 89, percentage: 26 },
      { reason: 'Neupatient', count: 67, percentage: 20 },
      { reason: 'Impfung', count: 45, percentage: 13 },
      { reason: 'Sonstiges', count: 17, percentage: 5 },
    ]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiken & Analytics</h2>
          <p className="text-gray-600 mt-1">Detaillierte Einblicke in Ihre Praxis</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                period === p
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/60 backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:bg-gray-50/80'
              }`}
            >
              {p === 'week' ? 'Woche' : p === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            {statistics.overview.patientsChange > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('de-DE').format(statistics.overview.totalPatients)}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Gesamt Patienten</div>
          <div className={`text-xs font-semibold ${statistics.overview.patientsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {statistics.overview.patientsChange > 0 ? '+' : ''}{statistics.overview.patientsChange}% vs. Vorperiode
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            {statistics.overview.appointmentsChange > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('de-DE').format(statistics.overview.totalAppointments)}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Termine</div>
          <div className={`text-xs font-semibold ${statistics.overview.appointmentsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {statistics.overview.appointmentsChange > 0 ? '+' : ''}{statistics.overview.appointmentsChange}% vs. Vorperiode
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-white" />
            </div>
            {statistics.overview.revenueChange > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(statistics.overview.totalRevenue)}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Umsatz</div>
          <div className={`text-xs font-semibold ${statistics.overview.revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {statistics.overview.revenueChange > 0 ? '+' : ''}{statistics.overview.revenueChange}% vs. Vorperiode
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            {statistics.overview.waitTimeChange < 0 ? (
              <ArrowTrendingDownIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.overview.avgWaitTime} Min</div>
          <div className="text-sm font-medium text-gray-600 mb-2">Ø Wartezeit</div>
          <div className={`text-xs font-semibold ${statistics.overview.waitTimeChange < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {statistics.overview.waitTimeChange > 0 ? '+' : ''}{statistics.overview.waitTimeChange}% vs. Vorperiode
          </div>
        </div>
      </div>

      {/* Patient & Appointment Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Statistics */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Patienten-Statistiken</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/80 to-white/80 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Neue Patienten</div>
                  <div className="text-sm text-gray-600">Dieser {period === 'week' ? 'Woche' : period === 'month' ? 'Monat' : 'Jahr'}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{statistics.patientStats.newPatients}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/80 to-white/80 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-xl">
                  <HeartIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Wiederkehrende Patienten</div>
                  <div className="text-sm text-gray-600">Loyale Patienten</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{statistics.patientStats.returningPatients}</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/80 to-white/80 rounded-2xl border border-amber-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <CalendarIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">No-Shows</div>
                  <div className="text-sm text-gray-600">{statistics.patientStats.noShowRate}% Rate</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">{statistics.patientStats.noShows}</div>
            </div>
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Termin-Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Bestätigt', count: statistics.appointmentStats.confirmed, color: 'emerald', icon: CheckCircleIcon },
              { label: 'Ausstehend', count: statistics.appointmentStats.pending, color: 'amber', icon: ClockIcon },
              { label: 'Abgesagt', count: statistics.appointmentStats.cancelled, color: 'red', icon: XCircleIcon },
              { label: 'Abgeschlossen', count: statistics.appointmentStats.completed, color: 'blue', icon: DocumentTextIcon },
            ].map((stat) => {
              const Icon = stat.icon
              const total = Object.values(statistics.appointmentStats).reduce((a, b) => a + b, 0)
              const percentage = (stat.count / total) * 100
              
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 bg-${stat.color}-100 rounded-xl`}>
                        <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                      </div>
                      <span className="font-medium text-gray-900">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                      <span className="text-sm text-gray-600">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Umsatz-Aufschlüsselung</h3>
        <div className="space-y-4">
          {statistics.revenueBreakdown.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    item.change > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Reasons */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Häufigste Termingründe</h3>
        <div className="space-y-3">
          {statistics.topReasons.map((reason, idx) => (
            <div key={reason.reason} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{reason.reason}</div>
                <div className="text-sm text-gray-600">{reason.count} Termine</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{reason.percentage}%</div>
                <div className="text-xs text-gray-500">Anteil</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
