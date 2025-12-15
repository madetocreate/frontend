'use client'

import { useState } from 'react'
import { BeakerIcon, PlusIcon } from '@heroicons/react/24/outline'

export function GastronomieBar() {
  const [barItems] = useState([
    { id: '1', name: 'Sangria (1L)', price: 30.00, stock: 12, category: 'Cocktails' },
    { id: '2', name: 'Cava', price: 25.00, stock: 8, category: 'Sekt' },
    { id: '3', name: 'Cerveza', price: 4.50, stock: 50, category: 'Bier' },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bar & Getränke</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Bar</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:shadow-xl transition-all font-medium flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Neues Getränk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barItems.map((item) => (
          <div key={item.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <BeakerIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <div className="text-sm text-gray-600">{item.category}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price)}
              </div>
              <div className="text-sm text-gray-600">Lager: {item.stock}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
