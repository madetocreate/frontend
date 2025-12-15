'use client'

import { useState } from 'react'
import { 
  CalendarIcon, 
  HomeIcon, 
  CurrencyEuroIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SunIcon
} from '@heroicons/react/24/outline'

export function HotelOverview() {
  // TODO: Load from backend
  const [stats] = useState({
    arrivalsToday: 12,
    departuresToday: 8,
    currentOccupancy: 45,
    totalRooms: 50,
    todayRevenue: 12500,
    openTasks: 3,
    weather: {
      temp: 24,
      condition: 'Sonnig',
      icon: '☀️'
    }
  })

  const occupancyPercentage = (stats.currentOccupancy / stats.totalRooms) * 100

  return (
    <div className="p-6 space-y-6">
      {/* Weather & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <SunIcon className="h-8 w-8 text-orange-500" />
            <span className="text-2xl">{stats.weather.icon}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.weather.temp}°C</div>
          <div className="text-sm text-gray-600">{stats.weather.condition}</div>
          <div className="text-xs text-gray-500 mt-1">Mallorca</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            {stats.arrivalsToday > 0 && (
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.arrivalsToday}</div>
          <div className="text-sm text-gray-600">Ankünfte heute</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <HomeIcon className="h-6 w-6 text-green-600" />
            </div>
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.currentOccupancy}</div>
          <div className="text-sm text-gray-600">Belegung ({occupancyPercentage.toFixed(0)}%)</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.todayRevenue)}
          </div>
          <div className="text-sm text-gray-600">Revenue heute</div>
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Belegung</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Belegte Zimmer</span>
            <span className="font-semibold">{stats.currentOccupancy} / {stats.totalRooms}</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ankünfte heute</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Zimmer {100 + i}</div>
                  <div className="text-sm text-gray-600">Gast {i} • 14:00</div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Check-in</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Abreisen heute</h2>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Zimmer {200 + i}</div>
                  <div className="text-sm text-gray-600">Gast {i} • 11:00</div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Check-out</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
            <CalendarIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Neue Reservierung</div>
            <div className="text-xs text-gray-500 mt-1">⌘N</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
            <UserGroupIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Check-in</div>
            <div className="text-xs text-gray-500 mt-1">⌘C</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
            <HomeIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Zimmer-Status</div>
            <div className="text-xs text-gray-500 mt-1">⌘R</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
            <CurrencyEuroIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Rechnung</div>
            <div className="text-xs text-gray-500 mt-1">⌘B</div>
          </button>
        </div>
      </div>
    </div>
  )
}

