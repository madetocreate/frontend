'use client'

import { useState } from 'react'
import { CubeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function GastronomieInventory() {
  const [inventory] = useState([
    { id: '1', name: 'Reis', unit: 'kg', stock: 25, minStock: 10, status: 'ok' },
    { id: '2', name: 'Olivenöl', unit: 'L', stock: 5, minStock: 10, status: 'low' },
    { id: '3', name: 'Tomaten', unit: 'kg', stock: 15, minStock: 8, status: 'ok' },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventar & Lager</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Lagerbestände</p>
        </div>
      </div>

      <div className="space-y-4">
        {inventory.map((item) => (
          <div key={item.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <CubeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.stock} {item.unit} • Minimum: {item.minStock} {item.unit}
                  </div>
                </div>
              </div>
              {item.status === 'low' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="font-semibold">Niedrig</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
