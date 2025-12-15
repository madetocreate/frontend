'use client'

import { ChartBarIcon, CurrencyEuroIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

export function GastronomieAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Berichte</h2>
        <p className="text-gray-600 mt-1">Detaillierte Einblicke in Ihre Performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <CurrencyEuroIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Umsatz (Woche)</div>
              <div className="text-2xl font-bold text-gray-900">€12,450</div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Bestellungen</div>
              <div className="text-2xl font-bold text-gray-900">87</div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Ø Bestellwert</div>
              <div className="text-2xl font-bold text-gray-900">€143</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
