'use client'

import { useState, useMemo } from 'react'
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

export function HotelRevenue() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')

  // TODO: Load from backend
  const revenueData = useMemo(() => ({
    today: { revenue: 12500, occupancy: 90, adr: 125, revpar: 112.5 },
    week: { revenue: 87500, occupancy: 85, adr: 130, revpar: 110.5 },
    month: { revenue: 375000, occupancy: 78, adr: 135, revpar: 105.3 },
    year: { revenue: 4500000, occupancy: 72, adr: 140, revpar: 100.8 }
  }), [])

  const current = useMemo(() => revenueData[period], [period, revenueData])
  const previous = useMemo(() => 
    period === 'today' ? revenueData.week : 
    period === 'week' ? revenueData.month : 
    revenueData.year
  , [period, revenueData])

  const trend = useMemo(() => {
    const change = ((current.revenue - previous.revenue) / previous.revenue * 100)
    return {
      value: change,
      isPositive: change > 0,
      formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    }
  }, [current, previous])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Management</h2>
          <p className="text-gray-600 mt-1">Optimieren Sie Ihre Preise und Auslastung</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Zeitraum">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={period === p}
            >
              {p === 'today' ? 'Heute' : p === 'week' ? 'Woche' : p === 'month' ? 'Monat' : 'Jahr'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Revenue</div>
            {trend.isPositive ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(current.revenue)}
          </div>
          <div className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.formatted}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Occupancy</div>
            <ChartBarIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{current.occupancy}%</div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${current.occupancy}%` }}
              role="progressbar"
              aria-valuenow={current.occupancy}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">ADR</div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(current.adr)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Average Daily Rate</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">RevPAR</div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(current.revpar)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Revenue per Available Room</div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue-Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Revenue-Chart wird hier angezeigt</p>
            <p className="text-sm mt-1 text-gray-400">Integration mit Chart-Bibliothek (z.B. Recharts)</p>
          </div>
        </div>
      </div>

      {/* Price Recommendations */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preis-Empfehlungen</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">Standard-Zimmer</div>
              <div className="text-sm text-blue-600 font-medium">Empfehlung</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Aktuell: 120€</div>
              <div className="text-lg font-bold text-blue-600">→ 135€</div>
              <div className="text-xs text-gray-500">+12.5% (hohe Nachfrage erwartet)</div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900">Suite</div>
              <div className="text-sm text-green-600 font-medium">Optimal</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Aktuell: 250€</div>
              <div className="text-lg font-bold text-green-600">→ 250€</div>
              <div className="text-xs text-gray-500">Preis optimal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
