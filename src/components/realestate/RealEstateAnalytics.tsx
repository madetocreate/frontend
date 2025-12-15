'use client'

import { useState, useMemo } from 'react'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export function RealEstateAnalytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  // TODO: Load from backend
  const analytics = useMemo(() => ({
    views: {
      total: 1248,
      change: 12.5,
      trend: 'up' as const
    },
    inquiries: {
      total: 89,
      change: -5.2,
      trend: 'down' as const
    },
    viewings: {
      total: 23,
      change: 8.3,
      trend: 'up' as const
    },
    conversions: {
      total: 5,
      change: 25.0,
      trend: 'up' as const
    },
    topProperties: [
      { id: '1', title: 'Moderne 3-Zimmer-Wohnung', views: 342, inquiries: 12 },
      { id: '2', title: 'Einfamilienhaus mit Garten', views: 289, inquiries: 8 },
      { id: '3', title: 'Gewerbeimmobilie im Zentrum', views: 156, inquiries: 5 },
    ],
    leadSources: [
      { source: 'Immobilienscout24', count: 45, percentage: 35 },
      { source: 'Eigene Website', count: 32, percentage: 25 },
      { source: 'Idealista', count: 28, percentage: 22 },
      { source: 'Social Media', count: 18, percentage: 14 },
      { source: 'Sonstige', count: 5, percentage: 4 },
    ],
    timeline: [
      { date: '2024-01-01', views: 120, inquiries: 8, viewings: 2 },
      { date: '2024-01-08', views: 145, inquiries: 10, viewings: 3 },
      { date: '2024-01-15', views: 180, inquiries: 12, viewings: 4 },
      { date: '2024-01-22', views: 165, inquiries: 9, viewings: 3 },
    ]
  }), [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Performance und Statistiken</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p === 'week' ? 'Woche' : p === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            {analytics.views.trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.views.total}</div>
          <div className="text-sm text-gray-600">Aufrufe</div>
          <div className={`text-xs mt-1 ${analytics.views.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.views.trend === 'up' ? '+' : ''}{analytics.views.change}%
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-green-600" />
            </div>
            {analytics.inquiries.trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.inquiries.total}</div>
          <div className="text-sm text-gray-600">Anfragen</div>
          <div className={`text-xs mt-1 ${analytics.inquiries.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.inquiries.trend === 'up' ? '+' : ''}{analytics.inquiries.change}%
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-orange-600" />
            </div>
            {analytics.viewings.trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.viewings.total}</div>
          <div className="text-sm text-gray-600">Besichtigungen</div>
          <div className={`text-xs mt-1 ${analytics.viewings.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.viewings.trend === 'up' ? '+' : ''}{analytics.viewings.change}%
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            {analytics.conversions.trend === 'up' ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">{analytics.conversions.total}</div>
          <div className="text-sm text-gray-600">Abschlüsse</div>
          <div className={`text-xs mt-1 ${analytics.conversions.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.conversions.trend === 'up' ? '+' : ''}{analytics.conversions.change}%
          </div>
        </div>
      </div>

      {/* Top Properties */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Immobilien</h3>
        <div className="space-y-3">
          {analytics.topProperties.map((property, idx) => (
            <div
              key={property.id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{property.title}</div>
                  <div className="text-sm text-gray-600">
                    {property.views} Aufrufe • {property.inquiries} Anfragen
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{property.inquiries}</div>
                <div className="text-xs text-gray-500">Anfragen</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead-Quellen</h3>
          <div className="space-y-3">
            {analytics.leadSources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.count} ({source.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">Chart wird hier angezeigt</p>
              <p className="text-sm mt-1 text-gray-400">Integration mit Chart-Bibliothek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
