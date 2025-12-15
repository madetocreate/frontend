'use client'

import { useMemo } from 'react'
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export function RealEstateOverview() {
  // TODO: Load from backend
  const stats = useMemo(() => ({
    totalProperties: 24,
    activeProperties: 18,
    activeLeads: 12,
    upcomingViewings: 5,
    publishedExposes: 18,
    totalViews: 3420,
    conversionRate: 15.5,
    recentProperties: [
      { id: '1', title: 'Moderne 3-Zimmer-Wohnung', address: 'Musterstraße 1', city: 'Musterstadt', status: 'Aktiv', views: 342 },
      { id: '2', title: 'Einfamilienhaus mit Garten', address: 'Beispielweg 5', city: 'Musterstadt', status: 'Vermietet', views: 289 },
      { id: '3', title: 'Gewerbeimmobilie im Zentrum', address: 'Testallee 10', city: 'Musterstadt', status: 'Aktiv', views: 156 },
    ]
  }), [])

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProperties}</div>
          <div className="text-sm text-gray-600">Immobilien gesamt</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeLeads}</div>
          <div className="text-sm text-gray-600">Aktive Leads</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.upcomingViewings}</div>
          <div className="text-sm text-gray-600">Besichtigungen heute</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.publishedExposes}</div>
          <div className="text-sm text-gray-600">Veröffentlichte Exposés</div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Neueste Immobilien</h2>
        {stats.recentProperties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Keine Immobilien vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
                <div>
                  <div className="font-medium text-gray-900">{property.address}</div>
                  <div className="text-sm text-gray-600">{property.city}</div>
                </div>
                <div className={`text-sm font-medium px-3 py-1 rounded-lg ${
                  property.status === 'Aktiv' 
                    ? 'text-blue-600 bg-blue-50' 
                    : property.status === 'Vermietet'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600 bg-gray-50'
                }`}>
                  {property.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
