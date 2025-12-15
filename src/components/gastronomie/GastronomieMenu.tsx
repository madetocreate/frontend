'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export function GastronomieMenu() {
  const [menuItems] = useState([
    { id: '1', name: 'Paella Valenciana', category: 'Hauptgerichte', price: 25.00, available: true },
    { id: '2', name: 'Gambas al Ajillo', category: 'Vorspeisen', price: 18.50, available: true },
    { id: '3', name: 'Sangria (1L)', category: 'Getränke', price: 30.00, available: true },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Speisekarte</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Menü-Items</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-xl hover:shadow-xl transition-all font-medium flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Neues Item
        </button>
      </div>

      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                    {item.category}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-orange-600">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <PencilIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
