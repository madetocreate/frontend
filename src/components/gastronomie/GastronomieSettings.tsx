'use client'

import { Squares2X2Icon } from '@heroicons/react/24/outline'
import { DashboardConfigurator } from './DashboardConfigurator'

export function GastronomieSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
        <p className="text-gray-600 mt-1">Konfigurieren Sie Ihr Restaurant</p>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
            <Squares2X2Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Konfigurator</h3>
            <p className="text-sm text-gray-600">Passen Sie Ihr Dashboard an Ihre Bedürfnisse an</p>
          </div>
        </div>
        <DashboardConfigurator />
      </div>
    </div>
  )
}
